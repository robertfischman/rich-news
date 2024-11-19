import { NextResponse } from 'next/server';

interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export async function GET() {
  try {
    // Check cache
    const cachedData = cache['long_short'];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch BTC long/short ratio from Binance Futures
    const response = await fetch('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m');
    
    if (!response.ok) {
      throw new Error('Failed to fetch long/short ratio');
    }

    const data = await response.json();
    const latestData = data[0]; // Get most recent data point

    const result = {
      longShortRatio: parseFloat(latestData.longShortRatio),
      timestamp: latestData.timestamp
    };

    // Update cache
    cache['long_short'] = {
      data: result,
      timestamp: Date.now()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching long/short ratio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch long/short ratio' },
      { status: 500 }
    );
  }
} 