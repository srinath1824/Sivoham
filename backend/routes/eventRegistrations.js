const express = require('express');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/event-registrations (user registers for event)
router.post('/', async (req, res) => {
  try {
    console.log('Received registration request:', req.body); // Log incoming data
    const {
      eventId, fullName, mobile, gender, age, profession, address, sksLevel, sksMiracle, otherDetails, forWhom
    } = req.body;
    // Strict validation for required fields
    const requiredFields = { eventId, fullName, mobile, gender, age, address, sksLevel, sksMiracle, forWhom };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    // Generate registrationId: SKS-<DAY><MONTH><YEAR><6digit>
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const unique = Math.floor(100000 + Math.random() * 900000); // 6 digits
    const registrationId = `SKS-${day}${month}${year}-${unique}`;
    // Find or create user by mobile
    let user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ error: 'User not found for this mobile' });
    // Ensure events object exists
    if (!user.events) user.events = { eventsRegistered: [], eventsAttended: [] };
    // Push registration to user's events.eventsRegistered
    const regObj = {
      eventId,
      registeredId: registrationId,
      registrationId: registrationId,
      eventName: event.name,
      eventDate: event.date,
      dateRegistered: now,
      status: event.eventType === 'unlimited' ? 'approved' : 'pending',
      fullName,
      mobile,
      gender,
      age,
      profession: profession && profession.trim() !== '' ? profession : null,
      address,
      sksLevel,
      sksMiracle,
      otherDetails: otherDetails && otherDetails.trim() !== '' ? otherDetails : null,
      forWhom,
      createdAt: now,
      updatedAt: now
    };
    user.events.eventsRegistered.push(regObj);
    await user.save();
    console.log('Saved registration object:', regObj); // Log saved data
    // Return all saved data in the response
    const reg = user.events.eventsRegistered[user.events.eventsRegistered.length - 1];
    res.json({ success: true, registrationId: reg.registeredId, status: reg.status, registration: reg });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to register' });
  }
});

// GET /api/event-registrations (admin views all registrations)
router.get('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const users = await User.find({ 'events.eventsRegistered.0': { $exists: true } }).populate('events.eventsRegistered.eventId');
    // Flatten all registrations with user info
    const allRegs = users.flatMap(user =>
      (user.events.eventsRegistered || []).map(reg => {
        const regObj = reg.toObject ? reg.toObject() : reg;
        // Ensure all required fields are present
        const requiredFields = ['fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom', 'profession', 'otherDetails', 'registeredId', 'registrationId', 'status'];
        requiredFields.forEach(f => {
          if (regObj[f] === undefined || regObj[f] === null || (typeof regObj[f] === 'string' && regObj[f].trim() === '')) {
            regObj[f] = '-';
          }
        });
        // Ensure attended field is properly set
        regObj.attended = Boolean(regObj.attended);
        return { ...regObj, user: { _id: user._id, fullName: user.firstName + ' ' + user.lastName, mobile: user.mobile } };
      })
    );
    res.json(allRegs);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch all registrations' });
  }
});

// GET /api/event-registrations/user/:mobile (fetch all registrations for a user by mobile)
router.get('/user/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    if (!mobile) return res.status(400).json({ error: 'Mobile is required' });
    const user = await User.findOne({ mobile }).populate('events.eventsRegistered.eventId');
    if (!user || !user.events) return res.json([]);
    // Ensure all required fields are present for each registration
    const regs = (user.events.eventsRegistered || []).map(reg => {
      const regObj = reg.toObject ? reg.toObject() : reg;
      const requiredFields = ['fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom', 'profession', 'otherDetails', 'registeredId', 'registrationId', 'status'];
      requiredFields.forEach(f => {
        if (regObj[f] === undefined || regObj[f] === null || (typeof regObj[f] === 'string' && regObj[f].trim() === '')) {
          regObj[f] = '-';
        }
      });
      // Ensure attended field is properly set
      regObj.attended = Boolean(regObj.attended);
      return regObj;
    });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch registrations' });
  }
});

// PUT /api/event-registrations/:id/approve (admin approves)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Find the user and registration by registrationId
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': req.params.id });
    if (!user || !user.events) return res.status(404).json({ error: 'Registration not found' });
    const reg = (user.events.eventsRegistered || []).find(r => r.registrationId === req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    reg.status = 'approved';
    reg.updatedAt = new Date();
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to approve registration' });
  }
});

// PUT /api/event-registrations/:id/reject (admin rejects)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': req.params.id });
    if (!user || !user.events) return res.status(404).json({ error: 'Registration not found' });
    const reg = (user.events.eventsRegistered || []).find(r => r.registrationId === req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    reg.status = 'rejected';
    reg.updatedAt = new Date();
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reject registration' });
  }
});

// PUT /api/event-registrations/:id/attend (mark attendance)
router.put('/:id/attend', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': req.params.id });
    if (!user || !user.events) return res.status(404).json({ error: 'Registration not found' });
    
    const reg = (user.events.eventsRegistered || []).find(r => r.registrationId === req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    
    if (reg.status !== 'approved') {
      return res.status(400).json({ error: 'Registration must be approved first' });
    }
    
    if (reg.attended) {
      return res.status(400).json({ error: 'Attendance already marked' });
    }
    
    reg.attended = true;
    reg.attendedAt = new Date();
    reg.updatedAt = new Date();
    
    // Also add to eventsAttended if not already there
    if (!user.events.eventsAttended) user.events.eventsAttended = [];
    const alreadyAttended = user.events.eventsAttended.find(a => a.eventId?.toString() === reg.eventId?.toString());
    if (!alreadyAttended) {
      user.events.eventsAttended.push({
        eventId: reg.eventId,
        registeredId: reg.registrationId,
        eventName: reg.eventName,
        eventDate: reg.eventDate,
        dateAttended: new Date()
      });
    }
    
    await user.save();
    res.json({ success: true, message: `Attendance marked for ${reg.fullName}` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to mark attendance' });
  }
});

// POST /api/event-registrations/bulk-approve (admin bulk approves)
router.post('/bulk-approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { registrationIds } = req.body;
    if (!registrationIds || !Array.isArray(registrationIds)) return res.status(400).json({ error: 'Invalid registrationIds' });
    
    let modifiedCount = 0;
    for (const regId of registrationIds) {
      const user = await User.findOne({ 'events.eventsRegistered.registrationId': regId });
      if (user && user.events) {
        const reg = user.events.eventsRegistered.find(r => r.registrationId === regId);
        if (reg) {
          reg.status = 'approved';
          reg.updatedAt = new Date();
          await user.save();
          modifiedCount++;
        }
      }
    }
    res.json({ message: `${modifiedCount} registrations approved`, modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/event-registrations/bulk-reject (admin bulk rejects)
router.post('/bulk-reject', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { registrationIds } = req.body;
    if (!registrationIds || !Array.isArray(registrationIds)) return res.status(400).json({ error: 'Invalid registrationIds' });
    
    let modifiedCount = 0;
    for (const regId of registrationIds) {
      const user = await User.findOne({ 'events.eventsRegistered.registrationId': regId });
      if (user && user.events) {
        const reg = user.events.eventsRegistered.find(r => r.registrationId === regId);
        if (reg) {
          reg.status = 'rejected';
          reg.updatedAt = new Date();
          await user.save();
          modifiedCount++;
        }
      }
    }
    res.json({ message: `${modifiedCount} registrations rejected`, modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 