/**
 * ============================================================================
 * CLINICAL MODULE 3: APPOINTMENT SCHEDULING MODEL (Appointment.js)
 * ============================================================================
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet selection is required for appointment booking']
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer account is required for appointment booking']
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: ['Grooming & Bath', 'Veterinary Checkup', 'Vaccination', 'Dental Care', 'General Consultation'],
      default: 'General Consultation'
    },
    assignedStaff: {
      type: String,
      default: 'Dr. Perera (Senior Vet)',
      trim: true
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
