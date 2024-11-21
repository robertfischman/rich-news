'use client';

import Image from "next/image";
import { TrendingUp } from 'lucide-react';
import TrendingSidebar from './TrendingSidebar';
import FearGreedIndex from './FearGreedIndex';
import LongShortRatio from './LongShortRatio';
import CryptoWidget from './CryptoWidget';

interface NavbarProps {
  isTrendingOpen: boolean;
  setIsTrendingOpen: (isOpen: boolean) => void;
  isCryptoPricesOpen: boolean;
  setIsCryptoPricesOpen: (isOpen: boolean) => void;
}

export default function Navbar({ 
  isTrendingOpen, 
  setIsTrendingOpen,
  isCryptoPricesOpen,
  setIsCryptoPricesOpen 
}: NavbarProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#27272a] bg-[#18181b]/95 backdrop-blur-md">
      <div className={`
        mx-auto px-4 sm:px-6 lg:px-8
        ${window.innerWidth >= 1920 ? 'max-w-screen-2xl' : 'max-w-7xl'}
      `}>
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleRefresh}
            title="Refresh page"
          >
            <Image
              src="/mush.png"
              alt="MushNews"
              width={32}
              height={32}
              className="rounded-full"
              style={{
                transform: window.innerWidth >= 1920 ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <h1 className={`
              text-lg font-bold bg-gradient-to-r from-[#ffa07a] to-[#ff7f50] 
              bg-clip-text text-transparent
              ${window.innerWidth >= 1920 ? 'text-xl' : 'text-lg'}
            `}>
              MushNews
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center">
              <CryptoWidget.MainPrices />
            </div>
            <div className={`
              flex items-center bg-[#1f1f1f]/50 rounded-md border border-[#27272a] 
              divide-x divide-[#27272a]
              ${window.innerWidth >= 1920 ? 'scale-110' : 'scale-100'}
            `}>
              <FearGreedIndex />
              <LongShortRatio />
              <CryptoWidget.Dropdown 
                isOpen={isCryptoPricesOpen}
                setIsOpen={setIsCryptoPricesOpen}
              />
              <button
                data-trending-button
                onClick={() => setIsTrendingOpen(!isTrendingOpen)}
                className={`
                  px-2 py-1.5
                  ${isTrendingOpen 
                    ? 'text-white bg-[#2d2d2d]' 
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#2d2d2d]'
                  }
                  transition-colors duration-200
                `}
                title="Trending Coins"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <TrendingSidebar 
        isOpen={isTrendingOpen} 
        onClose={() => setIsTrendingOpen(false)} 
      />
    </nav>
  );
} 