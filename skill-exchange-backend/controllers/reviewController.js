// controllers/reviewController.js
// Handles adding and fetching reviews after sessions

const Review = require("../models/Review");
const Session = require("../models/Session");
const User = require("../models/User");

// @desc    Add a review after a completed session
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { sessionId, revieweeId, rating, comment, skillReviewed } = req.body;

    // Session must exist and be completed
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    if (session.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review after session is completed" });
    }

    // Reviewer must be a participant
    const isParticipant = session.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Reviewee must also be a participant
    const isRevieweeParticipant = session.participants.some(
      (p) => p.toString() === revieweeId
    );
    if (!isRevieweeParticipant) {
      return res.status(400).json({ success: false, message: "Reviewee is not in this session" });
    }

    // Create review
    const review = await Review.create({
      session: sessionId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment: comment || "",
      skillReviewed: skillReviewed || "",
    });

    // Update reviewee's average rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
      $inc: { lmsScore: 3 }, // LMS score boost for getting reviewed
    });

    await review.populate("reviewer", "name avatar");
    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Private
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar")
      .populate("session", "scheduledDate topic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews written by current user
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("reviewee", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getUserReviews, getMyReviews };
