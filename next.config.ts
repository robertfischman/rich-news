import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
        ],
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
