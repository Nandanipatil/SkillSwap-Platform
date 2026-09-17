const Skill = require('../models/Skill');
const axios = require('axios');

// 1. Get all skills with AI Match Score
exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find().populate('user', 'name email skills');
        const currentUser = req.user;

        if (currentUser && currentUser.skills && currentUser.skills.length > 0) {
            const updatedSkills = await Promise.all(skills.map(async (skill) => {
                const skillObj = skill.toObject();
                
                try {
                    const aiResponse = await axios.post('http://localhost:8000/api/calculate-match', {
                        user_skills: currentUser.skills,
                        target_skills: [skill.title, skill.category, skill.description]
                    });

                    skillObj.matchScore = aiResponse.data.match_score || 0;
                } catch (aiErr) {
                    skillObj.matchScore = 0;
                }

                return skillObj;
            }));

            return res.json(updatedSkills);
        }

        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// 2. Create Skill
exports.createSkill = async (req, res) => {
    try {
        const { title, category, description, imageUrl } = req.body;
        const newSkill = new Skill({
            title,
            category,
            description,
            imageUrl,
            user: req.user.id
        });

        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// 3. Update Skill
exports.updateSkill = async (req, res) => {
    try {
        let skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        if (skill.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        skill = await Skill.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(skill);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// 4. Delete Skill
exports.deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        if (skill.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};