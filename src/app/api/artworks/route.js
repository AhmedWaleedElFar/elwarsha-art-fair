import connectDB from '@/app/lib/db';
import Artwork from '@/app/lib/models/artwork';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  await connectDB();
  let artworks = [];
  if (!session) {
    return Response.json({ artworks: [] });
  }
  if (session.user.role === 'admin') {
    artworks = await Artwork.find({}).sort({ category: 1, orderWithinCategory: 1 });
  } else if (session.user.categories && Array.isArray(session.user.categories)) {
    artworks = await Artwork.find({ category: { $in: session.user.categories } }).sort({ orderWithinCategory: 1 });
  }
  return Response.json({ artworks });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { title, description, category, artistName, artworkCode, imageUrl, orderWithinCategory } = await req.json();
  if (!title || !description || !category || !artistName || !artworkCode || !imageUrl) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }
  const exists = await Artwork.findOne({ artworkCode });
  if (exists) {
    return Response.json({ error: 'Artwork code must be unique' }, { status: 400 });
  }
  const artwork = await Artwork.create({ title, description, category, artistName, artworkCode, imageUrl, orderWithinCategory });
  return Response.json({ artwork });
}
