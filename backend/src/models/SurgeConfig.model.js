import mongoose from "mongoose";

const surgeSchema = new mongoose.Schema({
  peakEnabled: { type: Boolean, default: false },
  festivalEnabled: { type: Boolean, default: false },

  peakMultiplier: { type: Number, default: 1.3 },      // 30% increase
  festivalMultiplier: { type: Number, default: 1.5 },  // 50% increase
});

export default mongoose.model("SurgeConfig", surgeSchema);
