'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Check if it's a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isStandalone || !isMobile) {
      return;
    }

    const handler = (e: any) => {
      // Prevent Chrome's default install prompt
      e.preventDefault();
      // Store the install prompt event
      setDeferredPrompt(e);
      // Show our custom prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clean up
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#2d2d2d] rounded-lg p-4 shadow-lg border border-[#3d3d3d] z-50">
      <button
        onClick={() => setShowInstallPrompt(false)}
        className="absolute top-2 right-2 text-[#a1a1aa] hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <img src="/mush.png" alt="MushNews" className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">Install MushNews</h3>
          <p className="text-sm text-[#a1a1aa] mb-3">
            Add to home screen for a better experience
          </p>
          <button
            onClick={handleInstall}
            className="bg-[#ff7f50] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#ff6b3d] transition-colors duration-200"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
} 