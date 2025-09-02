const express = require('express');
const cors = require('cors');
const csrf = require('csurf');
require('dotenv').config();
const connectDB = require('./db');
const { generalLimiter, authLimiter, securityHeaders } = require('./middleware/security');
const { validateEventRegistration, validateUserRegistration, validateProgressUpdate } = require('./middleware/validation');

// Sanitization function for logs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return String(input);
  return encodeURIComponent(input).replace(/[\r\n]/g, '');
};

const app = express();
const PORT = process.env.PORT || 5000;

// Global error handler to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', sanitizeForLog(String(promise)), 'reason:', sanitizeForLog(String(reason)));
  process.exit(1);
});

// Feature flag for stateless mode (set via environment variable or config)
const USE_STATELESS_MODE = process.env.USE_STATELESS_MODE === 'true';

// Enable New Relic monitoring if feature flag is set
if (process.env.ENABLE_NEWRELIC === 'true') {
  // IMPORTANT: newrelic must be required before anything else
  require('newrelic');
  // Configure New Relic via newrelic.js or environment variables
}

/**
 * Stateless mode requirements:
 * - All backend instances must connect to the same MongoDB cluster.
 * - JWT_SECRET must be the same across all instances.
 * - No local file storage for user data (videos should be on CDN/cloud).
 * - Use /api/health for load balancer health checks.
 */

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Protection (only for state-changing operations)
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Apply CSRF and rate limiting to routes
app.use('/api/auth', authLimiter, csrfProtection);
app.use('/api/admin', csrfProtection);
app.use('/api/events', csrfProtection);
app.use('/api/event-registrations', csrfProtection);
app.use('/api/progress', csrfProtection);
app.use('/api/user', csrfProtection);

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Trust proxy for rate limiting
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.send({ status: 'Backend server running!' });
});

// Health check endpoint for load balancers
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', stateless: USE_STATELESS_MODE });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/event-registrations', require('./routes/eventRegistrations'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 