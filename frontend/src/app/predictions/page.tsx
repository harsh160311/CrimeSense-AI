'use client';

import { useEffect, useState } from 'react';
import { api, PredictionData, RiskZone } from '@/lib/api';
import { getRiskColor, getRiskLabel } from '@/lib/utils';
import StatsCard from '@/components/StatsCard';
import { Brain, Clock, TrendingUp, AlertTriangle, RefreshCw, MapPin, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, z] = await Promise.all([
          api.getPredictions(),
          api.getRiskZones(),
        ]);
        setPredictions(p);
        setZones(z);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-[var(--accent-blue)] animate-spin" />
      </div>
    );
  }

  const radarData = predictions?.predicted_crime_probabilities?.map(c => ({
    crime: c.crime.substring(0, 10),
    probability: +(c.probability * 100).toFixed(1),
    count: c.current_count,
  })) || [];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">AI Predictions</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Forecasted crime patterns and risk assessment</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] self-start">
          <Brain className="w-4 h-4 text-[var(--accent-purple)]" />
          <span className="text-xs text-[var(--text-secondary)]">Next Period Forecast</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Predicted Incidents"
          value={predictions?.predicted_total_next_month || 0}
          subtitle="Next 30 days"
          icon={TrendingUp}
          color="blue"
          trend={{ value: Math.abs(predictions?.growth_rate || 0), direction: (predictions?.growth_rate || 0) > 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Peak Crime Hour"
          value={`${predictions?.peak_hour || 0}:00`}
          subtitle="Highest activity"
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Peak Day"
          value={predictions?.peak_day || 'N/A'}
          subtitle="Most incidents"
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Overall Trend"
          value={predictions?.overall_risk_trend || 'stable'}
          icon={AlertTriangle}
          color={(predictions?.overall_risk_trend || 'stable') === 'rising' ? 'red' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Predicted High Risk Zones</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Locations with elevated risk forecast</p>
            <div className="space-y-2">
              {predictions?.high_risk_zones?.map((zone, i) => (
                <div
                  key={zone.location_name}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] transition-colors animate-slide-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${getRiskColor(zone.predicted_risk_score)}15` }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: getRiskColor(zone.predicted_risk_score) }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{zone.location_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--text-muted)]">Current: {zone.current_risk_score}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">→</span>
                        <span className="text-[10px]" style={{ color: getRiskColor(zone.predicted_risk_score) }}>Predicted: {zone.predicted_risk_score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs font-bold"
                      style={{ color: getRiskColor(zone.predicted_risk_score) }}
                    >
                      {getRiskLabel(zone.predicted_risk_score)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {(zone.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">High Risk Time Windows</h3>
            <div className="space-y-2">
              {predictions?.high_risk_time_windows?.map((tw) => (
                <div key={tw.window} className="flex items-center justify-between p-2 rounded bg-[var(--bg-primary)]">
                  <span className="text-xs text-[var(--text-secondary)]">{tw.window}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">{tw.incident_count} incidents</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: `${getRiskColor(tw.risk_score)}15`,
                        color: getRiskColor(tw.risk_score),
                      }}
                    >
                      {tw.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Crime Probability</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData.slice(0, 6)}>
                  <PolarGrid stroke="rgba(148,163,184,0.15)" />
                  <PolarAngleAxis dataKey="crime" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                  <Radar name="Probability" dataKey="probability" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17,24,39,0.95)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Predicted Crime Probabilities</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Likelihood of each crime type in next period</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {predictions?.predicted_crime_probabilities?.map((crime) => (
            <div key={crime.crime} className="p-3 rounded-lg bg-[var(--bg-primary)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">{crime.crime}</span>
                <span className="text-xs font-bold text-[var(--accent-purple)]">
                  {(crime.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--gradient-primary)]"
                  style={{ width: `${crime.probability * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{crime.current_count} current incidents</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
