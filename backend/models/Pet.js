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
    default: '',
    trim: true
  },
  treatmentNotes: {
    type: String,
    default: '',
    trim: true
  },
  medicinesPrescribed: {
    type: [String],
    default: []
  },
  nextVisitDate: {
    type: Date
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
  },
  vetName: {
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
      uppercase: true,
      trim: true,
      match: [/^PET-[A-Z0-9]{4,8}$/, 'PIN must match PET-XXXX format (alphanumeric)']
    },
    microchipNumber: {
      type: String,
      trim: true,
      default: ''
    },
    petName: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true
    },
    name: {
      type: String,
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
      min: [0, 'Age cannot be negative'],
      max: [35, 'Age cannot exceed 35 years']
    },
    dob: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          return !v || v <= new Date();
        },
        message: 'Date of birth cannot be in the future'
      }
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Weight cannot be negative']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
      required: [true, 'Pet gender is required'],
      default: 'Male'
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pet must belong to a registered owner']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ownerName: {
      type: String,
      trim: true,
      default: ''
    },
    ownerPhone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(?:0|94|\+94)?7[0-9]{8}$/.test(v.replace(/[\s-]/g, ''));
        },
        message: 'Invalid Sri Lankan phone number format'
      }
    },
    ownerEmail: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid email address format'
      }
    },
    ownerAddress: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Available', 'Adopted', 'Medical Care'],
      default: 'Available'
    },
    clinicStatus: {
      type: String,
      default: 'Registered'
    },
    medicalLogs: [medicalLogSchema],
    medicalHistory: [medicalLogSchema],
    isArchived: {
      type: Boolean,
      default: false
    },
    archivalDetails: {
      reason: {
        type: String,
        enum: ['Deceased', 'Relocated', 'Owner Request', 'Adoption Transfer', 'Other'],
        default: 'Other'
      },
      dateOfEvent: {
        type: Date,
        default: Date.now
      },
      clinicalNotes: {
        type: String,
        default: ''
      },
      archivedAt: {
        type: Date,
        default: Date.now
      },
      archivedBy: {
        type: String,
        default: 'Clinical Staff'
      }
    }
  },
  {
    timestamps: true
  }
);

// Synchronize name <-> petName and owner <-> ownerId automatically
petSchema.pre('validate', function (next) {
  if (this.petName && !this.name) {
    this.name = this.petName;
  } else if (this.name && !this.petName) {
    this.petName = this.name;
  }
  if (this.ownerId && !this.owner) {
    this.owner = this.ownerId;
  } else if (this.owner && !this.ownerId) {
    this.ownerId = this.owner;
  }
  next();
});

module.exports = mongoose.model('Pet', petSchema);
