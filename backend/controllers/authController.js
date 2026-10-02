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

const { sendStaffWelcomeEmail, getRoleTitle } = require('../utils/emailService');

const SL_PHONE_REGEX = /^(?:0|94|\+94)?7[0-9]{8}$/;
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_STAFF_ROLES = ['veterinarian', 'inventory', 'cashier', 'admin'];

/**
 * @desc    Register a new staff member (Admin only) and dispatch credential email
 * @route   POST /api/auth/register-staff
 * @access  Private (Admin only)
 */
const registerStaff = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    // 1. Validation checks
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Full name is required for staff member'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Official email address is required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!RFC_EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide a valid email address format'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Contact phone number is required'
      });
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!SL_PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invalid Sri Lankan mobile phone format (must be 07XXXXXXXX or +947XXXXXXXX)'
      });
    }

    if (!role || !ALLOWED_STAFF_ROLES.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Invalid role. Allowed clinical roles: ${ALLOWED_STAFF_ROLES.join(', ')}`
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Password must be at least 6 characters long'
      });
    }

    // 2. Check for duplicate email in MongoDB Atlas
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Conflict Error: An account with email '${cleanEmail}' already exists in the clinic directory.`
      });
    }

    // Check for duplicate phone
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: `Conflict Error: A user with phone number '${cleanPhone}' is already registered.`
      });
    }

    // 3. Save new staff member into MongoDB Atlas (User.pre('save') handles bcrypt hashing)
    const normalizedRole = role.toLowerCase();
    const newStaff = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      role: normalizedRole,
      petsCount: 0
    });

    // 4. Asynchronously dispatch the official welcome email with initial credentials
    sendStaffWelcomeEmail(newStaff, password).catch((err) => {
      console.error('[Async Welcome Email Error]:', err.message);
    });

    const roleTitle = getRoleTitle(normalizedRole);

    return res.status(201).json({
      success: true,
      message: `Staff member '${newStaff.name}' provisioned successfully as ${roleTitle}. Credentials have been dispatched to ${newStaff.email}.`,
      data: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        roleTitle,
        createdAt: newStaff.createdAt
      }
    });
  } catch (error) {
    console.error('[Staff Registration Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error provisioning staff member',
      error: error.message
    });
  }
};

/**
 * @desc    Get all staff directory members (Admin & Clinical Staff)
 * @route   GET /api/auth/staff
 * @access  Private (Admin or Staff)
 */
const getStaffDirectory = async (req, res) => {
  try {
    const staffMembers = await User.find({
      role: { $in: ['admin', 'veterinarian', 'inventory', 'cashier', 'staff', 'Admin', 'Veterinarian', 'Inventory', 'Cashier', 'Staff'] }
    }).select('-password').sort({ createdAt: -1 });

    const formattedStaff = staffMembers.map(s => {
      const obj = s.toObject();
      obj.roleTitle = getRoleTitle(s.role);
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: formattedStaff.length,
      data: formattedStaff
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching staff directory',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  registerStaff,
  getStaffDirectory
};
