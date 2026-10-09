/**
 * ============================================================================
 * SHARED ROUTE: AUTHENTICATION ROUTES
 * ============================================================================
 * Explanation for Viva:
 * - Express Router maps incoming HTTP requests to their controller functions.
 * - Endpoints: /api/auth/register, /api/auth/login, /api/auth/profile
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  registerStaff,
  getStaffDirectory
} = require('../controllers/authController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Lightweight Auth Rate Limiter (Brute-Force Attack Mitigation)
const authAttempts = new Map();

// Periodic memory purge every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of authAttempts.entries()) {
    if (now > data.resetTime) {
      authAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 15;

  let record = authAttempts.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    authAttempts.set(ip, record);
    return next();
  }

  record.count++;
  if (record.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    });
  }

  next();
};

// Public endpoints with brute-force rate limiting
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);

// Protected endpoints (Requires valid JWT in Authorization header)
router.get('/profile', protect, getUserProfile);

// Admin-Only Staff Provisioning & Directory
router.post('/register-staff', protect, adminMiddleware, registerStaff);
router.get('/staff', protect, getStaffDirectory);

module.exports = router;
