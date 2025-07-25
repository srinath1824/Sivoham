const mongoose = require('mongoose');

const EventsRegisteredSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Add ref for populate
  dateRegistered: { type: Date, required: true },
  eventDate: { type: Date, required: true },
  eventName: { type: String, required: true },
  registeredId: { type: String, required: true },
  selected: { type: Boolean, default: false },
  // Added fields for full registration details
  fullName: { type: String },
  mobile: { type: String },
  gender: { type: String },
  age: { type: String },
  address: { type: String },
  sksLevel: { type: String },
  sksMiracle: { type: String },
  forWhom: { type: String },
  profession: { type: String },
  otherDetails: { type: String },
  registrationId: { type: String },
  status: { type: String }
}, { _id: false });

module.exports = EventsRegisteredSchema; 