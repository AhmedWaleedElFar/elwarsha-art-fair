'use client';

import { useEffect, useRef } from 'react';
import { useNavigation } from '@/app/context/NavigationContext';
import { usePathname } from 'next/navigation';

export default function TabLoadingIndicator() {
  const { isNavigating } = useNavigation();
  const pathname = usePathname();
  const originalTitleRef = useRef('');
  const originalFaviconRef = useRef('');
  const animationIntervalRef = useRef(null);
  const frameRef = useRef(0);
  
  // Initialize refs on first render
  useEffect(() => {
    // Get the current page title or use default
    originalTitleRef.current = document.title || 'El Warsha Art Fair';
    
    // Store the original favicon URL
    const faviconEl = document.querySelector('link[rel="icon"]');
    originalFaviconRef.current = faviconEl?.href || '/favicon.ico';
    
    // Clean up on unmount
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);
  
  // Handle navigation state changes
  useEffect(() => {
    // Clear any existing animation interval when component mounts or unmounts
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, []);
  
  // Handle navigation state changes
  useEffect(() => {
    // If navigation starts, update title and favicon
    if (isNavigating) {
      // Keep the original title without adding a loading indicator
      // We'll just use the favicon to show loading state
      
      // Create a loading favicon with a spinner animation
      const createLoadingFavicon = () => {
        // Use static SVG favicon as fallback if canvas is not supported
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to static loading favicon
            return () => '/loading-favicon.svg';
          }
          
          return () => {
          // Clear canvas
          ctx.clearRect(0, 0, 32, 32);
          
          // Draw background circle
          ctx.beginPath();
          ctx.arc(16, 16, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#1e1e1e';
          ctx.fill();
          
          // Draw spinner segments
          const frames = 8;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          
          for (let i = 0; i < frames; i++) {
            // Use the brand color with varying opacity
            const opacity = i === frameRef.current ? 1 : 0.2 + (i / frames * 0.3);
            ctx.strokeStyle = `rgba(147, 35, 59, ${opacity})`;
            
            ctx.beginPath();
            ctx.arc(
              16, 16, 10, 
              (i / frames) * Math.PI * 2, 
              ((i + 1) / frames) * Math.PI * 2
            );
            ctx.stroke();
          }
          
          // Update frame for next animation
          frameRef.current = (frameRef.current + 1) % frames;
          
          try {
            return canvas.toDataURL('image/png');
          } catch (e) {
            // If toDataURL fails, use static fallback
            return '/loading-favicon.svg';
          }
        };
        } catch (e) {
          // Fallback to static loading favicon if canvas creation fails
          return () => '/loading-favicon.svg';
        }
      };
      
      // Start animation
      const drawFrame = createLoadingFavicon();
      if (drawFrame) {
        // Update favicon every 100ms
        animationIntervalRef.current = setInterval(() => {
          const dataUrl = drawFrame();
          const faviconEl = document.querySelector('link[rel="icon"]');
          
          if (faviconEl) {
            faviconEl.href = dataUrl;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = dataUrl;
            document.head.appendChild(newLink);
          }
        }, 100);
      }
      
      // Set a safety timeout to ensure we don't get stuck in loading state
      const safetyTimeout = setTimeout(() => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
          
          // Restore original title and favicon
          document.title = originalTitleRef.current;
          
          const faviconEl = document.querySelector('link[rel="icon"]');
          if (faviconEl && originalFaviconRef.current) {
            faviconEl.href = originalFaviconRef.current;
          }
        }
      }, 5000); // 5 seconds max loading time
      
      // Clean up function
      return () => {
        clearTimeout(safetyTimeout);
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
        
        // Restore original title and favicon
        document.title = originalTitleRef.current;
        
        const faviconEl = document.querySelector('link[rel="icon"]');
        if (faviconEl && originalFaviconRef.current) {
          faviconEl.href = originalFaviconRef.current;
        }
      };
    } else {
      // If navigation stops, clean up any animation
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
        
        // Restore original title and favicon
        document.title = originalTitleRef.current;
        
        const faviconEl = document.querySelector('link[rel="icon"]');
        if (faviconEl && originalFaviconRef.current) {
          faviconEl.href = originalFaviconRef.current;
        }
      }
    }
  }, [isNavigating]);
  
  // Update title when pathname changes (after navigation)
  useEffect(() => {
    // Only update if we're not navigating
    if (!isNavigating) {
      // Get page name from pathname
      const pageName = pathname === '/' 
        ? 'Home' 
        : pathname.split('/').pop()?.split('-').map(s => 
            s.charAt(0).toUpperCase() + s.slice(1)
          ).join(' ') || 'Page';
      
      // Update page title
      document.title = `${pageName} | El Warsha Art Fair`;
      
      // Store as original title for next navigation
      originalTitleRef.current = document.title;
    }
  }, [pathname, isNavigating]);
  
  // This component doesn't render anything visible
  return null;
}
