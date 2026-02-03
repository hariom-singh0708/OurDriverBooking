import crypto from "crypto";
import Payout from "../models/Payout.model.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // ✅ raw buffer
    const rawBody = req.body;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const payout = event?.payload?.payout?.entity;
    if (!payout) return res.json({ success: true });

    const record = await Payout.findOne({ razorpayPayoutId: payout.id });
    if (!record) return res.json({ success: true });

    if (payout.status === "processed") {
      record.status = "PAID";
      record.paidAt = new Date();
      record.failureReason = null;
    } else if (payout.status === "failed") {
      record.status = "FAILED";
      record.failureReason = payout.failure_reason || "Payout failed";
    } else {
      // processing/queued etc.
      record.status = "PROCESSING";
    }

    await record.save();
    return res.json({ success: true });
  } catch (e) {
    console.error("razorpayWebhook error:", e);
    return res.json({ success: true }); // webhook ko fail mat karo
  }
};
