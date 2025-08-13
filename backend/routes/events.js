const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    
    if (page && limit) {
      const skip = (page - 1) * limit;
      const total = await Event.countDocuments({});
      const events = await Event.find().sort({ date: 1 }).skip(skip).limit(limit);
      res.json({ events, total });
    } else {
      const events = await Event.find().sort({ date: 1 });
      res.json(events);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { name, date, description, venue, location, eventType } = req.body;
    if (!name || !date || !description || !venue || !location) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const event = await Event.create({ 
      name, 
      date, 
      description, 
      venue, 
      location, 
      eventType: eventType || 'open' 
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { name, date, description, venue, location, eventType, messageTemplate } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, description, venue, location, eventType, messageTemplate },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 