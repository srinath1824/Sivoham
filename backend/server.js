const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(cors());
app.use(express.json());

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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 