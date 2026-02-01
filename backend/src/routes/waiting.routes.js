import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  startWaiting,
  endWaiting,
} from "../controllers/waiting.controller.js";

const router = express.Router();

router.post("/start", protect, startWaiting);
router.post("/end", protect, endWaiting);

export default router;
