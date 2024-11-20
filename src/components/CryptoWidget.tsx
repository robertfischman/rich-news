'use client';

import { useState, useEffect } from 'react';
import { DollarSign, X } from 'lucide-react';

export default function CryptoWidget() {
  const [price, setPrice] = useState<string>('0');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: ['btcusdt@miniTicker'],
        id: 1
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrMiniTicker') {
        setPrice(parseFloat(data.c).toFixed(2));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

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
        <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-md border border-[#27272a] shadow-lg">
          <div className="flex items-center justify-between p-2 border-b border-[#27272a]">
            <span className="text-sm text-white">Crypto Prices</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#a1a1aa] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between">
              <span className="text-[#ffa07a]">BTC</span>
              <span className="text-white font-mono">${price}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 