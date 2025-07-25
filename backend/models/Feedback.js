const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  comment: { type: String, trim: true }
}, { _id: false });

module.exports = FeedbackSchema; 