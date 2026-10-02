/**
 * ============================================================================
 * 4 PAW ANIMAL CLINIC — VIVA OFFICIAL CLINICAL CREDENTIALS SEEDER
 * ============================================================================
 * Creates and verifies the 5 official production accounts in MongoDB Atlas:
 * 1. Clinic Admin: admin@4pawclinic.lk / Admin@1234 (admin)
 * 2. Clinical Staff: vet@4pawclinic.lk / Doctor@1234 (veterinarian)
 * 3. Inventory Officer: inventory@4pawclinic.lk / Stock@1234 (inventory)
 * 4. Cashier: cashier@4pawclinic.lk / Cashier@1234 (cashier)
 * 5. Pet Parent: client@4pawclinic.lk / Client@1234 (customer)
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Pet = require('./models/Pet');

const OFFICIAL_ACCOUNTS = [
  {
    name: 'Dr. Saman Perera (Chief Medical Officer)',
    email: 'admin@4pawclinic.lk',
    phone: '0112345001',
    password: 'Admin@1234',
    role: 'admin',
    title: 'Clinic Admin'
  },
  {
    name: 'Dr. Samantha Fernando (Senior Clinical Vet)',
    email: 'vet@4pawclinic.lk',
    phone: '0112345002',
    password: 'Doctor@1234',
    role: 'veterinarian',
    title: 'Clinical Staff (Veterinarian)'
  },
  {
    name: 'Dilshan Gunawardena (Chief Pharmacist & Supply Lead)',
    email: 'inventory@4pawclinic.lk',
    phone: '0112345003',
    password: 'Stock@1234',
    role: 'inventory',
    title: 'Inventory Officer'
  },
  {
    name: 'Kamal Gunasekara (Head POS Cashier)',
    email: 'cashier@4pawclinic.lk',
    phone: '0112345004',
    password: 'Cashier@1234',
    role: 'cashier',
    title: 'Cashier (POS & Billing)'
  },
  {
    name: 'Anura Bandara (Registered Pet Parent)',
    email: 'client@4pawclinic.lk',
    phone: '0771234999',
    password: 'Client@1234',
    role: 'customer',
    title: 'Pet Parent (Client Portal)'
  }
];

async function seedVivaAccounts() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://gayanchanuka823_db_user:gyn2004mongo@cluster0.2xk0lxp.mongodb.net/pet_shop_db?retryWrites=true&w=majority&appName=Cluster0';
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas Cloud Cluster.\n');

    console.log('📋 Upserting 5 Official Viva Clinical Accounts...\n');

    const createdUsers = [];

    for (const acc of OFFICIAL_ACCOUNTS) {
      let user = await User.findOne({ email: acc.email });
      if (user) {
        user.name = acc.name;
        user.phone = acc.phone;
        user.password = acc.password; // pre-save hook will hash it
        user.role = acc.role;
        await user.save();
        console.log(`🔄 Updated existing user: ${acc.email} (${acc.role})`);
      } else {
        user = await User.create({
          name: acc.name,
          email: acc.email,
          phone: acc.phone,
          password: acc.password,
          role: acc.role
        });
        console.log(`✨ Created new user: ${acc.email} (${acc.role})`);
      }
      createdUsers.push(user);
    }

    // Link at least 2 existing pets to client@4pawclinic.lk so customer portal is rich
    const clientUser = createdUsers.find(u => u.email === 'client@4pawclinic.lk');
    if (clientUser) {
      const petsToLink = await Pet.find({ isArchived: false }).limit(2);
      if (petsToLink.length > 0) {
        for (const pet of petsToLink) {
          pet.ownerId = clientUser._id;
          pet.ownerName = clientUser.name;
          pet.ownerPhone = clientUser.phone;
          pet.ownerEmail = clientUser.email;
          await pet.save();
        }
        console.log(`🐾 Linked ${petsToLink.length} pets to client@4pawclinic.lk for the Client Portal.`);
      }
    }

    console.log('\n🔒 Verifying Password Hashing & Authentication for all 5 accounts:');
    for (const acc of OFFICIAL_ACCOUNTS) {
      const u = await User.findOne({ email: acc.email }).select('+password');
      const isMatch = await u.matchPassword(acc.password);
      console.log(`   [${isMatch ? 'PASSED ✅' : 'FAILED ❌'}] ${acc.email} -> Authenticated with '${acc.password}' (Stored Hash: ${u.password.substring(0, 15)}...)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 5 OFFICIAL VIVA EXAMINATION CREDENTIALS READY');
    console.log('='.repeat(80));
    OFFICIAL_ACCOUNTS.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title.padEnd(30)} | Email: ${a.email.padEnd(25)} | Password: ${a.password}`);
    });
    console.log('='.repeat(80) + '\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected safely from MongoDB Atlas.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder Error:', err);
    process.exit(1);
  }
}

seedVivaAccounts();
