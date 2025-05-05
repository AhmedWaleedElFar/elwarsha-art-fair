// Usage: node scripts/seed-artworks.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const artworkSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  artistName: String,
  artworkCode: String,
  imageUrl: String,
  orderWithinCategory: Number,
});

const Artwork = mongoose.models.Artwork || mongoose.model('Artwork', artworkSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const artworks = [];
const categories = [
  { name: 'Photography', prefix: 'PHO', startId: 1015 },
  { name: 'Paintings', prefix: 'PAI', startId: 2001 },
  { name: 'Digital Painting', prefix: 'DIG', startId: 3001 },
  { name: 'Drawing', prefix: 'DRA', startId: 4001 },
];

categories.forEach((cat, i) => {
  for (let j = 1; j <= 15; j++) {
    artworks.push({
      title: `${cat.name} Piece ${j}`,
      description: `Sample description for ${cat.name} artwork #${j}.`,
      category: cat.name,
      artistName: `Artist ${cat.prefix}-${j}`,
      artworkCode: `${cat.prefix}-${String(j).padStart(3, '0')}`,
      imageUrl: `https://picsum.photos/id/${cat.startId + j}/400/300`,
      orderWithinCategory: j,
    });
  }
});

  for (const art of artworks) {
    const exists = await Artwork.findOne({ artworkCode: art.artworkCode });
    if (!exists) {
      await Artwork.create(art);
      console.log(`Seeded: ${art.title}`);
    } else {
      console.log(`Already exists: ${art.title}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
