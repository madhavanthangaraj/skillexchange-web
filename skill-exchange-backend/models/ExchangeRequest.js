// models/ExchangeRequest.js
// Represents a skill exchange request between two users

const mongoose = require("mongoose");

const ExchangeRequestSchema = new mongoose.Schema(
  {
    // User who sends the request
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User who receives the request
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Skill the sender wants to teach
    senderSkill: {
      type: String,
      required: true,
    },
    // Skill the sender wants to learn from the receiver
    receiverSkill: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    // LMS match score calculated at request time
    matchScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExchangeRequest", ExchangeRequestSchema);
