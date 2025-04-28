'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const PdfImagePreview = dynamic(() => import('../PdfImagePreview'), { ssr: false });

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
  }, [open, previousVote]);

  if (!open || !artwork) return null;

  function handleChange(e) {
    setScores({ ...scores, [e.target.name]: Number(e.target.value) });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col md:flex-row gap-6">
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
              if (isGoogleDriveLink(url) || isPdfUrl(url)) {
                return <PdfImagePreview url={url} width={288} height={288} />;
              } else if (isImageUrl(url)) {
                return <img src={url} alt={artwork.title} className="rounded max-h-72 object-contain w-full" />;
              } else {
                return <div className="text-gray-400">Unsupported file type</div>;
              }
            })()}
          </div>
          {/* Right: Details & Voting */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-bold mb-2">{artwork.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-1"><span className="font-semibold">Artist:</span> {artwork.artistName}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-1"><span className="font-semibold">Medium:</span> {artwork.category}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-1"><span className="font-semibold">Code:</span> {artwork.artworkCode}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-3"><span className="font-semibold">Description:</span> {artwork.description}</p>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <div>
                <label className="font-semibold">Technique & Execution</label>
                <input type="range" name="techniqueExecution" min="0" max="10" value={scores.techniqueExecution} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.techniqueExecution}</span>
              </div>
              <div>
                <label className="font-semibold">Creativity & Originality</label>
                <input type="range" name="creativityOriginality" min="0" max="10" value={scores.creativityOriginality} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.creativityOriginality}</span>
              </div>
              <div>
                <label className="font-semibold">Concept / Message</label>
                <input type="range" name="conceptMessage" min="0" max="10" value={scores.conceptMessage} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.conceptMessage}</span>
              </div>
              <div>
                <label className="font-semibold">Aesthetic Impact</label>
                <input type="range" name="aestheticImpact" min="0" max="10" value={scores.aestheticImpact} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.aestheticImpact}</span>
              </div>
              <div>
                <label className="font-semibold">Comment (optional)</label>
                <textarea
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Your feedback..."
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Vote'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
