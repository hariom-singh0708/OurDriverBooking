import WaitingLog from "../models/WaitingLog.model.js";
import Ride from "../models/Ride.model.js";
import { WAITING_RATE_PER_MIN } from "../services/fare.service.js";
import { getIO } from "../config/socket.js";

/**
 * Start Waiting
 */
export const startWaiting = async (req, res) => {
  const { rideId } = req.body;

  const log = await WaitingLog.create({
    rideId,
    startTime: new Date(),
  });

  res.json({
    success: true,
    message: "Waiting started",
    data: log,
  });
};

/**
 * End Waiting & Calculate Extra Charges
 */
export const endWaiting = async (req, res) => {
  const { rideId } = req.body;

  const ride = await Ride.findById(rideId);
  const log = await WaitingLog.findOne({ rideId, endTime: null });

  if (!ride || !log) {
    return res.status(404).json({ message: "Invalid waiting session" });
  }

  log.endTime = new Date();

  const actualMinutes = Math.ceil(
    (log.endTime - log.startTime) / (1000 * 60)
  );

  const allowedMinutes = ride.waitingTime || 0;

  if (actualMinutes > allowedMinutes) {
    log.extraMinutes = actualMinutes - allowedMinutes;
    log.extraCharge = log.extraMinutes * WAITING_RATE_PER_MIN;

    // Update ride fare
    ride.fareBreakdown.waitingCharge += log.extraCharge;
    ride.fareBreakdown.totalFare += log.extraCharge;
    await ride.save();

    // Emit live fare update
    const io = getIO();
    io.to(rideId.toString()).emit("waiting_time_update", {
      extraMinutes: log.extraMinutes,
      extraCharge: log.extraCharge,
      updatedFare: ride.fareBreakdown,
    });
  }

  await log.save();

  res.json({
    success: true,
    message: "Waiting ended",
    data: log,
  });
};
