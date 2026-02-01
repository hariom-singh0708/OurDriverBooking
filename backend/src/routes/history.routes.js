import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  clientRideHistory,
  driverRideHistory,
} from "../controllers/history.controller.js";

const router = express.Router();

router.get("/client", protect, clientRideHistory);
router.get("/driver", protect, driverRideHistory);

export default router;
