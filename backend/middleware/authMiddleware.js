/**
 * ============================================================================
 * AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * ============================================================================
 * Explanation for Viva:
 * - Middleware functions run BEFORE request reaches the controller.
 * - 'protect': Verifies JSON Web Token (JWT) sent in HTTP Authorization header.
 * - 'authorize': Restricts route access based on user role (Admin, Staff, Customer).
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Middleware: Verify JWT Bearer Token
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token format: "Bearer <JWT_TOKEN>" -> Extract token string
      token = req.headers.authorization.split(' ')[1];

      // Decode token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026');

      // Fetch user from DB using id in token payload (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed: User no longer exists'
        });
      }

      // Move to next middleware or controller function
      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided in header'
    });
  }
};

/**
 * Authorize Middleware: Role-Based Access Control (RBAC)
 * Usage: authorize('Admin', 'Staff')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is permitted
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
