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
      totalVotes: { $sum: 1 },
      totalScore: { $sum: {
        $add: [
          { $ifNull: ['$scores.techniqueExecution', 0] },
          { $ifNull: ['$scores.creativityOriginality', 0] },
          { $ifNull: ['$scores.conceptMessage', 0] },
          { $ifNull: ['$scores.aestheticImpact', 0] },
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

// Compute avgScore in JS to avoid division by zero and NaN
artworkStats.forEach(a => {
  a.avgScore = (a.totalVotes && typeof a.totalScore === 'number') ? (a.totalScore / a.totalVotes) : 0;
});

// Top 10 artworks by total score per category
const topArtworksByCategory = {};
for (const category of ['Photography', 'Paintings', 'Digital Painting', 'Drawing']) {
  topArtworksByCategory[category] = artworkStats
    .filter(a => a.category === category)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
}

return Response.json({
  votes,
  artworkStats,
  topArtworksByCategory,
});
}
