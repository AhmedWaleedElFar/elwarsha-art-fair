import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import connectDB from '@/app/lib/db';
import Vote from '@/app/lib/models/vote';
import Artwork from '@/app/lib/models/artwork';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'judge' || !session.user.categories || session.user.categories.length === 0) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const mine = req.nextUrl.searchParams.get('mine');
  let votes = [];
  if (mine === '1') {
    votes = await Vote.find({ judgeId: session.user.id });
  } else {
    votes = await Vote.find();
  }
  return Response.json({ votes });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'judge' || !session.user.categories || session.user.categories.length === 0) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  const { artworkId, scores, comment } = body;

  // Validate artwork exists
  const artwork = await Artwork.findById(artworkId);
  if (!artwork) {
    return Response.json({ error: 'Artwork not found' }, { status: 404 });
  }

  // Upsert vote: if exists, update; else, create
  let vote = await Vote.findOneAndUpdate(
    { judgeId: session.user.id, artworkId },
    {
      scores,
      comment,
      category: artwork.category,
    },
    { new: true }
  );
  if (!vote) {
    vote = await Vote.create({
      judgeId: session.user.id,
      artworkId,
      scores,
      comment,
      category: artwork.category,
    });
  }

  return Response.json({ success: true, vote });
}
