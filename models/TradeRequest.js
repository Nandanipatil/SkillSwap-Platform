const mongoose = require('mongoose');

const tradeRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    offeredSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    message: {
        type: String,
        default: 'I would like to swap skills with you!'
    }
}, { timestamps: true });

module.exports = mongoose.model('TradeRequest', tradeRequestSchema);