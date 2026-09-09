const Skill = require('../models/Skill');

// Get All Skills (For Home Page / Search & Filter)
exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Server error while fetching skills' });
    }
};

// Create New Skill
exports.createSkill = async (req, res) => {
    try {
        const { title, category, description } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newSkill = new Skill({
            title,
            category,
            description,
            user: req.user.id
        });

        const savedSkill = await newSkill.save();
        res.status(201).json(savedSkill);
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ message: 'Server error while creating skill' });
    }
};

// Update Skill (Edit Skill)
exports.updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // Verify Ownership: Check if the skill belongs to the logged-in user
        if (skill.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        const { title, category, description } = req.body;

        skill.title = title || skill.title;
        skill.category = category || skill.category;
        skill.description = description || skill.description;

        const updatedSkill = await skill.save();
        res.json({ message: 'Skill updated successfully', skill: updatedSkill });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ message: 'Server error while updating skill' });
    }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // Verify Ownership: Check if the skill belongs to the logged-in user
        if (skill.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        await skill.deleteOne();
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Server error while deleting skill' });
    }
};