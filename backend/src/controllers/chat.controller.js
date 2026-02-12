import Chat from "../models/Chat.model.js";
import { getIO } from "../config/socket.js";

/**
 * Send chat message
 */
export const sendMessage = async (req, res) => {
  const { rideId, message } = req.body;

  let chat = await Chat.create({
    rideId,
    senderId: req.user._id,
    message,
  });
    chat = await chat.populate("senderId", "role name");
    const senderRole = chat.senderId.role;

  const io = getIO();
  io.to(rideId).emit("chat_message", {
    senderId: req.user._id,
          senderRole,

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
  }).sort({ createdAt: 1 })      .populate("senderId", "role name");   // 🔥 ROLE POPULATE
;

  res.json({
    success: true,
    data: chats,
  });
};
