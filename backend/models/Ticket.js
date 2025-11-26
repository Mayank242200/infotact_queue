
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "claimed", "resolved"],
      default: "pending"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    claimedAt: {
      type: Date
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
