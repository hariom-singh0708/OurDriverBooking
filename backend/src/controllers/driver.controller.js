import DriverStatus from "../models/DriverStatus.model.js";
import KYC from "../models/KYC.model.js";
import { getIO } from "../config/socket.js";

export const updateDriverLocation = async (req, res) => {
  const { rideId, lat, lng } = req.body;
  const io = getIO();

  io.to(rideId).emit("driver_location_update", {
    rideId,
    lat,
    lng,
  });

  res.json({
    success: true,
    message: "Location broadcasted",
  });
};

/**
 * Toggle Driver Online / Offline
 */
export const toggleOnlineStatus = async (req, res) => {
  const kyc = await KYC.findOne({ userId: req.user._id });

  if (!kyc || kyc.status !== "approved") {
    return res.status(403).json({
      success: false,
      message: "Complete KYC to go online",
    });
  }

  const { isOnline, lat, lng } = req.body;

  const status = await DriverStatus.findOneAndUpdate(
    { driverId: req.user._id },
    {
      isOnline,
      location: { lat, lng },
      lastSeen: new Date(),
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: `Driver is now ${isOnline ? "Online" : "Offline"}`,
    data: status,
  });
};
