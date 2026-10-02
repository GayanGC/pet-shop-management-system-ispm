/**
 * ============================================================================
 * CLINICAL MODULE 4: POS & INVOICING MODEL (Invoice.js)
 * ============================================================================
 */

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    customerName: {
      type: String,
      default: '',
      trim: true
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true
    },
    fulfillmentMethod: {
      type: String,
      default: 'Clinic Pickup',
      trim: true
    },
    deliveryAddress: {
      type: String,
      default: '',
      trim: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    items: [invoiceItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0.01, 'Total amount must be greater than zero']
    },
    discountRate: {
      type: Number,
      default: 0,
      min: [0, 'Discount rate cannot be negative'],
      max: [50, 'Maximum allowable discount rate is 50%']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [15, 'Maximum allowable sales tax rate is 15%']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    finalTotal: {
      type: Number,
      required: true,
      min: [0.01, 'Final total must be greater than zero']
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Credit Card', 'Debit Card', 'Online', 'Bank Transfer'],
      default: 'Cash'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid'
    },
    tenderedAmount: {
      type: Number,
      default: null
    },
    changeAmount: {
      type: Number,
      default: 0
    },
    isVoided: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
