const mongoose = require('mongoose');
const TestHistorySchema = require('./TestHistory');

const TestSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  completedCount: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  history: [TestHistorySchema]
}, { _id: false });

module.exports = TestSchema; 