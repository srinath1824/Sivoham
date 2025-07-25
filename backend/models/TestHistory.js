const mongoose = require('mongoose');
const TestMetricsSchema = require('./TestMetrics');

const TestHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  passed: { type: Boolean, default: false },
  metrics: TestMetricsSchema
}, { _id: false });

module.exports = TestHistorySchema; 