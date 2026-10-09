/**
 * ============================================================================
 * CLINICAL MODULE 4: CASHIER SHIFT & Z-REPORT MODEL (CashierShift.js)
 * ============================================================================
 */

const mongoose = require('mongoose');

const cashierShiftSchema = new mongoose.Schema(
  {
    shiftNo: {
      type: String,
      required: [true, 'Shift reference number is required'],
      unique: true,
      trim: true
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier reference is required']
    },
    cashierName: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open'
    },
    openingFloat: {
      type: Number,
      default: 0,
      min: [0, 'Opening float cannot be negative']
    },
    openedAt: {
      type: Date,
      default: Date.now
    },
    closedAt: {
      type: Date,
      default: null
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    totalInvoicesCount: {
      type: Number,
      default: 0
    },
    voidedInvoicesCount: {
      type: Number,
      default: 0
    },
    grossSales: {
      type: Number,
      default: 0
    },
    netSales: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    totalDiscount: {
      type: Number,
      default: 0
    },
    cashSales: {
      type: Number,
      default: 0
    },
    cardSales: {
      type: Number,
      default: 0
    },
    onlineSales: {
      type: Number,
      default: 0
    },
    expectedCashInDrawer: {
      type: Number,
      default: 0
    },
    actualCashCounted: {
      type: Number,
      default: 0
    },
    cashDiscrepancy: {
      type: Number,
      default: 0
    },
    closingNotes: {
      type: String,
      default: '',
      trim: true
    },
    zReportNo: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CashierShift', cashierShiftSchema);
