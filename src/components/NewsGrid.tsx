'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { newsService, NewsItem } from '@/services/newsService';
import { Loader2 } from 'lucide-react';

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
        const data = await newsService.getAllNews(activeSource);
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
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ffa07a] to-[#ff7f50] bg-clip-text text-transparent">
          Latest News
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-4 py-2 rounded-md transition-all duration-200 border ${
                activeSource === source
                  ? 'bg-[#1f1f1f] text-white border-[#323232]'
                  : 'bg-[#1f1f1f]/50 text-[#a1a1aa] hover:bg-[#2d2d2d] hover:text-white border-[#27272a] hover:border-[#323232]'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#ff7f50] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl overflow-hidden border border-[#2a2a2a] hover:border-[#ff7f50]/30 bg-[#1c1c1c] transition-all duration-300 shadow-lg hover:shadow-[#ff7f50]/5"
            >
              <div className="aspect-video relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#1c1c1c]/90 backdrop-blur-sm text-xs text-[#ff7f50]">
                  {item.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2 group-hover:text-[#ff7f50] transition-colors duration-300 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#9ca3af] mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#ff7f50]"></span>
                    {item.source}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
} 