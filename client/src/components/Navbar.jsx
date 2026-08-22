import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Sliders, Zap, LogOut, User, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveBadge from './LiveBadge';
import NotificationDropdown from './NotificationDropdown';
import SimulationControlsModal from './SimulationControlsModal';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'MANAGER':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'TECHNICIAN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'VIEWER':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 bg-[#070c18]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-extrabold text-lg tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors">
                  DTAM
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight -mt-1 hidden sm:block">
                Digital Twin Asset Manager
              </p>
            </div>
          </Link>

          <div className="hidden md:block ml-4 pl-4 border-l border-slate-800">
            <LiveBadge />
          </div>
        </div>

        {/* Right: Simulation Controls, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Simulation / Failure Trigger Button */}
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Simulation Hub</span>
          </button>

          {/* Real-time Notifications */}
          <NotificationDropdown />

          {/* User Profile & Role Tag */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-200">{user?.name || 'Operator'}</span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 rounded border uppercase ${getRoleBadgeColor(
                  user?.role
                )}`}
              >
                {user?.role || 'VIEWER'}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <SimulationControlsModal isOpen={isSimModalOpen} onClose={() => setIsSimModalOpen(false)} />
    </>
  );
}
