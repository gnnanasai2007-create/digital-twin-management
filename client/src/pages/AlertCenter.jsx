import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle,
  CheckCheck,
  Search,
  Filter,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { getSeverityBadge } from '../utils/statusColors';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resolvedFilter, setResolvedFilter] = useState('false'); // Active by default
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { recentAlerts } = useSocket();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (resolvedFilter !== 'ALL') params.resolved = resolvedFilter;

      const res = await api.get('/alerts', { params });
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, resolvedFilter, recentAlerts]);

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date() } : a))
      );
    } catch (err) {
      alert('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, resolved: true, resolvedAt: new Date() } : a))
      );
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            INDUSTRIAL ANOMALY & ALERT CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time automated threshold breaches, rate of change spikes & thermal alarms
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border ${
              soundEnabled
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle Alarm Chimes"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chimes ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          <div>
            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="false">Active Unresolved</option>
              <option value="true">Resolved Archives</option>
              <option value="ALL">All Alerts</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-cyan-400">{alerts.length}</strong> incidents
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Sensor Node</th>
                <th className="py-3 px-4">Anomaly Message</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Acknowledgment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-mono">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    No active anomaly alerts matching filter criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => {
                  const sev = getSeverityBadge(alert.severity);
                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        !alert.acknowledged && !alert.resolved ? 'bg-red-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${sev.bg} ${sev.text} ${sev.border}`}
                        >
                          {alert.severity === 'CRITICAL' ? (
                            <AlertOctagon className="w-3 h-3" />
                          ) : alert.severity === 'WARNING' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <Info className="w-3 h-3" />
                          )}
                          {alert.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/assets/${alert.assetId}`}
                          className="font-bold text-cyan-400 hover:underline"
                        >
                          {alert.asset?.assetCode}
                        </Link>
                        <div className="text-[10px] text-slate-400">{alert.asset?.name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {alert.sensor ? `${alert.sensor.sensorCode} (${alert.sensor.type})` : 'SYSTEM'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-100 max-w-xs font-semibold">
                        {alert.message}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        <div>{formatDateTime(alert.timestamp)}</div>
                        <div className="text-[10px] text-slate-500">{formatRelativeTime(alert.timestamp)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {alert.acknowledged ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCheck className="w-3.5 h-3.5" />
                            Ack by {alert.acknowledgedBy || 'Operator'}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold text-[11px]">Unacknowledged</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!alert.acknowledged && !alert.resolved && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 hover:bg-cyan-950 border border-cyan-500/30 text-[11px]"
                            >
                              Ack
                            </button>
                          )}

                          {!alert.resolved && (
                            <button
                              onClick={() => handleResolve(alert.id)}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px]"
                            >
                              Resolve
                            </button>
                          )}

                          <Link
                            to={`/digital-twins?assetId=${alert.assetId}`}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400"
                            title="View in 3D Digital Twin"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
