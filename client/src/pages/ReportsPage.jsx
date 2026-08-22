import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { formatDateTime } from '../utils/formatters';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('assets'); // 'assets' | 'maintenance' | 'sensors' | 'alerts'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${type}`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData?.data?.length) return;
    exportToCSV(`dtam_${reportType}_report`, reportData.data);
  };

  const handleExportPDF = () => {
    if (!reportData?.data?.length) return;
    const headers = Object.keys(reportData.data[0]);
    const rows = reportData.data.map((row) => headers.map((h) => String(row[h] ?? '')));
    exportToPDF(reportData.title, headers, rows, `dtam_${reportType}_report`);
  };

  const reportOptions = [
    { key: 'assets', label: 'Asset Health & Status Report', desc: 'Overall fleet health, risk levels & runtime hours' },
    { key: 'maintenance', label: 'Maintenance Work Orders Report', desc: 'Detailed log of schedules, costs, parts & technician assignments' },
    { key: 'sensors', label: 'IoT Sensor Calibration Report', desc: 'Telemetry bounds, sample rates & calibration status' },
    { key: 'alerts', label: 'Historical Anomaly & Alert Log', desc: 'Chronological alarms, severity levels & resolution logs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-cyan-400" />
            ENGINEERING REPORTS & EXPORTS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Generate ISO-13374 compliance reports, work order summaries & telemetry data exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={!reportData?.data?.length}
            className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={!reportData?.data?.length}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setReportType(opt.key)}
            className={`p-4 rounded-xl text-left border transition-all ${
              reportType === opt.key
                ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                : 'glass-panel border-slate-800 hover:border-slate-700'
            }`}
          >
            <h4
              className={`text-xs font-bold font-mono ${
                reportType === opt.key ? 'text-cyan-300' : 'text-slate-200'
              }`}
            >
              {opt.label}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Report Preview Panel */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100">
              {reportData?.title || 'Report Table Preview'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Generated: {reportData?.generatedAt ? formatDateTime(reportData.generatedAt) : 'Live'}
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
            {reportData?.data?.length || 0} Records Captured
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            Compiling telemetry data...
          </div>
        ) : !reportData?.data?.length ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No records found for this report type.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  {Object.keys(reportData.data[0]).map((key) => (
                    <th key={key} className="py-3 px-4 uppercase tracking-wider text-[10px]">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportData.data.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 text-slate-200">
                        {String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
