const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../db');

async function migrateHistoryDaysAndFeedback() {
  await connectDB();
  const users = await User.find({});
  let updatedCount = 0;
  for (const user of users) {
    let changed = false;
    if (user.courses) {
      for (let lvl = 1; lvl <= 5; lvl++) {
        const levelKey = `level${lvl}`;
        const level = user.courses[levelKey];
        if (level && Array.isArray(level.history)) {
          for (let i = 0; i < level.history.length; i++) {
            const entry = level.history[i];
            if (entry) {
              // Set day field
              if (entry.day !== i + 1) {
                entry.day = i + 1;
                changed = true;
              }
              // Set feedback field if feedback exists for this day
              if (Array.isArray(level.feedback) && level.feedback[i] && level.feedback[i].comment) {
                if (entry.feedback !== level.feedback[i].comment) {
                  entry.feedback = level.feedback[i].comment;
                  changed = true;
                }
              }
            }
          }
        }
      }
    }
    if (changed) {
      await user.save();
      updatedCount++;
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} users.`);
  process.exit(0);
}

migrateHistoryDaysAndFeedback().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 