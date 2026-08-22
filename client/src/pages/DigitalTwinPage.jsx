import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Cpu,
  Activity,
  Zap,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Wrench,
  ChevronDown,
  Layers,
  Thermometer,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import ThreeScene from '../digital-twin/ThreeScene';
import ComponentInspector from '../digital-twin/ComponentInspector';
import CircularGauge from '../components/CircularGauge';
import { getStatusBadge } from '../utils/statusColors';
import { formatDateTime } from '../utils/formatters';

export default function DigitalTwinPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(searchParams.get('assetId') || '');
  const [currentTwin, setCurrentTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const { lastTelemetry, simulationStatus, triggerFailure, resetAssetSimulation } = useSocket();

  // Load all assets to populate the twin selector
  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await api.get('/assets');
        if (res.data.success) {
          setAssets(res.data.assets);
          if (!selectedAssetId && res.data.assets.length > 0) {
            setSelectedAssetId(res.data.assets[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAssets();
  }, []);

  // Fetch twin details when selectedAssetId changes
  useEffect(() => {
    async function fetchTwin() {
      if (!selectedAssetId) return;
      try {
        setLoading(true);
        const res = await api.get(`/digital-twins/${selectedAssetId}`);
        if (res.data.success) {
          setCurrentTwin(res.data.twin);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTwin();
  }, [selectedAssetId]);

  // Live updates
  useEffect(() => {
    if (lastTelemetry && lastTelemetry.assetId === selectedAssetId) {
      setCurrentTwin((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          healthScore: lastTelemetry.healthScore,
          currentState: lastTelemetry.status === 'CRITICAL' ? 'FAULT' : lastTelemetry.status === 'WARNING' ? 'DEGRADED' : 'OPERATIONAL',
          failureRisk: JSON.stringify(lastTelemetry.failureRisk),
          asset: {
            ...prev.asset,
            healthScore: lastTelemetry.healthScore,
            status: lastTelemetry.status,
            sensors: prev.asset.sensors.map((s) => {
              const u = lastTelemetry.sensors.find((ls) => ls.id === s.id);
              return u ? { ...s, currentReading: u.value, status: u.status } : s;
            }),
          },
        };
      });
    }
  }, [lastTelemetry, selectedAssetId]);

  const handleAssetChange = (id) => {
    setSelectedAssetId(id);
    setSearchParams({ assetId: id });
    setSelectedComponent(null);
  };

  const handleComponentSelect = (compName, compType) => {
    if (!currentTwin?.asset) return;
    const tempSensor = currentTwin.asset.sensors?.find((s) => s.type === 'TEMPERATURE');
    const vibSensor = currentTwin.asset.sensors?.find((s) => s.type === 'VIBRATION');

    setSelectedComponent({
      name: compName,
      type: compType,
      status: currentTwin.asset.status,
      healthScore: currentTwin.healthScore,
      temperature: tempSensor?.currentReading || 52.0,
      vibration: vibSensor?.currentReading || 1.8,
      lastMaintenance: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    });
  };

  const isFailing = simulationStatus?.activeFailures?.includes(selectedAssetId);

  let failureRisk = {
    failureProbability: 5,
    riskLevel: 'LOW',
    estimatedMaintenanceWindow: 'Normal Schedule',
    recommendation: 'Nominal operational status.',
  };
  try {
    if (currentTwin?.failureRisk) {
      failureRisk = JSON.parse(currentTwin.failureRisk);
    }
  } catch {}

  const currentAsset = currentTwin?.asset;
  const statusBadge = getStatusBadge(currentAsset?.status || 'HEALTHY');

  return (
    <div className="space-y-6">
      {/* Header & Asset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-7 h-7 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              3D DIGITAL TWIN COMMAND CENTER
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time interactive kinematic twin with sub-assembly component telemetry
          </p>
        </div>

        {/* Machinery Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedAssetId}
              onChange={(e) => handleAssetChange(e.target.value)}
              className="bg-slate-900 border border-cyan-500/40 rounded-lg px-4 py-2 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] pr-8 appearance-none cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} - {a.name} ({a.healthScore}%)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left 3D Canvas, Right Digital Twin State Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Interactive Model */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative glass-panel p-2 rounded-xl border border-cyan-500/30 shadow-2xl">
            <ThreeScene
              assetType={currentAsset?.type || 'PUMP'}
              status={currentAsset?.status || 'HEALTHY'}
              sensors={currentAsset?.sensors || []}
              onSelectComponent={handleComponentSelect}
              selectedComponentName={selectedComponent?.name}
              className="h-[520px] rounded-lg"
            />

            {/* Floating Component Inspector Overlay */}
            {selectedComponent && (
              <div className="absolute top-4 right-4 z-20 w-80">
                <ComponentInspector
                  component={selectedComponent}
                  onClose={() => setSelectedComponent(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Digital Twin Attributes, Gauge & Simulation Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest">
                  Virtual Twin Sync
                </span>
                <h3 className="text-lg font-bold text-slate-100 font-mono">
                  {currentAsset?.name}
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {currentTwin?.currentState || 'OPERATIONAL'}
              </span>
            </div>

            {/* Twin Specs Table */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px]">ASSET ID</span>
                <p className="text-slate-200 font-bold">{currentAsset?.assetCode}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">TWIN ID</span>
                <p className="text-cyan-400 font-bold truncate">{currentTwin?.id?.slice(0, 12)}...</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">MAINTENANCE STATUS</span>
                <p className="text-slate-200 font-bold">{currentTwin?.maintenanceStatus}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">TOTAL RUN HOURS</span>
                <p className="text-slate-200 font-bold">{Math.round(currentTwin?.operatingHours || 0)} hrs</p>
              </div>
            </div>

            {/* Health Score Gauge & Risk Probability */}
            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="flex justify-center">
                <CircularGauge score={currentTwin?.healthScore || 100} size={140} />
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Failure Risk:</span>
                    <span className="text-red-400 font-bold">{failureRisk.failureProbability}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        failureRisk.failureProbability >= 50 ? 'bg-red-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${failureRisk.failureProbability}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                  <span className="text-cyan-400 font-bold">Action Window:</span>
                  <p className="text-slate-300">{failureRisk.estimatedMaintenanceWindow}</p>
                </div>
              </div>
            </div>

            {/* Prescriptive Recommendation */}
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono space-y-1">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Prescriptive Maintenance Action:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">{failureRisk.recommendation}</p>
            </div>

            {/* Simulation Triggers */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => selectedAssetId && triggerFailure(selectedAssetId)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                  isFailing
                    ? 'bg-red-500/30 text-red-300 border-red-500/50 animate-pulse'
                    : 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Failure</span>
              </button>

              <button
                onClick={() => selectedAssetId && resetAssetSimulation(selectedAssetId)}
                className="py-2.5 px-3 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Sensor Stream Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Synchronized Sensor Telemetry Array
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentAsset?.sensors?.map((sensor) => {
            const isCrit = sensor.currentReading >= sensor.criticalThreshold;
            const isWarn = sensor.currentReading >= sensor.warningThreshold;
            return (
              <div
                key={sensor.id}
                className={`glass-panel p-4 rounded-xl border transition-all ${
                  isCrit
                    ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : isWarn
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>{sensor.type}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <div className="text-xl lg:text-2xl font-mono font-extrabold text-slate-100">
                  {sensor.currentReading} <span className="text-xs font-normal text-slate-400">{sensor.unit}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                  <span>W: {sensor.warningThreshold}{sensor.unit}</span>
                  <span>C: {sensor.criticalThreshold}{sensor.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
