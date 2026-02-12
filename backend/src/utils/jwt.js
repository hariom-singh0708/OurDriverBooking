import jwt from "jsonwebtoken";

/* ================= ENV VALIDATION ================= */

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

/* ================= TOKEN GENERATION ================= */

export const generateToken = (user) => {
  if (!user?._id || !user?.role) {
    throw new Error("Invalid user data for token generation");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN || "7d",
      issuer: "driver-booking-app",
    }
  );
};
