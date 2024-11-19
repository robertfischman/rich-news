'use client';

import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';

interface LongShortData {
  longShortRatio: number;
  timestamp: string;
}

export default function LongShortRatio() {
  const [data, setData] = useState<LongShortData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLongShortRatio() {
      try {
        const response = await fetch('/api/long-short');
        if (!response.ok) throw new Error('Failed to fetch long/short ratio');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching long/short ratio:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLongShortRatio();
    const interval = setInterval(fetchLongShortRatio, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  function getColorByRatio(ratio: number): string {
    if (ratio >= 2) return 'text-[#fbbf24]'; // Extremely Bullish
    if (ratio >= 1.5) return 'text-[#fcd34d]'; // Bullish
    if (ratio >= 0.8) return 'text-[#d1d5db]'; // Neutral
    if (ratio >= 0.5) return 'text-[#f87171]'; // Bearish
    return 'text-[#dc2626]'; // Extremely Bearish
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <Scale className="w-4 h-4 text-[#a1a1aa]" />
        <div className="h-4 w-12 bg-[#27272a] rounded animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1.5"
      title={`Long/Short Ratio: ${data.longShortRatio.toFixed(2)}`}
    >
      <Scale className="w-4 h-4 text-[#a1a1aa]" />
      <span className={`text-sm font-mono ${getColorByRatio(data.longShortRatio)}`}>
        {data.longShortRatio.toFixed(2)}
      </span>
    </div>
  );
} 