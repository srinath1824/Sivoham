const mongoose = require('mongoose');

const CourseHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  watchTime: { type: Number, required: true }, // in minutes
  completed: { type: Boolean, default: false }
}, { _id: false });

module.exports = CourseHistorySchema; 