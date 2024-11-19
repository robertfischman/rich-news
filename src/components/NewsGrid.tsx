'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  imageUrl: string;
  url: string;
  category: string;
  tags: string[];
}

export default function NewsGrid() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeSource, setActiveSource] = useState<
    'All' | 
    'CryptoCompare' | 
    'CoinTelegraph' | 
    'Bitcoin.com' |
    'ZyCrypto'
  >('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sources = [
    'All', 
    'CryptoCompare', 
    'CoinTelegraph', 
    'Bitcoin.com',
    'ZyCrypto'
  ] as const;

  useEffect(() => {
    async function fetchNews() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetch(`/api/news?source=${activeSource}`).then(res => res.json());
        setNews(data);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [activeSource]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#a1a1aa]">{error}</p>
        <button
          onClick={() => setActiveSource(activeSource)}
          className="mt-4 px-4 py-2 rounded-full bg-[#2e2e35] text-[#22c55e] hover:bg-[#34343b] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {sources.map((source) => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            className={`
              px-4 py-1.5 rounded-full text-sm whitespace-nowrap
              ${activeSource === source 
                ? 'bg-[#27272a] text-white' 
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
              }
              transition-colors duration-200
            `}
          >
            {source}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="bg-[#1f1f1f] rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-[#272727]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#272727] rounded w-3/4" />
                <div className="h-4 bg-[#272727] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#1f1f1f] rounded-lg overflow-hidden hover:bg-[#272727] transition-colors duration-200"
            >
              <div className="relative h-48 bg-[#272727] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-black/50 text-[#ff7f50]">
                    {item.source}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-medium text-white mb-2 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-sm text-[#a1a1aa] line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#71717a]">
                  <span>{item.timestamp}</span>
                  <span>{item.category}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 