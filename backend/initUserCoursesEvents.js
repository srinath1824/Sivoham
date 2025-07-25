require('./db')();
// Script to clean up broken event registrations in user documents
const mongoose = require('mongoose');
const User = require('./models/User');

const REQUIRED_FIELDS = [
  'fullName', 'mobile', 'gender', 'age', 'address', 'sksLevel', 'sksMiracle', 'forWhom'
];

async function cleanupRegistrations() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sivoham', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const users = await User.find({ 'events.eventsRegistered.0': { $exists: true } });
  let totalFixed = 0;
  for (const user of users) {
    if (!user.events || !user.events.eventsRegistered) continue;
    const before = user.events.eventsRegistered.length;
    user.events.eventsRegistered = user.events.eventsRegistered.filter(reg =>
      REQUIRED_FIELDS.every(f => reg[f] !== undefined && reg[f] !== null && (typeof reg[f] !== 'string' || reg[f].trim() !== ''))
    );
    const after = user.events.eventsRegistered.length;
    if (after < before) {
      await user.save();
      totalFixed += (before - after);
      console.log(`User ${user.mobile}: removed ${before - after} broken registrations.`);
    }
  }
  console.log(`Cleanup complete. Total broken registrations removed: ${totalFixed}`);
  await mongoose.disconnect();
}

cleanupRegistrations().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});