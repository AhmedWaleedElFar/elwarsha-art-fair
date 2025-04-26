import connectDB from '@/app/lib/db';
import Vote from '@/app/lib/models/vote';
import Artwork from '@/app/lib/models/artwork';
import Judge from '@/app/lib/models/judge';

export async function GET() {
  await connectDB();

  // Get all votes with judge and artwork info
  const votes = await Vote.find()
    .populate('judgeId', 'email name role')
    .populate('artworkId', 'title artistName category artworkCode imageUrl')
    .lean();

  // Calculate average score and total votes per artwork
  const artworkStats = await Vote.aggregate([
    {
      $group: {
        _id: '$artworkId',
        avgScore: { $avg: {
          $avg: [
            '$scores.creativity',
            '$scores.technique',
            '$scores.artisticVision',
            '$scores.overallImpact',
          ]
        } },
        totalVotes: { $sum: 1 },
        totalScore: { $sum: {
          $add: [
            '$scores.creativity',
            '$scores.technique',
            '$scores.artisticVision',
            '$scores.overallImpact',
          ]
        } },
        category: { $first: '$category' },
      }
    },
    {
      $lookup: {
        from: 'artworks',
        localField: '_id',
        foreignField: '_id',
        as: 'artwork',
      }
    },
    { $unwind: '$artwork' },
    {
      $project: {
        _id: 1,
        avgScore: 1,
        totalVotes: 1,
        totalScore: 1,
        category: 1,
        title: '$artwork.title',
        artistName: '$artwork.artistName',
        artworkCode: '$artwork.artworkCode',
        imageUrl: '$artwork.imageUrl',
      }
    }
  ]);

  // Top 10 artworks by avg score per category
  const topArtworksByCategory = {};
  for (const category of ['Photography', 'Paintings', 'Digital Painting', 'Drawing']) {
    topArtworksByCategory[category] = artworkStats
      .filter(a => a.category === category)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
  }

  return Response.json({
    votes,
    artworkStats,
    topArtworksByCategory,
  });
}
