/**
 * ============================================================================
 * DATABASE SEEDER SCRIPT (seed.js)
 * ============================================================================
 * Populates MongoDB Atlas / Local MongoDB with realistic veterinary clinic
 * patient profiles, pharmacy inventory (with LKR prices), appointments,
 * and POS sales invoices.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Pet = require('./models/Pet');
const Product = require('./models/Product');
const Appointment = require('./models/Appointment');
const Invoice = require('./models/Invoice');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pet_shop_db';

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log(`[Seeder] Connected successfully: ${mongoose.connection.host}`);

    // 1. CLEAR EXISTING COLLECTIONS
    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Product.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});

    // 2. SEED SYSTEM USERS
    console.log('[Seeder] Creating sample system users...');
    const adminUser = await User.create({
      name: 'Dr. Perera (Chief Veterinarian)',
      email: 'admin@4pawclinic.lk',
      password: 'password123',
      role: 'Admin'
    });

    const customerUser = await User.create({
      name: 'Nimal Perera',
      email: 'nimal.perera@gmail.com',
      password: 'password123',
      role: 'Customer'
    });

    // 3. SEED PET PATIENTS
    console.log('[Seeder] Registering clinical pet patients...');
    const pets = await Pet.create([
      {
        uniquePin: 'PET-1024',
        petName: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 28.5,
        ownerId: customerUser._id,
        status: 'Medical Care',
        clinicStatus: 'Checked-In',
        medicalLogs: [
          {
            date: new Date('2026-02-15'),
            diagnosis: 'Annual Health Checkup & Parasite Screen',
            treatment: 'Administered Rabies Vaccine Booster & Oral Dewormer',
            vaccineName: 'Rabisin Rabies Booster',
            vetDoctor: 'Dr. Perera (Senior Vet)'
          },
          {
            date: new Date('2026-03-01'),
            diagnosis: 'Mild Skin Allergy / Hotspot',
            treatment: 'Topical Antiseptic Spray & Medicated Shampoo Bath',
            vaccineName: '',
            vetDoctor: 'Dr. Fernando (Vet Surgeon)'
          }
        ]
      },
      {
        uniquePin: 'PET-2051',
        petName: 'Luna',
        species: 'Cat',
        breed: 'Persian',
        age: 2,
        weight: 4.2,
        ownerId: customerUser._id,
        status: 'Medical Care',
        clinicStatus: 'In Consultation',
        medicalLogs: [
          {
            date: new Date('2026-03-05'),
            diagnosis: 'Ear Mite Infection (Otitis Externa)',
            treatment: 'Ear Canal Cleansing & Antibacterial Ear Drops (7 Days)',
            vaccineName: '',
            vetDoctor: 'Dr. Perera (Senior Vet)'
          }
        ]
      },
      {
        uniquePin: 'PET-3112',
        petName: 'Rocky',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 4,
        weight: 32.0,
        ownerId: customerUser._id,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: [
          {
            date: new Date('2026-01-20'),
            diagnosis: 'Post-Operative Wound Inspection',
            treatment: 'Suture Removal & Ointment Dressing',
            vaccineName: '',
            vetDoctor: 'Dr. Fernando (Vet Surgeon)'
          }
        ]
      },
      {
        uniquePin: 'PET-4029',
        petName: 'Milo',
        species: 'Cat',
        breed: 'Domestic Shorthair',
        age: 1,
        weight: 3.5,
        ownerId: customerUser._id,
        status: 'Available',
        clinicStatus: 'Registered',
        medicalLogs: []
      },
      {
        uniquePin: 'PET-5088',
        petName: 'Bella',
        species: 'Dog',
        breed: 'Beagle',
        age: 2,
        weight: 12.0,
        ownerId: customerUser._id,
        status: 'Medical Care',
        clinicStatus: 'Checked-In',
        medicalLogs: [
          {
            date: new Date('2026-02-28'),
            diagnosis: 'Dental Scaling & Tartar Cleanup',
            treatment: 'Ultrasonic Scaling & Antibiotic Course',
            vaccineName: '',
            vetDoctor: 'Dr. Perera (Senior Vet)'
          }
        ]
      },
      {
        uniquePin: 'PET-6190',
        petName: 'Charlie',
        species: 'Dog',
        breed: 'Shih Tzu',
        age: 5,
        weight: 7.8,
        ownerId: customerUser._id,
        status: 'Available',
        clinicStatus: 'Discharged',
        medicalLogs: []
      }
    ]);

    // 4. SEED PHARMACY & INVENTORY PRODUCTS (LKR)
    console.log('[Seeder] Seeding pharmacy & inventory catalog (LKR prices)...');
    const products = await Product.create([
      {
        itemName: 'Rabies Vaccine (Rabisin)',
        category: 'Healthcare',
        price: 2200.00,
        stockQuantity: 15,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-2026-01',
        expiryDate: new Date('2027-03-31'),
        unit: 'Vial'
      },
      {
        itemName: 'Bravecto Chewable (Dogs 20-40kg)',
        category: 'Healthcare',
        price: 6800.00,
        stockQuantity: 3, // Low Stock Alert
        supplier: 'Ceylon Pet Supplies',
        batchNo: 'BTH-2026-04',
        expiryDate: new Date('2026-09-30'),
        unit: 'Pack'
      },
      {
        itemName: 'Royal Canin Maxi Adult (15kg)',
        category: 'Food',
        price: 16500.00,
        stockQuantity: 8,
        supplier: 'Pet Care Importers',
        batchNo: 'BTH-2026-02',
        expiryDate: new Date('2026-12-15'),
        unit: 'Bag'
      },
      {
        itemName: 'Whiskas Ocean Fish (3kg)',
        category: 'Food',
        price: 3200.00,
        stockQuantity: 2, // Low Stock Alert
        supplier: 'Ceylon Pet Supplies',
        batchNo: 'BTH-2026-05',
        expiryDate: new Date('2026-11-20'),
        unit: 'Bag'
      },
      {
        itemName: 'Amoxicillin Clavulanate Drops (15ml)',
        category: 'Healthcare',
        price: 1450.00,
        stockQuantity: 12,
        supplier: 'MediVet Supplies',
        batchNo: 'BTH-2026-03',
        expiryDate: new Date('2026-08-31'),
        unit: 'Bottle'
      },
      {
        itemName: 'Antiseptic Flea & Tick Shampoo (500ml)',
        category: 'Grooming Supplies',
        price: 1850.00,
        stockQuantity: 18,
        supplier: 'Pet Care Importers',
        batchNo: 'BTH-2026-06',
        expiryDate: new Date('2027-06-30'),
        unit: 'Bottle'
      },
      {
        itemName: 'Multivitamin & Mineral Chew Tablets',
        category: 'Healthcare',
        price: 2800.00,
        stockQuantity: 25,
        supplier: 'VetMed Lanka Ltd',
        batchNo: 'BTH-2026-07',
        expiryDate: new Date('2027-04-15'),
        unit: 'Bottle'
      },
      {
        itemName: 'Interactive Feather Wand Cat Toy',
        category: 'Toys',
        price: 950.00,
        stockQuantity: 30,
        supplier: 'Pet Care Importers',
        batchNo: 'BTH-2026-08',
        expiryDate: null,
        unit: 'Piece'
      }
    ]);

    // 5. SEED APPOINTMENTS
    console.log('[Seeder] Scheduling clinical appointments...');
    await Appointment.create([
      {
        petId: pets[0]._id, // Buddy
        customerId: customerUser._id,
        serviceType: 'Vaccination',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date('2026-09-10'),
        timeSlot: '09:30 AM',
        status: 'Confirmed',
        notes: 'Annual Rabies & DHPP booster shot scheduled'
      },
      {
        petId: pets[1]._id, // Luna
        customerId: customerUser._id,
        serviceType: 'Veterinary Checkup',
        assignedStaff: 'Dr. Perera (Senior Vet)',
        appointmentDate: new Date('2026-09-11'),
        timeSlot: '11:00 AM',
        status: 'Confirmed',
        notes: 'Follow-up inspection for ear mite infection'
      },
      {
        petId: pets[3]._id, // Milo
        customerId: customerUser._id,
        serviceType: 'Grooming & Bath',
        assignedStaff: 'Staff Groomer (Saman)',
        appointmentDate: new Date('2026-09-12'),
        timeSlot: '02:00 PM',
        status: 'Pending',
        notes: 'Full medicated bath and nail trimming'
      },
      {
        petId: pets[4]._id, // Bella
        customerId: customerUser._id,
        serviceType: 'General Consultation',
        assignedStaff: 'Dr. Fernando (Vet Surgeon)',
        appointmentDate: new Date('2026-09-14'),
        timeSlot: '04:30 PM',
        status: 'Confirmed',
        notes: 'Dietary counseling and weight checkup'
      }
    ]);

    // 6. SEED POS INVOICES (Total Sales Revenue > Rs. 40,000.00)
    console.log('[Seeder] Generating POS billing invoices...');
    await Invoice.create([
      {
        invoiceNo: 'INV-2026-001',
        customerId: customerUser._id,
        items: [
          {
            product: products[2]._id, // Royal Canin Maxi Adult
            itemName: 'Royal Canin Maxi Adult (15kg)',
            unitPrice: 16500.00,
            quantity: 1,
            subtotal: 16500.00
          },
          {
            product: products[1]._id, // Bravecto Chewable
            itemName: 'Bravecto Chewable (Dogs 20-40kg)',
            unitPrice: 6800.00,
            quantity: 1,
            subtotal: 6800.00
          }
        ],
        totalAmount: 23300.00,
        discountRate: 10,
        discountAmount: 2330.00,
        taxRate: 0,
        taxAmount: 0.00,
        finalTotal: 20970.00,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid'
      },
      {
        invoiceNo: 'INV-2026-002',
        customerId: customerUser._id,
        items: [
          {
            product: products[0]._id, // Rabies Vaccine
            itemName: 'Rabies Vaccine (Rabisin)',
            unitPrice: 2200.00,
            quantity: 1,
            subtotal: 2200.00
          },
          {
            product: products[5]._id, // Flea Shampoo
            itemName: 'Antiseptic Flea & Tick Shampoo (500ml)',
            unitPrice: 1850.00,
            quantity: 2,
            subtotal: 3700.00
          },
          {
            product: products[6]._id, // Multivitamin
            itemName: 'Multivitamin & Mineral Chew Tablets',
            unitPrice: 2800.00,
            quantity: 1,
            subtotal: 2800.00
          }
        ],
        totalAmount: 8700.00,
        discountRate: 0,
        discountAmount: 0.00,
        taxRate: 8,
        taxAmount: 696.00,
        finalTotal: 9396.00,
        paymentMethod: 'Card',
        paymentStatus: 'Paid'
      },
      {
        invoiceNo: 'INV-2026-003',
        customerId: customerUser._id,
        items: [
          {
            product: products[3]._id, // Whiskas Ocean Fish
            itemName: 'Whiskas Ocean Fish (3kg)',
            unitPrice: 3200.00,
            quantity: 2,
            subtotal: 6400.00
          },
          {
            product: products[7]._id, // Wand Toy
            itemName: 'Interactive Feather Wand Cat Toy',
            unitPrice: 950.00,
            quantity: 2,
            subtotal: 1900.00
          },
          {
            product: products[4]._id, // Amoxicillin Drops
            itemName: 'Amoxicillin Clavulanate Drops (15ml)',
            unitPrice: 1450.00,
            quantity: 2,
            subtotal: 2900.00
          }
        ],
        totalAmount: 11200.00,
        discountRate: 5,
        discountAmount: 560.00,
        taxRate: 0,
        taxAmount: 0.00,
        finalTotal: 10640.00,
        paymentMethod: 'Online',
        paymentStatus: 'Paid'
      }
    ]);

    console.log('\n=======================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('-------------------------------------------------------');
    console.log('🐶 Pets Seeded: 6 Patients (Buddy, Luna, Rocky, Milo, Bella, Charlie)');
    console.log('💊 Inventory Seeded: 8 Products (LKR Pricing)');
    console.log('📅 Appointments Seeded: 4 Clinical Bookings');
    console.log('💳 Invoices Seeded: 3 Sales (Total Revenue: Rs. 41,006.00)');
    console.log('=======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
