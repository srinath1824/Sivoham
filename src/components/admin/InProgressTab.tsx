import React from 'react';
import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

interface InProgressTabProps {
  title: string;
  description?: string;
}

const InProgressTab: React.FC<InProgressTabProps> = ({ 
  title, 
  description = "This feature is currently under development and will be available soon." 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(222, 107, 47, 0.02) 0%, rgba(183, 148, 244, 0.02) 100%)',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 32px rgba(222, 107, 47, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23de6b2f" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        }
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #de6b2f 0%, #b45309 100%)',
          borderRadius: '50%',
          p: 3,
          mb: 3,
          boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
            },
            '50%': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 32px rgba(222, 107, 47, 0.4)',
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 8px 24px rgba(222, 107, 47, 0.3)',
            },
          },
        }}
      >
        <ConstructionIcon 
          sx={{ 
            fontSize: 48, 
            color: '#fff',
          }} 
        />
      </Box>
      
      <Typography
        variant="h4"
        sx={{
          color: '#de6b2f',
          fontFamily: 'Lora, serif',
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: '1.8rem', md: '2.2rem' },
          textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)',
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: '#7a7a7a',
          fontFamily: 'Lora, serif',
          fontSize: { xs: '1.1rem', md: '1.2rem' },
          maxWidth: 500,
          lineHeight: 1.6,
          mb: 3,
        }}
      >
        {description}
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#b45309',
          fontFamily: 'Lora, serif',
          fontWeight: 600,
          fontSize: '1rem',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#de6b2f',
            animation: 'blink 1.5s infinite',
            '@keyframes blink': {
              '0%, 50%': { opacity: 1 },
              '51%, 100%': { opacity: 0.3 },
            },
          }}
        />
        Coming Soon...
      </Box>
    </Box>
  );
};

export default InProgressTab;

