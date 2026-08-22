import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Sliders,
  Shield,
  Bell,
  Cpu,
  Info,
  Save,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState({});
  const [systemInfo, setSystemInfo] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [intervalMs, setIntervalMs] = useState(3000);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoOverdue, setAutoOverdue] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings || {});
        setSystemInfo(res.data.systemInfo);
        setSimulationStatus(res.data.simulationStatus);
        if (res.data.simulationStatus?.intervalMs) {
          setIntervalMs(res.data.simulationStatus.intervalMs);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        simulationIntervalMs: intervalMs,
        settings: {
          alert_sound_enabled: String(soundEnabled),
          auto_overdue_detection: String(autoOverdue),
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-cyan-400" />
            SYSTEM CONFIGURATION & PREFERENCES
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage operator profile, simulation parameters, audio alert chimes & platform runtime info
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>System configuration updated successfully and broadcast to all nodes.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operator Profile Card */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-100 font-bold font-mono text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Operator Profile</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || 'Operator'}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded p-2 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Identifier</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'operator@example.com'}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded p-2 text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Security Role</label>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                    {user?.role || 'VIEWER'}
                  </span>
                  <span className="text-slate-500 text-[11px]">Department: {user?.department || 'Operations'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Simulator Config */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-100 font-bold font-mono text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Simulation Engine Tuning</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 font-semibold">Broadcast Tick Interval:</span>
                  <span className="text-cyan-400 font-bold">{intervalMs / 1000} seconds</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  disabled={!isAdmin}
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1.0s (Fast Stream)</span>
                  <span>3.0s (Recommended)</span>
                  <span>8.0s (Slow)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">
                    Enable audible alert chime on Critical Anomaly detection
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoOverdue}
                    onChange={(e) => setAutoOverdue(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">
                    Auto-flag past scheduled maintenance work orders as OVERDUE
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Info Diagnostic Card */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-mono text-sm uppercase tracking-wider pb-2 border-b border-slate-800">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Platform Diagnostic Information</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">DTAM VERSION</span>
              <p className="text-slate-100 font-bold mt-0.5">v1.0.0 Enterprise</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">NODE RUNTIME</span>
              <p className="text-slate-100 font-bold mt-0.5">{systemInfo?.nodeVersion || process.version}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">SYSTEM UPTIME</span>
              <p className="text-slate-100 font-bold mt-0.5">{systemInfo?.uptime ? `${systemInfo.uptime}s` : 'Active'}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">DATABASE ENGINE</span>
              <p className="text-slate-100 font-bold mt-0.5">SQLite + Prisma ORM</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
