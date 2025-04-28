"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function totalScore(scores) {
  // Sum all numeric values in the scores object
  return Object.values(scores || {}).reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
}

export default function JudgeVotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [votes, setVotes] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "judge") {
      router.replace("/login");
      return;
    }
    async function fetchVotesAndArtworks() {
      setLoading(true);
      try {
        const [voteRes, artRes] = await Promise.all([
          fetch("/api/vote?mine=1"),
          fetch("/api/artworks"),
        ]);
        const voteData = await voteRes.json();
        const artData = await artRes.json();
        setVotes(Array.isArray(voteData.votes) ? voteData.votes : []);
        setArtworks(Array.isArray(artData.artworks) ? artData.artworks : []);
      } catch {
        setVotes([]);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVotesAndArtworks();
  }, [session, status, router]);

  // Memoize grouped votes by category and sort by total score descending
  const votesByCategory = useMemo(() => {
    const grouped = votes.reduce((acc, vote) => {
      const cat = vote.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(vote);
      return acc;
    }, {});
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => totalScore(b.scores) - totalScore(a.scores));
    });
    return grouped;
  }, [votes]);

  function getArtwork(artworkId) {
    return artworks.find(a => a._id === artworkId);
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">My Votes</h1>
      {loading ? (
        <div>
          {Array.from({ length: 2 }).map((_, cidx) => (
            <div key={cidx} className="mb-10">
              <div className="h-6 w-32 bg-[#121212] rounded mb-4 animate-pulse" />
              <div className="overflow-x-auto">
                <table className="min-w-full rounded overflow-hidden">
                  <thead>
                    <tr>
                      {["Artwork", "Artist", "Total Score", "Scores", "Comment"].map(h => (
                        <th key={h} className="px-3 py-2"><div className="h-4 w-20 bg-[#2a2a2a] rounded" /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-3 py-2"><div className="h-4 w-full bg-[#2a2a2a] rounded" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="h-3 w-40 bg-[#2a2a2a] rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(votesByCategory).length === 0 ? (
        <div className="text-center text-gray-400">You have not voted on any artworks yet.</div>
      ) : (
        Object.entries(votesByCategory).map(([category, votes]) => (
          <div key={category} className="mb-10 bg-[#1e1e1e] rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-[#93233B] border-b border-gray-800 pb-3">{category}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full rounded overflow-hidden">
                <thead className="bg-[#2a2a2a] border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-white text-left">Artwork</th>
                    <th className="px-4 py-3 text-white text-left">Artist</th>
                    <th className="px-4 py-3 text-white text-left">Total Score</th>
                    <th className="px-4 py-3 text-white text-left">Scores</th>
                    <th className="px-4 py-3 text-white text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote, idx) => {
  const art = getArtwork(vote.artworkId);
  let rowClass = '';
  if (idx === 0) rowClass = 'border-l-4 border-yellow-500 bg-yellow-900 bg-opacity-20'; // Gold
  else if (idx === 1) rowClass = 'border-l-4 border-gray-500 bg-gray-700 bg-opacity-20'; // Silver
  else if (idx === 2) rowClass = 'border-l-4 border-orange-500 bg-orange-900 bg-opacity-20'; // Bronze
  return (
    <tr key={vote._id} className={rowClass}>
                        <td className="px-4 py-3 font-semibold">{art ? art.title : "Unknown"}</td>
                        <td className="px-4 py-3 text-gray-300">{art ? art.artistName : "-"}</td>
                        <td className="px-4 py-3 font-bold text-[#93233B]">{totalScore(vote.scores)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm"><span className="text-gray-400">Technique & Execution:</span> {vote.scores.techniqueExecution}</span>
                            <span className="text-sm"><span className="text-gray-400">Creativity & Originality:</span> {vote.scores.creativityOriginality}</span>
                            <span className="text-sm"><span className="text-gray-400">Concept / Message:</span> {vote.scores.conceptMessage}</span>
                            <span className="text-sm"><span className="text-gray-400">Aesthetic Impact:</span> {vote.scores.aestheticImpact}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{vote.comment || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-xs text-gray-400 mt-4 bg-[#2a2a2a] p-3 rounded-md inline-block">
                <span className="inline-block mr-3"><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1 align-middle"></span>1st Place</span>
                <span className="inline-block mr-3"><span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1 align-middle"></span>2nd Place</span>
                <span className="inline-block mr-3"><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1 align-middle"></span>3rd Place</span>
              </div>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
