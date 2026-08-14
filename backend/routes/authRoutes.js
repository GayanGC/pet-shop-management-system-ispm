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
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected endpoints (Requires valid JWT in Authorization header)
router.get('/profile', protect, getUserProfile);

module.exports = router;
