/**
 * ============================================================================
 * MEMBER 4 MODULE: BILLING CONTROLLER (billingController.js)
 * ============================================================================
 * Assigned to: Team Member 4 (Order Processing & POS Billing System)
 * 
 * Explanation for Viva:
 * - Handles checkout invoice generation, POS payments, and sales processing.
 * - Auto-generates unique invoice numbers (e.g. INV-2026-001).
 * - Automatically calculates line item subtotals and grand total.
 * - Supports soft-delete/voiding transactions (isVoided: true).
 */

const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

/**
 * Helper Utility: Generate Unique Invoice Number (e.g. INV-2026-1042)
 */
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomDigits}`;
};

/**
 * @desc    Health check endpoint for Member 4 Billing Module
 * @route   GET /api/billing/health
 * @access  Public
 */
const billingHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'Member 4: Order Processing & POS Billing System',
    status: 'Operational',
    message: 'Member 4: Order Billing Module connected successfully!'
  });
};

/**
 * @desc    Create a new checkout order invoice
 * @route   POST /api/billing
 * @access  Private (Staff / Admin)
 */
const createInvoice = async (req, res) => {
  try {
    const { customerId, items, paymentMethod, paymentStatus } = req.body;

    // 1. Validate items array presence
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invoice must contain at least one purchased item'
      });
    }

    // 2. Auto-generate unique Invoice Number
    let invoiceNo = generateInvoiceNumber();
    let invoiceExists = await Invoice.findOne({ invoiceNo });
    while (invoiceExists) {
      invoiceNo = generateInvoiceNumber();
      invoiceExists = await Invoice.findOne({ invoiceNo });
    }

    // 3. Process items and calculate subtotals & grand total
    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.itemName || item.unitPrice === undefined || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have itemName, unitPrice, and quantity'
        });
      }

      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      const lineSubtotal = qty * price;
      calculatedTotal += lineSubtotal;

      processedItems.push({
        product: item.product || null,
        itemName: item.itemName,
        unitPrice: price,
        quantity: qty,
        subtotal: lineSubtotal
      });

      // Optionally reduce stock count if product ID is linked
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod && prod.stockQuantity >= qty) {
          prod.stockQuantity -= qty;
          await prod.save();
        }
      }
    }

    // 4. Save invoice to database
    const invoice = await Invoice.create({
      invoiceNo,
      customerId: customerId || null,
      items: processedItems,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid'
    });

    if (customerId) {
      await invoice.populate('customerId', 'name email role');
    }

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('[Create Invoice Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error generating invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Get all active sales invoices
 * @route   GET /api/billing
 * @access  Private (Staff / Admin)
 */
const getAllInvoices = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.query;

    let query = { isVoided: false };

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      message: 'Invoices fetched successfully',
      data: invoices
    });
  } catch (error) {
    console.error('[Get All Invoices Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching invoice records',
      error: error.message
    });
  }
};

/**
 * @desc    Get single invoice details by ID
 * @route   GET /api/billing/:id
 * @access  Private (Staff / Admin)
 */
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, isVoided: false })
      .populate('customerId', 'name email role');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice record not found or has been voided'
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching invoice summary',
      error: error.message
    });
  }
};

/**
 * @desc    Update invoice payment status or payment method
 * @route   PUT /api/billing/:id
 * @access  Private (Staff / Admin)
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    let invoice = await Invoice.findOne({ _id: req.params.id, isVoided: false });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice record not found for update'
      });
    }

    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    const updatedInvoice = await invoice.save();
    if (updatedInvoice.customerId) {
      await updatedInvoice.populate('customerId', 'name email role');
    }

    return res.status(200).json({
      success: true,
      message: 'Invoice payment status updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error updating invoice payment status',
      error: error.message
    });
  }
};

/**
 * @desc    Void / soft delete an invoice transaction
 * @route   DELETE /api/billing/:id
 * @access  Private (Admin only)
 */
const voidInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.isVoided) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or already voided'
      });
    }

    invoice.isVoided = true;
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Invoice '${invoice.invoiceNo}' successfully voided`,
      data: { _id: invoice._id, isVoided: true }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error voiding invoice',
      error: error.message
    });
  }
};

module.exports = {
  billingHealthCheck,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updatePaymentStatus,
  voidInvoice
};
