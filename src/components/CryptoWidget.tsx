'use client';

import { useState, useEffect } from 'react';
import { DollarSign, X } from 'lucide-react';

type PriceData = Record<string, { 
  current: string;
  previous: string;
}>;

export default function CryptoWidget() {
  const [prices, setPrices] = useState<PriceData>({
    BTCUSDT: { current: '0', previous: '0' },
    ETHUSDT: { current: '0', previous: '0' },
    SOLUSDT: { current: '0', previous: '0' },
    BNBUSDT: { current: '0', previous: '0' },
    SUIUSDT: { current: '0', previous: '0' },
    DOGEUSDT: { current: '0', previous: '0' },
    AVAXUSDT: { current: '0', previous: '0' },
    XRPUSDT: { current: '0', previous: '0' },
    ADAUSDT: { current: '0', previous: '0' },
    TRXUSDT: { current: '0', previous: '0' },
    TONUSDT: { current: '0', previous: '0' },
    LINKUSDT: { current: '0', previous: '0' },
    UNIUSDT: { current: '0', previous: '0' },
    XMRUSD: { current: '0', previous: '0' }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws');
    const krakenWs = new WebSocket('wss://ws.kraken.com');

    binanceWs.onopen = () => {
      binanceWs.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [
          'btcusdt@miniTicker',
          'ethusdt@miniTicker',
          'solusdt@miniTicker',
          'bnbusdt@miniTicker',
          'suiusdt@miniTicker',
          'dogeusdt@miniTicker',
          'avaxusdt@miniTicker',
          'xrpusdt@miniTicker',
          'adausdt@miniTicker',
          'trxusdt@miniTicker',
          'tonusdt@miniTicker',
          'linkusdt@miniTicker',
          'uniusdt@miniTicker'
        ],
        id: 1
      }));
    };

    krakenWs.onopen = () => {
      krakenWs.send(JSON.stringify({
        event: 'subscribe',
        pair: ['XMR/USD'],
        subscription: {
          name: 'ticker'
        }
      }));
    };

    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrMiniTicker') {
        setPrices(prev => ({
          ...prev,
          [data.s]: {
            previous: prev[data.s].current,
            current: parseFloat(data.c).toFixed(2)
          }
        }));
      }
    };

    krakenWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data) && data[2] === 'ticker' && data[3] === 'XMR/USD') {
        const price = data[1].c[0];
        setPrices(prev => ({
          ...prev,
          XMRUSD: {
            previous: prev.XMRUSD.current,
            current: parseFloat(price).toFixed(2)
          }
        }));
      }
    };

    return () => {
      binanceWs.close();
      krakenWs.close();
    };
  }, []);

  const getPriceChangeColor = (current: string, previous: string) => {
    if (parseFloat(current) > parseFloat(previous)) return 'text-green-400';
    if (parseFloat(current) < parseFloat(previous)) return 'text-red-400';
    return 'text-white';
  };

  const cryptoList = [
    { symbol: 'BTC', key: 'BTCUSDT' },
    { symbol: 'ETH', key: 'ETHUSDT' },
    { symbol: 'SOL', key: 'SOLUSDT' },
    { symbol: 'BNB', key: 'BNBUSDT' },
    { symbol: 'SUI', key: 'SUIUSDT' },
    { symbol: 'DOGE', key: 'DOGEUSDT' },
    { symbol: 'AVAX', key: 'AVAXUSDT' },
    { symbol: 'XRP', key: 'XRPUSDT' },
    { symbol: 'ADA', key: 'ADAUSDT' },
    { symbol: 'TRX', key: 'TRXUSDT' },
    { symbol: 'TON', key: 'TONUSDT' },
    { symbol: 'LINK', key: 'LINKUSDT' },
    { symbol: 'UNI', key: 'UNIUSDT' },
    { symbol: 'XMR', key: 'XMRUSD' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-2 py-1.5
          ${isOpen 
            ? 'text-white bg-[#2d2d2d]' 
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#2d2d2d]'
          }
          transition-colors duration-200
        `}
        title="Crypto Prices"
      >
        <DollarSign className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1f1f1f] rounded-md border border-[#27272a] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between p-3 border-b border-[#27272a]">
            <span className="text-sm font-medium text-white">Crypto Prices</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
            {cryptoList.map(({ symbol, key }) => (
              <div 
                key={key} 
                className="flex items-center justify-between p-2 hover:bg-[#27272a] rounded-md transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#ffa07a] font-medium">{symbol}</span>
                </div>
                <span 
                  className={`font-mono transition-colors duration-200 ${
                    getPriceChangeColor(prices[key].current, prices[key].previous)
                  }`}
                >
                  ${prices[key].current}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 