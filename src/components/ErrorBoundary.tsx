import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
            background: '#fff7f0',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#de6b2f',
              fontFamily: 'Lora, serif',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Something went wrong
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#7a7a7a',
              fontFamily: 'Lora, serif',
              mb: 3,
              maxWidth: 500,
            }}
          >
            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              background: 'linear-gradient(90deg, #de6b2f 0%, #b45309 100%)',
              fontFamily: 'Lora, serif',
              fontWeight: 600,
              borderRadius: '0.7rem',
              px: 4,
              py: 1.5,
            }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;