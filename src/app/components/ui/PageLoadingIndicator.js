'use client';

import { useNavigation } from '@/app/context/NavigationContext';
import LoadingSpinner from './LoadingSpinner';

export default function PageLoadingIndicator() {
  const { isNavigating } = useNavigation();

  if (!isNavigating) return null;

  // Prevent background scroll when loading
  // (handled by overlay's fixed/overflow-auto)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-70 flex items-center justify-center h-screen w-full overflow-auto" role="status" aria-live="polite">
      <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-lg shadow-xl border border-gray-800 flex flex-col items-center max-w-xs w-full">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-white font-medium">Loading page...</p>
      </div>
    </div>
  );
}
