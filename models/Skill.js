const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['offered', 'wanted'], 
        default: 'offered' 
    },
    imageUrl: { 
        type: String, 
        default: '' 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);