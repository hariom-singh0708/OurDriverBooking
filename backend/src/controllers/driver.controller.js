import DriverStatus from "../models/DriverStatus.model.js";
import KYC from "../models/KYC.model.js";
import { getIO } from "../config/socket.js";
import Ride from "../models/Ride.model.js";
import Payment from "../models/Payment.model.js";
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import Payout from "../models/Payout.model.js";
import SupportTicket from "../models/SupportTicket.model.js";

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
    const round2 = (n) => Number(n.toFixed(2));

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

    /* ================= CASH ================= */
    const cashAgg = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: "COMPLETED",
          paymentMethod: "CASH",
          completedAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$fareBreakdown.totalFare" } } },
    ]);

    const cashCollected = round2(cashAgg[0]?.total || 0);

    /* ================= EARNINGS ================= */
    const earningAgg = await Ride.aggregate([
      {
        $match: {
          driverId,
          status: "COMPLETED",
          completedAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, gross: { $sum: "$fareBreakdown.totalFare" } } },
    ]);

    const gross = round2(earningAgg[0]?.gross || 0);
    const driverEarning = round2(gross * 0.5);

    /* ================= PAYOUTS ================= */
    const payoutAgg = await Payout.aggregate([
      {
        $match: {
          driverId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          amount: { $sum: "$payable" },
        },
      },
    ]);

    let receivedPayout = 0;
    let pendingPayout = 0;

    payoutAgg.forEach((p) => {
      if (p._id === "PAID") receivedPayout += p.amount;
      if (["PENDING", "PROCESSING"].includes(p._id))
        pendingPayout += p.amount;
    });

    /* ================= PERFORMANCE ================= */
    const acceptanceRate =
      total > 0 ? round2((accepted / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        period: type,
        rides: { total, accepted, rejected, completed },
        earnings: {
          gross,
          driverEarning,
          cashCollected,
          receivedPayout: round2(receivedPayout),
          pendingPayout: round2(pendingPayout),
        },
        performance: { acceptanceRate },
      },
    });
  } catch (err) {
    console.error("DRIVER ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, message: "Analytics error" });
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

/**
 * Update Driver Profile (Additional Details)
 */
export const updateDriverProfile = async (req, res) => {
  try {
    const {
      carTypes,
      preferredLanguage,
      dob,
      preferredCity,
      gender,
    } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          carTypes,
          preferredLanguage,
          dob,
          preferredCity,
          gender,
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Driver profile updated",
      data: driver,
    });
  } catch (err) {
    console.error("Update driver profile error:", err);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

/**
 * Update Driver Bank Details (FIXED)
 */
export const updateDriverBankDetails = async (req, res) => {
  try {
    const { bankDetails } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          bankDetails: {
            ...bankDetails,
            isVerifiedByAdmin: false, // ✅ merge inside object
          },
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Bank details saved",
      data: driver.bankDetails,
    });
  } catch (err) {
    console.error("Bank update error:", err);
    res.status(500).json({
      success: false,
      message: "Bank details update failed",
    });
  }
};


export const getDriverProfile = async (req, res) => {
  try {
    const driver = await User.findById(req.user._id).select("-password");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // 🔥 REAL-TIME DRIVER RATING (FROM RIDES)
    const ratedRides = await Ride.find({
      driverId: req.user._id,
      "clientRating.rating": { $gt: 0 },
    });

    const totalRatings = ratedRides.length;

    const average =
      totalRatings === 0
        ? 0
        : ratedRides.reduce(
            (sum, r) => sum + r.clientRating.rating,
            0
          ) / totalRatings;

    res.json({
      success: true,
      data: {
        ...driver.toObject(),
        rating: {
          average: Number(average.toFixed(1)),
          totalRatings,
        },
      },
    });
  } catch (err) {
    console.error("Get driver profile error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * Update Driver Profile Photo (FIXED)
 * multer + CloudinaryStorage already uploads image
 */
export const updateDriverProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // ✅ multer-storage-cloudinary already uploaded image
    const imageUrl = req.file.path; // THIS IS CLOUDINARY URL

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Driver profile photo updated",
      data: driver,
    });
  } catch (err) {
    console.error("Driver photo upload error:", err);
    res.status(500).json({
      success: false,
      message: "Profile photo upload failed",
    });
  }
};

/**
 * 🆘 Driver Support / Help Ticket
 */
export const createDriverSupportTicket = async (req, res) => {
  try {
    const { category, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Category and message are required",
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      role: "driver",
      category,
      message,
    });

    res.json({
      success: true,
      message: "Support request sent to admin",
      data: ticket,
    });
  } catch (err) {
    console.error("SUPPORT TICKET ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send support request",
    });
  }
};


/**
 * ❌ DELETE DRIVER ACCOUNT (PERMANENT)
 * - Deletes driver user
 * - Cleans linked collections
 */
export const deleteDriverAccount = async (req, res) => {
  try {
    const driverId = req.user._id;

    // 🔥 SAFETY: Driver should not be on active ride
    const activeRide = await Ride.findOne({
      driverId,
      status: { $in: ["ACCEPTED", "ON_RIDE", "DRIVER_ARRIVED"] },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account while an active ride exists",
      });
    }

    /* ================= CLEANUP ================= */

    // Driver online status
    await DriverStatus.deleteOne({ driverId });

    // KYC
    await KYC.deleteOne({ userId: driverId });

    // Support tickets
    await SupportTicket.deleteMany({ userId: driverId });

    // ❗ IMPORTANT:
    // Rides & Payouts are NOT deleted (legal + audit reasons)
    // They remain linked historically

    // Finally delete user
    await User.findByIdAndDelete(driverId);

    return res.json({
      success: true,
      message: "Driver account permanently deleted",
    });
  } catch (err) {
    console.error("DELETE DRIVER ACCOUNT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete driver account",
    });
  }
};
