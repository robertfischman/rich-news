'use client';

import Image from "next/image";
import { TrendingUp } from 'lucide-react';
import TrendingSidebar from './TrendingSidebar';

interface NavbarProps {
  isTrendingOpen: boolean;
  setIsTrendingOpen: (isOpen: boolean) => void;
}

export default function Navbar({ isTrendingOpen, setIsTrendingOpen }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#27272a] bg-[#18181b]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/mush.png"
              alt="MushNews"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#ffa07a] to-[#ff7f50] bg-clip-text text-transparent">
                MushNews
              </h1>
              <p className="text-xs text-[#71717a]">Web3 News Explorer</p>
            </div>
          </div>

          {/* Trending Button - VSCode style */}
          <button
            data-trending-button
            onClick={() => setIsTrendingOpen(!isTrendingOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md
              border border-[#27272a]
              ${isTrendingOpen 
                ? 'bg-[#1f1f1f] text-white border-[#323232]' 
                : 'bg-[#1f1f1f]/50 text-[#a1a1aa] hover:bg-[#2d2d2d] hover:text-white hover:border-[#323232]'
              }
              transition-all duration-200
            `}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Trending</span>
          </button>
        </div>
      </div>

      <TrendingSidebar 
        isOpen={isTrendingOpen} 
        onClose={() => setIsTrendingOpen(false)} 
      />
    </nav>
  );
} 