// Simplified app configuration without complex validation
export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    retryAttempts: 3,
  },
  monitoring: {
    enableAnalytics: false,
    logLevel: 'info' as const,
  },
  performance: {
    enableServiceWorker: false,
    cacheTimeout: 300000,
  },
};

