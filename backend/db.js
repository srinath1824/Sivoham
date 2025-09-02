const mongoose = require('mongoose');
require('dotenv').config();

// Sanitization function for logs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return String(input);
  return encodeURIComponent(input).replace(/[\r\n]/g, '');
};

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sivoham';
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', sanitizeForLog(err.message || String(err)));
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', sanitizeForLog(err.message || String(err)));
    console.log('Trying local MongoDB fallback...');
    try {
      await mongoose.connect('mongodb://localhost:27017/sivoham', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Local MongoDB connected successfully');
    } catch (localErr) {
      console.error('Local MongoDB also failed:', sanitizeForLog(localErr.message || String(localErr)));
      throw err;
    }
  }
};

module.exports = connectDB; 