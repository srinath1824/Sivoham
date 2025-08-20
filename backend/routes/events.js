const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const { checkEventPermission } = require('../middleware/eventPermissions');

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

// Create event (events management permission required)
router.post('/', auth, checkEventPermission('eventsManagement'), async (req, res) => {
  try {
    const { name, date, startTime, endTime, description, venue, location, eventType, registrationDeadline } = req.body;
    if (!name || !date || !description || !venue || !location) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const event = await Event.create({ 
      name, 
      date, 
      startTime: startTime || null,
      endTime: endTime || null,
      description, 
      venue, 
      location, 
      eventType: eventType || 'open',
      registrationDeadline: registrationDeadline || null
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (events management permission required)
router.put('/:id', auth, checkEventPermission('eventsManagement'), async (req, res) => {
  try {
    const { name, date, startTime, endTime, description, venue, location, eventType, messageTemplate, registrationDeadline } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, startTime: startTime || null, endTime: endTime || null, description, venue, location, eventType, messageTemplate, registrationDeadline: registrationDeadline || null },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (events management permission required)
router.delete('/:id', auth, checkEventPermission('eventsManagement'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events for banner (public)
router.get('/upcoming-banner', async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
      date: { $gte: today },
      showScrollBanner: true
    }).sort({ date: 1 }).limit(3);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle scroll banner visibility (events management permission required)
router.patch('/:id/banner', auth, checkEventPermission('eventsManagement'), async (req, res) => {
  try {
    const { showScrollBanner } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { showScrollBanner },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 