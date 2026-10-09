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
      enum: ['Food', 'Toys', 'Accessories', 'Healthcare', 'Clinical Supplies', 'General', 'Medicines', 'Medicine', 'Vaccines', 'Nutrition', 'Supplements'],
      default: 'General'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be greater than zero']
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
      validate: {
        validator: function (v) {
          const discreteUnits = ['piece', 'unit', 'tablet', 'pill', 'vial', 'capsule', 'bottle', 'box'];
          if (this.unit && discreteUnits.includes(String(this.unit).toLowerCase())) {
            return Number.isInteger(v);
          }
          return true;
        },
        message: 'Stock quantity for discrete units (pills, vials, pieces, bottles) must be a whole integer'
      }
    },
    supplier: {
      type: String,
      default: 'Direct Supplier',
      trim: true
    },
    batchNo: {
      type: String,
      default: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `BATCH-${year}${month}-${randomSuffix}`;
      },
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
    },
    status: {
      type: String,
      enum: ['Active', 'Disposed', 'Expired'],
      default: 'Active'
    },
    disposalReason: {
      type: String,
      default: null
    },
    disposedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
