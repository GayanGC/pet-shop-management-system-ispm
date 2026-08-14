/**
 * ============================================================================
 * MEMBER 3 MODULE: APPOINTMENT MODEL (Appointment.js)
 * ============================================================================
 * Assigned to: Team Member 3 (Service & Appointment Booking System)
 * 
 * Explanation for Viva:
 * - Represents appointment bookings for pet services.
 * - Fields:
 *   * petId: Ref to Pet document.
 *   * customerId: Ref to User document (Customer).
 *   * serviceType: Category ('Grooming & Bath', 'Veterinary Checkup', 'Vaccination', 'Dental Care', 'General Consultation').
 *   * appointmentDate: Scheduled date string/Date object.
 *   * timeSlot: Selected time slot string (e.g. '09:00 AM', '02:30 PM').
 *   * status: Booking status ('Pending', 'Confirmed', 'Completed', 'Cancelled').
 *   * notes: Additional special instructions or symptoms.
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
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 09:00 AM, 02:00 PM)'],
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
