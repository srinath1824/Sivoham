const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (for admin users tab)
router.get('/all-users', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const total = await User.countDocuments({});
    const users = await User.find({}).skip(skip).limit(limit);
    
    const usersWithProgress = users.map(user => {
      const userObj = user.toObject();
      userObj.whatsappSent = userObj.whatsappSent !== undefined ? userObj.whatsappSent : false;
      
      // Calculate course progress and watch times
      let currentLevel = 'Not Started';
      let completedLevels = 0;
      let lastCompletedAt = null;
      const levelDetails = {};
      let totalWatchTime = 0;
      
      if (userObj.courses) {
        // Level 1
        if (userObj.courses.level1) {
          const level1WatchTime = userObj.courses.level1.history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
          totalWatchTime += level1WatchTime;
          
          // Use stored dailyProgress if available, otherwise calculate from history
          let dailyProgress = userObj.courses.level1.dailyProgress || {};
          if (Object.keys(dailyProgress).length === 0 && userObj.courses.level1.history) {
            const expectedDailyTime = 60; // 60 minutes per day for Level 1
            userObj.courses.level1.history.forEach((h, index) => {
              const day = index + 1;
              const percentage = Math.min(100, Math.round((h.watchTime / expectedDailyTime) * 100));
              dailyProgress[`day${day}`] = {
                watchTime: h.watchTime,
                percentage,
                date: h.date,
                completed: h.completed,
                dayGapMs: h.dayGapMs || 0,
                dayGapHours: Math.round((h.dayGapMs || 0) / (1000 * 60 * 60))
              };
            });
          }
          
          levelDetails.level1 = {
            completed: userObj.courses.level1.completed || false,
            watchTime: level1WatchTime,
            completedCount: userObj.courses.level1.completedCount || 0,
            lastWatched: userObj.courses.level1.history?.length > 0 
              ? userObj.courses.level1.history[userObj.courses.level1.history.length - 1].date 
              : null,
            dailyProgress,
            totalDays: userObj.courses.level1.history?.length || 0
          };
          if (userObj.courses.level1.completed) {
            currentLevel = 'Level 1 Completed';
            completedLevels = 1;
            lastCompletedAt = levelDetails.level1.lastWatched;
          }
        }
        
        // Level 2
        if (userObj.courses.level2) {
          const level2WatchTime = userObj.courses.level2.history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
          totalWatchTime += level2WatchTime;
          
          // Use stored dailyProgress if available, otherwise calculate from history
          let dailyProgress = userObj.courses.level2.dailyProgress || {};
          if (Object.keys(dailyProgress).length === 0 && userObj.courses.level2.history) {
            const expectedDailyTime = 90; // 90 minutes per day for Level 2
            userObj.courses.level2.history.forEach((h, index) => {
              const day = index + 1;
              const percentage = Math.min(100, Math.round((h.watchTime / expectedDailyTime) * 100));
              dailyProgress[`day${day}`] = {
                watchTime: h.watchTime,
                percentage,
                date: h.date,
                completed: h.completed,
                dayGapMs: h.dayGapMs || 0,
                dayGapHours: Math.round((h.dayGapMs || 0) / (1000 * 60 * 60))
              };
            });
          }
          
          levelDetails.level2 = {
            completed: userObj.courses.level2.completed || false,
            watchTime: level2WatchTime,
            completedCount: userObj.courses.level2.completedCount || 0,
            lastWatched: userObj.courses.level2.history?.length > 0 
              ? userObj.courses.level2.history[userObj.courses.level2.history.length - 1].date 
              : null,
            dailyProgress,
            totalDays: userObj.courses.level2.history?.length || 0
          };
          if (userObj.courses.level2.completed) {
            currentLevel = 'Level 2 Completed';
            completedLevels = 2;
            lastCompletedAt = levelDetails.level2.lastWatched;
          }
        }
        
        // Meditation Test
        if (userObj.courses.test?.completed) {
          currentLevel = 'Test Completed';
          lastCompletedAt = userObj.courses.test.history?.length > 0 
            ? userObj.courses.test.history[userObj.courses.test.history.length - 1].date 
            : lastCompletedAt;
        }
        
        // Level 3
        if (userObj.courses.level3) {
          const level3WatchTime = userObj.courses.level3.history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
          totalWatchTime += level3WatchTime;
          
          // Use stored dailyProgress if available, otherwise calculate from history
          let dailyProgress = userObj.courses.level3.dailyProgress || {};
          if (Object.keys(dailyProgress).length === 0 && userObj.courses.level3.history) {
            const expectedDailyTime = 120; // 120 minutes per day for Level 3
            userObj.courses.level3.history.forEach((h, index) => {
              const day = index + 1;
              const percentage = Math.min(100, Math.round((h.watchTime / expectedDailyTime) * 100));
              dailyProgress[`day${day}`] = {
                watchTime: h.watchTime,
                percentage,
                date: h.date,
                completed: h.completed,
                dayGapMs: h.dayGapMs || 0,
                dayGapHours: Math.round((h.dayGapMs || 0) / (1000 * 60 * 60))
              };
            });
          }
          
          levelDetails.level3 = {
            completed: userObj.courses.level3.completed || false,
            watchTime: level3WatchTime,
            completedCount: userObj.courses.level3.completedCount || 0,
            lastWatched: userObj.courses.level3.history?.length > 0 
              ? userObj.courses.level3.history[userObj.courses.level3.history.length - 1].date 
              : null,
            dailyProgress,
            totalDays: userObj.courses.level3.history?.length || 0
          };
          if (userObj.courses.level3.completed) {
            currentLevel = 'Level 3 Completed';
            completedLevels = 3;
            lastCompletedAt = levelDetails.level3.lastWatched;
          }
        }
        
        // Level 4
        if (userObj.courses.level4) {
          const level4WatchTime = userObj.courses.level4.history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
          totalWatchTime += level4WatchTime;
          
          // Use stored dailyProgress if available, otherwise calculate from history
          let dailyProgress = userObj.courses.level4.dailyProgress || {};
          if (Object.keys(dailyProgress).length === 0 && userObj.courses.level4.history) {
            const expectedDailyTime = 150; // 150 minutes per day for Level 4
            userObj.courses.level4.history.forEach((h, index) => {
              const day = index + 1;
              const percentage = Math.min(100, Math.round((h.watchTime / expectedDailyTime) * 100));
              dailyProgress[`day${day}`] = {
                watchTime: h.watchTime,
                percentage,
                date: h.date,
                completed: h.completed,
                dayGapMs: h.dayGapMs || 0,
                dayGapHours: Math.round((h.dayGapMs || 0) / (1000 * 60 * 60))
              };
            });
          }
          
          levelDetails.level4 = {
            completed: userObj.courses.level4.completed || false,
            watchTime: level4WatchTime,
            completedCount: userObj.courses.level4.completedCount || 0,
            lastWatched: userObj.courses.level4.history?.length > 0 
              ? userObj.courses.level4.history[userObj.courses.level4.history.length - 1].date 
              : null,
            dailyProgress,
            totalDays: userObj.courses.level4.history?.length || 0
          };
          if (userObj.courses.level4.completed) {
            currentLevel = 'Level 4 Completed';
            completedLevels = 4;
            lastCompletedAt = levelDetails.level4.lastWatched;
          }
        }
        
        // Level 5
        if (userObj.courses.level5) {
          const level5WatchTime = userObj.courses.level5.history?.reduce((sum, h) => sum + (h.watchTime || 0), 0) || 0;
          totalWatchTime += level5WatchTime;
          
          // Use stored dailyProgress if available, otherwise calculate from history
          let dailyProgress = userObj.courses.level5.dailyProgress || {};
          if (Object.keys(dailyProgress).length === 0 && userObj.courses.level5.history) {
            const expectedDailyTime = 180; // 180 minutes per day for Level 5
            userObj.courses.level5.history.forEach((h, index) => {
              const day = index + 1;
              const percentage = Math.min(100, Math.round((h.watchTime / expectedDailyTime) * 100));
              dailyProgress[`day${day}`] = {
                watchTime: h.watchTime,
                percentage,
                date: h.date,
                completed: h.completed,
                dayGapMs: h.dayGapMs || 0,
                dayGapHours: Math.round((h.dayGapMs || 0) / (1000 * 60 * 60))
              };
            });
          }
          
          levelDetails.level5 = {
            completed: userObj.courses.level5.completed || false,
            watchTime: level5WatchTime,
            completedCount: userObj.courses.level5.completedCount || 0,
            lastWatched: userObj.courses.level5.history?.length > 0 
              ? userObj.courses.level5.history[userObj.courses.level5.history.length - 1].date 
              : null,
            dailyProgress,
            totalDays: userObj.courses.level5.history?.length || 0
          };
          if (userObj.courses.level5.completed) {
            currentLevel = 'Level 5 Completed';
            completedLevels = 5;
            lastCompletedAt = levelDetails.level5.lastWatched;
          }
        }
      }
      
      // Get meditation test data
      let meditationTest = null;
      if (userObj.courses?.test) {
        const testData = userObj.courses.test;
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
      }
      
      userObj.courseProgress = {
        currentLevel,
        completedLevels,
        level4Completed: completedLevels >= 4,
        lastCompletedAt,
        totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
        levelDetails,
        meditationTest
      };
      
      return userObj;
    });
    res.json({ users: usersWithProgress, total });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all non-admin users (for approval)
router.get('/users', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  
  const total = await User.countDocuments({ isAdmin: { $ne: true } });
  const users = await User.find({ isAdmin: { $ne: true } }).skip(skip).limit(limit);
  
  // Ensure whatsappSent field exists for all users
  const usersWithWhatsapp = users.map(user => {
    const userObj = user.toObject();
    userObj.whatsappSent = userObj.whatsappSent !== undefined ? userObj.whatsappSent : false;
    return userObj;
  });
  res.json({ users: usersWithWhatsapp, total });
});

// Approve a user (set isSelected to true)
router.post('/user/:id/approve', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findByIdAndUpdate(req.params.id, { isSelected: true }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Reject a user (set isSelected to false and isRejected to true)
router.post('/user/:id/reject', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const user = await User.findByIdAndUpdate(req.params.id, { isSelected: false, isRejected: true }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Bulk approve users
router.post('/users/bulk-approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ error: 'Invalid userIds' });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isAdmin: { $ne: true } },
      { isSelected: true, isRejected: false }
    );
    res.json({ message: `${result.modifiedCount} users approved`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk reject users
router.post('/users/bulk-reject', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ error: 'Invalid userIds' });
    
    const result = await User.updateMany(
      { _id: { $in: userIds }, isAdmin: { $ne: true } },
      { isSelected: false, isRejected: true }
    );
    res.json({ message: `${result.modifiedCount} users rejected`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle WhatsApp sent status for user
router.put('/users/:id/toggle-whatsapp', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.whatsappSent = !user.whatsappSent;
    await user.save();
    
    res.json({ success: true, whatsappSent: user.whatsappSent });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle WhatsApp status' });
  }
});

module.exports = router;
