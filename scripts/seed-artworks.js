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

  const artworks = [
    {
      title: 'Sunset Boulevard',
      description: 'A vibrant sunset over the city skyline.',
      category: 'Photography',
      artistName: 'Alice Smith',
      artworkCode: 'PHO-001',
      imageUrl: 'https://picsum.photos/id/1015/400/300',
      orderWithinCategory: 1,
    },
    {
      title: 'Forest Dreams',
      description: 'A dreamy painting of a lush green forest.',
      category: 'Paintings',
      artistName: 'Bob Lee',
      artworkCode: 'PAI-002',
      imageUrl: 'https://picsum.photos/id/1025/400/300',
      orderWithinCategory: 1,
    },
    {
      title: 'Digital Mirage',
      description: 'A surreal digital painting blending nature and technology.',
      category: 'Digital Painting',
      artistName: 'Clara Zhang',
      artworkCode: 'DIG-003',
      imageUrl: 'https://picsum.photos/id/1035/400/300',
      orderWithinCategory: 1,
    },
    {
      title: 'The Thinker',
      description: 'A pencil drawing capturing a moment of deep thought.',
      category: 'Drawing',
      artistName: 'David Kim',
      artworkCode: 'DRA-004',
      imageUrl: 'https://picsum.photos/id/1045/400/300',
      orderWithinCategory: 1,
    },
    {
      title: 'Urban Reflections',
      description: 'City lights reflected on wet pavement.',
      category: 'Photography',
      artistName: 'Elena Rossi',
      artworkCode: 'PHO-005',
      imageUrl: 'https://picsum.photos/id/1055/400/300',
      orderWithinCategory: 2,
    },
    {
      title: 'Colorful Chaos',
      description: 'An abstract painting full of energy and color.',
      category: 'Paintings',
      artistName: 'Faisal Ahmed',
      artworkCode: 'PAI-006',
      imageUrl: 'https://picsum.photos/id/1065/400/300',
      orderWithinCategory: 2,
    },
  ];

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
