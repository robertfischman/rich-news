import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: '*.cointelegraph.com',
      },
      {
        protocol: 'https',
        hostname: 'news.bitcoin.com',
      },
      {
        protocol: 'https',
        hostname: 'static.news.bitcoin.com',
      },
      {
        protocol: 'https',
        hostname: 'zycrypto.com',
      },
      {
        protocol: 'https',
        hostname: '*.zycrypto.com',
      },
      {
        protocol: 'https',
        hostname: 'resources.cryptocompare.com',
      },
      {
        protocol: 'https',
        hostname: 'images.cryptocompare.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              connect-src 'self' https://api.alternative.me https://min-api.cryptocompare.com;
              img-src 'self' https: data:;
              style-src 'self' 'unsafe-inline';
              font-src 'self';
            `.replace(/\s+/g, ' ').trim()
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.{jpg,jpeg,png,gif,webp}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
