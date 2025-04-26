'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VoteModal from '../components/vote/VoteModal';

export default function VotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user?.category) {
      router.replace('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchArtworksAndVotes() {
      setLoading(true);
      const [artRes, voteRes] = await Promise.all([
        fetch('/api/artworks'),
        fetch('/api/vote?mine=1'),
      ]);
      const artData = await artRes.json();
      const voteData = await voteRes.json();
      setArtworks(artData.artworks || []);
      setVotes(voteData.votes || []);
      setLoading(false);
    }
    fetchArtworksAndVotes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Vote for Artworks</h1>

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-10 text-lg">Loading artworks...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {artworks.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No artworks found.</div>
          ) : (
            artworks.map((art) => (
              <div
                key={art._id}
                className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedArtwork(art);
                  setModalOpen(true);
                }}
              >
                <img src={art.imageUrl} alt={art.title} className="w-full h-48 object-cover rounded mb-4" />
                <h2 className="text-lg font-semibold mb-1">{art.title}</h2>
                <p className="text-gray-500 mb-2">{art.artistName}</p>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-1 rounded mb-2">{art.category}</span>
                <button className="mt-2 px-4 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">Vote</button>
              </div>
            ))
          )}
        </div>
      )}
      <VoteModal
        artwork={selectedArtwork}
        open={modalOpen}
        previousVote={selectedArtwork && votes.find(v => v.artworkId === selectedArtwork._id)}
        onClose={() => setModalOpen(false)}
        onSubmit={async (voteData) => {
          if (!selectedArtwork) return;
          try {
            const res = await fetch('/api/vote', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                artworkId: selectedArtwork._id,
                scores: voteData.scores,
                comment: voteData.comment,
              }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to submit vote');
            setVotes(votes => {
              const idx = votes.findIndex(v => v.artworkId === selectedArtwork._id);
              const newVote = result.vote;
              if (idx !== -1) {
                const updated = [...votes];
                updated[idx] = newVote;
                return updated;
              } else {
                return [...votes, newVote];
              }
            });
            setModalOpen(false);
            alert('Vote submitted!');
          } catch (err) {
            alert(err.message);
          }
        }}
      />
    </div>
  );
}
