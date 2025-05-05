import connectDB from '@/app/lib/db';
import Vote from '@/app/lib/models/vote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'judge') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await params;
    const { scores, comment } = await req.json();
    
    // Find the vote
    const vote = await Vote.findById(id);
    if (!vote) {
      return Response.json({ error: 'Vote not found' }, { status: 404 });
    }
    
    // Verify the judge owns this vote
    if (String(vote.judgeId) !== String(session.user.id)) {
      return Response.json({ error: 'Forbidden - you can only edit your own votes' }, { status: 403 });
    }
    
    // Update the vote
    const updatedVote = await Vote.findByIdAndUpdate(
      id,
      { scores, comment },
      { new: true }
    );
    
    return Response.json({ success: true, vote: updatedVote });
  } catch (err) {
    console.error('Error updating vote:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { id } = await params;
    // Only allow the judge who made the vote or admin to delete
    const vote = await Vote.findById(id);
    if (!vote) return Response.json({ error: 'Vote not found' }, { status: 404 });
    if (session.user.role !== 'admin' && String(vote.judgeId) !== String(session.user.id)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    await Vote.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}