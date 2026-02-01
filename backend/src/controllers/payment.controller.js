import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.model.js";
import Ride from "../models/Ride.model.js";

/**
 * Create Online Payment Order
 */
export const createPaymentOrder = async (req, res) => {
  const { rideId } = req.body;
  const ride = await Ride.findById(rideId);

  const order = await razorpay.orders.create({
    amount: ride.fareBreakdown.totalFare * 100,
    currency: "INR",
    receipt: `ride_${rideId}`,
  });

  const payment = await Payment.create({
    rideId,
    amount: ride.fareBreakdown.totalFare,
    paymentMode: "pay_now",
    razorpayOrderId: order.id,
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: payment.amount,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
};

/**
 * Verify Online Payment
 */
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "PAID";
  await payment.save();

  await Ride.findByIdAndUpdate(payment.rideId, {
    status: "PAID",
  });

  res.json({
    success: true,
    message: "Payment verified & completed",
  });
};

/**
 * Pay After Ride (Driver confirms)
 */
export const confirmOfflinePayment = async (req, res) => {
  const { rideId } = req.body;

  const ride = await Ride.findById(rideId);

  await Payment.create({
    rideId,
    amount: ride.fareBreakdown.totalFare,
    paymentMode: "pay_after_ride",
    status: "PAID",
  });

  ride.status = "PAID";
  await ride.save();

  res.json({
    success: true,
    message: "Offline payment confirmed",
  });
};
