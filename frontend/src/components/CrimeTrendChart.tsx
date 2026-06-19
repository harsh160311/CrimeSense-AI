'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: { month: string; count: number }[];
  breakdown?: { crime: string; data: number[] }[];
  months?: string[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#84cc16', '#14b8a6'];

export default function CrimeTrendChart({ data, breakdown, months }: TrendChartProps) {
  const [viewMode, setViewMode] = useState<'total' | 'breakdown'>('total');

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Crime Trends</h3>
          <p className="text-xs text-[var(--text-muted)]">Monthly incident analysis</p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-primary)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              viewMode === 'total' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setViewMode('breakdown')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              viewMode === 'breakdown' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            By Crime
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'total' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={(months || []).map((m, i) => {
                const obj: Record<string, string | number> = { month: m };
                (breakdown || []).forEach((b) => { obj[b.crime] = b.data[i] || 0; });
                return obj;
              })}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(148,163,184,0.2)' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17,24,39,0.95)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
              {(breakdown || []).slice(0, 6).map((b, i) => (
                <Line
                  key={b.crime}
                  type="monotone"
                  dataKey={b.crime}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
