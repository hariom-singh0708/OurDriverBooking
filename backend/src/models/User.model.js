// src/models/User.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC AUTH ================= */

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false, // 🔥 important (never return password by default)
    },

    /* ================= PROFILE PHOTO ================= */

    profileImage: {
      type: String,
      default: null,
    },

    /* ================= ROLE ================= */

    role: {
      type: String,
      enum: ["client", "driver", "admin"],
      required: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ================= ACCOUNT SAFETY ================= */

    cancelCountToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingPenaltyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    blockedUntil: {
      type: Date,
      default: null,
    },

    /* ================= PROFILE DETAILS ================= */

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
      trim: true,
      set: (v) => (v ? v.toLowerCase() : v),
    },

    dob: Date,

    alternateMobile: {
      type: String,
      trim: true,
    },

    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    preferredLanguage: {
      type: String,
      default: "English",
      trim: true,
    },

    driverNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /* ================= DRIVER DETAILS ================= */

    carTypes: {
      type: [String],
      default: [],
    },

    preferredCity: {
      type: String,
      trim: true,
    },

    /* ================= SAVED ADDRESSES ================= */

    savedAddresses: [
      {
        label: {
          type: String,
          default: "Other",
          trim: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
        },
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= RATING ================= */

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /* ================= DRIVER ADDITIONAL DETAILS ================= */

    drivingExperienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    vehicleType: {
      type: String,
      trim: true,
    },

    licenseNumber: {
      type: String,
      trim: true,
    },

    licenseExpiry: Date,

    /* ================= DRIVER BANK DETAILS ================= */

    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branchName: { type: String, trim: true },
      isVerifiedByAdmin: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
