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
          suppliedCategories: ['Pet Food', 'Toys', 'Clinical Consumables'],
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

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    let categoriesArray = [];
    if (Array.isArray(suppliedCategories)) {
      categoriesArray = suppliedCategories;
    } else if (typeof suppliedCategories === 'string') {
      categoriesArray = suppliedCategories.split(',').map(c => c.trim()).filter(Boolean);
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : '',
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      suppliedCategories: categoriesArray.length > 0 ? categoriesArray : ['Medicines'],
      status: status || 'Active'
    });

    return res.status(201).json({
      success: true,
      message: 'Supplier registered successfully in directory',
      data: supplier
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
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

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Supplier name is required'
        });
      }
      supplier.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      supplier.phone = phone.trim();
    }

    if (contactPerson !== undefined) supplier.contactPerson = contactPerson.trim();
    if (email !== undefined) supplier.email = email.trim();
    if (address !== undefined) supplier.address = address.trim();
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
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
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
