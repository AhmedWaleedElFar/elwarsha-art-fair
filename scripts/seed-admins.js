import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../src/app/lib/models/admin.js';

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const admins = [
    {
      username: 'admin',
      password: 'adminpass',
      name: 'Admin User',
    },
  ];

  for (const admin of admins) {
    const exists = await Admin.findOne({ username: admin.username });
    if (!exists) {
      await Admin.create({
        ...admin
      });
      console.log(`Seeded admin: ${admin.username}`);
    } else {
      console.log(`Admin already exists: ${admin.username}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding admins complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
