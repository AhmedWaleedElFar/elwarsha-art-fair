'use client';

import { useState } from 'react';

export default function VoteModal({ artwork, open, onClose, onSubmit, previousVote }) {
  const [scores, setScores] = useState(previousVote ? previousVote.scores : {
    creativity: 3,
    technique: 3,
    artisticVision: 3,
    overallImpact: 3,
  });
  const [comment, setComment] = useState(previousVote ? previousVote.comment : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or previousVote changes
  React.useEffect(() => {
    if (open && previousVote) {
      setScores(previousVote.scores);
      setComment(previousVote.comment || '');
    } else if (open) {
      setScores({
        creativity: 3,
        technique: 3,
        artisticVision: 3,
        overallImpact: 3,
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
          {/* Left: Artwork Image */}
          <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center">
            <img src={artwork.imageUrl} alt={artwork.title} className="rounded max-h-72 object-contain w-full" />
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
                <label className="font-semibold">Creativity</label>
                <input type="range" name="creativity" min="1" max="5" value={scores.creativity} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.creativity}</span>
              </div>
              <div>
                <label className="font-semibold">Technique</label>
                <input type="range" name="technique" min="1" max="5" value={scores.technique} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.technique}</span>
              </div>
              <div>
                <label className="font-semibold">Artistic Vision</label>
                <input type="range" name="artisticVision" min="1" max="5" value={scores.artisticVision} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.artisticVision}</span>
              </div>
              <div>
                <label className="font-semibold">Overall Impact</label>
                <input type="range" name="overallImpact" min="1" max="5" value={scores.overallImpact} onChange={handleChange} className="w-full" />
                <span className="ml-2">{scores.overallImpact}</span>
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
