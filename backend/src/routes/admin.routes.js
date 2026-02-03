import express from "express";
import {protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAdminStats,
  listDrivers,
  listRides,
  getRideById,
  toggleDriverBlock,
  getAdminProfile,
} from "../controllers/admin.controller.js";
import { listSOS, resolveSOS } from "../controllers/admin.sos.controller.js";
import { 
  payWeeklyNow,
  weeklyDriverEarnings,listWeeklyPayouts
} from "../controllers/admin.payout.controller.js";
import { getDriverKYC, updateDriverKYC } from "../controllers/admin.kyc.controller.js";
import { getRevenueAnalytics } from "../controllers/adminAnalytics.controller.js";




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

///payouts
router.get("/payouts", listWeeklyPayouts);
router.get("/payouts/weekly", weeklyDriverEarnings); 
router.post("/payouts/weekly/pay", payWeeklyNow);

//kyc
router.get("/drivers/:driverId/kyc", getDriverKYC);
router.patch("/drivers/:id/kyc", updateDriverKYC);

//profile
router.get("/profile", getAdminProfile);

//analytics
router.get("/analytics/revenue", getRevenueAnalytics);


export default router;
