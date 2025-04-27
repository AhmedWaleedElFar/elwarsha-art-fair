"use client";

import { useEffect, useState } from "react";
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
  const votesByCategory = React.useMemo(() => {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Votes</h1>
      {loading ? (
        <div>
          {Array.from({ length: 2 }).map((_, cidx) => (
            <div key={cidx} className="mb-10">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
                  <thead>
                    <tr>
                      {["Artwork", "Artist", "Total Score", "Scores", "Comment"].map(h => (
                        <th key={h} className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-3 py-2"><div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(votesByCategory).length === 0 ? (
        <div className="text-center text-gray-500">You have not voted on any artworks yet.</div>
      ) : (
        Object.entries(votesByCategory).map(([category, votes]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">{category}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Artwork</th>
                    <th className="px-3 py-2">Artist</th>
                    <th className="px-3 py-2">Total Score</th>
                    <th className="px-3 py-2">Scores</th>
                    <th className="px-3 py-2">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote, idx) => {
  const art = getArtwork(vote.artworkId);
  let rowClass = '';
  if (idx === 0) rowClass = 'bg-yellow-200 dark:bg-yellow-900'; // Gold
  else if (idx === 1) rowClass = 'bg-gray-200 dark:bg-gray-700'; // Silver
  else if (idx === 2) rowClass = 'bg-orange-200 dark:bg-orange-900'; // Bronze
  return (
    <tr key={vote._id} className={rowClass}>
                        <td className="px-3 py-2 font-semibold">{art ? art.title : "Unknown"}</td>
                        <td className="px-3 py-2">{art ? art.artistName : "-"}</td>
                        <td className="px-3 py-2 font-bold">{totalScore(vote.scores)}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block mr-2">Technique & Execution: {vote.scores.techniqueExecution}</span>
                          <span className="inline-block mr-2">Creativity & Originality: {vote.scores.creativityOriginality}</span>
                          <span className="inline-block mr-2">Concept / Message: {vote.scores.conceptMessage}</span>
                          <span className="inline-block mr-2">Aesthetic Impact: {vote.scores.aestheticImpact}</span>
                        </td>
                        <td className="px-3 py-2">{vote.comment || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-xs text-gray-500 mt-2">
  <span className="inline-block mr-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1 align-middle"></span>1st Place</span>
  <span className="inline-block mr-2"><span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1 align-middle"></span>2nd Place</span>
  <span className="inline-block mr-2"><span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-1 align-middle"></span>3rd Place</span>
</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
