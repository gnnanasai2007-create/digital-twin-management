import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const res = await api.get('/audit', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const getActionColor = (action) => {
    if (action.includes('CREATED') || action.includes('INITIALIZATION')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (action.includes('UPDATED') || action.includes('ACKNOWLEDGED')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (action.includes('DELETED') || action.includes('FAILURE')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-cyan-400" />
            ENTERPRISE AUDIT & COMPLIANCE LOGS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Tamper-evident chronological trail of all user actions, logins, work orders & simulator state changes
          </p>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">Action Filter: All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="ASSET_CREATED">ASSET CREATED</option>
            <option value="ASSET_UPDATED">ASSET UPDATED</option>
            <option value="ASSET_DELETED">ASSET DELETED</option>
            <option value="MAINTENANCE_CREATED">MAINTENANCE CREATED</option>
            <option value="ALERT_ACKNOWLEDGED">ALERT ACKNOWLEDGED</option>
            <option value="ALERT_RESOLVED">ALERT RESOLVED</option>
            <option value="SETTINGS_CHANGED">SETTINGS CHANGED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Details / Metadata</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.user?.name || 'System Auto-Agent'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{log.user?.email || 'internal'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.entityType || 'General'}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate font-mono text-[11px]">
                      {log.details || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <div>{formatDateTime(log.timestamp)}</div>
                      <div className="text-[10px] text-slate-500">{formatRelativeTime(log.timestamp)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
