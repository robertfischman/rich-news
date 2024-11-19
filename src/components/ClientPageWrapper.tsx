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

  return (
    <>
      <Navbar 
        isTrendingOpen={isTrendingOpen}
        setIsTrendingOpen={setIsTrendingOpen}
      />
      
      <main 
        ref={mainRef}
        className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300 ${
          isTrendingOpen ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        {children}
        <NewsGrid />
      </main>
    </>
  );
} 