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
  .post(protect, authorize('admin', 'Admin', 'staff', 'Staff', 'inventory_officer'), createSupplier);

router.route('/:id')
  .put(protect, authorize('admin', 'Admin', 'staff', 'Staff', 'inventory_officer'), updateSupplier)
  .delete(protect, authorize('admin', 'Admin', 'staff', 'Staff', 'inventory_officer'), deleteSupplier);

module.exports = router;
