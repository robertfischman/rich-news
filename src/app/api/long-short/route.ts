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

    // Use Bybit V5 API
    const response = await fetch('https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=1h&limit=1', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MushNews/1.0;)',
      },
      next: { revalidate: 300 } // 5 minutes cache
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch long/short ratio');
    }

    const data = await response.json();
    
    if (data.retCode !== 0 || !data.result || !data.result.list || !data.result.list[0]) {
      throw new Error('Invalid response from Bybit API');
    }

    const latestData = data.result.list[0];
    const buyRatio = parseFloat(latestData.buyRatio);
    const sellRatio = parseFloat(latestData.sellRatio);

    const result = {
      longShortRatio: parseFloat((buyRatio / sellRatio).toFixed(2)),
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
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch long/short ratio' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 