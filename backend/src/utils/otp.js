// src/utils/otp.js
import crypto from "crypto";
import { sendEmail } from "./sendEmail.js";

const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

/* ================= HELPERS ================= */

// Normalize email
const normalizeEmail = (email) => email?.trim().toLowerCase();

// Generate random 6-digit OTP
const createOTP = () =>
  crypto.randomInt(100000, 1000000).toString();

// Hash OTP before storing
const hashOTP = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// Constant time comparison (security improvement)
const safeCompare = (a, b) => {
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
};

/* ================= GENERATE OTP ================= */

export const generateOTP = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Invalid email");
  }

  const existing = otpStore.get(normalizedEmail);

  // Resend cooldown check
  if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN_MS) {
    throw new Error("Please wait before requesting a new OTP.");
  }

  const otp = createOTP();
  const hashed = hashOTP(otp);

  otpStore.set(normalizedEmail, {
    otp: hashed,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });

  // Auto cleanup
  const timeout = setTimeout(() => {
    otpStore.delete(normalizedEmail);
  }, OTP_EXPIRY_MS);

  timeout.unref(); // prevent keeping event loop alive

  await sendEmail({
    to: normalizedEmail,
    subject: "🚗 Verify Your Email – Driver Booking",
    html: getOtpEmailTemplate(otp),
  });

  return true;
};

/* ================= VERIFY OTP ================= */

export const verifyOTP = (email, otp) => {
  const normalizedEmail = normalizeEmail(email);
  const record = otpStore.get(normalizedEmail);

  if (!record) return false;

  // Expired
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  // Too many attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  const hashedInput = hashOTP(otp);

  try {
    if (safeCompare(hashedInput, record.otp)) {
      otpStore.delete(normalizedEmail);
      return true;
    }
  } catch {
    // timingSafeEqual throws if length mismatch
  }

  record.attempts += 1;
  return false;
};

/* ================= EMAIL TEMPLATE ================= */

const getOtpEmailTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:20px;">
    <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px;">
      
      <h2 style="color:#111;">Verify Your Email</h2>
      
      <p style="color:#555;">
        Welcome to <b>Driver Booking</b> 🚗
      </p>

      <p style="color:#555;">
        Use the verification code below to complete your signup:
      </p>

      <div style="text-align:center; margin:25px 0;">
        <span style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          color:#2563eb;
        ">
          ${otp}
        </span>
      </div>

      <p style="color:#777; font-size:14px;">
        This OTP is valid for 5 minutes. Do not share it with anyone.
      </p>

      <hr style="margin:25px 0;" />

      <p style="font-size:12px; color:#aaa;">
        If you did not request this, please ignore this email.
      </p>

    </div>
  </div>
`;
