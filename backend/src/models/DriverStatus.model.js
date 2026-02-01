import mongoose from "mongoose";

const driverStatusSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    location: {
      lat: Number,
      lng: Number,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DriverStatus", driverStatusSchema);
