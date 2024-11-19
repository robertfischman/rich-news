import { NextResponse } from 'next/server';

// Cache interface definition
interface CacheItem {
  data: any;
  timestamp: number;
}

// Cache object
const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const sortType = searchParams.get('sort') || 'trending';
  
  // Check cache
  const cacheKey = `coingecko-${sortType}`;
  const cachedData = cache[cacheKey];
  const now = Date.now();

  // If cache exists and is not expired, return cached data
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    console.log(`Returning cached data for ${sortType}`);
    return NextResponse.json(cachedData.data);
  }

  try {
    let data;
    // Get market data (including price change and market cap)
    const marketsResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?' +
      'vs_currency=usd&' +
      'order=market_cap_desc&' +
      'per_page=250&' +
      'sparkline=false'
    );

    if (!marketsResponse.ok) {
      throw new Error(`CoinGecko markets API error: ${marketsResponse.status}`);
    }

    const marketsData = await marketsResponse.json();

    if (sortType === 'trending') {
      // Get trending coin data
      const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending');
      if (!trendingResponse.ok) {
        throw new Error(`CoinGecko trending API error: ${trendingResponse.status}`);
      }
      const trendingData = await trendingResponse.json();

      // If there are fewer than 21 trending coins, supplement from the gainers list
      if (trendingData.coins.length < 21) {
        // Get gainers data (sorted by 24-hour gain)
        const gainersData = marketsData
          .filter((coin: any) => 
            !coin.symbol.toLowerCase().includes('usd') && // Filter out stablecoins
            coin.price_change_percentage_24h != null &&
            !trendingData.coins.some((tc: any) => tc.item.id === coin.id) // Exclude coins already in the trending list
          )
          .sort((a: any, b: any) => b.price_change_percentage_24h - a.price_change_percentage_24h);

        // Number of coins needed to supplement
        const needMore = 21 - trendingData.coins.length;
        
        // Convert the top needMore gainers to trending coin format
        const additionalCoins = gainersData.slice(0, needMore).map((coin: any) => ({
          item: {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            thumb: coin.image,
            market_cap_rank: coin.market_cap_rank,
            score: 0
          }
        }));

        // Merge trending coins and supplemented gainers
        trendingData.coins = [...trendingData.coins, ...additionalCoins];
      }

      data = {
        coins: trendingData.coins,
        market_data: marketsData
      };
    } else {
      // For gainers and market_cap, directly use market data
      data = {
        market_data: marketsData.sort((a: any, b: any) => {
          if (sortType === 'gainers') {
            return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
          }
          return (b.market_cap || 0) - (a.market_cap || 0);
        })
      };
    }

    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch from CoinGecko:', error);
    
    // If there is cached data, return it even if it's expired
    if (cachedData) {
      console.log('Returning stale cache data due to API error');
      return NextResponse.json(cachedData.data);
    }

    return NextResponse.json(
      { error: 'Failed to fetch coin data' },
      { status: 500 }
    );
  }
} 