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
      email: 'admin@elwarsha.com',
      password: 'adminpass',
      name: 'Admin User',
    },
  ];

  for (const admin of admins) {
    const exists = await Admin.findOne({ email: admin.email });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.create({
        ...admin,
        password: hashedPassword,
      });
      console.log(`Seeded admin: ${admin.email}`);
    } else {
      console.log(`Admin already exists: ${admin.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding admins complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
