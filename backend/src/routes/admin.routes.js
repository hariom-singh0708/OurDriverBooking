import express from "express";
import {protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAdminStats,
  listDrivers,
  listRides,
  getRideById,
  toggleDriverBlock,
} from "../controllers/admin.controller.js";
import { listSOS, resolveSOS } from "../controllers/admin.sos.controller.js";
import { 
  payWeeklyNow,
  weeklyDriverEarnings,listWeeklyPayouts
} from "../controllers/admin.payout.controller.js";

const router = express.Router();

// ✅ all admin endpoints protected
router.use(protect, requireRole("admin"));

// Dashboard cards
router.get("/stats", getAdminStats);
router.get("/sos", listSOS);
router.patch("/sos/:id/resolve", resolveSOS);
// Lists
router.get("/drivers", listDrivers);
router.get("/rides", listRides);
router.get("/rides/:rideId", getRideById);

// Driver block/unblock (optional but useful)
router.patch("/drivers/:driverId/block", toggleDriverBlock);

router.get("/payouts", listWeeklyPayouts);
router.get("/payouts/weekly", weeklyDriverEarnings); 
router.post("/payouts/weekly/pay", payWeeklyNow);

export default router;
