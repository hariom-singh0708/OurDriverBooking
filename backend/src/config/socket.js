import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_DEV_URL,
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn("❌ Socket CORS blocked:", origin);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20000,   // 20 sec
    pingInterval: 25000,  // heartbeat
    transports: ["websocket"], // avoid long polling in prod
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /* ================= DRIVER STATUS ================= */

    socket.on("driver_online", () => {
      socket.join("online_drivers");
      socket.data.isDriverOnline = true; // track status
    });

    socket.on("driver_offline", () => {
      socket.leave("online_drivers");
      socket.data.isDriverOnline = false;
    });

    /* ================= JOIN RIDE ROOM ================= */

    socket.on("join_ride", (rideId) => {
      if (!rideId) return;
      socket.join(rideId);
    });

    /* ================= DRIVER LOCATION ================= */

    socket.on("driver_location", ({ rideId, lat, lng }) => {
      if (!rideId || lat == null || lng == null) return;

      io.to(rideId).emit("driver_location_update", { lat, lng });
    });

    /* ================= RIDE STATUS UPDATE ================= */

    socket.on("ride_status_update", (data) => {
      if (!data?.rideId) return;

      io.to(data.rideId).emit("ride_status_update", data);
    });

    /* ================= ERROR HANDLING ================= */

    socket.on("error", (err) => {
      console.error("⚠️ Socket error:", err.message);
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);

      // Auto remove from online drivers if needed
      if (socket.data.isDriverOnline) {
        socket.leave("online_drivers");
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
