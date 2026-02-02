import dotenv from "dotenv";
dotenv.config();


import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

// 🔗 DB connection (reuse your existing connection string)
const MONGO_URI = "mongodb://127.0.0.1:27017/driver_booking_db";
console.log("Mongo URI:", MONGO_URI);
const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected");

    const adminEmail = "admin@example.com";

    // 🔍 check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // 👤 create admin
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("🎉 Admin user created successfully");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();
