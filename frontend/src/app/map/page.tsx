'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { api, HotspotCluster, RiskZone, Incident } from '@/lib/api';
import CrimeHeatmap from '@/components/CrimeHeatmap';
import { Map, Satellite, Layers, RefreshCw, Search, X } from 'lucide-react';

type MapStyle = 'dark' | 'light' | 'satellite';

const CRIME_TYPES = [
  'BURGLARY', 'VANDALISM', 'FRAUD', 'DOMESTIC VIOLENCE', 'FIREARM OFFENSE',
  'ROBBERY', 'KIDNAPPING', 'IDENTITY THEFT', 'SEXUAL ASSAULT', 'ASSAULT',
  'TRAFFIC VIOLATION', 'PUBLIC INTOXICATION', 'HOMICIDE', 'CYBERCRIME',
  'ILLEGAL POSSESSION', 'ARSON', 'DRUG OFFENSE', 'EXTORTION',
  'COUNTERFEITING', 'VEHICLE - STOLEN', 'SHOPLIFTING',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function MapPage() {
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrimeType, setFilterCrimeType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; full_name: string; lat: number; lng: number; type: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [h, z, inc] = await Promise.all([
          api.getHotspots(),
          api.getRiskZones(),
          api.getIncidents(0, 5000),
        ]);
        if (cancelled) return;
        setHotspots(h.clusters);
        setZones(z);
        setAllIncidents(inc);
        setIncidents(inc);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function fetchSuggestions(q: string) {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    api.geocodeSuggest(q).then(res => {
      setSuggestions(res || []);
      setShowSuggestions(true);
    }).catch(() => {});
  }

  function selectSuggestion(s: { name: string; lat: number; lng: number }) {
    setCityInput(s.name);
    setShowSuggestions(false);
    setFilterCity(s.name);
    setGeoCenter([s.lat, s.lng]);
  }

  function applyCityFilter() {
    const q = cityInput.trim();
    setShowSuggestions(false);
    setFilterCity(q);
    setGeoCenter(null);
    if (!q) return;
    api.geocode(q).then(res => {
      if (res && res.lat && res.lng) setGeoCenter([res.lat, res.lng]);
    }).catch(() => {});
  }

  function handleCityKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { applyCityFilter(); setShowSuggestions(false); }
    if (e.key === 'Escape') setShowSuggestions(false);
  }

  useEffect(() => {
    if (!searchQuery && !filterCrimeType && !filterSeverity && !filterCity) {
      setIncidents(allIncidents);
      return;
    }
    let cancelled = false;
    async function searchIncidents() {
      setLoading(true);
      try {
        const data = await api.getIncidents(0, 5000, searchQuery, filterCrimeType, filterSeverity, filterCity);
        if (!cancelled) setIncidents(data);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    searchIncidents();
    return () => { cancelled = true; };
  }, [searchQuery, filterCrimeType, filterSeverity, filterCity]);

  const filteredIncidents = incidents;

  const [geoCenter, setGeoCenter] = useState<[number, number] | null>(null);

  const mapCenter: [number, number] = useMemo(() => {
    if (geoCenter) return geoCenter;
    if (!filterCity || filteredIncidents.length === 0) return [28.7041, 77.1025];
    const avgLat = filteredIncidents.reduce((s, i) => s + i.latitude, 0) / filteredIncidents.length;
    const avgLng = filteredIncidents.reduce((s, i) => s + i.longitude, 0) / filteredIncidents.length;
    return [avgLat, avgLng];
  }, [filterCity, filteredIncidents, geoCenter]);

  const highZones = zones.filter(z => z.risk_level === 'High').length;
  const totalClusters = hotspots.length;

  const styleOptions: { key: MapStyle; label: string; icon: typeof Map }[] = [
    { key: 'dark', label: 'Dark', icon: Map },
    { key: 'light', label: 'Light', icon: Layers },
    { key: 'satellite', label: 'Satellite', icon: Satellite },
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">Crime Intelligence Map</h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">Interactive heatmap with hotspot analysis</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {styleOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMapStyle(opt.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                mapStyle === opt.key
                  ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-card h-[400px] md:h-[600px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading map data...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3">
            <div className="glass-card p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by city or crime type..."
                    className="pl-9 pr-8 text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative flex-[2] min-w-[180px] flex gap-1">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        if (suggestTimer.current) clearTimeout(suggestTimer.current);
                        suggestTimer.current = setTimeout(() => fetchSuggestions(e.target.value), 300);
                      }}
                      onKeyDown={handleCityKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Type any Indian city/village/state..."
                      className="text-sm pl-3 pr-2 w-full"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onMouseDown={() => selectSuggestion(s)}
                            className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border-b border-[var(--border-color)] last:border-0 transition-colors"
                          >
                            <span className="font-medium">{s.name}</span>
                            <span className="text-[var(--text-muted)] ml-1">({s.type})</span>
                            <span className="block text-[10px] text-[var(--text-muted)] truncate">{s.full_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={applyCityFilter} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/30 hover:bg-[var(--accent-blue)]/20 shrink-0">
                    Search
                  </button>
                  {filterCity && (
                    <button onClick={() => { setCityInput(''); setFilterCity(''); setGeoCenter(null); }} className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] shrink-0">
                      Clear
                    </button>
                  )}
                </div>
                <select value={filterCrimeType} onChange={(e) => setFilterCrimeType(e.target.value)} className="text-sm min-w-[140px]">
                  <option value="">All Crime Types</option>
                  {CRIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="text-sm min-w-[110px]">
                  <option value="">All Severities</option>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-[var(--text-muted)]">
                  Showing {filteredIncidents.length} of {incidents.length} incidents
                </p>
                {(searchQuery || filterCrimeType || filterSeverity || filterCity) && (
                  <button onClick={() => { setSearchQuery(''); setFilterCrimeType(''); setFilterSeverity(''); setCityInput(''); setFilterCity(''); setGeoCenter(null); }} className="text-[10px] text-[var(--accent-blue)] hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            <CrimeHeatmap mapStyle={mapStyle} hotspots={hotspots} zones={zones} incidents={filteredIncidents} center={mapCenter} zoom={filterCity ? 15 : 13} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
            <div className="glass-card p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Map Legend</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-red-500/80 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">High Risk</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Score 60-100</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-orange-500/80 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">Medium Risk</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Score 30-59</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-green-500/80 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">Low Risk</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Score 0-29</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-[var(--border-color)]">
                  <div className="w-4 h-4 rounded-full border-2 border-dashed border-[var(--accent-blue)] shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">AI Cluster</p>
                    <p className="text-[10px] text-[var(--text-muted)]">DBSCAN detected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">High Risk Zones</span>
                  <span className="text-xs font-bold text-red-400">{highZones}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">AI Clusters</span>
                  <span className="text-xs font-bold text-[var(--accent-blue)]">{totalClusters}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Total Locations</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{zones.length}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 md:p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">High Risk Areas</h3>
              <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto">
                {zones.filter(z => z.risk_level === 'High').slice(0, 5).map((z) => (
                  <div key={z.location_name} className="flex items-center justify-between p-2 rounded bg-red-500/5">
                    <span className="text-xs text-[var(--text-primary)] truncate mr-2">{z.location_name}</span>
                    <span className="text-[10px] font-bold text-red-400 shrink-0">{z.risk_score}</span>
                  </div>
                ))}
                {zones.filter(z => z.risk_level === 'High').length === 0 && (
                  <p className="text-xs text-[var(--text-muted)]">No high risk zones detected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
