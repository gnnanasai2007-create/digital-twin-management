import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Search,
  Grid,
  List,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { getStatusBadge } from '../utils/statusColors';

export default function LiveMonitoring() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [loading, setLoading] = useState(true);

  const { liveAssetsMap, lastTelemetry, triggerFailure, resetAssetSimulation } = useSocket();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets');
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Update live values in real-time when socket broadcast arrives
  useEffect(() => {
    if (lastTelemetry) {
      setAssets((prev) =>
        prev.map((asset) => {
          if (asset.id === lastTelemetry.assetId) {
            return {
              ...asset,
              healthScore: lastTelemetry.healthScore,
              status: lastTelemetry.status,
              sensors: asset.sensors.map((s) => {
                const liveSensor = lastTelemetry.sensors.find((ls) => ls.id === s.id);
                return liveSensor ? { ...s, currentReading: liveSensor.value, status: liveSensor.status } : s;
              }),
            };
          }
          return asset;
        })
      );
    }
  }, [lastTelemetry]);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              LIVE MONITORING CENTER
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time telemetry stream matrix updating every 3,000ms over WebSockets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-mono transition-colors ${
              viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-mono transition-colors ${
              viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search live assets by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Status Filter: All ({assets.length})</option>
            <option value="HEALTHY">HEALTHY</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const statusBadge = getStatusBadge(asset.status);
            const tempSensor = asset.sensors.find((s) => s.type === 'TEMPERATURE');
            const vibSensor = asset.sensors.find((s) => s.type === 'VIBRATION');
            const pressSensor = asset.sensors.find((s) => s.type === 'PRESSURE');
            const powerSensor = asset.sensors.find((s) => s.type === 'ENERGY');

            return (
              <div
                key={asset.id}
                className={`glass-panel p-5 rounded-xl border transition-all duration-300 ${
                  asset.status === 'CRITICAL'
                    ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse-slow'
                    : asset.status === 'WARNING'
                    ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {/* Top Title & Health Pill */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{asset.assetCode}</span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{asset.name}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} animate-ping`} />
                    {statusBadge.label}
                  </span>
                </div>

                {/* Health Progress Bar */}
                <div className="mt-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px]">HEALTH SCORE</span>
                    <span className="font-bold text-slate-200">{asset.healthScore}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        asset.healthScore >= 80
                          ? 'bg-emerald-400'
                          : asset.healthScore >= 60
                          ? 'bg-amber-400'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${asset.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Live 4-Matrix Sensor Grid */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">TEMP</span>
                    <p className={`text-sm font-mono font-extrabold ${tempSensor?.status === 'CRITICAL' ? 'text-red-400' : 'text-slate-100'}`}>
                      {tempSensor ? `${tempSensor.currentReading} ${tempSensor.unit}` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">VIB</span>
                    <p className={`text-sm font-mono font-extrabold ${vibSensor?.status === 'CRITICAL' ? 'text-red-400' : 'text-slate-100'}`}>
                      {vibSensor ? `${vibSensor.currentReading} ${vibSensor.unit}` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">PRESSURE</span>
                    <p className="text-sm font-mono font-extrabold text-slate-100">
                      {pressSensor ? `${pressSensor.currentReading} ${pressSensor.unit}` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">ENERGY</span>
                    <p className="text-sm font-mono font-extrabold text-slate-100">
                      {powerSensor ? `${powerSensor.currentReading} ${powerSensor.unit}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => triggerFailure(asset.id)}
                      className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-[10px]"
                      title="Simulate Failure"
                    >
                      <Zap className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => resetAssetSimulation(asset.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                      title="Reset Baseline"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  <Link
                    to={`/digital-twins?assetId=${asset.id}`}
                    className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>3D Twin</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Temperature</th>
                  <th className="py-3 px-4">Vibration</th>
                  <th className="py-3 px-4">Pressure</th>
                  <th className="py-3 px-4">Energy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.map((asset) => {
                  const statusBadge = getStatusBadge(asset.status);
                  const tempSensor = asset.sensors.find((s) => s.type === 'TEMPERATURE');
                  const vibSensor = asset.sensors.find((s) => s.type === 'VIBRATION');
                  const pressSensor = asset.sensors.find((s) => s.type === 'PRESSURE');
                  const powerSensor = asset.sensors.find((s) => s.type === 'ENERGY');

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-400">{asset.assetCode}</td>
                      <td className="py-3 px-4 text-slate-100 font-semibold">{asset.name}</td>
                      <td className="py-3 px-4 font-bold">{asset.healthScore}%</td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {tempSensor ? `${tempSensor.currentReading} ${tempSensor.unit}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {vibSensor ? `${vibSensor.currentReading} ${vibSensor.unit}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {pressSensor ? `${pressSensor.currentReading} ${pressSensor.unit}` : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {powerSensor ? `${powerSensor.currentReading} ${powerSensor.unit}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/digital-twins?assetId=${asset.id}`}
                          className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
                        >
                          3D Twin
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
