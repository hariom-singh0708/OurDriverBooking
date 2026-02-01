import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.model.js";
import "dotenv/config";

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const adminEmail = "admin@ourdriver.com";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin user created successfully");
    console.log("Login:");
    console.log("Email:", adminEmail);
    console.log("Password: Admin@123");

    process.exit();
  } catch (err) {
    console.error("Seeder error:", err);
    process.exit(1);
  }
}

seedAdmin();
