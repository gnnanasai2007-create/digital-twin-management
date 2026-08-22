import React from 'react';
import {
  Boxes,
  Activity,
  Radio,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Wrench,
  LayoutDashboard,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function ArchitecturePage() {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Physical Assets Layer',
      subtitle: 'Field Industrial Machinery',
      icon: Boxes,
      color: 'from-blue-600 to-cyan-500',
      textColor: 'text-cyan-400',
      desc: 'Heavy industrial physical equipment including Pumps, CNC Mills, Electric Motors, Compressors, and Boilers operating on the plant floor.',
      tags: ['ISO 10816', 'Dynamic Loads', 'Duty Cycles'],
    },
    {
      step: '02',
      title: 'IoT Sensor Array',
      subtitle: 'Field Telemetry Transducers',
      icon: Radio,
      color: 'from-cyan-500 to-teal-500',
      textColor: 'text-teal-400',
      desc: 'Calibrated sensors measuring temperature (°C), vibration velocity (mm/s), hydraulic pressure (bar), active energy (kW), and rotational speed (RPM).',
      tags: ['3000ms Frequency', 'Random-Walk Drift', 'Noise Models'],
    },
    {
      step: '03',
      title: 'Data Ingestion & Sockets',
      subtitle: 'Real-Time Telemetry Broker',
      icon: Activity,
      color: 'from-teal-500 to-emerald-500',
      textColor: 'text-emerald-400',
      desc: 'High-throughput Socket.IO & Express REST ingestion layer validating packets, tracking deltas, and synchronizing state across nodes.',
      tags: ['WebSocket Streams', 'Zod Schemas', 'SQLite WAL'],
    },
    {
      step: '04',
      title: 'Digital Twin Virtual Engine',
      subtitle: '3D Kinematic State Sync',
      icon: Cpu,
      color: 'from-emerald-500 to-amber-500',
      textColor: 'text-amber-400',
      desc: 'Virtual representation computing sub-assembly degradation, parametric health scores (0-100%), and synchronizing Three.js 3D assemblies.',
      tags: ['Three.js WebGL', 'Multi-Factor Score', 'Component Mesh'],
    },
    {
      step: '05',
      title: 'Predictive & Anomaly AI',
      subtitle: 'Health & Risk Algorithms',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-orange-400',
      desc: 'Algorithmic failure risk calculator evaluating temperature gradients, harmonic vibration spikes, and estimated MTBF maintenance windows.',
      tags: ['Rate-of-Change Detection', 'Failure Probability', 'Trend Drift'],
    },
    {
      step: '06',
      title: 'Intelligent Alert Engine',
      subtitle: 'Threshold & Severity Dispatch',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-red-400',
      desc: 'Instant classification into INFO, WARNING, and CRITICAL alarms with automated de-duplication, sound chimes, and operator acknowledgment.',
      tags: ['Auto-Escalation', 'Audit Logging', 'In-App Toast'],
    },
    {
      step: '07',
      title: 'Maintenance Work Orders',
      subtitle: 'Prescriptive Action Hub',
      icon: Wrench,
      color: 'from-red-500 to-purple-500',
      textColor: 'text-purple-400',
      desc: 'Automated generation of scheduled preventive work orders, technician assignment, spare component replacement logs, and cost accounting.',
      tags: ['Kanban Board', 'Auto-Overdue', 'Parts Inventory'],
    },
    {
      step: '08',
      title: 'Command Dashboard & Reports',
      subtitle: 'Executive UI & Operator Cockpit',
      icon: LayoutDashboard,
      color: 'from-purple-500 to-cyan-500',
      textColor: 'text-cyan-400',
      desc: 'Rich dark industrial cockpit providing live 3D interaction, telemetry charts, PDF/CSV report generation, and full RBAC security.',
      tags: ['React 18 + Vite', 'Tailwind Dark UI', 'PDF Exports'],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
          System Architecture Pipeline
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono">
          END-TO-END DIGITAL TWIN LIFECYCLE
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          How physical asset telemetry flows continuously through simulation, kinematic synchronization, anomaly detection, predictive risk estimation, and maintenance work orders.
        </p>
      </div>

      {/* Pipeline Sequence Grid */}
      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelineSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all relative overflow-hidden group space-y-4"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-slate-950 font-bold`}
                    >
                      <Icon className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {item.subtitle}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 font-mono">{item.title}</h3>
                    </div>
                  </div>

                  <span className="text-2xl font-mono font-extrabold text-slate-700 group-hover:text-cyan-400/40 transition-colors">
                    {item.step}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
