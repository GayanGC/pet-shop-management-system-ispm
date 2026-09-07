/**
 * ============================================================================
 * MEMBER 3 MODULE: BOOKING ROUTES (bookingRoutes.js)
 * ============================================================================
 * Assigned to: Team Member 3 (Service & Appointment Booking System)
 * 
 * Base Path: /api/bookings
 */

const express = require('express');
const router = express.Router();
const {
  bookingHealthCheck,
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getDoctorDaySchedule
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Health Check Route
router.get('/health', bookingHealthCheck);

// Doctor Schedule Endpoint
router.get('/schedule', getDoctorDaySchedule);

// Booking Endpoints
router.route('/')
  .get(protect, getAllBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;
