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
    const startOfDay = new Date(new Date(parsedDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(parsedDate).setHours(23, 59, 59, 999));
    const staffToUse = assignedStaff || 'Dr. Perera (Senior Vet)';

    // Strict Double Booking Guard (Doctor + Date + Slot)
    const existingConflict = await Appointment.findOne({
      assignedStaff: staffToUse,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (existingConflict) {
      const dateStr = startOfDay.toISOString().split('T')[0];
      return res.status(409).json({
        success: false,
        message: `Slot Conflict: ${staffToUse} is already booked on ${dateStr} at ${timeSlot}. Please select a different slot.`
      });
    }

    const appointment = await Appointment.create({
      petId,
      customerId: targetCustomer,
      serviceType,
      assignedStaff: staffToUse,
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

    // Private Scoping for Customer Role: only see own appointments
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      const userPets = await Pet.find({ ownerId: req.user._id }, '_id');
      const userPetIds = userPets.map((p) => p._id);

      query.$or = [
        { customerId: req.user._id },
        { petId: { $in: userPetIds } }
      ];
    } else if (customerId) {
      query.customerId = customerId;
    }

    const bookings = await Appointment.find(query)
      .populate('petId', 'petName species breed uniquePin ownerId')
      .populate('customerId', 'name email phone role')
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

    const docToUse = assignedStaff || booking.assignedStaff;
    const dateToUse = appointmentDate ? new Date(appointmentDate) : booking.appointmentDate;
    const slotToUse = timeSlot || booking.timeSlot;

    // Strict Double Booking Guard for Updates / Rescheduling
    if (assignedStaff || appointmentDate || timeSlot) {
      const startOfDay = new Date(new Date(dateToUse).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(dateToUse).setHours(23, 59, 59, 999));

      const existingConflict = await Appointment.findOne({
        _id: { $ne: req.params.id },
        assignedStaff: docToUse,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: slotToUse,
        status: { $ne: 'Cancelled' }
      });

      if (existingConflict) {
        const dateStr = startOfDay.toISOString().split('T')[0];
        return res.status(409).json({
          success: false,
          message: `Slot Conflict: ${docToUse} is already booked on ${dateStr} at ${slotToUse}. Please select a different slot.`
        });
      }
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

/**
 * GET Doctor Day Schedule Aggregation
 */
const getDoctorDaySchedule = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    const docToUse = doctor || 'Dr. Perera (Senior Vet)';
    const queryDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(new Date(queryDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(queryDate).setHours(23, 59, 59, 999));

    const bookings = await Appointment.find({
      assignedStaff: docToUse,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'Cancelled' }
    })
      .populate('petId', 'petName species breed uniquePin')
      .populate('customerId', 'name email role');

    const workingSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

    const schedule = workingSlots.map((slot) => {
      const match = bookings.find((b) => b.timeSlot === slot);
      return {
        timeSlot: slot,
        status: match ? 'booked' : 'available',
        booking: match || null
      };
    });

    return res.status(200).json({
      success: true,
      doctor: docToUse,
      date: startOfDay.toISOString().split('T')[0],
      data: schedule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching doctor schedule',
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
  deleteBooking,
  getDoctorDaySchedule
};
