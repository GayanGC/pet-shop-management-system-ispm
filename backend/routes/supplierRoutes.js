/**
 * ============================================================================
 * CLINICAL MODULE 2: SUPPLIER ROUTES (supplierRoutes.js)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSuppliers)
  .post(protect, authorize('Admin', 'Staff'), createSupplier);

router.route('/:id')
  .put(protect, authorize('Admin', 'Staff'), updateSupplier)
  .delete(protect, authorize('Admin', 'Staff'), deleteSupplier);

module.exports = router;
