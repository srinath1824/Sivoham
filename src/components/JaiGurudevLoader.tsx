import React from 'react';
import { Box, Typography } from '@mui/material';

interface JaiGurudevLoaderProps {
  size?: 'small' | 'medium' | 'large';
}

export default function JaiGurudevLoader({ size = 'medium' }: JaiGurudevLoaderProps) {
  const sizeConfig = {
    small: { fontSize: '1rem', spacing: 2, circleSize: 120, emojiSize: '2.5rem' },
    medium: { fontSize: '1.5rem', spacing: 3, circleSize: 160, emojiSize: '3rem' },
    large: { fontSize: '2rem', spacing: 4, circleSize: 200, emojiSize: '3.5rem' }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: sizeConfig[size].spacing,
        py: sizeConfig[size].spacing,
        px: 3,
        // background: 'rgba(255, 247, 240, 0.8)',
        // borderRadius: 3,
        // backdropFilter: 'blur(10px)',
        // boxShadow: '0 4px 20px rgba(222,107,47,0.1)'
      }}
    >
      {/* Circular Background with Prayer Hands */}
      {/* <Box
        sx={{
          width: sizeConfig[size].circleSize,
          height: sizeConfig[size].circleSize,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff7f0 0%, #ffeee0 100%)',
          border: '3px solid rgba(222,107,47,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(222,107,47,0.15)'
        }}
      >
        <Box
          sx={{
            fontSize: sizeConfig[size].emojiSize,
            animation: 'bounce 1.5s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0) scale(1)' },
              '50%': { transform: 'translateY(-8px) scale(1.1)' }
            }
          }}
        >
          🙏
        </Box>
      </Box> */}
      
      {/* Text with Inline Animated Dots */}
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
        <Box component="span" sx={{ display: 'inline-flex', ml: 0.2 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              component="span"
              sx={{
                fontSize: 'inherit',
                color: '#de6b2f',
                animation: `dotFade 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.3}s`,
                '@keyframes dotFade': {
                  '0%, 60%, 100%': { 
                    opacity: 0.3
                  },
                  '30%': { 
                    opacity: 1
                  }
                }
              }}
            >
              .
            </Box>
          ))}
        </Box>
      </Typography>
    </Box>
  );
}