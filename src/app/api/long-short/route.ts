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

    // Use Bybit V5 API with fetch configuration
    const response = await fetch('https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=1h&limit=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MushNews/1.0;)',
        'Origin': process.env.VERCEL_URL || 'http://localhost:3000',
      },
      cache: 'no-store', // Disable cache to ensure fresh data
      next: { 
        revalidate: 0 // Disable Next.js cache
      }
    });
    
    if (!response.ok) {
      console.error('Bybit API response not ok:', await response.text());
      throw new Error('Failed to fetch long/short ratio');
    }

    const data = await response.json();
    console.log('Bybit API response:', data); // Add logging
    
    if (data.retCode !== 0 || !data.result || !data.result.list || !data.result.list[0]) {
      console.error('Invalid Bybit API response:', data);
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

    // Return with explicit headers
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error details:', error); // Add detailed error logging
    
    // Return error response with explicit headers
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch long/short ratio' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
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