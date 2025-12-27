'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import React, { useState, useEffect, useRef } from 'react';
import { globalConstellation } from '@/lib/globalConstellationClient';
import { ConstellationEngine } from '@/lib/ConstellationEngine';
import type { ConstellationMap, ConstellationSummary, ConstellationNode, ConstellationEdge } from '@/lib/globalConstellationClient';
import type { ConstellationVisual } from '@/lib/ConstellationEngine';

export default function ConstellationPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [map, setMap] = useState<ConstellationMap | null>(null);
  const [summary, setSummary] = useState<ConstellationSummary | null>(null);
  const [visual, setVisual] = useState<ConstellationVisual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  const fetchData = async () => {
    try {
      const [mapResponse, summaryResponse] = await Promise.all([
        globalConstellation.getMap(),
        globalConstellation.getSummary(),
      ]);

      if (mapResponse.success && mapResponse.map) {
        setMap(mapResponse.map);
        
        const visualModel = ConstellationEngine.buildVisualModel(
          mapResponse.map.nodes,
          mapResponse.map.edges,
          800,
          600
        );
        setVisual(visualModel);
      } else {
        setError(mapResponse.error || 'Failed to fetch map');
      }

      if (summaryResponse.success && summaryResponse.summary) {
        setSummary(summaryResponse.summary);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !visual) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visual.starfield && visual.starfield.stars) {
        ctx.fillStyle = '#ffffff';
        for (const star of visual.starfield.stars) {
          const x = (star.x + 500) * (canvas.width / 1000);
          const y = (star.y + 500) * (canvas.height / 1000);
          const size = star.brightness * 2;
          ctx.globalAlpha = star.brightness * 0.5;
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1.0;
      }

      if (visual.galaxies) {
        for (const galaxy of visual.galaxies) {
          const x = (galaxy.center.x + 100) * (canvas.width / 200);
          const y = (galaxy.center.y + 100) * (canvas.height / 200);
          const radius = galaxy.radius * (canvas.width / 200);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          const color = ConstellationEngine.computeRiskColor(galaxy.risk);
          gradient.addColorStop(0, `${color}40`);
          gradient.addColorStop(0.5, `${color}20`);
          gradient.addColorStop(1, `${color}00`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
      }

      if (visual.edges) {
        for (const edge of visual.edges) {
          const sourceNode = visual.nodes.find(n => n.id === edge.source_id);
          const targetNode = visual.nodes.find(n => n.id === edge.target_id);

          if (sourceNode && targetNode) {
            const x1 = sourceNode.normalizedX;
            const y1 = sourceNode.normalizedY;
            const x2 = targetNode.normalizedX;
            const y2 = targetNode.normalizedY;

            ctx.strokeStyle = edge.color;
            ctx.lineWidth = edge.strength * 2;
            ctx.globalAlpha = edge.strength * 0.6;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.globalAlpha = 1.0;
          }
        }
      }

      if (visual.wormholes) {
        for (const wormhole of visual.wormholes) {
          const sourceNode = visual.nodes.find(n => n.id === wormhole.edge.source_id);
          const targetNode = visual.nodes.find(n => n.id === wormhole.edge.target_id);

          if (sourceNode && targetNode) {
            const x1 = sourceNode.normalizedX;
            const y1 = sourceNode.normalizedY;
            const x2 = targetNode.normalizedX;
            const y2 = targetNode.normalizedY;

            const t = (Date.now() % 2000) / 2000;
            const sparkleX = x1 + (x2 - x1) * t;
            const sparkleY = y1 + (y2 - y1) * t;

            const gradient = ctx.createRadialGradient(sparkleX, sparkleY, 0, sparkleX, sparkleY, 10);
            gradient.addColorStop(0, wormhole.color);
            gradient.addColorStop(1, `${wormhole.color}00`);

            ctx.fillStyle = gradient;
            ctx.fillRect(sparkleX - 10, sparkleY - 10, 20, 20);
          }
        }
      }

      if (visual.nodes) {
        for (const node of visual.nodes) {
          const x = node.normalizedX;
          const y = node.normalizedY;
          const size = ConstellationEngine.computeNodeSize(node.type, node.risk_level);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
          gradient.addColorStop(0, node.color);
          gradient.addColorStop(0.5, `${node.color}80`);
          gradient.addColorStop(1, `${node.color}00`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (visual.supernovas) {
        const time = Date.now() / 1000;
        for (const supernova of visual.supernovas) {
          const node = visual.nodes.find(n => n.id === supernova.node.id);
          if (node) {
            const x = node.normalizedX;
            const y = node.normalizedY;
            const baseSize = ConstellationEngine.computeNodeSize(node.type, node.risk_level);

            const pulse = Math.sin(time * supernova.pulseSpeed * Math.PI) * 0.5 + 0.5;
            const size = baseSize * (1 + pulse * 0.5);

            const flash = Math.sin(time * supernova.pulseSpeed * Math.PI * 2) * 0.3 + 0.7;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            gradient.addColorStop(0, `#ff0000${Math.floor(flash * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `#ff000080`);
            gradient.addColorStop(1, `#ff000000`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
          }
        }
      }

      rotationRef.current += 0.001;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visual]);

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-red-500',
      elevated: 'bg-orange-500',
      moderate: 'bg-yellow-500',
      low: 'bg-green-400',
      minimal: 'bg-green-600',
    };
    return colors[risk] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading Constellation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left Panel - Overview */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
        <TerminalBackButton className="mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Global Threat Constellation</h2>

        {/* Global Risk Gauge */}
        {map && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Global Risk</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold">{(map.global_risk_score * 100).toFixed(1)}%</span>
              {summary && (
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getRiskBadge(summary.dominant_risk)}`}>
                  {summary.dominant_risk.toUpperCase()}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${map.global_risk_score * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {summary && (
          <div className="mb-6 space-y-3">
            <div className="p-3 bg-gray-800 rounded">
              <div className="text-sm text-gray-400">Hydra Heads</div>
              <div className="text-2xl font-bold text-red-400">{summary.hydra_heads_detected}</div>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <div className="text-sm text-gray-400">Clusters</div>
              <div className="text-2xl font-bold text-orange-400">{summary.clusters_detected}</div>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <div className="text-sm text-gray-400">Total Nodes</div>
              <div className="text-2xl font-bold text-blue-400">{summary.total_nodes}</div>
            </div>
            <div className="p-3 bg-gray-800 rounded">
              <div className="text-sm text-gray-400">Total Edges</div>
              <div className="text-2xl font-bold text-purple-400">{summary.total_edges}</div>
            </div>
          </div>
        )}

        {/* Top 5 Hottest Stars */}
        {summary && summary.high_risk_entities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-red-400">🔥 Hottest Stars</h3>
            <div className="space-y-2">
              {summary.high_risk_entities.slice(0, 5).map((entity, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded text-sm">
                  <div className="font-mono truncate">{entity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>⭐ Star = Entity</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
              <span>🌟 Supernova = High Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span>🌌 Galaxy = Cluster</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span>🌀 Wormhole = Strong Link</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span>☁️ Nebula = Volatility Zone</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900 border border-red-700 rounded text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Middle Panel - Constellation Map */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-700 rounded-lg shadow-2xl"
          />
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-2 rounded text-sm">
            <div className="text-gray-400">Last Update:</div>
            <div className="font-mono">{map?.timestamp ? new Date(map.timestamp).toLocaleTimeString() : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Intelligence Feed */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Intelligence Feed</h2>

        {/* Real-time Events */}
        <div className="space-y-3">
          {visual?.supernovas && visual.supernovas.length > 0 && (
            <div className="p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded">
              <div className="text-sm font-semibold text-red-400 mb-1">🚨 CRITICAL SUPERNOVAS</div>
              <div className="text-xs text-gray-300">
                {visual.supernovas.length} high-risk entities detected requiring immediate attention
              </div>
            </div>
          )}

          {visual?.wormholes && visual.wormholes.length > 0 && (
            <div className="p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded">
              <div className="text-sm font-semibold text-blue-400 mb-1">🌀 WORMHOLE DETECTED</div>
              <div className="text-xs text-gray-300">
                {visual.wormholes.length} strong relay connections identified
              </div>
            </div>
          )}

          {visual?.galaxies && visual.galaxies.length > 0 && (
            <div className="p-3 bg-purple-900 bg-opacity-30 border border-purple-700 rounded">
              <div className="text-sm font-semibold text-purple-400 mb-1">🌌 GALAXY FORMATION</div>
              <div className="text-xs text-gray-300">
                {visual.galaxies.length} coordinated clusters detected
              </div>
            </div>
          )}

          {map && map.nodes.length > 0 && (
            <div className="p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded">
              <div className="text-sm font-semibold text-green-400 mb-1">✅ CONSTELLATION MAPPED</div>
              <div className="text-xs text-gray-300">
                {map.nodes.length} entities mapped across {map.edges.length} connections
              </div>
            </div>
          )}
        </div>

        {/* Top Risk Increases */}
        {visual?.supernovas && visual.supernovas.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-red-400">Top Risk Increases</h3>
            <div className="space-y-2">
              {visual.supernovas.slice(0, 5).map((supernova, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded text-xs">
                  <div className="font-mono truncate mb-1">{supernova.node.id}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk:</span>
                    <span className="text-red-400 font-bold">{(supernova.node.risk_level * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newly Detected Links */}
        {visual?.wormholes && visual.wormholes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Newly Detected Links</h3>
            <div className="space-y-2">
              {visual.wormholes.slice(0, 3).map((wormhole, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded text-xs">
                  <div className="font-mono truncate mb-1">
                    {wormhole.edge.source_id.slice(0, 10)}... → {wormhole.edge.target_id.slice(0, 10)}...
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Strength:</span>
                    <span className="text-blue-400 font-bold">{(wormhole.flow * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constellation Summary */}
        {summary && summary.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">Summary</h3>
            <div className="p-3 bg-gray-800 rounded text-xs text-gray-300 leading-relaxed">
              {summary.notes}
            </div>
          </div>
        )}
      </div>
    
      {/* Module Guide Panel */}
      <ModuleGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        content={getModuleGuideContent('Constellation')}
      />
    </div>
  );
}
