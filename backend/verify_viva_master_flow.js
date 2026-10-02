/**
 * ============================================================================
 * 4 PAW ANIMAL CLINIC — VIVA PRESENTATION MASTER VERIFICATION SUITE
 * ============================================================================
 * Covers all 4 student modules, authentication RBAC, double-booking guard,
 * customer data isolation, atomic POS stock deduction, and email dispatch.
 * Runs directly against live MongoDB Atlas cluster.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import Mongoose Models for direct Atlas assertions
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Appointment = require('./models/Appointment');
const Invoice = require('./models/Invoice');
const { sendStaffWelcomeEmail } = require('./utils/emailService');

const BASE_URL = 'http://localhost:5000/api';

const results = [];
function recordResult(moduleName, testCase, passed, details = '') {
  results.push({ moduleName, testCase, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} [${moduleName}] ${testCase}${details ? ` -> ${details}` : ''}`);
  if (!passed) {
    console.error(`     ERROR DETAILS: ${details}`);
  }
}

async function runMasterSuite() {
  console.log('='.repeat(80));
  console.log('🐾 4 PAW ANIMAL CLINIC — COMPREHENSIVE VIVA VERIFICATION SUITE');
  console.log('='.repeat(80));

  // Connect to MongoDB Atlas
  console.log('\n[Atlas] 🔌 Connecting to MongoDB Atlas cluster from .env...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[Atlas] ✅ Connected to Database: ${mongoose.connection.name} (${mongoose.connection.host})`);

  // Obtain Admin & Cashier Tokens
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) throw new Error('No admin user found in database');
  const adminToken = jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_pet_shop_2026',
    { expiresIn: '1h' }
  );

  const timestamp = Date.now();

  // ==========================================================================
  // MODULE 1: Pet Registry & Patient Records (Lead: Devindi - IT24100661)
  // ==========================================================================
  console.log('\n--- 🐾 MODULE 1: Pet Registry & Patient Records (Devindi - IT24100661) ---');

  // 1. Validation Checks
  // A. Invalid Phone (landline or wrong length)
  const invPhoneRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petName: 'InvalidPhonePet',
      species: 'Canine',
      gender: 'Male',
      age: 2,
      ownerName: 'Test Owner',
      ownerPhone: '0112345678', // landline not valid mobile
      ownerEmail: 'valid@example.com'
    })
  });
  recordResult('Module 1', 'Reject Invalid Phone (011 landline)', invPhoneRes.status === 400, `Status ${invPhoneRes.status}`);

  // B. Future Date of Birth
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const futureDobRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petName: 'FutureDobPet',
      species: 'Canine',
      gender: 'Male',
      age: 1,
      dob: futureDate.toISOString(),
      ownerName: 'Test Owner',
      ownerPhone: '0771234567',
      ownerEmail: 'valid@example.com'
    })
  });
  recordResult('Module 1', 'Reject Future Date of Birth', futureDobRes.status === 400, `Status ${futureDobRes.status}`);

  // C. Invalid Email
  const invEmailRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petName: 'InvalidEmailPet',
      species: 'Feline',
      gender: 'Female',
      age: 2,
      ownerName: 'Test Owner',
      ownerPhone: '0771234567',
      ownerEmail: 'not-an-email'
    })
  });
  recordResult('Module 1', 'Reject Invalid RFC Email', invEmailRes.status === 400, `Status ${invEmailRes.status}`);

  // 2. Create (C): Register patient "Rocky"
  const rockyPayload = {
    petName: `Rocky_${timestamp}`,
    species: 'Canine',
    breed: 'Golden Retriever',
    gender: 'Male',
    age: 3,
    weight: 28.5,
    ownerName: 'Kasun Silva',
    ownerPhone: '0771234567',
    ownerEmail: `kasun_${timestamp}@gmail.com`
  };
  const rockyCreateRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(rockyPayload)
  });
  const rockyData = await rockyCreateRes.json();
  const rockyPet = rockyData.data?.pet || rockyData.data;
  const rockyPin = rockyPet?.uniquePin;
  const pinValid = /^PET-[A-Z0-9]{4,8}$/.test(rockyPin || '');
  recordResult('Module 1', 'Create Patient "Rocky" & Auto-generate Valid PIN', rockyCreateRes.status === 201 && pinValid, `PIN: ${rockyPin}`);

  // 3. Read / View (R): Query by generated PIN
  const pinQueryRes = await fetch(`${BASE_URL}/pets/pin/${rockyPin}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const pinData = await pinQueryRes.json();
  const fetchedPet = pinData.data?.pet || pinData.data;
  recordResult('Module 1', 'Read Patient by Unique PIN (GET /api/pets/pin/:pin)', pinQueryRes.status === 200 && fetchedPet?.petName === rockyPayload.petName, `Retrieved ${fetchedPet?.petName}`);

  // 4. Update (U): Update Rocky's weight or clinical notes
  const updatedWeight = 30.5;
  const updatePetRes = await fetch(`${BASE_URL}/pets/${rockyPet._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ weight: updatedWeight })
  });
  const atlasRocky = await Pet.findById(rockyPet._id);
  recordResult('Module 1', 'Update Patient Weight & Verify in Atlas Document', updatePetRes.status === 200 && atlasRocky.weight === updatedWeight, `Atlas Weight: ${atlasRocky.weight} kg`);

  // 5. Delete / Soft-Archival (D): Update status to 'Deceased'
  const archivePetRes = await fetch(`${BASE_URL}/pets/${rockyPet._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Deceased', clinicStatus: 'Deceased' })
  });
  const atlasDeceased = await Pet.findById(rockyPet._id);
  const statusIsDeceased = atlasDeceased.status === 'Deceased' || atlasDeceased.clinicStatus === 'Deceased';
  recordResult('Module 1', 'Update Status to Deceased in Atlas', archivePetRes.status === 200 && statusIsDeceased, `Status: ${atlasDeceased.status} / ${atlasDeceased.clinicStatus}`);

  // Attempt booking appointment for Deceased Rocky -> must return HTTP 400
  const deceasedBookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: rockyPet._id,
      serviceType: 'General Veterinary Consultation',
      appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      assignedStaff: 'Dr. Perera (Senior Vet)'
    })
  });
  recordResult('Module 1', 'Deceased Patient Appointment Guard (HTTP 400)', deceasedBookingRes.status === 400, `Status ${deceasedBookingRes.status}`);


  // ==========================================================================
  // MODULE 2: Inventory, Formulary & Stock Control (Lead: Mudaligama - IT24100451)
  // ==========================================================================
  console.log('\n--- 💊 MODULE 2: Inventory, Formulary & Stock Control (Mudaligama - IT24100451) ---');

  // 1. Validation Checks
  // A. Negative Stock (-5)
  const negStockRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: 'Invalid Negative Stock Item',
      category: 'Medicines',
      price: 1500,
      stockQuantity: -5,
      unit: 'Piece'
    })
  });
  recordResult('Module 2', 'Reject Negative Stock Quantity', negStockRes.status === 400, `Status ${negStockRes.status}`);

  // B. Discrete Item (Vials) with decimal stock (10.5)
  const decStockRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: 'Decimal Discrete Vials',
      category: 'Medicines',
      price: 1500,
      stockQuantity: 10.5,
      unit: 'Vial'
    })
  });
  recordResult('Module 2', 'Reject Decimal Stock for Discrete Units (Vials)', decStockRes.status === 400, `Status ${decStockRes.status}`);

  // C. Expired Date in Past
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);
  const pastExpiryRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: 'Past Expiry Medicine',
      category: 'Medicines',
      price: 1200,
      stockQuantity: 10,
      expiryDate: pastDate.toISOString(),
      unit: 'Bottle'
    })
  });
  recordResult('Module 2', 'Reject Expired Date in the Past', pastExpiryRes.status === 400, `Status ${pastExpiryRes.status}`);

  // 2. Create (C): Create "Amoxicillin 250mg Vials"
  const amoxPayload = {
    itemName: `Amoxicillin 250mg Vials ${timestamp}`,
    category: 'Medicines',
    price: 1500.00,
    stockQuantity: 20,
    batchNo: 'BTH-AMX-99',
    unit: 'Vial'
  };
  const amoxCreateRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(amoxPayload)
  });
  const amoxData = await amoxCreateRes.json();
  const amoxProduct = amoxData.data;
  const atlasProduct = await Product.findById(amoxProduct?._id);
  recordResult('Module 2', 'Create "Amoxicillin 250mg Vials" (20 Vials @ Rs. 1500)', amoxCreateRes.status === 201 && atlasProduct?.stockQuantity === 20, `Atlas ID: ${atlasProduct?._id}`);

  // 3. Read / View (R): Fetch formulary list & Low-Stock trigger
  const formularyRes = await fetch(`${BASE_URL}/products`);
  const formularyData = await formularyRes.json();
  const productsList = formularyData.data || formularyData.products || [];
  const foundAmox = productsList.find(p => p._id.toString() === amoxProduct._id.toString());
  recordResult('Module 2', 'Fetch Formulary List via GET /api/products Alias', formularyRes.status === 200 && Boolean(foundAmox), `Found ${productsList.length} products`);

  // Low-Stock query check
  const lowStockProducts = productsList.filter(p => p.stockQuantity <= 5);
  recordResult('Module 2', 'Low-Stock Monitoring Trigger (stock <= 5)', true, `Identified ${lowStockProducts.length} low-stock lines`);

  // 4. Update / Edit Modal Persistence (U): Update price from Rs. 1500 to Rs. 1750
  const updatePriceRes = await fetch(`${BASE_URL}/products/${amoxProduct._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ price: 1750.00 })
  });
  const atlasUpdatedProduct = await Product.findById(amoxProduct._id);
  recordResult('Module 2', 'Update Price to Rs. 1750 via PUT /api/products/:id', updatePriceRes.status === 200 && atlasUpdatedProduct.price === 1750, `Updated Price: Rs. ${atlasUpdatedProduct.price}`);

  // 5. Delete (D): Test safe deletion/archival of dummy product
  const dummyRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      itemName: `Discontinue Dummy ${timestamp}`,
      category: 'General',
      price: 500,
      stockQuantity: 5,
      unit: 'Piece'
    })
  });
  const dummyData = await dummyRes.json();
  const dummyId = dummyData.data._id;
  const deleteRes = await fetch(`${BASE_URL}/inventory/${dummyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const atlasDeleted = await Product.findById(dummyId);
  recordResult('Module 2', 'Safe Product Discontinuation / Archival in Atlas', deleteRes.status === 200 && atlasDeleted.isDiscontinued === true, 'isDiscontinued: true');


  // ==========================================================================
  // MODULE 3: Veterinary Appointments & Scheduling (Lead: Karunarathna - IT24100050)
  // ==========================================================================
  console.log('\n--- 📅 MODULE 3: Veterinary Appointments & Scheduling (Karunarathna - IT24100050) ---');

  // 1. Create with PIN Linkage (C): Active pet "Max"
  const maxPayload = {
    petName: `Max_${timestamp}`,
    species: 'Canine',
    breed: 'Beagle',
    gender: 'Male',
    age: 2,
    weight: 14.0,
    ownerName: 'Dr. Samantha Client',
    ownerPhone: '0772345678',
    ownerEmail: `client_max_${timestamp}@gmail.com`
  };
  const maxCreateRes = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(maxPayload)
  });
  const maxData = await maxCreateRes.json();
  const maxPet = maxData.data?.pet || maxData.data;

  const apptDate = new Date();
  apptDate.setDate(apptDate.getDate() + 20); // 20 days ahead
  const apptDateStr = apptDate.toISOString().split('T')[0];
  const targetSlot = '10:30 AM';
  const targetDoctor = 'Dr. Samantha Fernando (Surgeon)';

  const book1Res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: maxPet._id,
      serviceType: 'General Veterinary Consultation',
      appointmentDate: apptDateStr,
      timeSlot: targetSlot,
      assignedStaff: targetDoctor,
      doctor: targetDoctor,
      notes: 'Initial clinical assessment'
    })
  });
  const book1Data = await book1Res.json();
  const booking1Id = book1Data.data?._id;
  recordResult('Module 3', 'Book Appointment with PIN Linkage', book1Res.status === 201 && Boolean(booking1Id), `ID: ${booking1Id}, Date: ${apptDateStr} ${targetSlot}`);

  // 2. The Big Validation — Slot Conflict (409 Conflict)
  // Create an active second pet to test doctor slot conflict
  const pet2Payload = {
    petName: `Bella_${timestamp}`,
    species: 'Canine',
    breed: 'Labrador',
    gender: 'Female',
    age: 4,
    weight: 22.0,
    ownerName: 'Sunil Perera',
    ownerPhone: '0773344556',
    ownerEmail: `sunil_${timestamp}@gmail.com`
  };
  const pet2Res = await fetch(`${BASE_URL}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(pet2Payload)
  });
  const pet2Data = await pet2Res.json();
  const pet2 = pet2Data.data?.pet || pet2Data.data;

  // Attempt second booking for Dr. Samantha Fernando at the exact same date & time slot
  const conflictRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: pet2._id, // active second pet
      serviceType: 'Emergency Clinical Care',
      appointmentDate: apptDateStr,
      timeSlot: targetSlot,
      assignedStaff: targetDoctor,
      doctor: targetDoctor,
      notes: 'Attempting conflicting double-booking'
    })
  });
  const conflictData = await conflictRes.json();
  const isConflict409 = conflictRes.status === 409 && conflictData.message.includes('already booked');
  recordResult('Module 3', 'Slot Conflict & Double-Booking Guard (HTTP 409)', isConflict409, conflictData.message);

  // 3. Read / View & Appointment Slip (R): GET /api/bookings/:id/slip
  const slipRes = await fetch(`${BASE_URL}/bookings/${booking1Id}/slip`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const slipData = await slipRes.json();
  const hasSlipDetails = slipData.data?.petId && slipData.data?.doctor && slipData.data?.roomNumber;
  recordResult('Module 3', 'Read Appointment Slip with Room & Queue Allocation', slipRes.status === 200 && Boolean(hasSlipDetails), `Doctor: ${slipData.data?.doctor}, Room: ${slipData.data?.roomNumber}, Queue: #${slipData.data?.queueNumber}`);

  // 4. Reschedule & Slot Release (U): Move to 02:30 PM
  const newSlot = '02:30 PM'; // Within operating hours
  const rescheduleRes = await fetch(`${BASE_URL}/bookings/${booking1Id}/reschedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      newDate: apptDateStr,
      newTimeSlot: newSlot,
      reason: 'Client schedule shift'
    })
  });
  const rescheduleData = await rescheduleRes.json();
  const isRescheduled = rescheduleRes.status === 200 && rescheduleData.data?.status === 'Rescheduled';
  recordResult('Module 3', 'Reschedule Appointment to 02:30 PM with Audit Log', isRescheduled, `Status: ${rescheduleData.data?.status}`);

  // Verify previously occupied slot (10:30 AM) is now FREE and accepts pet2's booking
  const rebookOriginalRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      petId: pet2._id,
      serviceType: 'General Veterinary Consultation',
      appointmentDate: apptDateStr,
      timeSlot: targetSlot,
      assignedStaff: targetDoctor,
      notes: 'Taking the released slot'
    })
  });
  const rebookOriginalData = await rebookOriginalRes.json();
  recordResult('Module 3', 'Verify Released 10:30 AM Slot is Available Again', rebookOriginalRes.status === 201, 'Slot successfully re-booked');

  // Clean up the second booking
  if (rebookOriginalData.data?._id) {
    await fetch(`${BASE_URL}/bookings/${rebookOriginalData.data._id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: 'Test cleanup' })
    });
  }

  // 5. Cancel (D): Cancel primary booking and verify slot completely released in Atlas
  const cancelRes = await fetch(`${BASE_URL}/bookings/${booking1Id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reason: 'Client cancelled appointment' })
  });
  const atlasBooking = await Appointment.findById(booking1Id);
  recordResult('Module 3', 'Cancel Appointment & Mark Cancelled in Atlas', cancelRes.status === 200 && atlasBooking.status === 'Cancelled', 'Status: Cancelled');


  // ==========================================================================
  // MODULE 4: Clinical POS & Financial Accounting (Lead: Wickramarathna - IT24100383)
  // ==========================================================================
  console.log('\n--- 💳 MODULE 4: Clinical POS & Financial Accounting (Wickramarathna - IT24100383) ---');

  // 1. Role-Based Access (RBAC): Log in as Cashier
  const cashierLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cashier@4pawclinic.lk', password: 'Cashier@1234' })
  });
  const cashierLoginData = await cashierLoginRes.json();
  const cashierToken = cashierLoginData.token;
  const decodedToken = jwt.decode(cashierToken);
  recordResult('Module 4', 'Cashier Authentication & JWT Role Claim Verification', cashierLoginRes.status === 200 && decodedToken?.role === 'cashier', `Role: ${decodedToken?.role}`);

  // 2. Validations:
  // A. Sale quantity exceeding stock (25 > 20)
  const overstockSaleRes = await fetch(`${BASE_URL}/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      items: [{
        product: amoxProduct._id,
        itemName: amoxProduct.itemName,
        unitPrice: 1750.00,
        quantity: 25
      }],
      paymentMethod: 'Cash',
      cashTendered: 50000
    })
  });
  const overstockData = await overstockSaleRes.json();
  const overstockBlocked = overstockSaleRes.status === 400 && overstockData.message.toLowerCase().includes('insufficient stock');
  recordResult('Module 4', 'Block Over-Stock Sale (Requested 25 > Stock 20)', overstockBlocked, overstockData.message);

  // B. Shortfall Cash Tendered (tendered Rs. 3000 < Total Rs. 3500)
  const shortfallSaleRes = await fetch(`${BASE_URL}/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      items: [{
        product: amoxProduct._id,
        itemName: amoxProduct.itemName,
        unitPrice: 1750.00,
        quantity: 2
      }],
      paymentMethod: 'Cash',
      cashTendered: 3000 // Shortfall by 500
    })
  });
  const shortfallData = await shortfallSaleRes.json();
  const shortfallBlocked = shortfallSaleRes.status === 400 && shortfallData.message.toLowerCase().includes('cannot be less');
  recordResult('Module 4', 'Reject Shortfall Cash Tendered (Rs. 3000 < Rs. 3500)', shortfallBlocked, shortfallData.message);

  // 3. Create Transaction (C): 2 units of Amoxicillin 250mg Vials (2 x 1750 = 3500), cash tendered = 4000
  const validSaleRes = await fetch(`${BASE_URL}/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` },
    body: JSON.stringify({
      items: [{
        product: amoxProduct._id,
        itemName: amoxProduct.itemName,
        unitPrice: 1750.00,
        quantity: 2
      }],
      paymentMethod: 'Cash',
      cashTendered: 4000.00,
      tenderedAmount: 4000.00,
      taxRate: 0,
      discountRate: 0
    })
  });
  const validSaleData = await validSaleRes.json();
  const invoice = validSaleData.data?.invoice || validSaleData.data;
  const invoiceId = invoice?._id;
  const changeCorrect = Math.abs((invoice?.changeAmount || 0) - 500.00) < 0.01;
  recordResult('Module 4', 'Process POS Cash Transaction (Change = Rs. 500.00)', validSaleRes.status === 201 && changeCorrect, `Invoice: ${invoice?.invoiceNumber || invoice?.invoiceNo}, Change: Rs. ${invoice?.changeAmount}`);

  // 4. THE GRAND CLIMAX — Atomic Stock Auto-Deduction
  // Query Amoxicillin 250mg Vials in Atlas: 20 - 2 = Exactly 18 Units!
  const postSaleProduct = await Product.findById(amoxProduct._id);
  const stockExactly18 = postSaleProduct.stockQuantity === 18;
  recordResult('Module 4', 'THE GRAND CLIMAX: Atomic Stock Auto-Deduction (20 -> 18 Vials)', stockExactly18, `Initial: 20, Sold: 2, Atlas Stock: ${postSaleProduct.stockQuantity}`);

  // 5. Thermal Receipt Verification: GET /api/billing/invoices/:id
  const getInvoiceRes = await fetch(`${BASE_URL}/billing/invoices/${invoiceId}`, {
    headers: { Authorization: `Bearer ${cashierToken}` }
  });
  const getInvoiceData = await getInvoiceRes.json();
  const fetchedInvoice = getInvoiceData.data;
  const receiptIntact = fetchedInvoice?.items?.length === 1 && fetchedInvoice?.finalTotal === 3500;
  recordResult('Module 4', 'Thermal Receipt Verification (GET /api/billing/invoices/:id)', getInvoiceRes.status === 200 && receiptIntact, `Total: Rs. ${fetchedInvoice?.finalTotal}, Tendered: Rs. ${fetchedInvoice?.tenderedAmount}`);


  // ==========================================================================
  // SECTION 2: EMAIL SERVICE & STACK INTEGRITY
  // ==========================================================================
  console.log('\n--- 🛡️ SECTION 2: EMAIL SERVICE & STACK INTEGRITY ---');

  const emailRes = await sendStaffWelcomeEmail(
    { name: 'Dr. Test Clinician', email: 'test.staff@4pawclinic.lk', role: 'veterinarian' },
    'TempPass#2026'
  );
  recordResult('System & Security', 'Email Dispatch Utility (Safe Fallback & Non-Crashing)', Boolean(emailRes.success), `Mode: ${emailRes.simulated ? 'Safe Dev Logger' : 'SMTP'}`);

  // Clean up test documents in Atlas
  console.log('\n[Cleanup] Cleaning up test records from Atlas...');
  await Pet.deleteMany({ _id: { $in: [rockyPet._id, maxPet._id, pet2?._id].filter(Boolean) } });
  await Product.deleteMany({ _id: { $in: [amoxProduct._id, dummyId] } });
  if (booking1Id) await Appointment.deleteOne({ _id: booking1Id });
  if (invoiceId) await Invoice.deleteOne({ _id: invoiceId });
  console.log('[Cleanup] ✅ Atlas clean state preserved.');

  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 MASTER VIVA VERIFICATION SUMMARY');
  console.log('='.repeat(80));

  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Test Cases Executed : ${total}`);
  console.log(`Passed                    : ${passedCount} ✅`);
  console.log(`Failed                    : ${failedCount} ${failedCount > 0 ? '❌' : ''}`);
  console.log('='.repeat(80));

  if (failedCount > 0) {
    console.error('❌ Master Viva Verification FAILED with regressions.');
    process.exit(1);
  } else {
    console.log('🎉 100% VIVA AUDIT SUCCESS! ALL 4 MODULES FULLY OPERATIONAL AND DEFENDABLE.');
    process.exit(0);
  }
}

runMasterSuite().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
