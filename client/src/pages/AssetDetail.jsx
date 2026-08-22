import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Boxes,
  Cpu,
  Activity,
  Wrench,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  Thermometer,
  Zap,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import CircularGauge from '../components/CircularGauge';
import ThreeScene from '../digital-twin/ThreeScene';
import ComponentInspector from '../digital-twin/ComponentInspector';
import { getStatusBadge, getSeverityBadge, getPriorityBadge } from '../utils/statusColors';
import { formatDateTime, formatDate } from '../utils/formatters';

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const { liveAssetsMap, lastTelemetry, triggerFailure, resetAssetSimulation } = useSocket();

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      const [assetRes, historyRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/digital-twins/${id}/history?range=${timeRange}`),
      ]);

      if (assetRes.data.success) setAsset(assetRes.data.asset);
      if (historyRes.data.success) setHistory(historyRes.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id, timeRange]);

  // Live telemetry listener
  useEffect(() => {
    if (lastTelemetry && lastTelemetry.assetId === id) {
      setAsset((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          healthScore: lastTelemetry.healthScore,
          status: lastTelemetry.status,
          sensors: prev.sensors.map((s) => {
            const updated = lastTelemetry.sensors.find((ls) => ls.id === s.id);
            return updated ? { ...s, currentReading: updated.value, status: updated.status } : s;
          }),
        };
      });
    }
  }, [lastTelemetry, id]);

  if (loading && !asset) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-400">Asset not found.</p>
        <Link to="/assets" className="text-cyan-400 hover:underline">
          ← Back to Inventory
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(asset.status);

  // Parse failure risk from digital twin
  let failureRisk = {
    failureProbability: 5,
    riskLevel: 'LOW',
    estimatedMaintenanceWindow: 'Normal Schedule',
    recommendation: 'Nominal operational status.',
  };
  try {
    if (asset.digitalTwin?.failureRisk) {
      failureRisk = JSON.parse(asset.digitalTwin.failureRisk);
    }
  } catch {}

  // Format telemetry history for multi-line Recharts
  const chartDataMap = new Map();
  for (const r of history) {
    const timeKey = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!chartDataMap.has(timeKey)) {
      chartDataMap.set(timeKey, { time: timeKey });
    }
    const item = chartDataMap.get(timeKey);
    item[r.sensor.type] = r.value;
  }
  const chartData = Array.from(chartDataMap.values());

  const handleComponentSelect = (compName, compType) => {
    setSelectedComponent({
      name: compName,
      type: compType,
      status: asset.status,
      healthScore: asset.healthScore,
      temperature: asset.sensors.find((s) => s.type === 'TEMPERATURE')?.currentReading || 48.0,
      vibration: asset.sensors.find((s) => s.type === 'VIBRATION')?.currentReading || 1.8,
      lastMaintenance: asset.maintenances[0]?.completedDate || new Date(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/assets"
            className="p-2 rounded-lg glass-panel hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">{asset.assetCode}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">{asset.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/digital-twins?assetId=${asset.id}`}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Dedicated 3D Twin</span>
          </Link>
          <Link
            to={`/maintenance?assetId=${asset.id}`}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold glass-panel hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>Schedule Work Order</span>
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Twin & Historical Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive 3D Canvas */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Parametric 3D Digital Twin Viewer
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Click components to inspect</span>
            </div>

            <div className="relative">
              <ThreeScene
                assetType={asset.type}
                status={asset.status}
                sensors={asset.sensors}
                onSelectComponent={handleComponentSelect}
                selectedComponentName={selectedComponent?.name}
                className="h-[380px]"
              />

              {/* Floating Component Inspector Overlay */}
              {selectedComponent && (
                <div className="absolute top-4 right-4 z-20 w-72">
                  <ComponentInspector
                    component={selectedComponent}
                    onClose={() => setSelectedComponent(null)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Historical Trend Charts */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Historical Telemetry Stream
                </h3>
                <p className="text-xs text-slate-400">Multi-parameter correlation over time</p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      timeRange === range
                        ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1120',
                      borderColor: '#06b6d4',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="TEMPERATURE"
                    name="Temperature (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="VIBRATION"
                    name="Vibration (mm/s)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="PRESSURE"
                    name="Pressure (bar)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ENERGY"
                    name="Energy (kW)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Health Gauge, Sensors & Failure Prediction */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Gauge & Failure Probability */}
          <div className="glass-panel p-5 rounded-xl flex flex-col items-center justify-center space-y-4">
            <CircularGauge score={asset.healthScore} size={170} />

            <div className="w-full pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Failure Probability:</span>
                <span
                  className={`font-bold ${
                    failureRisk.failureProbability >= 50
                      ? 'text-red-400'
                      : failureRisk.failureProbability >= 25
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {failureRisk.failureProbability}% ({failureRisk.riskLevel})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    failureRisk.failureProbability >= 70
                      ? 'bg-red-500'
                      : failureRisk.failureProbability >= 40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${failureRisk.failureProbability}%` }}
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider">
                  Prescriptive Window:
                </span>
                <p className="text-slate-300">{failureRisk.estimatedMaintenanceWindow}</p>
                <p className="text-slate-400 text-[10px] mt-1 italic">{failureRisk.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Real-time Sensor Telemetry Cards */}
          <div className="glass-panel p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Sensor Telemetry
            </h3>

            <div className="space-y-2.5">
              {asset.sensors.map((sensor) => {
                const isCrit = sensor.currentReading >= sensor.criticalThreshold;
                const isWarn = sensor.currentReading >= sensor.warningThreshold;
                return (
                  <div
                    key={sensor.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCrit
                        ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : isWarn
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-semibold">{sensor.type}</span>
                      <span
                        className={`font-extrabold text-sm ${
                          isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-slate-100'
                        }`}
                      >
                        {sensor.currentReading} {sensor.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>Warn: {sensor.warningThreshold}{sensor.unit}</span>
                      <span>Crit: {sensor.criticalThreshold}{sensor.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Specs Metadata */}
          <div className="glass-panel p-5 rounded-xl space-y-3 text-xs font-mono">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Specifications</h3>
            <div className="space-y-2 divide-y divide-slate-800/60">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Manufacturer</span>
                <span className="text-slate-200">{asset.manufacturer}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Model</span>
                <span className="text-slate-200">{asset.model}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Serial Number</span>
                <span className="text-slate-200">{asset.serialNumber}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Operating Hours</span>
                <span className="text-slate-200">{Math.round(asset.operatingHours)} hrs</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-200">{asset.location ? asset.location.name : 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
