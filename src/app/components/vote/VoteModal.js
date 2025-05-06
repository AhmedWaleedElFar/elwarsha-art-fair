'use client';

import { useState, useEffect } from 'react';
import styles from './VoteModal.module.css';
import dynamic from 'next/dynamic';
import LoadingButton from '@/app/components/ui/LoadingButton';

const PdfImagePreview = dynamic(() => import('@/app/components/PdfImagePreview'), {
  ssr: false,
});

const ArtworkImagePreview = dynamic(() => import('@/app/components/ArtworkImagePreview'), {
  ssr: false,
});

export default function VoteModal({ artwork, open, onClose, onSubmit, previousVote }) {
  const [scores, setScores] = useState(previousVote ? previousVote.scores : {
    techniqueExecution: 5,
    creativityOriginality: 5,
    conceptMessage: 5,
    aestheticImpact: 5,
  });
  const [comment, setComment] = useState(previousVote ? previousVote.comment : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or previousVote changes
  useEffect(() => {
    if (open && previousVote) {
      setScores(previousVote.scores);
      setComment(previousVote.comment || '');
    } else if (open) {
      setScores({
        techniqueExecution: 5,
        creativityOriginality: 5,
        conceptMessage: 5,
        aestheticImpact: 5,
      });
      setComment('');
    }
    
    // Update range slider fills when modal opens
    if (open) {
      setTimeout(() => {
        const rangeInputs = document.querySelectorAll(`.${styles.customRange}`);
        rangeInputs.forEach(input => {
          const value = input.value;
          const percent = (value / 10) * 100;
          input.style.setProperty('--range-progress', `${percent}%`);
        });
      }, 50);
    }
  }, [open, previousVote]);

  if (!open || !artwork) return null;

  // Responsive modal wrapper
  // Use fixed inset-0 z-50 for overlay, flex for centering, and responsive modal width

  function handleChange(e) {
    const value = Number(e.target.value);
    setScores({ ...scores, [e.target.name]: value });
    
    // Update the range slider fill using CSS variable
    const percent = (value / 10) * 100;
    e.target.style.setProperty('--range-progress', `${percent}%`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ scores, comment });
    } catch (err) {
      setError('Failed to submit vote.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-auto p-2" role="dialog" aria-modal="true">
      <div className="bg-[#1e1e1e] rounded-lg shadow-lg max-w-lg w-full p-4 sm:p-8 relative text-white">
        {/* <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors text-2xl w-10 h-10 flex items-center justify-center focus:outline-none"
          onClick={onClose}
          aria-label="Close"
          tabIndex={0}
        >
          ×
        </button> */}
        <div className="flex flex-col md:flex-row gap-6 overflow-y-auto max-h-[70vh] pb-4">

          {/* Left: Artwork Preview (PDF, Google Drive, or Image) */}
          <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center">
            {(() => {
              function isGoogleDriveLink(url) {
                return url && url.includes('drive.google.com');
              }
              function isPdfUrl(url) {
                return url && url.toLowerCase().endsWith('.pdf');
              }
              function isImageUrl(url) {
                return /\.(jpe?g|png|gif|webp)$/i.test(url) || url?.startsWith('https://picsum.photos/');
              }
              const url = artwork.imageUrl;
              // if (isGoogleDriveLink(url) || isPdfUrl(url)) {
              //   return <PdfImagePreview url={url} width={288} height={288} />;
              // } else if (isImageUrl(url)) {
              //   return <img src={url} alt={artwork.title} className="rounded max-h-72 object-contain w-full bg-[#2a2a2a] p-2" />;
              // } else {
              //   return <div className="w-full h-48 flex items-center justify-center bg-[#2a2a2a] rounded text-gray-400">Unsupported file type</div>;
              // }
              {isImageUrl(artwork.imageUrl) || isGoogleDriveLink(artwork.imageUrl) || isPdfUrl(artwork.imageUrl) ? (
                <ArtworkImagePreview 
                  url={artwork.imageUrl} 
                  width={300} 
                  height={400} 
                  objectFit="contain" 
                />
              ) : (
                <div className="text-red-500">Invalid artwork image</div>
              )}
            })()}
          </div>
          {/* Right: Details & Voting */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-bold mb-2 text-white">{artwork.title}</h2>
            <p className="text-gray-300 mb-1"><span className="font-semibold text-white">Artist:</span> {artwork.artistName}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold text-white">Medium:</span> <span className="text-[#93233B]">{artwork.category}</span></p>
            <p className="text-gray-300 mb-1"><span className="font-semibold text-white">Code:</span> {artwork.artworkCode}</p>
            <p className="text-gray-300 mb-3"><span className="font-semibold text-white">Description:</span> {artwork.description}</p>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <div>
                <label className="font-semibold text-white">Technique & Execution</label>
                <input type="range" name="techniqueExecution" min="0" max="10" value={scores.techniqueExecution} onChange={handleChange} className={`w-full ${styles.customRange}`} />
                <span className="ml-2 text-[#93233B] font-medium">{scores.techniqueExecution}</span>
              </div>
              <div>
                <label className="font-semibold text-white">Creativity & Originality</label>
                <input type="range" name="creativityOriginality" min="0" max="10" value={scores.creativityOriginality} onChange={handleChange} className={`w-full ${styles.customRange}`} />
                <span className="ml-2 text-[#93233B] font-medium">{scores.creativityOriginality}</span>
              </div>
              <div>
                <label className="font-semibold text-white">Concept / Message</label>
                <input type="range" name="conceptMessage" min="0" max="10" value={scores.conceptMessage} onChange={handleChange} className={`w-full ${styles.customRange}`} />
                <span className="ml-2 text-[#93233B] font-medium">{scores.conceptMessage}</span>
              </div>
              <div>
                <label className="font-semibold text-white">Aesthetic Impact</label>
                <input type="range" name="aestheticImpact" min="0" max="10" value={scores.aestheticImpact} onChange={handleChange} className={`w-full ${styles.customRange}`} />
                <span className="ml-2 text-[#93233B] font-medium">{scores.aestheticImpact}</span>
              </div>
              <div>
                <label className="font-semibold text-white">Comment (optional)</label>
                <textarea
                  className="w-full rounded-md border border-gray-600 bg-[#2a2a2a] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#93233B]"
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Your feedback..."
                />
              </div>
              {error && <div className="text-[#ff6b6b] text-sm">{error}</div>}
              <LoadingButton
                type="submit"
                isLoading={submitting}
                className="w-full bg-[#93233B] hover:bg-[#7a1d31] text-white font-semibold py-2 rounded-md disabled:opacity-60 transition-colors"
              >
                Submit Vote
              </LoadingButton>
            </form>
          </div>
        </div>
        {/* Close Vote button for mobile accessibility */}
        <button
          className="mt-4 w-full rounded-md bg-[#93233B] px-4 py-3 text-base font-semibold text-white hover:bg-[#7a1d31] transition-colors focus:outline-none focus:ring-2 focus:ring-[#93233B]"
          onClick={onClose}
          aria-label="Close Vote Modal"
        >
          Close Vote
        </button>
      </div>
    </div>
  );
}
