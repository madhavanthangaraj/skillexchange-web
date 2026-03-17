// routes/exchangeRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendRequest,
  getMyRequests,
  updateRequestStatus,
  getRequestById,
} = require("../controllers/exchangeController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/")
  .get(getMyRequests)     // GET all sent + received requests
  .post(sendRequest);     // POST send a new exchange request

router.route("/:id")
  .get(getRequestById)            // GET a single request
  .put(updateRequestStatus);      // PUT accept or reject

module.exports = router;
