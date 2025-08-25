import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Event {
  _id: string;
  name: string;
  date: string;
  location: string;
  showScrollBanner: boolean;
  registrationDeadline?: string;
}

export default function EventScrollBanner() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const { API_URL } = await import('../services/api.ts');
      const response = await fetch(`${API_URL}/events/upcoming-banner`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data.filter((event: Event) => event.showScrollBanner));
        } else {
          console.error('API response is not an array:', data);
          setEvents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setEvents([]);
    }
  };

  if (!isVisible || events.length === 0) return null;

  const upcomingEvent = events[0];
  const eventDate = new Date(upcomingEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const registrationDeadline = upcomingEvent.registrationDeadline ? new Date(upcomingEvent.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  
  const scrollText = `🕉️ Come and receive the Divine Blessings of Parama pujya Sree Jeeveswara Yogi 🙏 | 🎉 Upcoming Event: ${upcomingEvent.name} | 📍 ${upcomingEvent.location} | 📅 ${eventDate} | ✨ Visit Events page to register and be part of this sacred gathering | ${registrationDeadline ? `⏰ Registration closes: ${registrationDeadline} |` : ''} 🌟 Experience spiritual transformation and inner awakening 🕉️           `;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 100, md: 64 },
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: '#de6b2f',
        color: 'white',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Typography
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          animation: 'scrollText 45s linear infinite',
          '@keyframes scrollText': {
            '0%': { transform: 'translateX(100vw)' },
            '100%': { transform: 'translateX(-100%)' }
          }
        }}
      >
        {scrollText}
      </Typography>
      
      <IconButton
        onClick={() => setIsVisible(false)}
        sx={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 32,
          height: 32,
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}