import Ride from "../models/Ride.model.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export const getRevenueAnalytics = async (req, res) => {
  try {
    const range = String(req.query.range || "week").toLowerCase(); // week|month|year
    const fromQ = req.query.from;
    const toQ = req.query.to;

    const now = new Date();

    // ✅ Default date ranges if not passed
    let from, to;
    if (fromQ && toQ) {
      from = startOfDay(fromQ);
      to = endOfDay(toQ);
    } else {
      if (range === "week") {
        from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
        to = endOfDay(now);
      } else if (range === "month") {
        from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        to = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      } else {
        // year
        from = startOfDay(new Date(now.getFullYear(), 0, 1));
        to = endOfDay(new Date(now.getFullYear(), 11, 31));
      }
    }

    // ✅ Use completedAt if available, else fallback to createdAt
const dateExpr = { $ifNull: ["$completedAt", "$createdAt"] };

const match = {
  status: "COMPLETED",
  "fareBreakdown.totalFare": { $gt: 0 },
  $or: [
    { completedAt: { $gte: from, $lte: to } },
    { completedAt: null, createdAt: { $gte: from, $lte: to } },
  ],
};

const groupKey =
  range === "year"
    ? { $dateToString: { format: "%Y-%m", date: dateExpr } }
    : { $dateToString: { format: "%Y-%m-%d", date: dateExpr } };

    const commissionRate = Number(process.env.DRIVER_COMMISSION_RATE || 0.5); // default 50%

    const agg = await Ride.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupKey,
          revenue: { $sum: "$fareBreakdown.totalFare" },
          rides: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalNetRevenue = agg.reduce((s, x) => s + (x.revenue || 0), 0);
    const totalRides = agg.reduce((s, x) => s + (x.rides || 0), 0);

    const avgRideValue = totalRides ? Math.round(totalNetRevenue / totalRides) : 0;

    // ✅ computed since not stored
    const driverCommissions = Math.round(totalNetRevenue * commissionRate);
    const systemProfit = Math.round(totalNetRevenue - driverCommissions);

    // ✅ series labels
    const series = agg.map((x, idx) => ({
      label: range === "year" ? x._id : `D${idx + 1}`,
      value: Math.round(x.revenue || 0),
      // optionally send real date key too:
      key: x._id,
    }));

    // ✅ (optional) target
    const targetValue = Number(process.env.REVENUE_TARGET || 0);
    const targetPct = targetValue ? (totalNetRevenue / targetValue) * 100 : 0;

    // ✅ (optional) previous period compare
    // Keeping simple = 0 for now (you can add later)
    const changePct = 0;

    return res.json({
      success: true,
      summary: {
        totalNetRevenue: Math.round(totalNetRevenue),
        avgRideValue,
        driverCommissions,
        systemProfit,
        changePct,
        targetPct,
        targetValue,
        from,
        to,
        range,
      },
      series,
    });
  } catch (err) {
    console.log("Revenue analytics error:", err);
    return res.status(500).json({ success: false, message: "Failed to load revenue analytics" });
  }
};
