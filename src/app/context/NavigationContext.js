'use client';

"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NavigationContext = createContext({
  isNavigating: false,
  startNavigation: () => {},
  endNavigation: () => {},
});

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  return (
    <NavigationProviderInner isNavigating={isNavigating} setIsNavigating={setIsNavigating}>
      {children}
    </NavigationProviderInner>
  );
}

function NavigationProviderInner({ isNavigating, setIsNavigating, children }) {
  const navigationTimeoutRef = useRef(null);

  // Explicitly expose methods to start and end navigation state
  const startNavigation = useCallback(() => {
    // Clear any existing timeout to prevent race conditions
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    setIsNavigating(true);
  }, []);
  
  const endNavigation = useCallback(() => {
    // Clear any existing timeout to prevent race conditions
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    setIsNavigating(false);
  }, []);

  // Reset navigation state when the route changes
  useEffect(() => {
    // Check if the route actually changed
    const pathChanged = previousPathRef.current !== pathname;
    const searchParamsChanged = previousSearchParamsRef.current?.toString() !== searchParams?.toString();
    
    if (pathChanged || searchParamsChanged) {
      // Update refs
      previousPathRef.current = pathname;
      previousSearchParamsRef.current = searchParams;
      
      // Set a timeout to ensure the loading state is visible for a moment
      // but also ensure it eventually turns off
      if (isNavigating) {
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        
        navigationTimeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
          navigationTimeoutRef.current = null;
        }, 300);
      }
    }
    
    // Ensure we always have a safety timeout to turn off loading state
    // This prevents the loading state from getting stuck
    const safetyTimeout = setTimeout(() => {
      if (isNavigating) {
        setIsNavigating(false);
      }
    }, 3000); // 3 seconds max loading time
    
    return () => {
      clearTimeout(safetyTimeout);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [ searchParams, isNavigating]);

  // Handle beforeunload event for full page refreshes
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsNavigating(true);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
