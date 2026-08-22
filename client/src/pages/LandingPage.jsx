import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Activity,
  ShieldAlert,
  Wrench,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
  Box,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import ThreeScene from '../digital-twin/ThreeScene';

export default function LandingPage() {
  const sampleSensors = [
    { type: 'TEMPERATURE', currentReading: 54.2, unit: '°C', status: 'NORMAL' },
    { type: 'VIBRATION', currentReading: 2.1, unit: 'mm/s', status: 'NORMAL' },
    { type: 'PRESSURE', currentReading: 4.6, unit: 'bar', status: 'NORMAL' },
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 h-20 glass-panel border-b border-slate-800/80 bg-[#070c18]/80 backdrop-blur-lg px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-mono font-extrabold text-xl tracking-wider text-slate-100">
              DTAM
            </span>
            <p className="text-[10px] text-cyan-400 font-mono tracking-tight -mt-1">
              Digital Twin Asset Manager
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#what-is-digital-twin" className="hover:text-cyan-400 transition-colors">
            Concept
          </a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">
            Architecture
          </a>
          <a href="#benefits" className="hover:text-cyan-400 transition-colors">
            Benefits
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 overflow-hidden industrial-grid">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Gen Industrial IoT & Digital Twin Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Digital Twin-Based <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Asset Management System
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 font-normal leading-relaxed max-w-2xl">
              <span className="font-semibold text-slate-200">"Monitor. Predict. Maintain. Optimize."</span>
              <br />
              Bridge the physical-to-digital divide with real-time 3D simulation, sensor streaming, algorithmic health scoring, and prescriptive predictive maintenance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl text-sm font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Launch Enterprise App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/digital-twins"
                className="px-6 py-3.5 rounded-xl text-sm font-mono font-bold glass-panel hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Explore 3D Models</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <h4 className="text-2xl font-mono font-bold text-cyan-400">10+</h4>
                <p className="text-xs text-slate-400">Industrial Twins</p>
              </div>
              <div>
                <h4 className="text-2xl font-mono font-bold text-emerald-400">&lt; 3s</h4>
                <p className="text-xs text-slate-400">Real-Time Sync</p>
              </div>
              <div>
                <h4 className="text-2xl font-mono font-bold text-amber-400">99.4%</h4>
                <p className="text-xs text-slate-400">Anomaly Capture</p>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Model Teaser */}
          <div className="lg:col-span-5 relative">
            <div className="relative glass-panel-glow p-2 rounded-2xl border border-cyan-500/30 shadow-2xl">
              <ThreeScene
                assetType="PUMP"
                status="HEALTHY"
                sensors={sampleSensors}
                className="h-[420px] rounded-xl"
              />
              <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-lg bg-[#0b1120] border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Three.js Model</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: What is a Digital Twin? */}
      <section id="what-is-digital-twin" className="py-20 px-6 lg:px-12 bg-[#080e1c] border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Foundational Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              What is an Industrial Digital Twin?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              A Digital Twin is a dynamic, high-fidelity virtual model of a physical machine that continuously receives IoT telemetry, computes operational degradation, diagnoses impending faults, and predicts failure risk before catastrophic outages occur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-xl border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">1. Virtual Representation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bi-directional 3D models mirrored with exact kinematic geometries, sub-assemblies, bearing coordinates, and parametric tolerances.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">2. Real-Time Telemetry</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                High-frequency ingestion of multi-sensor data streams (temperature, vibration, pressure, energy kW, and RPM) via WebSocket pipelines.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">3. Prescriptive Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated multi-factor health scores, failure probability forecasts, and intelligent preventive maintenance work order generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Key Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Enterprise Feature Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
              Engineered for Industrial Reliability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: '3D WebGL Digital Twins',
                desc: 'Real-time 3D rendered machinery in Three.js with rotatable assemblies, rotating shafts, and clickable component diagnostics.',
              },
              {
                icon: Activity,
                title: 'IoT Sensor Simulation',
                desc: 'Physics-based gradual random-walk engine simulating realistic operational drift, thermal expansion, and mechanical vibration.',
              },
              {
                icon: Zap,
                title: 'Simulate Failure Trigger',
                desc: 'Interactive demo injection to simulate progressive bearing wear, thermal runaway, and instant CRITICAL alert escalation.',
              },
              {
                icon: BarChart3,
                title: 'Predictive Health Scoring',
                desc: 'Algorithmic 0–100% health calculation weighting temperature, vibration, pressure, operating hours, and maintenance history.',
              },
              {
                icon: Wrench,
                title: 'Maintenance Kanban Hub',
                desc: 'Complete work order lifecycle tracking with technician dispatch, cost logging, part replacement notes, and overdue alarms.',
              },
              {
                icon: Globe,
                title: 'Multi-Format Reporting',
                desc: 'On-demand generation of Asset Health, Sensor Calibration, and Alert logs with 1-click PDF & CSV export.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-t from-cyan-950/30 to-transparent border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Ready to Explore the Live Digital Twins?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Login with demo credentials as Admin, Manager, Technician, or Viewer to experience the system.
          </p>
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:scale-105"
            >
              <span>Access Control Station</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
