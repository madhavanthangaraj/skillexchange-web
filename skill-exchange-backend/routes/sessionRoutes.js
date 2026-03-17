// routes/sessionRoutes.js
const express = require("express");
const router = express.Router();
const {
  scheduleSession,
  getMySessions,
  getSessionById,
  updateSession,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/")
  .get(getMySessions)       // GET all my sessions
  .post(scheduleSession);   // POST schedule a new session

router.route("/:id")
  .get(getSessionById)      // GET session by ID
  .put(updateSession);      // PUT update status / meet link

module.exports = router;
