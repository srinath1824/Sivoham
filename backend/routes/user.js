const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const users = await User.find();
  res.json(users);
});

// Get user by id (admin or self)
router.get('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin && req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update user (admin or self)
router.put('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin && req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const update = req.body;
  delete update.password; // Don't allow password update here
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

// Get current user profile
router.get('/me/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router; 