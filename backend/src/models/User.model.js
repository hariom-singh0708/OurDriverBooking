import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String },
    role: {
      type: String,
      enum: ["client", "driver"],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    cancelCountToday: {
      type: Number,
      default: 0,
    },
    blockedUntil: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
