import connectDB from '@/app/lib/db';
import Artwork from '@/app/lib/models/artwork';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { orderWithinCategory } = await req.json();
  const { id } = params;
  const artwork = await Artwork.findByIdAndUpdate(
    id,
    { orderWithinCategory },
    { new: true }
  );
  if (!artwork) {
    return Response.json({ error: 'Artwork not found' }, { status: 404 });
  }
  return Response.json({ artwork });
}
