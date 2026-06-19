'use client';

import { useEffect, useState } from 'react';
import { api, SummaryStats, TrendData, CategoryData, RiskZone } from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import CrimeTrendChart from '@/components/CrimeTrendChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopLocations from '@/components/TopLocations';
import {
  BarChart3, Shield, TrendingUp, Activity, AlertTriangle, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sum, tr, cat, z] = await Promise.all([
          api.getSummary(),
          api.getTrends(),
          api.getCategories(),
          api.getRiskZones(),
        ]);
        setSummary(sum);
        setTrends(tr);
        setCategories(cat);
        setZones(z);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const severityData = [
    { name: 'Critical', value: summary?.critical_count || 0, fill: '#ef4444' },
    { name: 'High', value: summary?.high_count || 0, fill: '#f97316' },
    { name: 'Medium', value: summary?.medium_count || 0, fill: '#eab308' },
    { name: 'Low', value: summary?.low_count || 0, fill: '#22c55e' },
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Detailed crime data analysis & trends</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] self-start">
          <BarChart3 className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="text-xs text-[var(--text-secondary)]">12 Month Analysis</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 text-[var(--accent-blue)] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Incidents" value={summary?.total_incidents || 0} icon={Shield} color="blue" />
            <StatsCard title="Most Common" value={summary?.most_common_crime || 'N/A'} icon={TrendingUp} color="red" />
            <StatsCard title="Avg Severity" value={summary?.avg_severity?.toFixed(1) || '0'} icon={Activity} color="orange" />
            <StatsCard title="Monthly Change" value={`${Math.abs(summary?.monthly_change || 0)}%`} icon={BarChart3} color={summary?.monthly_change && summary.monthly_change > 0 ? 'red' : 'green'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Severity Distribution</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Incidents by severity level</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityData} margin={{ top: 25, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(148,163,184,0.2)' }} interval={0} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(148,163,184,0.2)' }} width={45} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(17,24,39,0.95)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60} label={{ position: 'top', fill: '#f1f5f9', fontSize: 11, fontWeight: 600, offset: 8 }}>
                      {severityData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <CategoryPieChart data={categories} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {trends && <CrimeTrendChart data={trends.monthly_totals} breakdown={trends.crime_breakdown} months={trends.months} />}
            <TopLocations data={zones} />
          </div>
        </>
      )}
    </div>
  );
}
