'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo } from 'react';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import VoteModal from '../components/vote/VoteModal';
import LoadingLink from '@/app/components/ui/LoadingLink';

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
  const [imageError, setImageError] = useState(false);

  if (isGoogleDriveLink(url)) {
    const fileId = getGoogleDriveFileId(url);
    
    // Guess type by extension in url or fallback to PDF if not image
    if (isImageUrl(url) && fileId) {
      const directImgUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      
      return (
        <div 
          style={{ 
            position: 'relative', 
            width: size, 
            height: size, 
            background: '#2a2a2a',
            borderRadius: 8,
            overflow: 'hidden'
          }}
        >
          {!imageError ? (
            <Image
              src={directImgUrl}
              alt={title || 'Artwork Preview'}
              fill
              style={{ 
                objectFit: 'contain', 
                borderRadius: 8 
              }}
              onError={() => setImageError(true)}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                color: 'white',
                textAlign: 'center',
                padding: '10px'
              }}
            >
              Image Failed to Load
            </div>
          )}
        </div>
      );
    } else if ((isPdfUrl(url) || fileId)) {
      // Existing PDF preview logic remains the same
      return <PdfImagePreview url={url} />;
    }
  }

  // Fallback for non-Google Drive URLs
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        background: '#2a2a2a',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '10px'
      }}
    >
      No Preview Available
    </div>
  );
});

export default function VotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [codeSearch, setCodeSearch] = useState('');

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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Welcome, {session?.user?.name || session?.user?.firstName || session?.user?.username}</h1>
        <h2 className="text-xl text-center text-gray-300 mb-8">Vote on Artworks</h2>
        
        <div className="flex items-center justify-between mb-6">
          <LoadingLink 
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
          </LoadingLink>
          <LoadingLink 
            href="/judge-votes" 
            onClick={(e) => {
              if (window.location.pathname === '/judge-votes') {
                e.preventDefault();
              }
            }}
            className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a] flex items-center">
            My Votes
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </LoadingLink>
        </div>

        {/* Search by artwork code */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            value={codeSearch}
            onChange={e => setCodeSearch(e.target.value)}
            placeholder="Search by artwork code..."
            className="w-full max-w-xs px-4 py-2 rounded-md bg-[#1e1e1e] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
            aria-label="Search by artwork code"
          />
        </div>

        {/* Category Selector for Judges with Multiple Categories */}
        {session && session.user?.categories && session.user.categories.length > 1 && (
          <div className="mb-6 flex justify-center">
            <label className="mr-2 font-semibold text-gray-300">Category:</label>
            <select
              className="p-2 bg-[#1e1e1e] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
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
              <div key={i} className="bg-[#1e1e1e] rounded-lg shadow-lg p-4 flex flex-col items-center animate-pulse">
                <div className="w-48 h-48 bg-[#2a2a2a] rounded mb-4" />
                <div className="h-5 w-32 bg-[#2a2a2a] rounded mb-2" />
                <div className="h-4 w-24 bg-[#2a2a2a] rounded mb-1" />
                <div className="h-3 w-20 bg-[#2a2a2a] rounded mb-2" />
                <div className="h-10 w-32 bg-[#2a2a2a] rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {artworks.filter(a => 
              codeSearch
                ? (a.artworkCode && a.artworkCode.toLowerCase().includes(codeSearch.toLowerCase()))
                : a.category === selectedCategory
            ).length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No artworks found.</div>
          ) : (
            artworks
              .filter(a => 
                codeSearch
                  ? (a.artworkCode && a.artworkCode.toLowerCase().includes(codeSearch.toLowerCase()))
                  : a.category === selectedCategory
              )
              .map(artwork => (
              <div key={artwork._id} className="bg-[#1e1e1e] rounded-lg shadow-lg p-4 flex flex-col items-center">
                <div className="bg-[#2a2a2a] p-2 rounded mb-4 flex items-center justify-center">
                  <ArtPreview url={artwork.imageUrl} title={artwork.title} />
                </div>
                <h2 className="text-lg font-bold mt-2 mb-1 text-center">{artwork.title}</h2>
                <div className="text-gray-300 text-sm mb-1">By {artwork.artistName}</div>
                <div className="text-gray-400 text-xs mb-2">Category: <span className="text-[#93233B]">{artwork.category}</span></div>
                {/* Artwork Code below image */}
                {artwork.artworkCode && (
                  <div className="text-xs font-mono text-[#93233B] bg-[#2a2a2a] px-2 py-1 rounded mb-2 break-all">
                    Code: {artwork.artworkCode}
                  </div>
                )}
                <button
                  className="bg-[#93233B] hover:bg-[#7a1d31] text-white px-4 py-2 rounded-md mt-auto transition-colors"
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setModalOpen(true);
                  }}
                >
                  {votes.some(v => v.artworkId === artwork._id) ? 'Edit Vote' : 'Vote'}
                </button>
                {votes.some(v => v.artworkId === artwork._id) && (
                  <button
                    className="mt-2 px-4 py-1 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                    onClick={() => setConfirmDelete(votes.find(v => v.artworkId === artwork._id))}
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
            toast.success('Vote submitted!');
          } catch (err) {
            toast.error(err.message);
          }
        }}
      />
      {/* Confirmation Modal for Vote Deletion */}
      <ConfirmationModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/vote/${confirmDelete._id}`, { method: 'DELETE' });
            let ok = res.ok;
            let data = {};
            try {
              data = await res.json();
            } catch {}
            if (ok && data.success) {
              setVotes(votes => votes.filter(v => v._id !== confirmDelete._id));
              toast.success('Vote deleted.');
            } else {
              toast.error('Failed to delete vote.');
            }
          } catch (error) {
            toast.error('Error deleting vote.');
          } finally {
            setConfirmDelete(null);
          }
        }}
        title="Delete Vote"
        message="Are you sure you want to delete your vote for this artwork? This action cannot be undone."
        confirmText="Delete Vote"
        variant="danger"
      />
    </div>
  </div>
  );
}
