import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function LiveBadge({ className = '' }) {
  const { isConnected, simulationStatus } = useSocket();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all duration-300 ${
        isConnected && simulationStatus.isRunning
          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : isConnected
          ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
          : 'bg-red-950/40 text-red-400 border-red-500/30'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && simulationStatus.isRunning && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected && simulationStatus.isRunning
              ? 'bg-emerald-400'
              : isConnected
              ? 'bg-amber-400'
              : 'bg-red-400'
          }`}
        ></span>
      </span>
      <span>
        {isConnected
          ? simulationStatus.isRunning
            ? 'LIVE TELEMETRY'
            : 'SIMULATION PAUSED'
          : 'CONNECTING...'}
      </span>
    </div>
  );
}
