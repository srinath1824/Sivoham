const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sivoham:LIJhKckJrGiNgpQk@sks.8xbkoep.mongodb.net/?retryWrites=true&w=majority&appName=sks';
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB Atlas connection failed:', err.message);
    console.log('Trying local MongoDB fallback...');
    try {
      await mongoose.connect('mongodb://localhost:27017/sivoham', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Local MongoDB connected successfully');
    } catch (localErr) {
      console.error('Local MongoDB also failed:', localErr.message);
      throw err;
    }
  }
};

module.exports = connectDB; 