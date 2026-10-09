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
  voidInvoice,
  getSalesAnalytics,
  exportInvoicesCSV,
  getCurrentShift,
  openShift,
  closeShift,
  getAllShifts,
  getShiftZReport
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Health Check Route
router.get('/health', billingHealthCheck);

// Analytics & CSV Export Endpoints
router.get('/analytics', getSalesAnalytics);
router.get('/export-csv', exportInvoicesCSV);

// Cashier Shift & Settlement Routes (Defined before /:id)
router.get('/shifts/current', protect, authorize('Admin', 'Staff'), getCurrentShift);
router.post('/shifts/open', protect, authorize('Admin', 'Staff'), openShift);
router.post('/shifts/close', protect, authorize('Admin', 'Staff'), closeShift);
router.post('/shifts/:id/close', protect, authorize('Admin', 'Staff'), closeShift);
router.get('/shifts', protect, authorize('Admin', 'Staff'), getAllShifts);
router.get('/shifts/:id/z-report', protect, authorize('Admin', 'Staff'), getShiftZReport);

// Protected Billing Endpoints (Restricted to Staff and Admin)
router.route('/')
  .get(protect, authorize('Admin', 'Staff'), getAllInvoices)
  .post(protect, authorize('Admin', 'Staff'), createInvoice);

router.route('/:id/void')
  .patch(protect, authorize('Admin', 'Staff'), voidInvoice)
  .post(protect, authorize('Admin', 'Staff'), voidInvoice);

router.route('/:id')
  .get(protect, authorize('Admin', 'Staff'), getInvoiceById)
  .put(protect, authorize('Admin', 'Staff'), updatePaymentStatus)
  .patch(protect, authorize('Admin', 'Staff'), updatePaymentStatus)
  .delete(protect, authorize('Admin'), voidInvoice);

router.route('/invoices')
  .get(protect, authorize('Admin', 'Staff'), getAllInvoices)
  .post(protect, authorize('Admin', 'Staff'), createInvoice);

router.route('/invoices/:id')
  .get(protect, authorize('Admin', 'Staff'), getInvoiceById)
  .put(protect, authorize('Admin', 'Staff'), updatePaymentStatus)
  .delete(protect, authorize('Admin'), voidInvoice);

module.exports = router;
