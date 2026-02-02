import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["driver", "client"],
      required: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);
