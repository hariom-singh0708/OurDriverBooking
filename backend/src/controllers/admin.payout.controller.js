import razorpay, { getOrCreateFundAccount } from "../config/razorpay.js";
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


function normalizeDateOnly(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const payWeeklyNow = async (req, res) => {
  try {
    const { start, end, note = "" } = req.body;
    if (!start || !end) return res.status(400).json({ message: "start and end required" });

    const weekStart = normalizeDateOnly(start);
    const weekEnd = new Date(end);

    const payouts = await Payout.find({
      weekStart,
      status: { $in: ["PENDING", "FAILED"] }, // ✅ retry allow
    }).populate("driverId");

    let successCount = 0;
    let failCount = 0;

    for (const p of payouts) {
      const driver = p.driverId;

      try {
        // 1) try primary (bank if present else upi)
        let fa = await getOrCreateFundAccount(driver);

        const rp = await razorpay.payouts.create({
          account_number: process.env.RAZORPAY_X_ACCOUNT,
          fund_account_id: fa.id,
          amount: Math.round(Number(p.payable || 0) * 100), // paise
          currency: "INR",
          mode: fa.account_type === "bank_account" ? "IMPS" : "UPI",
          purpose: "payout",
          narration: note || `Weekly payout ${weekStart.toISOString().slice(0,10)}`,
          reference_id: String(p._id),
          queue_if_low_balance: true,
        });

        p.razorpayPayoutId = rp.id;
        p.status = "PROCESSING";
        p.note = note;
        p.weekEnd = weekEnd;
        p.failureReason = null;
        await p.save();

        successCount++;
      } catch (err1) {
        // 2) fallback try UPI (only if bank attempt likely)
        try {
          const driverDoc = p.driverId;

          const vpaId = driverDoc?.payout?.razorpayFundAccountIdVpa;
          if (!vpaId) throw new Error(err1?.message || "Bank payout failed and no UPI found");

          const rp2 = await razorpay.payouts.create({
            account_number: process.env.RAZORPAY_X_ACCOUNT,
            fund_account_id: vpaId,
            amount: Math.round(Number(p.payable || 0) * 100),
            currency: "INR",
            mode: "UPI",
            purpose: "payout",
            narration: note || `Weekly payout ${weekStart.toISOString().slice(0,10)}`,
            reference_id: String(p._id),
            queue_if_low_balance: true,
          });

          p.razorpayPayoutId = rp2.id;
          p.status = "PROCESSING";
          p.note = note;
          p.failureReason = null;
          await p.save();

          successCount++;
        } catch (err2) {
          p.status = "FAILED";
          p.failureReason = err2?.message || err1?.message || "Payout failed";
          await p.save();
          failCount++;
        }
      }
    }

    return res.json({
      success: true,
      message: "Payout processing started (webhook will mark PAID/FAILED)",
      total: payouts.length,
      sentToRazorpay: successCount,
      failedInstant: failCount,
    });
  } catch (e) {
    console.error("payWeeklyNow error:", e);
    return res.status(500).json({ message: "Failed to pay weekly payouts" });
  }
};