import Payout from "../models/Payout.model.js";
import Ride from "../models/Ride.model.js";

export const listWeeklyPayouts = async (req, res) => {
  const data = await Payout.find()
    .populate("driverId", "name mobile email")
    .sort({ weekStart: -1 });

  res.json({ success: true, data });
};


export const weeklyDriverEarnings = async (req, res) => {
  try {
    const { start } = req.query;

    // -------------------------------
    // 1. Calculate week range (Mon → Sun)
    // -------------------------------
    let startDate;
    let endDate;

    if (start) {
      startDate = new Date(start);
    } else {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const diff = (day + 6) % 7; // make Monday start
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
    }

    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // -------------------------------
    // 2. Aggregate weekly earnings
    // -------------------------------
    const rows = await Ride.aggregate([
      {
        $match: {
          status: "COMPLETED",
          completedAt: { $gte: startDate, $lte: endDate },
          driverId: { $ne: null },
        },
      },
      {
        $addFields: {
          fareTotal: { $ifNull: ["$fareBreakdown.totalFare", 0] },
          driverShare: {
            $multiply: [{ $ifNull: ["$fareBreakdown.totalFare", 0] }, 0.5], // 50%
          },
        },
      },
      {
        $group: {
          _id: "$driverId",
          rides: { $sum: 1 },
          gross: { $sum: "$fareTotal" },
          payable: { $sum: "$driverShare" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },
      {
        $project: {
          driverId: "$_id",
          rides: 1,
          gross: 1,
          payable: 1,
          driver: {
            name: "$driver.name",
            mobile: "$driver.mobile",
            email: "$driver.email",
          },
        },
      },
      { $sort: { payable: -1 } },
    ]);

    // -------------------------------
    // 3. Response
    // -------------------------------
    return res.json({
      success: true,
      data: {
        range: {
          start: startDate,
          end: endDate,
        },
        drivers: rows,
      },
    });
  } catch (err) {
    console.error("weeklyDriverEarnings error:", err);
    return res.status(500).json({
      message: "Failed to load weekly earnings",
    });
  }
};


export const payWeeklyNow = async (req, res) => {
  try {
    const { start, end, note = "" } = req.body;
    if (!start || !end) return res.status(400).json({ message: "start and end required" });

    const startDate = new Date(start);
    const endDate = new Date(end);

    const rows = await Ride.aggregate([
      {
        $match: {
          status: "COMPLETED",
          completedAt: { $gte: startDate, $lte: endDate },
          driverId: { $ne: null },
        },
      },
      {
        $addFields: {
          fareTotal: { $ifNull: ["$fareBreakdown.totalFare", 0] },
          driverShare: { $multiply: [{ $ifNull: ["$fareBreakdown.totalFare", 0] }, 0.5] },
        },
      },
      {
        $group: {
          _id: "$driverId",
          rides: { $sum: 1 },
          gross: { $sum: "$fareTotal" },
          payable: { $sum: "$driverShare" },
        },
      },
    ]);

    // ✅ upsert payouts
    const ops = rows.map((r) => ({
      updateOne: {
        filter: { driverId: r._id, weekStart: startDate },
        update: {
          $setOnInsert: { driverId: r._id, weekStart: startDate, weekEnd: endDate },
          $set: { rides: r.rides, gross: r.gross, payable: r.payable },
        },
        upsert: true,
      },
    }));
    if (ops.length) await Payout.bulkWrite(ops);

    // ✅ mark PAID for this week
    const paidAt = new Date();
    const result = await Payout.updateMany(
      { weekStart: startDate, status: { $ne: "PAID" } },
      { $set: { status: "PAID", paidAt, note } }
    );

    return res.json({
      success: true,
      message: "Weekly payouts paid",
      generated: ops.length,
      markedPaid: result.modifiedCount ?? 0,
    });
  } catch (e) {
    console.error("payWeeklyNow error:", e);
    return res.status(500).json({ message: "Failed to pay weekly payouts" });
  }
};
