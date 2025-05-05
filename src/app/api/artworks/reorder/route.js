import connectDB from '@/app/lib/db';
import Artwork from '@/app/lib/models/artwork';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

export async function POST(req) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const artworkPositions = await req.json();

    // Validate input
    if (!Array.isArray(artworkPositions)) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Batch update artwork positions
    const bulkOps = artworkPositions.map(artwork => ({
      updateOne: {
        filter: { _id: artwork.id },
        update: { $set: { position: artwork.position } }
      }
    }));

    const result = await Artwork.bulkWrite(bulkOps);

    return Response.json({ 
      success: true, 
      message: 'Artwork positions updated', 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error updating artwork positions:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}