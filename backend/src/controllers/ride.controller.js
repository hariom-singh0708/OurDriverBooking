import Ride from "../models/Ride.model.js";
import User from "../models/User.model.js";
import { calculateFare } from "../services/fare.service.js";
import { findNearestDriver } from "../services/driverMatch.service.js";
import { getIO } from "../config/socket.js";

/**
 * Assign Ride to Driver
 */

// PREVIEW FARE (NO RIDE CREATION)
export const previewFare = async (req, res) => {
  try {
    const fareBreakdown = calculateFare(req.body);

    return res.json({
      success: true,
      data: fareBreakdown,
    });
  } catch (error) {
    console.error("PREVIEW FARE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate fare",
    });
  }
};

export const assignDriverToRide = async (ride) => {
  const driverStatus = await findNearestDriver();
  if (!driverStatus) return null;

  // Atomic update: only assign if still REQUESTED
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: ride._id, status: "REQUESTED" },
    {
      driverId: driverStatus.driverId._id,
      assignedAt: new Date(),
      requestExpiresAt: new Date(Date.now() + 60 * 1000),
      status: "ACCEPTED",
    },
    { new: true }
  );

  return updatedRide;
};


export const markDriverArrived = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId).select("+otp");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // 🔐 Ownership check
    if (ride.driverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (ride.status !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "Invalid ride state",
      });
    }

    // 🔥 Atomic update (prevents double call issue)
    const updatedRide = await Ride.findOneAndUpdate(
      { _id: rideId, status: "ACCEPTED" },
      { status: "DRIVER_ARRIVED" },
      { new: true }
    ).select("+otp");

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: "Ride already updated",
      });
    }

    const io = getIO();

    io.to(updatedRide._id.toString()).emit("ride_status_update", {
      rideId: updatedRide._id,
      status: "DRIVER_ARRIVED",
      otp: updatedRide.otp || null,
    });

    return res.json({
      success: true,
      message: "Driver arrived at pickup",
    });

  } catch (error) {
    console.error("MARK ARRIVED ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


export const verifyRideOTP = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP required",
      });
    }

    const ride = await Ride.findById(rideId).select("+otp");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // 🔐 Driver ownership check
    if (ride.driverId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (ride.status !== "DRIVER_ARRIVED") {
      return res.status(400).json({
        success: false,
        message: "Driver not arrived yet",
      });
    }

    if (ride.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP already verified",
      });
    }

    if (ride.otp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 🔥 Atomic update to prevent double verification
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        status: "DRIVER_ARRIVED",
        otpVerified: false,
      },
      {
        otpVerified: true,
        status: "ON_RIDE",
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: "Ride already updated",
      });
    }

    const io = getIO();

    io.to(updatedRide._id.toString()).emit("ride_status_update", {
      rideId: updatedRide._id,
      status: "ON_RIDE",
      pickupLocation: updatedRide.pickupLocation,
      dropLocation: updatedRide.dropLocation,
    });

    return res.json({
      success: true,
      message: "OTP verified. Ride started",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


/**
 * CREATE RIDE  ✅ FIXED
 */
export const createRide = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 Block check
    if (user.blockedUntil && user.blockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account temporarily blocked due to excessive cancellations",
      });
    }

    // 🔥 Prevent multiple active rides
    const activeRide = await Ride.findOne({
      clientId: user._id,
      status: { $in: ["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED", "ON_RIDE"] },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: "You already have an active ride",
      });
    }

    // 🔥 Calculate fare safely
    const fareBreakdown = calculateFare(req.body);

    // Apply penalty safely
    if (user.pendingPenaltyAmount > 0) {
      fareBreakdown.penalty = user.pendingPenaltyAmount;
      fareBreakdown.totalFare += user.pendingPenaltyAmount;
    }

    const requestExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // 🔥 Create ride (DO NOT trust req.body fully)
    const ride = await Ride.create({
      bookingType: req.body.bookingType,
      bookingDuration: req.body.bookingDuration,
      pickupLocation: req.body.pickupLocation,
      dropLocation: req.body.dropLocation,
      rideType: req.body.rideType,
      paymentMode: req.body.paymentMode,
      clientId: user._id,
      fareBreakdown,
      status: "REQUESTED",
      requestExpiresAt,
    });

    // 🔥 Reset penalty safely
    if (user.pendingPenaltyAmount > 0) {
      await User.updateOne(
        { _id: user._id },
        { $set: { pendingPenaltyAmount: 0 } }
      );
    }

    const io = getIO();

    io.to("online_drivers").emit("new_ride", ride);

    // 🔥 Auto cancel (state safe)
    setTimeout(async () => {
      try {
        const latestRide = await Ride.findOneAndUpdate(
          {
            _id: ride._id,
            status: "REQUESTED",
          },
          {
            status: "CANCELLED_AUTO",
            cancelledAt: new Date(),
          },
          { new: true }
        );

        if (!latestRide) return;

        io.to(ride._id.toString()).emit("ride_cancelled", {
          rideId: ride._id,
          by: "SYSTEM",
          reason: "No driver accepted the ride",
        });

        io.emit("ride_taken", { rideId: ride._id });

      } catch (err) {
        console.error("AUTO CANCEL ERROR:", err.message);
      }
    }, 3 * 60 * 1000);

    return res.json({
      success: true,
      message: "Ride requested successfully",
      data: ride,
    });

  } catch (error) {
    console.error("CREATE RIDE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



/**
 * CANCEL RIDE (Client)
 */
export const cancelRideByClient = async (req, res) => {
  try {
    const { rideId } = req.params;

    /* ================= FETCH RIDE ================= */
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    /* ================= OWNERSHIP CHECK ================= */
    if (ride.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    /* ================= STATUS VALIDATION ================= */
    if (
      ride.status === "CANCELLED_BY_CLIENT" ||
      ride.status === "CANCELLED_BY_DRIVER" ||
      ride.status === "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Ride already closed",
      });
    }

    /* ================= TIME WINDOW CHECK (5 MIN) ================= */
    const diffMinutes =
      (Date.now() - new Date(ride.createdAt).getTime()) /
      (1000 * 60);

    if (diffMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: "Cancellation window expired (5 min)",
      });
    }

    /* ================= MARK CANCELLED ================= */
    ride.status = "CANCELLED_BY_CLIENT";
    ride.cancelledAt = new Date();
    await ride.save();

    /* ================= PENALTY CALCULATION (10%) ================= */
    const baseFare = ride.fareBreakdown?.totalFare || 0;
    const penalty = Math.round(baseFare * 0.1);

    /* ================= UPDATE USER ================= */
    const user = await User.findById(req.user._id);

    if (user) {
      user.cancelCountToday = (user.cancelCountToday || 0) + 1;
      user.pendingPenaltyAmount =
        (user.pendingPenaltyAmount || 0) + penalty;

      // 🔒 Auto block after 3 cancels in 24h
      if (user.cancelCountToday >= 3) {
        user.blockedUntil = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );
      }

      await user.save();
    }

    /* ================= SOCKET EMIT ================= */
    const io = getIO();

    // 1️⃣ Notify accepted driver (if joined room)
    io.to(ride._id.toString()).emit("ride_cancelled", {
      rideId: ride._id,
      by: "CLIENT",
      reason: req.body.reason || "Client cancelled",
      penaltyApplied: penalty,
    });

    // 2️⃣ Remove ride from all online drivers dashboard
    io.to("online_drivers").emit("ride_cancelled", {
      rideId: ride._id,
    });

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      data: {
        rideId: ride._id,
        penaltyAdded: penalty,
        totalPendingPenalty: user?.pendingPenaltyAmount || 0,
        blockedUntil: user?.blockedUntil || null,
      },
    });

  } catch (error) {
    console.error("CANCEL RIDE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const getDriverActiveRide = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Only drivers can access active ride",
      });
    }

    const ride = await Ride.findOne({
      driverId: req.user._id,
      status: { $in: ["ACCEPTED", "DRIVER_ARRIVED", "ON_RIDE"] },
    })
      .populate({
        path: "clientId",
        select: "name mobile profileImage",
      })
      .populate({
        path: "driverId",
        select: "name mobile profileImage vehicleType vehicleNumber rating",
      })
      .sort({ createdAt: -1 });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "No active ride found",
      });
    }

    return res.json({
      success: true,
      data: ride,
    });

  } catch (error) {
    console.error("GET ACTIVE RIDE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const markPaymentReceived = async (req, res) => {
  try {
    const { method } = req.body;
    const { rideId } = req.params;

    // 🔐 Role check
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Only driver can mark payment",
      });
    }

    if (!["UPI", "CASH"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // 🔥 Atomic update to prevent double marking
    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        driverId: req.user._id,
        paymentStatus: "UNPAID",
        status: "ON_RIDE", // 🔒 Only active ride can receive payment
      },
      {
        paymentStatus: "PAID",
        paymentMethod: method,
        paymentReceivedAt: new Date(),
      },
      { new: true }
    );

    if (!ride) {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be marked in current state",
      });
    }

    const io = getIO();

    io.to(ride._id.toString()).emit("payment_received", {
      rideId: ride._id,
      method,
      paymentReceivedAt: ride.paymentReceivedAt,
    });

    return res.json({
      success: true,
      message: `Payment received via ${method}`,
    });

  } catch (error) {
    console.error("MARK PAYMENT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    // 🔐 Only driver allowed
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Only driver can complete ride",
      });
    }

    // 🔥 Atomic state transition
    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        driverId: req.user._id,
        status: "ON_RIDE",
        paymentStatus: "PAID", // 🔒 Hard payment check inside query
      },
      {
        status: "COMPLETED",
        completedAt: new Date(),
        finalFareLocked: true,
      },
      { new: true }
    );

    if (!ride) {
      return res.status(400).json({
        success: false,
        message: "Ride cannot be completed in current state",
      });
    }

    const io = getIO();

    io.to(ride._id.toString()).emit("ride_status_update", {
      rideId: ride._id,
      status: "COMPLETED",
      completedAt: ride.completedAt,
    });

    return res.json({
      success: true,
      message: "Ride completed successfully",
    });

  } catch (error) {
    console.error("COMPLETE RIDE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};





export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate({
        path: "driverId",
        select: "name mobile profileImage vehicleType vehicleNumber rating",
      })
      .populate({
        path: "clientId",
        select: "name mobile profileImage",
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // 🔒 Authorization: only driver or client can see ride
    if (
      ride.clientId?._id.toString() !== req.user._id.toString() &&
      ride.driverId?._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      data: ride,
    });

  } catch (error) {
    console.error("GET RIDE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

