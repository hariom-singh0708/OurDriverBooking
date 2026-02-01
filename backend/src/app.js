import express from "express";
import cors from "cors";
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




const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy 🚀",
  });
});

app.use("/auth", authRoutes);
app.use("/client", clientRoutes);
app.use("/fare", fareRoutes);
app.use("/rides", rideRoutes);
app.use("/kyc", kycRoutes);
app.use("/driver", driverRoutes);
app.use("/waiting", waitingRoutes);
app.use("/payment", paymentRoutes);
app.use("/rides", rideCompletionRoutes);
app.use("/history", historyRoutes);
app.use("/chat", chatRoutes);
app.use("/sos", sosRoutes);
app.use("/admin", adminRoutes);



export default app;
