import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { captureException } from '../services/monitoring';

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorContext = {
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    };

    // Log to monitoring service
    captureException(error, errorContext);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorContext);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  override componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.handleRetry} />;
      }

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
            borderRadius: 2,
            m: 2,
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
            🚨 Something went wrong
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
            We're sorry, but something unexpected happened. Our team has been notified.
          </Typography>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Alert severity="error" sx={{ mb: 3, maxWidth: 600, textAlign: 'left' }}>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {this.state.error?.message}
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={this.handleRetry}
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
            
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderColor: '#de6b2f',
                color: '#de6b2f',
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

          {this.state.errorId && (
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                mt: 2,
                fontFamily: 'monospace',
              }}
            >
              Error ID: {this.state.errorId}
            </Typography>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

