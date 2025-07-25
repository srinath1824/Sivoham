const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get courses for current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.courses);
});

// Update courses for current user
router.put('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.courses = req.body;
  await user.save();
  res.json(user.courses);
});

// Admin: get courses for any user
router.get('/user/:userId', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.courses);
});

module.exports = router; 