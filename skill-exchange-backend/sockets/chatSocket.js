// sockets/chatSocket.js
// Real-time chat using Socket.IO
// Each exchange request gets its own "room"

const Message = require("../models/Message");
const ExchangeRequest = require("../models/ExchangeRequest");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const initSocket = (io) => {
  // ─── Middleware: Authenticate socket connection via JWT ───────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ─── Connection Handler ───────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.user._id})`);

    // ── Join a chat room for a specific exchange request ──────────────────
    // Client emits: { exchangeRequestId }
    socket.on("joinRoom", async ({ exchangeRequestId }) => {
      try {
        // Verify this exchange exists and user is a participant
        const exchange = await ExchangeRequest.findById(exchangeRequestId);
        if (!exchange) {
          socket.emit("error", { message: "Exchange request not found" });
          return;
        }

        const isParticipant =
          exchange.sender.toString() === socket.user._id.toString() ||
          exchange.receiver.toString() === socket.user._id.toString();

        if (!isParticipant) {
          socket.emit("error", { message: "Not authorized for this chat" });
          return;
        }

        // Join the room named by exchange request ID
        socket.join(exchangeRequestId);
        console.log(`📥 ${socket.user.name} joined room: ${exchangeRequestId}`);

        socket.emit("joinedRoom", { exchangeRequestId, message: "Joined chat room" });
      } catch (err) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ── Send a message ────────────────────────────────────────────────────
    // Client emits: { exchangeRequestId, content }
    socket.on("sendMessage", async ({ exchangeRequestId, content }) => {
      try {
        if (!content || !content.trim()) {
          socket.emit("error", { message: "Message content is empty" });
          return;
        }

        const exchange = await ExchangeRequest.findById(exchangeRequestId);
        if (!exchange) {
          socket.emit("error", { message: "Exchange not found" });
          return;
        }

        if (exchange.status !== "accepted" && exchange.status !== "completed") {
          socket.emit("error", { message: "Exchange must be accepted to chat" });
          return;
        }

        // Find receiver
        const receiverId =
          exchange.sender.toString() === socket.user._id.toString()
            ? exchange.receiver
            : exchange.sender;

        // Save message to MongoDB
        const message = await Message.create({
          exchangeRequest: exchangeRequestId,
          sender: socket.user._id,
          receiver: receiverId,
          content: content.trim(),
        });

        // Populate sender info
        await message.populate("sender", "name avatar");

        // Broadcast to everyone in the room (including sender)
        io.to(exchangeRequestId).emit("newMessage", {
          _id: message._id,
          exchangeRequest: exchangeRequestId,
          sender: message.sender,
          content: message.content,
          isRead: message.isRead,
          createdAt: message.createdAt,
        });

        console.log(`💬 Message from ${socket.user.name} in room ${exchangeRequestId}`);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Typing indicator ──────────────────────────────────────────────────
    socket.on("typing", ({ exchangeRequestId }) => {
      socket.to(exchangeRequestId).emit("userTyping", {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on("stopTyping", ({ exchangeRequestId }) => {
      socket.to(exchangeRequestId).emit("userStoppedTyping", {
        userId: socket.user._id,
      });
    });

    // ── Leave room ────────────────────────────────────────────────────────
    socket.on("leaveRoom", ({ exchangeRequestId }) => {
      socket.leave(exchangeRequestId);
      console.log(`📤 ${socket.user.name} left room: ${exchangeRequestId}`);
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = initSocket;
