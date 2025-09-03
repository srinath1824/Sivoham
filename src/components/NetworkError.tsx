import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  message = "Unable to connect to server. Please check your internet connection." 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        p: 4,
        textAlign: 'center',
      }}
    >
      <WifiOffIcon sx={{ fontSize: 60, color: '#de6b2f', mb: 2 }} />
      <Typography
        variant="h5"
        sx={{
          color: '#de6b2f',
          fontFamily: 'Lora, serif',
          fontWeight: 600,
          mb: 2,
        }}
      >
        Connection Error
      </Typography>
      <Alert severity="warning" sx={{ mb: 3, maxWidth: 500 }}>
        {message}
      </Alert>
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
            fontFamily: 'Lora, serif',
            fontWeight: 600,
            borderRadius: '0.7rem',
            px: 4,
            py: 1.5,
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default NetworkError;

