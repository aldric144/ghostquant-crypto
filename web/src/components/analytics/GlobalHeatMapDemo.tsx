'use client';

import React, { useState, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';

interface RegionRisk {
  region: string;
  risk_level: number;
  entities: number;
  anomalies_24h: number;
}

interface HeatMapPoint {
  id: string;
  lat: number;
  lon: number;
  intensity: number;
  region: string;
  label: string;
}

interface MarketData {
  regions: RegionRisk[];
  heatmap_points: HeatMapPoint[];
  demo_mode: boolean;
}

interface GlobalHeatMapDemoProps {
  refreshToken: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function GlobalHeatMapDemo({ refreshToken }: GlobalHeatMapDemoProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HeatMapPoint | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_BASE_URL}/demo/analytics/market`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { cancelled = true; };
  }, [refreshToken]);

  const latLonToXY = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.7) return 'bg-red-500/60';
    if (intensity >= 0.4) return 'bg-yellow-500/60';
    return 'bg-cyan-500/60';
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-900/50 border border-red-500/30 rounded-xl">
        <p className="text-red-400 text-sm">Failed to load map data</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Global Threat Map</h3>
        </div>
        <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-1 rounded">DEMO</span>
      </div>
      
      <div className="relative h-64 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {[20, 40, 60, 80].map(y => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#22d3ee" strokeWidth="0.2" />
            ))}
            {[20, 40, 60, 80].map(x => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#22d3ee" strokeWidth="0.2" />
            ))}
          </svg>
        </div>
        
        {data.heatmap_points?.map((point) => {
          const { x, y } = latLonToXY(point.lat, point.lon);
          const size = 8 + point.intensity * 16;
          return (
            <div
              key={point.id}
              className={`absolute rounded-full ${getIntensityColor(point.intensity)} animate-pulse cursor-pointer transition-transform hover:scale-150`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${size}px ${point.intensity >= 0.7 ? 'rgba(239, 68, 68, 0.5)' : point.intensity >= 0.4 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 211, 238, 0.5)'}`
              }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}
        
        {hoveredPoint && (
          <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1 text-cyan-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span>{hoveredPoint.region}</span>
            </div>
            <p className="text-gray-300">{hoveredPoint.label}</p>
            <p className="text-gray-500">Intensity: {(hoveredPoint.intensity * 100).toFixed(0)}%</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4">
        {data.regions?.map((region) => (
          <div key={region.region} className="p-2 bg-slate-800/50 rounded text-center">
            <p className="text-xs text-gray-400 truncate">{region.region}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${getRiskColor(region.risk_level)}`} />
              <span className="text-sm font-semibold text-white">{region.risk_level}</span>
            </div>
            <p className="text-xs text-gray-500">{region.anomalies_24h} alerts</p>
          </div>
        ))}
      </div>
    </div>
  );
}
