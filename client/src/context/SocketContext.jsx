import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastTelemetry, setLastTelemetry] = useState(null);
  const [liveAssetsMap, setLiveAssetsMap] = useState({});
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState({
    isRunning: true,
    intervalMs: 3000,
    activeFailures: [],
  });

  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend socket
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '/';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to DTAM Real-Time Socket Server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket Server');
      setIsConnected(false);
    });

    // Real-time telemetry update per asset
    newSocket.on('telemetry:asset_update', (data) => {
      setLastTelemetry(data);
      setLiveAssetsMap((prev) => ({
        ...prev,
        [data.assetId]: data,
      }));
    });

    // Real-time alert trigger
    newSocket.on('alert:new', (newAlert) => {
      setRecentAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
    });

    // Simulation engine status
    newSocket.on('simulation:status', (status) => {
      setSimulationStatus(status);
    });

    newSocket.on('simulation:failure_started', (info) => {
      console.warn('⚠️ Failure injection active:', info);
    });

    newSocket.on('simulation:failure_reset', (info) => {
      console.info('✅ Failure reset:', info);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Client-side simulation fallback when WebSocket is not connected (e.g. static Vercel deployment)
  useEffect(() => {
    if (isConnected) return;

    const interval = setInterval(() => {
      setLiveAssetsMap((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((assetId) => {
          const current = next[assetId];
          if (current?.readings) {
            const updatedReadings = current.readings.map((r) => {
              const delta = (Math.random() - 0.49) * (r.unit === '°C' ? 0.8 : r.unit === 'mm/s' ? 0.15 : 0.3);
              const newVal = Math.max(0, +(r.currentReading + delta).toFixed(2));
              return { ...r, currentReading: newVal };
            });
            next[assetId] = {
              ...current,
              readings: updatedReadings,
              timestamp: new Date().toISOString(),
            };
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const startSimulation = (intervalMs = 3000) => {
    socketRef.current?.emit('simulation:start', { intervalMs });
  };

  const stopSimulation = () => {
    socketRef.current?.emit('simulation:stop');
  };

  const triggerFailure = (assetId) => {
    socketRef.current?.emit('simulation:trigger_failure', { assetId });
  };

  const resetAssetSimulation = (assetId) => {
    socketRef.current?.emit('simulation:reset_asset', { assetId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastTelemetry,
        liveAssetsMap,
        recentAlerts,
        simulationStatus,
        startSimulation,
        stopSimulation,
        triggerFailure,
        resetAssetSimulation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
