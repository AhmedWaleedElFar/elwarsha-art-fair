"use client";

import { useEffect, useState, useMemo } from "react";
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VoteModal from "../components/vote/VoteModal";
import LoadingLink from "@/app/components/ui/LoadingLink";

function totalScore(scores) {
  return Object.values(scores || {}).reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
}

export default function JudgeVotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [votes, setVotes] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

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

  function handleEditVote(vote) {
    const artwork = getArtwork(vote.artworkId);
    if (artwork) {
      setSelectedVote(vote);
      setSelectedArtwork(artwork);
      setModalOpen(true);
    }
  }

  async function updateVote(voteData) {
    try {
      const response = await fetch(`/api/vote/${selectedVote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error('Failed to update vote');
      }

      // Update the local state with the updated vote
      setVotes(prevVotes => 
        prevVotes.map(vote => 
          vote._id === selectedVote._id ? 
            { ...vote, scores: voteData.scores, comment: voteData.comment } : 
            vote
        )
      );

      // Close the modal
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating vote:', error);
      throw error;
    }
  }

  async function deleteVote(voteId) {
    setConfirmDelete(votes.find(vote => vote._id === voteId));
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Welcome, {session?.user?.name || session?.user?.firstName || session?.user?.username || 'Judge'}</h1>
        <h2 className="text-xl text-center text-gray-300 mb-8">My Votes</h2>

        <div className="flex items-center justify-between mb-6">
              <LoadingLink 
                href="/vote" 
                onClick={(e) => {
                  if (window.location.pathname === '/vote') {
                    e.preventDefault();
                  }
                }}
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Voting
              </LoadingLink>
              {/* <LoadingLink 
                href="/" 
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                  }
                }}
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </LoadingLink> */}
            </div>

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
                      if (idx === 0) rowClass = 'border-l-4 border-yellow-500 bg-yellow-500 bg-opacity-20';
                      else if (idx === 1) rowClass = 'border-l-4 border-gray-500 bg-gray-500 bg-opacity-20';
                      else if (idx === 2) rowClass = 'border-l-4 border-orange-500 bg-orange-500 bg-opacity-20';
                      return (
                        <tr key={vote._id} className={rowClass}>
                          <td className="px-4 py-3 font-semibold">{art ? art.title : "Unknown"}</td>
                          <td className="px-4 py-3 text-gray-300">{art ? art.artistName : "-"}</td>
                          <td className="px-4 py-3 font-bold text-[#93233B]">{totalScore(vote.scores)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col space-y-1 text-sm">
                              <span><span className="text-gray-400">Technique & Execution:</span> {vote.scores.techniqueExecution}</span>
                              <span><span className="text-gray-400">Creativity & Originality:</span> {vote.scores.creativityOriginality}</span>
                              <span><span className="text-gray-400">Concept / Message:</span> {vote.scores.conceptMessage}</span>
                              <span><span className="text-gray-400">Aesthetic Impact:</span> {vote.scores.aestheticImpact}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            <div className="flex items-center justify-between">
                              <div>{vote.comment || "-"}</div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleEditVote(vote)}
                                  className="ml-2 text-gray-300 hover:text-[#93233B] transition-colors px-2 py-1 rounded hover:bg-[#2a2a2a]"
                                  title="Edit vote"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteVote(vote._id)}
                                  className="ml-2 text-gray-300 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-[#2a2a2a]"
                                  title="Delete vote"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Vote Deletion */}
      <ConfirmationModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const response = await fetch(`/api/vote/${confirmDelete._id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete vote');
            }

            // Remove the deleted vote from the local state
            setVotes(prevVotes => prevVotes.filter(vote => vote._id !== confirmDelete._id));
            toast.success('Vote deleted successfully.');
          } catch (error) {
            console.error('Error deleting vote:', error);
            toast.error('Failed to delete vote. Please try again.');
          } finally {
            setConfirmDelete(null);
          }
        }}
        title="Delete Vote"
        message="Are you sure you want to delete this vote? This action cannot be undone."
        confirmText="Delete Vote"
        variant="danger"
      />

      <VoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={updateVote}
        previousVote={selectedVote}
        artwork={selectedArtwork}
      />
    </div>
  );
}