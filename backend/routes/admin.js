const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (for admin users tab)
router.get('/all-users', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  
  const total = await User.countDocuments({});
  const users = await User.find({}).skip(skip).limit(limit);
  
  const usersWithWhatsapp = users.map(user => {
    const userObj = user.toObject();
    userObj.whatsappSent = userObj.whatsappSent !== undefined ? userObj.whatsappSent : false;
    return userObj;
  });
  res.json({ users: usersWithWhatsapp, total });
});

// Get all non-admin users (for approval)
router.get('/users', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  
  const total = await User.countDocuments({ isAdmin: { $ne: true } });
  const users = await User.find({ isAdmin: { $ne: true } }).skip(skip).limit(limit);
  
  // Ensure whatsappSent field exists for all users
  const usersWithWhatsapp = users.map(user => {
    const userObj = user.toObject();
    userObj.whatsappSent = userObj.whatsappSent !== undefined ? userObj.whatsappSent : false;
    return userObj;
  });
  res.json({ users: usersWithWhatsapp, total });
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

// Toggle WhatsApp sent status for user
router.put('/users/:id/toggle-whatsapp', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.whatsappSent = !user.whatsappSent;
    await user.save();
    
    res.json({ success: true, whatsappSent: user.whatsappSent });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle WhatsApp status' });
  }
});

module.exports = router;
