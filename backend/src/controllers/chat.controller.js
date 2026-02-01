import Chat from "../models/Chat.model.js";
import { getIO } from "../config/socket.js";

/**
 * Send chat message
 */
export const sendMessage = async (req, res) => {
  const { rideId, message } = req.body;

  const chat = await Chat.create({
    rideId,
    senderId: req.user._id,
    message,
  });

  const io = getIO();
  io.to(rideId).emit("chat_message", {
    senderId: req.user._id,
    message,
    createdAt: chat.createdAt,
  });

  res.json({
    success: true,
    data: chat,
  });
};

/**
 * Get chat history
 */
export const getChatHistory = async (req, res) => {
  const chats = await Chat.find({
    rideId: req.params.rideId,
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: chats,
  });
};
