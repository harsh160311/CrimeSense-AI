'use client';

import { useEffect, useState } from 'react';
import { api, waitForBackend, SummaryStats, TrendData, CategoryData, RiskZone, Alert, HotspotCluster, Incident } from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import CrimeTrendChart from '@/components/CrimeTrendChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopLocations from '@/components/TopLocations';
import AlertsPanel from '@/components/AlertsPanel';
import CrimeHeatmap from '@/components/CrimeHeatmap';
import {
  Shield, TrendingUp, AlertTriangle, MapPin, Activity,
} from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadOne<T>(
    fetcher: () => Promise<T>,
    setter: (v: T) => void,
    fallback: T,
  ) {
    try {
      const data = await fetcher();
      setter(data ?? fallback);
    } catch {
      setter(fallback);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const connected = await waitForBackend();
      if (cancelled) return;
      if (!connected) {
        setError(true);
        setLoading(false);
        return;
      }
      let settled = 0;
      let hasData = false;
      function done() {
        settled++;
        if (settled === 7) {
          if (!hasData) setError(true);
          setLoading(false);
        }
      }
      api.getSummary().then((d) => { if (!cancelled) { setSummary(d); hasData = true; } }).catch(() => {}).then(done);
      api.getTrends().then((d) => { if (!cancelled) setTrends(d); }).catch(() => {}).then(done);
      api.getCategories().then((d) => { if (!cancelled) setCategories(d); }).catch(() => {}).then(done);
      api.getRiskZones().then((d) => { if (!cancelled) setRiskZones(d); }).catch(() => {}).then(done);
      api.getHotspots().then((h) => { if (!cancelled) setHotspots(h.clusters); }).catch(() => {}).then(done);
      api.getIncidents().then((d) => { if (!cancelled) setIncidents(d); }).catch(() => {}).then(done);
      api.getAlerts().then((d) => { if (!cancelled) setAlerts(d); }).catch(() => {}).then(done);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-screen">
        <div className="text-center glass-card p-6 md:p-8">
          <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-2">Backend Connection Error</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Unable to connect to CrimeSense AI backend.</p>
          <p className="text-xs text-[var(--text-muted)]">Make sure the backend server is running on port 8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Command Center</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Real-time crime intelligence overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
            <span className="status-dot low animate-pulse-glow" />
            <span className="text-xs text-[var(--text-secondary)]">Live</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] hidden sm:block">
            {loading ? 'Loading...' : `${summary?.total_incidents || 0} total incidents`}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 w-20 bg-[var(--bg-card-hover)] rounded mb-3" />
              <div className="h-8 w-16 bg-[var(--bg-card-hover)] rounded mb-2" />
              <div className="h-3 w-32 bg-[var(--bg-card-hover)] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Incidents"
            value={summary?.total_incidents || 0}
            icon={Shield}
            color="blue"
            trend={{ value: Math.abs(summary?.monthly_change || 0), direction: summary?.trend_direction === 'rising' ? 'up' : summary?.trend_direction === 'falling' ? 'down' : 'stable' }}
          />
          <StatsCard
            title="Most Common Crime"
            value={summary?.most_common_crime || 'N/A'}
            subtitle={`${summary?.high_count || 0} high severity cases`}
            icon={TrendingUp}
            color="red"
          />
          <StatsCard
            title="Risk Score"
            value={summary?.avg_severity?.toFixed(1) || '0'}
            subtitle={`${summary?.critical_count || 0} critical incidents`}
            icon={Activity}
            color="orange"
          />
          <StatsCard
            title="Hot Zones"
            value={summary?.highest_risk_location || 'N/A'}
            subtitle="Highest risk area"
            icon={MapPin}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          {trends && <CrimeTrendChart data={trends.monthly_totals} breakdown={trends.crime_breakdown} months={trends.months} />}
        </div>
        <div>
          {categories.length > 0 && <CategoryPieChart data={categories} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <CrimeHeatmap hotspots={hotspots} zones={riskZones} incidents={incidents} />
        </div>
        <div>
          {riskZones.length > 0 && <TopLocations data={riskZones} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {alerts.length > 0 && <AlertsPanel data={alerts} />}
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Quick Actions</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Navigate to sections</p>
          <div className="space-y-2">
            {[
              { label: 'View Crime Map', href: '/map', desc: 'Interactive heatmap & zones' },
              { label: 'Deep Analytics', href: '/analytics', desc: 'Trends and statistics' },
              { label: 'AI Predictions', href: '/predictions', desc: 'Risk forecasts' },
              { label: 'Upload Data', href: '/upload', desc: 'Import crime records' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
