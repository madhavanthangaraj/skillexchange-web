// controllers/userController.js
// Handles user profile, skill updates, search, and LMS matching

const User = require("../models/User");
const { findMatches } = require("../utils/matchingEngine");

// @desc    Get all users (for browsing)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
      .select("-password")
      .sort({ lmsScore: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile and skills
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, skillsToTeach, skillsToLearn } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar, skillsToTeach, skillsToLearn },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by skill keyword
// @route   GET /api/users/search?skill=React
// @access  Private
const searchBySkill = async (req, res, next) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({ success: false, message: "Provide a skill query" });
    }

    // Case-insensitive search in skillsToTeach
    const users = await User.find({
      _id: { $ne: req.user._id },
      skillsToTeach: { $regex: skill, $options: "i" },
      isActive: true,
    }).select("-password");

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get LMS-ranked matches for current user
// @route   GET /api/users/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    // Get all active users except current
    const allUsers = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
    }).select("-password");

    // Run LMS matching engine
    const matches = findMatches(req.user, allUsers);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateProfile, searchBySkill, getMatches };
