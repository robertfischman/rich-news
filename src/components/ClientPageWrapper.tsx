'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import NewsGrid from './NewsGrid';

interface ClientPageWrapperProps {
  children: React.ReactNode;
}

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [isCryptoPricesOpen, setIsCryptoPricesOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Add window resize listener
  useEffect(() => {
    // Initialize window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close mobile popups when window size changes to desktop
      if (window.innerWidth >= 768) {
        if (isTrendingOpen) setIsTrendingOpen(false);
        if (isCryptoPricesOpen) setIsCryptoPricesOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isTrendingOpen, isCryptoPricesOpen]);

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

  useEffect(() => {
    const isMobile = windowWidth < 768; // md breakpoint

    if ((isTrendingOpen || isCryptoPricesOpen) && isMobile) {
      document.body.style.overflow = 'hidden';
      const selects = mainRef.current?.querySelectorAll('select');
      selects?.forEach(select => {
        select.style.pointerEvents = 'none';
        select.tabIndex = -1;
      });
    } else {
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
  }, [isTrendingOpen, isCryptoPricesOpen, windowWidth]);

  return (
    <>
      <Navbar 
        isTrendingOpen={isTrendingOpen}
        setIsTrendingOpen={setIsTrendingOpen}
        isCryptoPricesOpen={isCryptoPricesOpen}
        setIsCryptoPricesOpen={setIsCryptoPricesOpen}
      />
      
      <main 
        ref={mainRef}
        className={`
          pt-24 pb-12 px-4 sm:px-6 lg:px-8 mx-auto
          transition-all duration-300
          ${windowWidth >= 1920 ? 'max-w-[90rem]' : 'max-w-7xl'}
          ${(isTrendingOpen || isCryptoPricesOpen) ? 'md:blur-none blur-sm md:pointer-events-auto pointer-events-none md:select-text select-none' : ''}
        `}
        aria-hidden={isTrendingOpen || isCryptoPricesOpen}
        style={{
          minHeight: 'calc(100vh - 4rem)',
          overflowX: 'hidden'
        }}
      >
        {children}
        <NewsGrid />
      </main>

      {/* Overlay only for mobile */}
      {(isTrendingOpen || isCryptoPricesOpen) && windowWidth < 768 && (
        <div 
          className="fixed inset-0 z-30 bg-transparent"
          aria-hidden="true"
        />
      )}
    </>
  );
} 