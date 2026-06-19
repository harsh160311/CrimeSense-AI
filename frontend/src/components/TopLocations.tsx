'use client';

import { getRiskColor, getRiskLabel } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface TopLocationsProps {
  data: {
    location_name: string;
    incident_count: number;
    risk_score: number;
    risk_level: string;
    dominant_crime: string;
  }[];
}

export default function TopLocations({ data }: TopLocationsProps) {
  const top = data.slice(0, 6);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Top Risk Locations</h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">Highest risk zones</p>

      <div className="space-y-2">
        {top.map((loc, i) => (
          <div
            key={loc.location_name}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] transition-colors animate-slide-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${getRiskColor(loc.risk_score)}15` }}
            >
              <MapPin className="w-4 h-4" style={{ color: getRiskColor(loc.risk_score) }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{loc.location_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[var(--text-muted)]">{loc.incident_count} incidents</span>
                <span className="text-[10px] text-[var(--text-muted)]">·</span>
                <span className="text-[10px] text-[var(--text-muted)]">{loc.dominant_crime}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className="text-xs font-bold"
                style={{ color: getRiskColor(loc.risk_score) }}
              >
                {loc.risk_score}
              </div>
              <div
                className="text-[10px] px-1.5 py-0.5 rounded mt-0.5 text-center"
                style={{
                  background: `${getRiskColor(loc.risk_score)}15`,
                  color: getRiskColor(loc.risk_score),
                }}
              >
                {getRiskLabel(loc.risk_score)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
