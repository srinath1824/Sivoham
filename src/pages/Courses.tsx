/* global window, document, localStorage, fetch, console, Blob, URL, alert */
import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Grid } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Sidebar from '../components/courses/Sidebar.tsx';
import VideoPlayer from '../components/courses/VideoPlayer.tsx';
import FeedbackSection from '../components/courses/FeedbackSection.tsx';
import VideoMeditationTest from '../components/courses/VideoMeditationTest.tsx';
// @ts-ignore
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
import {
  SKIP_LOGIN,
  USE_CDN_HLS,
  HLS_URLS,
  DRAWER_WIDTH,
  STORAGE_KEY,
  INITIAL_LEVEL_TEST,
  mockCourses,
  getKey,
  COURSE_ACCESS_WINDOWS,
} from '../config/constants.ts';
import courseConfig from '../config/courseConfig.ts';
import { login as apiLogin, register as apiRegister, updateProgress, getProgress } from '../services/api.ts';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChairIcon from '@mui/icons-material/Chair';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WifiIcon from '@mui/icons-material/Wifi';
import ReplayIcon from '@mui/icons-material/Replay';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DoneAllIcon from '@mui/icons-material/DoneAll';

// Login Dialog Component
function LoginDialog({ open, onClose, onLoginSuccess }: { open: boolean, onClose: () => void, onLoginSuccess: (user: any, token: string) => void }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin(mobile, otp);
      onLoginSuccess(res.user, res.token);
      setMobile('');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleLogin} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Registration Dialog Component
function RegistrationDialog({ open, onClose, mobile, onRegisterSuccess }: { open: boolean, onClose: () => void, mobile: string, onRegisterSuccess: (user: any, token: string) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiRegister(mobile, firstName, lastName, comment, email);
      onRegisterSuccess(res.user, res.token);
      setFirstName('');
      setLastName('');
      setComment('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Join Course</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Comment (why do you want to join?)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', minHeight: 60 }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleRegister} color="primary" variant="contained" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Courses page component for course progression, video test, and analytics.
 * @returns {JSX.Element}
 */
const Courses = () => {
  // Unified login state from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...INITIAL_LEVEL_TEST, ...JSON.parse(saved) };
      } catch {
        return INITIAL_LEVEL_TEST;
      }
    }
    return INITIAL_LEVEL_TEST;
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [levelTest, setLevelTest] = useState(() => {
    const saved = localStorage.getItem('levelTest');
    if (saved) {
      try {
        return { ...INITIAL_LEVEL_TEST, ...JSON.parse(saved) };
      } catch {
        return INITIAL_LEVEL_TEST;
      }
    }
    return INITIAL_LEVEL_TEST;
  });
  const [showCompleteToast, setShowCompleteToast] = useState(false);
  const [videoTestOpen, setVideoTestOpen] = useState(false);
  const [videoTestResult, setVideoTestResult] = useState<any>(null);
  const [videoTestReportOpen, setVideoTestReportOpen] = useState(false);
  const [videoTestReportData, setVideoTestReportData] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Time window logic (move here to avoid conditional hook call)
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper: get current day object and key
  const currentDayObj = typeof selectedDay === 'number'
    ? mockCourses.find(l => l.level === selectedLevel)?.days.find(d => d.day === selectedDay)
    : undefined;
  const currentKey = typeof selectedDay === 'number'
    ? getKey(selectedLevel, selectedDay)
    : selectedDay === 'meditationTest'
      ? 'meditationTest'
      : '';

  // Find the first in-progress level (not fully completed)
  const getFirstInProgressLevel = React.useCallback((): number => {
    for (let i = 0; i < mockCourses.length; i++) {
      const level = mockCourses[i].level;
      const allDaysCompleted = mockCourses[i].days.every(
        (d) => !!progress[getKey(level, d.day)]?.completed
      );
      if (!allDaysCompleted) return level;
    }
    // If all levels are completed, default to the last one
    return mockCourses[mockCourses.length - 1].level;
  }, [progress]);

  React.useEffect(() => {
    const level = getFirstInProgressLevel();
    setSelectedLevel(level);
  }, [getFirstInProgressLevel]);

  // Logout handler
  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
    window.location.reload();
  }

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Show registration dialog if user is missing firstName, lastName, or comment
  React.useEffect(() => {
    if (user && (!user.firstName || !user.lastName || !user.comment)) {
      setRegisterOpen(true);
    }
  }, [user]);

  React.useEffect(() => {
    async function refreshUser() {
      if (user && user._id && token) {
        try {
          const res = await fetch(`/api/user/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const latest = await res.json();
            if (latest && (latest.isSelected !== user.isSelected || JSON.stringify(latest) !== JSON.stringify(user))) {
              setUser(latest);
              localStorage.setItem('user', JSON.stringify(latest));
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    refreshUser();
    // Optionally, poll every 30s if you want auto-refresh
    // const interval = setInterval(refreshUser, 30000);
    // return () => clearInterval(interval);
  }, [user && user._id, token]);

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff7f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', margin: '2rem auto', maxWidth: 480, padding: '2.5rem 1.5rem' }}>
        <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>🔒</span>
        <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Login Required</h2>
        <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 0 }}>
          You can only view this page if you are <b>logged in</b>.<br />
          Please log in to access your courses and progress.
        </p>
        <button
          style={{
            marginTop: 24,
            background: '#de6b2f',
            color: '#fff',
            fontFamily: 'Lora, serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: 8,
            padding: '0.7rem 2.5rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(222,107,47,0.07)',
            transition: 'background 0.2s',
          }}
          onClick={() => setLoginOpen(true)}
        >
          Login
        </button>
        <LoginDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(user, token) => {
            setUser(user);
            setToken(token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setLoginOpen(false);
          }}
        />
      </div>
    );
  }

  // Block access if user is not approved
  if (user && user.isSelected === false) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff7f0', borderRadius: 16, boxShadow: '0 2px 12px rgba(222,107,47,0.07)', margin: '2rem auto', maxWidth: 480, padding: '2.5rem 1.5rem' }}>
        <span style={{ fontSize: 54, color: '#de6b2f', marginBottom: 16 }}>⏳</span>
        <h2 style={{ color: '#de6b2f', fontFamily: 'Lora, serif', fontWeight: 700, marginBottom: 12, fontSize: '2rem', textAlign: 'center' }}>Awaiting Approval</h2>
        <p style={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.15rem', textAlign: 'center', marginBottom: 0 }}>
          Your registration is pending admin approval.<br />
          You will be notified once your account is approved.
        </p>
      </Box>
    );
  }

  // Unlock logic
  const nowMs = Date.now();
  let threeMonthExpiredLevel = 0;
  for (let lvl = 1; lvl <= 4; lvl++) {
    const fc = levelTest[lvl]?.firstCompletedAt;
    if (fc && nowMs - fc > courseConfig.monthsForRewatch * 30 * 24 * 60 * 60 * 1000) {
      threeMonthExpiredLevel = lvl;
      break;
    }
  }
  /**
   *
   * @param level
   */
  function isLevelUnlocked(level: number) {
    if (threeMonthExpiredLevel && level > threeMonthExpiredLevel) return false;
    if (level === 1) return true;
    const prevLevel = mockCourses.find((l) => l.level === level - 1);
    // For Level 4, require meditation test passed
    if (level === 4) {
      return (
        prevLevel?.days.every((d) => !!progress[getKey(3, d.day)]?.completed) &&
        progress['meditationTestPassed']
      );
    }
    // For other levels, only require all days completed in previous level
    return prevLevel?.days.every((d) => !!progress[getKey(level - 1, d.day)]?.completed);
  }
  /**
   *
   * @param level
   * @param day
   */
  function isDayUnlocked(level: number, day: number) {
    if (!isLevelUnlocked(level)) return false;
    if (day === 1) return true;
    // Previous day must be completed and gap passed
    const prevKey = getKey(level, day - 1);
    const prev = progress[prevKey];
    if (!prev?.completed || !prev?.completedAt) return false;
    const now = Date.now();
    return now - prev.completedAt >= courseConfig.dayGapMs;
  }
  /**
   *
   * @param level
   * @param day
   */
  function nextAvailableTime(level: number, day: number) {
    if (day === 1) return 0;
    const prevKey = getKey(level, day - 1);
    const prev = progress[prevKey];
    if (!prev?.completedAt) return 0;
    return prev.completedAt + courseConfig.dayGapMs;
  }

  // Video analytics handlers
  /**
   *
   */
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setWatchedSeconds(Math.max(watchedSeconds, video.currentTime));
    }
  };
  /**
   *
   */
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setVideoDuration(video.duration);
    }
  };
  // When video ends, mark as completed and update progress
  /**
   *
   */
  const handleEnded = async () => {
    setVideoEnded(true);
    setWatchedSeconds(videoDuration);
    try {
      await updateProgress({
        level: selectedLevel,
        day: selectedDay,
        completed: true,
        completedAt: Date.now(),
        watchedSeconds: videoDuration,
        videoDuration,
        feedback: progress[currentKey]?.feedback || '',
      });
      // Refetch progress from backend
      const progressArr = await getProgress();
      const progObj = {};
      progressArr.forEach((p) => {
        progObj[getKey(p.level, p.day)] = {
          completed: p.completed,
          feedback: p.feedback,
          completedAt: p.completedAt ? new Date(p.completedAt).getTime() : undefined,
          watchedSeconds: p.watchedSeconds,
          videoDuration: p.videoDuration,
        };
      });
      setProgress({ ...INITIAL_LEVEL_TEST, ...progObj });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...INITIAL_LEVEL_TEST, ...progObj }));

      // --- ADVANCE FOCUS LOGIC ---
      // Find current level's days
      const currentLevelObj = mockCourses.find(l => l.level === selectedLevel);
      const allDaysCompleted = currentLevelObj?.days.every((d) => !!progObj[getKey(selectedLevel, d.day)]?.completed);
      if (allDaysCompleted) {
        // Find next unlocked level
        const nextLevelObj = mockCourses.find(l => l.level === selectedLevel + 1);
        if (nextLevelObj && isLevelUnlocked(selectedLevel + 1)) {
          setSelectedLevel(selectedLevel + 1);
          setSelectedDay(1);
        }
      }
    } catch (err) {
      // Optionally show error
    }
    setShowCompleteToast(true);
  };

  // Feedback submit (update backend)
  /**
   *
   */
  const handleFeedbackSubmit = async () => {
    setSubmitting(true);
    const updatedProgress = {
      ...progress,
      [currentKey]: {
        ...progress[currentKey],
        feedback,
      },
    };
    setProgress(updatedProgress);
    try {
      await updateProgress({
        level: selectedLevel,
        day: selectedDay,
        completed: progress[currentKey]?.completed || false,
        feedback,
        completedAt: progress[currentKey]?.completedAt || null,
        watchedSeconds: progress[currentKey]?.watchedSeconds || 0,
        videoDuration: progress[currentKey]?.videoDuration || 0,
      });
      // Refetch progress from backend
      const progressArr = await getProgress();
      const progObj = {};
      progressArr.forEach((p) => {
        progObj[getKey(p.level, p.day)] = {
          completed: p.completed,
          feedback: p.feedback,
          completedAt: p.completedAt ? new Date(p.completedAt).getTime() : undefined,
          watchedSeconds: p.watchedSeconds,
          videoDuration: p.videoDuration,
        };
      });
      setProgress({ ...INITIAL_LEVEL_TEST, ...progObj });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...INITIAL_LEVEL_TEST, ...progObj }));
      setFeedback('');
    } catch (err) {
      // Optionally show error
    }
    setSubmitting(false);
  };

  // Check if all days in current level are completed
  const allDaysCompleted =
    typeof selectedLevel === 'number'
      ? mockCourses
          .find((l) => l.level === selectedLevel)
          ?.days.every((d) => !!progress[getKey(selectedLevel, d.day)]?.completed)
      : false;

  // Check if test is passed for current level
  const testPassed =
    typeof selectedLevel === 'number' ? levelTest[selectedLevel]?.testPassed : false;

  // Show warning if expired
  const showThreeMonthWarning =
    threeMonthExpiredLevel > 0 &&
    typeof selectedLevel === 'number' &&
    selectedLevel > threeMonthExpiredLevel;

  // Reset progress handler
  /**
   *
   */
  const handleProfileReset = () => {
    if (
      window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')
    ) {
      localStorage.removeItem('courseProgress');
      localStorage.removeItem('levelTest');
      window.location.reload();
    }
  };

  /**
   *
   */
  const handleAdminReset = () => {
    if (window.confirm('Admin: Reset ALL progress for this user? This cannot be undone.')) {
      localStorage.removeItem('courseProgress');
      localStorage.removeItem('levelTest');
      window.location.reload();
    }
  };

  // Fetch all users when admin dialog opens
  // Fetch selected user's progress/levelTest
  // Helper functions for admin user analytics
  /**
   *
   * @param userId
   */
  async function getProgressForUser(userId: string) {
    const res = await fetch(`/api/progress/user/${userId}`, { headers: buildHeaders() });
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  }
  /**
   *
   * @param userId
   */
  async function getLevelTestsForUser(userId: string) {
    const res = await fetch(`/api/levelTest/user/${userId}`, { headers: buildHeaders() });
    if (!res.ok) throw new Error('Failed to fetch level tests');
    return res.json();
  }
  /**
   *
   * @param extra
   */
  function buildHeaders(extra: Record<string, string> = {}) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Helper to determine pass/fail
  /**
   *
   * @param result
   */
  function evaluateMeditationTest(result: any) {
    // Use config values for meditation test pass criteria
    const minMinutes = courseConfig.meditationTestMinMinutes;
    const minClosedPct = courseConfig.meditationTestMinClosedPct;
    const maxHeadMove = courseConfig.meditationTestMaxHeadMoveFactor * minMinutes * 60;
    const maxHandMove = courseConfig.meditationTestMaxHandMoveFactor * minMinutes * 60;
    const minHandStability = courseConfig.meditationTestMinHandStability;
    const duration = result.metrics?.length ? result.metrics[result.metrics.length - 1].t : 0;
    // const passed = result.eyeClosedPercent >= minClosedPct && duration >= minMinutes*60 && result.headMovement < maxHeadMove && result.handStability > minHandStability;
    const passed = true;
    let reason = '';
    if (!passed) {
      if (result.eyeClosedPercent < minClosedPct)
        reason += `Eyes closed only ${result.eyeClosedPercent.toFixed(1)}% of the time. `;
      if (duration < minMinutes * 60)
        reason += `Session lasted only ${(duration / 60).toFixed(1)} min. `;
      if (result.headMovement >= maxHeadMove) reason += 'Too much head movement. ';
      if (result.handStability <= minHandStability) reason += 'Too much hand movement. ';
    }
    return { passed, reason };
  }

  // Add guard for locked content
  const levelIsUnlocked = typeof selectedLevel === 'number' ? isLevelUnlocked(selectedLevel) : true;
  const dayIsUnlocked =
    typeof selectedLevel === 'number' ? isDayUnlocked(selectedLevel, selectedDay) : true;

  // Calculate access windows for today
  const windows = COURSE_ACCESS_WINDOWS.map(({ startHour, endHour }) => {
    const start = new Date(currentTime);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(currentTime);
    end.setHours(endHour, 0, 0, 0);
    return { start, end };
  });
  const isWithinWindow = windows.some(({ start, end }) => currentTime >= start && currentTime < end);
  // Find the next window (if any) that hasn't started yet
  const nextWindow = windows.find(({ start }) => currentTime < start);
  const msToStart = nextWindow ? nextWindow.start.getTime() - currentTime.getTime() : 0;
  const showClock = msToStart > 0 && msToStart <= 5 * 60 * 1000;

  return (
    <Box
      sx={{
        background: '#fff',
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 0 },
        minHeight: '60vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative lotus SVG and divider line */}
      <Box
        sx={{
          position: 'absolute',
          left: -40,
          bottom: -20,
          opacity: 0.13,
          zIndex: 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <img
          src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg"
          alt="lotus"
          width={140}
          height={140}
          style={{ maxWidth: '100%' }}
        />
      </Box>
      <Box
        sx={{
          width: 80,
          height: 2,
          background: '#de6b2f',
          mt: 4,
          mb: 0,
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 2,
        }}
      />
      {/* Main Content Layout */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          gap: 4,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Sidebar */}
        <Sidebar
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          progress={progress}
          mockCourses={mockCourses}
          getKey={getKey}
          isLevelUnlocked={isLevelUnlocked}
          isDayUnlocked={isDayUnlocked}
          nextAvailableTime={nextAvailableTime}
          now={now}
          sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', minWidth: 260, mb: { xs: 4, md: 0 } }}
        />
        {/* Main Video/Content Area */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            background: '#fff7f0',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
          }}
        >
          {/* Level 5 special content */}
          {selectedLevel === 5 ? (
            <Box>
              <Typography
                variant="h2"
                sx={{
                  color: '#de6b2f',
                  fontWeight: 700,
                  mb: 2,
                  fontFamily: 'Lora, serif',
                  letterSpacing: 0.5,
                }}
              >
                Level 5: Advanced Initiation
              </Typography>
              <Box
                sx={{
                  background: '#fff',
                  borderRadius: 3,
                  p: { xs: 2, md: 4 },
                  boxShadow: '0 2px 12px rgba(222,107,47,0.10)',
                  mb: 2,
                  // maxWidth: 600,
                  mx: 'auto',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#b45309',
                    fontWeight: 600,
                    mb: 2,
                    fontFamily: 'Lora, serif',
                    letterSpacing: 0.2,
                  }}
                >
                  Important Information
                </Typography>
                <ul
                  style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    margin: 0,
                    fontFamily: 'Lora, serif',
                  }}
                >
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 }}>
                    <span
                      style={{ color: '#de6b2f', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      🏛️
                    </span>
                    <span>
                      <b>Level 5 will be conducted in the Ashram.</b> This is an in-person advanced
                      initiation for eligible sadhaks.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 }}>
                    <span
                      style={{ color: '#b45309', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      🌟
                    </span>
                    <span>
                      <b>Only sadhaks selected by Guruji</b> will be invited to attend Level 5.
                      Selection is based on dedication and progress.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 }}>
                    <span
                      style={{ color: '#1a2341', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      📲
                    </span>
                    <span>
                      <b>Invitations will be sent via WhatsApp</b> to selected sadhaks. Please
                      ensure your contact details are up to date.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 }}>
                    <span
                      style={{ color: '#de6b2f', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      📝
                    </span>
                    <span>
                      <b>Apply for Sakthipatham</b> only after you have successfully completed Level
                      5.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 18 }}>
                    <span
                      style={{ color: '#b45309', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      💸
                    </span>
                    <span>
                      <b>Selected sadhaks</b> for Level 5 are requested to make a{' '}
                      <span style={{ color: '#de6b2f', fontWeight: 600 }}>donation of xxxxx</span>{' '}
                      to support the Ashram and the spiritual mission.
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 0 }}>
                    <span
                      style={{ color: '#1a2341', fontSize: 22, marginRight: 12, lineHeight: 1.2 }}
                    >
                      🙏
                    </span>
                    <span>
                      <b>Sadhaks selected for Sakthipatham</b> should make a{' '}
                      <span style={{ color: '#b45309', fontWeight: 600 }}>donation of xxxxx</span>{' '}
                      as part of the initiation process.
                    </span>
                  </li>
                </ul>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#7a7a7a',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  mt: 2,
                  fontFamily: 'Lora, serif',
                }}
              >
                For any questions or clarifications, please contact the Ashram administration.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <button
                  style={{
                    background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
                    color: '#fff',
                    fontFamily: 'Lora, serif',
                    fontWeight: 700,
                    fontSize: '1.35rem',
                    border: 'none',
                    borderRadius: '2rem',
                    padding: '1.1rem 3.5rem',
                    boxShadow: '0 4px 24px rgba(222,107,47,0.13)',
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                    transition: 'background 0.2s, transform 0.15s',
                    outline: 'none',
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      'linear-gradient(90deg, #b45309 0%, #de6b2f 100%)')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)')
                  }
                  onFocus={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onBlur={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Apply
                </button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Guard: If locked, show lock message */}
              {(
                // Allow Meditation Test to be accessible if Level 2 is complete
                (selectedLevel === 3 && typeof selectedDay === 'string' && selectedDay === 'meditationTest' &&
                  mockCourses.find(l => l.level === 2)?.days.every(
                    (d) => !!progress[getKey(2, d.day)]?.completed
                  )
                )
                  ? false // Do not show lock for meditation test if Level 2 is complete
                  : (!levelIsUnlocked || !dayIsUnlocked)
              ) ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <LockIcon sx={{ fontSize: 60, color: '#de6b2f', mb: 2 }} />
                  <Typography variant="h4" sx={{ color: '#de6b2f', fontWeight: 700, mb: 2 }}>
                    This content is locked
                  </Typography>
                  <Typography variant="body1">
                    Please complete all required previous content to unlock this section.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Time window restriction */}
                  {!isWithinWindow ? (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                      <LockIcon sx={{ fontSize: 60, color: '#de6b2f', mb: 2 }} />
                      <Typography variant="h4" sx={{ color: '#de6b2f', fontWeight: 700, mb: 2, whiteSpace: 'pre-line' }}>
                        Course content is only available\n
                        {(() => {
                          function formatHour(hour) {
                            const h = hour % 24;
                            const ampm = h < 12 ? 'AM' : 'PM';
                            const display = h % 12 === 0 ? 12 : h % 12;
                            return `${display.toString().padStart(2, '0')}:00 ${ampm}`;
                          }
                          return COURSE_ACCESS_WINDOWS.map(({ startHour, endHour }) =>
                            `from ${formatHour(startHour)} to ${formatHour(endHour)}`
                          ).join('\nand ');
                        })()}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {msToStart > 0
                          ? `You can access the course in ${Math.floor(msToStart / 60000)} min ${Math.floor((msToStart % 60000) / 1000)} sec.`
                          : `Today's access window has ended. Please come back tomorrow.`}
                      </Typography>
                      {showClock && (
                        <Typography variant="h5" sx={{ color: '#b45309', fontWeight: 700, mb: 2 }}>
                          {`Current time: ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <>
                      {/* Level Heading */}
                      {selectedLevel === 3 && typeof selectedDay === 'string' && selectedDay === 'meditationTest' ? (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h2"
                            sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700, mb: 1, textAlign: { xs: 'center', md: 'left' } }}
                          >
                            Meditation Test
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 600, mb: 3, textAlign: { xs: 'center', md: 'left' } }}
                          >
                            Please complete the meditation test to unlock Level 3 content.
                          </Typography>
                          <Box sx={{
                            background: '#fff',
                            borderRadius: 3,
                            boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
                            p: { xs: 2, md: 3 },
                            mb: 3,
                            maxWidth: 600,
                            mx: { xs: 0, md: 'auto' },
                            textAlign: 'left',
                            '@media (min-width:900px)': {
                              marginLeft: 0,
                              marginRight: 0,
                            },
                          }}>
                            <Typography variant="h6" sx={{ color: '#b45309', fontWeight: 700, mb: 1, fontFamily: 'Lora, serif' }}>
                              Meditation Test Instructions
                            </Typography>
                            <List sx={{ color: '#1a2341', fontFamily: 'Lora, serif', fontSize: '1.08rem', pl: 0 }}>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><AccessTimeIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary={<span>The meditation test will last for <b>60 minutes</b>, so make sure you're in a quiet space where you won't be interrupted.</span>} />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><ChairIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Find a comfortable seated position, either cross-legged on the floor or on a chair, with your back kept straight throughout." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><VolumeOffIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Gently close your eyes and stay in a calm, noise-free environment." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><VisibilityOffIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Your test will be monitored, and you must keep your eyes closed and remain still during the entire session." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><RemoveRedEyeIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Do not open your eyes until you're instructed to do so." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><ArrowUpwardIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="If you successfully complete this test, you'll be moved to the next level." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><WifiIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Choose a spot with a stable internet connection for the session." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><ReplayIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="If you experience any issues during the test, please rejoin and practice again." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><AssessmentIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="Your performance metrics will be tracked and monitored." />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon><DoneAllIcon sx={{ color: '#de6b2f' }} /></ListItemIcon>
                                <ListItemText primary="You may end the test only after receiving the prompt." />
                              </ListItem>
                            </List>
                          </Box>
                          <Button variant="contained" color="primary" onClick={() => setVideoTestOpen(true)} sx={{ fontWeight: 700, fontFamily: 'Lora, serif', background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)', borderRadius: 2, mb: 2 }}>
                            Start Meditation Test
                          </Button>
                        </Box>
                      ) : (typeof selectedLevel === 'number' && typeof selectedDay === 'number') && (
                        <>
                          <Typography
                            variant="h2"
                            sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700, mb: 1 }}
                          >
                            {`Level ${selectedLevel} - Day ${selectedDay}`}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ fontFamily: 'Lora, serif', color: '#b45309', fontWeight: 600, mb: 3 }}
                          >
                            {(() => {
                              switch (selectedLevel) {
                                case 1:
                                  return 'Brahma Randra Opening';
                                case 2:
                                  return 'Awakening the Sushumna Nadi';
                                case 3:
                                  return 'Awakening and Cleansing of 7 Chakras';
                                case 4:
                                  return 'Moving Kundalini Energy';
                                default:
                                  return '';
                              }
                            })()}
                          </Typography>
                        </>
                      )}
                      {/* Video Player */}
                      {selectedLevel === 3 && typeof selectedDay === 'string' && selectedDay === 'meditationTest' ? null : (
                        <VideoPlayer
                          videoUrl={currentDayObj?.videoUrl || ''}
                          videoRef={videoRef}
                          watchedSeconds={watchedSeconds}
                          setWatchedSeconds={setWatchedSeconds}
                          videoDuration={videoDuration}
                          setVideoDuration={setVideoDuration}
                          videoEnded={videoEnded}
                          setVideoEnded={setVideoEnded}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={handleEnded}
                          sx={{ fontFamily: 'Lora, serif' }}
                          dayNumber={selectedDay}
                        />
                      )}
                      {/* Feedback Section */}
                      {selectedLevel === 3 && typeof selectedDay === 'string' && selectedDay === 'meditationTest' ? null : (
                        <FeedbackSection
                          feedback={feedback}
                          setFeedback={setFeedback}
                          submitting={submitting}
                          onSubmit={handleFeedbackSubmit}
                          completed={progress[currentKey]?.completed || false}
                          feedbackSubmitted={!!progress[currentKey]?.feedback}
                          sx={{ fontFamily: 'Lora, serif' }}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Box>
      {/* Lotus SVG background for mobile */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          opacity: 0.1,
          zIndex: 0,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <img
          src="https://yogananda.org/craft-public-storage/lotus-5_orange_light.svg"
          alt="lotus"
          width={120}
          height={120}
          style={{ maxWidth: '100%' }}
        />
      </Box>
      {/* Toast for completion */}
      <Snackbar
        open={showCompleteToast}
        autoHideDuration={3000}
        onClose={() => setShowCompleteToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowCompleteToast(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Day marked as complete!
        </Alert>
      </Snackbar>

      {/* Meditation Test Dialog */}
      <Dialog open={videoTestOpen} onClose={() => setVideoTestOpen(false)} maxWidth="sm" fullWidth>
        <VideoMeditationTest
          onComplete={(result) => {
            setVideoTestOpen(false);
            setVideoTestResult(result);
            if (result.success) {
              // Mark meditation test as passed in progress and localStorage
              setProgress((prev) => {
                const updated = { ...prev, meditationTestPassed: true };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
              });
              // Move to Level 3 Day 1
              setSelectedLevel(3);
              setSelectedDay(1);
            }
          }}
          onCancel={() => setVideoTestOpen(false)}
        />
      </Dialog>

      {/* Meditation Test Result Dialog */}
      <Dialog open={!!videoTestResult} onClose={() => setVideoTestResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Meditation Test Result</DialogTitle>
        <DialogContent>
          {videoTestResult && (
            <>
              <Alert severity={videoTestResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                {videoTestResult.success ? 'Test completed successfully!' : 'Test failed. Please try again.'}
              </Alert>
              {/* Show metrics if available */}
              <div>
                <strong>Eye Closed %:</strong> {videoTestResult.eyeClosedPercent?.toFixed(1) ?? '-'}%<br />
                <strong>Head Movement:</strong> {videoTestResult.headMovement?.toFixed(3) ?? '-'}<br />
                <strong>Hand Stability:</strong> {videoTestResult.handStability?.toFixed(3) ?? '-'}<br />
              </div>
              {/* Add more result details as needed */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {videoTestResult && !videoTestResult.success && (
            <Button onClick={() => { setVideoTestResult(null); setVideoTestOpen(true); }} color="primary" variant="contained">
              Re-attempt Test
            </Button>
          )}
          <Button onClick={() => setVideoTestResult(null)} color="inherit" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses;