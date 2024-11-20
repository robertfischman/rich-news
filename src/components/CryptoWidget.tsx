'use client';

import { useState, useEffect } from 'react';
import { DollarSign, X } from 'lucide-react';

type PriceData = Record<string, string>;

export default function CryptoWidget() {
  const [prices, setPrices] = useState<PriceData>({
    BTCUSDT: '0',
    ETHUSDT: '0',
    SOLUSDT: '0',
    BNBUSDT: '0',
    SUIUSDT: '0',
    DOGEUSDT: '0',
    AVAXUSDT: '0',
    XRPUSDT: '0',
    ADAUSDT: '0',
    TRXUSDT: '0',
    TONUSDT: '0',
    LINKUSDT: '0',
    UNIUSDT: '0',
    XMRUSD: '0'
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
          [data.s]: parseFloat(data.c).toFixed(2)
        }));
      }
    };

    krakenWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data) && data[2] === 'ticker' && data[3] === 'XMR/USD') {
        const price = data[1].c[0];
        setPrices(prev => ({
          ...prev,
          XMRUSD: parseFloat(price).toFixed(2)
        }));
      }
    };

    return () => {
      binanceWs.close();
      krakenWs.close();
    };
  }, []);

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
        <div className="absolute right-0 mt-2 w-56 bg-[#1f1f1f] rounded-md border border-[#27272a] shadow-lg">
          <div className="flex items-center justify-between p-2 border-b border-[#27272a]">
            <span className="text-sm text-white">Crypto Prices</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#a1a1aa] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
            {cryptoList.map(({ symbol, key }) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <span className="text-[#ffa07a] w-12">{symbol}</span>
                <span className="text-white font-mono">${prices[key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 