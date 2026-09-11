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
      const orList = [{ customerId: req.user._id }];
      if (req.user.name) orList.push({ customerName: new RegExp(`^${req.user.name}$`, 'i') });
      if (req.user.phone) orList.push({ customerPhone: req.user.phone });
      query.$or = orList;
    } else if (customerId) {
      query.customerId = customerId;
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
