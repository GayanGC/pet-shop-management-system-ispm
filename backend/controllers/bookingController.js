/**
 * ============================================================================
 * CLINICAL MODULE 3: APPOINTMENT SCHEDULING CONTROLLER (bookingController.js)
 * ============================================================================
 */

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendAppointmentConfirmationEmail } = require('../utils/emailService');

const parseTimeSlotToMinutes = (timeSlotStr) => {
  if (!timeSlotStr) return null;
  const match = timeSlotStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const isWithinOperatingHours = (timeSlotStr) => {
  const mins = parseTimeSlotToMinutes(timeSlotStr);
  if (mins === null) return false;
  // 08:30 AM = 510 mins, 07:30 PM (19:30) = 1170 mins
  return mins >= 510 && mins <= 1170;
};

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
    const { petId, petPin, customerId, serviceType, assignedStaff, appointmentDate, timeSlot, notes } = req.body;

    if ((!petId && !petPin) || !serviceType || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide petId/petPin, serviceType, appointmentDate, and timeSlot'
      });
    }

    // 1. Operating Hours Restriction (08:30 AM - 07:30 PM)
    if (!isWithinOperatingHours(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Selected time slot is outside clinical operating hours (08:30 AM to 07:30 PM).'
      });
    }

    // 2. Past Date & Time Guard
    const apptDate = new Date(appointmentDate);
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invalid appointment date format.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(apptDate);
    targetDay.setHours(0, 0, 0, 0);

    if (targetDay < today) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Cannot schedule appointments for dates in the past.'
      });
    }

    const targetCustomer = customerId || (req.user ? req.user._id : null);
    if (!targetCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer user required for booking'
      });
    }

    // 3. Patient Linkage Validation (Verified Pet PIN or Patient Record)
    let pet = null;
    if (petId && mongoose.Types.ObjectId.isValid(petId)) {
      pet = await Pet.findById(petId);
    } else if (petPin || petId) {
      const pinToFind = String(petPin || petId).trim().toUpperCase();
      pet = await Pet.findOne({ uniquePin: pinToFind });
    }

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Validation Error: Selected pet patient record does not exist. A verified patient record is required.'
      });
    }

    if (pet.isArchived || pet.clinicStatus === 'Deceased' || pet.status === 'Deceased' || pet.archivalDetails?.reason === 'Deceased') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Cannot schedule appointments for deceased or archived patients.'
      });
    }

    const dateOnly = typeof appointmentDate === 'string' ? appointmentDate.slice(0, 10) : new Date(appointmentDate).toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    const staffToUse = assignedStaff || 'Dr. Perera (Senior Vet)';
    const targetPetId = pet._id;

    // 1. Strict Double Booking Guard (Doctor + Date + Slot)
    const existingConflict = await Appointment.findOne({
      $or: [
        { assignedStaff: staffToUse },
        { doctor: staffToUse }
      ],
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $nin: ['Cancelled'] }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'Selected Doctor is already booked for this time slot. Please choose another slot or doctor.'
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
        status: { $nin: ['Cancelled'] }
      });

      if (sameDayPetBooking) {
        return res.status(400).json({
          success: false,
          message: `Duplicate Patient Booking: This pet already has an appointment scheduled on ${dateOnly} (${sameDayPetBooking.timeSlot}). To schedule another visit on the same day, please include an Emergency Reason in notes.`
        });
      }
    }

    const activeCount = await Appointment.countDocuments({
      $or: [
        { assignedStaff: staffToUse },
        { doctor: staffToUse }
      ],
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['Cancelled'] }
    });
    const queueNumber = activeCount + 1;
    let roomNumber = 'Consultation Room 1';
    if (staffToUse.includes('Silva')) roomNumber = 'Consultation Room 2';
    else if (staffToUse.includes('Fernando')) roomNumber = 'Consultation Room 3';

    const petDoc = await Pet.findById(targetPetId);
    const petDocName = petDoc ? (petDoc.petName || petDoc.name || '') : '';
    const petDocPin = petDoc ? (petDoc.uniquePin || petDoc.microchipNumber || '') : '';

    const appointment = await Appointment.create({
      petId,
      pet: petId,
      customerId: targetCustomer,
      owner: targetCustomer,
      ownerEmail: (req.user && req.user.email) || '',
      patientName: petDocName,
      patientPin: petDocPin,
      serviceType,
      assignedStaff: staffToUse,
      doctor: staffToUse,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes: notes || '',
      queueNumber,
      roomNumber,
      status: 'Pending'
    });

    await appointment.populate('petId', 'petName name species breed uniquePin age weight gender ownerName ownerPhone');
    await appointment.populate('customerId', 'name email phone role address');

    // Resolve recipient details for automated clinical confirmation email
    let recipientEmail = appointment.customerId?.email || (req.user && req.user.email);
    let recipientName = appointment.customerId?.name || (req.user && req.user.name);

    if (!recipientEmail && targetCustomer) {
      try {
        const custDoc = await User.findById(targetCustomer).select('name email');
        if (custDoc) {
          recipientEmail = custDoc.email;
          recipientName = custDoc.name;
        }
      } catch (err) {
        console.warn('[Email Resolution Warning]: Could not fetch customer User record:', err.message);
      }
    }

    const petName = appointment.petId?.petName || appointment.petId?.name || pet.petName || pet.name || 'Pet Patient';
    const doctorName = appointment.assignedStaff || appointment.doctor || staffToUse;

    // Asynchronously dispatch confirmation email in background (non-blocking)
    sendAppointmentConfirmationEmail({
      booking: {
        ...appointment.toObject(),
        date: dateOnly,
        timeSlot: appointment.timeSlot,
        patientPin: appointment.petId?.uniquePin || pet.uniquePin || 'N/A',
        petPin: appointment.petId?.uniquePin || pet.uniquePin || 'N/A',
        roomNumber: appointment.roomNumber,
        queueNumber: appointment.queueNumber
      },
      recipientEmail,
      recipientName: recipientName || 'Valued Pet Parent',
      petName,
      doctorName
    }).catch(emailErr => {
      console.error('[Email Dispatch Non-blocking Error]:', emailErr.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment confirmed',
      data: appointment,
      booking: appointment
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
 * Role-Scoped Appointment History (Customer Self-Service vs Admin Global View)
 * GET /api/bookings or /api/bookings/my-history
 * 🔒 Strict BOLA Data Isolation
 */
const getAppointmentHistory = async (req, res) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Customer';
    const normalizedRole = rawRole.toLowerCase();
    const userId = req.user._id || req.user.id;

    let query = {};

    // 🔒 Strict BOLA Data Isolation
    if (userRole === 'Customer' || userRole === 'Client' || ['customer', 'client'].includes(normalizedRole)) {
      // Customers can ONLY query their own bookings
      const userPets = await Pet.find(
        { $or: [{ ownerId: userId }, { owner: userId }] },
        '_id'
      );
      const userPetIds = userPets.map((p) => p._id);

      query = { 
        $or: [
          { owner: userId },
          { customerId: userId },
          { ownerEmail: req.user.email },
          ...(userPetIds.length > 0 ? [{ petId: { $in: userPetIds } }, { pet: { $in: userPetIds } }] : [])
        ]
      };

      if (req.query.status && req.query.status !== 'All') {
        query.status = req.query.status;
      }
      if (req.query.date) {
        const targetDate = new Date(req.query.date);
        query.appointmentDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      }
    } else if (
      ['Admin', 'Veterinarian', 'Receptionist'].includes(userRole) ||
      ['admin', 'veterinarian', 'receptionist'].includes(normalizedRole)
    ) {
      // Clinic staff can view all, or apply search filters (date, status, pet)
      if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
      if (req.query.date) {
        const targetDate = new Date(req.query.date);
        query.appointmentDate = {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lte: new Date(targetDate.setHours(23, 59, 59, 999))
        };
      }
      if (req.query.search) {
        const searchRegex = { $regex: req.query.search, $options: 'i' };
        const matchingPets = await Pet.find({
          $or: [
            { petName: searchRegex },
            { name: searchRegex },
            { uniquePin: searchRegex },
            { microchipNumber: searchRegex }
          ]
        }, '_id');
        const petIds = matchingPets.map((p) => p._id);

        query.$or = [
          { patientName: searchRegex },
          { patientPin: searchRegex },
          { doctor: searchRegex },
          { assignedStaff: searchRegex },
          ...(petIds.length > 0 ? [{ petId: { $in: petIds } }, { pet: { $in: petIds } }] : [])
        ];
      }
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    const bookings = await Appointment.find(query)
      .populate('pet', 'name species breed microchipPin petName uniquePin')
      .populate('petId', 'name species breed microchipPin petName uniquePin age weight gender ownerName ownerPhone')
      .populate('customerId', 'name email phone role')
      .populate('owner', 'name email phone role')
      .populate('assignedStaff', 'name specialization')
      .sort({ appointmentDate: -1, timeSlot: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving history', error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  // If doctor & date are specified, allow doctor schedule / slot checking for booking forms
  if (req.query.doctor && req.query.date) {
    try {
      const { status, doctor, date } = req.query;
      let query = {};
      if (status && status !== 'All') query.status = status;
      const docClean = String(doctor).trim();
      const escaped = docClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { assignedStaff: docClean },
        { assignedStaff: new RegExp(escaped, 'i') },
        { doctor: docClean },
        { doctor: new RegExp(escaped, 'i') }
      ];
      const dateOnly = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);
      const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };

      const bookings = await Appointment.find(query)
        .populate('petId', 'petName species breed uniquePin ownerId')
        .populate('pet', 'petName species breed uniquePin ownerId')
        .sort({ appointmentDate: 1, timeSlot: 1 });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        message: 'Appointments fetched successfully',
        data: bookings,
        bookings: bookings
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Otherwise, delegate to role-scoped appointment history
  return getAppointmentHistory(req, res);
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Appointment.findById(req.params.id)
      .populate('petId', 'petName name species breed uniquePin age weight gender ownerName ownerPhone ownerEmail')
      .populate('customerId', 'name email phone role address');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found'
      });
    }

    const doc = booking.assignedStaff || booking.doctor || 'Dr. Perera (Senior Vet)';
    let room = booking.roomNumber;
    if (!room || room === 'Consultation Room 1') {
      if (doc.includes('Silva')) room = 'Consultation Room 2';
      else if (doc.includes('Fernando')) room = 'Consultation Room 3';
      else room = 'Consultation Room 1';
    }

    const obj = booking.toObject ? booking.toObject() : { ...booking };
    obj.doctor = doc;
    obj.assignedStaff = doc;
    obj.roomNumber = room;
    obj.queueNumber = obj.queueNumber || 1;

    return res.status(200).json({
      success: true,
      data: obj
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
 * Reschedule Appointment Lifecycle
 * PUT /api/bookings/:id/reschedule
 * Payload: { newDate, newTimeSlot, reason }
 */
const rescheduleBooking = async (req, res) => {
  try {
    const targetDate = req.body.newDate || req.body.appointmentDate;
    const targetTimeSlot = req.body.newTimeSlot || req.body.timeSlot;
    const { reason } = req.body;

    if (!targetDate || !targetTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide both newDate and newTimeSlot for rescheduling.'
      });
    }

    if (!isWithinOperatingHours(targetTimeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Selected time slot is outside clinical operating hours (08:30 AM to 07:30 PM).'
      });
    }

    const apptDate = new Date(targetDate);
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invalid appointment date format.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(apptDate);
    targetDay.setHours(0, 0, 0, 0);

    if (targetDay < today) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Cannot reschedule appointments to past dates.'
      });
    }

    const booking = await Appointment.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found for rescheduling'
      });
    }

    const dateOnly = typeof targetDate === 'string' ? targetDate.slice(0, 10) : new Date(targetDate).toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    const docToUse = booking.assignedStaff || booking.doctor || 'Dr. Perera (Senior Vet)';

    const conflict = await Appointment.findOne({
      _id: { $ne: booking._id },
      $or: [
        { assignedStaff: docToUse },
        { doctor: docToUse }
      ],
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: targetTimeSlot,
      status: { $nin: ['Cancelled'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Selected Doctor is already booked for this time slot. Please choose another slot or doctor.'
      });
    }

    // Append to reschedule audit history
    if (!booking.rescheduleHistory) booking.rescheduleHistory = [];
    booking.rescheduleHistory.push({
      previousDate: booking.appointmentDate,
      previousTimeSlot: booking.timeSlot,
      newDate: new Date(targetDate),
      newTimeSlot: targetTimeSlot,
      reason: reason || 'Patient / Clinic schedule modification',
      rescheduledAt: new Date(),
      rescheduledBy: req.user?.name || 'Authorized Staff'
    });

    booking.appointmentDate = new Date(targetDate);
    booking.timeSlot = targetTimeSlot;
    booking.status = 'Rescheduled';
    if (reason) {
      booking.notes = booking.notes ? `${booking.notes} | Rescheduled: ${reason}` : `Rescheduled: ${reason}`;
    }

    await booking.save();
    await booking.populate('petId', 'petName name species breed uniquePin age weight gender ownerName ownerPhone');
    await booking.populate('customerId', 'name email phone role address');

    return res.status(200).json({
      success: true,
      message: `Appointment successfully rescheduled to ${dateOnly} at ${targetTimeSlot}.`,
      data: booking
    });
  } catch (error) {
    console.error('[Reschedule Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error rescheduling appointment',
      error: error.message
    });
  }
};

/**
 * Cancel Appointment Lifecycle
 * PUT /api/bookings/:id/cancel
 * Payload: { reason }
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Appointment.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found for cancellation'
      });
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    if (req.body && req.body.reason) {
      booking.cancellationReason = req.body.reason;
      booking.notes = booking.notes ? `${booking.notes} | Cancelled: ${req.body.reason}` : `Cancelled: ${req.body.reason}`;
    }
    await booking.save();
    await booking.populate('petId', 'petName name species breed uniquePin');
    await booking.populate('customerId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Appointment successfully cancelled and slot released for other patients.',
      data: {
        _id: booking._id,
        status: 'Cancelled',
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason
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

const updateBooking = async (req, res) => {
  try {
    const { serviceType, assignedStaff, doctor, appointmentDate, timeSlot, status, notes } = req.body;

    let booking = await Appointment.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Appointment booking record not found for update'
      });
    }

    if (timeSlot && !isWithinOperatingHours(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Selected time slot is outside clinical operating hours (08:30 AM to 07:30 PM).'
      });
    }

    if (appointmentDate) {
      const apptDate = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDay = new Date(apptDate);
      targetDay.setHours(0, 0, 0, 0);

      if (targetDay < today) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Cannot reschedule appointment to a past date.'
        });
      }
    }

    const docToUse = assignedStaff || doctor || booking.assignedStaff;
    const dateOnly = appointmentDate 
      ? (typeof appointmentDate === 'string' ? appointmentDate.slice(0, 10) : new Date(appointmentDate).toISOString().slice(0, 10))
      : (typeof booking.appointmentDate === 'string' ? booking.appointmentDate.slice(0, 10) : new Date(booking.appointmentDate).toISOString().slice(0, 10));
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    const slotToUse = timeSlot || booking.timeSlot;

    const targetId = mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : req.params.id;

    // 1. Strict Double Booking Guard for Updates / Rescheduling (Doctor + Date + Slot)
    if (assignedStaff || doctor || appointmentDate || timeSlot) {
      const existingConflict = await Appointment.findOne({
        _id: { $ne: targetId },
        $or: [
          { assignedStaff: docToUse },
          { doctor: docToUse }
        ],
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: slotToUse,
        status: { $nin: ['Cancelled'] }
      });

      if (existingConflict) {
        return res.status(409).json({
          success: false,
          message: 'Selected Doctor is already booked for this time slot. Please choose another slot or doctor.'
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
        status: { $nin: ['Cancelled'] }
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
    if (doctor) booking.doctor = doctor;
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
    await updatedBooking.populate('petId', 'petName name species breed uniquePin age weight gender ownerName ownerPhone');
    await updatedBooking.populate('customerId', 'name email phone role address');

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

const deleteBooking = cancelBooking;

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
  getBookings: getAllBookings,
  getAppointmentHistory,
  getBookingById,
  updateBooking,
  rescheduleBooking,
  cancelBooking,
  deleteBooking,
  getBookingReport,
  getDoctorDaySchedule
};
