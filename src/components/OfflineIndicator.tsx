import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-20 lg:bottom-4 left-4 z-40 bg-amber-500/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg shadow-amber-200 flex items-center gap-2 text-xs font-bold animate-pulse">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Offline mode • Changes saved locally</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 lg:bottom-4 left-4 z-40 bg-emerald-500/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-2 text-xs font-bold">
        <Wifi className="w-3.5 h-3.5" />
        <span>Back online! Everything synced ✨</span>
      </div>
    );
  }

  return null;
};
