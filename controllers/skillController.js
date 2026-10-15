const Skill = require('../models/Skill');

// Get All Skills
exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Server error fetching skills' });
    }
};

// Create a New Skill
exports.createSkill = async (req, res) => {
    try {
        const { title, category, description, imageUrl } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({ message: 'Title, category, and description are required.' });
        }

        const newSkill = new Skill({
            title,
            category,
            description,
            imageUrl: imageUrl || '',
            user: req.user.id || req.user._id
        });

        const savedSkill = await newSkill.save();
        await savedSkill.populate('user', 'name email');

        res.status(201).json(savedSkill);
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ message: 'Server error creating skill', error: error.message });
    }
};

// Get Single Skill by ID (Optional/If required in route)
exports.getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id).populate('user', 'name email');
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.status(200).json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};