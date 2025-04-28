'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  // Filters for votes
  const [filterJudge, setFilterJudge] = useState("");
  const [filterArtwork, setFilterArtwork] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Memoize filter options for selects
  const judgeOptions = useMemo(() => results ? [...new Set(results.votes.map(v => v.judgeId?.email))].filter(Boolean) : [], [results]);
  const artworkOptions = useMemo(() => results ? [...new Set(results.votes.map(v => v.artworkId?.title))].filter(Boolean) : [], [results]);
  const categoryOptions = useMemo(() => results ? [...new Set(results.votes.map(v => v.category))].filter(Boolean) : [], [results]);

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
    // Skeleton loader for dashboard
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6 gap-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-40 rounded animate-pulse" />
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-40 rounded animate-pulse" />
        </div>
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse" />
        <div className="mb-12">
          <div className="h-6 w-52 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded shadow p-4 animate-pulse">
                <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-12">
          <div className="h-6 w-52 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  {["Artwork", "Artist", "Category", "Avg Score", "Total Votes", "Total Score"].map(h => (
                    <th key={h} className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3 py-2"><div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="h-6 w-52 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
          <div className="flex flex-wrap gap-4 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  {["Judge", "Artwork", "Category", "Scores", "Total Score", "Comment"].map(h => (
                    <th key={h} className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3 py-2"><div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div className="container mx-auto py-16 text-center text-red-500">Failed to load results.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-6 gap-4">
        <button
          onClick={() => router.push('/admin/artworks')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold"
        >
          Manage Artworks
        </button>
        <button
          onClick={() => router.push('/admin/judges')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold"
        >
          Manage Judges
        </button>
      </div>
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
                  artworks.map((a, i) => {
  let rowClass = '';
  if (i === 0) rowClass = 'bg-yellow-200 dark:bg-yellow-900'; // Gold
  else if (i === 1) rowClass = 'bg-gray-200 dark:bg-gray-700'; // Silver
  else if (i === 2) rowClass = 'bg-orange-200 dark:bg-orange-900'; // Bronze
  return (
    <li key={a._id} className={`flex flex-col rounded ${rowClass} p-2`}>
      <span className="font-semibold">{a.title}</span>
      <span className="text-xs text-gray-500">
        {a.artistName} | Avg: {a.totalVotes ? (typeof a.totalScore === 'number' ? (a.totalScore / a.totalVotes).toFixed(2) : 'N/A') : 'N/A'} | Votes: {a.totalVotes} | 
        <span className="font-bold text-green-700 dark:text-green-300">Total: {typeof a.totalScore === 'number' && !isNaN(a.totalScore) ? a.totalScore : 0}</span>
      </span>
    </li>
  );
})
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
                <th className="px-3 py-2">Total Score</th>
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
                  <td className="px-3 py-2 font-bold text-green-700 dark:text-green-300">{a.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Votes</h2>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            className="border rounded p-2"
            value={filterJudge}
            onChange={e => setFilterJudge(e.target.value)}
          >
            <option value="">All Judges</option>
            {judgeOptions.map(email => (
              <option key={email} value={email}>{results.votes.find(v => v.judgeId?.email === email)?.judgeId?.name} ({email})</option>
            ))} 
          </select>
          <select
            className="border rounded p-2"
            value={filterArtwork}
            onChange={e => setFilterArtwork(e.target.value)}
          >
            <option value="">All Artworks</option>
            {artworkOptions.map(title => (
              <option key={title} value={title}>{title}</option>
            ))} 
          </select>
          <select
            className="border rounded p-2"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))} 
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr>
                <th className="px-3 py-2">Judge</th>
                <th className="px-3 py-2">Artwork</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Scores</th>
                <th className="px-3 py-2">Total Score</th>
                <th className="px-3 py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {results.votes
                .filter(v => !filterJudge || v.judgeId?.email === filterJudge)
                .filter(v => !filterArtwork || v.artworkId?.title === filterArtwork)
                .filter(v => !filterCategory || v.category === filterCategory)
                .map((v) => (
                <tr key={v._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2">
                    {v.judgeId?.name} <span className="text-xs text-gray-500">({v.judgeId?.email})</span>
                  </td>
                  <td className="px-3 py-2">
                    {v.artworkId?.title} <span className="text-xs text-gray-500">({v.artworkId?.artworkCode})</span>
                  </td>
                  <td className="px-3 py-2">{v.category}</td>
                  <td className="px-3 py-2 text-xs">
                    <div>Technique Execution: {v.scores?.techniqueExecution ?? 0}</div>
                    <div>Creativity & Originality: {v.scores?.creativityOriginality ?? 0}</div>
                    <div>Concept & Message: {v.scores?.conceptMessage ?? 0}</div>
                    <div>Aesthetic Impact: {v.scores?.aestheticImpact ?? 0}</div>
                  </td>
                  <td className="px-3 py-2 font-bold">
                    {[v.scores?.techniqueExecution, v.scores?.creativityOriginality, v.scores?.conceptMessage, v.scores?.aestheticImpact]
                      .map(x => typeof x === 'number' ? x : 0)
                      .reduce((a, b) => a + b, 0)}
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
