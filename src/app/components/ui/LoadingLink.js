'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigation } from '@/app/context/NavigationContext';

export default function LoadingLink({ href, children, className, onClick, ...props }) {
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isNavigating, startNavigation, endNavigation } = useNavigation();
  
  // Reset local loading state when navigation completes or pathname changes
  useEffect(() => {
    if (!isNavigating && localLoading) {
      setLocalLoading(false);
    }
  }, [isNavigating, pathname, localLoading]);
  
  // Safety timeout to prevent stuck loading state
  useEffect(() => {
    let timeoutId = null;
    if (localLoading) {
      timeoutId = setTimeout(() => {
        setLocalLoading(false);
      }, 3000); // 3 seconds max loading time
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [localLoading]);

  const handleClick = (e) => {
    // If it's an external link or has onClick handler, don't show loading state
    if (href.startsWith('http')) {
      if (onClick) onClick(e);
      return;
    }

    // If there's a custom onClick handler, call it but still show loading state
    if (onClick) {
      onClick(e);
      // If the onClick handler called e.preventDefault(), respect that
      if (e.defaultPrevented) return;
    }

    e.preventDefault();
    setLocalLoading(true);
    startNavigation(); // Trigger the global loading state
    
    // Navigate after a small delay to ensure the loading state is visible
    const timeoutId = setTimeout(() => {
      router.push(href);
    }, 50);
    
    // Safety cleanup in case navigation fails
    const safetyTimeout = setTimeout(() => {
      setLocalLoading(false);
      endNavigation();
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
    };
  };

  return (
    <Link 
      href={href} 
      className={`w-full sm:w-auto min-h-[44px] ${className} ${localLoading ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={handleClick} 
      aria-disabled={localLoading}
      aria-busy={localLoading}
      {...props}
    >
      {localLoading ? (
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
