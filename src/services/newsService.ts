import Parser from 'rss-parser';
import axios from 'axios';

const parser = new Parser();

// Define RSS feed sources
const RSS_FEEDS = [
  {
    url: 'https://cointelegraph.com/rss',
    name: 'CoinTelegraph'
  },
  {
    url: 'https://news.bitcoin.com/feed/',
    name: 'Bitcoin.com'
  }
];

export interface NewsItem {
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

// Helper function to extract image from content
function extractImageFromContent(content: string): string {
  const defaultImage = 'https://picsum.photos/800/400';
  if (!content) return defaultImage;

  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : defaultImage;
}

// Cache mechanism
interface CacheItem {
  data: NewsItem[];
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const newsService = {
  async getAllNews(source: string = 'All'): Promise<NewsItem[]> {
    try {
      // 检查缓存
      const cacheKey = `news_${source}`;
      const cachedData = cache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
      }

      // 通过 API 获取新闻
      const response = await fetch(`/api/news?source=${source}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const newsItems = await response.json();

      // 更新缓存
      cache[cacheKey] = {
        data: newsItems,
        timestamp: Date.now()
      };

      return newsItems;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }
}; 