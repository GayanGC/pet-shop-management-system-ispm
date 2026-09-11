/**
 * ============================================================================
 * SHARED CONTROLLER: AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * Supports:
 * - Dual-Identifier Authentication (Email OR Phone Number)
 * - Multi-Pet Onboarding Wizard registration (creates Pet docs + assigns PINs)
 * - 4-Role RBAC ('admin', 'customer', 'staff', 'inventory_officer')
 */

const User = require('../models/User');
const Pet = require('../models/Pet');
const jwt = require('jsonwebtoken');

/**
 * Helper Utility: Generate JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026',
    { expiresIn: '30d' }
  );
};

/**
 * Helper Utility: Generate Unique 4-digit PIN for Pets
 */
const generateUniquePin = async () => {
  let isUnique = false;
  let pin = '';
  while (!isUnique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    pin = `PET-${randomDigits}`;
    const existing = await Pet.findOne({ uniquePin: pin });
    if (!existing) isUnique = true;
  }
  return pin;
};

/**
 * @desc    Register a new user (with optional initial pets)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, initialPets } = req.body;

    // 1. Validation check for required fields
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name and password'
      });
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    const trimmedPhone = phone ? phone.trim() : null;

    if (!trimmedEmail && !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either an Email Address or a Phone Number'
      });
    }

    // 2. Check if user already exists with either email or phone
    const orConditions = [];
    if (trimmedEmail) orConditions.push({ email: trimmedEmail });
    if (trimmedPhone) orConditions.push({ phone: trimmedPhone });

    const existingUser = await User.findOne({ $or: orConditions });
    if (existingUser) {
      const matchType = existingUser.email === trimmedEmail ? 'email address' : 'phone number';
      return res.status(400).json({
        success: false,
        message: `An account already exists with this ${matchType}`
      });
    }

    // 3. Create user document
    const petsList = Array.isArray(initialPets) ? initialPets.filter((p) => p && p.petName) : [];

    const user = await User.create({
      name,
      email: trimmedEmail || undefined,
      phone: trimmedPhone || undefined,
      password,
      role: role || 'customer',
      petsCount: petsList.length
    });

    // 4. Automatically create Pet records if provided during onboarding
    const createdPets = [];
    if (petsList.length > 0) {
      for (const p of petsList) {
        try {
          const pin = await generateUniquePin();
          const newPet = await Pet.create({
            uniquePin: pin,
            petName: p.petName.trim(),
            species: p.species || 'Dog',
            breed: p.breed || 'Unknown/Mixed',
            age: Number(p.age) || 1,
            weight: Number(p.weight) || 0,
            gender: p.gender || 'Male',
            ownerId: user._id,
            status: 'Available',
            clinicStatus: 'Registered'
          });
          createdPets.push(newPet);
        } catch (petErr) {
          console.error('[Onboarding Pet Error]:', petErr.message);
        }
      }
    }

    const token = generateToken(user._id, user.role);
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      petsCount: createdPets.length
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userData,
      createdPets,
      data: {
        ...userData,
        token
      }
    });
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
 * @desc    Authenticate user (Email OR Phone Number) & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;

    const rawId = identifier || email || phone;

    // 1. Validate fields
    if (!rawId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Email or Phone Number and Password'
      });
    }

    const trimmedId = rawId.trim();

    // 2. Find user by either email or phone number
    const user = await User.findOne({
      $or: [
        { email: trimmedId.toLowerCase() },
        { phone: trimmedId }
      ]
    }).select('+password');

    // 3. Verify user existence and password
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        petsCount: user.petsCount || 0
      };

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
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
        message: 'Invalid login credentials. Please check your email/phone and password.'
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
    const user = await User.findById(req.user._id);

    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          petsCount: user.petsCount || 0,
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
