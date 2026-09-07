/**
 * ============================================================================
 * CLINICAL MODULE 1: PET PATIENT MODEL (Pet.js)
 * ============================================================================
 * Represents registered pet patients, microchip PIN tags, medical status,
 * and treatment/vaccination history logs.
 */

const mongoose = require('mongoose');

const medicalLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  vaccineName: {
    type: String,
    default: '',
    trim: true
  },
  vetDoctor: {
    type: String,
    default: 'Dr. Perera (Senior Vet)',
    trim: true
  }
});

const petSchema = new mongoose.Schema(
  {
    uniquePin: {
      type: String,
      required: [true, 'Unique Pet PIN code is required'],
      unique: true,
      trim: true
    },
    petName: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true
    },
    species: {
      type: String,
      required: [true, 'Species type is required'],
      trim: true
    },
    breed: {
      type: String,
      default: 'Unknown/Mixed',
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Pet age is required'],
      min: [0, 'Age cannot be negative']
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Weight cannot be negative']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pet must belong to a registered owner']
    },
    status: {
      type: String,
      enum: ['Available', 'Adopted', 'Medical Care'],
      default: 'Available'
    },
    clinicStatus: {
      type: String,
      enum: ['Registered', 'Checked-In', 'In Consultation', 'Discharged'],
      default: 'Registered'
    },
    medicalLogs: [medicalLogSchema],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Pet', petSchema);
