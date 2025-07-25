const mongoose = require('mongoose');
const CourseLevelSchema = require('./CourseLevel');
const TestSchema = require('./Test');

const CoursesSchema = new mongoose.Schema({
  level1: CourseLevelSchema,
  level2: CourseLevelSchema,
  test: TestSchema,
  level3: CourseLevelSchema,
  level4: CourseLevelSchema,
  level5: CourseLevelSchema
}, { _id: false });

module.exports = CoursesSchema; 