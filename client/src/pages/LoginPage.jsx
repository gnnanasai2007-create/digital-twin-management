import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black industrial-grid">
      <div className="max-w-md w-full glass-panel-glow bg-[#0b1120]/95 p-8 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-2">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            DTAM CONTROL STATION
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Digital Twin Asset Management System
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@plant.com"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
              Access Token / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Authorize & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Quick Demo Role Logins:</span>
            <span className="text-cyan-400 font-semibold">1-Click Auto-Fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('admin@example.com', 'Admin@123')}
              className={`p-2 rounded-lg text-[11px] font-mono text-left border transition-all ${
                email === 'admin@example.com'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>ADMIN</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">admin@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('manager@example.com', 'Manager@123')}
              className={`p-2 rounded-lg text-[11px] font-mono text-left border transition-all ${
                email === 'manager@example.com'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-cyan-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>MANAGER</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">manager@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('technician@example.com', 'Tech@123')}
              className={`p-2 rounded-lg text-[11px] font-mono text-left border transition-all ${
                email === 'technician@example.com'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>TECHNICIAN</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">technician@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleSelect('viewer@example.com', 'Viewer@123')}
              className={`p-2 rounded-lg text-[11px] font-mono text-left border transition-all ${
                email === 'viewer@example.com'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>VIEWER</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">viewer@example.com</div>
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs font-mono text-cyan-400 hover:underline">
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
