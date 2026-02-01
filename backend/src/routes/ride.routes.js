import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createRide,
  cancelRideByClient,
  markDriverArrived,
  verifyRideOTP,
} from "../controllers/ride.controller.js";



const router = express.Router();

router.post("/", protect, createRide);
router.put("/:rideId/cancel", protect, cancelRideByClient);

router.put("/:rideId/arrived", protect, markDriverArrived);
router.put("/:rideId/verify-otp", protect, verifyRideOTP);

export default router;
