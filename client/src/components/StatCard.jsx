import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'cyan',
  className = '',
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.12)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      text: 'text-cyan-400',
    },
    emerald: {
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.12)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      text: 'text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      text: 'text-amber-400',
    },
    red: {
      border: 'border-red-500/30',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
      text: 'text-red-400',
    },
    purple: {
      border: 'border-purple-500/30',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.12)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      text: 'text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-600 ${scheme.glow} ${className}`}
    >
      {/* Background ambient corner gradient */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-mono font-bold text-slate-100">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono font-medium ${
                trendPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
