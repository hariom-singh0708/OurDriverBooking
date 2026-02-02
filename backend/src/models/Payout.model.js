import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true }, // Monday 00:00
    weekEnd: { type: Date, required: true },   // Sunday 23:59
    rides: { type: Number, default: 0 },
    gross: { type: Number, default: 0 },
payable: { type: Number, default: 0 },  // 50% driver earning

    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    paidAt: { type: Date, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

payoutSchema.index({ driverId: 1, weekStart: 1 }, { unique: true });

export default mongoose.model("Payout", payoutSchema);
