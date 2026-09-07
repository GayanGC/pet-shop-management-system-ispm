/**
 * ============================================================================
 * CLINICAL MODULE 2: SUPPLIER CONTROLLER (supplierController.js)
 * ============================================================================
 */

const Supplier = require('../models/Supplier');

// Seed 3 initial suppliers if empty
const seedInitialSuppliers = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      await Supplier.insertMany([
        {
          name: 'VetMed Lanka',
          contactPerson: 'Dr. Nimal Silva',
          phone: '077-1234567',
          email: 'info@vetmedlanka.lk',
          address: 'No. 45, Baseline Road, Colombo 09',
          suppliedCategories: ['Vaccines', 'Antibiotics', 'Healthcare'],
          status: 'Active'
        },
        {
          name: 'Ceylon Pet Supplies',
          contactPerson: 'Sunethra Dias',
          phone: '071-9876543',
          email: 'sales@ceylonpet.lk',
          address: 'No. 120, Kandy Road, Kelaniya',
          suppliedCategories: ['Pet Food', 'Toys', 'Grooming Supplies'],
          status: 'Active'
        },
        {
          name: 'MediVet Pharmaceuticals',
          contactPerson: 'K. Perera',
          phone: '011-2345678',
          email: 'orders@medivet.lk',
          address: 'No. 88, Galle Road, Dehiwala',
          suppliedCategories: ['Supplements', 'Dewormers', 'General'],
          status: 'Active'
        }
      ]);
    }
  } catch (err) {
    console.error('[Supplier Seeding Error]:', err.message);
  }
};

/**
 * @desc Get all suppliers (seeds default list if empty)
 * @route GET /api/suppliers
 */
const getSuppliers = async (req, res) => {
  try {
    await seedInitialSuppliers();
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching suppliers directory',
      error: error.message
    });
  }
};

/**
 * @desc Create new supplier
 * @route POST /api/suppliers
 */
const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, suppliedCategories, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier company name is required'
      });
    }

    let categoriesArray = [];
    if (Array.isArray(suppliedCategories)) {
      categoriesArray = suppliedCategories;
    } else if (typeof suppliedCategories === 'string') {
      categoriesArray = suppliedCategories.split(',').map(c => c.trim()).filter(Boolean);
    }

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      suppliedCategories: categoriesArray.length > 0 ? categoriesArray : ['Healthcare'],
      status: status || 'Active'
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier registered successfully in directory',
      data: supplier
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error creating supplier',
      error: error.message
    });
  }
};

/**
 * @desc Update existing supplier
 * @route PUT /api/suppliers/:id
 */
const updateSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, suppliedCategories, status } = req.body;

    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier record not found'
      });
    }

    if (name) supplier.name = name;
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (phone !== undefined) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (address !== undefined) supplier.address = address;
    if (status) supplier.status = status;

    if (suppliedCategories !== undefined) {
      if (Array.isArray(suppliedCategories)) {
        supplier.suppliedCategories = suppliedCategories;
      } else if (typeof suppliedCategories === 'string') {
        supplier.suppliedCategories = suppliedCategories.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    const updated = await supplier.save();

    return res.status(200).json({
      success: true,
      message: 'Supplier record updated successfully',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating supplier',
      error: error.message
    });
  }
};

/**
 * @desc Delete / remove supplier
 * @route DELETE /api/suppliers/:id
 */
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier record not found'
      });
    }

    await supplier.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Supplier '${supplier.name}' removed successfully`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error removing supplier',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
