// controllers/skillController.js
// CRUD operations for skill listings

const Skill = require("../models/Skill");

// @desc    Create a skill listing
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({ ...req.body, user: req.user._id });
    await skill.populate("user", "name email");
    res.status(201).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active skill listings
// @route   GET /api/skills
// @access  Private
const getAllSkills = async (req, res, next) => {
  try {
    const { category, level } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (level) filter.level = level;

    const skills = await Skill.find(filter)
      .populate("user", "name email rating avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Private
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate("user", "name email rating avatar bio");
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    res.status(200).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own skill listing
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    // Only owner can update
    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own skill listing
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await skill.deleteOne();
    res.status(200).json({ success: true, message: "Skill deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skills of current user
// @route   GET /api/skills/my
// @access  Private
const getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id });
    res.status(200).json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSkill, getAllSkills, getSkillById, updateSkill, deleteSkill, getMySkills };
