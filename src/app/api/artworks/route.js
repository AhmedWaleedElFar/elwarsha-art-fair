import connectDB from '@/app/lib/db';
import Artwork from '@/app/lib/models/artwork';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  // Only allow access if user is a judge (i.e., has a category)
  if (!session || !session.user?.category) {
    return Response.json({ artworks: [] });
  }
  await connectDB();
  // Only show artworks from the judge's category
  const judgeCategory = session.user.category;
  const artworks = await Artwork.find({ category: judgeCategory }).sort({ createdAt: -1 });
  return Response.json({ artworks });
}
