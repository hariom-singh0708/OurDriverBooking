// src/models/User.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC AUTH ================= */
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobile: String,
    password: String,

    /* ================= PROFILE PHOTO ================= */
    // Cloudinary image URL
    profileImage: {
      type: String,
      default: null,
    },

    /* ================= ROLE ================= */
    role: {
      type: String,
      enum: ["client", "driver", "admin"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= ACCOUNT SAFETY ================= */
    cancelCountToday: {
      type: Number,
      default: 0,
    },

    blockedUntil: {
      type: Date,
      default: null,
    },

    /* ================= EXTRA PROFILE DETAILS (EDITABLE) ================= */
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dob: {
      type: Date,
    },

    alternateMobile: {
      type: String,
    },

    emergencyContact: {
      name: String,
      phone: String,
    },

    preferredLanguage: {
      type: String,
      default: "English",
    },

    driverNotes: {
      type: String, // instructions for driver
    },

    /* ================= SAVED ADDRESSES (CLIENT) ================= */
    savedAddresses: [
      {
        label: {
          type: String,
          default: "Other", // Home / Office / Other
        },
        address: {
          type: String,
          required: true,
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
        /* ================= RATING (CLIENT) ================= */
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },
  },
  
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
