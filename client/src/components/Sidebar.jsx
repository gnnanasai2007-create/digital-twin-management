import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Activity,
  Wrench,
  AlertTriangle,
  BarChart3,
  FileText,
  Network,
  History,
  Settings,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isManager, isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assets', label: 'Asset Inventory', icon: Boxes },
    { to: '/digital-twins', label: 'Digital Twins 3D', icon: Cpu, badge: '3D' },
    { to: '/monitoring', label: 'Live Monitoring', icon: Activity, live: true },
    { to: '/maintenance', label: 'Maintenance Hub', icon: Wrench },
    { to: '/alerts', label: 'Alert Center', icon: AlertTriangle },
    { to: '/analytics', label: 'Predictive Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports & Export', icon: FileText },
    { to: '/architecture', label: 'System Architecture', icon: Network },
    ...(isManager ? [{ to: '/audit', label: 'Audit Logs', icon: History }] : []),
    { to: '/settings', label: 'Settings & Config', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-20 w-64 glass-panel border-r border-slate-800/80 bg-[#070c18]/95 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Industrial Operations
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-colors group-hover:text-cyan-400" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    {item.badge}
                  </span>
                )}

                {item.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Station Status Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-mono">
              <p className="text-slate-200 font-semibold">Node #01-A Active</p>
              <p className="text-slate-500 text-[10px]">ISO 13374 Compliant</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
