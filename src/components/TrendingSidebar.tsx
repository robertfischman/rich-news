'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { formatUSD, formatPercent } from '@/lib/utils';

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
  current_price?: number;
  price_change_24h?: number;
  score: number;
  isTrending: boolean;
}

type SortType = 'trending' | 'gainers' | 'market_cap';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs * (i + 1)); // Increment delay
    }
  }
};

export default function TrendingSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>('trending');

  useEffect(() => {
    async function fetchCoins() {
      try {
        setError(null);
        
        // Only call our API route
        const response = await fetchWithRetry(`/api/trending?sort=${sortType}`);
        
        if (response.error) {
          throw new Error(response.error);
        }

        let sortedCoins: TrendingCoin[] = [];
        
        if (sortType === 'trending' && response.coins) {
          // Process trending data
          sortedCoins = response.coins.map((coin: any) => ({
            id: coin.item.id,
            name: coin.item.name,
            symbol: coin.item.symbol,
            thumb: coin.item.thumb,
            market_cap_rank: coin.item.market_cap_rank,
            current_price: response.market_data.find((m: any) => m.id === coin.item.id)?.current_price || 0,
            price_change_24h: response.market_data.find((m: any) => m.id === coin.item.id)?.price_change_percentage_24h || 0,
            score: coin.item.score,
            isTrending: true
          }));
        } else {
          // Process gainers and market cap data
          sortedCoins = response.market_data
            .slice(0, 21)
            .map((coin: any) => ({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              thumb: coin.image,
              market_cap_rank: coin.market_cap_rank,
              current_price: coin.current_price,
              price_change_24h: coin.price_change_percentage_24h,
              score: 0,
              isTrending: false
            }));
        }

        setCoins(sortedCoins);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
        setError('Failed to load data. Please try again later.');
        setCoins([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchCoins();
      // Refresh data every 5 minutes
      const interval = setInterval(fetchCoins, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, sortType]);

  return (
    <div 
      data-trending-sidebar
      className={`
        fixed top-16 right-0 w-72 bg-[#18181b]/95 backdrop-blur-md
        transform transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        z-40 border-l border-[#27272a]
      `}
    >
      <div className="flex items-center gap-2 p-2 pl-3 border-b border-[#27272a] sticky top-0 bg-[#18181b]/95 backdrop-blur-md">
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={() => setSortType('trending')}
            className={`text-xs px-2.5 py-1.5 rounded-md transition-all duration-200 ${
              sortType === 'trending' 
                ? 'bg-[#1f1f1f] text-white border border-[#323232]' 
                : 'text-[#a1a1aa] hover:bg-[#2d2d2d] hover:text-white border border-[#27272a]'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              <span>Trending</span>
            </div>
          </button>
          <button
            onClick={() => setSortType('gainers')}
            className={`text-xs px-2.5 py-1.5 rounded-md transition-all duration-200 ${
              sortType === 'gainers' 
                ? 'bg-[#1f1f1f] text-white border border-[#323232]' 
                : 'text-[#a1a1aa] hover:bg-[#2d2d2d] hover:text-white border border-[#27272a]'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setSortType('market_cap')}
            className={`text-xs px-2.5 py-1.5 rounded-md transition-all duration-200 ${
              sortType === 'market_cap' 
                ? 'bg-[#1f1f1f] text-white border border-[#323232]' 
                : 'text-[#a1a1aa] hover:bg-[#2d2d2d] hover:text-white border border-[#27272a]'
            }`}
          >
            MCap
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#a1a1aa] hover:text-white transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-3.5rem)] custom-scrollbar">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(21)].map((_, i) => (
              <div key={i} className="h-10 bg-[#27272a] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-1.5">
            {coins.map((coin, index) => (
              <a
                key={coin.id}
                href={`https://www.coingecko.com/en/coins/${coin.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded hover:bg-[#27272a] transition-colors duration-200 group"
              >
                <span className="text-xs text-[#71717a] w-5">{index + 1}</span>
                <img
                  src={coin.thumb}
                  alt={coin.name}
                  className="w-5 h-5 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs truncate group-hover:text-white transition-colors duration-200">
                        {coin.symbol.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#71717a]">
                        #{coin.market_cap_rank || 'N/A'}
                      </span>
                      {coin.isTrending && (
                        <span className="text-[10px] text-white">•</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-[#71717a]">
                        {formatUSD(coin.current_price)}
                      </div>
                      <div className={`text-[10px] ${
                        (coin.price_change_24h || 0) >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                      }`}>
                        {formatPercent(coin.price_change_24h)}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 