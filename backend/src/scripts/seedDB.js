// File: backend/src/scripts/seedDB.js

import 'dotenv/config';
import mongoose          from 'mongoose';
import { readFileSync }  from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt            from 'bcrypt';

import User    from '../models/User.js';
import Listing from '../models/Listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([ User.deleteMany({}), Listing.deleteMany({}) ]);

  // 1) load & hash users
  const usersPath = join(__dirname, '../../data/userlist.json');
  const users     = JSON.parse(readFileSync(usersPath, 'utf-8'));
  const hashed    = await bcrypt.hash('OldPhoneDeals123!', 10);

  // 1.5) add hardcoded admin
  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    password: hashed,
    isVerified: true,
    verificationToken: null,
    registrationDate: new Date('2025-01-01T00:00:00Z'),
    lastLogin: new Date('2025-01-01T00:00:00Z'),
    role: 'admin'
  };

  users.push(adminUser);

  // 2) unwrap the {$oid: "..."} and set passwords
  users.forEach(u => {
    if (u._id && u._id.$oid) {
      u._id = new mongoose.Types.ObjectId(u._id.$oid);
    }
    u.password = hashed;

    u.firstname = u.firstname || "";
    u.lastname = u.lastname || "";
    u.email = u.email || "";
    u.isVerified = true;
    u.verificationToken = u.verificationToken ?? null;
    u.registrationDate = u.registrationDate ?? new Date('2025-01-01T00:00:00Z');
    u.lastLogin = u.lastLogin ?? new Date('2025-01-01T00:00:00Z');
  });

  await User.insertMany(users);

  // 3) load & insert listings (no $oid wrappers here)
  const listPath = join(__dirname, '../../data/phonelisting.json');
  const lists = JSON.parse(readFileSync(listPath, 'utf-8'));

  // For each listing:
  lists.forEach(listing => {
    // 1) set the image path
    listing.image = `/images/${listing.brand}.jpeg`;
  
    // 2) normalize the disabled flag into a Boolean
    listing.disabled = listing.hasOwnProperty('disabled');
  
    // 3) normalize each review.hidden into a Boolean
    if (Array.isArray(listing.reviews)) {
      listing.reviews = listing.reviews.map(review => ({
        ...review,
        hidden: review.hasOwnProperty('hidden')
      }));
    }
  });

  await Listing.insertMany(lists);
  console.log(`📦 Inserted ${lists.length} listings`);

  console.log('✅  Database seeded successfully');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed error:', err);
  process.exit(1);
});
