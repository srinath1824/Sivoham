const mongoose = require('mongoose');
const CourseHistorySchema = require('./CourseHistory');
const FeedbackSchema = require('./Feedback');

const CourseLevelSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  completedCount: { type: Number, default: 0 },
  history: [CourseHistorySchema],
  feedback: [FeedbackSchema],
  dailyProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

module.exports = CourseLevelSchema; 