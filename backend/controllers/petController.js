/**
 * ============================================================================
 * MEMBER 1 MODULE: PET CONTROLLER (petController.js)
 * ============================================================================
 * Assigned to: Team Member 1 (Pet Registry & Customer Pet Portal)
 * 
 * Explanation for Viva:
 * - Manages all CRUD operations for pet registration and profile management.
 * - Auto-generates a unique 6-digit PIN (e.g. PET-1001) if not provided.
 * - Uses soft-delete (isArchived) to preserve historical relationships with bookings.
 * - Standardized JSON response: { success: true/false, message: "...", data: ... }
 */

const Pet = require('../models/Pet');

/**
 * Helper Utility: Generate Unique 6-Digit Pet PIN Code (e.g. PET-4819)
 */
const generatePetPin = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PET-${randomDigits}`;
};

/**
 * @desc    Health check endpoint for Member 1 Pet Module
 * @route   GET /api/pets/health
 * @access  Public
 */
const petHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Member 1: Pet Registry & Customer Pet Portal',
    status: 'Operational',
    message: 'Member 1: Pet Registry Module connected successfully!'
  });
};

/**
 * @desc    Register a new pet
 * @route   POST /api/pets
 * @access  Private (Protected by JWT)
 */
const createPet = async (req, res) => {
  try {
    const { uniquePin, petName, species, breed, age, weight, ownerId, status } = req.body;

    // 1. Validation check for required fields
    if (!petName || !species || age === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide petName, species, and age'
      });
    }

    // 2. Auto-generate unique PIN if not manually provided
    let finalPin = uniquePin;
    if (!finalPin) {
      finalPin = generatePetPin();
      // Ensure generated PIN is unique in database
      let pinExists = await Pet.findOne({ uniquePin: finalPin });
      while (pinExists) {
        finalPin = generatePetPin();
        pinExists = await Pet.findOne({ uniquePin: finalPin });
      }
    } else {
      // Check if manually entered PIN already exists
      const existingPin = await Pet.findOne({ uniquePin: finalPin });
      if (existingPin) {
        return res.status(400).json({
          success: false,
          message: `Pet PIN '${finalPin}' already exists. Please use a unique PIN.`
        });
      }
    }

    // 3. Set target owner (Default to logged-in user if ownerId not passed)
    const targetOwner = ownerId || (req.user ? req.user._id : null);

    if (!targetOwner) {
      return res.status(400).json({
        success: false,
        message: 'Owner selection required: Please provide ownerId'
      });
    }

    // 4. Create pet record in DB
    const pet = await Pet.create({
      uniquePin: finalPin,
      petName,
      species,
      breed: breed || 'Unknown/Mixed',
      age: Number(age),
      weight: weight ? Number(weight) : 0,
      ownerId: targetOwner,
      status: status || 'Available'
    });

    // 5. Populate owner info for response
    await pet.populate('ownerId', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Pet registered successfully',
      data: pet
    });
  } catch (error) {
    console.error('[Create Pet Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error creating pet record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all pets (with species filter, search query, and owner details)
 * @route   GET /api/pets
 * @access  Private / Protected
 */
const getAllPets = async (req, res) => {
  try {
    const { species, search, ownerId } = req.query;

    // Filter condition: only non-archived pets by default
    let query = { isArchived: false };

    // Species filter
    if (species && species !== 'All') {
      query.species = species;
    }

    // Filter by specific owner ID
    if (ownerId) {
      query.ownerId = ownerId;
    }

    // Search by pet name or unique PIN
    if (search) {
      query.$or = [
        { petName: { $regex: search, $options: 'i' } },
        { uniquePin: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const pets = await Pet.find(query)
      .populate('ownerId', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pets.length,
      message: 'Pets fetched successfully',
      data: pets
    });
  } catch (error) {
    console.error('[Get All Pets Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching pet list',
      error: error.message
    });
  }
};

/**
 * @desc    Get single pet profile details by ID
 * @route   GET /api/pets/:id
 * @access  Private / Protected
 */
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, isArchived: false })
      .populate('ownerId', 'name email role');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or has been archived'
      });
    }

    return res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching pet details',
      error: error.message
    });
  }
};

/**
 * @desc    Update pet profile details
 * @route   PUT /api/pets/:id
 * @access  Private (Protected)
 */
const updatePet = async (req, res) => {
  try {
    const { petName, species, breed, age, weight, status, ownerId } = req.body;

    let pet = await Pet.findOne({ _id: req.params.id, isArchived: false });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found for update'
      });
    }

    // Apply updates
    if (petName) pet.petName = petName;
    if (species) pet.species = species;
    if (breed) pet.breed = breed;
    if (age !== undefined) pet.age = Number(age);
    if (weight !== undefined) pet.weight = Number(weight);
    if (status) pet.status = status;
    if (ownerId) pet.ownerId = ownerId;

    const updatedPet = await pet.save();
    await updatedPet.populate('ownerId', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Pet profile updated successfully',
      data: updatedPet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating pet record',
      error: error.message
    });
  }
};

/**
 * @desc    Soft delete / archive pet record
 * @route   DELETE /api/pets/:id
 * @access  Private (Admin / Staff / Owner)
 */
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet || pet.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found or already archived'
      });
    }

    // Perform soft delete
    pet.isArchived = true;
    await pet.save();

    return res.status(200).json({
      success: true,
      message: `Pet '${pet.petName}' (${pet.uniquePin}) successfully archived`,
      data: { _id: pet._id }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error archiving pet record',
      error: error.message
    });
  }
};

module.exports = {
  petHealthCheck,
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet
};
