import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

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

const RSS_FEEDS = [
  {
    url: 'https://cointelegraph.com/rss',
    name: 'CoinTelegraph'
  },
  {
    url: 'https://news.bitcoin.com/feed/',
    name: 'Bitcoin.com'
  },
  {
    url: 'https://zycrypto.com/feed/',
    name: 'ZyCrypto'
  }
];

// Helper function to extract image from content
function extractImageFromContent(content: string, source: string): string {
  if (!content) {
    return getDefaultImageForSource(source);
  }

  switch (source) {
    case 'ZyCrypto': {
      // ZyCrypto's existing logic works well
      const zycryptoImgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      if (zycryptoImgMatch) return zycryptoImgMatch[1];
      break;
    }

    default: {
      // Default image extraction logic
      const defaultImgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      if (defaultImgMatch) return defaultImgMatch[1];
    }
  }

  return getDefaultImageForSource(source);
}

// Provide different default images for different news sources
function getDefaultImageForSource(source: string): string {
  const defaults: Record<string, string> = {
    'CryptoCompare': '/images/cryptocompare-default.png',
    'CoinTelegraph': '/images/cointelegraph-default.png',
    'Bitcoin.com': '/images/bitcoin-default.png',
    'CryptoSlate': '/images/cryptoslate-default.png',
    'NewsBTC': '/images/newsbtc-default.png',
    'CryptoPotato': '/images/cryptopotato-default.png',
    'BeInCrypto': '/images/beincrypto-default.png',
    'U.Today': '/images/utoday-default.png',
    'ZyCrypto': '/images/zycrypto-default.png'
  };

  return defaults[source] || '/images/default-crypto-news.jpg';
}

async function fetchRSSFeed(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MushNews/1.0;)',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    return await parser.parseString(text);
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    if (url.includes('nitter')) {
      const backupUrl = url.replace('nitter.cz', 'nitter.it');
      try {
        const backupResponse = await fetch(backupUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MushNews/1.0;)',
            'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
          }
        });
        
        if (!backupResponse.ok) {
          throw new Error(`Backup HTTP error! status: ${backupResponse.status}`);
        }
        
        const backupText = await backupResponse.text();
        return await parser.parseString(backupText);
      } catch (backupError) {
        console.error(`Error fetching from backup RSS feed:`, backupError);
        return null;
      }
    }
    return null;
  }
}

async function fetchCryptoCompareNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch CryptoCompare news');
    }

    const data = await response.json();
    
    // Use Set to store processed titles
    const seenTitles = new Set();
    
    return data.Data
      .filter((item: any) => {
        if (seenTitles.has(item.title)) return false;
        seenTitles.add(item.title);
        return true;
      })
      .map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        description: item.body,
        source: 'CryptoCompare',
        timestamp: new Date(item.published_on * 1000).toLocaleDateString(),
        imageUrl: item.imageurl,
        url: item.url,
        category: 'Crypto',
        tags: item.categories.split('|')
      }));
  } catch (error) {
    console.error('Error fetching CryptoCompare news:', error);
    return [];
  }
}

function sanitizeImageUrl(url: string): string {
  try {
    new URL(url);
    return url;
  } catch {
    return '/fallback-image.jpg';
  }
}

// Add image URL validation and optimization
function optimizeImageUrl(url: string, source: string): string {
  try {
    const urlObj = new URL(url);
    
    // Handle specific source optimizations
    switch (source) {
      case 'CryptoCompare':
        // Already optimized, return as is
        return url;
      case 'CoinTelegraph':
        // Add size parameters if needed
        return `${url}?format=webp&width=720`;
      case 'Bitcoin.com':
        // Add size parameters if needed
        return `${url}?w=720&q=75`;
      default:
        return url;
    }
  } catch {
    // Return default image if URL is invalid
    return getDefaultImageForSource(source);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'All';
    
    let newsItems: NewsItem[] = [];
    
    if (source === 'CryptoCompare') {
      newsItems = await fetchCryptoCompareNews();
    } else if (source !== 'All') {
      const selectedFeed = RSS_FEEDS.find(feed => feed.name === source);
      if (selectedFeed) {
        const feed = await fetchRSSFeed(selectedFeed.url);
        if (feed && feed.items) {
          newsItems = feed.items.map(item => ({
            id: item.guid || item.link || '',
            title: item.title || '',
            description: item.contentSnippet || '',
            source: selectedFeed.name,
            timestamp: new Date(item.pubDate || '').toLocaleDateString(),
            imageUrl: optimizeImageUrl(
              extractImageFromContent(item.content || '', selectedFeed.name),
              selectedFeed.name
            ),
            url: item.link || '',
            category: 'Crypto',
            tags: []
          }));
        }
      }
    } else {
      const [cryptoCompareNews, ...rssResults] = await Promise.all([
        fetchCryptoCompareNews(),
        ...RSS_FEEDS.map(async feed => {
          const parsedFeed = await fetchRSSFeed(feed.url);
          if (!parsedFeed || !parsedFeed.items) return [];
          
          return parsedFeed.items.map(item => ({
            id: item.guid || item.link || '',
            title: item.title || '',
            description: item.contentSnippet || '',
            source: feed.name,
            timestamp: new Date(item.pubDate || '').toLocaleDateString(),
            imageUrl: optimizeImageUrl(
              extractImageFromContent(item.content || '', feed.name),
              feed.name
            ),
            url: item.link || '',
            category: 'Crypto',
            tags: []
          }));
        })
      ]);

      const allNews = [...cryptoCompareNews, ...rssResults.flat()];
      const uniqueNews = new Map();
      
      allNews.forEach(item => {
        const key = `${item.title}-${item.url}`;
        if (!uniqueNews.has(key)) {
          uniqueNews.set(key, item);
        }
      });

      newsItems = Array.from(uniqueNews.values());
      newsItems.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
    }

    if (newsItems.length === 0) {
      return NextResponse.json({ error: 'No news items found' }, { status: 404 });
    }

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
} 