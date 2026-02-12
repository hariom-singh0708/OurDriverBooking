import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import fareRoutes from "./routes/fare.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import waitingRoutes from "./routes/waiting.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import rideCompletionRoutes from "./routes/rideCompletion.routes.js";
import historyRoutes from "./routes/history.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import sosRoutes from "./routes/sos.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import supportRoutes from "./routes/support.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import { razorpayWebhook } from "./controllers/webhook.controller.js";

const app = express();

/* ================= SECURITY ================= */

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev", {
      skip: (req) => req.method === "OPTIONS",
    })
  );
}

/* ================= WEBHOOK ================= */

app.post(
  "/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

/* ================= CORS ================= */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DEV_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "10mb" }));

/* ================= HEALTH ================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
  });
});

/* ================= ROUTES ================= */

app.use("/auth", authRoutes);
app.use("/client", clientRoutes);
app.use("/fare", fareRoutes);
app.use("/rides", rideRoutes);
app.use("/rides", rideCompletionRoutes);
app.use("/kyc", kycRoutes);
app.use("/driver", driverRoutes);
app.use("/waiting", waitingRoutes);
app.use("/payments", paymentRoutes);
app.use("/history", historyRoutes);
app.use("/chat", chatRoutes);
app.use("/sos", sosRoutes);
app.use("/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/support", supportRoutes);

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
