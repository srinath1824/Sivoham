import React from 'react';
import { Box, Typography } from '@mui/material';

interface JaiGurudevLoaderProps {
  size?: 'small' | 'medium' | 'large';
}

export default function JaiGurudevLoader({ size = 'medium' }: JaiGurudevLoaderProps) {
  const sizeConfig = {
    small: { fontSize: '1rem', spacing: 2 },
    medium: { fontSize: '1.5rem', spacing: 3 },
    large: { fontSize: '2rem', spacing: 4 }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: sizeConfig[size].spacing,
        py: sizeConfig[size].spacing
      }}
    >
      <Box
        sx={{
          fontSize: '3rem',
          animation: 'bounce 1.5s ease-in-out infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-10px) scale(1.1)' }
          }
        }}
      >
        🙏
      </Box>
      <Typography 
        sx={{ 
          fontFamily: 'Lora, serif',
          fontSize: sizeConfig[size].fontSize,
          fontWeight: 600,
          color: '#b45309',
          textAlign: 'center',
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.7 },
            '50%': { opacity: 1 }
          }
        }}
      >
        Jai Gurudev
      </Typography>
    </Box>
  );
}