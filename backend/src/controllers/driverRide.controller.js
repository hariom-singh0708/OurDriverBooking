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
  const ride = await Ride.findOneAndUpdate(
    {
      _id: req.params.rideId,
      status: "REQUESTED",
    },
    {
      $set: {
        status: "ACCEPTED",
        otp: generateRideOTP(),
        otpVerified: false,
        requestExpiresAt: null,
        driverId: req.user._id,
        assignedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!ride) {
    return res.status(409).json({
      success: false,
      message: "Ride already accepted",
    });
  }

  const populatedRide = await Ride.findById(ride._id)
    .populate("clientId", "name mobile profileImage")
    .populate("driverId", "name mobile profileImage rating vehicleNumber vehicleType");

  const io = getIO();

  io.emit("ride_taken", { rideId: ride._id });

  io.to(ride._id.toString()).emit("ride_status_update", populatedRide);

  // 🔥 RETURN FULL RIDE
  return res.json({
    success: true,
    message: "Ride accepted",
    data: populatedRide,
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

