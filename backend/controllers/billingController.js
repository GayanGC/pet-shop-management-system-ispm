/**
 * ============================================================================
 * CLINICAL MODULE 4: POS & INVOICING CONTROLLER (billingController.js)
 * ============================================================================
 */

const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomDigits}`;
};

const billingHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'POS & Invoicing System',
    status: 'Operational',
    message: 'POS & Invoicing Module connected successfully!'
  });
};

const createInvoice = async (req, res) => {
  try {
    const { customerId, items, paymentMethod, paymentStatus, discountRate, taxRate } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invoice must contain at least one item'
      });
    }

    let invoiceNo = generateInvoiceNumber();
    let invoiceExists = await Invoice.findOne({ invoiceNo });
    while (invoiceExists) {
      invoiceNo = generateInvoiceNumber();
      invoiceExists = await Invoice.findOne({ invoiceNo });
    }

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

      // Deduct stock count if product ID is provided
      if (item.product) {
        const prod = await Product.findById(item.product);
        if (prod) {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - qty);
          await prod.save();
        }
      }
    }

    // Calculate discount and tax
    const discRate = discountRate ? Number(discountRate) : 0;
    const tRate = taxRate ? Number(taxRate) : 0;

    const discountAmount = calculatedTotal * (discRate / 100);
    const amountAfterDiscount = calculatedTotal - discountAmount;
    const taxAmount = amountAfterDiscount * (tRate / 100);
    const finalTotal = amountAfterDiscount + taxAmount;

    const invoice = await Invoice.create({
      invoiceNo,
      customerId: customerId || null,
      items: processedItems,
      totalAmount: calculatedTotal,
      discountRate: discRate,
      discountAmount,
      taxRate: tRate,
      taxAmount,
      finalTotal,
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
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching invoice records',
      error: error.message
    });
  }
};

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
 * Void Invoice Transaction and RESTORE Product Stock Count
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

    // Restore stock counts for purchased items
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        if (item.product) {
          const prod = await Product.findById(item.product);
          if (prod) {
            prod.stockQuantity += Number(item.quantity);
            await prod.save();
          }
        }
      }
    }

    invoice.isVoided = true;
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Invoice '${invoice.invoiceNo}' voided and stock restored successfully`,
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
