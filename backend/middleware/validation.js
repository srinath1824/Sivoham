const { body, validationResult } = require('express-validator');

// Sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"'&]/g, '').trim();
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Event registration validation
const validateEventRegistration = [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('fullName').isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('mobile').isMobilePhone().withMessage('Invalid mobile number'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1-120'),
  body('address').isLength({ min: 5, max: 500 }).withMessage('Address must be 5-500 characters'),
  body('sksLevel').isLength({ min: 1, max: 50 }).withMessage('SKS Level is required'),
  body('sksMiracle').isLength({ min: 1, max: 100 }).withMessage('SKS Miracle response is required'),
  body('forWhom').isIn(['self', 'other']).withMessage('Invalid forWhom value'),
  validateRequest
];

// User registration validation
const validateUserRegistration = [
  body('firstName').isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('mobile').isMobilePhone().withMessage('Invalid mobile number'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  validateRequest
];

// Progress update validation
const validateProgressUpdate = [
  body('level').isInt({ min: 1, max: 5 }).withMessage('Level must be between 1-5'),
  body('day').isInt({ min: 1, max: 30 }).withMessage('Day must be between 1-30'),
  body('completed').isBoolean().withMessage('Completed must be boolean'),
  body('watchedSeconds').optional().isInt({ min: 0 }).withMessage('Watched seconds must be positive'),
  body('videoDuration').optional().isInt({ min: 0 }).withMessage('Video duration must be positive'),
  validateRequest
];

module.exports = {
  validateEventRegistration,
  validateUserRegistration,
  validateProgressUpdate,
  sanitizeInput
};