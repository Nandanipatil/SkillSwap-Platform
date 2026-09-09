const Trade = require('../models/Trade');
const Skill = require('../models/Skill');

// Create Trade Request
exports.createTrade = async (req, res) => {
    try {
        const { skillId, skill, message } = req.body;
        const targetSkillId = skillId || skill;

        if (!targetSkillId) {
            return res.status(400).json({ message: "Skill ID is required" });
        }

        const requestedSkill = await Skill.findById(targetSkillId);
        if (!requestedSkill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Prevent self-trade request
        if (requestedSkill.user && requestedSkill.user.toString() === req.user.id) {
            return res.status(400).json({ message: "You cannot request a trade for your own skill" });
        }

        const trade = await Trade.create({
            sender: req.user.id,
            receiver: requestedSkill.user,
            skill: targetSkillId,
            message: message || ""
        });

        res.status(201).json({ message: "Trade request sent successfully", trade });
    } catch (error) {
        console.error("Trade Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get User's Trades
exports.getUserTrades = async (req, res) => {
    try {
        const trades = await Trade.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .populate('skill', 'title category');

        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Trade Status
exports.updateTradeStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ message: "Trade not found" });
        }

        if (trade.receiver.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this trade" });
        }

        trade.status = status;
        await trade.save();

        res.status(200).json({ message: `Trade ${status} successfully`, trade });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};