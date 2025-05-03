// Usage: node scripts/seed-judges.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Judge from '../src/app/lib/models/judge.js';

dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const judges = [
    {
      username: 'judge1',
      password: 'judgepass',
      name: 'Judge One',
      categories: ['Photography', 'Digital Painting'],
    },
    {
      username: 'judge2',
      password: 'judgepass',
      name: 'Judge Two',
      categories: ['Photography'],
    },
  ];

  for (const judge of judges) {
    const exists = await Judge.findOne({ username: judge.username });
    if (!exists) {
      await Judge.create(judge);
      console.log(`Seeded: ${judge.username}`);
    } else {
      console.log(`Already exists: ${judge.username}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
