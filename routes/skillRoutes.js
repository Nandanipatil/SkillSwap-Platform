const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/authMiddleware'); // Agar middleware use ho raha ho

// Get all skills
router.get('/', skillController.getSkills);

// Get single skill by ID
router.get('/:id', skillController.getSkillById);

// Create new skill (Protected Route)
router.post('/', authMiddleware, skillController.createSkill);

module.exports = router;