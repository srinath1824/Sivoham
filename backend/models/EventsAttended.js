const mongoose = require('mongoose');

const EventsAttendedSchema = new mongoose.Schema({
  dateAttended: { type: Date, required: true },
  eventDate: { type: Date, required: true },
  eventName: { type: String, required: true },
  registeredId: { type: String, required: true }
}, { _id: false });

module.exports = EventsAttendedSchema; 