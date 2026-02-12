import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  toggleOnlineStatus,
  updateDriverLocation,
  getDriverStatus,
  getDriverAnalytics,
  updateDriverProfile,
  updateDriverBankDetails,
  getDriverProfile,
  updateDriverProfilePhoto,
  createDriverSupportTicket,
  deleteDriverAccount
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

router.get("/analytics", protect, getDriverAnalytics);
router.get("/profile", protect, getDriverProfile);
router.put("/profile", protect, updateDriverProfile);
router.put("/bank-details", protect, updateDriverBankDetails);

// ✅ PROFILE PHOTO
router.put(
  "/profile/photo",
  protect,
  upload.single("photo"),
  updateDriverProfilePhoto
);

// ❌ DANGER ZONE - DELETE DRIVER ACCOUNT
router.delete("/account", protect, deleteDriverAccount);


router.post("/support", protect, createDriverSupportTicket);


export default router;
