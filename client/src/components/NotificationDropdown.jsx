import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatRelativeTime } from '../utils/formatters';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { recentAlerts } = useSocket();

  const fetchActiveAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts?resolved=false');
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
    fetchActiveAlerts();
  }, [recentAlerts]);

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  const handleAcknowledge = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/alerts/${id}/acknowledge`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel-glow bg-[#0b1120] border border-cyan-500/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Notifications ({alerts.length})
                </h4>
              </div>
              <Link
                to="/alerts"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span>All industrial parameters nominal. Zero active alerts.</span>
                </div>
              ) : (
                alerts.slice(0, 8).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 transition-colors hover:bg-slate-800/40 ${
                      !alert.acknowledged ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatRelativeTime(alert.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-1 font-medium line-clamp-2">
                      {alert.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{alert.asset?.assetCode}</span>
                      {!alert.acknowledged ? (
                        <button
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400 hover:bg-cyan-900/40 transition-colors border border-cyan-500/30"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
