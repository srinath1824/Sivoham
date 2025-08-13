const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all non-admin users (for approval)
router.get('/users', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const users = await User.find({ isAdmin: { $ne: true } });
  res.json(users);
});

// Approve a user (set isSelected to true)
router.post('/user/:id/approve', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findByIdAndUpdate(req.params.id, { isSelected: true }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Reject a user (set isSelected to false and isRejected to true)
router.post('/user/:id/reject', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findByIdAndUpdate(req.params.id, { isSelected: false, isRejected: true }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Bulk approve users
router.post('/users/bulk-approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ error: 'Invalid userIds' });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isAdmin: { $ne: true } },
      { isSelected: true, isRejected: false }
    );
    res.json({ message: `${result.modifiedCount} users approved`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk reject users
router.post('/users/bulk-reject', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ error: 'Invalid userIds' });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isAdmin: { $ne: true } },
      { isSelected: false, isRejected: true }
    );
    res.json({ message: `${result.modifiedCount} users rejected`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
