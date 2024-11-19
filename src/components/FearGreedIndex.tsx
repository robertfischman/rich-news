'use client';

import { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';

interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

export default function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFearGreedIndex() {
      try {
        const response = await fetch('/api/fear-greed');
        if (!response.ok) throw new Error('Failed to fetch fear & greed index');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching fear & greed index:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  function getColorByValue(value: number): string {
    if (value >= 80) return 'text-[#fbbf24]'; // Extreme Greed
    if (value >= 60) return 'text-[#fcd34d]'; // Greed
    if (value >= 40) return 'text-[#d1d5db]'; // Neutral
    if (value >= 20) return 'text-[#f87171]'; // Fear
    return 'text-[#dc2626]'; // Extreme Fear
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#1f1f1f]/50">
        <Gauge className="w-4 h-4 text-[#a1a1aa]" />
        <div className="h-4 w-8 bg-[#27272a] rounded animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#1f1f1f]/50 hover:bg-[#2d2d2d] transition-colors duration-200"
      title={`Fear & Greed Index: ${data.value_classification}`}
    >
      <Gauge className="w-4 h-4 text-[#a1a1aa]" />
      <span className={`text-sm font-mono ${getColorByValue(data.value)}`}>
        {data.value}
      </span>
    </div>
  );
} 