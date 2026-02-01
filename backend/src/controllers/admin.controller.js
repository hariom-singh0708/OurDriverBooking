import User from "../models/User.model.js";
import Ride from "../models/Ride.model.js";
import DriverStatus from "../models/DriverStatus.model.js";
import KYC from "../models/KYC.model.js";

const ACTIVE_STATUSES = ["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED", "ON_RIDE"];

export const getAdminStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalRides, activeRides, completedToday] = await Promise.all([
      Ride.countDocuments({}),
      Ride.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      Ride.countDocuments({ status: "COMPLETED", completedAt: { $gte: startOfToday } }),
    ]);

    return res.json({
      success: true,
      data: { totalRides, activeRides, completedToday },
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listDrivers = async (req, res) => {
  try {
    const { q = "", city = "", isOnline, isAvailable, kycStatus, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const userMatch = { role: "driver" };

    if (q.trim()) {
      userMatch.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
        { mobile: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const [drivers, total] = await Promise.all([
      User.find(userMatch).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(userMatch),
    ]);

    const driverIds = drivers.map((d) => d._id);

    const statusMatch = { driver: { $in: driverIds } };
    if (city) statusMatch.city = city;
    if (typeof isOnline !== "undefined") statusMatch.isOnline = String(isOnline) === "true";
    if (typeof isAvailable !== "undefined") statusMatch.isAvailable = String(isAvailable) === "true";

    const statuses = await DriverStatus.find(statusMatch).lean();
    const statusMap = new Map(statuses.map((s) => [String(s.driver), s]));

    let kycMap = new Map();
    try {
      const kycs = await KYC.find({ driver: { $in: driverIds } }).lean();
      kycMap = new Map(kycs.map((k) => [String(k.driver), k]));
    } catch {}

    let data = drivers.map((d) => {
      const st = statusMap.get(String(d._id)) || null;
      const kyc = kycMap.get(String(d._id)) || null;

      return {
        ...d.toObject(),
        status: st,
        kyc,
        isBlocked: d.blockedUntil ? new Date(d.blockedUntil) > new Date() : false,
      };
    });

    if (kycStatus) {
      const want = String(kycStatus).toUpperCase();
      data = data.filter((x) => (x.kyc?.status || "").toUpperCase() === want);
    }

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("listDrivers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listRides = async (req, res) => {
  try {
    const { status, from, to, driverId, clientId, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const match = {};
    if (status) match.status = String(status).toUpperCase();
    if (driverId) match.driverId = driverId;
    if (clientId) match.clientId = clientId;

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      Ride.find(match)
        .populate("driverId", "name email mobile role")
        .populate("clientId", "name email mobile role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Ride.countDocuments(match),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("listRides error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRideById = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId)
      .populate("driverId", "name email mobile role")
      .populate("clientId", "name email mobile role");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    return res.json({ success: true, data: ride });
  } catch (err) {
    console.error("getRideById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const toggleDriverBlock = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { block = true, minutes = 1440 } = req.body;

    const driver = await User.findOne({ _id: driverId, role: "driver" });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (block) driver.blockedUntil = new Date(Date.now() + Number(minutes) * 60 * 1000);
    else driver.blockedUntil = null;

    await driver.save();

    return res.json({
      success: true,
      message: block ? "Driver blocked" : "Driver unblocked",
      data: { _id: driver._id, blockedUntil: driver.blockedUntil },
    });
  } catch (err) {
    console.error("toggleDriverBlock error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
