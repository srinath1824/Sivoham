import React, { useEffect } from 'react';
import {
  Box,
  List,
  ListItemText,
  Typography,
  Divider,
  ListItemButton,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { mockCourses, getKey } from '../../config/constants';

interface SidebarProps {
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  progress: any;
  mockCourses: any[];
  getKey: (level: number, day: number) => string;
  isLevelUnlocked: (level: number) => boolean;
  isDayUnlocked: (level: number, day: number) => boolean;
  nextAvailableTime: (level: number, day: number) => number;
  now: number;
  sx?: any;
}

/**
 *
 * @param root0
 * @param root0.selectedLevel
 * @param root0.setSelectedLevel
 * @param root0.selectedDay
 * @param root0.setSelectedDay
 * @param root0.progress
 * @param root0.mockCourses
 * @param root0.getKey
 * @param root0.isLevelUnlocked
 * @param root0.isDayUnlocked
 * @param root0.nextAvailableTime
 * @param root0.now
 * @param root0.sx
 */
const Sidebar: React.FC<SidebarProps> = ({
  selectedLevel,
  setSelectedLevel,
  selectedDay,
  setSelectedDay,
  progress,
  mockCourses,
  getKey,
  isLevelUnlocked,
  isDayUnlocked,
  nextAvailableTime,
  now,
  sx,
}) => {
  useEffect(() => {
    console.log('Sidebar re-rendered. Progress:', progress);
  }, [progress]);

  return (
    <Box
      sx={{
        background: '#fff7f0',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
        p: 3,
        minWidth: 240,
        ...sx,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontFamily: 'Lora, serif',
          color: '#de6b2f',
          fontWeight: 700,
          fontSize: '1.3rem',
          mb: 2,
        }}
      >
        Course Levels
      </Typography>
      <List>
        {mockCourses.map((course, idx) => {
          // Determine if all days in this level are completed
          const allDaysCompleted = course.days.every(
            (dayObj: any) => !!progress[getKey(course.level, dayObj.day)]?.completed,
          );
          // After Level 2, always insert Meditation Test
          if (course.level === 2) {
            const meditationTestPassed = progress['meditationTestPassed'] || false;
            const isSelected = selectedLevel === 3 && typeof selectedDay === 'string' && selectedDay === 'meditationTest';
            return [
              <Accordion
                key={course.level}
                expanded={selectedLevel === course.level}
                onChange={() => setSelectedLevel(course.level)}
                sx={{ mb: 1, boxShadow: 'none', background: 'transparent' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: '#de6b2f', display: 'flex', alignItems: 'center' }}
                  >
                    {`Level ${course.level}`}
                    {allDaysCompleted && (
                      <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', ml: 1 }} />
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <List component="div" disablePadding>
                    {/* Meditation Test logic removed for type safety */}
                    {course.days.map((dayObj: any) => {
                      // For Level 3 Day 1, lock until meditation test is passed
                      let unlocked = isDayUnlocked(course.level, dayObj.day);
                      if (
                        course.level === 3 &&
                        dayObj.day === 1 &&
                        !progress['meditationTestPassed']
                      ) {
                        unlocked = false;
                      }
                      const done = !!progress[getKey(course.level, dayObj.day)]?.completed;
                      const nextTime = nextAvailableTime(course.level, dayObj.day);
                      const isSelected = selectedLevel === course.level && selectedDay === dayObj.day;
                      return (
                        <ListItemButton
                          key={dayObj.day}
                          sx={{
                            pl: 4,
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                            },
                          }}
                          selected={isSelected}
                          onClick={() => {
                            if (unlocked) {
                              setSelectedLevel(course.level);
                              setSelectedDay(dayObj.day);
                            }
                          }}
                          disabled={!unlocked}
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontWeight: done ? 700 : 500,
                                }}
                              >
                                {`Day ${dayObj.day}`}
                                <Fade in={done} timeout={600}>
                                  <span>
                                    {done && (
                                      <CheckCircleIcon
                                        fontSize="small"
                                        sx={{ color: 'success.main', ml: 1 }}
                                      />
                                    )}
                                  </span>
                                </Fade>
                              </Box>
                            }
                            secondary={
                              done
                                ? 'Completed'
                                : !unlocked && nextTime > now
                                  ? `Available in ${Math.ceil((nextTime - now) / (60 * 60 * 1000))}h`
                                  : ''
                            }
                          />
                          {!unlocked && (
                            <LockIcon fontSize="small" sx={{ ml: 1, color: 'grey.400' }} />
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </AccordionDetails>
                <Divider />
              </Accordion>,
              <ListItemButton
                key="meditation-test"
                sx={{ borderRadius: 2, mb: 1, mt: 2, pl: 2, bgcolor: isSelected ? 'rgba(222,107,47,0.08)' : undefined, opacity: meditationTestPassed ? 0.6 : 1 }}
                selected={isSelected}
                onClick={() => {
                  if (!meditationTestPassed) {
                    setSelectedLevel(3);
                    setSelectedDay('meditationTest' as any);
                  }
                }}
                disabled={meditationTestPassed}
              >
                <ListItemText
                  primary={<Box sx={{ fontWeight: 700, color: '#b45309' }}>Meditation Test</Box>}
                  secondary={meditationTestPassed ? 'Passed' : 'Required'}
                />
                {meditationTestPassed && <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', ml: 1 }} />}
              </ListItemButton>
            ];
          }
          return (
            <Accordion
              key={course.level}
              expanded={selectedLevel === course.level}
              onChange={() => setSelectedLevel(course.level)}
              sx={{ mb: 1, boxShadow: 'none', background: 'transparent' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#de6b2f', display: 'flex', alignItems: 'center' }}
                >
                  {`Level ${course.level}`}
                  {allDaysCompleted && (
                    <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', ml: 1 }} />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <List component="div" disablePadding>
                  {/* Meditation Test logic removed for type safety */}
                  {course.days.map((dayObj: any) => {
                    // Only operate on number day values
                    if (typeof dayObj.day !== 'number') return null;
                    let unlocked = isDayUnlocked(course.level, dayObj.day);
                    if (
                      course.level === 3 &&
                      dayObj.day === 1 &&
                      !progress['meditationTestPassed']
                    ) {
                      unlocked = false;
                    }
                    const done = !!progress[getKey(course.level, dayObj.day)]?.completed;
                    const nextTime = nextAvailableTime(course.level, dayObj.day);
                    const isSelected = selectedLevel === course.level && typeof selectedDay === 'number' && typeof dayObj.day === 'number' && selectedDay === dayObj.day;
                    return (
                      <ListItemButton
                        key={dayObj.day}
                        sx={{
                          pl: 4,
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                          },
                        }}
                        selected={isSelected}
                        onClick={() => {
                          if (unlocked) {
                            setSelectedLevel(course.level);
                            setSelectedDay(dayObj.day);
                          }
                        }}
                        disabled={!unlocked}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: done ? 700 : 500,
                              }}
                            >
                              {`Day ${dayObj.day}`}
                              <Fade in={done} timeout={600}>
                                <span>
                                  {done && (
                                    <CheckCircleIcon
                                      fontSize="small"
                                      sx={{ color: 'success.main', ml: 1 }}
                                    />
                                  )}
                                </span>
                              </Fade>
                            </Box>
                          }
                          secondary={
                            done
                              ? 'Completed'
                              : !unlocked && nextTime > now
                                ? `Available in ${Math.ceil((nextTime - now) / (60 * 60 * 1000))}h`
                                : ''
                          }
                        />
                        {!unlocked && (
                          <LockIcon fontSize="small" sx={{ ml: 1, color: 'grey.400' }} />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </AccordionDetails>
              <Divider />
            </Accordion>
          );
        })}
        {/* Level 5: Only show if all levels/days are completed */}
        {(() => {
          const allLevelsComplete = mockCourses.every((course) =>
            course.days.every(
              (dayObj: any) => !!progress[getKey(course.level, dayObj.day)]?.completed,
            ),
          );
          const isSelected = selectedLevel === 5;
          return (
            <Accordion
              key={5}
              expanded={isSelected}
              onChange={() => {
                if (allLevelsComplete) setSelectedLevel(5 as any);
              }}
              sx={{
                mb: 1,
                boxShadow: 'none',
                background: 'transparent',
                opacity: allLevelsComplete ? 1 : 0.6,
              }}
              disabled={!allLevelsComplete}
            >
              <AccordionSummary
                expandIcon={
                  allLevelsComplete ? <ExpandMoreIcon /> : <LockIcon sx={{ color: 'grey.400' }} />
                }
                sx={{ px: 0, minHeight: 48 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: allLevelsComplete ? '#de6b2f' : 'grey.500',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Level 5
                </Typography>
              </AccordionSummary>
              {allLevelsComplete && (
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <List component="div" disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => setSelectedLevel(5 as any)}
                      sx={{ pl: 4, borderRadius: 2, mb: 1 }}
                    >
                      <ListItemText
                        primary={<Box sx={{ fontWeight: 700 }}>View Level 5 Info</Box>}
                      />
                    </ListItemButton>
                  </List>
                </AccordionDetails>
              )}
              <Divider />
            </Accordion>
          );
        })()}
      </List>
    </Box>
  );
};

export default Sidebar;
