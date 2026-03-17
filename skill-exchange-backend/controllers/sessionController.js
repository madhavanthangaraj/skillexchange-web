// controllers/sessionController.js
// Handles session scheduling (with Google Meet link)

const Session = require("../models/Session");
const ExchangeRequest = require("../models/ExchangeRequest");

// @desc    Schedule a session
// @route   POST /api/sessions
// @access  Private
const scheduleSession = async (req, res, next) => {
  try {
    const { exchangeRequestId, scheduledDate, scheduledTime, duration, meetLink, topic, notes } = req.body;

    // Validate exchange request exists and is accepted
    const exchangeRequest = await ExchangeRequest.findById(exchangeRequestId);
    if (!exchangeRequest) {
      return res.status(404).json({ success: false, message: "Exchange request not found" });
    }

    if (exchangeRequest.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Exchange must be accepted before scheduling" });
    }

    // Ensure current user is a participant
    const isParticipant =
      exchangeRequest.sender.toString() === req.user._id.toString() ||
      exchangeRequest.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const session = await Session.create({
      exchangeRequest: exchangeRequestId,
      participants: [exchangeRequest.sender, exchangeRequest.receiver],
      scheduledDate,
      scheduledTime,
      duration: duration || 60,
      meetLink: meetLink || "", // Google Meet link provided by user
      topic: topic || "",
      notes: notes || "",
    });

    await session.populate("participants", "name email");

    res.status(201).json({ success: true, message: "Session scheduled", session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sessions for current user
// @route   GET /api/sessions
// @access  Private
const getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatar")
      .populate("exchangeRequest", "senderSkill receiverSkill")
      .sort({ scheduledDate: 1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("participants", "name email avatar")
      .populate("exchangeRequest");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const isParticipant = session.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status or meet link
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    const { status, meetLink, notes } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const isParticipant = session.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (status) session.status = status;
    if (meetLink) session.meetLink = meetLink;
    if (notes) session.notes = notes;

    await session.save();

    // If session completed, mark exchange request as completed too
    if (status === "completed") {
      await ExchangeRequest.findByIdAndUpdate(session.exchangeRequest, {
        status: "completed",
      });
    }

    res.status(200).json({ success: true, message: "Session updated", session });
  } catch (error) {
    next(error);
  }
};

module.exports = { scheduleSession, getMySessions, getSessionById, updateSession };
