const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  eventUniqueId: { type: String },
  registrationId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: String, required: true },
  profession: { type: String },
  address: { type: String, required: true },
  sksLevel: { type: String, required: true },
  sksMiracle: { type: String, required: true },
  otherDetails: { type: String },
  forWhom: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema); 