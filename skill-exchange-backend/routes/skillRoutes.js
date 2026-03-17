// routes/skillRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  getMySkills,
} = require("../controllers/skillController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/my", getMySkills);         // GET my skill listings
router.route("/")
  .get(getAllSkills)                     // GET all skills
  .post(createSkill);                   // POST create skill

router.route("/:id")
  .get(getSkillById)                    // GET skill by ID
  .put(updateSkill)                     // PUT update skill
  .delete(deleteSkill);                 // DELETE skill

module.exports = router;
