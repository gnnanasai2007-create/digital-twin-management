import React, { useState, useEffect } from 'react';
import { Play, Square, AlertOctagon, RotateCcw, Activity, Zap, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function SimulationControlsModal({ isOpen, onClose }) {
  const { simulationStatus, startSimulation, stopSimulation, triggerFailure, resetAssetSimulation } = useSocket();
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3000);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await api.get('/assets');
        if (res.data.success) {
          setAssets(res.data.assets);
          if (res.data.assets.length > 0 && !selectedAssetId) {
            setSelectedAssetId(res.data.assets[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const isSimRunning = simulationStatus?.isRunning;
  const activeFailures = simulationStatus?.activeFailures || [];

  const handleStartStop = () => {
    if (isSimRunning) {
      stopSimulation();
    } else {
      startSimulation(intervalMs);
    }
  };

  const handleTriggerFailure = async () => {
    if (!selectedAssetId) return;
    triggerFailure(selectedAssetId);
    try {
      await api.post(`/digital-twins/${selectedAssetId}/simulate-failure`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetAsset = async () => {
    if (!selectedAssetId) return;
    resetAssetSimulation(selectedAssetId);
    try {
      await api.post(`/digital-twins/${selectedAssetId}/reset-simulation`);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const isSelectedFailing = activeFailures.includes(selectedAssetId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="IoT Simulation & Anomaly Injection Engine" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Engine Global State Toggle */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Continuous Telemetry Simulator
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates physics-based gradual random-walk sensor drift and telemetry broadcasting.
            </p>
          </div>

          <button
            onClick={handleStartStop}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg ${
              isSimRunning
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isSimRunning ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Stop Engine</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Engine</span>
              </>
            )}
          </button>
        </div>

        {/* Broadcast Frequency Slider */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Broadcast Frequency:</span>
            <span className="text-cyan-400 font-bold">{intervalMs / 1000}s per tick</span>
          </div>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1s (High Speed)</span>
            <span>3s (Default)</span>
            <span>10s (Relaxed)</span>
          </div>
        </div>

        {/* Critical Failure Injection Feature */}
        <div className="border border-red-500/30 bg-red-950/10 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-red-200">Interactive Failure Simulation</h4>
              <p className="text-xs text-red-300/70">
                Escalate thermal runaway, bearing vibrations, and trigger real-time CRITICAL alerts for live demos.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Select Target Physical Asset:</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetCode} - {asset.name} ({asset.status})
                </option>
              ))}
            </select>
          </div>

          {selectedAsset && (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Health:</span>
                <span className="text-slate-200 font-bold">{selectedAsset.healthScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Simulation State:</span>
                <span className={isSelectedFailing ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {isSelectedFailing ? 'CRITICAL FAILURE SEQUENCE ACTIVE' : 'NOMINAL BASELINE'}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleTriggerFailure}
              disabled={isSelectedFailing}
              className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                isSelectedFailing
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              }`}
            >
              <Zap className="w-4 h-4 text-red-400" />
              <span>Simulate Failure</span>
            </button>

            <button
              onClick={handleResetAsset}
              className="py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Reset Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
