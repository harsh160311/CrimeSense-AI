'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'cyan';
  trend?: { value: number; direction: 'up' | 'down' | 'stable' };
}

const colorMap = {
  blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)', glow: 'rgba(59, 130, 246, 0.15)' },
  red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)', glow: 'rgba(239, 68, 68, 0.15)' },
  green: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)', glow: 'rgba(34, 197, 94, 0.15)' },
  orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: 'rgba(249, 115, 22, 0.2)', glow: 'rgba(249, 115, 22, 0.15)' },
  purple: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)', glow: 'rgba(139, 92, 246, 0.15)' },
  cyan: { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.2)', glow: 'rgba(6, 182, 212, 0.15)' },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className="glass-card p-5 animate-fade-in"
      style={{ '--card-glow': c.glow } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: c.text }} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              trend.direction === 'up' ? 'text-red-400 bg-red-500/10' :
              trend.direction === 'down' ? 'text-green-400 bg-green-500/10' :
              'text-[var(--text-muted)] bg-white/5'
            }`}
          >
            <span>{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-0.5">{value}</p>
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}
