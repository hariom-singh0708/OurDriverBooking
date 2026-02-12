import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Ride from "../models/Ride.model.js";
import Payment from "../models/Payment.model.js";

/* ================= RAZORPAY INSTANCE ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ======================================================
   1️⃣ CREATE PAYMENT ORDER
====================================================== */

export const createPaymentOrder = async (req, res) => {
  try {
    const { rideId } = req.body;

    /* ================= VALIDATIONS ================= */

    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Ride ID is required",
      });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Ride already paid",
      });
    }

    /* ================= AMOUNT SAFETY ================= */

    const rawAmount = ride.fareBreakdown?.totalFare;

    if (
      rawAmount === undefined ||
      rawAmount === null ||
      isNaN(rawAmount) ||
      Number(rawAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride amount",
      });
    }

    // Convert rupees → paise safely (integer only)
    const amountInPaise = Math.round(Number(rawAmount) * 100);

    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    /* ================= CHECK EXISTING PENDING PAYMENT ================= */

    const existingPending = await Payment.findOne({
      rideId: ride._id,
      status: "PENDING",
    });

    if (existingPending) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: existingPending.razorpayOrderId,
          amount: rawAmount,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    /* ================= CREATE RAZORPAY ORDER ================= */

    let order;
    const shortRideId = ride._id.toString().slice(-8);
    const shortTimestamp = Date.now().toString().slice(-6);

    const receiptId = `r_${shortRideId}_${shortTimestamp}`;


    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        payment_capture: 1,
      });
    } catch (rzpError) {
      console.error("RAZORPAY ORDER ERROR:", rzpError);
      return res.status(502).json({
        success: false,
        message: "Payment gateway error",
      });
    }

    /* ================= SAVE PAYMENT RECORD ================= */

    await Payment.create({
      rideId: ride._id,
      amount: rawAmount, // store in rupees
      paymentMode: ride.paymentMode,
      razorpayOrderId: order.id,
      status: "PENDING",
    });

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: rawAmount,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("CREATE ORDER INTERNAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};


/* ======================================================
   2️⃣ VERIFY PAYMENT
====================================================== */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Invalid payment data",
      });
    }

    /* 🔐 Signature Verification */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment signature verification failed",
      });
    }

    /* 🔎 Find Payment Record */
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({
        message: "Payment already verified",
      });
    }

    /* ✅ Update Payment */
    payment.status = "PAID";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    /* ✅ Update Ride */
    const ride = await Ride.findById(payment.rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    ride.paymentStatus = "PAID";
    ride.paymentMethod = "ONLINE";
    ride.paymentReceivedAt = new Date();

    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
