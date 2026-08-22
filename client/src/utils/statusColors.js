export function getStatusBadge(status) {
  switch (status) {
    case 'HEALTHY':
      return {
        label: 'Healthy',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      };
    case 'WARNING':
      return {
        label: 'Warning',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      };
    case 'CRITICAL':
      return {
        label: 'Critical',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
      };
    case 'OFFLINE':
      return {
        label: 'Offline',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        glow: '',
      };
    case 'MAINTENANCE':
    case 'UNDER_MAINTENANCE':
      return {
        label: 'In Maintenance',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-400',
        glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        glow: '',
      };
  }
}

export function getHealthScoreColor(score) {
  if (score >= 80) return { text: 'text-emerald-400', stroke: '#10b981', gradient: 'from-emerald-500 to-teal-400' };
  if (score >= 60) return { text: 'text-amber-400', stroke: '#f59e0b', gradient: 'from-amber-500 to-yellow-400' };
  if (score >= 40) return { text: 'text-orange-400', stroke: '#f97316', gradient: 'from-orange-500 to-red-400' };
  return { text: 'text-red-400', stroke: '#ef4444', gradient: 'from-red-600 to-rose-400' };
}

export function getSeverityBadge(severity) {
  switch (severity) {
    case 'CRITICAL':
      return { label: 'CRITICAL', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40' };
    case 'WARNING':
      return { label: 'WARNING', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' };
    case 'INFO':
    default:
      return { label: 'INFO', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/40' };
  }
}

export function getPriorityBadge(priority) {
  switch (priority) {
    case 'URGENT':
      return { label: 'URGENT', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40' };
    case 'HIGH':
      return { label: 'HIGH', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/40' };
    case 'MEDIUM':
      return { label: 'MEDIUM', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' };
    case 'LOW':
    default:
      return { label: 'LOW', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/40' };
  }
}
