'use client';

import { useEffect, useState } from 'react';
import { api, Alert } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Bell, AlertTriangle, Zap, Eye, Clock, Info, CheckCircle, RefreshCw,
} from 'lucide-react';

const alertIcons: Record<string, React.ReactNode> = {
  spike: <Zap className="w-5 h-5" />,
  prediction: <Eye className="w-5 h-5" />,
  time_risk: <Clock className="w-5 h-5" />,
  pattern: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const severityConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  High: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'High' },
  Medium: { bg: 'rgba(249,115,22,0.1)', text: '#f97316', border: 'rgba(249,115,22,0.2)', label: 'Medium' },
  Low: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'Low' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity.toLowerCase() === filter);
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const mediumCount = alerts.filter(a => a.severity === 'Medium').length;
  const lowCount = alerts.filter(a => a.severity === 'Low').length;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Alerts Center</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">System generated intelligence alerts</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] self-start">
          <Bell className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="text-xs text-[var(--text-secondary)]">{alerts.length} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-red-400">{highCount}</p>
            <p className="text-xs text-[var(--text-muted)]">High Priority</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-orange-400">{mediumCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Medium Priority</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-400">{lowCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Low Priority</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
              filter === f
                ? 'bg-[var(--accent-blue)] text-white'
                : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 text-[var(--accent-blue)] animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => {
            const sc = severityConfig[alert.severity] || severityConfig.Low;
            return (
              <div
                key={alert.id}
                className="glass-card p-5 animate-slide-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: sc.bg }}
                  >
                    <div style={{ color: sc.text }}>{alertIcons[alert.type] || <Info className="w-5 h-5" />}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{alert.title}</h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] capitalize px-2 py-0.5 rounded-full bg-[var(--bg-primary)]">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{alert.message}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">{formatDate(alert.timestamp)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-[var(--text-primary)]">No alerts found</p>
              <p className="text-xs text-[var(--text-muted)]">All systems normal</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
