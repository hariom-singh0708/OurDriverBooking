import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createRide,
  cancelRideByClient,
  markDriverArrived,
  verifyRideOTP,
  getDriverActiveRide,
  markPaymentReceived,
  completeRide,
} from "../controllers/ride.controller.js";
import Ride from "../models/Ride.model.js";


const router = express.Router();

router.post("/", protect, createRide);
router.put("/:rideId/cancel", protect, cancelRideByClient);

router.put("/:rideId/arrived", protect, markDriverArrived);
router.put("/:rideId/verify-otp", protect, verifyRideOTP);
router.get(
  "/driver/active",
  protect,
  getDriverActiveRide
);

router.post(
  "/:rideId/payment-received",
  protect,
  markPaymentReceived
);

router.post(
  "/:rideId/complete",
  protect,
  completeRide
);

router.get("/:rideId", protect, async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride) return res.status(404).json({ message: "Ride not found" });

  res.json({ success: true, data: ride });
});


export default router;
