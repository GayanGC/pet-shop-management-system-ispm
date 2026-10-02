/**
 * ============================================================================
 * EXHAUSTIVE END-TO-END VALIDATION AUDIT SUITE
 * "4 Paw Animal Clinic" - ISPM Final Sprint QA Automation
 * ============================================================================
 * Tests all boundary conditions, regexes, negative quantities, over-stock carts,
 * past appointments, duplicate pins, operating hours, and Sri Lankan phone validations
 * against live MongoDB Atlas endpoints.
 * 
 * Group Members & Modules:
 * - Module 1: IT24100661 - Devindi S.H.A.A.P. (Pet Registry & Patient Records)
 * - Module 2: IT24100451 - Mudaligama K.H.C. (Inventory & Pharmacy Formulary)
 * - Module 3: IT24100050 - Karunarathna P.M.N.S. (Appointments & Clinical Scheduling)
 * - Module 4: IT24100383 - Wickramarathna W.M.G.C. (Clinical POS & Financials)
 * ============================================================================
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

function apiRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = { raw: rawData };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

// Global test counters
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

function assertTest(testName, passed, expected, actual, leadId, moduleName) {
  if (passed) {
    testsPassed++;
    console.log(`  ✅ [PASS] ${testName}`);
    testResults.push({ testName, leadId, moduleName, status: 'PASS', expected, actual });
  } else {
    testsFailed++;
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`     Expected: ${expected}`);
    console.error(`     Actual:   ${actual}`);
    testResults.push({ testName, leadId, moduleName, status: 'FAIL', expected, actual });
  }
}

async function runAllAudits() {
  console.log('='.repeat(80));
  console.log('🏥 4 PAW ANIMAL CLINIC - EXHAUSTIVE VALIDATION AUDIT SUITE');
  console.log('='.repeat(80));

  // ==========================================================================
  // MODULE 1 AUDIT: Pet Registry & Patient Management
  // Lead: IT24100661 - Devindi S.H.A.A.P.
  // ==========================================================================
  console.log('\n🐾 [MODULE 1] Testing Pet Registry & Patient Management (Lead: IT24100661)');
  
  // 1.1 Malformed Pet PIN
  const malformedPinRes = await apiRequest('POST', '/api/pets', {
    petName: 'Rocky Test',
    species: 'Canine',
    age: 3,
    gender: 'Male',
    uniquePin: 'INVALID-PIN-12345'
  });
  assertTest(
    'Reject malformed Pet PIN (expected HTTP 400)',
    malformedPinRes.status === 400,
    'HTTP 400',
    `HTTP ${malformedPinRes.status} (${malformedPinRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.2 Invalid Sri Lankan Phone
  const invalidPhoneRes = await apiRequest('POST', '/api/pets', {
    petName: 'Bella Test',
    species: 'Feline',
    age: 2,
    gender: 'Female',
    ownerPhone: '0112345678' // Landline, not mobile 07X
  });
  assertTest(
    'Reject non-mobile or invalid Sri Lankan owner phone (expected HTTP 400)',
    invalidPhoneRes.status === 400,
    'HTTP 400',
    `HTTP ${invalidPhoneRes.status} (${invalidPhoneRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.3 Invalid RFC Owner Email
  const invalidEmailRes = await apiRequest('POST', '/api/pets', {
    petName: 'Milo Test',
    species: 'Canine',
    age: 4,
    gender: 'Male',
    ownerEmail: 'not-an-email-address'
  });
  assertTest(
    'Reject invalid RFC owner email format (expected HTTP 400)',
    invalidEmailRes.status === 400,
    'HTTP 400',
    `HTTP ${invalidEmailRes.status} (${invalidEmailRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.4 Negative Pet Age
  const negativeAgeRes = await apiRequest('POST', '/api/pets', {
    petName: 'Simba Negative',
    species: 'Feline',
    age: -3,
    gender: 'Male'
  });
  assertTest(
    'Reject negative pet age (expected HTTP 400)',
    negativeAgeRes.status === 400,
    'HTTP 400',
    `HTTP ${negativeAgeRes.status} (${negativeAgeRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.5 Future Date of Birth (dob)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const futureDobRes = await apiRequest('POST', '/api/pets', {
    petName: 'Future Pup',
    species: 'Canine',
    age: 1,
    gender: 'Male',
    dob: tomorrow.toISOString()
  });
  assertTest(
    'Reject future date of birth (expected HTTP 400)',
    futureDobRes.status === 400,
    'HTTP 400',
    `HTTP ${futureDobRes.status} (${futureDobRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.6 Successful Patient Registration with Valid PIN and SL Phone
  const validPin = `PET-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = Date.now();
  const validPetRes = await apiRequest('POST', '/api/pets', {
    petName: `Buddy Gold ${timestamp}`,
    species: 'Canine',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    weight: 28.5,
    uniquePin: validPin,
    ownerPhone: '0771234567',
    ownerEmail: 'buddy.parent@example.lk',
    microchipNumber: `CHIP-${timestamp}`
  });
  const createdPetId = validPetRes.data?.data?._id;
  assertTest(
    'Register pet with valid PET-XXXX PIN and 07X phone (expected HTTP 201)',
    validPetRes.status === 201 && !!createdPetId,
    'HTTP 201',
    `HTTP ${validPetRes.status} (PIN: ${validPin})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.7 Duplicate Pet PIN Prevention
  const duplicatePinRes = await apiRequest('POST', '/api/pets', {
    petName: `Different Name ${timestamp}`,
    species: 'Canine',
    age: 1,
    gender: 'Male',
    uniquePin: validPin // Same PIN as above
  });
  assertTest(
    'Prevent duplicate Pet PIN creation (expected HTTP 400)',
    duplicatePinRes.status === 400,
    'HTTP 400',
    `HTTP ${duplicatePinRes.status} (${duplicatePinRes.data?.message})`,
    'IT24100661',
    'Pet Registry'
  );

  // 1.8 Query Pet by PIN: Malformed PIN & Valid PIN
  const malformedPinQuery = await apiRequest('GET', '/api/pets/pin/INVALID');
  assertTest(
    'Query pet with malformed PIN returns HTTP 400',
    malformedPinQuery.status === 400,
    'HTTP 400',
    `HTTP ${malformedPinQuery.status}`,
    'IT24100661',
    'Pet Registry'
  );

  const nonExistentPinQuery = await apiRequest('GET', '/api/pets/pin/PET-9999');
  assertTest(
    'Query non-existent Pet PIN returns HTTP 404',
    nonExistentPinQuery.status === 404 || nonExistentPinQuery.status === 200,
    'HTTP 404 or 200 if seeded',
    `HTTP ${nonExistentPinQuery.status}`,
    'IT24100661',
    'Pet Registry'
  );

  const validPinQuery = await apiRequest('GET', `/api/pets/pin/${validPin}`);
  assertTest(
    'Query registered Pet PIN returns HTTP 200',
    validPinQuery.status === 200 && validPinQuery.data?.data?.uniquePin === validPin,
    'HTTP 200',
    `HTTP ${validPinQuery.status} (Found: ${validPinQuery.data?.data?.petName})`,
    'IT24100661',
    'Pet Registry'
  );


  // ==========================================================================
  // MODULE 2 AUDIT: Inventory & Pharmacy Formulary
  // Lead: IT24100451 - Mudaligama K.H.C.
  // ==========================================================================
  console.log('\n💊 [MODULE 2] Testing Inventory & Pharmacy Formulary (Lead: IT24100451)');

  // 2.1 Negative Stock Quantity
  const negativeStockRes = await apiRequest('POST', '/api/inventory', {
    itemName: 'Amoxicillin 250mg',
    category: 'Medicines',
    price: 450.00,
    stockQuantity: -10,
    unit: 'Bottle'
  });
  assertTest(
    'Reject negative inventory stock quantity (expected HTTP 400)',
    negativeStockRes.status === 400,
    'HTTP 400',
    `HTTP ${negativeStockRes.status} (${negativeStockRes.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.2 Discrete Units Must Be Integers (e.g. 3.5 Pills/Vials rejected)
  const nonIntegerStockRes = await apiRequest('POST', '/api/inventory', {
    itemName: 'Rabies Vaccine Injections',
    category: 'Vaccines',
    price: 1800.00,
    stockQuantity: 12.5, // Non-integer
    unit: 'Vial'
  });
  assertTest(
    'Reject fractional stock for discrete items (Vials/Pills) (expected HTTP 400)',
    nonIntegerStockRes.status === 400,
    'HTTP 400',
    `HTTP ${nonIntegerStockRes.status} (${nonIntegerStockRes.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.3 Non-Positive or Zero Price
  const zeroPriceRes = await apiRequest('POST', '/api/inventory', {
    itemName: 'Free Dewormer Sample',
    category: 'Medicines',
    price: 0,
    stockQuantity: 20,
    unit: 'Tablet'
  });
  assertTest(
    'Reject zero or negative product price (expected HTTP 400)',
    zeroPriceRes.status === 400,
    'HTTP 400',
    `HTTP ${zeroPriceRes.status} (${zeroPriceRes.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.4 Past Expiry Date Rejection
  const pastExpiryRes = await apiRequest('POST', '/api/inventory', {
    itemName: 'Expired Antibiotic',
    category: 'Medicines',
    price: 650.00,
    stockQuantity: 10,
    expiryDate: '2023-01-01',
    unit: 'Bottle'
  });
  assertTest(
    'Reject batch receiving with past expiry date (expected HTTP 400)',
    pastExpiryRes.status === 400,
    'HTTP 400',
    `HTTP ${pastExpiryRes.status} (${pastExpiryRes.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.5 Successful Creation of Valid Formulary Item
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const validProductRes = await apiRequest('POST', '/api/inventory', {
    itemName: 'Ceftriaxone Sodium 1g',
    category: 'Medicines',
    price: 1250.00,
    stockQuantity: 25,
    unit: 'Vial',
    batchNo: `BATCH-${Date.now().toString().slice(-6)}`,
    expiryDate: futureDate.toISOString()
  });
  const createdProductId = validProductRes.data?.data?._id;
  assertTest(
    'Create valid pharmaceutical item with 2-year forward expiry (expected HTTP 201)',
    validProductRes.status === 201 && !!createdProductId,
    'HTTP 201',
    `HTTP ${validProductRes.status} (ID: ${createdProductId})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.6 Supplier Validation: Missing Company Reg No
  const missingRegSupplier = await apiRequest('POST', '/api/suppliers', {
    name: 'MediSupply Lanka',
    phone: '0771234567',
    email: 'contact@medisupply.lk'
    // missing regNo
  });
  assertTest(
    'Reject supplier registration without company regNo (expected HTTP 400)',
    missingRegSupplier.status === 400,
    'HTTP 400',
    `HTTP ${missingRegSupplier.status} (${missingRegSupplier.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );

  // 2.7 Supplier Validation: Invalid Phone Format
  const invalidSupplierPhone = await apiRequest('POST', '/api/suppliers', {
    name: 'Lanka Vet Supplies',
    regNo: 'PV-88990',
    phone: '123' // Invalid length
  });
  assertTest(
    'Reject supplier with invalid contact phone length (expected HTTP 400)',
    invalidSupplierPhone.status === 400,
    'HTTP 400',
    `HTTP ${invalidSupplierPhone.status} (${invalidSupplierPhone.data?.message})`,
    'IT24100451',
    'Inventory & Pharmacy'
  );


  // ==========================================================================
  // MODULE 3 AUDIT: Veterinary Appointments & Clinical Scheduling
  // Lead: IT24100050 - Karunarathna P.M.N.S.
  // ==========================================================================
  console.log('\n📅 [MODULE 3] Testing Veterinary Appointments & Scheduling (Lead: IT24100050)');

  // 3.1 Past Date Booking Rejection
  const pastApptRes = await apiRequest('POST', '/api/bookings', {
    petId: createdPetId,
    serviceType: 'General Veterinary Consultation',
    assignedStaff: 'Dr. Perera (Senior Vet)',
    appointmentDate: '2023-01-15',
    timeSlot: '09:00 AM'
  });
  assertTest(
    'Reject appointment booking for past date (expected HTTP 400)',
    pastApptRes.status === 400,
    'HTTP 400',
    `HTTP ${pastApptRes.status} (${pastApptRes.data?.message})`,
    'IT24100050',
    'Appointments & Scheduling'
  );

  // 3.2 Operating Hours Restriction (08:30 AM to 07:30 PM)
  const futureApptDate = new Date();
  futureApptDate.setDate(futureApptDate.getDate() + 5);
  const futureDateStr = futureApptDate.toISOString().slice(0, 10);

  const outsideHoursRes = await apiRequest('POST', '/api/bookings', {
    petId: createdPetId,
    serviceType: 'General Veterinary Consultation',
    assignedStaff: 'Dr. Perera (Senior Vet)',
    appointmentDate: futureDateStr,
    timeSlot: '11:00 PM' // Outside operating hours
  });
  assertTest(
    'Reject time slot outside operating hours 08:30 AM - 07:30 PM (expected HTTP 400)',
    outsideHoursRes.status === 400,
    'HTTP 400',
    `HTTP ${outsideHoursRes.status} (${outsideHoursRes.data?.message})`,
    'IT24100050',
    'Appointments & Scheduling'
  );

  // 3.3 Patient Linkage Requirement (Reject invalid or unverified pet ID)
  const invalidPetAppt = await apiRequest('POST', '/api/bookings', {
    petId: '65f000000000000000000000', // Non-existent ObjectId
    serviceType: 'General Veterinary Consultation',
    assignedStaff: 'Dr. Perera (Senior Vet)',
    appointmentDate: futureDateStr,
    timeSlot: '10:00 AM'
  });
  assertTest(
    'Reject appointment booking with non-existent pet patient (expected HTTP 404)',
    invalidPetAppt.status === 404,
    'HTTP 404',
    `HTTP ${invalidPetAppt.status} (${invalidPetAppt.data?.message})`,
    'IT24100050',
    'Appointments & Scheduling'
  );

  // 3.4 Valid Booking Creation
  const validBookingRes = await apiRequest('POST', '/api/bookings', {
    petId: createdPetId,
    serviceType: 'General Veterinary Consultation',
    assignedStaff: 'Dr. Perera (Senior Vet)',
    appointmentDate: futureDateStr,
    timeSlot: '10:00 AM'
  });
  assertTest(
    'Schedule valid clinical appointment within operating hours (expected HTTP 201)',
    validBookingRes.status === 201,
    'HTTP 201',
    `HTTP ${validBookingRes.status}`,
    'IT24100050',
    'Appointments & Scheduling'
  );

  // 3.5 Double-Booking Guard (Same Doctor + Same Date + Same Time Slot)
  const conflictBookingRes = await apiRequest('POST', '/api/bookings', {
    petId: createdPetId,
    serviceType: 'Vaccination & Immunization',
    assignedStaff: 'Dr. Perera (Senior Vet)',
    appointmentDate: futureDateStr,
    timeSlot: '10:00 AM' // Exact same slot
  });
  assertTest(
    'Double-booking guard rejects conflicting slot (expected HTTP 409 Conflict)',
    conflictBookingRes.status === 409,
    'HTTP 409',
    `HTTP ${conflictBookingRes.status} (${conflictBookingRes.data?.message})`,
    'IT24100050',
    'Appointments & Scheduling'
  );


  // ==========================================================================
  // MODULE 4 AUDIT: Clinical POS & Financial Accounting
  // Lead: IT24100383 - Wickramarathna W.M.G.C.
  // ==========================================================================
  console.log('\n💳 [MODULE 4] Testing Clinical POS & Financial Accounting (Lead: IT24100383)');

  // 4.1 Empty Cart Checkout
  const emptyCartRes = await apiRequest('POST', '/api/billing', {
    items: [],
    paymentMethod: 'Cash',
    tenderedAmount: 500
  });
  assertTest(
    'Reject checkout with empty item cart (expected HTTP 400)',
    emptyCartRes.status === 400,
    'HTTP 400',
    `HTTP ${emptyCartRes.status} (${emptyCartRes.data?.message})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.2 Over-Stock Selling Guard (attempt to sell 999 units when only 25 in stock)
  const overStockRes = await apiRequest('POST', '/api/billing', {
    items: [{
      productId: createdProductId,
      itemName: 'Ceftriaxone Sodium 1g',
      unitPrice: 1250.00,
      quantity: 999, // Stock is only 25!
      subtotal: 1250.00 * 999
    }],
    paymentMethod: 'Cash',
    tenderedAmount: 2000000
  });
  assertTest(
    'Over-stock guard rejects sale exceeding inventory quantity (expected HTTP 400)',
    overStockRes.status === 400,
    'HTTP 400',
    `HTTP ${overStockRes.status} (${overStockRes.data?.message})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.3 Cash Tendered Underpayment / Shortfall Guard
  const underpaidRes = await apiRequest('POST', '/api/billing', {
    items: [{
      productId: createdProductId,
      itemName: 'Ceftriaxone Sodium 1g',
      unitPrice: 1250.00,
      quantity: 2,
      subtotal: 2500.00
    }],
    paymentMethod: 'Cash',
    tenderedAmount: 2000 // Rs. 2000 < Total Rs. 2500
  });
  assertTest(
    'Reject cash sale with tendered shortfall (2000 < 2500) (expected HTTP 400)',
    underpaidRes.status === 400,
    'HTTP 400',
    `HTTP ${underpaidRes.status} (${underpaidRes.data?.message})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.4 Excessive Discount Rate (> 50%)
  const highDiscountRes = await apiRequest('POST', '/api/billing', {
    items: [{
      productId: createdProductId,
      itemName: 'Ceftriaxone Sodium 1g',
      unitPrice: 1250.00,
      quantity: 1,
      subtotal: 1250.00
    }],
    discountRate: 65, // > 50%
    paymentMethod: 'Cash',
    tenderedAmount: 1500
  });
  assertTest(
    'Reject excessive discount rate > 50% (expected HTTP 400)',
    highDiscountRes.status === 400,
    'HTTP 400',
    `HTTP ${highDiscountRes.status} (${highDiscountRes.data?.message})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.5 Excessive Tax Rate (> 15%)
  const highTaxRes = await apiRequest('POST', '/api/billing', {
    items: [{
      productId: createdProductId,
      itemName: 'Ceftriaxone Sodium 1g',
      unitPrice: 1250.00,
      quantity: 1,
      subtotal: 1250.00
    }],
    taxRate: 25, // > 15%
    paymentMethod: 'Cash',
    tenderedAmount: 2000
  });
  assertTest(
    'Reject excessive tax rate > 15% (expected HTTP 400)',
    highTaxRes.status === 400,
    'HTTP 400',
    `HTTP ${highTaxRes.status} (${highTaxRes.data?.message})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.6 Successful POS Checkout with Exact Change & 2-Decimal Precision Rounding
  // 2 units * 1250 = 2500, discount 10% = 250 -> 2250, tax 8% = 180 -> Final 2430.00. Tendered: 3000 -> Change: 570.00
  const validSaleRes = await apiRequest('POST', '/api/billing', {
    items: [{
      productId: createdProductId,
      itemName: 'Ceftriaxone Sodium 1g',
      unitPrice: 1250.00,
      quantity: 2,
      subtotal: 2500.00
    }],
    discountRate: 10,
    taxRate: 8,
    paymentMethod: 'Cash',
    tenderedAmount: 3000.00
  });
  const invoiceData = validSaleRes.data?.data;
  assertTest(
    'Process valid transaction with exact change & 2-decimal rounding (expected HTTP 201)',
    validSaleRes.status === 201 && invoiceData?.changeAmount === 570.00 && invoiceData?.finalTotal === 2430.00,
    'HTTP 201 (Final: Rs. 2430.00, Change: Rs. 570.00)',
    `HTTP ${validSaleRes.status} (Final: Rs. ${invoiceData?.finalTotal}, Change: Rs. ${invoiceData?.changeAmount})`,
    'IT24100383',
    'POS & Financials'
  );

  // 4.7 Atomic Stock Deduction Verification
  const stockCheckRes = await apiRequest('GET', `/api/inventory/${createdProductId}`);
  const remainingStock = stockCheckRes.data?.data?.stockQuantity;
  assertTest(
    'Atomic stock deduction verified via MongoDB $inc (25 initial - 2 sold = 23 remaining)',
    remainingStock === 23,
    'Stock: 23',
    `Stock: ${remainingStock}`,
    'IT24100383',
    'POS & Financials'
  );

  // ==========================================================================
  // FINAL SUMMARY REPORT
  // ==========================================================================
  console.log('\n' + '='.repeat(80));
  console.log(`🏁 AUDIT EXECUTION COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED out of ${testsPassed + testsFailed} TESTS`);
  console.log('='.repeat(80));

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllAudits().catch((err) => {
  console.error('[Audit Suite Error]:', err);
  process.exit(1);
});
