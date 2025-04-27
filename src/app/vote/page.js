'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo } from 'react';
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
  return /\.(jpe?g|png|gif|webp)$/i.test(url) || url?.startsWith('https://picsum.photos/');
}

function isPdfUrl(url) {
  return url?.toLowerCase().endsWith('.pdf');
}

import dynamic from 'next/dynamic';
const PdfImagePreview = dynamic(() => import('../components/PdfImagePreview'), { ssr: false });

import Image from 'next/image';
const ArtPreview = memo(function ArtPreview({ url, title, size = 192 }) {
  if (isGoogleDriveLink(url)) {
    const fileId = getGoogleDriveFileId(url);
    // Guess type by extension in url or fallback to PDF if not image
    if (isImageUrl(url) && fileId) {
      const directImgUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      return (
        <Image
          src={directImgUrl}
          alt={title}
          width={size}
          height={size}
          style={{ objectFit: 'contain', borderRadius: 8, background: '#f9f9f9' }}
          className="object-cover rounded mb-4"
          loading="lazy"
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
      <Image
        src={url}
        alt={title}
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 8, background: '#f9f9f9' }}
        className="object-cover rounded mb-4"
        loading="lazy"
      />
    );
  } else if (isPdfUrl(url)) {
    return <PdfImagePreview url={url} width={size} height={size} />;
  }
  // fallback: unsupported type
  return <div>Unsupported file type {isPdfUrl(url)} {isImageUrl(url)}</div>;
});

export default function VotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user?.categories || session.user.categories.length === 0) {
      router.replace('/login');
    } else {
      // Always redirect to /vote if judge is logged in and not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/vote') {
        router.replace('/vote');
      }
      if (!selectedCategory) {
        setSelectedCategory(session.user.categories[0]);
      }
    }
  }, [session, status, router, selectedCategory]);

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

      {/* Category Selector for Judges with Multiple Categories */}
      {session && session.user?.categories && session.user.categories.length > 1 && (
        <div className="mb-6 flex justify-center">
          <label className="mr-2 font-semibold">Category:</label>
          <select
            className="p-2 border rounded"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {session.user.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}
      {/* Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center animate-pulse">
              <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {artworks.filter(a => a.category === selectedCategory).length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No artworks found.</div>
          ) : (
            artworks.filter(a => a.category === selectedCategory).map(artwork => (
              <div key={artwork._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
                <ArtPreview url={artwork.imageUrl} title={artwork.title} />
                <h2 className="text-lg font-bold mt-2 mb-1 text-center">{artwork.title}</h2>
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">By {artwork.artistName}</div>
                <div className="text-gray-400 text-xs mb-2">Category: {artwork.category}</div>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-auto"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setModalOpen(true);
                  }}
                >
                  {votes.some(v => v.artworkId === artwork._id) ? 'Edit Vote' : 'Vote'}
                </button>
                {votes.some(v => v.artworkId === artwork._id) && (
                  <button
                    className="mt-2 px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const vote = votes.find(v => v.artworkId === artwork._id);
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
