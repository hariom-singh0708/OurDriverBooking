import dotenv from "dotenv";
dotenv.config();


import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Create HTTP Server
    server = http.createServer(app);

    // Initialize Socket
    initSocket(server);

    // Start Listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();


// 🔥 Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  shutdown();
});

// 🔥 Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown();
});

// 🔥 Graceful Shutdown
const shutdown = async () => {
  console.log("⚠️ Shutting down server...");

  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      console.log("🛑 Server & DB closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
