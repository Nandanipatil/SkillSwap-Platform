const Skill = require('../models/Skill');

// Get all skills
exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().populate('user', 'name email');
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new skill
exports.createSkill = async (req, res) => {
    try {
        const { title, category, description } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: "Title and Category are required" });
        }

        const skill = await Skill.create({
            user: req.user.id,
            title,
            category,
            description
        });

        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single skill by ID
exports.getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id).populate('user', 'name email');
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.status(200).json(skill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};