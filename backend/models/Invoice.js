/**
 * ============================================================================
 * MEMBER 4 MODULE: INVOICE / BILLING MODEL (Invoice.js)
 * ============================================================================
 * Assigned to: Team Member 4 (Order Processing & POS Billing System)
 * 
 * Explanation for Viva:
 * - Represents POS transactions and store sales invoices.
 * - Fields:
 *   * invoiceNo: Unique identifier string (e.g. INV-2026-001).
 *   * customerId: Ref to User document (optional for walk-in guest purchases).
 *   * items: Array of purchased product items with line-item subtotals.
 *   * totalAmount: Total computed transaction cost.
 *   * paymentMethod: Payment channel ('Cash', 'Card', 'Online').
 *   * paymentStatus: Transaction status ('Paid', 'Pending').
 *   * isVoided: Soft delete / voided order flag (default: false).
 */

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Optional for custom non-inventoried items
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
      required: false // Nullable for walk-in counter customers
    },
    items: [invoiceItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Online'],
      default: 'Cash'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid'
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
