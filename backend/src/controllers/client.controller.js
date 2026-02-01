import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";

/**
 * GET /client/profile
 */
export const getClientProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    success: true,
    data: user,
  });
};

/**
 * GET /client/rides
 * (Empty for now)
 */
export const getClientRides = async (req, res) => {
  const rides = await Ride.find({ clientId: req.user._id });

  res.json({
    success: true,
    data: rides,
  });
};
