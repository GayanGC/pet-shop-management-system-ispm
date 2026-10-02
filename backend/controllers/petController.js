/**
 * ============================================================================
 * CLINICAL MODULE 1: PET PATIENT CONTROLLER (petController.js)
 * ============================================================================
 * Manages CRUD operations for pet patients, clinic status changes,
 * and medical/vaccination log history.
 */

const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

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

const SL_PHONE_REGEX = /^(?:0|94|\+94)?7[0-9]{8}$/;
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PET_PIN_REGEX = /^PET-[A-Z0-9]{4,8}$/;

const createPet = async (req, res) => {
  try {
    const { uniquePin, petName, species, breed, age, weight, ownerId, status, clinicStatus, microchipNumber, dob, ownerPhone, ownerEmail, gender } = req.body;

    if (!petName || !petName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Pet name is required'
      });
    }

    if (!species || !species.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Species type is required'
      });
    }

    if (age === undefined || age === null || age === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Pet age is required'
      });
    }

    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Pet age cannot be negative'
      });
    }

    if (ageNum > 35) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Pet age cannot exceed 35 years'
      });
    }

    // Date of Birth validation (no future dates)
    if (dob) {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Date of birth cannot be in the future'
        });
      }
    }

    // Owner Phone Validation (Sri Lankan standard)
    const phoneToTest = ownerPhone || req.body.phone;
    if (phoneToTest) {
      const cleanPhone = String(phoneToTest).trim().replace(/[\s-]/g, '');
      if (!SL_PHONE_REGEX.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Invalid Sri Lankan owner phone number format (must be 07XXXXXXXX or +947XXXXXXXX)'
        });
      }
    }

    // Owner Email Validation (RFC regex)
    const emailToTest = ownerEmail || req.body.email;
    if (emailToTest) {
      const cleanEmail = String(emailToTest).trim();
      if (!RFC_EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Invalid RFC-compliant owner email address format'
        });
      }
    }

    // Pet PIN Validation & Normalization
    let finalPin = uniquePin ? String(uniquePin).trim().toUpperCase() : null;
    if (!finalPin) {
      finalPin = generatePetPin();
      let pinExists = await Pet.findOne({ uniquePin: finalPin });
      while (pinExists) {
        finalPin = generatePetPin();
        pinExists = await Pet.findOne({ uniquePin: finalPin });
      }
    } else {
      if (!PET_PIN_REGEX.test(finalPin)) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: Pet PIN '${finalPin}' is malformed. Must follow PET-XXXX format (e.g., PET-1234).`
        });
      }
      const existingPin = await Pet.findOne({ uniquePin: finalPin });
      if (existingPin) {
        return res.status(400).json({
          success: false,
          message: `Duplicate Error: Pet PIN '${finalPin}' already exists in registry.`
        });
      }
    }

    // Microchip Duplicate Check
    if (microchipNumber && microchipNumber.trim()) {
      const existingMicrochip = await Pet.findOne({ microchipNumber: microchipNumber.trim() });
      if (existingMicrochip) {
        return res.status(400).json({
          success: false,
          message: `Duplicate Error: Pet with microchip '${microchipNumber}' is already registered.`
        });
      }
    }

    let targetOwner = ownerId || (req.user ? req.user._id : null);
    if (!targetOwner) {
      // Fallback to customer or default user if available
      const defaultUser = await User.findOne({ role: { $in: ['customer', 'Customer'] } }) || await User.findOne();
      targetOwner = defaultUser ? defaultUser._id : null;
    }

    if (!targetOwner) {
      return res.status(400).json({
        success: false,
        message: 'Owner selection required: Please provide ownerId'
      });
    }

    // Prevent duplicate active pet name under same owner
    const existingPetForOwner = await Pet.findOne({
      $and: [
        {
          $or: [
            { ownerId: targetOwner },
            { owner: targetOwner }
          ]
        },
        {
          $or: [
            { petName: { $regex: new RegExp(`^${petName.trim()}$`, 'i') } },
            { name: { $regex: new RegExp(`^${petName.trim()}$`, 'i') } }
          ]
        },
        { isArchived: { $ne: true } }
      ]
    });
    if (existingPetForOwner) {
      return res.status(400).json({
        success: false,
        message: `Duplicate Error: Owner already has an active pet registered named '${petName.trim()}'.`
      });
    }

    const pet = await Pet.create({
      uniquePin: finalPin,
      microchipNumber: microchipNumber ? microchipNumber.trim() : '',
      dob: dob ? new Date(dob) : null,
      petName: petName.trim(),
      name: petName.trim(),
      species: species.trim(),
      breed: breed || 'Unknown/Mixed',
      age: ageNum,
      weight: weight ? Number(weight) : 0,
      gender: gender || 'Male',
      ownerId: targetOwner,
      owner: targetOwner,
      ownerName: req.body.ownerName || '',
      ownerPhone: phoneToTest || '',
      ownerEmail: emailToTest || '',
      ownerAddress: req.body.ownerAddress || '',
      status: status || 'Available',
      clinicStatus: clinicStatus || 'Registered',
      medicalLogs: []
    });

    await pet.populate('ownerId', 'name email phone address role');
    await pet.populate('owner', 'name email phone address role');

    const petObj = pet.toObject ? pet.toObject() : { ...pet };
    petObj.name = petObj.name || petObj.petName;
    petObj.petName = petObj.petName || petObj.name;
    petObj.owner = petObj.owner || petObj.ownerId;
    petObj.ownerId = petObj.ownerId || petObj.owner;
    petObj.ownerName = pet.ownerId?.name || pet.owner?.name || petObj.ownerName || 'Registered Owner';
    petObj.ownerPhone = pet.ownerId?.phone || pet.owner?.phone || petObj.ownerPhone || '';
    petObj.ownerEmail = pet.ownerId?.email || pet.owner?.email || petObj.ownerEmail || '';
    petObj.ownerAddress = pet.ownerId?.address || pet.owner?.address || petObj.ownerAddress || '';
    petObj.petId = petObj._id;

    return res.status(201).json({
      success: true,
      message: 'Pet patient registered successfully',
      data: petObj
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    console.error('[Create Pet Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error creating pet record',
      error: error.message
    });
  }
};

const getPetByPin = async (req, res) => {
  try {
    const rawPin = req.params.pin || '';
    const cleanPin = String(rawPin).trim().toUpperCase();

    if (!PET_PIN_REGEX.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: `Malformed Pet PIN '${cleanPin}'. Must follow uppercase alphanumeric format PET-XXXX.`
      });
    }

    const pet = await Pet.findOne({ uniquePin: cleanPin, isArchived: false })
      .populate('ownerId', 'name email phone address role');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: `Pet Patient record with PIN '${cleanPin}' was not found in the clinic database.`
      });
    }

    return res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error retrieving pet by PIN',
      error: error.message
    });
  }
};

/**
 * CUSTOMER-SCOPED PET RETRIEVAL & SEARCH
 * Enforces strict tenant ownership isolation (OWASP BOLA defense)
 * Multi-tenant safe: Customer A searching "Tommy" only receives Customer A's "Tommy"
 */
const getMyPets = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access personal pets'
      });
    }

    const searchTerm = req.query.search || req.query.q || req.query.searchTerm;
    const { species, includeArchived } = req.query;

    const andConditions = [
      {
        $or: [
          { owner: req.user._id },
          { ownerId: req.user._id }
        ]
      }
    ];

    if (includeArchived !== 'true') {
      andConditions.push({ isArchived: { $ne: true } });
    }

    if (species && species !== 'All' && species !== 'undefined' && species !== 'null') {
      andConditions.push({ species });
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const cleanTerm = searchTerm.trim();
      andConditions.push({
        $or: [
          { name: { $regex: cleanTerm, $options: 'i' } },
          { petName: { $regex: cleanTerm, $options: 'i' } },
          { uniquePin: { $regex: cleanTerm.toUpperCase(), $options: 'i' } },
          { breed: { $regex: cleanTerm, $options: 'i' } }
        ]
      });
    }

    const query = { $and: andConditions };

    const pets = await Pet.find(query)
      .populate('ownerId', 'name email phone address role')
      .populate('owner', 'name email phone address role')
      .sort({ createdAt: -1 });

    const serializedPets = pets.map((p) => {
      const obj = p.toObject ? p.toObject() : { ...p };
      obj.name = obj.name || obj.petName;
      obj.petName = obj.petName || obj.name;
      obj.owner = obj.owner || obj.ownerId;
      obj.ownerId = obj.ownerId || obj.owner;
      obj.ownerName = p.ownerId?.name || p.owner?.name || obj.ownerName || req.user.name;
      obj.ownerPhone = p.ownerId?.phone || p.owner?.phone || obj.ownerPhone || req.user.phone || '';
      obj.ownerEmail = p.ownerId?.email || p.owner?.email || obj.ownerEmail || req.user.email || '';
      obj.ownerAddress = p.ownerId?.address || p.owner?.address || obj.ownerAddress || '';
      obj.petId = obj._id;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: serializedPets.length,
      data: serializedPets,
      pets: serializedPets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal customer pets',
      error: error.message
    });
  }
};

const searchMyPets = getMyPets;

const getAllPets = async (req, res) => {
  try {
    const { species, search, ownerId, customerId, includeArchived } = req.query;

    const andConditions = [];

    if (includeArchived !== 'true') {
      andConditions.push({ isArchived: { $ne: true } });
    }

    if (species && species !== 'All' && species !== 'undefined' && species !== 'null') {
      andConditions.push({ species });
    }

    // Private Scoping for Customer Role: strictly isolate to own pets (Zero data leakage)
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      andConditions.push({
        $or: [
          { owner: req.user._id },
          { ownerId: req.user._id }
        ]
      });
    } else if (customerId && customerId !== 'undefined' && customerId !== 'null') {
      andConditions.push({
        $or: [
          { owner: customerId },
          { ownerId: customerId }
        ]
      });
    } else if (ownerId && ownerId !== 'undefined' && ownerId !== 'null') {
      andConditions.push({
        $or: [
          { owner: ownerId },
          { ownerId: ownerId }
        ]
      });
    }

    if (search && search !== 'undefined' && search !== 'null' && search.trim() !== '') {
      const trimmedSearch = search.trim();
      andConditions.push({
        $or: [
          { name: { $regex: trimmedSearch, $options: 'i' } },
          { petName: { $regex: trimmedSearch, $options: 'i' } },
          { uniquePin: { $regex: trimmedSearch.toUpperCase(), $options: 'i' } },
          { breed: { $regex: trimmedSearch, $options: 'i' } }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const pets = await Pet.find(query)
      .populate('ownerId', 'name email phone address role')
      .populate('owner', 'name email phone address role')
      .sort({ createdAt: -1 });

    const serializedPets = pets.map((p) => {
      const obj = p.toObject ? p.toObject() : { ...p };
      obj.name = obj.name || obj.petName;
      obj.petName = obj.petName || obj.name;
      obj.owner = obj.owner || obj.ownerId;
      obj.ownerId = obj.ownerId || obj.owner;
      obj.ownerName = p.ownerId?.name || p.owner?.name || obj.ownerName || 'Registered Owner';
      obj.ownerPhone = p.ownerId?.phone || p.owner?.phone || obj.ownerPhone || '';
      obj.ownerEmail = p.ownerId?.email || p.owner?.email || obj.ownerEmail || '';
      obj.ownerAddress = p.ownerId?.address || p.owner?.address || obj.ownerAddress || '';
      obj.petId = obj._id;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: serializedPets.length,
      message: 'Pets fetched successfully',
      data: serializedPets,
      pets: serializedPets
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
      .populate('ownerId', 'name email phone address role')
      .populate('owner', 'name email phone address role');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or has been archived'
      });
    }

    // OWASP BOLA Protection: Customer can only view their own pet
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      const petOwnerId = (pet.ownerId?._id || pet.ownerId || pet.owner?._id || pet.owner || '').toString();
      if (petOwnerId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view another customer’s pet profile.'
        });
      }
    }

    const obj = pet.toObject ? pet.toObject() : { ...pet };
    obj.name = obj.name || obj.petName;
    obj.petName = obj.petName || obj.name;
    obj.owner = obj.owner || obj.ownerId;
    obj.ownerId = obj.ownerId || obj.owner;
    obj.ownerName = pet.ownerId?.name || pet.owner?.name || obj.ownerName || 'Registered Owner';
    obj.ownerPhone = pet.ownerId?.phone || pet.owner?.phone || obj.ownerPhone || '';
    obj.ownerEmail = pet.ownerId?.email || pet.owner?.email || obj.ownerEmail || '';
    obj.ownerAddress = pet.ownerId?.address || pet.owner?.address || obj.ownerAddress || '';
    obj.petId = obj._id;

    return res.status(200).json({
      success: true,
      data: obj
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
    const { petName, name, species, breed, age, weight, status, clinicStatus, ownerId, owner } = req.body;

    let pet = await Pet.findOne({ _id: req.params.id, isArchived: false });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found for update'
      });
    }

    // OWASP BOLA Protection: Customer can only update their own pet
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      const petOwnerId = (pet.ownerId?._id || pet.ownerId || pet.owner?._id || pet.owner || '').toString();
      if (petOwnerId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to modify another customer’s pet profile.'
        });
      }
    }

    const finalName = petName || name;
    if (finalName) {
      pet.petName = finalName;
      pet.name = finalName;
    }
    if (species) pet.species = species;
    if (breed) pet.breed = breed;
    if (age !== undefined) pet.age = Number(age);
    if (weight !== undefined) pet.weight = Number(weight);
    if (status) {
      pet.status = status;
      if (status === 'Deceased') pet.clinicStatus = 'Deceased';
    }
    if (clinicStatus) {
      pet.clinicStatus = clinicStatus;
      if (clinicStatus === 'Deceased') pet.status = 'Deceased';
    }
    
    // Only admin can transfer ownership
    const finalOwner = ownerId || owner;
    if (finalOwner && !isCustomer) {
      pet.ownerId = finalOwner;
      pet.owner = finalOwner;
    }

    const updatedPet = await pet.save();
    await updatedPet.populate('ownerId', 'name email role');
    await updatedPet.populate('owner', 'name email role');

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

    // OWASP BOLA Protection: Customer can only delete their own pet
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      const petOwnerId = (pet.ownerId?._id || pet.ownerId || pet.owner?._id || pet.owner || '').toString();
      if (petOwnerId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to delete another customer’s pet profile.'
        });
      }
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
    const {
      diagnosis,
      treatment,
      treatmentNotes,
      vaccineName,
      vetDoctor,
      vetName,
      medicinesPrescribed,
      nextVisitDate
    } = req.body;

    const finalTreatment = treatment || treatmentNotes;
    if (!diagnosis || !finalTreatment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide diagnosis and treatment instructions'
      });
    }

    const pet = await Pet.findOne({ _id: req.params.id, isArchived: false });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet patient record not found'
      });
    }

    const attendingVet = vetName || vetDoctor || 'Dr. Perera (Senior Vet)';

    const logEntry = {
      date: req.body.consultationDate ? new Date(req.body.consultationDate) : new Date(),
      diagnosis,
      treatment: finalTreatment,
      treatmentNotes: treatmentNotes || finalTreatment,
      vaccineName: vaccineName || '',
      vetDoctor: attendingVet,
      vetName: attendingVet,
      medicinesPrescribed: Array.isArray(medicinesPrescribed)
        ? medicinesPrescribed
        : medicinesPrescribed
        ? [medicinesPrescribed]
        : [],
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : undefined
    };

    if (!Array.isArray(pet.medicalLogs)) pet.medicalLogs = [];
    if (!Array.isArray(pet.medicalHistory)) pet.medicalHistory = [];

    pet.medicalLogs.push(logEntry);
    pet.medicalHistory.push(logEntry);

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

/**
 * Toggle / Archive Pet Patient Record
 * Route: PATCH /api/pets/:id/archive
 */
const archivePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet record not found'
      });
    }

    const { isArchived, reason, dateOfEvent, clinicalNotes } = req.body;

    if (isArchived !== undefined) {
      pet.isArchived = Boolean(isArchived);
    } else {
      pet.isArchived = !pet.isArchived;
    }

    if (pet.isArchived) {
      const cleanReason = reason || 'Other';
      pet.archivalDetails = {
        reason: cleanReason,
        dateOfEvent: dateOfEvent ? new Date(dateOfEvent) : new Date(),
        clinicalNotes: clinicalNotes || '',
        archivedAt: new Date(),
        archivedBy: req.user?.name || 'Clinical Staff'
      };

      if (cleanReason === 'Deceased') {
        pet.clinicStatus = 'Deceased';
        pet.status = 'Medical Care';
      } else {
        pet.clinicStatus = `Archived (${cleanReason})`;
      }
    } else {
      // Restoring to Active
      pet.clinicStatus = 'Registered';
      pet.status = 'Available';
    }

    await pet.save();
    await pet.populate('ownerId', 'name email phone address role');

    return res.status(200).json({
      success: true,
      message: `Pet '${pet.petName}' (${pet.uniquePin}) status updated to ${pet.isArchived ? `Archived (${pet.archivalDetails?.reason || 'Archived'})` : 'Active'}`,
      data: pet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating pet archival status',
      error: error.message
    });
  }
};

/**
 * Get Pet Health Summary & Printable Passport Payload
 * Route: GET /api/pets/:id/health-passport
 */
const getPetHealthSummary = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name email phone address role');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet patient record not found'
      });
    }

    const appointments = await Appointment.find({ petId: pet._id }).sort({ appointmentDate: -1 });
    const medicalLogs = pet.medicalLogs || [];
    const vaccinations = medicalLogs.filter(log => log.vaccineName && log.vaccineName.trim() !== '');

    const intakeSummary = {
      intakeDate: pet.createdAt || new Date(),
      registrationPin: pet.uniquePin,
      baselineVitals: {
        weight: pet.weight ? `${pet.weight} kg` : 'Recorded at intake',
        age: `${pet.age} Years`,
        gender: pet.gender || 'Male',
        species: pet.species,
        breed: pet.breed || 'Unknown/Mixed'
      },
      intakeClearanceStatus: 'EHR Verified & Active',
      certifiedHospital: '4 Paw Animal Clinic & Referral Center'
    };

    return res.status(200).json({
      success: true,
      data: {
        pet,
        owner: pet.ownerId,
        medicalLogs,
        appointments,
        vaccinations,
        intakeSummary
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error generating pet health passport payload',
      error: error.message
    });
  }
};

module.exports = {
  petHealthCheck,
  createPet,
  getPetByPin,
  getMyPets,
  searchMyPets,
  getAllPets,
  getPets: getAllPets,
  getPetById,
  updatePet,
  deletePet,
  addMedicalLog,
  archivePet,
  getPetHealthSummary
};
