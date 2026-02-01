import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  confirmOfflinePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.post("/offline-confirm", protect, confirmOfflinePayment);

export default router;
