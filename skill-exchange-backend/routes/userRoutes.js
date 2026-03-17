// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateProfile,
  searchBySkill,
  getMatches,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/", getAllUsers);           // GET all users
router.get("/matches", getMatches);     // GET LMS-matched users for current user
router.get("/search", searchBySkill);   // GET /search?skill=React
router.get("/:id", getUserById);        // GET user by ID
router.put("/profile", updateProfile);  // PUT update own profile

module.exports = router;
