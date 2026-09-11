/**
 * ============================================================================
 * END-TO-END AUTOMATED INTEGRATION TEST SUITE (test_e2e.js)
 * ============================================================================
 * 4 Paw Animal Clinic - Full-Stack MERN Architecture
 * 
 * Verifies read/write database integrity, cross-module constraints, business logic,
 * POS real-time stock auto-deduction, 409 double-booking guards, health passport payloads,
 * and financial CSV streaming against live backend server (http://localhost:5000).
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

// ANSI Terminal Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m'
};

const pass = (msg) => console.log(`  ${colors.green}[PASS]${colors.reset} ${msg}`);
const fail = (msg, err = '') => console.log(`  ${colors.red}[FAIL]${colors.reset} ${msg} ${err ? `-> ${err}` : ''}`);
const info = (msg) => console.log(`\n${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`);

// Test State Storage
const testData = {
  petId: null,
  petPin: null,
  productId: null,
  bookingId: null,
  invoiceId: null
};

async function runE2ETests() {
  console.log(`\n=======================================================================`);
  console.log(`🐾 4 PAW ANIMAL CLINIC - AUTOMATED E2E INTEGRATION TEST SUITE`);
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log(`📅 Execution Time: ${new Date().toLocaleString()}`);
  console.log(`=======================================================================\n`);

  let totalPassed = 0;
  let totalFailed = 0;

  // ============================================================================
  // TEST SUITE 1: PATIENTS & MEDICAL RECORDS (MODULE 1)
  // ============================================================================
  try {
    info("SUITE 1: Patients & Medical Records (Module 1)");

    // 1.1 Register Test Pet Patient
    const registerRes = await fetch(`${BASE_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petName: 'Rocky E2E Test',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 3,
        weight: 31.5
      })
    });
    const registerData = await registerRes.json();

    if (registerRes.status === 201 && registerData.success && registerData.data.uniquePin) {
      testData.petId = registerData.data._id;
      testData.petPin = registerData.data.uniquePin;
      pass(`Registered test pet '${registerData.data.petName}' with auto-generated PIN: ${testData.petPin}`);
      totalPassed++;
    } else {
      fail(`Failed to register test pet patient`, JSON.stringify(registerData));
      totalFailed++;
    }

    // 1.2 Add Clinical Medical History Log
    const logRes = await fetch(`${BASE_URL}/pets/${testData.petId}/medical-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnosis: 'Annual Health Check & Rabies Booster',
        treatment: 'Administered Rabisin Vaccine Booster & Oral Dewormer',
        vaccineName: 'Rabisin Rabies Booster',
        vetDoctor: 'Dr. Perera (Senior Vet)'
      })
    });
    const logData = await logRes.json();

    if (logRes.status === 200 && logData.success) {
      pass(`Recorded medical log entry: '${logData.data.medicalLogs.slice(-1)[0].diagnosis}'`);
      totalPassed++;
    } else {
      fail(`Failed to record medical log entry`, JSON.stringify(logData));
      totalFailed++;
    }

    // 1.3 Fetch Aggregated Health Passport Payload
    const passportRes = await fetch(`${BASE_URL}/pets/${testData.petId}/health-passport`);
    const passportData = await passportRes.json();

    if (
      passportRes.status === 200 &&
      passportData.success &&
      passportData.data.pet &&
      passportData.data.medicalLogs.length >= 1
    ) {
      pass(`Health passport payload verified with ${passportData.data.medicalLogs.length} medical log(s) and owner demographics`);
      totalPassed++;
    } else {
      fail(`Health passport payload aggregation invalid`, JSON.stringify(passportData));
      totalFailed++;
    }

  } catch (err) {
    fail(`Suite 1 exception: ${err.message}`);
    totalFailed++;
  }

  // ============================================================================
  // TEST SUITE 2: PHARMACY, LOW STOCK & EXPIRY LIFECYCLE (MODULE 2)
  // ============================================================================
  try {
    info("SUITE 2: Pharmacy, Low Stock & Expiry Lifecycle (Module 2)");

    // 2.1 Create Test Product Batch
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const prodRes = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'E2E Flea & Tick Spray',
        category: 'Healthcare',
        price: 1850.00,
        stockQuantity: 5, // Low stock threshold item
        supplier: 'VetMed Lanka',
        batchNo: 'BTH-E2E-100',
        expiryDate: tenDaysFromNow.toISOString(),
        unit: 'Bottle'
      })
    });
    const prodData = await prodRes.json();

    if (prodRes.status === 201 && prodData.success && prodData.data._id) {
      testData.productId = prodData.data._id;
      pass(`Created test pharmacy product '${prodData.data.itemName}' (Stock: 5, Expiry: 10 days)`);
      totalPassed++;
    } else {
      fail(`Failed to create test product`, JSON.stringify(prodData));
      totalFailed++;
    }

    // 2.2 Verify Expiry Alert Tracking Endpoint
    const expiringRes = await fetch(`${BASE_URL}/inventory/expiring-soon`);
    const expiringData = await expiringRes.json();

    const foundExpiringItem = expiringData.data?.find(p => p._id === testData.productId);
    if (expiringRes.status === 200 && expiringData.success && foundExpiringItem) {
      pass(`Expiry tracker detected test batch '${foundExpiringItem.itemName}' in <= 30 day warning list`);
      totalPassed++;
    } else {
      fail(`Expiring soon endpoint did not return test item`, JSON.stringify(expiringData));
      totalFailed++;
    }

  } catch (err) {
    fail(`Suite 2 exception: ${err.message}`);
    totalFailed++;
  }

  // ============================================================================
  // TEST SUITE 3: APPOINTMENTS & DOUBLE-BOOKING GUARD (MODULE 3)
  // ============================================================================
  try {
    info("SUITE 3: Appointments & Double-Booking Guard (Module 3)");

    const randOffset = Math.floor(Math.random() * 1000) + 50;
    const future = new Date();
    future.setDate(future.getDate() + randOffset);
    const targetDate = future.toISOString().split('T')[0];
    const targetSlot = '02:00 PM';
    const doctorName = 'Dr. Perera (Senior Vet)';

    // 3.1 Create Primary Appointment
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petId: testData.petId,
        serviceType: 'Vaccination',
        assignedStaff: doctorName,
        appointmentDate: targetDate,
        timeSlot: targetSlot,
        notes: 'E2E Validation Appointment'
      })
    });
    const bookData = await bookRes.json();

    if (bookRes.status === 201 && bookData.success && bookData.data._id) {
      testData.bookingId = bookData.data._id;
      pass(`Booked appointment for ${doctorName} on ${targetDate} at ${targetSlot}`);
      totalPassed++;
    } else {
      fail(`Failed to book primary appointment`, JSON.stringify(bookData));
      totalFailed++;
    }

    // 3.2 Deliberate Double-Booking Conflict Guard Test
    const conflictRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petId: testData.petId,
        serviceType: 'General Consultation',
        assignedStaff: doctorName,
        appointmentDate: targetDate,
        timeSlot: targetSlot,
        notes: 'Deliberate Collision Test'
      })
    });
    const conflictData = await conflictRes.json();

    if (conflictRes.status === 409 && !conflictData.success) {
      pass(`409 Conflict Guard correctly BLOCKED double-booking for ${doctorName} at ${targetSlot}`);
      totalPassed++;
    } else {
      fail(`Double-booking guard failed! Expected 409 Conflict, received status ${conflictRes.status}`, JSON.stringify(conflictData));
      totalFailed++;
    }

    // 3.3 Verify Doctor Schedule Aggregator
    const scheduleRes = await fetch(`${BASE_URL}/bookings/schedule?doctor=${encodeURIComponent(doctorName)}&date=${targetDate}`);
    const scheduleData = await scheduleRes.json();

    const targetSlotObj = scheduleData.data?.find(s => s.timeSlot === targetSlot);
    if (scheduleRes.status === 200 && scheduleData.success && targetSlotObj?.status === 'booked') {
      pass(`Doctor Day Schedule Endpoint confirmed slot '${targetSlot}' is marked as 'booked'`);
      totalPassed++;
    } else {
      fail(`Doctor schedule endpoint failed to reflect booked slot`, JSON.stringify(scheduleData));
      totalFailed++;
    }

  } catch (err) {
    fail(`Suite 3 exception: ${err.message}`);
    totalFailed++;
  }

  // ============================================================================
  // TEST SUITE 4: POS BILLING & REAL-TIME STOCK AUTO-DEDUCTION (MODULE 4)
  // ============================================================================
  try {
    info("SUITE 4: POS Billing & Real-Time Stock Auto-Deduction (Module 4)");

    // 4.1 Process POS Sale (Purchasing 2 units of Test Flea Spray)
    const saleRes = await fetch(`${BASE_URL}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            product: testData.productId,
            itemName: 'E2E Flea & Tick Spray',
            unitPrice: 1850.00,
            quantity: 2
          }
        ],
        paymentMethod: 'Cash',
        discountRate: 0,
        taxRate: 0
      })
    });
    const saleData = await saleRes.json();

    if (saleRes.status === 201 && saleData.success && saleData.data.finalTotal) {
      testData.invoiceId = saleData.data._id;
      pass(`Processed POS sale (Invoice #${saleData.data.invoiceNo}) Total: Rs. ${saleData.data.finalTotal.toFixed(2)}`);
      totalPassed++;
    } else {
      fail(`Failed to process POS sale invoice`, JSON.stringify(saleData));
      totalFailed++;
    }

    // 4.2 Verify Real-Time Stock Auto-Deduction in DB
    const checkStockRes = await fetch(`${BASE_URL}/inventory/${testData.productId}`);
    const checkStockData = await checkStockRes.json();

    if (checkStockRes.status === 200 && checkStockData.success && checkStockData.data.stockQuantity === 3) {
      pass(`Real-Time Stock Auto-Deduction Verified! Stock decreased from 5 to 3 in DB`);
      totalPassed++;
    } else {
      fail(`Stock auto-deduction failed! Expected stock: 3, Actual stock: ${checkStockData.data?.stockQuantity}`, JSON.stringify(checkStockData));
      totalFailed++;
    }

  } catch (err) {
    fail(`Suite 4 exception: ${err.message}`);
    totalFailed++;
  }

  // ============================================================================
  // TEST SUITE 5: FINANCIAL ANALYTICS & CSV STREAMING (MODULE 4)
  // ============================================================================
  try {
    info("SUITE 5: Financial Analytics & CSV Streaming (Module 4)");

    // 5.1 Analytics Summary Endpoint
    const analyticsRes = await fetch(`${BASE_URL}/billing/analytics`);
    const analyticsData = await analyticsRes.json();

    if (
      analyticsRes.status === 200 &&
      analyticsData.success &&
      analyticsData.data.summary.totalRevenue > 0
    ) {
      pass(`Analytics BI Endpoint returned Total Revenue: Rs. ${analyticsData.data.summary.totalRevenue.toFixed(2)} (${analyticsData.data.summary.totalInvoices} Invoices)`);
      totalPassed++;
    } else {
      fail(`Analytics endpoint failed or returned empty data`, JSON.stringify(analyticsData));
      totalFailed++;
    }

    // 5.2 CSV Report Stream Endpoint
    const csvRes = await fetch(`${BASE_URL}/billing/export-csv`);
    const contentType = csvRes.headers.get('content-type');
    const csvText = await csvRes.text();

    if (csvRes.status === 200 && contentType && contentType.includes('text/csv') && csvText.includes('Invoice Number')) {
      const lineCount = csvText.trim().split('\n').length;
      pass(`CSV Export Stream verified! Content-Type: '${contentType}', Output: ${lineCount} RFC-4180 CSV rows`);
      totalPassed++;
    } else {
      fail(`CSV export stream failed! Content-Type: ${contentType}`, csvText.substring(0, 100));
      totalFailed++;
    }

  } catch (err) {
    fail(`Suite 5 exception: ${err.message}`);
    totalFailed++;
  }

  // ============================================================================
  // TEARDOWN & TEST DATA CLEANUP
  // ============================================================================
  try {
    info("TEARDOWN: Cleaning up test artifacts");

    if (testData.petId) {
      await fetch(`${BASE_URL}/pets/${testData.petId}`, { method: 'DELETE' });
    }
    if (testData.productId) {
      await fetch(`${BASE_URL}/inventory/${testData.productId}`, { method: 'DELETE' });
    }
    if (testData.bookingId) {
      await fetch(`${BASE_URL}/bookings/${testData.bookingId}`, { method: 'DELETE' });
    }
    if (testData.invoiceId) {
      await fetch(`${BASE_URL}/billing/${testData.invoiceId}/void`, { method: 'PUT' });
    }
    pass("Cleaned up temporary test pet, product, booking, and invoice records");
  } catch (cleanErr) {
    console.warn("  [NOTE] Teardown warning:", cleanErr.message);
  }

  // ============================================================================
  // FINAL TEST RESULTS SUMMARY
  // ============================================================================
  console.log(`\n=======================================================================`);
  console.log(`📊 E2E INTEGRATION TEST RESULTS SUMMARY`);
  console.log(`-----------------------------------------------------------------------`);
  console.log(`  Total Tests Executed : ${totalPassed + totalFailed}`);
  console.log(`  Passed Assertions    : ${colors.green}${totalPassed}${colors.reset}`);
  console.log(`  Failed Assertions    : ${totalFailed > 0 ? colors.red : colors.green}${totalFailed}${colors.reset}`);
  console.log(`=======================================================================`);

  if (totalFailed === 0) {
    console.log(`\n${colors.bgGreen} 🎉 ALL 5 MODULE END-TO-END INTEGRATION TESTS PASSED CLEANLY! ${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bgRed} ❌ E2E TEST SUITE FAILED WITH ${totalFailed} ERROR(S) ${colors.reset}\n`);
    process.exit(1);
  }
}

runE2ETests();
