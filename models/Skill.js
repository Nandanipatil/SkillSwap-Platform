const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['OFFERED', 'WANTED'], required: true },
    description: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);