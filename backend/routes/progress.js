const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/progress
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, day, completed, completedAt, watchedSeconds, videoDuration, feedback } = req.body;
    if (!level || !day) return res.status(400).json({ error: 'Level and day are required' });

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Determine level key (e.g., level1, level2, ...)
    const levelKey = `level${level}`;
    if (!user.courses[levelKey]) user.courses[levelKey] = { history: [], feedback: [] };
    if (!user.courses[levelKey].history) user.courses[levelKey].history = [];

    // Find or create the day entry in history
    let dayEntry = user.courses[levelKey].history[day - 1];
    if (!dayEntry) {
      // Fill up to this day with empty entries if needed
      while (user.courses[levelKey].history.length < day - 1) {
        user.courses[levelKey].history.push({ date: null, watchTime: 0, completed: false });
      }
      dayEntry = {
        date: new Date(completedAt || Date.now()),
        watchTime: Math.round((watchedSeconds || 0) / 60),
        completed: !!completed,
        day: day
      };
      if (feedback) {
        dayEntry.feedback = feedback;
      }
      user.courses[levelKey].history[day - 1] = dayEntry;
    } else {
      dayEntry.date = new Date(completedAt || Date.now());
      dayEntry.watchTime = Math.round((watchedSeconds || 0) / 60);
      dayEntry.completed = !!completed;
      dayEntry.day = day;
      if (feedback) {
        dayEntry.feedback = feedback;
      }
    }
    // Optionally handle feedback
    if (feedback) {
      if (!user.courses[levelKey].feedback) user.courses[levelKey].feedback = [];
      user.courses[levelKey].feedback[day - 1] = { comment: feedback, date: new Date() };
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error in /api/progress POST:', err);
    res.status(500).json({ error: err.message || 'Failed to update progress' });
  }
});

// Hardcoded video durations for each day (in seconds)
const VIDEO_DURATIONS = [600, 900, 1200]; // Example: 10, 15, 20 min for 3 days per level
const DAYS_PER_LEVEL = 3;

// GET /api/progress
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Flatten progress for all levels and days
    const progress = [];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const levelKey = `level${lvl}`;
      const level = user.courses[levelKey];
      for (let d = 0; d < DAYS_PER_LEVEL; d++) {
        const day = (level && level.history && level.history[d]) ? level.history[d] : {};
        progress.push({
          level: lvl,
          day: d + 1,
          completed: !!day.completed,
          completedAt: day.date || null,
          watchedSeconds: (day.watchTime || 0) * 60,
          videoDuration: VIDEO_DURATIONS[d % VIDEO_DURATIONS.length],
          feedback: (level && level.feedback && level.feedback[d]) ? level.feedback[d].text : ''
        });
      }
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch progress' });
  }
});

module.exports = router; 