import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

/* ================= ROUTES ================= */

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;
