import express from "express";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  createRide,
  cancelRideByClient,
  markDriverArrived,
  verifyRideOTP,
  getDriverActiveRide,
  markPaymentReceived,
  completeRide,
  getRideById, // 🔥 Move inline logic to controller
  previewFare,
} from "../controllers/ride.controller.js";

const router = express.Router();

/* ================= CLIENT ROUTES ================= */

router.post("/", protect, requireRole("client"), createRide);
router.post("/preview-fare", protect, previewFare);

router.put(
  "/:rideId/cancel",
  protect,
  requireRole("client"),
  cancelRideByClient
);

/* ================= DRIVER ROUTES ================= */

router.get(
  "/driver/active",
  protect,
  requireRole("driver"),
  getDriverActiveRide
);

router.put(
  "/:rideId/arrived",
  protect,
  requireRole("driver"),
  markDriverArrived
);

router.put(
  "/:rideId/verify-otp",
  protect,
  requireRole("driver"),
  verifyRideOTP
);

router.post(
  "/:rideId/payment-received",
  protect,
  requireRole("driver"),
  markPaymentReceived
);

router.post(
  "/:rideId/complete",
  protect,
  requireRole("driver"),
  completeRide
);

/* ================= COMMON ================= */

router.get(
  "/:rideId",
  protect,
  getRideById // 🔥 moved to controller
);

export default router;
