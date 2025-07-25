const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// Create event (admin only)
router.post('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { name, date, description, venue, location, eventType } = req.body;
  if (!name || !date || !description || !venue || !location) return res.status(400).json({ error: 'All fields required' });
  const event = await Event.create({ name, date, description, venue, location, eventType });
  res.json(event);
});

// Update event (admin only)
router.put('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { name, date, description, venue, location, eventType } = req.body;
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { name, date, description, venue, location, eventType },
    { new: true }
  );
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ success: true });
});

module.exports = router; 