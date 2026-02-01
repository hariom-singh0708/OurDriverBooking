import { getIO } from "../config/socket.js";

/**
 * Trigger SOS
 */
export const triggerSOS = async (req, res) => {
  const { rideId } = req.body;
  const io = getIO();

  io.to(rideId).emit("sos_triggered", {
    rideId,
    triggeredBy: req.user._id,
    time: new Date(),
  });

  res.json({
    success: true,
    message: "SOS triggered",
  });
};
