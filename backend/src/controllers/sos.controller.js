import mongoose from "mongoose";
import SOS from "../models/SOS.model.js";
import { getIO } from "../config/socket.js";

export const triggerSOS = async (req, res) => {
  try {

    const { rideId } = req.body;
    const io = getIO();

    const sos = await SOS.create({
      rideId,
      triggeredBy: req.user._id,
      role: req.user.role,
    });

    io.to(rideId).emit("sos_triggered", {
      _id: sos._id,
      rideId,
      triggeredBy: req.user._id,
      role: req.user.role,
      time: sos.createdAt,
    });

    return res.json({
      success: true,
      message: "SOS triggered",
      data: sos,
    });
  } catch (e) {
    console.error("SOS ERROR:", e);
    return res.status(500).json({ message: "Failed to trigger SOS" });
  }
};
