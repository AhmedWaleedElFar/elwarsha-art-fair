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
      <div className="min-h-screen bg-black text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6 gap-4">
            <div className="bg-[#121212] h-10 w-40 rounded animate-pulse" />
            <div className="bg-[#121212] h-10 w-40 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-[#121212] rounded mx-auto mb-8 animate-pulse" />
          <div className="mb-12">
            <div className="h-6 w-52 bg-[#121212] rounded mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#121212] rounded-lg shadow-lg p-6 animate-pulse">
                  <div className="h-5 w-32 bg-gray-700 rounded mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-4 w-full bg-gray-700 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-12">
            <div className="h-6 w-52 bg-[#121212] rounded mb-6 animate-pulse" />
            <div className="overflow-x-auto">
              <div className="bg-[#121212] rounded-lg shadow-lg p-4">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {["Artwork", "Artist", "Category", "Avg Score", "Total Votes", "Total Score"].map(h => (
                        <th key={h} className="px-4 py-3"><div className="h-4 w-20 bg-gray-700 rounded" /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-t border-gray-800">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 w-full bg-gray-700 rounded" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            <div className="h-6 w-52 bg-[#121212] rounded mb-6 animate-pulse" />
            <div className="flex flex-wrap gap-4 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-40 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
            <div className="overflow-x-auto">
              <div className="bg-[#121212] rounded-lg shadow-lg p-4">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {["Judge", "Artwork", "Category", "Scores", "Total Score", "Comment"].map(h => (
                        <th key={h} className="px-4 py-3"><div className="h-4 w-20 bg-gray-700 rounded" /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-t border-gray-800">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 w-full bg-gray-700 rounded" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return <div className="min-h-screen bg-gray-900 py-16 text-center text-red-500">Failed to load results.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          {/* <button
            onClick={() => router.push('/')}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </button> */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/artworks')}
              className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors text-sm font-medium"
            >
              Manage Artworks
            </button>
            <button
              onClick={() => router.push('/admin/judges')}
              className="bg-[#93233B] text-white px-4 py-2 rounded-md hover:bg-[#7a1d31] transition-colors text-sm font-medium"
            >
              Manage Judges
            </button>
          </div>
        </div>

        {/* Top 10 Artworks by Category */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-6 text-gray-300">Top 10 Artworks by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(results.topArtworksByCategory).map(([category, artworks]) => (
              <div key={category} className="bg-[#121212] rounded-lg shadow-lg p-6">
                <h3 className="font-bold mb-4 text-[#93233B]">{category}</h3>
                <ol className="list-decimal list-inside space-y-3">
                  {artworks.length === 0 ? (
                    <li className="text-gray-400">No artworks</li>
                  ) : (
                    artworks.map((a, i) => {
                      let rowClass = '';
                      if (i === 0) rowClass = 'bg-yellow-500 border-l-4 border-yellow-500 bg-opacity-20'; // Gold
                      else if (i === 1) rowClass = 'bg-gray-500 border-l-4 border-gray-500 bg-opacity-20'; // Silver
                      else if (i === 2) rowClass = 'bg-orange-500 border-l-4 border-orange-500 bg-opacity-20'; // Bronze
                      return (
                        <li key={a._id} className={`flex flex-col rounded-md ${rowClass} p-3 mb-2`}>
                          <span className="font-medium text-white">{a.title}</span>
                          <span className="text-xs text-gray-400 mt-1">
                            {a.artistName} | Votes: {a.totalVotes} | 
                            <span className="font-bold text-[#93233B] ml-1">Total Score: {typeof a.totalScore === 'number' && !isNaN(a.totalScore) ? a.totalScore : 0}</span>
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

        {/* Artwork Vote Statistics */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-6 text-gray-300">Artwork Vote Statistics</h2>
          <div className="overflow-x-auto">
            <div className="bg-[#121212] rounded-lg shadow-lg p-6 mb-8">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artwork</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artist</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Avg Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total Votes</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.artworkStats.map((a) => (
                    <tr key={a._id} className="border-t border-gray-700 hover:bg-[#1e1e1e]">
                      <td className="px-4 py-3 font-medium text-white">{a.title}</td>
                      <td className="px-4 py-3 text-gray-300">{a.artistName}</td>
                      <td className="px-4 py-3 text-gray-300">{a.category}</td>
                      <td className="px-4 py-3 text-gray-300">{a.avgScore?.toFixed(2) ?? 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300">{a.totalVotes}</td>
                      <td className="px-4 py-3 font-bold text-[#93233B]">{a.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* All Votes */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-6 text-gray-300">All Votes</h2>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              className="bg-[#121212] border border-gray-700 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={filterJudge}
              onChange={e => setFilterJudge(e.target.value)}
            >
              <option value="">All Judges</option>
              {judgeOptions.map(email => (
                <option key={email} value={email}>{results.votes.find(v => v.judgeId?.email === email)?.judgeId?.name} ({email})</option>
              ))} 
            </select>
            <select
              className="bg-[#121212] border border-gray-700 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#93233B]"
              value={filterArtwork}
              onChange={e => setFilterArtwork(e.target.value)}
            >
              <option value="">All Artworks</option>
              {artworkOptions.map(title => (
                <option key={title} value={title}>{title}</option>
              ))} 
            </select>
            <select
              className="bg-[#121212] border border-gray-700 rounded-md p-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#93233B]"
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
            <div className="bg-[#121212] rounded-lg shadow-lg p-6 mb-8">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Judge</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artwork</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Scores</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {results.votes
                    .filter(v => !filterJudge || v.judgeId?.email === filterJudge)
                    .filter(v => !filterArtwork || v.artworkId?.title === filterArtwork)
                    .filter(v => !filterCategory || v.category === filterCategory)
                    .map((v) => (
                      <tr key={v._id} className="border-t border-gray-700 hover:bg-[#1e1e1e]">
                        <td className="px-4 py-3">
                          <span className="font-medium text-white">{v.judgeId?.name}</span> <span className="text-xs text-gray-400">({v.judgeId?.email})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-white">{v.artworkId?.title}</span> <span className="text-xs text-gray-400">({v.artworkId?.artworkCode})</span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{v.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          <div className="grid grid-cols-1 gap-1">
                            <div>Technique Execution: <span className="text-[#93233B] font-medium">{v.scores?.techniqueExecution ?? 0}</span></div>
                            <div>Creativity & Originality: <span className="text-[#93233B] font-medium">{v.scores?.creativityOriginality ?? 0}</span></div>
                            <div>Concept & Message: <span className="text-[#93233B] font-medium">{v.scores?.conceptMessage ?? 0}</span></div>
                            <div>Aesthetic Impact: <span className="text-[#93233B] font-medium">{v.scores?.aestheticImpact ?? 0}</span></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#93233B]">
                          {[v.scores?.techniqueExecution, v.scores?.creativityOriginality, v.scores?.conceptMessage, v.scores?.aestheticImpact]
                            .map(x => typeof x === 'number' ? x : 0)
                            .reduce((a, b) => a + b, 0)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">{v.comment}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
