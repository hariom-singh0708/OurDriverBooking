import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
      match: /^[0-9]{12}$/, // 12 digit Aadhaar
    },

    aadhaarImage: {
      type: String,
      trim: true,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format
    },

    panImage: {
      type: String,
      trim: true,
    },

    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    licenseImage: {
      type: String,
      trim: true,
    },

    licenseExpiry: {
      type: Date,
    },

    hasCriminalRecord: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
      lowercase: true,
    },

    criminalOffenceDetails: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (value) {
          if (this.hasCriminalRecord === "yes") {
            return value && value.length > 5;
          }
          return true;
        },
        message: "Criminal offence details required if record is yes",
      },
    },

    driverPhoto: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected"],
      default: "submitted",
      index: true,
    },

    rejectReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export default mongoose.model("KYC", kycSchema);
