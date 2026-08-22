import React from 'react';
import { X, Wrench, Activity, Thermometer, ShieldCheck } from 'lucide-react';
import { getStatusBadge, getHealthScoreColor } from '../utils/statusColors';

export default function ComponentInspector({ component, onClose }) {
  if (!component) return null;

  const { name, type, status = 'HEALTHY', healthScore = 95, lastMaintenance, temperature = 52.4, vibration = 1.8 } = component;
  const statusBadge = getStatusBadge(status);
  const healthColor = getHealthScoreColor(healthScore);

  return (
    <div className="glass-panel-glow bg-[#0b1120]/95 border border-cyan-500/40 p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              3D Component Inspection
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-100 mt-1">{name}</h4>
          <span className="text-xs text-slate-400">{type || 'Sub-Assembly'}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Health Rating</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-mono font-bold ${healthColor.text}`}>
              {healthScore}%
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Local Temperature</span>
          </div>
          <span className="text-xl font-mono font-bold text-slate-100">
            {typeof temperature === 'number' ? temperature.toFixed(1) : temperature}°C
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Bearing Vibration</span>
          </div>
          <span className="text-xl font-mono font-bold text-slate-100">
            {typeof vibration === 'number' ? vibration.toFixed(2) : vibration} mm/s
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>Last Serviced</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-300">
            {lastMaintenance ? new Date(lastMaintenance).toLocaleDateString() : '45 days ago'}
          </span>
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 bg-cyan-950/20 border border-cyan-900/40 p-2 rounded-lg flex items-center justify-between">
        <span>Diagnostics: NOMINAL</span>
        <span className="text-cyan-400 font-bold">DIGITAL TWIN LIVE</span>
      </div>
    </div>
  );
}
