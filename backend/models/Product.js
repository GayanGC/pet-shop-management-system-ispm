/**
 * ============================================================================
 * CLINICAL MODULE 2: PHARMACY & INVENTORY MODEL (Product.js)
 * ============================================================================
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Product item name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['Food', 'Toys', 'Accessories', 'Healthcare', 'Grooming Supplies', 'General'],
      default: 'General'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    supplier: {
      type: String,
      default: 'Direct Supplier',
      trim: true
    },
    batchNo: {
      type: String,
      default: 'BATCH-2026-01',
      trim: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    unit: {
      type: String,
      default: 'Piece',
      trim: true
    },
    isDiscontinued: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
