import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const healthy = await api.healthCheck();
    setIsConnected(healthy);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Checking connection...
      </div>
    );
  }

  return (
    <button
      onClick={checkConnection}
      disabled={checking}
      className={`
        fixed bottom-4 right-4 px-4 py-2 rounded-full text-xs font-medium shadow-lg
        transition-all duration-300 flex items-center gap-2 cursor-pointer
        ${isConnected 
          ? 'bg-success-50 text-success-600 border border-success-200 hover:bg-success-100' 
          : 'bg-danger-50 text-danger-600 border border-danger-200 hover:bg-danger-100'
        }
      `}
    >
      {checking ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : isConnected ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      {checking ? 'Checking...' : isConnected ? 'Backend Connected' : 'Backend Offline'}
    </button>
  );
}
