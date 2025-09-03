import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import {
  STORAGE_KEY,
  INITIAL_LEVEL_TEST,
  mockCourses,
  getKey,
} from '../config/constants';
import courseConfig from '../config/courseConfig';
import { API_URL } from '../services/api';

const initialProgress: Record<
  string,
  {
    completed: boolean;
    feedback: string;
    completedAt?: number;
    watchedSeconds: number;
    videoDuration: number;
  }
> = {};
mockCourses.forEach((l: any) =>
  l.days.forEach((d: any) => {
    initialProgress[getKey(l.level, d.day)] = {
      completed: false,
      feedback: '',
      completedAt: undefined,
      watchedSeconds: 0,
      videoDuration: 0,
    };
  }),
);

/**
 *
 * @param participant
 * @param progress
 * @param levelTest
 * @param format
 */
function exportAnalytics(participant: any, progress: any, levelTest: any, format: 'csv' | 'json') {
  const data: any[] = [];
  for (const key in progress) {
    const [level, day] = key.match(/\d+/g) || [];
    data.push({
      level,
      day,
      ...progress[key],
    });
  }
  const exportObj = {
    participant,
    progress: data,
    levelTest,
    exportedAt: new Date().toISOString(),
  };
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-analytics.json';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // CSV
    const header = [
      'Level',
      'Day',
      'Completed',
      'Feedback',
      'CompletedAt',
      'WatchedSeconds',
      'VideoDuration',
    ];
    const rows = data.map((row: any) => [
      row.level,
      row.day,
      row.completed,
      JSON.stringify(row.feedback),
      row.completedAt ? new Date(row.completedAt).toLocaleString() : '',
      row.watchedSeconds,
      row.videoDuration,
    ]);
    let csv = header.join(',') + '\n';
    rows.forEach((r) => {
      csv += r.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 *
 */
const Progress: React.FC = () => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...initialProgress, ...JSON.parse(saved) };
      } catch {
        return initialProgress;
      }
    }
    return initialProgress;
  });
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
  const [participant, setParticipant] = useState(() => {
    const saved = localStorage.getItem('participant');
    return saved ? JSON.parse(saved) : { name: 'Test User', email: 'testuser@example.com' };
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(participant?.name || '');
  const [profileEmail, setProfileEmail] = useState(participant?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  useEffect(() => {
    async function refreshUser() {
      if (user && user._id && token && user.isSelected === false) {
        try {
          const res = await fetch(`${API_URL}/user/${user._id}`, {
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
  }, [user && user._id, token, user && user.isSelected]);

  // Dashboard data
  const dashboardRows: any[] = [];
  for (let lvl = 1; lvl <= mockCourses.length; lvl++) {
    for (let d = 1; d <= courseConfig.daysPerLevel; d++) {
      const key = getKey(lvl, d);
      const prog = progress[key];
      dashboardRows.push({
        level: lvl,
        day: d,
        completed: prog?.completed,
        feedback: prog?.feedback,
        watched: prog?.watchedSeconds || 0,
        duration: prog?.videoDuration || 0,
      });
    }
  }

  // Profile update handler
  /**
   *
   */
  const handleProfileSave = () => {
    if (
      !profileName.trim() ||
      !profileEmail.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profileEmail)
    ) {
      setProfileMsg('Please enter a valid name and email.');
      return;
    }
    const info = { name: profileName.trim(), email: profileEmail.trim() };
    setParticipant(info);
    localStorage.setItem('participant', JSON.stringify(info));
    setProfileMsg('Profile updated!');
  };

  // Reset progress handler
  /**
   *
   */
  const handleProfileReset = () => {
    if (
      window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')
    ) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('levelTest');
      window.location.reload();
    }
  };

  // Calculate overall progress
  const totalDays = mockCourses.length * courseConfig.daysPerLevel;
  const completedDays = dashboardRows.filter((row) => row.completed).length;
  const progressPercentage = Math.round((completedDays / totalDays) * 100);

  // Calculate level-wise progress
  const levelProgress = mockCourses.map((course: any) => {
    const levelDays = course.days.length;
    const completedLevelDays = course.days.filter(
      (d: any) => progress[getKey(course.level, d.day)].completed,
    ).length;
    // Find the latest completedAt for this level
    const completedAts = course.days
      .map((d: any) => progress[getKey(course.level, d.day)]?.completedAt)
      .filter(Boolean);
    const levelCompletedAt =
      completedLevelDays === levelDays && completedAts.length > 0
        ? new Date(Math.max(...completedAts))
        : null;
    // Mark testPassed as true for levels without a test if all days are completed
    let testPassed = levelTest[course.level]?.testPassed;
    if (course.level !== 4 && completedLevelDays === levelDays) {
      testPassed = true;
    }
    return {
      level: course.level,
      completedDays: completedLevelDays,
      totalDays: levelDays,
      percentage: Math.round((completedLevelDays / levelDays) * 100),
      testPassed,
      levelCompletedAt,
    };
  });

  return (
    <main className="main-content">
      {/* Profile & Admin Buttons */}
      <Box sx={{ position: 'fixed', top: 16, right: 24, zIndex: 1200, display: 'flex', gap: 2 }}>
        <IconButton color="primary" onClick={() => setProfileOpen(true)} size="large">
          <AccountCircleIcon fontSize="large" />
        </IconButton>
      </Box>
      {/* Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 600 }}>
          My Profile
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            fullWidth
            sx={{ mb: 2, fontFamily: 'Lora, serif' }}
            InputLabelProps={{ style: { fontFamily: 'Lora, serif' } }}
            InputProps={{ style: { fontFamily: 'Lora, serif' } }}
          />
          <TextField
            label="Email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2, fontFamily: 'Lora, serif' }}
            type="email"
            InputLabelProps={{ style: { fontFamily: 'Lora, serif' } }}
            InputProps={{ style: { fontFamily: 'Lora, serif' } }}
          />
          {profileMsg && (
            <Alert severity="info" sx={{ fontFamily: 'Lora, serif', mb: 2 }}>
              {profileMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileSave} sx={{ fontFamily: 'Lora, serif', color: '#de6b2f' }}>
            Save
          </Button>
          <Button onClick={handleProfileReset} sx={{ fontFamily: 'Lora, serif', color: '#b45309' }}>
            Reset Progress
          </Button>
          <Button onClick={() => setProfileOpen(false)} sx={{ fontFamily: 'Lora, serif' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Main Dashboard Section */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 6 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'flex-end', xs: 'flex-start' },
            justifyContent: 'space-between',
            mb: 4,
            px: { xs: 2, md: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Lora, serif',
                fontStyle: 'italic',
                color: '#de6b2f',
                fontWeight: 400,
                fontSize: { xs: '2rem', md: '2.2rem' },
                mb: 2,
                lineHeight: 1.1,
                letterSpacing: 0,
              }}
            >
              My Progress
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Lora, serif',
                fontSize: { xs: '1.1rem', md: '1.15rem' },
                color: '#222',
                mb: 2,
                maxWidth: 520,
              }}
            >
              Track your journey through each level and class. Completed classes and tests are
              highlighted. Update your profile or export your analytics at any time.
            </Typography>
            {/* Decorative lotus SVG bottom left */}
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
            {/* Divider line */}
            <Box
              sx={{
                width: 80,
                height: 2,
                background: '#de6b2f',
                mt: 4,
                mb: 0,
                display: { xs: 'none', md: 'block' },
              }}
            />
          </Box>
          <Box sx={{ mt: { xs: 3, md: 0 } }}>
            <Typography
              sx={{
                fontFamily: 'Lora, serif',
                color: '#de6b2f',
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 1,
              }}
            >
              Overall Progress: {progressPercentage}%
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                sx={{
                  fontFamily: 'Lora, serif',
                  color: '#de6b2f',
                  borderColor: '#de6b2f',
                  '&:hover': { borderColor: '#b45309', color: '#b45309' },
                  mr: 1,
                }}
                onClick={() => exportAnalytics(participant, progress, levelTest, 'csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                sx={{
                  fontFamily: 'Lora, serif',
                  color: '#de6b2f',
                  borderColor: '#de6b2f',
                  '&:hover': { borderColor: '#b45309', color: '#b45309' },
                }}
                onClick={() => exportAnalytics(participant, progress, levelTest, 'json')}
              >
                Export JSON
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Level Progress Table */}
        <Box sx={{ mb: 6, px: { xs: 2, md: 0 } }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              fontFamily: 'Lora, serif',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Level
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Completed Days
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Test Passed
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Level Completed At
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Progress
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levelProgress.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
                      {row.level}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                      {row.completedDays} / {row.totalDays}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                      {row.testPassed ? (
                        <Chip label="Passed" color="success" size="small" />
                      ) : (
                        <Chip label="Not Passed" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                      {row.levelCompletedAt ? row.levelCompletedAt.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>{row.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Dashboard Table */}
        <Box sx={{ px: { xs: 2, md: 0 } }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
              fontFamily: 'Lora, serif',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Level
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Day
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Completed
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Completed At
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Feedback
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Watched (s)
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Lora, serif', color: '#de6b2f', fontWeight: 700 }}>
                    Duration (s)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
                      {row.level}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>{row.day}</TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                      {row.completed ? (
                        <Chip label="Yes" color="success" size="small" />
                      ) : (
                        <Chip label="No" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>
                      {progress[getKey(row.level, row.day)]?.completedAt
                        ? new Date(progress[getKey(row.level, row.day)]?.completedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: 'Lora, serif',
                        maxWidth: 120,
                        whiteSpace: 'pre-line',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {row.feedback}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>{row.watched}</TableCell>
                    <TableCell sx={{ fontFamily: 'Lora, serif' }}>{row.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
    </main>
  );
};

export default Progress;

