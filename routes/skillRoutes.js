const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/authMiddleware');

// Existing Routes
router.get('/', skillController.getAllSkills);
router.post('/', authMiddleware, skillController.createSkill);

// New Routes for Skill Management
router.put('/:id', authMiddleware, skillController.updateSkill);
router.delete('/:id', authMiddleware, skillController.deleteSkill);

module.exports = router;