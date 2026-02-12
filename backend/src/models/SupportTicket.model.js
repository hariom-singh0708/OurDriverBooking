// src/models/SupportTicket.model.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "role",
    },

    role: {
      type: String,
      enum: ["driver", "client"],
      required: true,
    },

    category: {
      type: String, // Payment / Account / Ride / Other
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
