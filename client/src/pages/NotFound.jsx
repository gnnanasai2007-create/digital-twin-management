import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-mono">
      <AlertOctagon className="w-16 h-16 text-cyan-400 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-slate-100">404 - ROUTE NOT FOUND</h1>
      <p className="text-sm text-slate-400 max-w-md">
        The requested digital twin station or telemetry view does not exist in the plant network.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Main Dashboard</span>
      </Link>
    </div>
  );
}
