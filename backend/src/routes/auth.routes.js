import express from "express";
import rateLimit from "express-rate-limit";

import {
  signup,
  verifySignupOTP,
  login,
  getMe,
  sendLoginOTP,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= RATE LIMITERS ================= */

// Strict limiter for OTP
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 5, // max 5 requests
  message: "Too many OTP requests. Please try again later.",
});

// Login limiter
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again later.",
});

/* ================= ROUTES ================= */

router.post("/signup", otpLimiter, signup);

router.post("/verify-otp", otpLimiter, verifySignupOTP);

router.post("/login-otp", otpLimiter, sendLoginOTP);

router.post("/login", loginLimiter, login);

router.get("/me", protect, getMe);

export default router;
