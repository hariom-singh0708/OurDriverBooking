import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getFareEstimate } from "../controllers/fare.controller.js";

const router = express.Router();

router.post("/estimate", protect, getFareEstimate);

export default router;
