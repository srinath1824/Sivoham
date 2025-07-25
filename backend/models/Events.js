const mongoose = require('mongoose');
const EventsRegisteredSchema = require('./EventsRegistered');
const EventsAttendedSchema = require('./EventsAttended');

const EventsSchema = new mongoose.Schema({
  eventsRegistered: [EventsRegisteredSchema],
  eventsAttended: [EventsAttendedSchema]
}, { _id: false });

module.exports = EventsSchema; 