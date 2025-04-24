'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.replace('/login');
    } else {
      fetchResults();
    }
    // eslint-disable-next-line
  }, [session, status]);

  async function fetchResults() {
    setLoading(true);
    const res = await fetch('/api/results');
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="container mx-auto py-16 text-center text-lg">Loading results...</div>;
  }

  if (!results) {
    return <div className="container mx-auto py-16 text-center text-red-500">Failed to load results.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Top 10 Artworks by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(results.topArtworksByCategory).map(([category, artworks]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded shadow p-4">
              <h3 className="font-bold mb-2 text-purple-700 dark:text-purple-300">{category}</h3>
              <ol className="list-decimal list-inside space-y-2">
                {artworks.length === 0 ? (
                  <li className="text-gray-400">No artworks</li>
                ) : (
                  artworks.map((a, i) => (
                    <li key={a._id} className="flex flex-col">
                      <span className="font-semibold">{a.title}</span>
                      <span className="text-xs text-gray-500">{a.artistName} | Avg: {a.avgScore?.toFixed(2) ?? 'N/A'} | Votes: {a.totalVotes}</span>
                    </li>
                  ))
                )}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Artwork Vote Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="px-3 py-2">Artwork</th>
                <th className="px-3 py-2">Artist</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Avg Score</th>
                <th className="px-3 py-2">Total Votes</th>
              </tr>
            </thead>
            <tbody>
              {results.artworkStats.map((a) => (
                <tr key={a._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 font-semibold">{a.title}</td>
                  <td className="px-3 py-2">{a.artistName}</td>
                  <td className="px-3 py-2">{a.category}</td>
                  <td className="px-3 py-2">{a.avgScore?.toFixed(2) ?? 'N/A'}</td>
                  <td className="px-3 py-2">{a.totalVotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Votes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="px-3 py-2">Judge</th>
                <th className="px-3 py-2">Artwork</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Scores</th>
                <th className="px-3 py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {results.votes.map((v) => (
                <tr key={v._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2">
                    {v.judgeId?.name} <span className="text-xs text-gray-500">({v.judgeId?.email})</span>
                  </td>
                  <td className="px-3 py-2">
                    {v.artworkId?.title} <span className="text-xs text-gray-500">({v.artworkId?.artworkCode})</span>
                  </td>
                  <td className="px-3 py-2">{v.category}</td>
                  <td className="px-3 py-2 text-xs">
                    <div>Creativity: {v.scores.creativity}</div>
                    <div>Technique: {v.scores.technique}</div>
                    <div>Artistic Vision: {v.scores.artisticVision}</div>
                    <div>Overall Impact: {v.scores.overallImpact}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{v.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
