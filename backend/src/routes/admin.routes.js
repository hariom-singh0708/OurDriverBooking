import express from "express";
import {protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAdminStats,
  listDrivers,
  listRides,
  getRideById,
  toggleDriverBlock,
} from "../controllers/admin.controller.js";

const router = express.Router();

// ✅ all admin endpoints protected
router.use(protect, requireRole("admin"));

// Dashboard cards
router.get("/stats", getAdminStats);

// Lists
router.get("/drivers", listDrivers);
router.get("/rides", listRides);
router.get("/rides/:rideId", getRideById);

// Driver block/unblock (optional but useful)
router.patch("/drivers/:driverId/block", toggleDriverBlock);

export default router;
