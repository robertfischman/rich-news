'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import NewsGrid from './NewsGrid';

interface ClientPageWrapperProps {
  children: React.ReactNode;
}

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const trendingSidebar = document.querySelector('[data-trending-sidebar]');
      const trendingButton = document.querySelector('[data-trending-button]');
      
      if (isTrendingOpen && 
          trendingSidebar && 
          trendingButton && 
          !trendingSidebar.contains(event.target as Node) && 
          !trendingButton.contains(event.target as Node)) {
        setIsTrendingOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTrendingOpen]);

  // Disable scrolling and interactions when trending is open
  useEffect(() => {
    if (isTrendingOpen) {
      // Add class to body to prevent scrolling
      document.body.style.overflow = 'hidden';
      // Disable all select elements in the main content
      const selects = mainRef.current?.querySelectorAll('select');
      selects?.forEach(select => {
        select.style.pointerEvents = 'none';
        select.tabIndex = -1;
      });
    } else {
      // Re-enable scrolling and interactions
      document.body.style.overflow = 'auto';
      const selects = mainRef.current?.querySelectorAll('select');
      selects?.forEach(select => {
        select.style.pointerEvents = 'auto';
        select.tabIndex = 0;
      });
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isTrendingOpen]);

  return (
    <>
      <Navbar 
        isTrendingOpen={isTrendingOpen}
        setIsTrendingOpen={setIsTrendingOpen}
      />
      
      <main 
        ref={mainRef}
        className={`
          pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto 
          transition-all duration-300
          ${isTrendingOpen ? 'blur-sm pointer-events-none select-none' : ''}
        `}
        aria-hidden={isTrendingOpen}
      >
        {children}
        <NewsGrid />
      </main>

      {/* Overlay to prevent interactions when trending is open */}
      {isTrendingOpen && (
        <div 
          className="fixed inset-0 z-30 bg-transparent"
          aria-hidden="true"
        />
      )}
    </>
  );
} 