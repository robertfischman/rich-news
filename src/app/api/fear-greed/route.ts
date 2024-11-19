import { NextResponse } from 'next/server';

// Cache mechanism
interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

export async function GET() {
  try {
    // Check cache
    const cachedData = cache['fear_greed'];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    const response = await fetch('https://api.alternative.me/fng/');
    if (!response.ok) {
      throw new Error('Failed to fetch fear & greed index');
    }

    const data = await response.json();
    const fearGreedData = data.data[0];

    // Update cache
    cache['fear_greed'] = {
      data: fearGreedData,
      timestamp: Date.now()
    };

    return NextResponse.json(fearGreedData);
  } catch (error) {
    console.error('Error fetching fear & greed index:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fear & greed index' },
      { status: 500 }
    );
  }
} 