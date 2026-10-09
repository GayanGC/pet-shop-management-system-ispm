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
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet'
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer account is required for appointment booking']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ownerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    patientName: {
      type: String,
      trim: true,
      default: ''
    },
    patientPin: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: [
        'General Veterinary Consultation',
        'Vaccination & Immunization',
        'Dental Scaling & Oral Surgery',
        'Surgical Wound Dressing',
        'Clinical Diagnostics & Laboratory',
        'Emergency Clinical Care',
        'Veterinary Checkup',
        'Vaccination',
        'Dental Care',
        'General Consultation',
        'General Consultation & Diagnosis',
        'Annual Vaccine Booster & Parasite Screen',
        'Post-Op Wound Care & Minor Dressing',
        'Dental Cleaning & Oral Checkup',
        'Nutritional & Weight Consultation',
        'Consultation'
      ],
      default: 'General Veterinary Consultation'
    },
    assignedStaff: {
      type: String,
      default: 'Dr. Perera (Senior Vet)',
      trim: true
    },
    doctor: {
      type: String,
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
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Pending'
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: '',
      trim: true
    },
    queueNumber: {
      type: Number,
      default: 1
    },
    roomNumber: {
      type: String,
      default: 'Consultation Room 1'
    },
    rescheduleHistory: [
      {
        previousDate: Date,
        previousTimeSlot: String,
        newDate: Date,
        newTimeSlot: String,
        reason: { type: String, default: '' },
        rescheduledAt: { type: Date, default: Date.now },
        rescheduledBy: { type: String, default: 'Staff' }
      }
    ],
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    strictPopulate: false
  }
);

// Synchronize assignedStaff <-> doctor, petId <-> pet, customerId <-> owner
appointmentSchema.pre('validate', function (next) {
  if (this.assignedStaff && !this.doctor) {
    this.doctor = this.assignedStaff;
  } else if (this.doctor && !this.assignedStaff) {
    this.assignedStaff = this.doctor;
  }

  if (this.petId && !this.pet) {
    this.pet = this.petId;
  } else if (this.pet && !this.petId) {
    this.petId = this.pet;
  }

  if (this.customerId && !this.owner) {
    this.owner = this.customerId;
  } else if (this.owner && !this.customerId) {
    this.customerId = this.owner;
  }

  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
