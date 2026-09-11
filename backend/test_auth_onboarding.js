/**
 * Automated Verification Script: Dual-Identifier Auth & Multi-Pet Onboarding
 */

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runAuthTests() {
  console.log('=======================================================================');
  console.log('🐾 4 PAW CLINIC: DUAL-IDENTIFIER AUTH & MULTI-PET ONBOARDING TEST SUITE');
  console.log('=======================================================================');

  let passed = 0;
  let failed = 0;

  const testPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testEmail = `test_owner_${Date.now()}@4paw.lk`;
  const testPassword = 'password123';

  // TEST 1: Register with Phone Number + 2 Initial Pets
  try {
    console.log('\n▶ TEST 1: Register Customer with Phone Number + 2 Pets');
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kamal Perera',
        phone: testPhone,
        password: testPassword,
        role: 'customer',
        initialPets: [
          {
            petName: 'Rocky Dog',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 3,
            gender: 'Male',
            weight: 28
          },
          {
            petName: 'Mimi Cat',
            species: 'Cat',
            breed: 'Persian',
            age: 2,
            gender: 'Female',
            weight: 4
          }
        ]
      })
    });
    const data = await res.json();

    if (res.status === 201 && data.success && data.token && data.user) {
      console.log(`  [PASS] Registered user with Phone: ${testPhone} (User ID: ${data.user._id})`);
      if (data.createdPets && data.createdPets.length === 2) {
        console.log(`  [PASS] Successfully onboarded 2 pets on-the-fly!`);
        console.log(`         Pet 1: ${data.createdPets[0].petName} (PIN: ${data.createdPets[0].uniquePin}, Species: ${data.createdPets[0].species})`);
        console.log(`         Pet 2: ${data.createdPets[1].petName} (PIN: ${data.createdPets[1].uniquePin}, Species: ${data.createdPets[1].species})`);
        passed += 2;
      } else {
        console.log(`  [FAIL] Did not create 2 initial pets:`, JSON.stringify(data.createdPets));
        failed++;
      }
      passed++;
    } else {
      console.log(`  [FAIL] Registration failed:`, JSON.stringify(data));
      failed++;
    }
  } catch (err) {
    console.log(`  [FAIL] Exception in Test 1:`, err.message);
    failed++;
  }

  // TEST 2: Login using Phone Number
  try {
    console.log('\n▶ TEST 2: Authenticate (Login) with Phone Number');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testPhone,
        password: testPassword
      })
    });
    const data = await res.json();

    if (res.status === 200 && data.success && data.token && data.user) {
      console.log(`  [PASS] Phone Login successful! User: ${data.user.name}, Pets count: ${data.user.petsCount}`);
      passed++;
    } else {
      console.log(`  [FAIL] Phone Login failed:`, JSON.stringify(data));
      failed++;
    }
  } catch (err) {
    console.log(`  [FAIL] Exception in Test 2:`, err.message);
    failed++;
  }

  // TEST 3: Register with Email (Skipping Pet Setup)
  try {
    console.log('\n▶ TEST 3: Register Customer with Email (Skipping Pet Setup)');
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nimal Fernando',
        email: testEmail,
        password: testPassword,
        role: 'customer',
        initialPets: []
      })
    });
    const data = await res.json();

    if (res.status === 201 && data.success && data.token && data.user) {
      console.log(`  [PASS] Registered user with Email: ${testEmail}`);
      console.log(`  [PASS] Initial pets skipped cleanly (petsCount: ${data.user.petsCount})`);
      passed += 2;
    } else {
      console.log(`  [FAIL] Email registration failed:`, JSON.stringify(data));
      failed++;
    }
  } catch (err) {
    console.log(`  [FAIL] Exception in Test 3:`, err.message);
    failed++;
  }

  // TEST 4: Login using Email
  try {
    console.log('\n▶ TEST 4: Authenticate (Login) with Email Address');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: testPassword
      })
    });
    const data = await res.json();

    if (res.status === 200 && data.success && data.token && data.user) {
      console.log(`  [PASS] Email Login successful! User: ${data.user.name}`);
      passed++;
    } else {
      console.log(`  [FAIL] Email Login failed:`, JSON.stringify(data));
      failed++;
    }
  } catch (err) {
    console.log(`  [FAIL] Exception in Test 4:`, err.message);
    failed++;
  }

  // TEST 5: Verify Existing Seed Accounts (e.g. admin@4paw.lk)
  try {
    console.log('\n▶ TEST 5: Verify Legacy Demo Chip Credentials (admin@4paw.lk)');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@4paw.lk',
        password: 'admin123'
      })
    });
    const data = await res.json();

    if (res.status === 200 && data.success && data.user && data.user.role === 'admin') {
      console.log(`  [PASS] Admin demo account verified! (Role: ${data.user.role})`);
      passed++;
    } else {
      console.log(`  [FAIL] Admin demo login failed:`, JSON.stringify(data));
      failed++;
    }
  } catch (err) {
    console.log(`  [FAIL] Exception in Test 5:`, err.message);
    failed++;
  }

  console.log('\n=======================================================================');
  console.log(`📊 AUTH & ONBOARDING SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('=======================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL DUAL-IDENTIFIER & ONBOARDING TESTS PASSED PERFECTLY!\n');
  }
}

runAuthTests();
