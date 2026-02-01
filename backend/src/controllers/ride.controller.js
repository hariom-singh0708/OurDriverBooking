import Ride from "../models/Ride.model.js";
import User from "../models/User.model.js";
import { calculateFare } from "../services/fare.service.js";
import { findNearestDriver } from "../services/driverMatch.service.js";
import { getIO } from "../config/socket.js";

/**
 * Assign Ride to Driver
 */
export const assignDriverToRide = async (ride) => {
  const driverStatus = await findNearestDriver();
  if (!driverStatus) return null;

  ride.driverId = driverStatus.driverId._id;
  ride.assignedAt = new Date();
  ride.requestExpiresAt = new Date(Date.now() + 60 * 1000); // 1 minute
  await ride.save();

  return ride;
};

export const markDriverArrived = async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "ACCEPTED") {
    return res.status(400).json({ message: "Invalid state" });
  }

  ride.status = "DRIVER_ARRIVED";
  await ride.save();

  const io = getIO();

  io.to(ride._id.toString()).emit("ride_status_update", {
    status: "DRIVER_ARRIVED",
  });

  res.json({
    success: true,
    message: "Driver arrived at pickup",
  });
};




export const verifyRideOTP = async (req, res) => {
  const { otp } = req.body;
  const ride = await Ride.findById(req.params.rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "DRIVER_ARRIVED") {
    return res.status(400).json({ message: "Driver not arrived yet" });
  }

if (ride.otp !== String(otp)) {
  return res.status(400).json({ message: "Invalid OTP" });
}

ride.otpVerified = true;
ride.status = "ON_RIDE";
await ride.save();

const io = getIO();

io.to(ride._id.toString()).emit("ride_status_update", {
  status: "ON_RIDE",
});

res.json({
  success: true,
  message: "OTP verified. Ride started",
});

};

/**
 * CREATE RIDE
 */
export const createRide = async (req, res) => {
  const user = await User.findById(req.user._id);

  // Block check
  if (user.blockedUntil && user.blockedUntil > new Date()) {
    return res.status(403).json({
      success: false,
      message: "Account blocked due to excessive cancellations",
    });
  }

  const fareBreakdown = calculateFare(req.body);

  const ride = await Ride.create({
    ...req.body,
    clientId: user._id,
    fareBreakdown,
    status: "REQUESTED",
  });

  // AFTER creating ride
const assignedRide = await assignDriverToRide(ride);

res.json({
  success: true,
  message: assignedRide
    ? "Ride requested & driver notified"
    : "Ride requested, waiting for driver",
  data: assignedRide || ride,
});
};

/**
 * CANCEL RIDE (Client)
 */
export const cancelRideByClient = async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);

  if (!ride)
    return res.status(404).json({ message: "Ride not found" });

  if (ride.clientId.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized" });

  const diffMinutes =
    (new Date() - new Date(ride.createdAt)) / (1000 * 60);

  if (diffMinutes > 5)
    return res
      .status(400)
      .json({ message: "Cancellation window expired" });

  ride.status = "CANCELLED_BY_CLIENT";
  ride.cancelledAt = new Date();
  await ride.save();

  // Update cancellation count
  const user = await User.findById(req.user._id);
  user.cancelCountToday += 1;

  if (user.cancelCountToday >= 3) {
    user.blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  await user.save();

  res.json({
    success: true,
    message: "Ride cancelled successfully",
  });
};
