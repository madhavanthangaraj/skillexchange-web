// controllers/exchangeController.js
// Handles sending, accepting, rejecting exchange requests

const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User");
const { calculateMatchScore } = require("../utils/matchingEngine");

// @desc    Send exchange request
// @route   POST /api/exchange
// @access  Private
const sendRequest = async (req, res, next) => {
  try {
    const { receiverId, senderSkill, receiverSkill, message } = req.body;

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // Prevent duplicate pending requests
    const existing = await ExchangeRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Request already sent" });
    }

    // Calculate LMS match score
    const matchScore = calculateMatchScore(req.user, receiver);

    const request = await ExchangeRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      senderSkill,
      receiverSkill,
      message: message || "",
      matchScore,
    });

    await request.populate("sender", "name email").populate("receiver", "name email");

    res.status(201).json({ success: true, message: "Exchange request sent", request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests for current user (sent + received)
// @route   GET /api/exchange
// @access  Private
const getMyRequests = async (req, res, next) => {
  try {
    const sent = await ExchangeRequest.find({ sender: req.user._id })
      .populate("receiver", "name email avatar rating skillsToTeach skillsToLearn")
      .sort({ createdAt: -1 });

    const received = await ExchangeRequest.find({ receiver: req.user._id })
      .populate("sender", "name email avatar rating skillsToTeach skillsToLearn")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, sent, received });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or Reject an exchange request
// @route   PUT /api/exchange/:id
// @access  Private
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be accepted or rejected" });
    }

    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Only the receiver can accept/reject
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    // If accepted, increment LMS score for both users
    if (status === "accepted") {
      await User.findByIdAndUpdate(request.sender, { $inc: { lmsScore: 5 } });
      await User.findByIdAndUpdate(request.receiver, { $inc: { lmsScore: 5 } });
    }

    res.status(200).json({ success: true, message: `Request ${status}`, request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exchange request
// @route   GET /api/exchange/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id)
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Only participants can view
    const isParticipant =
      request.sender._id.toString() === req.user._id.toString() ||
      request.receiver._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendRequest, getMyRequests, updateRequestStatus, getRequestById };
