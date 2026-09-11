/**
 * ============================================================================
 * SHARED MODEL: USER MODEL
 * ============================================================================
 * Explanation for Viva:
 * - Represents system users across all 4 modules.
 * - Stores user credentials and Role-Based Access Control (RBAC) roles: 'Admin', 'Staff', 'Customer'.
 * - Passwords are automatically hashed using bcryptjs before saving to DB for security.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Exclude password field by default when querying users
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'staff', 'inventory_officer', 'Admin', 'Customer', 'Staff', 'Inventory_Officer'],
      default: 'customer',
      set: (v) => (v ? v.toLowerCase() : 'customer')
    }
  },
  {
    timestamps: true // Automatically generates createdAt and updatedAt fields
  }
);

/**
 * Mongoose Pre-Save Hook:
 * Encrypt/Hash password using bcrypt before saving user to database if password was modified.
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt (10 rounds) and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Helper Instance Method: Compare entered password with hashed password in database
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
