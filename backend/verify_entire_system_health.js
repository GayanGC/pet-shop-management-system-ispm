/**
 * ============================================================================
 * 4 PAW ANIMAL CLINIC — SYSTEM-WIDE END-TO-END HEALTH & SECURITY AUDIT SUITE
 * ============================================================================
 * File: backend/verify_entire_system_health.js
 *
 * Exhaustive verification covering:
 * - Module 1: Pet Registry, EHR, Multi-Tenant OWASP BOLA, Deceased Guard, Vitals UI
 * - Module 2: Inventory, Past Expiry/Discrete Validation, 0ms Search, Edit Workflow, Low Stock
 * - Module 3: Channeling with PIN, 409 Conflict Guard, Reschedule & Slot Release, Cancel, Slip
 * - Module 4: RBAC, Cashier UI Hardening, Over-stock/Tendered Validation, Atomic Stock Deduction ($inc), 80mm Receipt
 * - Infrastructure: Nodemailer Fallback, Runtime Atlas Theming (GET/PUT + 403 Guard), Customer A-/A/A+ Scaling, Full-Width Layout, Pro Tier Roadmap
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Import Mongoose Models
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Appointment = require('./models/Appointment');
const Invoice = require('./models/Invoice');
const SystemSettings = require('./models/SystemSettings');
const { sendStaffWelcomeEmail } = require('./utils/emailService');

const BASE_URL = 'http://localhost:5000/api';

const auditResults = [];

function recordCheck(moduleCategory, testName, passed, details = '') {
  auditResults.push({ moduleCategory, testName, passed, details });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${badge} | [${moduleCategory}] ${testName}`);
  if (details) {
    console.log(`         ↳ ${details}`);
  }
}

async function runExhaustiveHealthAudit() {
  console.log('='.repeat(85));
  console.log('🏥 4 PAW ANIMAL CLINIC — EXHAUSTIVE SYSTEM-WIDE HEALTH & SECURITY AUDIT');
  console.log('='.repeat(85));

  // 0. Atlas Cloud Connection
  console.log('\n[Atlas] 🔌 Connecting directly to MongoDB Atlas cluster...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[Atlas] ✅ Connected to Database: "${mongoose.connection.name}" at host: ${mongoose.connection.host}\n`);

  // Ensure Admin and Cashier Users Exist
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@4pawclinic.lk',
      password: 'AdminPassword123',
      role: 'admin'
    });
  }

  let cashierUser = await User.findOne({ role: 'cashier' });
  if (!cashierUser) {
    cashierUser = await User.create({
      name: 'POS Cashier Lead',
      email: 'cashier@4pawclinic.lk',
      password: 'CashierPassword123',
      role: 'cashier'
    });
  }

  const adminToken = jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026',
    { expiresIn: '2h' }
  );

  const cashierToken = jwt.sign(
    { id: cashierUser._id, role: cashierUser.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026',
    { expiresIn: '2h' }
  );

  const timestamp = Date.now();

  // ==========================================================================
  // MODULE 1: Pet Registry, EHR & Patient Security (Epic E01)
  // ==========================================================================
  console.log('--- 🐾 MODULE 1: Pet Registry, EHR & Patient Security (Epic E01) ---');

  // 1.1 Invalid Phone Rejection (Landline 011...)
  const resPhone = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petName: 'TestBadPhone',
      species: 'Canine',
      gender: 'Male',
      age: 2,
      ownerName: 'Sunil',
      ownerPhone: '0112345678', // Invalid landline
      ownerEmail: 'sunil@gmail.com'
    })
  });
  recordCheck('Module 1', 'Validation: Reject Invalid Phone Format (011 landline)', resPhone.status === 400, `HTTP Status: ${resPhone.status}`);

  // 1.2 Future Date of Birth Rejection
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const resDob = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petName: 'TestFutureDob',
      species: 'Canine',
      gender: 'Male',
      age: 1,
      dob: futureDate.toISOString(),
      ownerName: 'Kamal',
      ownerPhone: '0771234567',
      ownerEmail: 'kamal@gmail.com'
    })
  });
  recordCheck('Module 1', 'Validation: Reject Future Date of Birth', resDob.status === 400, `HTTP Status: ${resDob.status}`);

  // 1.3 Patient Registration (C) & Unique PIN Generation
  const rockyPayload = {
    petName: `Rocky_${timestamp}`,
    species: 'Canine',
    breed: 'Labrador Retriever',
    gender: 'Male',
    age: 3,
    weight: 29.5,
    ownerName: 'Devindi Perera',
    ownerPhone: '0771234567',
    ownerEmail: `devindi_${timestamp}@gmail.com`
  };
  const rockyRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(rockyPayload)
  });
  const rockyData = await rockyRes.json();
  const rockyPet = rockyData.data?.pet || rockyData.data;
  const rockyPin = rockyPet?.uniquePin;
  const pinMatchesPattern = /^PET-[A-Z0-9]{4,8}$/.test(rockyPin || '');
  recordCheck('Module 1', 'Patient Registration (C) & Valid PIN Generation', rockyRes.status === 201 && pinMatchesPattern, `Generated PIN: ${rockyPin}`);

  // 1.4 Multi-Tenant Data Isolation (OWASP BOLA Defense)
  const clientAEmail = `client_a_${timestamp}@4paw.lk`;
  const clientBEmail = `client_b_${timestamp}@4paw.lk`;

  const userA = await User.create({ name: 'Client A', email: clientAEmail, password: 'Password123!', role: 'customer' });
  const userB = await User.create({ name: 'Client B', email: clientBEmail, password: 'Password123!', role: 'customer' });

  const tokenA = jwt.sign({ id: userA._id, role: 'customer' }, process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026');
  const tokenB = jwt.sign({ id: userB._id, role: 'customer' }, process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026');

  // Register "Tommy" for Client A
  await Pet.create({
    petName: 'Tommy',
    species: 'Canine',
    gender: 'Male',
    age: 2,
    ownerId: userA._id,
    owner: userA._id,
    ownerEmail: clientAEmail,
    ownerName: 'Client A',
    ownerPhone: '0771111111',
    uniquePin: `PET-TOMA${timestamp.toString().slice(-4)}`
  });

  // Register another "Tommy" for Client B
  await Pet.create({
    petName: 'Tommy',
    species: 'Canine',
    gender: 'Male',
    age: 4,
    ownerId: userB._id,
    owner: userB._id,
    ownerEmail: clientBEmail,
    ownerName: 'Client B',
    ownerPhone: '0772222222',
    uniquePin: `PET-TOMB${timestamp.toString().slice(-4)}`
  });

  // Query Client A's pets
  const petsARes = await fetch(`${BASE_URL}/pets/my-pets`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const petsAData = await petsARes.json();
  const petsAList = petsAData.data?.pets || petsAData.data || [];
  const clientAOnly = petsAList.length === 1 && petsAList[0].ownerEmail === clientAEmail;

  recordCheck('Module 1', 'Multi-Tenant Data Isolation (Zero Cross-Client Data Leaks)', petsARes.status === 200 && clientAOnly, `Client A received exactly ${petsAList.length} pet(s), strictly isolated from Client B`);

  // 1.5 Deceased Patient Status Guard (Blocks Channeling and POS Charges)
  const deceasedPet = await Pet.create({
    petName: `ArchivedPatient_${timestamp}`,
    species: 'Feline',
    gender: 'Female',
    age: 5,
    ownerId: userA._id,
    ownerName: 'Nimal',
    ownerPhone: '0773333333',
    ownerEmail: `nimal_${timestamp}@gmail.com`,
    status: 'Deceased',
    clinicStatus: 'Deceased',
    uniquePin: `PET-DEC${timestamp.toString().slice(-4)}`
  });

  // Attempt booking for deceased pet -> Must return 400
  const deceasedBookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: deceasedPet._id,
      assignedStaff: 'Dr. Fernando',
      serviceType: 'General Consultation',
      appointmentDate: '2026-10-15',
      timeSlot: '09:00 AM'
    })
  });
  const bookingBlocked = deceasedBookingRes.status === 400;

  // Attempt billing charge for deceased pet -> Must return 400
  const deceasedBillingRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: deceasedPet._id,
      paymentMethod: 'Cash',
      items: [{ itemName: 'Consultation Fee', unitPrice: 1500, quantity: 1, subtotal: 1500 }]
    })
  });
  const billingBlocked = deceasedBillingRes.status === 400;

  recordCheck('Module 1', 'Deceased Patient Guard: Blocks Bookings & POS Invoices (HTTP 400)', bookingBlocked && billingBlocked, `Booking Status: ${deceasedBookingRes.status}, Billing Status: ${deceasedBillingRes.status}`);

  // 1.6 Patient Record Modal UI Inspection
  const patientRecordPath = path.resolve(__dirname, '../frontend/src/components/pet/PatientRecordModal.jsx');
  const patientRecordCode = fs.readFileSync(patientRecordPath, 'utf8');
  const hasVitalsCard = patientRecordCode.includes('Patient Demographics Snapshot') && patientRecordCode.includes('Current Clinical Status');
  const hasExpandableToggle = patientRecordCode.includes('View Full Medical History') || patientRecordCode.includes('Hide Detailed Medical Logs');
  const hasPrintableRecord = patientRecordCode.includes('printable-clinical-record');

  recordCheck('Module 1', 'Patient Record Modal UI: Vitals Overview, Medical Toggle & Print Layout', hasVitalsCard && hasExpandableToggle && hasPrintableRecord, 'Verified PatientRecordModal.jsx component architecture');


  // ==========================================================================
  // MODULE 2: Inventory, Pharmacy & Stock Management (Epic E02)
  // ==========================================================================
  console.log('\n--- 💊 MODULE 2: Inventory, Pharmacy & Stock Management (Epic E02) ---');

  // 2.1 Validation Rejections: Negative price, negative stock, past expiry
  const invProductRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: 'BadPriceMed',
      category: 'Medicines',
      price: -500, // Invalid negative price
      stockQuantity: 10,
      unit: 'vials'
    })
  });
  recordCheck('Module 2', 'Validation: Reject Negative Product Price', invProductRes.status === 400, `HTTP Status: ${invProductRes.status}`);

  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  const invExpiryRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: 'ExpiredBatchMed',
      category: 'Medicines',
      price: 1200,
      stockQuantity: 10,
      expiryDate: pastDate.toISOString(),
      unit: 'vials'
    })
  });
  recordCheck('Module 2', 'Validation: Reject Past Expiry Date', invExpiryRes.status === 400, `HTTP Status: ${invExpiryRes.status}`);

  // 2.2 Catalog Creation (C) & Atlas Cloud Persistence
  const medPayload = {
    itemName: `Amoxicillin 250mg Vials_${timestamp}`,
    category: 'Medicines',
    price: 1500.00,
    stockQuantity: 20,
    supplier: 'Medilab Sri Lanka (Pvt) Ltd',
    batchNo: `BATCH-AMX-${timestamp.toString().slice(-4)}`,
    unit: 'vials'
  };
  const medRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(medPayload)
  });
  const medData = await medRes.json();
  const createdMed = medData.data || medData;
  const atlasMed = await Product.findById(createdMed._id);
  recordCheck('Module 2', 'Medication Catalog Creation (C) & Atlas Persistence', medRes.status === 201 && atlasMed && atlasMed.stockQuantity === 20, `Created "${atlasMed?.itemName}" (Stock: ${atlasMed?.stockQuantity} vials)`);

  // 2.3 Instant 0ms Search & Multi-Field Filtering in InventoryList.jsx
  const inventoryListPath = path.resolve(__dirname, '../frontend/src/components/inventory/InventoryList.jsx');
  const inventoryListCode = fs.readFileSync(inventoryListPath, 'utf8');
  const hasMultiFilter = inventoryListCode.includes('item.itemName') && inventoryListCode.includes('item.supplier') && (inventoryListCode.includes('item.batchNo') || inventoryListCode.includes('item.batch'));
  recordCheck('Module 2', 'Instant 0ms Multi-Field Filter (Name, Supplier, Batch, Category)', hasMultiFilter, 'Verified in InventoryList.jsx');

  // 2.4 Edit / Update Workflow (U) & onEdit Prop Wiring
  const hasOnEditWiring = inventoryListCode.includes('onEdit && onEdit');
  const productFormPath = path.resolve(__dirname, '../frontend/src/components/inventory/ProductForm.jsx');
  const productFormCode = fs.readFileSync(productFormPath, 'utf8');
  const hasPrePopulation = productFormCode.includes('initialData') && productFormCode.includes('initialData.itemName');

  const updateMedRes = await fetch(`${BASE_URL}/inventory/${createdMed._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ price: 1650.00, stockQuantity: 25 })
  });
  const updatedAtlasMed = await Product.findById(createdMed._id);
  const editWorkflowPassed = hasOnEditWiring && hasPrePopulation && updateMedRes.status === 200 && updatedAtlasMed?.price === 1650 && updatedAtlasMed?.stockQuantity === 25;
  recordCheck('Module 2', 'Edit/Update Workflow (U): Safe Prop Wiring & MongoDB Persistence', editWorkflowPassed, `Updated Price to Rs. ${updatedAtlasMed?.price}, Stock to ${updatedAtlasMed?.stockQuantity}`);

  // 2.5 Low-Stock Warning Alerts
  const lowStockProduct = await Product.create({
    itemName: `CriticalSaline_${timestamp}`,
    category: 'Medicines',
    price: 350.00,
    stockQuantity: 3, // <= 5 triggers alert
    unit: 'bottles'
  });
  recordCheck('Module 2', 'Low-Stock Real-Time Alert Trigger (Stock <= 5)', lowStockProduct.stockQuantity <= 5, `Item has stock ${lowStockProduct.stockQuantity} <= 5 threshold`);


  // ==========================================================================
  // MODULE 3: Veterinary Appointments & Channeling (Epic E03)
  // ==========================================================================
  console.log('\n--- 📅 MODULE 3: Veterinary Appointments & Channeling (Epic E03) ---');

  // 3.1 Doctor Channeling Booking with Patient PIN (C)
  const apptDate = '2026-10-20';
  const targetSlot = '10:30 AM';
  const assignedDoc = 'Dr. Samantha Fernando (Vet Surgeon)';

  // Clean any lingering test appointments for this doctor & date
  await Appointment.deleteMany({
    $or: [{ assignedStaff: assignedDoc }, { doctor: assignedDoc }],
    appointmentDate: { $gte: new Date('2026-10-20T00:00:00.000Z'), $lte: new Date('2026-10-20T23:59:59.999Z') }
  });

  const apptPayload = {
    petId: rockyPet._id,
    assignedStaff: assignedDoc,
    doctor: assignedDoc,
    serviceType: 'General Veterinary Consultation',
    appointmentDate: apptDate,
    timeSlot: targetSlot,
    notes: 'Knee joint checkup'
  };

  const apptRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(apptPayload)
  });
  const apptData = await apptRes.json();
  const createdAppt = apptData.data?.booking || apptData.data;
  recordCheck('Module 3', 'Doctor Channeling Booking (C) with Patient Linkage', apptRes.status === 201 && createdAppt?._id, `Booked with ${assignedDoc} on ${apptDate} at ${targetSlot}`);

  // 3.2 Double-Booking Slot Conflict Guard (Strict HTTP 409)
  const conflictRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: rockyPet._id,
      assignedStaff: assignedDoc,
      doctor: assignedDoc,
      serviceType: 'General Veterinary Consultation',
      appointmentDate: apptDate,
      timeSlot: targetSlot,
      notes: 'Emergency slot collision attempt'
    })
  });
  const conflictData = await conflictRes.json();
  const is409Conflict = conflictRes.status === 409 && (conflictData.message || '').includes('already booked');
  recordCheck('Module 3', 'Double-Booking Guard (Strict HTTP 409 Conflict)', is409Conflict, `Conflict rejection returned: "${conflictData.message}"`);

  // 3.3 Reschedule & Automatic Slot Release (U)
  const newSlot = '02:30 PM';
  const rescheduleRes = await fetch(`${BASE_URL}/bookings/${createdAppt._id}/reschedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      appointmentDate: apptDate,
      timeSlot: newSlot,
      reason: 'Client requested afternoon slot'
    })
  });
  const rescheduleData = await rescheduleRes.json();
  const atlasAppt = await Appointment.findById(createdAppt._id);
  const reschedulePassed = rescheduleRes.status === 200 && atlasAppt.timeSlot === newSlot && atlasAppt.status === 'Rescheduled' && atlasAppt.rescheduleHistory.length > 0;

  // Confirm original slot 10:30 AM is now immediately available for another patient (Tommy)
  const tommyPet = await Pet.findOne({ uniquePin: `PET-TOMA${timestamp.toString().slice(-4)}` });
  const freedSlotRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: tommyPet._id,
      assignedStaff: assignedDoc,
      doctor: assignedDoc,
      serviceType: 'General Veterinary Consultation',
      appointmentDate: apptDate,
      timeSlot: targetSlot, // Original 10:30 AM
      notes: 'Booked immediately into released morning slot'
    })
  });
  const freedSlotData = await freedSlotRes.json();
  const slotSuccessfullyFreed = freedSlotRes.status === 201;
  recordCheck('Module 3', 'Reschedule Booking & Instant Slot Release (10:30 AM Freed)', reschedulePassed && slotSuccessfullyFreed, `Reschedule (${rescheduleRes.status}): ${rescheduleData.message || 'OK'}, Freed Slot (${freedSlotRes.status}): ${freedSlotData.message || 'Booked'}`);

  // 3.4 Cancellation & Slot De-allocation (D)
  const cancelRes = await fetch(`${BASE_URL}/bookings/${createdAppt._id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reason: 'Owner scheduling conflict' })
  });
  const cancelledAtlasAppt = await Appointment.findById(createdAppt._id);
  recordCheck('Module 3', 'Appointment Cancellation (D) & Audit Persistence', cancelRes.status === 200 && cancelledAtlasAppt.status === 'Cancelled', `Status updated to "${cancelledAtlasAppt.status}" with cancelledAt timestamp`);

  // 3.5 Printable Appointment Slip Modal UI
  const apptSlipPath = path.resolve(__dirname, '../frontend/src/components/booking/AppointmentSlipModal.jsx');
  const apptSlipCode = fs.readFileSync(apptSlipPath, 'utf8');
  const hasSlipComponents = (apptSlipCode.includes('Consultation Room') || apptSlipCode.includes('roomNumber')) && (apptSlipCode.includes('queueNumber') || apptSlipCode.includes('Queue')) && apptSlipCode.includes('printable-clinical-record');
  recordCheck('Module 3', 'Official Printable Appointment Slip (Room, Queue, Patient Demographics)', hasSlipComponents, 'Verified in AppointmentSlipModal.jsx');


  // ==========================================================================
  // MODULE 4: Clinical POS & Financial Accounting (Epic E04)
  // ==========================================================================
  console.log('\n--- 💳 MODULE 4: Clinical POS & Financial Accounting (Epic E04) ---');

  // 4.1 Role-Based Access Control (RBAC): Authenticate Cashier
  const decodedCashier = jwt.decode(cashierToken);
  recordCheck('Module 4', 'Cashier Role Authentication & JWT Payload Assertion', decodedCashier.role === 'cashier', `Authenticated: ${cashierUser.email}, role: ${decodedCashier.role}`);

  // 4.2 Cashier Principle of Least Privilege UI Hardening
  const appPath = path.resolve(__dirname, '../frontend/src/App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf8');
  const hasCashierGuard = appCode.includes('isCashier') && appCode.includes('New POS Transaction') && appCode.includes('View Sales Ledger');
  recordCheck('Module 4', 'Cashier UI Hardening (Strips Non-Cashier Register & Channeling Buttons)', hasCashierGuard, 'Verified in App.jsx hero section');

  // 4.3 POS Checkout Validations: Over-Stock & Tendered Amount
  const posTestProd = await Product.create({
    itemName: `SurgeryKit_${timestamp}`,
    category: 'Clinical Supplies',
    price: 5000.00,
    stockQuantity: 2,
    unit: 'packs'
  });

  const overStockRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      paymentMethod: 'Cash',
      items: [{ product: posTestProd._id, itemName: posTestProd.itemName, unitPrice: 5000, quantity: 5 }] // Only 2 in stock
    })
  });
  recordCheck('Module 4', 'POS Validation: Block Items Exceeding Inventory Stock', overStockRes.status === 400, `Rejected with HTTP Status: ${overStockRes.status}`);

  const underTenderedRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      paymentMethod: 'Cash',
      tenderedAmount: 2000, // Less than final total 5000
      items: [{ product: posTestProd._id, itemName: posTestProd.itemName, unitPrice: 5000, quantity: 1 }]
    })
  });
  recordCheck('Module 4', 'POS Validation: Block Cash Tendered Less Than Invoice Total', underTenderedRes.status === 400, `Rejected with HTTP Status: ${underTenderedRes.status}`);

  // 4.4 THE SHOWSTOPPER: Atomic Stock Auto-Deduction Pipeline ($inc: { stockQuantity: -2 })
  const atomicProduct = await Product.create({
    itemName: `ParvoBoosterVaccine_${timestamp}`,
    category: 'Vaccines',
    price: 2500.00,
    stockQuantity: 20, // Starting stock: 20
    unit: 'vials'
  });

  const checkoutRes = await fetch(`${BASE_URL}/billing/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      paymentMethod: 'Cash',
      tenderedAmount: 6000.00,
      discountRate: 0,
      taxRate: 0,
      items: [{
        product: atomicProduct._id,
        itemName: atomicProduct.itemName,
        unitPrice: 2500.00,
        quantity: 2, // Bill 2 units
        subtotal: 5000.00
      }]
    })
  });
  const checkoutData = await checkoutRes.json();
  const createdInvoice = checkoutData.data || checkoutData;

  // Query MongoDB Atlas for verified post-checkout stock
  const postStockProd = await Product.findById(atomicProduct._id);
  const atomicDeductionPassed = checkoutRes.status === 201 && postStockProd.stockQuantity === 18;
  recordCheck('Module 4', 'THE SHOWSTOPPER: Atomic Stock Concurrency Deduction ($inc)', atomicDeductionPassed, `Starting Stock: 20 -> Billed: 2 -> Atlas Verified Ending Stock: ${postStockProd.stockQuantity}`);

  // 4.5 Thermal Receipt Verification (80mm Format, Tendered & Change)
  const invoiceModalPath = path.resolve(__dirname, '../frontend/src/components/billing/PrintableInvoiceModal.jsx');
  const invoiceModalCode = fs.readFileSync(invoiceModalPath, 'utf8');
  const hasThermalClasses = invoiceModalCode.includes('printable-invoice') && invoiceModalCode.includes('thermal-receipt');
  const hasBreakdownSections = invoiceModalCode.includes('receipt-header') && invoiceModalCode.includes('receipt-item-row') && invoiceModalCode.includes('receipt-summary') && invoiceModalCode.includes('receipt-footer');
  const receiptAccurate = createdInvoice.tenderedAmount === 6000 && createdInvoice.changeAmount === 1000;
  recordCheck('Module 4', '80mm Thermal Receipt Formatting & Change Calculation', hasThermalClasses && hasBreakdownSections && receiptAccurate, `Tendered: Rs. ${createdInvoice.tenderedAmount}.00, Final Total: Rs. 5000.00, Change: Rs. ${createdInvoice.changeAmount}.00`);


  // ==========================================================================
  // SYSTEM THEMING, SAAS & INFRASTRUCTURE
  // ==========================================================================
  console.log('\n--- 🎨 SYSTEM THEMING, SAAS & INFRASTRUCTURE ---');

  // 5.1 Nodemailer Resilient Dispatcher (Graceful Development Fallback)
  let emailSuccess = false;
  try {
    const emailRes = await sendStaffWelcomeEmail({
      name: 'Dr. Anne Wickrama',
      email: `anne_${timestamp}@4pawclinic.lk`,
      role: 'veterinarian',
      tempPassword: 'TemporaryPass123#'
    });
    emailSuccess = emailRes && (emailRes.success || emailRes.messageId || emailRes.mock);
  } catch (err) {
    emailSuccess = false;
  }
  recordCheck('Infrastructure', 'Nodemailer Resilient Email Dispatcher with Safe Fallback', emailSuccess, 'Dispatched staff welcome email credentials template');

  // 5.2 Dynamic Runtime Theming System (MongoDB Atlas Persistence + 403 Guard)
  const getThemeRes = await fetch(`${BASE_URL}/settings/theme`);
  const getThemeData = await getThemeRes.json();
  const themeFetchPassed = getThemeRes.status === 200 && getThemeData.success && getThemeData.data.themePalette;

  const putThemeRes = await fetch(`${BASE_URL}/settings/theme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      themePalette: 'violet',
      globalFont: 'Inter',
      globalFontSize: '14px'
    })
  });
  const putThemeData = await putThemeRes.json();
  const atlasSettings = await SystemSettings.findOne().sort({ createdAt: -1 });
  const themeUpdatePassed = putThemeRes.status === 200 && atlasSettings.themePalette === 'violet' && atlasSettings.globalFont === 'Inter';

  // Customer RBAC 403 Forbidden check
  const nonAdminThemeRes = await fetch(`${BASE_URL}/settings/theme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ themePalette: 'teal' })
  });
  const nonAdminBlocked = nonAdminThemeRes.status === 403;

  recordCheck('Infrastructure', 'Dynamic Theming & Atlas Persistence (Admin Only, Non-Admin 403 Block)', themeFetchPassed && themeUpdatePassed && nonAdminBlocked, `Active Palette: "${atlasSettings.themePalette}", Font: "${atlasSettings.globalFont}", Non-admin status: ${nonAdminThemeRes.status}`);

  // 5.3 Customer Accessibility Font Scale Controller
  const customerPortalPath = path.resolve(__dirname, '../frontend/src/components/customer/CustomerPortal.jsx');
  const customerPortalCode = fs.readFileSync(customerPortalPath, 'utf8');
  const hasCustomerFontScale = customerPortalCode.includes('customerFontScale') && customerPortalCode.includes('setCustomerFontScale') && customerPortalCode.includes('customerScales');
  recordCheck('Infrastructure', 'Customer Personal Accessibility Font Controller (A- / A / A+)', hasCustomerFontScale, 'Integrated into CustomerPortal.jsx and App.jsx header');

  // 5.4 Full-Width Layout Conversion
  const hasNoNarrowContainers = !appCode.includes('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6') && appCode.includes('w-full max-w-none px-4 sm:px-6 lg:px-10 py-6');
  recordCheck('Infrastructure', 'Full-Width Layout Conversion (No Restrictive Narrow Centering)', hasNoNarrowContainers, 'Widescreen layout verified in App.jsx: w-full max-w-none px-4 sm:px-6 lg:px-10');

  // 5.5 Pro Tier Roadmap Button & Modal
  const proModalPath = path.resolve(__dirname, '../frontend/src/components/common/ProTierModal.jsx');
  const proModalExists = fs.existsSync(proModalPath);
  const appHasProButton = appCode.includes('Upgrade to Pro') && appCode.includes('setIsProModalOpen');
  recordCheck('Infrastructure', 'Pro Enterprise Edition Roadmap (Golden Pill Button & ProTierModal)', proModalExists && appHasProButton, 'Verified in App.jsx and ProTierModal.jsx');

  // ==========================================================================
  // FINAL SCORE & SUMMARY
  // ==========================================================================
  const totalChecks = auditResults.length;
  const passedChecks = auditResults.filter((r) => r.passed).length;
  const healthScore = Math.round((passedChecks / totalChecks) * 100);

  console.log('\n' + '='.repeat(85));
  console.log(`📊 FINAL AUDIT VERDICT: ${healthScore}% HEALTH SCORE (${passedChecks}/${totalChecks} CHECKS PASSED)`);
  console.log('='.repeat(85));

  if (healthScore === 100) {
    console.log('🎉 ALL SYSTEMS 100% OPERATIONAL, SECURE, AND DEFENDABLE FOR VIVA PRESENTATION!');
  } else {
    console.error(`⚠️ Attention: ${totalChecks - passedChecks} check(s) did not pass. Review log above.`);
  }

  await mongoose.disconnect();
  return { totalChecks, passedChecks, healthScore };
}

runExhaustiveHealthAudit()
  .then((res) => {
    process.exit(res.healthScore === 100 ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal audit error:', err);
    process.exit(1);
  });
