/**
 * ============================================================================
 * SHARED MODEL: USER MODEL
 * ============================================================================
 * Supports Dual-Identifier Authentication (Email OR Phone Number),
 * 5-Role RBAC ('admin', 'customer', 'staff', 'inventory_officer', 'cashier'),
 * and Pet count tracking.
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
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: [
        'admin', 'customer', 'staff', 'inventory_officer', 'cashier',
        'veterinarian', 'clinical', 'inventory', 'client',
        'Admin', 'Customer', 'Staff', 'Inventory_Officer', 'Cashier',
        'Veterinarian', 'Clinical', 'Inventory', 'Client'
      ],
      default: 'customer',
      set: (v) => (v ? v.toLowerCase() : 'customer')
    },
    petsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Please provide either an email address or a phone number');
    this.invalidate('phone', 'Please provide either an email address or a phone number');
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
