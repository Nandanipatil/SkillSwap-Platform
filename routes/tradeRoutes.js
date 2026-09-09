const express = require('express');
const router = express.Router();
const { createTrade, getUserTrades, updateTradeStatus } = require('../controllers/tradeController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createTrade);
router.get('/', protect, getUserTrades);
router.put('/:id', protect, updateTradeStatus);

module.exports = router;