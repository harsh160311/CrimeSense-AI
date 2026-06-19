'use client';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { HotspotCluster, RiskZone, Incident } from '@/lib/api';

const LazyMap = dynamic(() => import('./LazyMap'), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface CrimeHeatmapProps {
  mapStyle?: string;
  hotspots?: HotspotCluster[];
  zones?: RiskZone[];
  incidents?: Incident[];
  center?: [number, number];
  zoom?: number;
}

export default function CrimeHeatmap(props: CrimeHeatmapProps) {
  return (
    <div className="glass-card overflow-hidden" style={{ height: '500px', minHeight: '300px' }}>
      <LazyMap {...props} />
    </div>
  );
}
