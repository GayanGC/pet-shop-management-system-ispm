/**
 * ============================================================================
 * MEMBER 4 MODULE: BILLING ROUTES (billingRoutes.js)
 * ============================================================================
 * Assigned to: Team Member 4 (Order Processing & POS Billing System)
 * 
 * Base Path: /api/billing
 */

const express = require('express');
const router = express.Router();
const {
  billingHealthCheck,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updatePaymentStatus,
  voidInvoice
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Health Check Route
router.get('/health', billingHealthCheck);

// Protected Billing Endpoints (Restricted to Staff and Admin)
router.route('/')
  .get(protect, authorize('Admin', 'Staff'), getAllInvoices)
  .post(protect, authorize('Admin', 'Staff'), createInvoice);

router.route('/:id')
  .get(protect, authorize('Admin', 'Staff'), getInvoiceById)
  .put(protect, authorize('Admin', 'Staff'), updatePaymentStatus)
  .delete(protect, authorize('Admin'), voidInvoice);

module.exports = router;
