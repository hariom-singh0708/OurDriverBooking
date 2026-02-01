import DriverStatus from "../models/DriverStatus.model.js";

/**
 * Very basic nearest-driver logic
 * (Later we’ll replace with Geo queries)
 */
export const findNearestDriver = async () => {
  return await DriverStatus.findOne({ isOnline: true }).populate("driverId");
};
