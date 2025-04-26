'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VoteModal from '../components/vote/VoteModal';

function isGoogleDriveLink(url) {
  return url?.includes('drive.google.com');
}

function getGoogleDriveFileId(url) {
  let match = url.match(/\/file\/d\/([^/]+)/);
  if (match) return match[1];
  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

function isImageUrl(url) {
  return /\.(jpe?g|png|gif|webp)$/i.test(url);
}

function isPdfUrl(url) {
  return url?.toLowerCase().endsWith('.pdf');
}

import dynamic from 'next/dynamic';
const PdfImagePreview = dynamic(() => import('../components/PdfImagePreview'), { ssr: false });

function ArtPreview({ url, title, size = 192 }) {
  if (isGoogleDriveLink(url)) {
    const fileId = getGoogleDriveFileId(url);
    // Guess type by extension in url or fallback to PDF if not image
    if (isImageUrl(url) && fileId) {
      const directImgUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      return (
        <img
          src={directImgUrl}
          alt={title}
          width={size}
          height={size}
          style={{ objectFit: 'contain', borderRadius: 8, background: '#f9f9f9' }}
          className="object-cover rounded mb-4"
        />
      );
    } else if ((isPdfUrl(url) || fileId)) {
      // Use PdfImagePreview for Google Drive PDFs
      return <PdfImagePreview url={url} width={size} height={size} />;
    }
  }
  // Non-Google Drive images or PDFs
  if (isImageUrl(url)) {
    return (
      <img
        src={url}
        alt={title}
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 8, background: '#f9f9f9' }}
        className="object-cover rounded mb-4"
      />
    );
  } else if (isPdfUrl(url)) {
    return <PdfImagePreview url={url} width={size} height={size} />;
  }
  // fallback: unsupported type
  return <div>Unsupported file type</div>;
}

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
      let unmounted = false;
      try {
        const [artRes, voteRes] = await Promise.all([
          fetch('/api/artworks'),
          fetch('/api/vote?mine=1'),
        ]);
        let artData = { artworks: [] };
        let voteData = { votes: [] };
        try {
          artData = await artRes.json();
        } catch (e) {
          artData = { artworks: [] };
        }
        try {
          voteData = await voteRes.json();
        } catch (e) {
          voteData = { votes: [] };
        }
        if (!unmounted) {
          setArtworks(artData.artworks || []);
          setVotes(voteData.votes || []);
        }
      } catch (err) {
        if (!unmounted) {
          setArtworks([]);
          setVotes([]);
        }
      } finally {
        if (!unmounted) setLoading(false);
      }
      return () => { unmounted = true; };
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
                <ArtPreview url={art.imageUrl} title={art.title} size={192} />
                <h2 className="text-lg font-semibold mb-1">{art.title}</h2>
                <p className="text-gray-500 mb-2">{art.artistName}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-1 rounded">{art.category}</span>
                  {votes.some(v => v.artworkId === art._id) && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold border border-green-300">Voted</span>
                  )}
                </div>
                <button className="mt-2 px-4 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">Vote</button>
                {votes.some(v => v.artworkId === art._id) && (
                  <button
                    className="mt-2 px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const vote = votes.find(v => v.artworkId === art._id);
                      if (!vote) return;
                      if (confirm('Are you sure you want to delete your vote for this artwork?')) {
                        const res = await fetch(`/api/vote/${vote._id}`, { method: 'DELETE' });
                        let ok = res.ok;
                        let data = {};
                        try {
                          data = await res.json();
                        } catch {}
                        if (ok && data.success) {
                          setVotes(votes => votes.filter(v => v._id !== vote._id));
                          alert('Vote deleted.');
                        } else {
                          alert('Failed to delete vote.');
                        }
                      }
                    }}
                  >Delete Vote</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Judge Votes Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">My Votes</h2>
        {votes.length === 0 ? (
          <div className="text-gray-500">You have not voted on any artworks yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr>
                  <th className="px-3 py-2">Artwork</th>
                  <th className="px-3 py-2">Artist</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Scores</th>
                  <th className="px-3 py-2">Comment</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {votes.map(vote => {
                  const art = artworks.find(a => a._id === vote.artworkId);
                  return (
                    <tr key={vote._id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-semibold">{art ? art.title : 'Unknown'}</td>
                      <td className="px-3 py-2">{art ? art.artistName : '-'}</td>
                      <td className="px-3 py-2">{art ? art.category : '-'}</td>
                      <td className="px-3 py-2">
                        {Object.entries(vote.scores).map(([k, v]) => (
                          <span key={k} className="inline-block mr-2">{k}: {v}</span>
                        ))}
                      </td>
                      <td className="px-3 py-2">{vote.comment || '-'}</td>
                      <td className="px-3 py-2">
                        <button
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this vote?')) {
                              const res = await fetch(`/api/vote/${vote._id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setVotes(votes => votes.filter(v => v._id !== vote._id));
                                alert('Vote deleted.');
                              } else {
                                alert('Failed to delete vote.');
                              }
                            }
                          }}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
