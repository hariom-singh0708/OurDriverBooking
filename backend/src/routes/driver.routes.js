import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  toggleOnlineStatus,
  updateDriverLocation,
  getDriverStatus,
  getDriverAnalytics,
} from "../controllers/driver.controller.js";

import {
  getDriverRideRequest,
  acceptRide,
  rejectRide,
} from "../controllers/driverRide.controller.js";

const router = express.Router();

router.post("/toggle-status", protect, toggleOnlineStatus);
router.get("/status", protect, getDriverStatus);

router.get("/ride-request", protect, getDriverRideRequest);
router.put("/ride/:rideId/accept", protect, acceptRide);
router.put("/ride/:rideId/reject", protect, rejectRide);

router.post("/location", protect, updateDriverLocation);

/* ✅ FIXED ANALYTICS ROUTE */
router.get("/analytics", protect, getDriverAnalytics);


export default router;
