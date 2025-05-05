'use client';

export default function LoadingSpinner({ size = 'medium', color = '#93233B' }) {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size];

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClass} animate-spin rounded-full border-4 border-solid border-t-transparent`} 
        style={{ borderColor: `${color} transparent transparent transparent` }}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
