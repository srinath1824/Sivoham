const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://sivoham:LIJhKckJrGiNgpQk@sks.8xbkoep.mongodb.net/?retryWrites=true&w=majority&appName=sks'
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 