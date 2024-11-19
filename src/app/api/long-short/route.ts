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

    // Use CryptoCompare OHLCV API
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USDT&limit=24&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    const data = await response.json();
    
    if (data.Response === 'Error') {
      throw new Error(data.Message);
    }

    // Calculate buy/sell volume ratio from the last 24 hours
    const volumeData = data.Data.Data;
    let buyVolume = 0;
    let sellVolume = 0;

    volumeData.forEach((hour: any) => {
      if (hour.close >= hour.open) {
        buyVolume += hour.volumeto;
      } else {
        sellVolume += hour.volumeto;
      }
    });

    const result = {
      longShortRatio: parseFloat((buyVolume / sellVolume).toFixed(2)),
      timestamp: Date.now()
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