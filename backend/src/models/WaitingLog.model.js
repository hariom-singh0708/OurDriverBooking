import mongoose from "mongoose";

const waitingLogSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    extraMinutes: {
      type: Number,
      default: 0,
    },

    extraCharge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WaitingLog", waitingLogSchema);
