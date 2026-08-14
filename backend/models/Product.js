/**
 * ============================================================================
 * MEMBER 2 MODULE: PRODUCT / INVENTORY MODEL (Product.js)
 * ============================================================================
 * Assigned to: Team Member 2 (Inventory & Stock Control System)
 * 
 * Explanation for Viva:
 * - Represents products, food items, and accessories in stock.
 * - Fields:
 *   * itemName: Product name.
 *   * category: Classification ('Food', 'Toys', 'Accessories', 'Healthcare', 'Grooming Supplies', 'General').
 *   * price: Unit price in currency.
 *   * stockQuantity: Current available stock count.
 *   * supplier: Vendor / manufacturer name.
 *   * unit: Unit description (e.g. 'Pack', 'Bottle', 'kg', 'Piece').
 *   * isDiscontinued: Soft-delete flag (default: false).
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
