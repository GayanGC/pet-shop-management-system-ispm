/**
 * ============================================================================
 * CLINICAL MODULE 3: APPOINTMENT SCHEDULING CONTROLLER (bookingController.js)
 * ============================================================================
 */

const mongoose = require('mongoose');
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

    const dateOnly = typeof appointmentDate === 'string' ? appointmentDate.slice(0, 10) : new Date(appointmentDate).toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    const staffToUse = assignedStaff || 'Dr. Perera (Senior Vet)';
    const targetPetId = mongoose.Types.ObjectId.isValid(petId) ? new mongoose.Types.ObjectId(petId) : petId;

    // 1. Strict Double Booking Guard (Doctor + Date + Slot)
    const existingConflict = await Appointment.findOne({
      assignedStaff: staffToUse,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `Slot Conflict: ${staffToUse} is already booked on ${dateOnly} at ${timeSlot}. Please select a different slot.`
      });
    }

    // 2. Same-Day Duplicate Booking Guard for Same Pet (unless Emergency reason entered)
    const notesLower = notes ? notes.toLowerCase() : '';
    const isEmergency = notesLower && (
      (notesLower.includes('emergency') && !notesLower.includes('non-emergency')) ||
      (notesLower.includes('urgent') && !notesLower.includes('non-urgent')) ||
      notesLower.includes('critical')
    );

    if (!isEmergency) {
      const sameDayPetBooking = await Appointment.findOne({
        petId: targetPetId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'Cancelled' }
      });

      if (sameDayPetBooking) {
        return res.status(400).json({
          success: false,
          message: `Duplicate Patient Booking: This pet already has an appointment scheduled on ${dateOnly} (${sameDayPetBooking.timeSlot}). To schedule another visit on the same day, please include an Emergency Reason in notes.`
        });
      }
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
    const dateOnly = appointmentDate 
      ? (typeof appointmentDate === 'string' ? appointmentDate.slice(0, 10) : new Date(appointmentDate).toISOString().slice(0, 10))
      : (typeof booking.appointmentDate === 'string' ? booking.appointmentDate.slice(0, 10) : new Date(booking.appointmentDate).toISOString().slice(0, 10));
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    const slotToUse = timeSlot || booking.timeSlot;

    const targetId = mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : req.params.id;

    // 1. Strict Double Booking Guard for Updates / Rescheduling (Doctor + Date + Slot)
    if (assignedStaff || appointmentDate || timeSlot) {
      const existingConflict = await Appointment.findOne({
        _id: { $ne: targetId },
        assignedStaff: docToUse,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: slotToUse,
        status: { $ne: 'Cancelled' }
      });

      if (existingConflict) {
        return res.status(409).json({
          success: false,
          message: `Slot Conflict: ${docToUse} is already booked on ${dateOnly} at ${slotToUse}. Please select a different slot.`
        });
      }
    }

    // 2. Duplicate same-day pet appointment guard (unless emergency)
    const checkNotesLower = (notes !== undefined ? notes : (booking.notes || '')).toLowerCase();
    const isEmergency = checkNotesLower && (
      (checkNotesLower.includes('emergency') && !checkNotesLower.includes('non-emergency')) ||
      (checkNotesLower.includes('urgent') && !checkNotesLower.includes('non-urgent')) ||
      checkNotesLower.includes('critical')
    );

    if (!isEmergency && (appointmentDate || booking.appointmentDate)) {
      const targetPetId = mongoose.Types.ObjectId.isValid(booking.petId) ? new mongoose.Types.ObjectId(booking.petId) : booking.petId;
      const sameDayPet = await Appointment.findOne({
        _id: { $ne: targetId },
        petId: targetPetId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'Cancelled' }
      });
      if (sameDayPet) {
        return res.status(400).json({
          success: false,
          message: `Duplicate Patient Booking: This pet already has another appointment on ${dateOnly}. Please include an Emergency Reason in notes to proceed.`
        });
      }
    }

    if (serviceType) booking.serviceType = serviceType;
    if (assignedStaff) booking.assignedStaff = assignedStaff;
    if (appointmentDate) booking.appointmentDate = new Date(appointmentDate);
    if (timeSlot) booking.timeSlot = timeSlot;
    if (status) {
      booking.status = status;
      if (status === 'Cancelled') {
        booking.cancelledAt = new Date();
      } else {
        booking.cancelledAt = null;
      }
    }
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

    // Strict Soft-Delete: NEVER delete appointment documents from MongoDB Atlas
    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment successfully cancelled and slot released',
      data: {
        _id: booking._id,
        status: 'Cancelled',
        cancelledAt: booking.cancelledAt
      }
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
 * Clinical Appointment Summary Report
 * Returns totals: confirmed, completed, cancelled, pending, and an audit table
 */
const getBookingReport = async (req, res) => {
  try {
    const allBookings = await Appointment.find({})
      .populate('petId', 'petName species breed uniquePin ownerName')
      .populate('customerId', 'name email phone role')
      .sort({ appointmentDate: -1, timeSlot: 1 });

    const total = allBookings.length;
    const confirmed = allBookings.filter((b) => b.status === 'Confirmed').length;
    const completed = allBookings.filter((b) => b.status === 'Completed').length;
    const cancelled = allBookings.filter((b) => b.status === 'Cancelled').length;
    const pending = allBookings.filter((b) => b.status === 'Pending').length;

    const reportData = allBookings.map((b) => ({
      _id: b._id,
      patientName: b.petId?.petName || 'Unknown Patient',
      patientPin: b.petId?.uniquePin || 'N/A',
      species: b.petId?.species || 'N/A',
      breed: b.petId?.breed || '',
      ownerName: b.customerId?.name || b.petId?.ownerName || 'Pet Parent',
      ownerPhone: b.customerId?.phone || '',
      serviceType: b.serviceType,
      assignedStaff: b.assignedStaff || 'Dr. Perera (Senior Vet)',
      appointmentDate: b.appointmentDate,
      timeSlot: b.timeSlot,
      status: b.status,
      cancelledAt: b.cancelledAt,
      notes: b.notes,
      createdAt: b.createdAt
    }));

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: {
        total,
        confirmed,
        completed,
        cancelled,
        pending
      },
      data: reportData
    });
  } catch (error) {
    console.error('[Booking Report Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error generating clinical appointment report',
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

    const workingSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

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
  getBookingReport,
  getDoctorDaySchedule
};
