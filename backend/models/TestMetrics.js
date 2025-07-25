const mongoose = require('mongoose');

const TestMetricsSchema = new mongoose.Schema({
  meditationTestMinMinutes: Number,
  meditationTestMinClosedPct: Number,
  meditationTestMaxHeadMoveFactor: Number,
  meditationTestMaxHandMoveFactor: Number,
  meditationTestMinHandStability: Number
}, { _id: false });

module.exports = TestMetricsSchema; 