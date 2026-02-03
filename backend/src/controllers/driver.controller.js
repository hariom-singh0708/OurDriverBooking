import DriverStatus from "../models/DriverStatus.model.js";
import KYC from "../models/KYC.model.js";
import { getIO } from "../config/socket.js";
import Ride from "../models/Ride.model.js";
import Payment from "../models/Payment.model.js";

const getDateRange = (type) => {
  const now = new Date();

  if (type === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (type === "week") {
    const start = new Date();
    const day = start.getDay() || 7; // Monday start
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (type === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return { start, end };
  }

  return { start: new Date(0), end: new Date() };
};



export const getDriverAnalytics = async (req, res) => {
  try {
    const driverId = req.user._id;
    const { type = "today" } = req.query;

    const { start, end } = getDateRange(type);

    /* ================= RIDES ================= */

    const accepted = await Ride.countDocuments({
      driverId,
      status: { $in: ["ACCEPTED", "ON_RIDE", "DRIVER_ARRIVED", "COMPLETED"] },
      createdAt: { $gte: start, $lte: end },
    });

    const rejected = await Ride.countDocuments({
      rejectedByDrivers: driverId,
      createdAt: { $gte: start, $lte: end },
    });

    const completed = await Ride.countDocuments({
      driverId,
      status: "COMPLETED",
      completedAt: { $gte: start, $lte: end },
    });

    const total = accepted + rejected;

    /* ================= CASH COLLECTED ================= */

    const cashAgg = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalCash: { $sum: "$fareBreakdown.totalFare" },
        },
      },
    ]);

    const cashCollected = cashAgg[0]?.totalCash || 0;

    /* ================= TOTAL EARNINGS ================= */

    const earningsAgg = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: "COMPLETED",
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fareBreakdown.totalFare" },
        },
      },
    ]);

    const gross = earningsAgg[0]?.total || 0;
    const driverEarning = gross * 0.5;

    /* ================= PERFORMANCE ================= */

    const acceptanceRate =
      total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;

    /* ================= RESPONSE ================= */

    res.json({
      success: true,
      data: {
        period: type,
        rides: {
          total,
          accepted,
          rejected,
          completed,
        },
        earnings: {
          gross,
          driverEarning,
          cashCollected, // ✅ IMPORTANT
        },
        performance: {
          acceptanceRate,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Analytics error",
    });
  }
};



export const updateDriverLocation = async (req, res) => {
  const { rideId, lat, lng } = req.body;
  const io = getIO();

  io.to(rideId).emit("driver_location_update", {
    rideId,
    lat,
    lng,
  });

  res.json({
    success: true,
    message: "Location broadcasted",
  });
};


/**
 * Toggle Driver Online / Offline
 */
export const toggleOnlineStatus = async (req, res) => {
  try {
    const { isOnline, lat, lng } = req.body;

    // ✅ KYC check ONLY when going ONLINE
    if (isOnline === true) {
      const kyc = await KYC.findOne({ userId: req.user._id });

      if (!kyc || kyc.status !== "approved") {
        return res.status(403).json({
          success: false,
          message: "Complete KYC to go online",
        });
      }
    }

    const status = await DriverStatus.findOneAndUpdate(
      { driverId: req.user._id },
      {
        isOnline,
        location: isOnline ? { lat, lng } : null,
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );
   // 🔥 REAL TIME ADMIN UPDATE
    const io = getIO();
    if (io) {
      io.emit("driver_status_updated", {
        driverId: String(req.user._id),
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
        location: status.location,
      });
    }

    return res.json({
      success: true,
      message: `Driver is now ${isOnline ? "Online" : "Offline"}`,
      data: status,
    });
  } catch (err) {
    console.error("Toggle status error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// controllers/driver.controller.js
export const getDriverStatus = async (req, res) => {
  const status = await DriverStatus.findOne({
    driverId: req.user._id,
  });

  res.json({
    success: true,
    data: {
      isOnline: status?.isOnline || false,
    },
  });
};
