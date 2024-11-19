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
};

export default nextConfig;
