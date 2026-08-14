/**
 * ============================================================================
 * MEMBER 3 MODULE: BOOKING CONTROLLER (bookingController.js)
 * ============================================================================
 * Assigned to: Team Member 3 (Service & Appointment Booking System)
 * 
 * Explanation for Viva:
 * - Manages appointment bookings, slot validation, and status updates.
 * - Prevents double booking for the same pet on the same date and time slot.
 * - Populates petId (petName, species, uniquePin) and customerId (name, email).
 */

const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

/**
 * @desc    Health check endpoint for Member 3 Booking Module
 * @route   GET /api/bookings/health
 * @access  Public
 */
const bookingHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Member 3: Service & Appointment Booking System',
    status: 'Operational',
    message: 'Member 3: Appointment Booking Module connected successfully!'
  });
};

/**
 * @desc    Create a new appointment booking
 * @route   POST /api/bookings
 * @access  Private (Protected by JWT)
 */
const createBooking = async (req, res) => {
  try {
    const { petId, customerId, serviceType, appointmentDate, timeSlot, notes } = req.body;

    // 1. Validate required fields
    if (!petId || !serviceType || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide petId, serviceType, appointmentDate, and timeSlot'
      });
    }

    // 2. Determine target customer owner
    const targetCustomer = customerId || (req.user ? req.user._id : null);
    if (!targetCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer user required for booking'
      });
    }

    // 3. Verify pet exists
    const pet = await Pet.findById(petId);
    if (!pet || pet.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Selected pet record does not exist or is archived'
      });
    }

    // 4. Basic slot conflict check for the same pet on the same date & time slot
    const parsedDate = new Date(appointmentDate);
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const existingBooking = await Appointment.findOne({
      petId,
      timeSlot,
      status: { $ne: 'Cancelled' },
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `Appointment conflict: Pet already has an active booking at ${timeSlot} on this date`
      });
    }

    // 5. Create appointment record
    const appointment = await Appointment.create({
      petId,
      customerId: targetCustomer,
      serviceType,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes: notes || '',
      status: 'Pending'
    });

    // 6. Populate response references
    await appointment.populate('petId', 'petName species breed uniquePin');
    await appointment.populate('customerId', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('[Create Booking Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error creating appointment booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get all appointment bookings (with status filter and populated details)
 * @route   GET /api/bookings
 * @access  Private / Protected
 */
const getAllBookings = async (req, res) => {
  try {
    const { status, customerId } = req.query;

    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    const bookings = await Appointment.find(query)
      .populate('petId', 'petName species breed uniquePin ownerId')
      .populate('customerId', 'name email role')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      message: 'Appointments fetched successfully',
      data: bookings
    });
  } catch (error) {
    console.error('[Get All Bookings Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching appointment bookings',
      error: error.message
    });
  }
};

/**
 * @desc    Get single booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private / Protected
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Appointment.findById(req.params.id)
      .populate('petId', 'petName species breed uniquePin')
      .populate('customerId', 'name email role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching appointment details',
      error: error.message
    });
  }
};

/**
 * @desc    Update appointment details or status (Confirm, Complete, Cancel)
 * @route   PUT /api/bookings/:id
 * @access  Private / Protected
 */
const updateBooking = async (req, res) => {
  try {
    const { serviceType, appointmentDate, timeSlot, status, notes } = req.body;

    let booking = await Appointment.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found for update'
      });
    }

    // Apply updates
    if (serviceType) booking.serviceType = serviceType;
    if (appointmentDate) booking.appointmentDate = new Date(appointmentDate);
    if (timeSlot) booking.timeSlot = timeSlot;
    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;

    const updatedBooking = await booking.save();
    await updatedBooking.populate('petId', 'petName species breed uniquePin');
    await updatedBooking.populate('customerId', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating appointment record',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel appointment (Soft status change to 'Cancelled')
 * @route   DELETE /api/bookings/:id
 * @access  Private / Protected
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Appointment.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found'
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment successfully cancelled',
      data: { _id: booking._id, status: 'Cancelled' }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error cancelling appointment',
      error: error.message
    });
  }
};

module.exports = {
  bookingHealthCheck,
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};
