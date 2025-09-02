const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Sanitization function for logs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return String(input);
  return encodeURIComponent(input).replace(/[\r\n]/g, '');
};

// Safe object property assignment to prevent prototype pollution
const safeAssign = (obj, key, value) => {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return false;
  }
  if (obj.hasOwnProperty(key) || !key.includes('__')) {
    obj[key] = value;
    return true;
  }
  return false;
};

const router = express.Router();

// POST /api/progress
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Progress API - User ID:', sanitizeForLog(userId));
    console.log('Progress API - Request body:', sanitizeForLog(JSON.stringify(req.body)));
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const { level, day, completed, completedAt, watchedSeconds, videoDuration, feedback } = req.body;
    
    if (!level || !day) {
      return res.status(400).json({ error: 'Level and day are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize courses if not exists
    if (!user.courses) {
      user.courses = {};
    }

    const levelKey = `level${level}`;
    if (!user.courses[levelKey]) {
      user.courses[levelKey] = {
        completed: false,
        completedCount: 0,
        history: [],
        feedback: [],
        dailyProgress: {}
      };
    }

    // Initialize dailyProgress if not exists
    if (!user.courses[levelKey].dailyProgress) {
      user.courses[levelKey].dailyProgress = {};
    }

    // Ensure history array exists and has enough slots
    if (!user.courses[levelKey].history) {
      user.courses[levelKey].history = [];
    }

    // Fill missing days with empty entries
    while (user.courses[levelKey].history.length < day) {
      user.courses[levelKey].history.push({
        date: new Date(),
        watchTime: 0,
        completed: false,
        watchedSeconds: 0,
        videoDuration: 0,
        dayGapMs: 0
      });
    }

    // Update the specific day entry in history
    const dayIndex = day - 1;
    const currentDate = new Date(completedAt || Date.now());
    const previousDay = dayIndex > 0 ? user.courses[levelKey].history[dayIndex - 1] : null;
    const dayGap = previousDay ? currentDate.getTime() - new Date(previousDay.date).getTime() : 0;
    
    user.courses[levelKey].history[dayIndex] = {
      date: currentDate,
      watchTime: Math.round((watchedSeconds || 0) / 60), // Convert to minutes
      completed: !!completed,
      watchedSeconds: watchedSeconds || 0,
      videoDuration: videoDuration || 0,
      dayGapMs: dayGap
    };

    // Update dailyProgress object with safe assignment
    const dayKey = `day${day}`;
    const percentage = videoDuration > 0 ? Math.round((watchedSeconds / videoDuration) * 100) : 0;
    const dayGapHours = Math.round(dayGap / (1000 * 60 * 60) * 100) / 100; // Convert to hours with 2 decimal places
    
    // Safe assignment to prevent prototype pollution
    if (safeAssign(user.courses[levelKey].dailyProgress, dayKey, {})) {
      user.courses[levelKey].dailyProgress[dayKey] = {
        watchTime: Math.round((watchedSeconds || 0) / 60), // in minutes
        watchedSeconds: watchedSeconds || 0, // capture exact watched seconds
        percentage: percentage,
        date: currentDate,
        completedAt: completedAt || Date.now(), // capture exact completion timestamp
        completed: !!completed,
        dayGapMs: dayGap,
        dayGapHours: dayGapHours
      };
    }

    // Handle feedback
    if (feedback) {
      if (!user.courses[levelKey].feedback) {
        user.courses[levelKey].feedback = [];
      }
      while (user.courses[levelKey].feedback.length < day) {
        user.courses[levelKey].feedback.push(null);
      }
      user.courses[levelKey].feedback[dayIndex] = {
        comment: feedback,
        date: new Date()
      };
    }

    // Update level completion status
    const expectedDaysPerLevel = 3; // From courseConfig.daysPerLevel
    const completedDays = user.courses[levelKey].history.filter(h => h && h.completed).length;
    
    // Mark level as completed if all expected days are completed
    if (completedDays >= expectedDaysPerLevel) {
      user.courses[levelKey].completed = true;
      user.courses[levelKey].completedCount = completedDays;
    } else {
      user.courses[levelKey].completed = false;
    }

    await user.save();
    
    // Calculate comprehensive levelDetails for response
    const levelDetails = {};
    let totalWatchTime = 0;
    let currentLevel = 'Not Started';
    let completedLevels = 0;
    let lastCompletedAt = null;
    
    // Process all levels
    for (let lvl = 1; lvl <= 5; lvl++) {
      const lKey = `level${lvl}`;
      if (user.courses[lKey]) {
        const levelWatchTime = user.courses[lKey].history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
        totalWatchTime += levelWatchTime;
        
        levelDetails[lKey] = {
          completed: user.courses[lKey].completed || false,
          watchTime: levelWatchTime,
          completedCount: user.courses[lKey].completedCount || 0,
          lastWatched: user.courses[lKey].history?.length > 0 
            ? user.courses[lKey].history[user.courses[lKey].history.length - 1].date 
            : null,
          dailyProgress: user.courses[lKey].dailyProgress || {},
          totalDays: user.courses[lKey].history?.length || 0
        };
        
        if (user.courses[lKey].completed) {
          currentLevel = `Level ${lvl} Completed`;
          completedLevels = lvl;
          lastCompletedAt = levelDetails[lKey].lastWatched;
        }
      }
    }
    
    // Get meditation test data
    let meditationTest = null;
    if (user.courses?.test) {
      const testData = user.courses.test;
      const latestTest = testData.history && testData.history.length > 0 
        ? testData.history[testData.history.length - 1] 
        : null;
      
      meditationTest = {
        completed: testData.completed || false,
        passed: testData.passed || false,
        attempts: testData.completedCount || 0,
        lastAttempt: latestTest ? {
          date: latestTest.date,
          passed: latestTest.passed,
          eyeClosedPercent: latestTest.eyeClosedPercent || 0,
          headMovement: latestTest.headMovement || 0,
          handStability: latestTest.handStability || 0,
          duration: latestTest.duration || 0
        } : null
      };
      
      if (testData.completed) {
        currentLevel = 'Test Completed';
        lastCompletedAt = latestTest?.date || lastCompletedAt;
      }
    }
    
    const courseProgress = {
      currentLevel,
      completedLevels,
      level4Completed: completedLevels >= 4,
      lastCompletedAt,
      totalWatchTime,
      levelDetails,
      meditationTest
    };
    
    res.json({ 
      success: true, 
      message: 'Progress updated successfully',
      levelCompleted: user.courses[levelKey].completed,
      completedDays: completedDays,
      totalDays: user.courses[levelKey].history.length,
      courseProgress
    });
  } catch (err) {
    console.error('Error in /api/progress POST:', sanitizeForLog(err.message || String(err)));
    res.status(500).json({ error: err.message || 'Failed to update progress' });
  }
});



// GET /api/progress
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = [];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const levelKey = `level${lvl}`;
      const level = user.courses?.[levelKey];
      
      if (level && level.history) {
        level.history.forEach((day, index) => {
          if (day) {
            progress.push({
              level: lvl,
              day: index + 1,
              completed: !!day.completed,
              completedAt: day.date,
              watchedSeconds: day.watchedSeconds || (day.watchTime * 60) || 0,
              videoDuration: day.videoDuration || 0,
              watchTime: day.watchTime || 0,
              feedback: (level.feedback && level.feedback[index]) ? level.feedback[index].comment : ''
            });
          }
        });
      }
    }
    
    res.json({
      progress,
      courses: user.courses || {}
    });
  } catch (err) {
    console.error('Error in /api/progress GET:', sanitizeForLog(err.message || String(err)));
    res.status(500).json({ error: err.message || 'Failed to fetch progress' });
  }
});

module.exports = router; 