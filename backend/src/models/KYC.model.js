import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    aadhaarNumber: String,
    aadhaarImage: String,

    panNumber: String,
    panImage: String,

    licenseNumber: String,
    licenseImage: String,

    /* ✅ NEW */
    licenseExpiry: {
      type: Date,
    },

    /* ✅ NEW */
    criminalOffence: {
      type: String,
      default: "None",
    },

    driverPhoto: String,
    address: String,

    status: {
      type: String,
      enum: ["submitted", "under_review", "approved","rejected"],
      default: "submitted",
    },
     rejectReason: String,

  },
  { timestamps: true }
);

export default mongoose.model("KYC", kycSchema);
