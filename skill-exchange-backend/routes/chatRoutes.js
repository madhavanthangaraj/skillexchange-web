// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.use(protect);

// Chat is scoped to an exchange request
router.route("/:exchangeRequestId")
  .get(getMessages)     // GET full chat history
  .post(sendMessage);   // POST send message (REST fallback)

module.exports = router;
