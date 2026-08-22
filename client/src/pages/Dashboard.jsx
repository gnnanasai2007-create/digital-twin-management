import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  Activity,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatCard from '../components/StatCard';
import CircularGauge from '../components/CircularGauge';
import { getStatusBadge, getSeverityBadge } from '../utils/statusColors';
import { formatRelativeTime } from '../utils/formatters';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const { liveAssetsMap, lastTelemetry, triggerFailure, resetAssetSimulation } = useSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, assetsRes, alertsRes, analyticsRes] = await Promise.all([
        api.get('/assets/stats'),
        api.get('/assets'),
        api.get('/alerts?resolved=false'),
        api.get('/analytics/overview?range=30d'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (assetsRes.data.success) setAssets(assetsRes.data.assets);
      if (alertsRes.data.success) setAlerts(alertsRes.data.alerts);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update dynamic asset cards if live telemetry changes healthScore
  useEffect(() => {
    if (lastTelemetry) {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id === lastTelemetry.assetId) {
            return {
              ...a,
              healthScore: lastTelemetry.healthScore,
              status: lastTelemetry.status,
            };
          }
          return a;
        })
      );
    }
  }, [lastTelemetry]);

  // Compute pie chart data for health distribution
  const healthPieData = analytics?.healthDistribution
    ? [
        { name: 'Healthy (≥80%)', value: analytics.healthDistribution.healthy, color: '#10b981' },
        { name: 'Warning (60-79%)', value: analytics.healthDistribution.warning, color: '#f59e0b' },
        { name: 'High Risk (40-59%)', value: analytics.healthDistribution.highRisk, color: '#f97316' },
        { name: 'Critical (<40%)', value: analytics.healthDistribution.critical, color: '#ef4444' },
      ]
    : [];

  const failingAsset = assets.find((a) => a.status === 'CRITICAL') || assets[0];

  return (
    <div className="space-y-6">
      {/* Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              PLANT TELEMETRY DASHBOARD
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time Digital Twin telemetry sync and predictive condition monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/digital-twins"
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Open 3D Twins</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Assets"
          value={stats?.totalAssets ?? 10}
          icon={Boxes}
          color="cyan"
          subtitle="Monitored Units"
        />
        <StatCard
          title="Healthy"
          value={stats?.healthy ?? 7}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Nominal ISO Level"
        />
        <StatCard
          title="Warning"
          value={stats?.warning ?? 2}
          icon={AlertTriangle}
          color="amber"
          subtitle="Elevated Drift"
        />
        <StatCard
          title="Critical"
          value={stats?.critical ?? 1}
          icon={AlertOctagon}
          color="red"
          subtitle="Action Required"
        />
        <StatCard
          title="Maint. Due"
          value={stats?.maintenanceDue ?? 2}
          icon={Wrench}
          color="purple"
          subtitle="Work Orders"
        />
        <StatCard
          title="Avg Health"
          value={`${stats?.averageHealth ?? 88.5}%`}
          icon={Activity}
          color="cyan"
          subtitle="Overall Fleet"
        />
      </div>

      {/* Main Charts & 3D Teaser Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Health Distribution & Energy Consumption Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Energy Consumption Trend Area Chart */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Aggregate Fleet Energy Load (kW)
                </h3>
                <p className="text-xs text-slate-400">Historical consumption trend across active powertrain units</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                Last 30 Days
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.energyTimeline || []}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontStyle="italic" />
                  <YAxis stroke="#64748b" fontSize={10} unit=" kW" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1120',
                      borderColor: '#06b6d4',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgEnergyKw"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#energyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Telemetry Live Stream Table */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                Physical Fleet Live State
              </h3>
              <Link to="/assets" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                <span>View Full Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/40">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Asset Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Health Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.slice(0, 5).map((asset) => {
                    const statusBadge = getStatusBadge(asset.status);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-cyan-400">{asset.assetCode}</td>
                        <td className="py-3 px-3 text-slate-200">{asset.name}</td>
                        <td className="py-3 px-3 text-slate-400">{asset.type}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  asset.healthScore >= 80
                                    ? 'bg-emerald-400'
                                    : asset.healthScore >= 60
                                    ? 'bg-amber-400'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${asset.healthScore}%` }}
                              />
                            </div>
                            <span>{asset.healthScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/digital-twins?assetId=${asset.id}`}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 transition-colors text-[11px]"
                          >
                            Open Twin
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Health Distribution Donut & Critical Alerts Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Distribution Donut */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Fleet Health Distribution
            </h3>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {healthPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1120',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              {healthPieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-400 text-[11px] truncate">
                    {d.name.split(' ')[0]}: <strong className="text-slate-200">{d.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Demo Simulator Widget */}
          <div className="glass-panel-glow p-5 rounded-xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Live Demo Simulation
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
            </div>

            <p className="text-xs text-slate-400">
              Experience the Digital Twin reactivity by simulating failure on a high-pressure machine.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => failingAsset && triggerFailure(failingAsset.id)}
                className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate Thermal & Vibration Failure</span>
              </button>

              <button
                onClick={() => failingAsset && resetAssetSimulation(failingAsset.id)}
                className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Reset Simulation to Normal</span>
              </button>
            </div>
          </div>

          {/* Active Critical Alerts Feed */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Active Alerts ({alerts.length})
              </h3>
              <Link to="/alerts" className="text-xs font-mono text-cyan-400 hover:underline">
                All Alerts
              </Link>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active alarms. Zero faults detected.</p>
              ) : (
                alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-cyan-400">{alert.asset?.assetCode}</span>
                      <span className="text-slate-500">{formatRelativeTime(alert.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
