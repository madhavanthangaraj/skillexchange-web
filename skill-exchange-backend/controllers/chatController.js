// controllers/chatController.js
// Handles fetching chat history between exchange users

const Message = require("../models/Message");
const ExchangeRequest = require("../models/ExchangeRequest");

// @desc    Get chat messages for a specific exchange request
// @route   GET /api/chat/:exchangeRequestId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { exchangeRequestId } = req.params;

    // Verify this exchange exists and user is a participant
    const exchange = await ExchangeRequest.findById(exchangeRequestId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange not found" });
    }

    const isParticipant =
      exchange.sender.toString() === req.user._id.toString() ||
      exchange.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const messages = await Message.find({ exchangeRequest: exchangeRequestId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 }); // Oldest first

    // Mark messages as read
    await Message.updateMany(
      { exchangeRequest: exchangeRequestId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via REST (fallback if socket not available)
// @route   POST /api/chat/:exchangeRequestId
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { exchangeRequestId } = req.params;
    const { content } = req.body;

    const exchange = await ExchangeRequest.findById(exchangeRequestId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: "Exchange not found" });
    }

    // Only accepted exchanges can chat
    if (exchange.status !== "accepted" && exchange.status !== "completed") {
      return res.status(400).json({ success: false, message: "Exchange must be accepted to chat" });
    }

    const isParticipant =
      exchange.sender.toString() === req.user._id.toString() ||
      exchange.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Determine the receiver
    const receiverId =
      exchange.sender.toString() === req.user._id.toString()
        ? exchange.receiver
        : exchange.sender;

    const message = await Message.create({
      exchangeRequest: exchangeRequestId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await message.populate("sender", "name avatar");

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };
