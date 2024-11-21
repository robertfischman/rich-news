'use client';

import { useState, useEffect } from 'react';
import { DollarSign, X } from 'lucide-react';

type PriceData = Record<string, { 
  current: string;
  previous: string;
  priceChangePercent: string;
}>;

// List of supported cryptocurrencies - only show first 3
const CRYPTO_LIST = [
  { symbol: 'BTC', key: 'BTCUSDT' },
  { symbol: 'ETH', key: 'ETHUSDT' },
  { symbol: 'SOL', key: 'SOLUSDT' },
  { symbol: 'BNB', key: 'BNBUSDT' },
  { symbol: 'SUI', key: 'SUIUSDT' },
  { symbol: 'DOGE', key: 'DOGEUSDT' },
  { symbol: 'APT', key: 'APTUSDT' },
  { symbol: 'AVAX', key: 'AVAXUSDT' },
  { symbol: 'XRP', key: 'XRPUSDT' },
  { symbol: 'ADA', key: 'ADAUSDT' },
  { symbol: 'TRX', key: 'TRXUSDT' },
  { symbol: 'TON', key: 'TONUSDT' },
  { symbol: 'LINK', key: 'LINKUSDT' },
  { symbol: 'UNI', key: 'UNIUSDT' }
] as const;

// Custom hook for fetching and managing crypto prices
const useCryptoPrices = () => {
  const [prices, setPrices] = useState<PriceData>(() => {
    const initial: PriceData = {};
    [...CRYPTO_LIST, { symbol: 'XMR', key: 'XMRUSD' }].forEach(({ key }) => {
      initial[key] = { current: '0', previous: '0', priceChangePercent: '0' };
    });
    return initial;
  });

  useEffect(() => {
    // Binance WebSocket
    const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws');
    // Kraken WebSocket
    const krakenWs = new WebSocket('wss://ws.kraken.com');

    binanceWs.onopen = () => {
      binanceWs.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: CRYPTO_LIST.map(({ key }) => `${key.toLowerCase()}@ticker`),
        id: 1
      }));
    };

    krakenWs.onopen = () => {
      krakenWs.send(JSON.stringify({
        event: 'subscribe',
        pair: ['XMR/USD'],
        subscription: { name: 'ticker' }
      }));
    };

    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrTicker') {
        setPrices(prev => ({
          ...prev,
          [data.s]: {
            previous: prev[data.s].current,
            current: parseFloat(data.c).toFixed(2),
            priceChangePercent: parseFloat(data.P).toFixed(2)
          }
        }));
      }
    };

    krakenWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data) && data[2] === 'ticker' && data[3] === 'XMR/USD') {
        const price = data[1].c[0];
        const openPrice = parseFloat(data[1].o[0]);
        const currentPrice = parseFloat(price);
        const priceChange = ((currentPrice - openPrice) / openPrice) * 100;
        
        setPrices(prev => ({
          ...prev,
          XMRUSD: {
            previous: prev.XMRUSD.current,
            current: currentPrice.toFixed(2),
            priceChangePercent: priceChange.toFixed(2)
          }
        }));
      }
    };

    return () => {
      binanceWs.close();
      krakenWs.close();
    };
  }, []);

  return prices;
};

// Helper function to determine price change color
const getPriceChangeColor = (current: string, previous: string) => {
  if (parseFloat(current) > parseFloat(previous)) return 'text-green-400';
  if (parseFloat(current) < parseFloat(previous)) return 'text-red-400';
  return 'text-white';
};

// Component for displaying main prices in header
export function MainPrices() {
  const prices = useCryptoPrices();
  
  const PriceList = () => (
    <div className="flex items-center">
      {CRYPTO_LIST.slice(0, 3).map(({ symbol, key }) => (
        <div key={key} className="px-3 flex items-center gap-2">
          <span className="text-[#ffa07a] text-sm">${symbol}</span>
          <span className="text-white text-sm font-mono">
            ${prices[key]?.current || '0'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex">
        <PriceList />
      </div>
    </div>
  );
}

interface DropdownProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Dropdown({ isOpen, setIsOpen }: DropdownProps) {
  const prices = useCryptoPrices();

  const cryptoListWithXMR = [...CRYPTO_LIST, { symbol: 'XMR', key: 'XMRUSD' }];

  // Update page title with BTC price
  const updatePageTitle = (shouldShow: boolean) => {
    const originalTitle = document.title.split(' | ')[0];
    if (shouldShow && prices['BTCUSDT']) {
      const btcPrice = prices['BTCUSDT'].current;
      const btcChange = prices['BTCUSDT'].priceChangePercent;
      document.title = `${originalTitle} | BTC: $${btcPrice} (${parseFloat(btcChange) >= 0 ? '+' : ''}${btcChange}%)`;
    } else {
      document.title = originalTitle;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          const newIsOpen = !isOpen;
          setIsOpen(newIsOpen);
          updatePageTitle(newIsOpen);
        }}
        className={`
          px-2 py-1.5
          ${isOpen 
            ? 'text-white bg-[#2d2d2d]' 
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#2d2d2d]'
          }
          transition-colors duration-200
        `}
        title="More Crypto Prices"
      >
        <DollarSign className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1f1f1f] rounded-md border border-[#27272a] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between p-3 border-b border-[#27272a]">
            <span className="text-sm font-medium text-white">Crypto Prices</span>
            <button 
              onClick={() => {
                setIsOpen(false);
                updatePageTitle(false);
              }}
              className="text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
            {cryptoListWithXMR.map(({ symbol, key }) => {
              const price = prices[key];
              if (!price) return null;

              return (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-2 hover:bg-[#27272a] rounded-md transition-colors duration-200"
                >
                  <div className="w-16">
                    <span className="text-[#ffa07a] font-medium">${symbol}</span>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <div className="w-20 text-right">
                      <span 
                        className={`text-sm ${
                          parseFloat(price.priceChangePercent) >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}
                      >
                        {parseFloat(price.priceChangePercent) >= 0 ? '+' : ''}
                        {price.priceChangePercent}%
                      </span>
                    </div>
                    <div className="w-28 text-right ml-4">
                      <span className="font-mono">
                        ${price.current}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const CryptoWidget = {
  MainPrices,
  Dropdown
};

export default CryptoWidget; 