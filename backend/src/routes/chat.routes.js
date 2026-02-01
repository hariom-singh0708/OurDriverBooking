import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getChatHistory,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:rideId", protect, getChatHistory);

export default router;
