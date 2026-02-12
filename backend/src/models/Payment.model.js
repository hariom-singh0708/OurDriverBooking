import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ["pay_now", "pay_after_ride"],
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      unique: true, // 🔥 prevents duplicate payment entry
      sparse: true, // allows null until paid
    },

    razorpaySignature: {
      type: String,
      trim: true,
      select: false, // 🔥 hide from normal queries
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// Common queries
paymentSchema.index({ rideId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
