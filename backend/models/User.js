const mongoose = require('mongoose');
const CoursesSchema = require('./Courses');
const EventsSchema = require('./Events');

const EventRegistrationSubSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
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
  whatsappSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  comment: { type: String },
  isSelected: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  place: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  preferredLang: { type: String, enum: ['Telugu', 'English'], required: true },
  refSource: { type: String, required: true },
  referrerInfo: { type: String, required: true },
  country: { type: String, required: true },
  profession: { type: String },
  address: { type: String },
  email: { type: String, sparse: true, lowercase: true, trim: true, match: /.+\@.+\..+/ },
  levelCompleted: { type: String },
  whatsappSent: { type: Boolean, default: false },
  courses: CoursesSchema,
  events: EventsSchema,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 