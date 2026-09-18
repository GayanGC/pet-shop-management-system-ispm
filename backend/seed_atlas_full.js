/**
 * ============================================================================
 * EXHAUSTIVE DATABASE SEEDER SCRIPT (seed_atlas_full.js)
 * ============================================================================
 * Populates MongoDB Atlas with rich, production-grade clinical data for:
 * 1. System Users (Admin, Vets, Nurses, Pharmacist, Cashiers, 6+ Pet Owners)
 * 2. Suppliers Directory (6 Pharmaceutical & Clinical Distributors)
 * 3. Pharmacy & Inventory Catalog (16+ Medications, Vaccines, Consumables)
 * 4. Pet Patients (10 Patients with Clinical Records & Vaccination Passports)
 * 5. Clinical Appointments (12+ Bookings across Vets, Dates, and Statuses)
 * 6. Financial Ledger & POS Invoices (12+ Invoices with Cash/Card/Online)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Appointment = require('./models/Appointment');
const Invoice = require('./models/Invoice');

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in backend/.env!');
  process.exit(1);
}

const seedAtlas = async () => {
  try {
    console.log('===============================================================');
    console.log('🏥 4 PAW ANIMAL CLINIC - FULL ATLAS DATABASE POPULATION');
    console.log('===============================================================');
    console.log('🔌 Connecting to MongoDB Atlas Cloud Cluster...');
    console.log(`📡 URI: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}`);

    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected successfully to Host: ${mongoose.connection.host}`);
    console.log(`🗄️ Database: ${mongoose.connection.name}`);

    // 1. CLEAR COLLECTIONS
    console.log('\n🧹 Clearing old database records for fresh clinical state...');
    await Promise.all([
      User.deleteMany({}),
      Pet.deleteMany({}),
      Product.deleteMany({}),
      Supplier.deleteMany({}),
      Appointment.deleteMany({}),
      Invoice.deleteMany({})
    ]);
    console.log('✅ Collections cleared successfully.');

    // 2. SEED SYSTEM USERS & REGISTERED CLIENTS
    console.log('\n👤 Seeding System Staff & Pet Owner Accounts...');
    const adminUser = await User.create({
      name: 'Dr. Perera (Chief Veterinarian & Medical Director)',
      email: 'admin@4paw.lk',
      phone: '0112345678',
      password: 'admin123',
      role: 'admin'
    });

    const surgeonUser = await User.create({
      name: 'Dr. Samantha Fernando (Senior Veterinary Surgeon)',
      email: 'surgeon@4paw.lk',
      phone: '0773344556',
      password: 'staff123',
      role: 'staff'
    });

    const physicianUser = await User.create({
      name: 'Dr. Nilupul Silva (Consultant Veterinary Physician)',
      email: 'consultant@4paw.lk',
      phone: '0714455667',
      password: 'staff123',
      role: 'staff'
    });

    const nurseUser = await User.create({
      name: 'Nurse Anoma Silva (Head Clinical Nurse)',
      email: 'staff@4paw.lk',
      phone: '0725566778',
      password: 'staff123',
      role: 'staff'
    });

    const inventoryUser = await User.create({
      name: 'Dilshan Gunawardena (Head Pharmacist & Inventory Lead)',
      email: 'inventory@4paw.lk',
      phone: '0766677889',
      password: 'inv123',
      role: 'inventory_officer'
    });

    const cashierUser = await User.create({
      name: 'Kamal Gunasekara (Senior POS Cashier)',
      email: 'cashier@4paw.lk',
      phone: '0779998877',
      password: 'cashier123',
      role: 'cashier'
    });

    const clients = await User.create([
      {
        name: 'Nimal Perera',
        email: 'customer@gmail.com',
        phone: '0771234567',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Dr. Harsha Jayawardena',
        email: 'harsha.j@gmail.com',
        phone: '0712345678',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Sunethra Bandara',
        email: 'sunethra.b@yahoo.com',
        phone: '0723456789',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Anura Wickramasinghe',
        email: 'anura.w@outlook.com',
        phone: '0754567890',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Chathurika Fernando',
        email: 'chathu.f@gmail.com',
        phone: '0765678901',
        password: 'customer123',
        role: 'customer'
      },
      {
        name: 'Ruwani Dissanayake',
        email: 'ruwani.d@gmail.com',
        phone: '0786789012',
        password: 'customer123',
        role: 'customer'
      }
    ]);
    console.log(`✅ Seeded ${clients.length + 6} users (Staff & Clients).`);

    // 3. SEED SUPPLIERS
    console.log('\n🏢 Seeding Clinical Suppliers & Distributors...');
    const suppliers = await Supplier.create([
      {
        name: 'VetMed Lanka Ltd',
        contactPerson: 'Dr. Nimal Silva',
        phone: '077-1234567',
        email: 'orders@vetmedlanka.lk',
        address: 'No. 45, Baseline Road, Colombo 09',
        suppliedCategories: ['Vaccines', 'Medicines', 'Healthcare'],
        status: 'Active'
      },
      {
        name: 'Ceylon Pet Supplies',
        contactPerson: 'Sunethra Dias',
        phone: '071-9876543',
        email: 'sales@ceylonpet.lk',
        address: 'No. 120, Kandy Road, Kelaniya',
        suppliedCategories: ['Nutrition', 'Supplements', 'Clinical Consumables'],
        status: 'Active'
      },
      {
        name: 'MediVet Pharmaceuticals',
        contactPerson: 'K. Perera',
        phone: '011-2345678',
        email: 'distribution@medivet.lk',
        address: 'No. 88, Galle Road, Dehiwala',
        suppliedCategories: ['Medicines', 'Supplements', 'Healthcare'],
        status: 'Active'
      },
      {
        name: 'BioMed Diagnostics Lanka',
        contactPerson: 'Prabath Jayasuriya',
        phone: '011-8765432',
        email: 'info@biomedlanka.lk',
        address: 'No. 15, Hospital Square, Maharagama',
        suppliedCategories: ['Clinical Supplies', 'Healthcare'],
        status: 'Active'
      },
      {
        name: 'Premier Surgical & Medical Imports',
        contactPerson: 'Maheshika De Silva',
        phone: '076-5544332',
        email: 'sales@premiersurgical.lk',
        address: 'No. 204, High Level Road, Nugegoda',
        suppliedCategories: ['Clinical Supplies', 'Healthcare'],
        status: 'Active'
      },
      {
        name: 'NutriCare Animal Nutrition',
        contactPerson: 'Roshan Samarasekera',
        phone: '072-3322110',
        email: 'support@nutricare.lk',
        address: 'No. 62, Negombo Road, Ja-Ela',
        suppliedCategories: ['Nutrition', 'Supplements'],
        status: 'Active'
      }
    ]);
    console.log(`✅ Seeded ${suppliers.length} pharmaceutical suppliers.`);

    // 4. SEED PRODUCTS & PHARMACY CATALOG (16 Items)
    console.log('\n💊 Seeding Comprehensive Clinical Formulary & Store Products...');
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const products = await Product.create([
      {
        itemName: 'Rabies Inactivated Vaccine (Rabisin)',
        category: 'Vaccines',
        price: 2200.00,
        stockQuantity: 35,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-RAB-2026',
        expiryDate: new Date(now + 365 * dayMs),
        unit: 'Vial',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Bravecto Chewable Tick & Flea (Dogs 20-40kg)',
        category: 'Healthcare',
        price: 6800.00,
        stockQuantity: 4, // Low Stock Alert
        supplier: 'Ceylon Pet Supplies',
        batchNo: 'BTH-BRV-408',
        expiryDate: new Date(now + 240 * dayMs),
        unit: 'Pack',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Royal Canin Maxi Adult Clinical Diet (15kg)',
        category: 'Nutrition',
        price: 16500.00,
        stockQuantity: 14,
        supplier: 'NutriCare Animal Nutrition',
        batchNo: 'BTH-RCM-901',
        expiryDate: new Date(now + 300 * dayMs),
        unit: 'Bag',
        imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Whiskas Ocean Fish Adult Cat Food (3kg)',
        category: 'Nutrition',
        price: 3200.00,
        stockQuantity: 3, // Low Stock Alert
        supplier: 'Ceylon Pet Supplies',
        batchNo: 'BTH-WSK-112',
        expiryDate: new Date(now + 180 * dayMs),
        unit: 'Bag',
        imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Amoxicillin Clavulanate Drops (15ml)',
        category: 'Medicines',
        price: 1450.00,
        stockQuantity: 28,
        supplier: 'MediVet Pharmaceuticals',
        batchNo: 'BTH-AMX-301',
        expiryDate: new Date(now + 150 * dayMs),
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Antiseptic Chlorhexidine Surgical Spray (500ml)',
        category: 'Clinical Supplies',
        price: 1850.00,
        stockQuantity: 22,
        supplier: 'Premier Surgical & Medical Imports',
        batchNo: 'BTH-CHL-005',
        expiryDate: new Date(now + 400 * dayMs),
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Multivitamin & Joint Glucosamine Tablets',
        category: 'Supplements',
        price: 2800.00,
        stockQuantity: 40,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-VIT-770',
        expiryDate: new Date(now + 320 * dayMs),
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Meloxicam 1.5mg/ml Oral Anti-Inflammatory (30ml)',
        category: 'Medicines',
        price: 3400.00,
        stockQuantity: 5, // Low Stock Alert
        supplier: 'MediVet Pharmaceuticals',
        batchNo: 'BTH-MLX-109',
        expiryDate: new Date(now + 12 * dayMs), // Expiring in 12 days
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'DHPP 5-in-1 Canine Core Vaccine (Vanguard)',
        category: 'Vaccines',
        price: 2600.00,
        stockQuantity: 45,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-DHP-991',
        expiryDate: new Date(now + 380 * dayMs),
        unit: 'Vial',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Feline FVRCP Tricat Core Vaccine',
        category: 'Vaccines',
        price: 2500.00,
        stockQuantity: 30,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-FVR-220',
        expiryDate: new Date(now + 290 * dayMs),
        unit: 'Vial',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Broad-Spectrum Dewormer Tablets (Drontal Plus)',
        category: 'Healthcare',
        price: 850.00,
        stockQuantity: 80,
        supplier: 'MediVet Pharmaceuticals',
        batchNo: 'BTH-DRN-331',
        expiryDate: new Date(now + 500 * dayMs),
        unit: 'Pack',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Hydrocortisone Neomycin Ophthalmic Ointment',
        category: 'Medicines',
        price: 1650.00,
        stockQuantity: 18,
        supplier: 'MediVet Pharmaceuticals',
        batchNo: 'BTH-OPH-704',
        expiryDate: new Date(now + 19 * dayMs), // Expiring in 19 days
        unit: 'Tube',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Surgical Sterile Gauze & Elastic Bandage Kit',
        category: 'Clinical Supplies',
        price: 950.00,
        stockQuantity: 50,
        supplier: 'Premier Surgical & Medical Imports',
        batchNo: 'BTH-GAU-102',
        expiryDate: new Date(now + 700 * dayMs),
        unit: 'Pack',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Feline Urine Diagnostic Test Strips (100 Strips)',
        category: 'Clinical Supplies',
        price: 4500.00,
        stockQuantity: 10,
        supplier: 'BioMed Diagnostics Lanka',
        batchNo: 'BTH-BIO-509',
        expiryDate: new Date(now + 210 * dayMs),
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Calcium & Phosphorus Bone Density Chewables',
        category: 'Supplements',
        price: 2100.00,
        stockQuantity: 30,
        supplier: 'Ceylon Pet Supplies',
        batchNo: 'BTH-CAL-601',
        expiryDate: new Date(now + 360 * dayMs),
        unit: 'Bottle',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Royal Canin Veterinary Renal Support Cat Food (2kg)',
        category: 'Nutrition',
        price: 5400.00,
        stockQuantity: 8,
        supplier: 'NutriCare Animal Nutrition',
        batchNo: 'BTH-REN-881',
        expiryDate: new Date(now + 200 * dayMs),
        unit: 'Bag',
        imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80'
      }
    ]);
    console.log(`✅ Seeded ${products.length} pharmacy items with LKR pricing and batch controls.`);

    // 5. SEED PET PATIENTS (10 Diverse Patients with Medical Logs & Passports)
    console.log('\n🐕 Seeding Pet Patients & Electronic Medical Passports...');
    const pets = await Pet.create([
      {
        uniquePin: 'PET-1024',
        petName: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 28.5,
        gender: 'Male',
        ownerId: clients[0]._id,
        ownerName: clients[0].name,
        ownerPhone: clients[0].phone,
        ownerEmail: clients[0].email,
        status: 'Medical Care',
        clinicStatus: 'Checked-In',
        medicalLogs: [
          {
            date: new Date(now - 60 * dayMs),
            diagnosis: 'Annual Clinical Health Screen & Microchip Validation',
            treatment: 'Administered Rabisin Rabies Booster & Oral Dewormer',
            treatmentNotes: 'Excellent cardiopulmonary sounds. Heartworm antigen test negative. Teeth tartar Stage 1.',
            medicinesPrescribed: ['Rabisin Booster 1ml', 'Drontal Plus 3 Tabs'],
            nextVisitDate: new Date(now + 300 * dayMs),
            vaccineName: 'Rabisin Rabies Booster',
            vetDoctor: 'Dr. Perera (Senior Vet)',
            vetName: 'Dr. Perera (Senior Vet)'
          },
          {
            date: new Date(now - 10 * dayMs),
            diagnosis: 'Superficial Hotspot Dermatitis (Flank Region)',
            treatment: 'Shaved area, applied Chlorhexidine antiseptic and topical hydrocortisone',
            treatmentNotes: 'E-collar advised for 5 days. Keep area dry. Oral antihistamines for pruritus.',
            medicinesPrescribed: ['Chlorhexidine 2% Spray', 'Dermotic Topical Foam'],
            nextVisitDate: new Date(now + 14 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Fernando (Vet Surgeon)',
            vetName: 'Dr. Fernando (Vet Surgeon)'
          }
        ]
      },
      {
        uniquePin: 'PET-2051',
        petName: 'Luna',
        species: 'Cat',
        breed: 'Persian Longhair',
        age: 2,
        weight: 4.1,
        gender: 'Female',
        ownerId: clients[0]._id,
        ownerName: clients[0].name,
        ownerPhone: clients[0].phone,
        ownerEmail: clients[0].email,
        status: 'Medical Care',
        clinicStatus: 'In Consultation',
        medicalLogs: [
          {
            date: new Date(now - 30 * dayMs),
            diagnosis: 'Bilateral Otitis Externa (Ear Mites)',
            treatment: 'Deep ear canal cleansing & Otic Clear antibiotic/antiparasitic drops',
            treatmentNotes: 'Instill 3 drops bid for 7 days. Repeat otoscopic inspection in 2 weeks.',
            medicinesPrescribed: ['Otic Clear Auricular Drops 15ml'],
            nextVisitDate: new Date(now + 7 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Silva (Consultant Physician)',
            vetName: 'Dr. Silva (Consultant Physician)'
          }
        ]
      },
      {
        uniquePin: 'PET-3112',
        petName: 'Maximus',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 4,
        weight: 34.0,
        gender: 'Male',
        ownerId: clients[1]._id,
        ownerName: clients[1].name,
        ownerPhone: clients[1].phone,
        ownerEmail: clients[1].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: [
          {
            date: new Date(now - 45 * dayMs),
            diagnosis: 'Routine Vaccination & Orthopedic Gait Evaluation',
            treatment: 'Administered Vanguard DHPP 5-in-1 core vaccine booster',
            treatmentNotes: 'Hips and stifles sound. Normal range of motion. Body score 5/9 optimal.',
            medicinesPrescribed: ['Vanguard Plus 5/CV', 'Bravecto 20-40kg'],
            nextVisitDate: new Date(now + 320 * dayMs),
            vaccineName: 'Vanguard 5-in-1',
            vetDoctor: 'Dr. Perera (Senior Vet)',
            vetName: 'Dr. Perera (Senior Vet)'
          }
        ]
      },
      {
        uniquePin: 'PET-4089',
        petName: 'Milo',
        species: 'Cat',
        breed: 'Siamese',
        age: 1,
        weight: 3.5,
        gender: 'Male',
        ownerId: clients[2]._id,
        ownerName: clients[2].name,
        ownerPhone: clients[2].phone,
        ownerEmail: clients[2].email,
        status: 'Medical Care',
        clinicStatus: 'Under Observation',
        medicalLogs: [
          {
            date: new Date(now - 15 * dayMs),
            diagnosis: 'Submandibular Abscess & Minor Laceration',
            treatment: 'Surgical lancing under sedation, saline lavage, and drain placement',
            treatmentNotes: 'Wound dressing changed. Amoxicillin oral suspension prescribed for 7 days.',
            medicinesPrescribed: ['Amoxicillin Clavulanate 15ml', 'Meloxicam Oral'],
            nextVisitDate: new Date(now + 5 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Fernando (Vet Surgeon)',
            vetName: 'Dr. Fernando (Vet Surgeon)'
          }
        ]
      },
      {
        uniquePin: 'PET-5120',
        petName: 'Bella',
        species: 'Dog',
        breed: 'Labrador Retriever',
        age: 5,
        weight: 31.2,
        gender: 'Female',
        ownerId: clients[3]._id,
        ownerName: clients[3].name,
        ownerPhone: clients[3].phone,
        ownerEmail: clients[3].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: [
          {
            date: new Date(now - 25 * dayMs),
            diagnosis: 'Dental Calculus & Mild Gingivitis',
            treatment: 'Ultrasonic dental scaling and polishing under general anaesthesia',
            treatmentNotes: 'Gingival pocket depth < 2mm. No extractions indicated. Home dental wash advised.',
            medicinesPrescribed: ['Chlorhexidine Oral Gel', 'Joint Glucosamine Tablets'],
            nextVisitDate: new Date(now + 180 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Silva (Consultant Physician)',
            vetName: 'Dr. Silva (Consultant Physician)'
          }
        ]
      },
      {
        uniquePin: 'PET-6190',
        petName: 'Charlie',
        species: 'Dog',
        breed: 'Shih Tzu',
        age: 3,
        weight: 7.2,
        gender: 'Male',
        ownerId: clients[4]._id,
        ownerName: clients[4].name,
        ownerPhone: clients[4].phone,
        ownerEmail: clients[4].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: []
      },
      {
        uniquePin: 'PET-7215',
        petName: 'Coco',
        species: 'Bird',
        breed: 'Cockatiel',
        age: 2,
        weight: 0.12,
        gender: 'Unknown',
        ownerId: clients[5]._id,
        ownerName: clients[5].name,
        ownerPhone: clients[5].phone,
        ownerEmail: clients[5].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: [
          {
            date: new Date(now - 40 * dayMs),
            diagnosis: 'Avian Wing Trim & Beak Evaluation',
            treatment: 'Flight feather cosmetic shaping and nutritional vitamin drops',
            treatmentNotes: 'Crop empty and clear. Excellent feather lustre. Cuttlefish bone provided.',
            medicinesPrescribed: ['Avian Liquid Multivitamin 30ml'],
            nextVisitDate: new Date(now + 120 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Perera (Senior Vet)',
            vetName: 'Dr. Perera (Senior Vet)'
          }
        ]
      },
      {
        uniquePin: 'PET-8340',
        petName: 'Oreo',
        species: 'Rabbit',
        breed: 'Netherland Dwarf',
        age: 1,
        weight: 1.4,
        gender: 'Male',
        ownerId: clients[1]._id,
        ownerName: clients[1].name,
        ownerPhone: clients[1].phone,
        ownerEmail: clients[1].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: []
      },
      {
        uniquePin: 'PET-9105',
        petName: 'Rocky',
        species: 'Dog',
        breed: 'Beagle',
        age: 2,
        weight: 12.8,
        gender: 'Male',
        ownerId: clients[2]._id,
        ownerName: clients[2].name,
        ownerPhone: clients[2].phone,
        ownerEmail: clients[2].email,
        status: 'Medical Care',
        clinicStatus: 'In Consultation',
        medicalLogs: [
          {
            date: new Date(now - 8 * dayMs),
            diagnosis: 'Mild Gastroenteritis (Dietary Indiscretion)',
            treatment: 'Subcutaneous electrolyte fluid therapy, anti-emetic, and probiotic paste',
            treatmentNotes: 'Bland gastrointestinal diet for 3 days. Free access to fresh water.',
            medicinesPrescribed: ['Metoclopramide Drops', 'Protexin Pro-Kolin Paste'],
            nextVisitDate: new Date(now + 6 * dayMs),
            vaccineName: '',
            vetDoctor: 'Dr. Silva (Consultant Physician)',
            vetName: 'Dr. Silva (Consultant Physician)'
          }
        ]
      },
      {
        uniquePin: 'PET-9822',
        petName: 'Simba',
        species: 'Cat',
        breed: 'Domestic Shorthair',
        age: 3,
        weight: 4.8,
        gender: 'Male',
        ownerId: clients[3]._id,
        ownerName: clients[3].name,
        ownerPhone: clients[3].phone,
        ownerEmail: clients[3].email,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: []
      }
    ]);
    console.log(`✅ Seeded ${pets.length} clinical pet records.`);

    // 6. SEED CLINICAL APPOINTMENTS (12+ Bookings across Vets and Dates)
    console.log('\n📅 Seeding Doctor Consultation Schedule & Appointments...');
    const appointments = await Appointment.create([
      {
        petId: pets[0]._id, // Buddy
        customerId: clients[0]._id,
        serviceType: 'Vaccination & Immunization',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date(now - 5 * dayMs),
        timeSlot: '09:00 AM',
        status: 'Completed',
        notes: 'Annual DHPP core vaccination completed successfully'
      },
      {
        petId: pets[1]._id, // Luna
        customerId: clients[0]._id,
        serviceType: 'Clinical Diagnostics & Laboratory',
        assignedStaff: 'Dr. Silva (Consultant Physician)',
        appointmentDate: new Date(now - 2 * dayMs),
        timeSlot: '11:00 AM',
        status: 'Completed',
        notes: 'Ear mite swab microscopy completed; responsive to treatment'
      },
      {
        petId: pets[2]._id, // Maximus
        customerId: clients[1]._id,
        serviceType: 'General Veterinary Consultation',
        assignedStaff: 'Dr. Fernando (Vet Surgeon)',
        appointmentDate: new Date(now - 1 * dayMs),
        timeSlot: '02:00 PM',
        status: 'Completed',
        notes: 'Orthopedic evaluation and joint supplement endorsement'
      },
      {
        petId: pets[3]._id, // Milo
        customerId: clients[2]._id,
        serviceType: 'Surgical Wound Dressing',
        assignedStaff: 'Dr. Fernando (Vet Surgeon)',
        appointmentDate: new Date(now), // Today
        timeSlot: '09:30 AM',
        status: 'Confirmed',
        notes: 'Submandibular wound dressing change and suture inspection'
      },
      {
        petId: pets[8]._id, // Rocky
        customerId: clients[2]._id,
        serviceType: 'General Veterinary Consultation',
        assignedStaff: 'Dr. Silva (Consultant Physician)',
        appointmentDate: new Date(now), // Today
        timeSlot: '01:00 PM',
        status: 'Confirmed',
        notes: 'Gastroenteritis follow-up consult'
      },
      {
        petId: pets[4]._id, // Bella
        customerId: clients[3]._id,
        serviceType: 'Dental Scaling & Oral Surgery',
        assignedStaff: 'Dr. Silva (Consultant Physician)',
        appointmentDate: new Date(now + 1 * dayMs), // Tomorrow
        timeSlot: '10:00 AM',
        status: 'Confirmed',
        notes: 'Post-scaling checkup and oral rinse review'
      },
      {
        petId: pets[5]._id, // Charlie
        customerId: clients[4]._id,
        serviceType: 'General Veterinary Consultation',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date(now + 2 * dayMs),
        timeSlot: '03:00 PM',
        status: 'Pending',
        notes: 'Routine biannual physical checkup'
      },
      {
        petId: pets[6]._id, // Coco
        customerId: clients[5]._id,
        serviceType: 'General Veterinary Consultation',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date(now + 3 * dayMs),
        timeSlot: '04:00 PM',
        status: 'Pending',
        notes: 'Feather trim checkup and avian wellness consult'
      },
      {
        petId: pets[7]._id, // Oreo
        customerId: clients[1]._id,
        serviceType: 'Emergency Clinical Care',
        assignedStaff: 'Dr. Fernando (Vet Surgeon)',
        appointmentDate: new Date(now + 4 * dayMs),
        timeSlot: '11:00 AM',
        status: 'Confirmed',
        notes: 'Incisor malocclusion dental filing'
      },
      {
        petId: pets[9]._id, // Simba
        customerId: clients[3]._id,
        serviceType: 'Vaccination & Immunization',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date(now + 5 * dayMs),
        timeSlot: '09:00 AM',
        status: 'Confirmed',
        notes: 'Feline FVRCP Tricat core booster'
      },
      {
        petId: pets[0]._id, // Buddy
        customerId: clients[0]._id,
        serviceType: 'General Veterinary Consultation',
        assignedStaff: 'Dr. Silva (Consultant Physician)',
        appointmentDate: new Date(now - 7 * dayMs),
        timeSlot: '03:00 PM',
        status: 'Cancelled',
        cancelledAt: new Date(now - 8 * dayMs),
        notes: 'Owner rescheduled due to travel commitment'
      },
      {
        petId: pets[2]._id, // Maximus
        customerId: clients[1]._id,
        serviceType: 'Dental Scaling & Oral Surgery',
        assignedStaff: 'Dr. Fernando (Vet Surgeon)',
        appointmentDate: new Date(now - 12 * dayMs),
        timeSlot: '10:00 AM',
        status: 'Cancelled',
        cancelledAt: new Date(now - 13 * dayMs),
        notes: 'Patient was on concurrent medication; deferred by vet'
      }
    ]);
    console.log(`✅ Seeded ${appointments.length} clinical appointments across past, today, and future slots.`);

    // 7. SEED INVOICES & FINANCIAL SALES LEDGER (12+ Invoices)
    console.log('\n🧾 Seeding POS Billing Transactions & Historical Financial Ledger...');
    const invoices = await Invoice.create([
      {
        invoiceNo: 'INV-2026-0101',
        customerId: clients[0]._id,
        customerName: clients[0].name,
        customerPhone: clients[0].phone,
        customerEmail: clients[0].email,
        items: [
          {
            product: products[0]._id,
            itemName: products[0].itemName,
            unitPrice: products[0].price,
            quantity: 1,
            subtotal: 2200.00
          },
          {
            product: null,
            itemName: 'Rabies Vaccination & Health Endorsement',
            unitPrice: 2000.00,
            quantity: 1,
            subtotal: 2000.00
          },
          {
            product: products[6]._id,
            itemName: products[6].itemName,
            unitPrice: products[6].price,
            quantity: 1,
            subtotal: 2800.00
          }
        ],
        totalAmount: 7000.00,
        discountRate: 5,
        discountAmount: 350.00,
        taxRate: 8,
        taxAmount: 532.00,
        finalTotal: 7182.00,
        paymentMethod: 'Cash',
        tenderedAmount: 8000.00,
        changeAmount: 818.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 14 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0102',
        customerId: clients[1]._id,
        customerName: clients[1].name,
        customerPhone: clients[1].phone,
        customerEmail: clients[1].email,
        items: [
          {
            product: products[2]._id, // Royal Canin Maxi
            itemName: products[2].itemName,
            unitPrice: products[2].price,
            quantity: 1,
            subtotal: 16500.00
          },
          {
            product: products[1]._id, // Bravecto
            itemName: products[1].itemName,
            unitPrice: products[1].price,
            quantity: 1,
            subtotal: 6800.00
          }
        ],
        totalAmount: 23300.00,
        discountRate: 10,
        discountAmount: 2330.00,
        taxRate: 8,
        taxAmount: 1677.60,
        finalTotal: 22647.60,
        paymentMethod: 'Card',
        tenderedAmount: 22647.60,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 10 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0103',
        customerId: clients[2]._id,
        customerName: clients[2].name,
        customerPhone: clients[2].phone,
        customerEmail: clients[2].email,
        items: [
          {
            product: null,
            itemName: 'Surgical Wound Dressing & Bandaging',
            unitPrice: 1800.00,
            quantity: 1,
            subtotal: 1800.00
          },
          {
            product: products[4]._id, // Amoxicillin
            itemName: products[4].itemName,
            unitPrice: products[4].price,
            quantity: 2,
            subtotal: 2900.00
          },
          {
            product: products[5]._id, // Chlorhexidine
            itemName: products[5].itemName,
            unitPrice: products[5].price,
            quantity: 1,
            subtotal: 1850.00
          }
        ],
        totalAmount: 6550.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 524.00,
        finalTotal: 7074.00,
        paymentMethod: 'Cash',
        tenderedAmount: 10000.00,
        changeAmount: 2926.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 7 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0104',
        customerId: clients[3]._id,
        customerName: clients[3].name,
        customerPhone: clients[3].phone,
        customerEmail: clients[3].email,
        items: [
          {
            product: null,
            itemName: 'Dental Scaling & Oral Debridement',
            unitPrice: 3500.00,
            quantity: 1,
            subtotal: 3500.00
          },
          {
            product: products[10]._id, // Drontal
            itemName: products[10].itemName,
            unitPrice: products[10].price,
            quantity: 2,
            subtotal: 1700.00
          }
        ],
        totalAmount: 5200.00,
        discountRate: 5,
        discountAmount: 260.00,
        taxRate: 8,
        taxAmount: 395.20,
        finalTotal: 5335.20,
        paymentMethod: 'Online',
        tenderedAmount: 5335.20,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 5 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0105',
        customerId: clients[4]._id,
        customerName: clients[4].name,
        customerPhone: clients[4].phone,
        customerEmail: clients[4].email,
        items: [
          {
            product: null,
            itemName: 'General Veterinary Consultation',
            unitPrice: 1500.00,
            quantity: 1,
            subtotal: 1500.00
          },
          {
            product: products[6]._id, // Multivitamin
            itemName: products[6].itemName,
            unitPrice: products[6].price,
            quantity: 1,
            subtotal: 2800.00
          }
        ],
        totalAmount: 4300.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 344.00,
        finalTotal: 4644.00,
        paymentMethod: 'Cash',
        tenderedAmount: 5000.00,
        changeAmount: 356.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 3 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0106',
        customerId: clients[5]._id,
        customerName: clients[5].name,
        customerPhone: clients[5].phone,
        customerEmail: clients[5].email,
        items: [
          {
            product: products[8]._id, // DHPP
            itemName: products[8].itemName,
            unitPrice: products[8].price,
            quantity: 1,
            subtotal: 2600.00
          },
          {
            product: products[10]._id, // Drontal
            itemName: products[10].itemName,
            unitPrice: products[10].price,
            quantity: 1,
            subtotal: 850.00
          }
        ],
        totalAmount: 3450.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 276.00,
        finalTotal: 3726.00,
        paymentMethod: 'Card',
        tenderedAmount: 3726.00,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 2 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0107',
        customerId: clients[0]._id,
        customerName: clients[0].name,
        customerPhone: clients[0].phone,
        customerEmail: clients[0].email,
        items: [
          {
            product: products[3]._id, // Whiskas
            itemName: products[3].itemName,
            unitPrice: products[3].price,
            quantity: 2,
            subtotal: 6400.00
          },
          {
            product: products[9]._id, // Tricat
            itemName: products[9].itemName,
            unitPrice: products[9].price,
            quantity: 1,
            subtotal: 2500.00
          }
        ],
        totalAmount: 8900.00,
        discountRate: 5,
        discountAmount: 445.00,
        taxRate: 8,
        taxAmount: 676.40,
        finalTotal: 9131.40,
        paymentMethod: 'Cash',
        tenderedAmount: 10000.00,
        changeAmount: 868.60,
        paymentStatus: 'Paid',
        createdAt: new Date(now - 1 * dayMs)
      },
      {
        invoiceNo: 'INV-2026-0108',
        customerId: clients[1]._id,
        customerName: clients[1].name,
        customerPhone: clients[1].phone,
        customerEmail: clients[1].email,
        items: [
          {
            product: null,
            itemName: 'Clinical Diagnostics & Complete Hemogram',
            unitPrice: 4200.00,
            quantity: 1,
            subtotal: 4200.00
          },
          {
            product: products[7]._id, // Meloxicam
            itemName: products[7].itemName,
            unitPrice: products[7].price,
            quantity: 1,
            subtotal: 3400.00
          }
        ],
        totalAmount: 7600.00,
        discountRate: 10,
        discountAmount: 760.00,
        taxRate: 8,
        taxAmount: 547.20,
        finalTotal: 7387.20,
        paymentMethod: 'Online',
        tenderedAmount: 7387.20,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now) // Today
      },
      {
        invoiceNo: 'INV-2026-0109',
        customerId: clients[2]._id,
        customerName: clients[2].name,
        customerPhone: clients[2].phone,
        customerEmail: clients[2].email,
        items: [
          {
            product: products[15]._id, // Royal Canin Renal Cat
            itemName: products[15].itemName,
            unitPrice: products[15].price,
            quantity: 1,
            subtotal: 5400.00
          }
        ],
        totalAmount: 5400.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 432.00,
        finalTotal: 5832.00,
        paymentMethod: 'Cash',
        tenderedAmount: 6000.00,
        changeAmount: 168.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now) // Today
      },
      {
        invoiceNo: 'INV-2026-0110',
        customerId: clients[3]._id,
        customerName: clients[3].name,
        customerPhone: clients[3].phone,
        customerEmail: clients[3].email,
        items: [
          {
            product: null,
            itemName: 'Emergency Clinical Triage & Stabilization',
            unitPrice: 5000.00,
            quantity: 1,
            subtotal: 5000.00
          },
          {
            product: products[12]._id, // Sterile Gauze Kit
            itemName: products[12].itemName,
            unitPrice: products[12].price,
            quantity: 2,
            subtotal: 1900.00
          }
        ],
        totalAmount: 6900.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 552.00,
        finalTotal: 7452.00,
        paymentMethod: 'Card',
        tenderedAmount: 7452.00,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now) // Today
      },
      {
        invoiceNo: 'INV-2026-0111',
        customerId: clients[4]._id,
        customerName: clients[4].name,
        customerPhone: clients[4].phone,
        customerEmail: clients[4].email,
        items: [
          {
            product: products[14]._id, // Calcium Chewables
            itemName: products[14].itemName,
            unitPrice: products[14].price,
            quantity: 1,
            subtotal: 2100.00
          },
          {
            product: products[10]._id, // Drontal
            itemName: products[10].itemName,
            unitPrice: products[10].price,
            quantity: 1,
            subtotal: 850.00
          }
        ],
        totalAmount: 2950.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 236.00,
        finalTotal: 3186.00,
        paymentMethod: 'Cash',
        tenderedAmount: 3500.00,
        changeAmount: 314.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now) // Today
      },
      {
        invoiceNo: 'INV-2026-0112',
        customerId: clients[5]._id,
        customerName: clients[5].name,
        customerPhone: clients[5].phone,
        customerEmail: clients[5].email,
        items: [
          {
            product: products[1]._id, // Bravecto
            itemName: products[1].itemName,
            unitPrice: products[1].price,
            quantity: 1,
            subtotal: 6800.00
          }
        ],
        totalAmount: 6800.00,
        discountRate: 5,
        discountAmount: 340.00,
        taxRate: 8,
        taxAmount: 516.80,
        finalTotal: 6976.80,
        paymentMethod: 'Card',
        tenderedAmount: 6976.80,
        changeAmount: 0.00,
        paymentStatus: 'Paid',
        createdAt: new Date(now) // Today
      }
    ]);
    console.log(`✅ Seeded ${invoices.length} POS sales invoices.`);

    // TOTAL FINANCIAL COMPUTATION
    const totalSalesVolume = invoices.reduce((sum, inv) => sum + inv.finalTotal, 0);

    console.log('\n===============================================================');
    console.log('🎉 ATLAS CLUSTER POPULATION SUMMARY');
    console.log('===============================================================');
    console.log(`👥 Total Users Created       : ${clients.length + 6}`);
    console.log(`🏢 Total Clinical Suppliers  : ${suppliers.length}`);
    console.log(`💊 Total Pharmacy Products   : ${products.length} (Includes Low Stock & Expiry items)`);
    console.log(`🐕 Total Registered Pets     : ${pets.length} (With Passports & Treatment Records)`);
    console.log(`📅 Total Appointments        : ${appointments.length} (Past, Today, and Future)`);
    console.log(`🧾 Total Invoices Seeded     : ${invoices.length}`);
    console.log(`💰 Total Sales Volume Seeded : Rs. ${totalSalesVolume.toFixed(2)}`);
    console.log('===============================================================');
    console.log('🌟 All MongoDB Atlas tables populated with clean, enterprise data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during Atlas database seeding:', error);
    process.exit(1);
  }
};

seedAtlas();
