/**
 * ============================================================================
 * MEMBER 2 MODULE: INVENTORY CONTROLLER (inventoryController.js)
 * ============================================================================
 * Assigned to: Team Member 2 (Inventory & Stock Control System)
 * 
 * Explanation for Viva:
 * - Handles CRUD operations for store products and stock control.
 * - Supports filtering by category and search by product item name.
 * - Standardized JSON response: { success: true/false, message: "...", data: ... }
 */

const Product = require('../models/Product');

/**
 * @desc    Health check endpoint for Member 2 Inventory Module
 * @route   GET /api/inventory/health
 * @access  Public
 */
const inventoryHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Member 2: Inventory & Stock Control System',
    status: 'Operational',
    message: 'Member 2: Inventory Control Module connected successfully!'
  });
};

/**
 * @desc    Create a new inventory product
 * @route   POST /api/inventory
 * @access  Private (Admin / Staff)
 */
const createProduct = async (req, res) => {
  try {
    const { itemName, category, price, stockQuantity, supplier, unit } = req.body;

    // 1. Validate required fields
    if (!itemName || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide itemName, price, and stockQuantity'
      });
    }

    // 2. Create product document
    const product = await Product.create({
      itemName,
      category: category || 'General',
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      supplier: supplier || 'Direct Supplier',
      unit: unit || 'Piece'
    });

    return res.status(201).json({
      success: true,
      message: 'Product added to inventory successfully',
      data: product
    });
  } catch (error) {
    console.error('[Create Product Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error adding product to inventory',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch all inventory products (with category filter and search)
 * @route   GET /api/inventory
 * @access  Public / Protected
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isDiscontinued: false };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
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
    console.error('[Get All Products Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching inventory products',
      error: error.message
    });
  }
};

/**
 * @desc    Fetch single product details by ID
 * @route   GET /api/inventory/:id
 * @access  Public / Protected
 */
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

/**
 * @desc    Update product details or adjust stock quantity
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin / Staff)
 */
const updateProduct = async (req, res) => {
  try {
    const { itemName, category, price, stockQuantity, supplier, unit } = req.body;

    let product = await Product.findOne({ _id: req.params.id, isDiscontinued: false });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product record not found for update'
      });
    }

    // Apply updates
    if (itemName) product.itemName = itemName;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (supplier) product.supplier = supplier;
    if (unit) product.unit = unit;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating product record',
      error: error.message
    });
  }
};

/**
 * @desc    Soft delete / mark product as discontinued
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin / Staff)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDiscontinued) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or already discontinued'
      });
    }

    // Soft delete flag
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

module.exports = {
  inventoryHealthCheck,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
