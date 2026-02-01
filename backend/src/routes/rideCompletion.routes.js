import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { completeRide } from "../controllers/rideCompletion.controller.js";

const router = express.Router();

router.put("/:rideId/complete", protect, completeRide);

export default router;
