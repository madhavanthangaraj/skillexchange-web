// models/Review.js
// Review left by one user for another after a session

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    // Who wrote the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who received the review
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      default: "",
    },
    // Which skill was demonstrated
    skillReviewed: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for the same session by same reviewer
ReviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
