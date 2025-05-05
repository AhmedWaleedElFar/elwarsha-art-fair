'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NavigationContext = createContext({
  isNavigating: false,
  startNavigation: () => {},
  endNavigation: () => {},
});

// Main provider that can be used anywhere, including server components
export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Create functions at this level to avoid re-creation
  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, [setIsNavigating]);
  
  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);
  
  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      <NavigationEffects 
        isNavigating={isNavigating} 
        setIsNavigating={setIsNavigating}
      />
      {children}
    </NavigationContext.Provider>
  );
}

// Separate component for side effects
function NavigationEffects({ isNavigating, setIsNavigating }) {
  const navigationTimeoutRef = useRef(null);
  
  // Auto-reset navigation state after timeout
  useEffect(() => {
    if (isNavigating) {
      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Set a timeout to turn off loading state after a delay
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        navigationTimeoutRef.current = null;
      }, 300);
      
      // Safety timeout to prevent stuck loading state
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
    }
  }, [isNavigating, setIsNavigating]);
  
  // Handle beforeunload event for full page refreshes
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsNavigating(true);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [setIsNavigating]);
  
  // This component doesn't render anything
  return null;
}

// Hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext);
}
