import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    bookingType: {
      type: String,
      enum: ["distance_based", "time_based"],
      required: true,
      index: true,
    },

    bookingDuration: {
      type: Number,
      min: 1,
    },

    pickupLocation: {
      address: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },

    dropLocation: {
      address: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },

    rideType: {
      type: String,
      enum: ["one-way", "two-way"],
      required: true,
    },

    waitingTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    fareBreakdown: {
      baseFare: { type: Number, min: 0 },
      distanceFare: { type: Number, min: 0 },
      timeFare: { type: Number, min: 0 },
      waitingCharge: { type: Number, min: 0 },
      totalFare: { type: Number, min: 0 },
    },

    paymentMode: {
      type: String,
      enum: ["pay_now", "pay_after_ride"],
      required: true,
    },

    assignedAt: Date,
    requestExpiresAt: Date,

    otp: {
      type: String,
      select: false, // 🔥 hide OTP by default
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,

    finalFareLocked: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ACCEPTED",
        "DRIVER_ARRIVED",
        "ON_RIDE",
        "COMPLETED",
        "CANCELLED_BY_CLIENT",
        "CANCELLED_BY_DRIVER",
        "CANCELLED_AUTO",
      ],
      default: "REQUESTED",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "CASH", "ONLINE"],
    },

    paymentReceivedAt: Date,

    rejectedByDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    cancelledAt: Date,

    clientRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: {
        type: String,
        default: "",
        maxlength: 500,
      },
      ratedAt: Date,
    },
  },
  { timestamps: true }
);

/* ================= PERFORMANCE INDEXES ================= */

// Most common queries
rideSchema.index({ clientId: 1, createdAt: -1 });
rideSchema.index({ driverId: 1, createdAt: -1 });
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ requestExpiresAt: 1 });

export default mongoose.model("Ride", rideSchema);
