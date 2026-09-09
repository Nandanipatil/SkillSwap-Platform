const express = require('express');
const router = express.Router();
const { getSkills, createSkill, getSkillById } = require('../controllers/skillController');
const protect = require('../middleware/authMiddleware');

router.get('/', getSkills);
router.post('/', protect, createSkill);
router.get('/:id', getSkillById);

module.exports = router;