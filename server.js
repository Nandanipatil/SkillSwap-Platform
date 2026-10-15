require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. MONGODB DATABASE CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

// ==========================================
// 3. API ROUTES (Must be defined BEFORE wildcard/fallback route)
// ==========================================

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SkillSwap API is running' });
});

// --- Auth Routes Placeholder ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    res.status(200).json({ success: true, message: 'Login successful', token: 'sample-jwt-token' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Skill Swap Request Routes ---
app.get('/api/trades', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, requester: 'Rahul', skillOffered: 'Node.js', skillRequested: 'UI/UX Design', status: 'pending' },
      { id: 2, requester: 'Priya', skillOffered: 'Python', skillRequested: 'React.js', status: 'accepted' }
    ]
  });
});

app.post('/api/trades/request', (req, res) => {
  const { targetUserId, offeredSkill, requestedSkill } = req.body;
  if (!targetUserId || !offeredSkill || !requestedSkill) {
    return res.status(400).json({ success: false, message: 'Invalid trade data' });
  }
  res.status(201).json({ success: true, message: 'Trade request sent successfully!' });
});

// ==========================================
// 4. FRONTEND SPA CATCH-ALL ROUTE (Must be LAST among routes)
// ==========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 5. GLOBAL ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Server running at http://localhost:${PORT}`);
});