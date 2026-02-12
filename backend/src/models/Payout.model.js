import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    weekStart: {
      type: Date,
      required: true,
      index: true,
    },

    weekEnd: {
      type: Date,
      required: true,
    },

    rides: {
      type: Number,
      default: 0,
      min: 0,
    },

    gross: {
      type: Number,
      default: 0,
      min: 0,
    },

    payable: {
      type: Number,
      default: 0,
      min: 0, // 🔥 no negative payout
    },

    /* ================= Razorpay ================= */

    razorpayPayoutId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allow null until paid
      index: true,
    },

    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

/* ================= UNIQUE WEEKLY PAYOUT ================= */

payoutSchema.index(
  { driverId: 1, weekStart: 1 },
  { unique: true }
);

/* ================= QUERY OPTIMIZATION ================= */

payoutSchema.index({ driverId: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

export default mongoose.model("Payout", payoutSchema);
