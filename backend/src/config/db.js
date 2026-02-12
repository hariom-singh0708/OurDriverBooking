import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, // production me performance better
      maxPoolSize: 10,  // max DB connections
      serverSelectionTimeoutMS: 5000, // fail fast if DB not reachable
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // DB Events Monitoring
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // stop server if DB not connected
  }
};

export default connectDB;
