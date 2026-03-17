// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const { addReview, getUserReviews, getMyReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", addReview);                        // POST add review
router.get("/my", getMyReviews);                    // GET reviews I wrote
router.get("/user/:userId", getUserReviews);        // GET reviews for a user

module.exports = router;
