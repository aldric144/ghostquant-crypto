"use client";

import { useRef, useEffect } from "react";
import { MapData } from "./index";

interface MapPanelProps {
  data: MapData | null;
  isLoading: boolean;
  compact?: boolean;
  onViewMore?: () => void;
}

export default function MapPanel({ data, isLoading, compact, onViewMore }: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(34, 211, 238, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw hot zones
    data.hotZones.forEach((zone) => {
      const x = ((zone.lng + 180) / 360) * width;
      const y = ((90 - zone.lat) / 180) * height;
      const radius = (zone.intensity / 100) * 20 + 5;

      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, `rgba(239, 68, 68, ${zone.intensity / 100})`);
      gradient.addColorStop(0.5, `rgba(239, 68, 68, ${zone.intensity / 200})`);
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)");

      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + zone.intensity / 200})`;
      ctx.fill();
    });

    // Draw clusters
    data.clusters.forEach((cluster) => {
      const x = ((cluster.lng + 180) / 360) * width;
      const y = ((90 - cluster.lat) / 180) * height;
      const size = cluster.size / 5 + 3;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = cluster.risk > 70 ? "rgba(239, 68, 68, 0.6)" : cluster.risk > 40 ? "rgba(234, 179, 8, 0.6)" : "rgba(34, 197, 94, 0.6)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw events
    data.events.forEach((event) => {
      const x = ((event.lng + 180) / 360) * width;
      const y = ((90 - event.lat) / 180) * height;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = event.type === "whale" ? "rgba(59, 130, 246, 0.8)" : event.type === "manipulation" ? "rgba(239, 68, 68, 0.8)" : "rgba(168, 85, 247, 0.8)";
      ctx.fill();
    });
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-slate-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  const highRiskZones = data.hotZones.filter((z) => z.intensity > 70).length;
  const totalClusters = data.clusters.length;
  const recentEvents = data.events.length;

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6 ${compact ? "" : "min-h-[500px]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Geographic Analytics</h3>
        </div>
        {compact && onViewMore && (
          <button onClick={onViewMore} className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            View More →
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Hot Zones</p>
          <p className="text-lg font-bold text-red-400">{highRiskZones}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Clusters</p>
          <p className="text-lg font-bold text-yellow-400">{totalClusters}</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Events</p>
          <p className="text-lg font-bold text-blue-400">{recentEvents}</p>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-600">
        <canvas ref={canvasRef} className={`w-full ${compact ? "h-32" : "h-64"}`} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
          <span className="text-xs text-gray-400">Hot Zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500/60"></div>
          <span className="text-xs text-gray-400">Whale</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500/60"></div>
          <span className="text-xs text-gray-400">Darkpool</span>
        </div>
      </div>

      {/* Top Locations */}
      {!compact && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Top Locations</h4>
          <div className="space-y-1">
            {data.hotZones
              .sort((a, b) => b.intensity - a.intensity)
              .slice(0, 5)
              .map((zone, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded px-2 py-1">
                  <span className="text-sm text-gray-300">{zone.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${zone.intensity}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 w-8">{zone.intensity.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
