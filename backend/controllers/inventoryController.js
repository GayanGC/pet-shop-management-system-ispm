/**
 * ============================================================================
 * CLINICAL MODULE 2: PHARMACY & INVENTORY CONTROLLER (inventoryController.js)
 * ============================================================================
 */

const Product = require('../models/Product');

const inventoryHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Pharmacy & Inventory Control System',
    status: 'Operational',
    message: 'Pharmacy & Inventory Module connected successfully!'
  });
};

const createProduct = async (req, res) => {
  try {
    const { itemName, category, price, stockQuantity, supplier, batchNo, expiryDate, unit } = req.body;

    if (!itemName || !itemName.trim() || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide itemName, price, and stockQuantity'
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must be greater than zero'
      });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(price))) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must have at most 2 decimal places for valid currency'
      });
    }

    const numStock = Number(stockQuantity);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Stock quantity cannot be negative'
      });
    }

    // Discrete items check
    const discreteUnits = ['piece', 'unit', 'tablet', 'pill', 'vial', 'capsule', 'bottle', 'box'];
    const targetUnit = unit || 'Piece';
    if (discreteUnits.includes(String(targetUnit).toLowerCase())) {
      if (!Number.isInteger(numStock)) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: Stock quantity for discrete items (${targetUnit}) must be a whole integer.`
        });
      }
    }

    if (expiryDate) {
      const exp = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exp < today) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Expiry date cannot be in the past'
        });
      }
    }

    const product = await Product.create({
      itemName: itemName.trim(),
      category: category || 'General',
      price: numPrice,
      stockQuantity: numStock,
      supplier: supplier || 'Direct Supplier',
      batchNo: batchNo || 'BATCH-2026-01',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      unit: targetUnit
    });

    return res.status(201).json({
      success: true,
      message: 'Product added to inventory successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('[Create Product Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error adding product to inventory',
      error: error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isDiscontinued: false };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      message: 'Products fetched successfully',
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching inventory products',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDiscontinued: false });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or has been discontinued'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching product details',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { itemName, category, price, stockQuantity, supplier, batchNo, expiryDate, unit } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product || product.isDiscontinued) {
      return res.status(404).json({
        success: false,
        message: 'Product record not found for update'
      });
    }

    if (itemName && !itemName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Item name cannot be empty'
      });
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Price must be greater than zero'
        });
      }
      product.price = numPrice;
    }

    if (stockQuantity !== undefined) {
      const numStock = Number(stockQuantity);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Stock quantity cannot be negative'
        });
      }
      const targetUnit = unit || product.unit || 'Piece';
      const discreteUnits = ['piece', 'unit', 'tablet', 'pill', 'vial', 'capsule', 'bottle', 'box'];
      if (discreteUnits.includes(String(targetUnit).toLowerCase())) {
        if (!Number.isInteger(numStock)) {
          return res.status(400).json({
            success: false,
            message: `Validation Error: Stock quantity for discrete items (${targetUnit}) must be a whole integer.`
          });
        }
      }
      product.stockQuantity = numStock;
    }

    if (itemName) product.itemName = itemName.trim();
    if (category) product.category = category;
    if (supplier) product.supplier = supplier;
    if (batchNo) product.batchNo = batchNo;
    if (expiryDate) product.expiryDate = new Date(expiryDate);
    if (unit) product.unit = unit;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server Error updating product record',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDiscontinued) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or already discontinued'
      });
    }

    product.isDiscontinued = true;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product '${product.itemName}' marked as discontinued`,
      data: { _id: product._id }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error marking product as discontinued',
      error: error.message
    });
  }
};

/**
 * Quick Stock Adjustment (+ / -) Endpoint
 */
const adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;

    if (delta === undefined || isNaN(delta)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delta number (+ / -)'
      });
    }

    const product = await Product.findOne({ _id: req.params.id, isDiscontinued: false });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newQty = product.stockQuantity + Number(delta);
    if (newQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be less than zero'
      });
    }

    product.stockQuantity = newQty;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Stock updated for '${product.itemName}'. New Stock: ${product.stockQuantity}`,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error adjusting stock quantity',
      error: error.message
    });
  }
};

/**
 * Get products expiring within next 30 days or already expired
 */
const getExpiringProducts = async (req, res) => {
  try {
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const expiringProducts = await Product.find({
      isDiscontinued: false,
      expiryDate: { $ne: null, $lte: next30Days }
    }).sort({ expiryDate: 1 });

    return res.status(200).json({
      success: true,
      count: expiringProducts.length,
      data: expiringProducts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching expiring products',
      error: error.message
    });
  }
};

/**
 * Dispose / Write-off expired batch
 */
const disposeBatch = async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findOne({ _id: req.params.id, isDiscontinued: false });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product batch record not found'
      });
    }

    product.stockQuantity = 0;
    product.status = 'Disposed';
    product.disposalReason = reason || 'Batch expired - written off';
    product.disposedAt = new Date();
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Batch '${product.batchNo}' (${product.itemName}) disposed and stock written off to 0`,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error disposing product batch',
      error: error.message
    });
  }
};

module.exports = {
  inventoryHealthCheck,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adjustStock,
  getExpiringProducts,
  disposeBatch
};
