/**
 * ============================================================================
 * CLINICAL MODULE 2: SUPPLIER MODEL (Supplier.js)
 * ============================================================================
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    regNo: {
      type: String,
      trim: true,
      default: ''
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid supplier email format'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return /^(?:0|94|\+94)?[0-9]{7,10}$/.test(v.replace(/[\s-]/g, ''));
        },
        message: 'Invalid supplier phone number format'
      }
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    suppliedCategories: {
      type: [String],
      default: ['Medicines']
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
