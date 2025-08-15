const mongoose = require('mongoose');

const CourseHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  watchTime: { type: Number, required: true }, // in minutes
  completed: { type: Boolean, default: false },
  watchedSeconds: { type: Number, default: 0 }, // in seconds
  videoDuration: { type: Number, default: 0 }, // in seconds
  dayGapMs: { type: Number, default: 0 } // gap from previous day in milliseconds
}, { _id: false });

module.exports = CourseHistorySchema; 