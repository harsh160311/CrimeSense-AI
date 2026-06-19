'use client';

import { useEffect, useState } from 'react';
import { api, CrimeStat, CrimeStatSummary, CrimeStatCategory } from '@/lib/api';
import {
  BarChart3, Shield, BookOpen, RefreshCw, Search, TrendingUp, Table,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const LAW_COLORS: Record<string, string> = {
  'A - IPC Crime': '#3b82f6',
  'B - SPECIAL & LOCAL LAWS': '#8b5cf6',
  'C. CRIMES AGAINST WOMEN': '#ec4899',
};

export default function CrimeStatsPage() {
  const [stats, setStats] = useState<CrimeStat[]>([]);
  const [categories, setCategories] = useState<CrimeStatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, c] = await Promise.all([
          api.getCrimeStats(),
          api.getCrimeStatsCategories(),
        ]);
        setStats(s);
        setCategories(c);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const filtered = stats.filter(s => {
    if (search && !s.law_category.toLowerCase().includes(search.toLowerCase()) && !s.crime_section.toLowerCase().includes(search.toLowerCase()) && !s.reason.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && s.law_category !== filterCategory) return false;
    return true;
  });

  const totalCases = stats.reduce((sum, s) => sum + s.cases_jan_aug_2025, 0);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-[var(--accent-blue)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Crime Statistics</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Indian crime data (Jan-Aug 2025) from NCRB records</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] self-start">
          <BookOpen className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="text-xs text-[var(--text-secondary)]">{stats.length} records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categories.map(cat => (
          <div key={cat.name} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${LAW_COLORS[cat.name] || '#3b82f6'}20` }}>
              <BarChart3 className="w-5 h-5" style={{ color: LAW_COLORS[cat.name] || '#3b82f6' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</p>
              <p className="text-lg font-bold" style={{ color: LAW_COLORS[cat.name] || '#3b82f6' }}>{cat.total.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{cat.percentage}% of total cases</p>
            </div>
          </div>
        ))}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[var(--accent-blue)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Total Cases</p>
            <p className="text-lg font-bold text-[var(--accent-blue)]">{totalCases.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Jan to Aug 2025</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Cases by Law Category</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Distribution across IPC, Special Laws, and Crimes Against Women</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, ...props }: any) => {
                  const entry = categories.find(c => c.name === name);
                  const label = name ? name.split('-')[0].trim() : '';
                  return `${label} (${entry?.percentage || 0}%)`;
                }}>
                  {categories.map((entry, i) => (
                    <Cell key={i} fill={LAW_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Monthly Trend (Aug 2024 vs 2025)</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Comparing August cases year-over-year</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Aug 2024', value: stats.reduce((s, r) => s + r.cases_aug_2024, 0) },
                { name: 'Jul 2025', value: stats.reduce((s, r) => s + r.cases_jul_2025, 0) },
                { name: 'Aug 2025', value: stats.reduce((s, r) => s + r.cases_aug_2025, 0) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {['#64748b', '#3b82f6', '#3b82f6'].map((color, i) => <Cell key={i} fill={color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">All Records</h3>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..." className="pl-8 text-xs py-1.5"
              />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="text-xs py-1.5 sm:w-44">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Law Category</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Crime + Legal Section</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Reason</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Jan-Aug 2025</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Aug 2024</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Jul 2025</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium">Aug 2025</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-2 px-2 text-[var(--text-primary)]">{r.law_category}</td>
                  <td className="py-2 px-2 text-[var(--text-secondary)]">{r.crime_section}</td>
                  <td className="py-2 px-2 text-[var(--text-secondary)]">{r.reason}</td>
                  <td className="py-2 px-2 text-right font-medium text-[var(--text-primary)]">{r.cases_jan_aug_2025.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-[var(--text-muted)]">{r.cases_aug_2024.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-[var(--text-muted)]">{r.cases_jul_2025.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-[var(--accent-blue)] font-medium">{r.cases_aug_2025.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">No records match your search</p>
          )}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">Showing {filtered.length} of {stats.length} records</p>
      </div>
    </div>
  );
}
