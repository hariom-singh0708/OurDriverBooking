import Ride from "../models/Ride.model.js";

/**
 * Client Ride History
 */
export const clientRideHistory = async (req, res) => {
  const rides = await Ride.find({ clientId: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: rides,
  });
};

/**
 * Driver Ride History
 */
export const driverRideHistory = async (req, res) => {
  const rides = await Ride.find({ driverId: req.user._id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: rides,
  });
};
