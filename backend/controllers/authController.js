/**
 * ============================================================================
 * SHARED CONTROLLER: AUTHENTICATION CONTROLLER
 * ============================================================================
 * Explanation for Viva:
 * - Handles User Registration, Authentication (Login), and User Profile fetching.
 * - Generates JWT (JSON Web Tokens) containing user ID and Role.
 * - Uses standard HTTP Status Codes (201 Created, 200 OK, 400 Bad Request, 401 Unauthorized).
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Helper Utility: Generate JWT Token
 * @param {String} id - MongoDB User Document ID
 * @param {String} role - User Role (Admin, Staff, Customer)
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026',
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

/**
 * @desc    Register a new user (Customer / Staff / Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation check for required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // 3. Create user (Password hashing is automatically handled in User.js pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer' // Defaults to Customer if not specified
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      // 4. Return user details and JWT Token
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userData,
        data: {
          ...userData,
          token
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received'
      });
    }
  } catch (error) {
    console.error('[Register Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error during user registration',
      error: error.message
    });
  }
};

/**
 * @desc    Authenticate user & get JWT token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 2. Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    // 3. Verify user existence and compare password using matchPassword method
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        token,
        user: userData,
        data: {
          ...userData,
          token
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials'
      });
    }
  } catch (error) {
    console.error('[Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error during user authentication',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private (Protected by JWT)
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching user profile',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
