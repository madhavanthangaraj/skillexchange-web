// models/Session.js
// Stores scheduled session between two exchange users (includes Google Meet link)

const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExchangeRequest",
      required: true,
    },
    // Both participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    scheduledDate: {
      type: Date,
      required: [true, "Session date is required"],
    },
    scheduledTime: {
      type: String,
      required: [true, "Session time is required"],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    // Google Meet link provided by the user scheduling the session
    meetLink: {
      type: String,
      default: "",
    },
    topic: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);
