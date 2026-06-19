'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HotspotCluster, RiskZone, Incident } from '@/lib/api';

const TILE_STYLES: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

function getRiskColor(score: number): string {
  if (score >= 60) return '#ef4444';
  if (score >= 30) return '#f97316';
  return '#22c55e';
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

function getSeverityColor(severity: string): string {
  return SEVERITY_COLORS[severity] || '#64748b';
}

function FlyToController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center[0], center[1], zoom]);
  return null;
}

interface LazyMapProps {
  mapStyle?: string;
  hotspots?: HotspotCluster[];
  zones?: RiskZone[];
  incidents?: Incident[];
  center?: [number, number];
  zoom?: number;
}

export default function LazyMap({ mapStyle = 'dark', hotspots = [], zones = [], incidents = [], center = [28.7041, 77.1025] as [number, number], zoom = 13 }: LazyMapProps) {
  const tileUrl = TILE_STYLES[mapStyle] || TILE_STYLES.dark;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <FlyToController center={center} zoom={zoom} />
      <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
      {incidents.slice(0, 500).map((inc) => (
        <CircleMarker
          key={`inc-${inc.id}`}
          center={[inc.latitude, inc.longitude]}
          radius={5}
          pathOptions={{ color: getSeverityColor(inc.severity), fillColor: getSeverityColor(inc.severity), fillOpacity: 0.7, weight: 1.5 }}
        >
          <Popup>
            <div style={{ fontSize: '11px', minWidth: '140px', maxWidth: '200px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '3px', color: '#f1f5f9' }}>{inc.crime_type}</p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>{inc.location_name}</p>
              <p style={{ color: getSeverityColor(inc.severity), margin: '2px 0', fontWeight: 600 }}>{inc.severity}</p>
              <p style={{ color: '#64748b', margin: '2px 0' }}>{inc.date_time?.split('T')[0]}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {zones.map((zone) => (
        <Circle
          key={`zone-${zone.location_name}`}
          center={[zone.latitude, zone.longitude]}
          radius={Math.max(150, zone.incident_count * 8)}
          pathOptions={{ color: getRiskColor(zone.risk_score), fillColor: getRiskColor(zone.risk_score), fillOpacity: 0.25, weight: 2 }}
        >
          <Popup>
            <div style={{ fontSize: '12px', minWidth: '160px', maxWidth: '220px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f1f5f9' }}>{zone.location_name}</p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Risk Score: <span style={{ color: getRiskColor(zone.risk_score), fontWeight: 'bold' }}>{zone.risk_score}/100</span></p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Incidents: {zone.incident_count}</p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Dominant Crime: {zone.dominant_crime}</p>
            </div>
          </Popup>
        </Circle>
      ))}
      {hotspots.map((cluster) => (
        <Circle
          key={`cluster-${cluster.cluster_id}`}
          center={[cluster.centroid_lat, cluster.centroid_lng]}
          radius={Math.max(200, cluster.radius * 10000)}
          pathOptions={{ color: getRiskColor(cluster.risk_score), fillColor: getRiskColor(cluster.risk_score), fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }}
        >
          <Popup>
            <div style={{ fontSize: '12px', minWidth: '160px', maxWidth: '220px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f1f5f9' }}>Hotspot Cluster #{cluster.cluster_id + 1}</p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Risk Score: <span style={{ color: getRiskColor(cluster.risk_score), fontWeight: 'bold' }}>{cluster.risk_score}/100</span></p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Incidents: {cluster.point_count}</p>
              <p style={{ color: '#94a3b8', margin: '2px 0' }}>Dominant Crime: {cluster.dominant_crime}</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
