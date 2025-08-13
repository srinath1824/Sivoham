const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  venue: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: false },
  eventType: { type: String, enum: ['limited', 'unlimited'], required: true, default: 'unlimited' },
  messageTemplate: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema); 