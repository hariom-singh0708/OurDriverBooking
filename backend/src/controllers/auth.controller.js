import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { generateOTP, verifyOTP } from "../utils/otp.js";
import { generateToken } from "../utils/jwt.js";

export const signup = async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ success: false, message: "Email exists" });

  generateOTP(email);
  res.json({ success: true, message: "OTP sent to email" });
};

export const verifySignupOTP = async (req, res) => {
  const { name, email, mobile, password, role, otp } = req.body;

  if (!verifyOTP(email, otp))
    return res.status(400).json({ success: false, message: "Invalid OTP" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    mobile,
    password: hashed,
    role,
    isVerified: true,
  });

  const token = generateToken(user);

  res.json({
    success: true,
    message: "Signup successful",
    data: { token, role: user.role },
  });
};

export const login = async (req, res) => {
  const { email, password, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  if (otp) {
    if (!verifyOTP(email, otp))
      return res.status(400).json({ success: false, message: "Invalid OTP" });
  } else {
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Wrong password" });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: "Login successful",
    data: { token, role: user.role },
  });
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
