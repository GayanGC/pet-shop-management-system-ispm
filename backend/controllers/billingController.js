/**
 * ============================================================================
 * CLINICAL MODULE 4: POS & INVOICING CONTROLLER (billingController.js)
 * ============================================================================
 */

const mongoose = require('mongoose');
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
    const { customerId, items, paymentMethod, paymentStatus, discountRate, taxRate, tenderedAmount } = req.body;

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

    const sanitizedItems = (items || []).map((item) => {
      const itemName = item.itemName || item.name || 'Product Item';
      const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : (item.price || 0));
      const quantity = Number(item.quantity || 1);
      const subtotal = Number(item.subtotal !== undefined ? item.subtotal : (unitPrice * quantity));
      const rawProd = item.productId || item.product || item._id;
      const productId = (rawProd && mongoose.Types.ObjectId.isValid(rawProd)) ? rawProd : null;

      return {
        product: productId,
        productId,
        itemName,
        unitPrice,
        price: unitPrice,
        quantity,
        subtotal
      };
    });

    // Validation check
    for (const item of sanitizedItems) {
      if (!item.itemName || item.unitPrice <= 0 || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have itemName, unitPrice, and quantity'
        });
      }
    }

    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of sanitizedItems) {
      calculatedTotal += item.subtotal;
      processedItems.push({
        product: item.product,
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal
      });
    }

    // Calculate discount and tax
    const discRate = discountRate ? Number(discountRate) : 0;
    const tRate = taxRate ? Number(taxRate) : 0;

    const discountAmount = calculatedTotal * (discRate / 100);
    const amountAfterDiscount = calculatedTotal - discountAmount;
    const taxAmount = amountAfterDiscount * (tRate / 100);
    const finalTotal = amountAfterDiscount + taxAmount;

    // Normalize Payment Method
    let pMethod = paymentMethod || 'Cash';
    const pMethodLower = String(pMethod).toLowerCase();
    if (pMethodLower.includes('card')) {
      pMethod = 'Card';
    } else if (pMethodLower.includes('online') || pMethodLower.includes('bank') || pMethodLower.includes('qr') || pMethodLower.includes('transfer')) {
      pMethod = 'Online';
    } else {
      pMethod = 'Cash';
    }

    // Cash Tendered validation (tenderedAmount >= finalTotal)
    if (tenderedAmount !== undefined && pMethod === 'Cash') {
      if (Number(tenderedAmount) < finalTotal) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: Cash tendered (Rs. ${Number(tenderedAmount).toFixed(2)}) is less than total amount (Rs. ${finalTotal.toFixed(2)})`
        });
      }
    }

    // Atomic Stock Auto-Deduction Verification via $inc
    for (const item of processedItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity }
        });
      }
    }

    const changeAmount = tenderedAmount !== undefined ? Math.max(0, Number(tenderedAmount) - finalTotal) : 0;

    const rawCustomer = req.body.customerId || req.body.customer || (req.user ? req.user._id : null);
    const validCustomerId = (rawCustomer && mongoose.Types.ObjectId.isValid(rawCustomer)) ? rawCustomer : null;
    const customerName = req.body.customerName || (req.user ? req.user.name : '');
    const customerPhone = req.body.customerPhone || (req.user ? req.user.phone : '');
    const customerEmail = req.body.customerEmail || (req.user ? req.user.email : '');
    const fulfillmentMethod = req.body.fulfillmentMethod || 'Clinic Pickup';
    const deliveryAddress = req.body.deliveryAddress || req.body.address || '';
    const deliveryFee = Number(req.body.deliveryFee || 0);
    const notes = req.body.notes || '';

    const invoice = await Invoice.create({
      invoiceNo,
      customerId: validCustomerId,
      customerName,
      customerPhone,
      customerEmail,
      fulfillmentMethod,
      deliveryAddress,
      deliveryFee,
      notes,
      items: processedItems,
      totalAmount: calculatedTotal,
      discountRate: discRate,
      discountAmount,
      taxRate: tRate,
      taxAmount,
      finalTotal,
      paymentMethod: pMethod,
      paymentStatus: paymentStatus || 'Paid',
      tenderedAmount: tenderedAmount !== undefined ? Number(tenderedAmount) : null,
      changeAmount
    });

    if (validCustomerId) {
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
    const { paymentStatus, paymentMethod, customerId } = req.query;

    let query = { isVoided: false };

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    // Private Scoping for Customer Role: only see own order receipts
    const isCustomer = req.user && req.user.role && req.user.role.toLowerCase() === 'customer';
    if (isCustomer) {
      const orList = [
        { customerId: req.user._id },
        { customerId: String(req.user._id) }
      ];
      if (req.user.name) orList.push({ customerName: new RegExp(`^${req.user.name}$`, 'i') });
      if (req.user.phone) orList.push({ customerPhone: req.user.phone });
      if (req.user.email) orList.push({ customerEmail: new RegExp(`^${req.user.email}$`, 'i') });
      query.$or = orList;
    } else if (customerId) {
      const targetCust = (customerId && mongoose.Types.ObjectId.isValid(customerId)) ? new mongoose.Types.ObjectId(customerId) : customerId;
      query.$or = [{ customerId: targetCust }, { customerId: String(customerId) }];
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email phone role')
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

/**
 * GET Sales Financial Analytics & Aggregations
 */
const getSalesAnalytics = async (req, res) => {
  try {
    const invoices = await Invoice.find({ isVoided: false }).populate('customerId', 'name email');

    let totalRevenue = 0;
    let paidInvoicesCount = 0;
    const paymentMap = { Cash: { count: 0, revenue: 0 }, Card: { count: 0, revenue: 0 }, Online: { count: 0, revenue: 0 } };
    const itemMap = {};
    const dailyMap = {};

    invoices.forEach(inv => {
      const revenue = inv.finalTotal || inv.totalAmount || 0;
      totalRevenue += revenue;
      if (inv.paymentStatus === 'Paid') paidInvoicesCount++;

      // Payment method split
      const method = inv.paymentMethod || 'Cash';
      if (!paymentMap[method]) paymentMap[method] = { count: 0, revenue: 0 };
      paymentMap[method].count += 1;
      paymentMap[method].revenue += revenue;

      // Daily sales date grouping YYYY-MM-DD
      const dateKey = inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, totalAmount: 0, ordersCount: 0 };
      dailyMap[dateKey].totalAmount += revenue;
      dailyMap[dateKey].ordersCount += 1;

      // Items breakdown
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach(item => {
          const name = item.itemName;
          const qty = Number(item.quantity || 1);
          const itemRev = Number(item.subtotal || 0);
          if (!itemMap[name]) itemMap[name] = { itemName: name, totalQuantity: 0, totalRevenue: 0 };
          itemMap[name].totalQuantity += qty;
          itemMap[name].totalRevenue += itemRev;
        });
      }
    });

    // Format top 5 selling items
    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Format daily sales array sorted by date
    const dailySales = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Summary object
    const totalInvoices = invoices.length;
    const averageOrderValue = totalInvoices > 0 ? (totalRevenue / totalInvoices) : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalInvoices,
          paidInvoicesCount,
          averageOrderValue
        },
        dailySales,
        paymentMethodBreakdown: paymentMap,
        topSellingItems
      }
    });
  } catch (error) {
    console.error('[Sales Analytics Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error aggregating sales analytics',
      error: error.message
    });
  }
};

/**
 * Export Invoices as RFC-4180 Compliant CSV
 */
const exportInvoicesCSV = async (req, res) => {
  try {
    const invoices = await Invoice.find({ isVoided: false }).populate('customerId', 'name email').sort({ createdAt: -1 });

    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Payment Method', 'Subtotal (LKR)', 'Discount (%)', 'Tax (%)', 'Grand Total (LKR)', 'Status'];
    const rows = invoices.map(inv => {
      const dateStr = inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '';
      const customerName = inv.customerId ? inv.customerId.name : 'Walk-in Client';
      return [
        `"${inv.invoiceNo}"`,
        `"${dateStr}"`,
        `"${customerName}"`,
        `"${inv.paymentMethod}"`,
        (inv.totalAmount || 0).toFixed(2),
        (inv.discountRate || 0),
        (inv.taxRate || 0),
        (inv.finalTotal || inv.totalAmount || 0).toFixed(2),
        `"${inv.paymentStatus}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="4paw_sales_report.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error exporting CSV',
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
  voidInvoice,
  getSalesAnalytics,
  exportInvoicesCSV
};
