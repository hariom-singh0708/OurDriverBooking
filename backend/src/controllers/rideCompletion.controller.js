import Ride from "../models/Ride.model.js";

/**
 * Complete Ride (Driver)
 */
export const completeRide = async (req, res) => {
  const { rideId } = req.params;

  const ride = await Ride.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "ON_RIDE") {
    return res.status(400).json({ message: "Ride not in progress" });
  }

  ride.status = "COMPLETED";
  ride.completedAt = new Date();
  ride.finalFareLocked = true;

  await ride.save();

  res.json({
    success: true,
    message: "Ride completed successfully",
    data: ride,
  });
};
