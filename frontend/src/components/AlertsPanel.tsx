'use client';

import { formatDate } from '@/lib/utils';
import { AlertTriangle, Zap, Eye, Clock, Info } from 'lucide-react';

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  timestamp: string;
  read: boolean;
}

interface AlertsPanelProps {
  data: Alert[];
}

const alertIcons: Record<string, React.ReactNode> = {
  spike: <Zap className="w-4 h-4" />,
  prediction: <Eye className="w-4 h-4" />,
  time_risk: <Clock className="w-4 h-4" />,
  pattern: <AlertTriangle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  Medium: { bg: 'rgba(249,115,22,0.1)', text: '#f97316', border: 'rgba(249,115,22,0.2)' },
  Low: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: 'rgba(34,197,94,0.2)' },
};

export default function AlertsPanel({ data }: AlertsPanelProps) {
  const recent = data.slice(0, 5);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Live Alerts</h3>
          <p className="text-xs text-[var(--text-muted)]">Recent notifications</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot high animate-pulse-glow" />
          <span className="text-xs text-[var(--text-muted)]">{data.length} active</span>
        </div>
      </div>

      <div className="space-y-2">
        {recent.map((alert, i) => {
          const sc = severityColors[alert.severity] || severityColors.Low;
          return (
            <div
              key={alert.id}
              className="p-3 rounded-lg border animate-slide-in"
              style={{
                background: sc.bg,
                borderColor: sc.border,
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5" style={{ color: sc.text }}>
                  {alertIcons[alert.type] || <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{alert.title}</p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatDate(alert.timestamp)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
