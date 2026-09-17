const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const jwt = require('jsonwebtoken');

// Auth Middleware Definition
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

// Optional Auth Middleware for GET /
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = decoded;
        } catch (err) {
            req.user = null;
        }
    }
    next();
};

// Routes
router.get('/', optionalAuth, skillController.getAllSkills);
router.post('/', authMiddleware, skillController.createSkill);
router.put('/:id', authMiddleware, skillController.updateSkill);
router.delete('/:id', authMiddleware, skillController.deleteSkill);

module.exports = router;