// Simplified monitoring service without Sentry
export const initializeMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Monitoring initialized');
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.NODE_ENV === 'development') {
    console[level === 'warning' ? 'warn' : level === 'error' ? 'error' : 'log'](message);
  }
};

