import Ride from "../models/Ride.model.js";
import { generateRideOTP } from "../utils/rideOtp.js";
import { getIO } from "../config/socket.js";

/**
 * Get active ride request for driver
 */
export const getDriverRideRequest = async (req, res) => {
  const ride = await Ride.findOne({
    driverId: req.user._id,
    status: "REQUESTED",
    requestExpiresAt: { $gt: new Date() },
  });

  res.json({
    success: true,
    data: ride,
  });
};

/**
 * Accept Ride
 */

export const acceptRide = async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "REQUESTED") {
    return res.status(400).json({ message: "Invalid ride state" });
  }

  ride.status = "ACCEPTED";
  ride.otp = generateRideOTP();
  ride.otpVerified = false;
  ride.requestExpiresAt = null; // 🔥 VERY IMPORTANT

  await ride.save();

  const io = getIO();

  // 🔥 REAL-TIME UPDATE TO CLIENT
  io.to(ride._id.toString()).emit("ride_status_update", {
    status: "ACCEPTED",
    otp: ride.otp,
  });

  res.json({
    success: true,
    message: "Ride accepted",
    data: {
      rideId: ride._id,
      otp: ride.otp,
    },
  });
};



/**
 * Reject Ride
 */
export const rejectRide = async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  // 🔥 track rejection
  await Ride.findByIdAndUpdate(ride._id, {
    $addToSet: { rejectedByDrivers: req.user._id }, // ✅ analytics ke liye
    $unset: {
      driverId: "",
      assignedAt: "",
      requestExpiresAt: "",
    },
  });

  res.json({
    success: true,
    message: "Ride rejected",
  });
};

