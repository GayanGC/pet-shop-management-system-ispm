/**
 * ============================================================================
 * CLINICAL MODULE 3: APPOINTMENT SCHEDULING CONTROLLER (bookingController.js)
 * ============================================================================
 */

const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

const bookingHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Appointment Scheduling System',
    status: 'Operational',
    message: 'Appointment Scheduling Module connected successfully!'
  });
};

const createBooking = async (req, res) => {
  try {
    const { petId, customerId, serviceType, assignedStaff, appointmentDate, timeSlot, notes } = req.body;

    if (!petId || !serviceType || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide petId, serviceType, appointmentDate, and timeSlot'
      });
    }

    const targetCustomer = customerId || (req.user ? req.user._id : null);
    if (!targetCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer user required for booking'
      });
    }

    const pet = await Pet.findById(petId);
    if (!pet || pet.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Selected pet patient record does not exist or is archived'
      });
    }

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
        message: `Appointment Slot Conflict: Pet already has an active booking at ${timeSlot} on this date`
      });
    }

    const appointment = await Appointment.create({
      petId,
      customerId: targetCustomer,
      serviceType,
      assignedStaff: assignedStaff || 'Dr. Perera (Senior Vet)',
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes: notes || '',
      status: 'Pending'
    });

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
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching appointment bookings',
      error: error.message
    });
  }
};

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

const updateBooking = async (req, res) => {
  try {
    const { serviceType, assignedStaff, appointmentDate, timeSlot, status, notes } = req.body;

    let booking = await Appointment.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found for update'
      });
    }

    if (serviceType) booking.serviceType = serviceType;
    if (assignedStaff) booking.assignedStaff = assignedStaff;
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
