import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { generateOTP, verifyOTP } from "../utils/otp.js";
import { generateToken } from "../utils/jwt.js";

/* ================= HELPERS ================= */

const normalizeEmail = (email) => email?.trim().toLowerCase();

/* ================= SIGNUP (SEND OTP) ================= */

export const signup = async (req, res) => {
  try {
    let { email } = req.body;

    if (typeof email === "object") email = email.email;
    email = normalizeEmail(email);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    await generateOTP(email);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= VERIFY OTP & CREATE USER ================= */

export const verifySignupOTP = async (req, res) => {
  try {
    let { name, email, mobile, password, role, otp } = req.body;

    email = normalizeEmail(email);

    if (!name || !email || !password || !role || !otp) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!["client", "driver"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Signup successful",
      data: { token, role: user.role },
    });

  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {
    let { email, password, otp } = req.body;

    email = normalizeEmail(email);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.blockedUntil && user.blockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account temporarily blocked",
      });
    }

    if (otp) {
      if (!verifyOTP(email, otp)) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
    } else {
      if (!password) {
        return res.status(400).json({ success: false, message: "Password required" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: "Wrong password" });
      }
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      data: { token, role: user.role },
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ME ================= */

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};

/* ================= SEND LOGIN OTP ================= */

export const sendLoginOTP = async (req, res) => {
  try {
    let { email } = req.body;

    email = normalizeEmail(email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified",
      });
    }

    await generateOTP(email);

    res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (err) {
    console.error("Send Login OTP error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
