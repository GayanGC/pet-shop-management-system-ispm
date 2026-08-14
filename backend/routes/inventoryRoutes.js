/**
 * ============================================================================
 * MEMBER 2 MODULE: INVENTORY ROUTES (inventoryRoutes.js)
 * ============================================================================
 * Assigned to: Team Member 2 (Inventory & Stock Control System)
 * 
 * Base Path: /api/inventory
 */

const express = require('express');
const router = express.Router();
const {
  inventoryHealthCheck,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Health Check Route
router.get('/health', inventoryHealthCheck);

// Product Endpoints
router.route('/')
  .get(getAllProducts)
  .post(protect, authorize('Admin', 'Staff'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('Admin', 'Staff'), updateProduct)
  .delete(protect, authorize('Admin', 'Staff'), deleteProduct);

module.exports = router;
