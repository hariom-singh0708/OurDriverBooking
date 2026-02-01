import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getClientProfile,
  getClientRides,
} from "../controllers/client.controller.js";

const router = express.Router();

router.get("/profile", protect, getClientProfile);
router.get("/rides", protect, getClientRides);

export default router;
