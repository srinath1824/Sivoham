require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

async function seedEvents() {
  const events = [
    {
      name: 'Yoga Workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      description: 'A special yoga workshop for all levels.',
      venue: 'Community Hall',
      location: 'Hyderabad',
      imageUrl: '',
      eventType: 'unlimited',
    },
    {
      name: 'Meditation Retreat',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      description: 'A weekend retreat focused on meditation.',
      venue: 'Retreat Center',
      location: 'Bangalore',
      imageUrl: '',
      eventType: 'limited',
    },
  ];
  await Event.deleteMany({});
  await Event.insertMany(events);
  console.log('Seeded events:', events);
}

async function testConnection() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sivoham'
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected!');

    // Create a sample user
    const sampleUser = new User({
      userId: 'testuser1',
      mobile: '1234567890',
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser1@example.com',
      isAdmin: false
    });
    await sampleUser.save();
    console.log('Sample user created:', sampleUser);

    // Seed events
    await seedEvents();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection(); 