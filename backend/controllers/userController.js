/**
 * ============================================================================
 * SHARED CONTROLLER: USER & CLIENT MANAGEMENT (userController.js)
 * ============================================================================
 * Manages user accounts, customer directory listings, client profiles,
 * and associated pet patient associations.
 */

const User = require('../models/User');
const Pet = require('../models/Pet');

/**
 * @desc    Get all registered customers with their associated pets
 * @route   GET /api/users/customers (or GET /api/users?role=customer)
 * @access  Public / Staff / Admin
 */
const getCustomers = async (req, res) => {
  try {
    const { search, role: queryRole } = req.query;

    const targetRole = queryRole || 'customer';
    let query = {
      role: { $in: [targetRole.toLowerCase(), targetRole] }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch customers
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Fetch all active pets for each customer in parallel
    const customerIds = customers.map((c) => c._id);
    const allPets = await Pet.find({
      ownerId: { $in: customerIds },
      isArchived: false
    }).sort({ createdAt: -1 });

    // Group pets by ownerId
    const petsByOwner = {};
    allPets.forEach((pet) => {
      const ownerKey = pet.ownerId.toString();
      if (!petsByOwner[ownerKey]) {
        petsByOwner[ownerKey] = [];
      }
      petsByOwner[ownerKey].push({
        _id: pet._id,
        petId: pet._id,
        uniquePin: pet.uniquePin,
        petName: pet.petName,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        gender: pet.gender,
        status: pet.status,
        clinicStatus: pet.clinicStatus,
        medicalLogsCount: pet.medicalLogs ? pet.medicalLogs.length : 0,
        createdAt: pet.createdAt
      });
    });

    const formattedCustomers = customers.map((cust) => {
      const custPets = petsByOwner[cust._id.toString()] || [];
      return {
        _id: cust._id,
        id: cust._id,
        name: cust.name,
        email: cust.email || 'No email provided',
        phone: cust.phone || 'No phone provided',
        role: cust.role,
        address: cust.address || '',
        registeredDate: cust.createdAt,
        createdAt: cust.createdAt,
        totalPets: custPets.length,
        petsCount: custPets.length,
        pets: custPets
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedCustomers.length,
      data: formattedCustomers,
      customers: formattedCustomers
    });
  } catch (error) {
    console.error('[Get Customers Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching customer directory',
      error: error.message
    });
  }
};

/**
 * @desc    Get all system users across all roles
 * @route   GET /api/users
 * @access  Admin / Staff
 */
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    if (role === 'customer' || !role) {
      return getCustomers(req, res);
    }

    const users = await User.find({ role: { $regex: new RegExp(`^${role}$`, 'i') } })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by ID with their pets
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const pets = await Pet.find({ ownerId: user._id, isArchived: false });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        pets
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching user profile',
      error: error.message
    });
  }
};

module.exports = {
  getCustomers,
  getAllUsers,
  getUserById
};
