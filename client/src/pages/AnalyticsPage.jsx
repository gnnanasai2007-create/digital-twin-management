import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/overview?range=${range}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const healthPie = data?.healthDistribution
    ? [
        { name: 'Healthy (≥80%)', value: data.healthDistribution.healthy, color: '#10b981' },
        { name: 'Warning (60-79%)', value: data.healthDistribution.warning, color: '#f59e0b' },
        { name: 'High Risk (40-59%)', value: data.healthDistribution.highRisk, color: '#f97316' },
        { name: 'Critical (<40%)', value: data.healthDistribution.critical, color: '#ef4444' },
      ]
    : [];

  const alertPie = data?.alertStats
    ? [
        { name: 'Critical Alarms', value: data.alertStats.critical, color: '#ef4444' },
        { name: 'Warning Alarms', value: data.alertStats.warning, color: '#f59e0b' },
        { name: 'Info Notices', value: data.alertStats.info, color: '#06b6d4' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            PREDICTIVE & HISTORICAL ANALYTICS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Fleet health distributions, energy trends, maintenance ROI & failure probability forecasts
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: '1y', label: '1 Year' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                range === item.key
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Maintenance Spend"
          value={formatCurrency(data?.maintenance?.totalCost || 0)}
          icon={DollarSign}
          color="cyan"
          subtitle={`${data?.maintenance?.totalTasks || 0} work orders`}
        />
        <StatCard
          title="Work Order Completion"
          value={`${data?.maintenance?.completionRate || 0}%`}
          icon={ShieldCheck}
          color="emerald"
          subtitle={`${data?.maintenance?.completedTasks || 0} completed`}
        />
        <StatCard
          title="Total Incidents"
          value={data?.alertStats?.total || 0}
          icon={AlertTriangle}
          color="amber"
          subtitle={`${data?.alertStats?.critical || 0} critical breaches`}
        />
        <StatCard
          title="Resolution Rate"
          value={`${data?.alertStats?.total ? Math.round((data.alertStats.resolved / data.alertStats.total) * 100) : 100}%`}
          icon={Activity}
          color="purple"
          subtitle={`${data?.alertStats?.resolved || 0} resolved incidents`}
        />
      </div>

      {/* Charts Row 1: Energy & Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Energy Consumption Timeline */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Fleet Energy Demand Profile (kW)
            </h3>
            <span className="text-xs font-mono text-cyan-400">Aggregated Daily Draw</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.energyTimeline || []}>
                <defs>
                  <linearGradient id="anEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
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
                  fill="url(#anEnergyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution Donut */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
            Health Condition Breakdown
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {healthPie.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
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
            {healthPie.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-400 text-[10px] truncate">
                  {d.name.split(' ')[0]}: <strong className="text-slate-200">{d.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Failure Probability Ranking & Alert Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Failure Probability Rankings */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              Machine Failure Probability Ranking (%)
            </h3>
            <span className="text-xs font-mono text-slate-400">Risk Assessment Index</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.failureRankings || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#ef4444',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="failureProbability" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Severity Breakdown */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
            Incident Severity Breakdown
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {alertPie.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
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

          <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
            {alertPie.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <strong className="text-slate-200">{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
