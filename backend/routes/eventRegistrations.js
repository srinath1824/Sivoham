const express = require('express');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkEventPermission } = require('../middleware/eventPermissions');

// Sanitization function for logs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return String(input);
  return encodeURIComponent(input).replace(/[\r\n]/g, '');
};

const router = express.Router();

// POST /api/event-registrations (user registers for event)
router.post('/', async (req, res) => {
  try {
    console.log('Received registration request:', sanitizeForLog(JSON.stringify(req.body))); // Log incoming data
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
    
    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed for this event' });
    }
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
      whatsappSent: false,
      createdAt: now,
      updatedAt: now
    };
    user.events.eventsRegistered.push(regObj);
    await user.save();
    console.log('Saved registration object:', sanitizeForLog(JSON.stringify(regObj))); // Log saved data
    // Return all saved data in the response
    const reg = user.events.eventsRegistered[user.events.eventsRegistered.length - 1];
    res.json({ success: true, registrationId: reg.registeredId, status: reg.status, registration: reg });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to register' });
  }
});

// GET /api/event-registrations (event registrations permission required)
router.get('/', auth, checkEventPermission('eventRegistrations'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ 'events.eventsRegistered.0': { $exists: true } }).populate('events.eventsRegistered.eventId');
    
    // Flatten all registrations with user info
    let allRegs = users.flatMap(user =>
      (user.events.eventsRegistered || []).map(reg => {
        const regObj = reg.toObject ? reg.toObject() : reg;
        // Ensure all required fields are present
        const requiredFields = ['fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom', 'profession', 'otherDetails', 'registeredId', 'registrationId', 'status'];
        requiredFields.forEach(f => {
          if (regObj[f] === undefined || regObj[f] === null || (typeof regObj[f] === 'string' && regObj[f].trim() === '')) {
            regObj[f] = '-';
          }
        });
        // Ensure attended and whatsappSent fields are properly set
        regObj.attended = Boolean(regObj.attended);
        regObj.whatsappSent = Boolean(regObj.whatsappSent);
        return { ...regObj, user: { _id: user._id, fullName: user.firstName + ' ' + user.lastName, mobile: user.mobile } };
      })
    );
    
    // Filter by eventType = limited
    allRegs = allRegs.filter(reg => reg.eventId && reg.eventId.eventType === 'limited');
    
    // Apply filters from query parameters
    if (req.query.event) {
      allRegs = allRegs.filter(reg => reg.eventId && reg.eventId._id.toString() === req.query.event);
    }
    if (req.query.name) {
      allRegs = allRegs.filter(reg => reg.fullName && reg.fullName.toLowerCase().includes(req.query.name.toLowerCase()));
    }
    if (req.query.mobile) {
      allRegs = allRegs.filter(reg => reg.mobile && reg.mobile.toLowerCase().includes(req.query.mobile.toLowerCase()));
    }
    if (req.query.status) {
      allRegs = allRegs.filter(reg => reg.status === req.query.status);
    }
    if (req.query.whatsappSent) {
      const whatsappFilter = req.query.whatsappSent === 'true';
      allRegs = allRegs.filter(reg => Boolean(reg.whatsappSent) === whatsappFilter);
    }
    
    const total = allRegs.length;
    const paginatedRegs = allRegs.slice(skip, skip + limit);
    
    res.json({ registrations: paginatedRegs, total });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch all registrations' });
  }
});

// GET /api/event-registrations/all (event users permission required)
router.get('/all', auth, checkEventPermission('eventUsers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ 'events.eventsRegistered.0': { $exists: true } }).populate('events.eventsRegistered.eventId');
    
    // Flatten all registrations with user info
    let allRegs = users.flatMap(user =>
      (user.events.eventsRegistered || []).map(reg => {
        const regObj = reg.toObject ? reg.toObject() : reg;
        // Ensure all required fields are present
        const requiredFields = ['fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom', 'profession', 'otherDetails', 'registeredId', 'registrationId', 'status'];
        requiredFields.forEach(f => {
          if (regObj[f] === undefined || regObj[f] === null || (typeof regObj[f] === 'string' && regObj[f].trim() === '')) {
            regObj[f] = '-';
          }
        });
        // Ensure attended and whatsappSent fields are properly set
        regObj.attended = Boolean(regObj.attended);
        regObj.whatsappSent = Boolean(regObj.whatsappSent);
        return { ...regObj, user: { _id: user._id, fullName: user.firstName + ' ' + user.lastName, mobile: user.mobile } };
      })
    );
    
    // Apply filters from query parameters
    if (req.query.event) {
      allRegs = allRegs.filter(reg => reg.eventId && reg.eventId._id.toString() === req.query.event);
    }
    if (req.query.name) {
      allRegs = allRegs.filter(reg => reg.fullName && reg.fullName.toLowerCase().includes(req.query.name.toLowerCase()));
    }
    if (req.query.mobile) {
      allRegs = allRegs.filter(reg => reg.mobile && reg.mobile.toLowerCase().includes(req.query.mobile.toLowerCase()));
    }
    if (req.query.status) {
      allRegs = allRegs.filter(reg => reg.status === req.query.status);
    }
    if (req.query.attended) {
      const attendedFilter = req.query.attended === 'yes';
      allRegs = allRegs.filter(reg => Boolean(reg.attended) === attendedFilter);
    }
    if (req.query.attendedBefore) {
      const beforeTime = new Date(req.query.attendedBefore);
      allRegs = allRegs.filter(reg => reg.attended && reg.attendedAt && new Date(reg.attendedAt) <= beforeTime);
    }
    if (req.query.attendedAfter) {
      const afterTime = new Date(req.query.attendedAfter);
      allRegs = allRegs.filter(reg => reg.attended && reg.attendedAt && new Date(reg.attendedAt) >= afterTime);
    }
    
    const total = allRegs.length;
    const paginatedRegs = allRegs.slice(skip, skip + limit);
    
    res.json({ registrations: paginatedRegs, total });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch all registrations' });
  }
});

// GET /api/event-registrations/user/:mobile (fetch all registrations for a user by mobile)
router.get('/user/:mobile', auth, async (req, res) => {
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
      // Ensure attended and whatsappSent fields are properly set
      regObj.attended = Boolean(regObj.attended);
      regObj.whatsappSent = regObj.whatsappSent !== undefined ? Boolean(regObj.whatsappSent) : false;
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

// PUT /api/event-registrations/:id/attend (barcode scanner permission required)
router.put('/:id/attend', auth, checkEventPermission('barcodeScanner'), async (req, res) => {
  try {
    
    const registrationId = req.params.id;
    if (!registrationId || typeof registrationId !== 'string' || registrationId.trim().length === 0) {
      return res.status(400).json({ error: 'Valid registration ID is required' });
    }
    
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': registrationId.trim() });
    if (!user || !user.events || !user.events.eventsRegistered) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    const reg = user.events.eventsRegistered.find(r => r.registrationId === registrationId.trim());
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    if (reg.status !== 'approved') {
      return res.status(400).json({ error: 'Registration must be approved first' });
    }
    
    if (reg.attended) {
      return res.status(400).json({ error: 'Attendance already marked' });
    }
    
    const now = new Date();
    reg.attended = true;
    reg.attendedAt = now;
    reg.updatedAt = now;
    
    // Also add to eventsAttended if not already there
    if (!user.events.eventsAttended) user.events.eventsAttended = [];
    const alreadyAttended = user.events.eventsAttended.find(a => a.eventId?.toString() === reg.eventId?.toString());
    if (!alreadyAttended) {
      user.events.eventsAttended.push({
        eventId: reg.eventId,
        registeredId: reg.registrationId,
        eventName: reg.eventName,
        eventDate: reg.eventDate,
        dateAttended: now
      });
    }
    
    await user.save();
    res.json({ success: true, message: `Attendance marked for ${reg.fullName}`, attendedAt: now });
  } catch (err) {
    console.error('Mark attendance error:', sanitizeForLog(err.message || String(err)));
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// POST /api/event-registrations/bulk-approve (event registrations permission required)
router.post('/bulk-approve', auth, checkEventPermission('eventRegistrations'), async (req, res) => {
  try {
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

// POST /api/event-registrations/bulk-reject (event registrations permission required)
router.post('/bulk-reject', auth, checkEventPermission('eventRegistrations'), async (req, res) => {
  try {
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

// PUT /api/event-registrations/:id/toggle-whatsapp (event users permission required)
router.put('/:id/toggle-whatsapp', auth, checkEventPermission('eventUsers'), async (req, res) => {
  try {
    
    // Get current value and toggle
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const reg = user.events.eventsRegistered.find(r => r.registrationId === req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    
    const newValue = !Boolean(reg.whatsappSent);
    
    // Simple positional update
    const result = await User.updateOne(
      { 
        _id: user._id,
        'events.eventsRegistered.registrationId': req.params.id 
      },
      { 
        $set: { 'events.eventsRegistered.$.whatsappSent': newValue }
      }
    );
    
    console.log(`Toggle result for ${sanitizeForLog(req.params.id)}:`, sanitizeForLog(JSON.stringify(result)));
    res.json({ success: true, whatsappSent: newValue });
  } catch (err) {
    console.error('Toggle error:', sanitizeForLog(err.message || String(err)));
    res.status(500).json({ error: err.message });
  }
});

// GET /api/event-registrations/export (event users permission required)
router.get('/export', auth, checkEventPermission('eventUsers'), async (req, res) => {
  try {
    const users = await User.find({ 'events.eventsRegistered.0': { $exists: true } }).populate('events.eventsRegistered.eventId');
    
    // Flatten all registrations with user info
    let allRegs = users.flatMap(user =>
      (user.events.eventsRegistered || []).map(reg => {
        const regObj = reg.toObject ? reg.toObject() : reg;
        // Ensure all required fields are present
        const requiredFields = ['fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom', 'profession', 'otherDetails', 'registeredId', 'registrationId', 'status'];
        requiredFields.forEach(f => {
          if (regObj[f] === undefined || regObj[f] === null || (typeof regObj[f] === 'string' && regObj[f].trim() === '')) {
            regObj[f] = '-';
          }
        });
        // Ensure attended and whatsappSent fields are properly set
        regObj.attended = Boolean(regObj.attended);
        regObj.whatsappSent = Boolean(regObj.whatsappSent);
        return { ...regObj, user: { _id: user._id, fullName: user.firstName + ' ' + user.lastName, mobile: user.mobile } };
      })
    );
    
    // Apply filters from query parameters (same as /all endpoint)
    if (req.query.event) {
      allRegs = allRegs.filter(reg => reg.eventId && reg.eventId._id.toString() === req.query.event);
    }
    if (req.query.name) {
      allRegs = allRegs.filter(reg => reg.fullName && reg.fullName.toLowerCase().includes(req.query.name.toLowerCase()));
    }
    if (req.query.mobile) {
      allRegs = allRegs.filter(reg => reg.mobile && reg.mobile.toLowerCase().includes(req.query.mobile.toLowerCase()));
    }
    if (req.query.status) {
      allRegs = allRegs.filter(reg => reg.status === req.query.status);
    }
    if (req.query.attended) {
      const attendedFilter = req.query.attended === 'yes';
      allRegs = allRegs.filter(reg => Boolean(reg.attended) === attendedFilter);
    }
    if (req.query.attendedBefore) {
      const beforeTime = new Date(req.query.attendedBefore);
      allRegs = allRegs.filter(reg => reg.attended && reg.attendedAt && new Date(reg.attendedAt) <= beforeTime);
    }
    if (req.query.attendedAfter) {
      const afterTime = new Date(req.query.attendedAfter);
      allRegs = allRegs.filter(reg => reg.attended && reg.attendedAt && new Date(reg.attendedAt) >= afterTime);
    }
    
    res.json({ registrations: allRegs, total: allRegs.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to export registrations' });
  }
});

// Check what's actually in database
router.get('/check-whatsapp/:id', auth, checkEventPermission('eventUsers'), async (req, res) => {
  try {
    const user = await User.findOne({ 'events.eventsRegistered.registrationId': req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const reg = user.events.eventsRegistered.find(r => r.registrationId === req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    
    res.json({ 
      registrationId: req.params.id,
      whatsappSent: reg.whatsappSent,
      fullRegistration: reg
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 