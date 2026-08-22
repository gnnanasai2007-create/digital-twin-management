import React from 'react';
import { getHealthScoreColor } from '../utils/statusColors';

export default function CircularGauge({ score = 100, size = 160, strokeWidth = 12, label = 'Health Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const colorInfo = getHealthScoreColor(normalizedScore);

  let ratingLabel = 'HEALTHY';
  if (normalizedScore < 40) ratingLabel = 'CRITICAL';
  else if (normalizedScore < 60) ratingLabel = 'HIGH RISK';
  else if (normalizedScore < 80) ratingLabel = 'WARNING';

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorInfo.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorInfo.stroke}66)`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-extrabold ${colorInfo.text}`} style={{ fontSize: size * 0.22 }}>
            {normalizedScore.toFixed(0)}%
          </span>
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 mt-0.5">
            {ratingLabel}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 font-medium mt-2">{label}</span>}
    </div>
  );
}
