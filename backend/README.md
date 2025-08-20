# 🕉️ Sivoham Backend API - Spiritual Growth Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Schemas](#database-schemas)
- [API Endpoints](#api-endpoints)
- [Authentication System](#authentication-system)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Monitoring & Logging](#monitoring--logging)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

The Sivoham Backend API is a robust Node.js/Express server that powers the spiritual growth platform. It provides comprehensive user management, course progress tracking, event management, and administrative features for the Siva Kundalini Sadhana learning platform.

### **Key Features**
- **User Management**: Registration, authentication, and profile management
- **Course System**: Progress tracking and video analytics
- **Event Management**: Registration, approval, and attendance tracking
- **Admin Dashboard**: Comprehensive management tools
- **Communication**: WhatsApp integration and messaging
- **Analytics**: Detailed user and system metrics
- **Security**: JWT authentication and data protection

---

## 🛠️ Technology Stack

### **Core Technologies**
```json
{
  "runtime": "Node.js 18.x",
  "framework": "Express.js 4.18.x",
  "database": "MongoDB 6.x with Mongoose ODM",
  "authentication": "JWT (jsonwebtoken)",
  "validation": "Joi validation library",
  "monitoring": "New Relic APM",
  "logging": "Winston logger"
}
```

### **Dependencies**
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "joi": "^17.9.2",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.10.0",
  "winston": "^3.10.0",
  "newrelic": "^10.5.0"
}
```

---

## 🗄️ Database Schemas

### **User Schema**
```javascript
const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[1-9][0-9]{9}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Demographics
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  place: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profession: {
    type: String,
    trim: true
  },
  
  // Spiritual Background
  preferredLang: {
    type: String,
    enum: ['Telugu', 'English'],
    required: true
  },
  refSource: {
    type: String,
    enum: [
      'Friends-Family',
      'SKS YouTube Videos',
      'Facebook',
      'Instagram',
      'Guruji Interview in PMC',
      'Guruji Interview in Other Channels',
      'Others'
    ],
    required: true
  },
  refSourceOther: {
    type: String,
    trim: true
  },
  referrerInfo: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  
  // System Fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  
  // Admin Permissions
  eventPermissions: {
    eventsManagement: { type: Boolean, default: false },
    eventRegistrations: { type: Boolean, default: false },
    eventUsers: { type: Boolean, default: false },
    barcodeScanner: { type: Boolean, default: false }
  },
  
  // Course Progress
  courseProgress: {
    currentLevel: {
      type: String,
      default: 'Not Started'
    },
    completedLevels: {
      type: Number,
      default: 0
    },
    totalWatchTime: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    level4Completed: {
      type: Boolean,
      default: false
    },
    lastCompletedAt: Date,
    
    // Detailed Level Progress
    levelDetails: {
      level1: {
        completed: { type: Boolean, default: false },
        watchTime: { type: Number, default: 0 },
        completedAt: Date,
        totalDays: { type: Number, default: 0 },
        dailyProgress: {
          type: Map,
          of: {
            completed: Boolean,
            watchedSeconds: Number,
            completedAt: Date,
            dayGapHours: Number
          }
        }
      },
      level2: {
        completed: { type: Boolean, default: false },
        watchTime: { type: Number, default: 0 },
        completedAt: Date,
        totalDays: { type: Number, default: 0 },
        dailyProgress: {
          type: Map,
          of: {
            completed: Boolean,
            watchedSeconds: Number,
            completedAt: Date,
            dayGapHours: Number
          }
        }
      },
      level3: {
        completed: { type: Boolean, default: false },
        watchTime: { type: Number, default: 0 },
        completedAt: Date,
        totalDays: { type: Number, default: 0 },
        dailyProgress: {
          type: Map,
          of: {
            completed: Boolean,
            watchedSeconds: Number,
            completedAt: Date,
            dayGapHours: Number
          }
        }
      },
      level4: {
        completed: { type: Boolean, default: false },
        watchTime: { type: Number, default: 0 },
        completedAt: Date,
        totalDays: { type: Number, default: 0 },
        dailyProgress: {
          type: Map,
          of: {
            completed: Boolean,
            watchedSeconds: Number,
            completedAt: Date,
            dayGapHours: Number
          }
        }
      },
      level5: {
        completed: { type: Boolean, default: false },
        watchTime: { type: Number, default: 0 },
        completedAt: Date,
        totalDays: { type: Number, default: 0 },
        dailyProgress: {
          type: Map,
          of: {
            completed: Boolean,
            watchedSeconds: Number,
            completedAt: Date,
            dayGapHours: Number
          }
        }
      }
    },
    
    // Meditation Test
    meditationTest: {
      completed: { type: Boolean, default: false },
      attempts: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      score: Number,
      completedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

### **Event Schema**
```javascript
const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  venue: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  eventType: {
    type: String,
    enum: ['unlimited', 'limited'],
    default: 'unlimited'
  },
  registrationDeadline: {
    type: Date
  },
  showScrollBanner: {
    type: Boolean,
    default: false
  },
  messageTemplate: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  capacity: {
    type: Number,
    min: 1
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  approvedCount: {
    type: Number,
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
```

### **Event Registration Schema**
```javascript
const eventRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registrationId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{9}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
    required: true
  },
  profession: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Spiritual Background
  sksLevel: {
    type: String,
    enum: [
      'Not Started',
      'Level 1 Completed',
      'Level 2 Completed',
      'Level 3 Completed',
      'Level 4 Completed',
      'Level 5 Ready'
    ],
    required: true
  },
  sksMiracle: {
    type: String,
    trim: true
  },
  
  // Registration Details
  forWhom: {
    type: String,
    enum: ['self', 'others'],
    required: true
  },
  otherDetails: {
    type: String,
    trim: true
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Communication
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappSentAt: Date,
  
  // Attendance
  attended: {
    type: Boolean,
    default: false
  },
  attendedAt: Date,
  qrCodeScanned: {
    type: Boolean,
    default: false
  },
  scannedAt: Date,
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### **Progress Schema**
```javascript
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  completedLevels: [{
    level: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    watchTime: {
      type: Number,
      default: 0
    }
  }],
  totalWatchTime: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Level-specific progress
  levelProgress: {
    type: Map,
    of: {
      started: { type: Boolean, default: false },
      completed: { type: Boolean, default: false },
      watchTime: { type: Number, default: 0 },
      lastWatched: Date,
      completedAt: Date,
      sessions: [{
        date: Date,
        duration: Number,
        completed: Boolean
      }]
    }
  },
  
  // Meditation test results
  meditationTests: [{
    level: Number,
    score: Number,
    duration: Number,
    completed: Boolean,
    completedAt: Date
  }]
}, {
  timestamps: true
});
```

### **Level Test Schema**
```javascript
const levelTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  testType: {
    type: String,
    enum: ['meditation', 'knowledge', 'practical'],
    required: true
  },
  
  // Test Results
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  
  // Test Data
  answers: [{
    question: String,
    answer: String,
    correct: Boolean,
    points: Number
  }],
  
  // Meditation specific
  meditationDuration: Number,
  meditationQuality: {
    type: String,
    enum: ['excellent', 'good', 'average', 'needs_improvement']
  },
  
  // Feedback
  feedback: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});
```

---

## 🔌 API Endpoints

### **Authentication Endpoints**
```javascript
// POST /api/auth/register
// Register new user
{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "gender": "Male",
  "age": 30,
  "country": "India",
  "place": "Hyderabad",
  "preferredLang": "English",
  "refSource": "Friends-Family",
  "referrerInfo": "Friend recommendation"
}

// POST /api/auth/login
// User login with OTP
{
  "mobile": "9876543210",
  "otp": "123456"
}

// POST /api/auth/check-mobile
// Check if mobile is registered
{
  "mobile": "9876543210"
}
```

### **User Management Endpoints**
```javascript
// GET /api/user/me/profile
// Get current user profile
Headers: { Authorization: "Bearer <token>" }

// PUT /api/user/profile
// Update user profile
{
  "firstName": "Updated Name",
  "email": "newemail@example.com"
}

// GET /api/admin/users
// Get all users (admin only)
Query: ?page=1&limit=10&status=pending

// PUT /api/admin/user/:userId/approve
// Approve user registration

// PUT /api/admin/user/:userId/reject
// Reject user registration

// PUT /api/admin/users/:userId/toggle-whatsapp
// Toggle WhatsApp sent status
```

### **Course & Progress Endpoints**
```javascript
// GET /api/progress
// Get user progress
Headers: { Authorization: "Bearer <token>" }

// POST /api/progress
// Update progress
{
  "level": 1,
  "watchTime": 1800,
  "completed": true,
  "day": 1
}

// GET /api/levelTest
// Get level test results

// POST /api/levelTest
// Submit level test
{
  "level": 1,
  "testType": "meditation",
  "duration": 1200,
  "score": 85
}
```

### **Event Management Endpoints**
```javascript
// GET /api/events
// Get all events
Query: ?upcoming=true&limit=10

// POST /api/events
// Create new event (admin only)
{
  "name": "Spiritual Gathering",
  "description": "Monthly spiritual event",
  "date": "2024-03-15T10:00:00Z",
  "venue": "Community Hall",
  "location": "Hyderabad",
  "eventType": "limited"
}

// PUT /api/events/:eventId
// Update event

// DELETE /api/events/:eventId
// Delete event

// PATCH /api/events/:eventId/banner
// Toggle banner visibility
{
  "showScrollBanner": true
}
```

### **Event Registration Endpoints**
```javascript
// POST /api/events/:eventId/register
// Register for event
{
  "fullName": "John Doe",
  "mobile": "9876543210",
  "sksLevel": "Level 1 Completed",
  "forWhom": "self"
}

// GET /api/event-registrations
// Get user's event registrations

// GET /api/event-registrations (admin)
// Get all registrations with filters
Query: ?event=eventId&status=pending&page=1

// PUT /api/event-registrations/:regId/approve
// Approve registration

// PUT /api/event-registrations/:regId/reject
// Reject registration

// PUT /api/event-registrations/:regId/attend
// Mark attendance

// PUT /api/event-registrations/:regId/toggle-whatsapp
// Toggle WhatsApp status
```

### **Admin Analytics Endpoints**
```javascript
// GET /api/admin/analytics/users
// User analytics
Response: {
  "totalUsers": 1250,
  "pendingApprovals": 45,
  "activeUsers": 980,
  "registrationTrend": [...],
  "demographicBreakdown": {...}
}

// GET /api/admin/analytics/courses
// Course analytics
Response: {
  "totalEnrollments": 850,
  "completionRates": {...},
  "averageWatchTime": 2400,
  "levelDistribution": {...}
}

// GET /api/admin/analytics/events
// Event analytics
Response: {
  "totalEvents": 24,
  "totalRegistrations": 1200,
  "attendanceRate": 85.5,
  "upcomingEvents": 3
}
```

---

## 🔐 Authentication System

### **JWT Implementation**
```javascript
// JWT Token Generation
const generateToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'sivoham-api',
      audience: 'sivoham-app'
    }
  );
};

// Token Verification Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

### **Permission System**
```javascript
// Permission Middleware
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return next();
    }
    
    // Check specific permissions
    if (resource === 'events') {
      const hasPermission = user.eventPermissions?.[action] || false;
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
    
    // Check admin status for user management
    if (resource === 'users' && !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  };
};

// Usage
app.get('/api/admin/users', 
  authenticateToken, 
  requirePermission('users', 'read'), 
  getUsersController
);
```

---

## 🚀 Installation & Setup

### **Prerequisites**
```bash
Node.js >= 18.0.0
MongoDB >= 6.0.0
npm >= 8.0.0
```

### **Quick Start**
```bash
# Clone repository
git clone https://github.com/your-org/sivoham-backend.git
cd sivoham-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### **Development Scripts**
```bash
# Start development with nodemon
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npm run db:seed
npm run db:migrate
npm run db:backup
```

---

## ⚙️ Environment Configuration

### **Environment Variables**
```bash
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGO_URI=mongodb://localhost:27017/sivoham
MONGO_TEST_URI=mongodb://localhost:27017/sivoham_test

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Monitoring
ENABLE_NEWRELIC=false
NEW_RELIC_LICENSE_KEY=your-newrelic-key
NEW_RELIC_APP_NAME=Sivoham-Backend

# Features
USE_STATELESS_MODE=false
ENABLE_CORS=true
ENABLE_HELMET=true
ENABLE_COMPRESSION=true

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
ENABLE_CONSOLE_LOG=true

# External Services
WHATSAPP_API_URL=https://api.whatsapp.com
EMAIL_SERVICE_URL=https://api.emailservice.com
```

### **Production Configuration**
```bash
# Production Environment
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sivoham
JWT_SECRET=production-jwt-secret-key
ENABLE_NEWRELIC=true
USE_STATELESS_MODE=true
LOG_LEVEL=warn
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── eventController.js
│   │   ├── progressController.js
│   │   └── adminController.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── EventRegistration.js
│   │   ├── Progress.js
│   │   └── LevelTest.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── events.js
│   │   ├── progress.js
│   │   └── admin.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── eventService.js
│   │   ├── progressService.js
│   │   └── notificationService.js
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── generators.js
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── jwt.js
│   │   ├── cors.js
│   │   └── newrelic.js
│   └── tests/               # Test files
│       ├── unit/
│       ├── integration/
│       └── fixtures/
├── logs/                    # Log files
├── docs/                    # API documentation
├── scripts/                 # Utility scripts
├── package.json
├── server.js               # Entry point
├── .env.example           # Environment template
└── README.md              # This file
```

The comprehensive backend README has been created with detailed documentation covering all aspects of the Sivoham backend API including database schemas, API endpoints, authentication, and deployment instructions.