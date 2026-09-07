/**
 * ============================================================================
 * CLINICAL MODULE 1: PET PATIENT CONTROLLER (petController.js)
 * ============================================================================
 * Manages CRUD operations for pet patients, clinic status changes,
 * and medical/vaccination log history.
 */

const Pet = require('../models/Pet');

const generatePetPin = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PET-${randomDigits}`;
};

const petHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Patients & Pet Profiles Module',
    status: 'Operational',
    message: 'Patients & Pet Profiles Module connected successfully!'
  });
};

const createPet = async (req, res) => {
  try {
    const { uniquePin, petName, species, breed, age, weight, ownerId, status, clinicStatus } = req.body;

    if (!petName || !species || age === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Please provide petName, species, and age'
      });
    }

    let finalPin = uniquePin;
    if (!finalPin) {
      finalPin = generatePetPin();
      let pinExists = await Pet.findOne({ uniquePin: finalPin });
      while (pinExists) {
        finalPin = generatePetPin();
        pinExists = await Pet.findOne({ uniquePin: finalPin });
      }
    } else {
      const existingPin = await Pet.findOne({ uniquePin: finalPin });
      if (existingPin) {
        return res.status(400).json({
          success: false,
          message: `Pet PIN '${finalPin}' already exists.`
        });
      }
    }

    const targetOwner = ownerId || (req.user ? req.user._id : null);
    if (!targetOwner) {
      return res.status(400).json({
        success: false,
        message: 'Owner selection required: Please provide ownerId'
      });
    }

    const pet = await Pet.create({
      uniquePin: finalPin,
      petName,
      species,
      breed: breed || 'Unknown/Mixed',
      age: Number(age),
      weight: weight ? Number(weight) : 0,
      ownerId: targetOwner,
      status: status || 'Available',
      clinicStatus: clinicStatus || 'Registered',
      medicalLogs: []
    });

    await pet.populate('ownerId', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Pet patient registered successfully',
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

const getAllPets = async (req, res) => {
  try {
    const { species, search, ownerId } = req.query;

    let query = { isArchived: false };

    if (species && species !== 'All') {
      query.species = species;
    }

    if (ownerId) {
      query.ownerId = ownerId;
    }

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
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching pet list',
      error: error.message
    });
  }
};

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

const updatePet = async (req, res) => {
  try {
    const { petName, species, breed, age, weight, status, clinicStatus, ownerId } = req.body;

    let pet = await Pet.findOne({ _id: req.params.id, isArchived: false });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found for update'
      });
    }

    if (petName) pet.petName = petName;
    if (species) pet.species = species;
    if (breed) pet.breed = breed;
    if (age !== undefined) pet.age = Number(age);
    if (weight !== undefined) pet.weight = Number(weight);
    if (status) pet.status = status;
    if (clinicStatus) pet.clinicStatus = clinicStatus;
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

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet || pet.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found or already archived'
      });
    }

    pet.isArchived = true;
    await pet.save();

    return res.status(200).json({
      success: true,
      message: `Pet '${pet.petName}' (${pet.uniquePin}) archived successfully`,
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

/**
 * Add Medical/Vaccination Log to Pet Patient
 */
const addMedicalLog = async (req, res) => {
  try {
    const { diagnosis, treatment, vaccineName, vetDoctor } = req.body;

    if (!diagnosis || !treatment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide diagnosis and treatment'
      });
    }

    const pet = await Pet.findOne({ _id: req.params.id, isArchived: false });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet patient record not found'
      });
    }

    pet.medicalLogs.push({
      date: new Date(),
      diagnosis,
      treatment,
      vaccineName: vaccineName || '',
      vetDoctor: vetDoctor || 'Dr. Perera (Senior Vet)'
    });

    await pet.save();
    await pet.populate('ownerId', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Medical log added successfully',
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error adding medical log',
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
  deletePet,
  addMedicalLog
};
