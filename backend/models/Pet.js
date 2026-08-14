/**
 * ============================================================================
 * MEMBER 1 MODULE: PET MODEL (Pet.js)
 * ============================================================================
 * Assigned to: Team Member 1 (Pet Registry & Customer Pet Portal)
 * 
 * Explanation for Viva:
 * - Represents registered pets owned by customer users or maintained in shop registry.
 * - Fields:
 *   * uniquePin: Unique identification tag or microchip PIN code for the pet (e.g. PET-1001).
 *   * petName: Name of the pet.
 *   * species: Category (Dog, Cat, Bird, Fish, Reptile, Small Animal).
 *   * breed: Specific breed designation.
 *   * age: Age of pet in years.
 *   * weight: Pet weight in kilograms (kg).
 *   * ownerId: Reference ID linking to the User document (Customer owner).
 *   * status: Medical / Adoption status ('Available', 'Adopted', 'Medical Care').
 *   * isArchived: Soft-delete flag (default: false) to preserve historic records.
 */

const mongoose = require('mongoose');

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
      required: [true, 'Species type is required (e.g. Dog, Cat, Bird)'],
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
      required: [true, 'Pet must belong to a registered customer owner']
    },
    status: {
      type: String,
      enum: ['Available', 'Adopted', 'Medical Care'],
      default: 'Available'
    },
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
