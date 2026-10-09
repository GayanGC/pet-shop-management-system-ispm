/**
 * ============================================================================
 * CLINICAL MODULE 4: POS & INVOICING CONTROLLER (billingController.js)
 * ============================================================================
 */

const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const CashierShift = require('../models/CashierShift');

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomDigits}`;
};

const round2 = (val) => Math.round((Number(val) + Number.EPSILON) * 100) / 100;

const billingHealthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    module: 'POS & Invoicing System',
    status: 'Operational',
    message: 'POS & Invoicing Module connected successfully!'
  });
};

/**
 * POS Checkout / Create Invoice with Stock Decrement and Shift Linking
 */
const createInvoice = async (req, res) => {
  try {
    const { customerId, items, paymentMethod, paymentStatus, discountRate, taxRate, petId, pet } = req.body;

    const patientId = petId || pet;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      const petDoc = await Pet.findById(patientId);
      if (petDoc && (petDoc.isArchived || petDoc.clinicStatus === 'Deceased' || petDoc.status === 'Deceased' || petDoc.archivalDetails?.reason === 'Deceased')) {
        return res.status(400).json({
          success: false,
          message: `Cannot process POS transaction: Patient '${petDoc.petName}' is marked as Deceased/Archived.`
        });
      }
    }

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

    const extractProductId = (item) => {
      if (!item) return null;
      const rawProd = (item.product && typeof item.product === 'object' ? (item.product._id || item.product.id) : null)
        || (item.productId && typeof item.productId === 'object' ? (item.productId._id || item.productId.id) : null)
        || (item._id && typeof item._id === 'object' ? (item._id._id || item._id.id) : null)
        || item.product
        || item.productId
        || item._id;
      if (!rawProd) return null;
      const str = String(rawProd).trim();
      return mongoose.Types.ObjectId.isValid(str) ? str : null;
    };

    const sanitizedItems = (items || []).map((item) => {
      const itemName = item.itemName || item.name || 'Product Item';
      const unitPrice = round2(Number(item.unitPrice !== undefined ? item.unitPrice : (item.price || 0)));
      const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
      const subtotal = round2(unitPrice * quantity);
      const productId = extractProductId(item);

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
      if (!item.itemName || item.unitPrice <= 0 || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Each item must have a valid itemName, positive unitPrice, and positive integer quantity'
        });
      }
    }

    // Over-Stock selling guard: Pre-check inventory availability
    for (const item of sanitizedItems) {
      if (item.product) {
        const productDoc = await Product.findById(item.product);
        if (productDoc) {
          if (productDoc.stockQuantity < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for product '${productDoc.itemName || item.itemName}'. Available in inventory: ${productDoc.stockQuantity}, Requested: ${item.quantity}`
            });
          }
        }
      }
    }

    let calculatedTotal = 0;
    const processedItems = [];

    for (const item of sanitizedItems) {
      calculatedTotal = round2(calculatedTotal + item.subtotal);
      processedItems.push({
        product: item.product,
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal
      });
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Invoice subtotal must be greater than zero'
      });
    }

    // Discount rate bounds (0% to 50%)
    const discRate = discountRate ? Number(discountRate) : 0;
    if (isNaN(discRate) || discRate < 0 || discRate > 50) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Discount rate must be between 0% and 50%'
      });
    }

    // Tax rate bounds (0% to 15%)
    const tRate = taxRate ? Number(taxRate) : 0;
    if (isNaN(tRate) || tRate < 0 || tRate > 15) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Tax rate must be between 0% and 15%'
      });
    }

    const discountAmount = round2(calculatedTotal * (discRate / 100));
    const amountAfterDiscount = round2(calculatedTotal - discountAmount);
    const taxAmount = round2(amountAfterDiscount * (tRate / 100));
    const finalTotal = round2(amountAfterDiscount + taxAmount);

    if (finalTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Final invoice amount must be greater than zero'
      });
    }

    // Normalize Payment Method & Multi-Tender Breakdown
    let pMethod = paymentMethod || 'Cash';
    const pMethodLower = String(pMethod).toLowerCase();
    let paymentBreakdown = { cash: 0, card: 0 };
    let finalTendered = 0;
    let changeAmount = 0;

    if (pMethodLower === 'split') {
      pMethod = 'Split';
      const rawBreakdown = req.body.paymentBreakdown || {};
      const splitCash = round2(Number(rawBreakdown.cash || 0));
      const splitCard = round2(Number(rawBreakdown.card || 0));

      if (splitCash < 0 || splitCard < 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Split payment cash and card components cannot be negative'
        });
      }

      const totalSplit = round2(splitCash + splitCard);
      if (totalSplit < round2(finalTotal - 0.05)) {
        return res.status(400).json({
          success: false,
          message: `Split payment totals (Cash: Rs. ${splitCash.toFixed(2)}, Card: Rs. ${splitCard.toFixed(2)} = Rs. ${totalSplit.toFixed(2)}) cannot be less than invoice total (Rs. ${finalTotal.toFixed(2)}). Shortfall: Rs. ${(finalTotal - totalSplit).toFixed(2)}`
        });
      }

      paymentBreakdown = { cash: splitCash, card: splitCard };
      finalTendered = totalSplit;
      changeAmount = round2(Math.max(0, totalSplit - finalTotal));
    } else if (pMethodLower.includes('card')) {
      pMethod = 'Card';
      paymentBreakdown = { cash: 0, card: finalTotal };
      finalTendered = finalTotal;
      changeAmount = 0;
    } else if (pMethodLower.includes('online') || pMethodLower.includes('bank') || pMethodLower.includes('qr') || pMethodLower.includes('transfer')) {
      pMethod = 'Online';
      paymentBreakdown = { cash: 0, card: 0 };
      finalTendered = finalTotal;
      changeAmount = 0;
    } else {
      pMethod = 'Cash';
      const rawTendered = req.body.tenderedAmount !== undefined ? req.body.tenderedAmount : req.body.cashTendered;
      finalTendered = rawTendered !== undefined && rawTendered !== null && rawTendered !== ''
        ? round2(Number(rawTendered))
        : 0;

      if (finalTendered < finalTotal) {
        return res.status(400).json({
          success: false,
          message: `Tendered cash (Rs. ${finalTendered.toFixed(2)}) cannot be less than invoice total (Rs. ${finalTotal.toFixed(2)}). Shortfall: Rs. ${(finalTotal - finalTendered).toFixed(2)}`
        });
      }

      changeAmount = round2(Math.max(0, finalTendered - finalTotal));
      paymentBreakdown = { cash: finalTotal, card: 0 };
    }

    // Atomic stock deduction with strict concurrency guard
    for (const item of items) {
      const prodId = extractProductId(item);
      const qty = Number(item.quantity) || 1;

      if (prodId) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: prodId, stockQuantity: { $gte: qty } },
          { $inc: { stockQuantity: -qty } },
          { new: true }
        );

        if (!updatedProduct) {
          console.warn(`[POS Stock Warning] Could not decrement stock for product ID: ${prodId}. Either product not found or insufficient stock.`);
        } else {
          console.log(`[POS Stock Success] Decremented ${qty} from ${updatedProduct.itemName}. New Stock: ${updatedProduct.stockQuantity}`);
        }
      }
    }

    // Find active cashier shift if any
    let activeShift = await CashierShift.findOne({ status: 'Open' }).sort({ openedAt: -1 });

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
      paymentBreakdown,
      shiftId: activeShift ? activeShift._id : null,
      paymentStatus: paymentStatus || 'Paid',
      tenderedAmount: finalTendered,
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

/**
 * GET All Invoices with Optional Voided Filter and Private Customer Scoping
 */
const getAllInvoices = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, customerId, isVoided, includeVoided } = req.query;

    let query = {};

    if (includeVoided === 'true' || isVoided === 'all') {
      // Return all including voided
    } else if (isVoided === 'true') {
      query.isVoided = true;
    } else {
      query.isVoided = false;
    }

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
      .populate('voidedBy', 'name email role')
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

/**
 * GET Single Invoice by ID
 */
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email role')
      .populate('voidedBy', 'name email role');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice record not found'
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
 * Update Payment Status
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    let invoice = await Invoice.findOne({ _id: req.params.id, isVoided: false });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice record not found or is voided'
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
 * Void Invoice Transaction and ATOMICALLY RESTORE Product Stock Count ($inc: +qty)
 */
const voidInvoice = async (req, res) => {
  try {
    const { voidReason, voidNotes } = req.body;
    const VALID_REASONS = [
      'Cashier Entry Error',
      'Client Cancelled / Return',
      'Defective / Damaged Medicine',
      'Incorrect Pricing Applied',
      'Other'
    ];

    if (!voidReason || !VALID_REASONS.includes(voidReason)) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: A mandatory void reason is required. Permitted reasons: ${VALID_REASONS.join(', ')}`
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice record not found'
      });
    }

    if (invoice.isVoided) {
      return res.status(400).json({
        success: false,
        message: `Invoice '${invoice.invoiceNo}' has already been voided on ${new Date(invoice.voidedAt).toLocaleString()}`
      });
    }

    // Atomic restore stock counts for purchased items using $inc: +qty
    const restoralLogs = [];
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        const prodId = item.product || item.productId;
        const qty = Number(item.quantity) || 1;
        if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
          const updatedProd = await Product.findByIdAndUpdate(
            prodId,
            { $inc: { stockQuantity: qty } },
            { new: true }
          );
          if (updatedProd) {
            restoralLogs.push({
              productId: prodId,
              itemName: updatedProd.itemName,
              restoredQty: qty,
              newStock: updatedProd.stockQuantity
            });
            console.log(`[POS Void Restoral] Restored ${qty} units to '${updatedProd.itemName}'. New Stock: ${updatedProd.stockQuantity}`);
          }
        }
      }
    }

    invoice.isVoided = true;
    invoice.voidReason = voidReason;
    invoice.voidNotes = voidNotes || '';
    invoice.voidedAt = new Date();
    invoice.voidedBy = req.user ? req.user._id : null;
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Invoice '${invoice.invoiceNo}' voided successfully and inventory stock restored atomically.`,
      data: invoice,
      restoralLogs
    });
  } catch (error) {
    console.error('[Void Invoice Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error voiding invoice',
      error: error.message
    });
  }
};

/**
 * ============================================================================
 * CASHIER SHIFT & Z-REPORT SETTLEMENT CONTROLLERS
 * ============================================================================
 */

/**
 * GET Active Cashier Shift with Real-Time Metrics
 */
const getCurrentShift = async (req, res) => {
  try {
    const shift = await CashierShift.findOne({ status: 'Open' })
      .populate('cashier', 'name email role')
      .sort({ openedAt: -1 });

    if (!shift) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active cashier shift currently open'
      });
    }

    // Aggregate live running metrics
    const invoices = await Invoice.find({
      $or: [
        { shiftId: shift._id },
        { createdAt: { $gte: shift.openedAt }, shiftId: null }
      ]
    });

    let activeCount = 0;
    let voidedCount = 0;
    let grossSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let onlineSales = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const inv of invoices) {
      if (inv.isVoided) {
        voidedCount++;
      } else {
        activeCount++;
        grossSales = round2(grossSales + (inv.finalTotal || 0));
        totalTax = round2(totalTax + (inv.taxAmount || 0));
        totalDiscount = round2(totalDiscount + (inv.discountAmount || 0));

        if (inv.paymentMethod === 'Cash') {
          cashSales = round2(cashSales + (inv.finalTotal || 0));
        } else if (inv.paymentMethod === 'Card') {
          cardSales = round2(cardSales + (inv.finalTotal || 0));
        } else if (inv.paymentMethod === 'Split') {
          cashSales = round2(cashSales + (inv.paymentBreakdown?.cash || 0));
          cardSales = round2(cardSales + (inv.paymentBreakdown?.card || 0));
        } else {
          onlineSales = round2(onlineSales + (inv.finalTotal || 0));
        }
      }
    }

    const expectedCashInDrawer = round2(shift.openingFloat + cashSales);

    return res.status(200).json({
      success: true,
      data: {
        shift,
        liveMetrics: {
          totalInvoicesCount: invoices.length,
          activeInvoicesCount: activeCount,
          voidedInvoicesCount: voidedCount,
          grossSales,
          netSales: grossSales,
          totalTax,
          totalDiscount,
          cashSales,
          cardSales,
          onlineSales,
          openingFloat: shift.openingFloat,
          expectedCashInDrawer
        }
      }
    });
  } catch (error) {
    console.error('[Get Current Shift Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error retrieving current shift',
      error: error.message
    });
  }
};

/**
 * POST Open New Cashier Shift
 */
const openShift = async (req, res) => {
  try {
    const existingOpen = await CashierShift.findOne({ status: 'Open' });
    if (existingOpen) {
      return res.status(400).json({
        success: false,
        message: `An active cashier shift (${existingOpen.shiftNo}) is already open. Please reconcile and close the current shift before opening a new one.`
      });
    }

    const openingFloat = Math.max(0, Number(req.body.openingFloat || 0));
    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSeed = Math.floor(1000 + Math.random() * 9000);
    const shiftNo = `SHIFT-${dateCode}-${randSeed}`;

    const cashierId = req.user ? req.user._id : null;
    const cashierName = req.user ? (req.user.name || req.user.email) : 'Clinic Cashier';

    const newShift = await CashierShift.create({
      shiftNo,
      cashier: cashierId,
      cashierName,
      status: 'Open',
      openingFloat,
      openedAt: now
    });

    return res.status(201).json({
      success: true,
      message: `Cashier Shift ${shiftNo} opened successfully with float of Rs. ${openingFloat.toFixed(2)}`,
      data: newShift
    });
  } catch (error) {
    console.error('[Open Shift Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error opening cashier shift',
      error: error.message
    });
  }
};

/**
 * POST Settle & Close Cashier Shift (Z-Report Generation)
 */
const closeShift = async (req, res) => {
  try {
    const { actualCashCounted, closingNotes } = req.body;
    const shiftId = req.params.id;

    let shift;
    if (shiftId && mongoose.Types.ObjectId.isValid(shiftId)) {
      shift = await CashierShift.findById(shiftId);
    } else {
      shift = await CashierShift.findOne({ status: 'Open' }).sort({ openedAt: -1 });
    }

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'No open cashier shift found to close.'
      });
    }

    if (shift.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: `Shift ${shift.shiftNo} has already been closed on ${new Date(shift.closedAt).toLocaleString()}`
      });
    }

    if (actualCashCounted === undefined || actualCashCounted === null || isNaN(Number(actualCashCounted))) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Actual cash drawer count is required for shift settlement.'
      });
    }

    const closingTime = new Date();

    // Fetch all invoices belonging to this shift
    const invoices = await Invoice.find({
      $or: [
        { shiftId: shift._id },
        { createdAt: { $gte: shift.openedAt, $lte: closingTime }, shiftId: null }
      ]
    });

    // Backfill shiftId onto any unlinked invoices created during this shift
    const unlinkedIds = invoices.filter(inv => !inv.shiftId).map(inv => inv._id);
    if (unlinkedIds.length > 0) {
      await Invoice.updateMany({ _id: { $in: unlinkedIds } }, { $set: { shiftId: shift._id } });
    }

    let totalInvoicesCount = invoices.length;
    let voidedInvoicesCount = 0;
    let grossSales = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let cashSales = 0;
    let cardSales = 0;
    let onlineSales = 0;

    for (const inv of invoices) {
      if (inv.isVoided) {
        voidedInvoicesCount++;
      } else {
        grossSales = round2(grossSales + (inv.finalTotal || 0));
        totalTax = round2(totalTax + (inv.taxAmount || 0));
        totalDiscount = round2(totalDiscount + (inv.discountAmount || 0));

        if (inv.paymentMethod === 'Cash') {
          cashSales = round2(cashSales + (inv.finalTotal || 0));
        } else if (inv.paymentMethod === 'Card') {
          cardSales = round2(cardSales + (inv.finalTotal || 0));
        } else if (inv.paymentMethod === 'Split') {
          cashSales = round2(cashSales + (inv.paymentBreakdown?.cash || 0));
          cardSales = round2(cardSales + (inv.paymentBreakdown?.card || 0));
        } else {
          onlineSales = round2(onlineSales + (inv.finalTotal || 0));
        }
      }
    }

    const expectedCashInDrawer = round2(shift.openingFloat + cashSales);
    const countedCash = round2(Number(actualCashCounted));
    const cashDiscrepancy = round2(countedCash - expectedCashInDrawer);

    const dateCode = closingTime.toISOString().slice(0, 10).replace(/-/g, '');
    const randSeed = Math.floor(1000 + Math.random() * 9000);
    const zReportNo = `Z-${dateCode}-${randSeed}`;

    shift.status = 'Closed';
    shift.closedAt = closingTime;
    shift.closedBy = req.user ? req.user._id : null;
    shift.totalInvoicesCount = totalInvoicesCount;
    shift.voidedInvoicesCount = voidedInvoicesCount;
    shift.grossSales = grossSales;
    shift.netSales = grossSales;
    shift.totalTax = totalTax;
    shift.totalDiscount = totalDiscount;
    shift.cashSales = cashSales;
    shift.cardSales = cardSales;
    shift.onlineSales = onlineSales;
    shift.expectedCashInDrawer = expectedCashInDrawer;
    shift.actualCashCounted = countedCash;
    shift.cashDiscrepancy = cashDiscrepancy;
    shift.closingNotes = closingNotes || '';
    shift.zReportNo = zReportNo;

    await shift.save();

    return res.status(200).json({
      success: true,
      message: `Cashier Shift ${shift.shiftNo} settled successfully. Generated Z-Report: ${zReportNo}`,
      data: shift
    });
  } catch (error) {
    console.error('[Close Shift Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error closing cashier shift',
      error: error.message
    });
  }
};

/**
 * GET All Shifts (History)
 */
const getAllShifts = async (req, res) => {
  try {
    const shifts = await CashierShift.find()
      .populate('cashier', 'name email role')
      .populate('closedBy', 'name email role')
      .sort({ openedAt: -1 });

    return res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts
    });
  } catch (error) {
    console.error('[Get All Shifts Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching shifts',
      error: error.message
    });
  }
};

/**
 * GET Specific Shift Z-Report with Invoices Breakdown
 */
const getShiftZReport = async (req, res) => {
  try {
    const shift = await CashierShift.findById(req.params.id)
      .populate('cashier', 'name email role')
      .populate('closedBy', 'name email role');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift record not found.'
      });
    }

    const invoices = await Invoice.find({
      $or: [
        { shiftId: shift._id },
        { createdAt: { $gte: shift.openedAt, ...(shift.closedAt ? { $lte: shift.closedAt } : {}) } }
      ]
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: {
        shift,
        invoicesSummary: {
          total: invoices.length,
          active: invoices.filter(i => !i.isVoided).length,
          voided: invoices.filter(i => i.isVoided).length,
          invoices: invoices.map(i => ({
            _id: i._id,
            invoiceNo: i.invoiceNo,
            customerName: i.customerName || 'Walk-in',
            finalTotal: i.finalTotal,
            paymentMethod: i.paymentMethod,
            paymentBreakdown: i.paymentBreakdown,
            isVoided: i.isVoided,
            voidReason: i.voidReason,
            createdAt: i.createdAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('[Get Z-Report Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error fetching Z-Report',
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
    const paymentMap = { Cash: { count: 0, revenue: 0 }, Card: { count: 0, revenue: 0 }, Split: { count: 0, revenue: 0 }, Online: { count: 0, revenue: 0 } };
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

    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    const dailySales = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

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
  exportInvoicesCSV,
  getCurrentShift,
  openShift,
  closeShift,
  getAllShifts,
  getShiftZReport
};
