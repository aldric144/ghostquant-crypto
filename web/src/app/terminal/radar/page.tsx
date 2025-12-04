"use client";

import { useEffect, useState } from 'react';
import { getHeatmap, getSummary, getSpikes, type RadarHeatmap, type RadarSummary, type RadarSpikes } from '@/lib/radarClient';
import { RadarEngine } from './RadarEngine';

export default function RadarPage() {
  const [heatmap, setHeatmap] = useState<RadarHeatmap | null>(null);
  const [summary, setSummary] = useState<RadarSummary | null>(null);
  const [spikes, setSpikes] = useState<RadarSpikes | null>(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<'chains' | 'entities' | 'tokens' | 'networks'>('chains');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  async function loadData() {
    try {
      const [heatmapData, summaryData, spikesData] = await Promise.all([
        getHeatmap(timeframe),
        getSummary(),
        getSpikes(timeframe)
      ]);
      
      setHeatmap(heatmapData);
      setSummary(summaryData);
      setSpikes(spikesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading radar data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading Global Radar...</div>
          <div className="text-gray-400">Initializing manipulation detection systems</div>
        </div>
      </div>
    );
  }

  const aggregated = heatmap ? RadarEngine.aggregateHeatmap(heatmap) : null;
  const currentLayer = aggregated ? aggregated[selectedLayer] : null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Global Manipulation Radar</h1>
          <p className="text-gray-400">Real-time manipulation risk visualization across chains, entities, tokens, and networks</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6 flex gap-2">
          {['1h', '6h', '24h', '7d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded ${
                timeframe === tf
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Global Overview */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Global Overview</h2>
              
              {summary && (
                <div className="space-y-4">
                  {/* Global Risk Score */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Global Risk Score</div>
                    <div className="text-3xl font-bold" style={{ color: RadarEngine.getRiskColor(summary.global_risk_score) }}>
                      {RadarEngine.formatScore(summary.global_risk_score)}
                    </div>
                    <div className="text-sm text-gray-400">{summary.global_risk_level}</div>
                  </div>

                  {/* Total Events */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Events</div>
                    <div className="text-2xl font-bold">{summary.total_events.toLocaleString()}</div>
                  </div>

                  {/* Manipulation Spikes */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Manipulation Spikes</div>
                    <div className="text-2xl font-bold text-red-500">{summary.manipulation_spikes}</div>
                  </div>

                  {/* Top 5 Risky Entities */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Top 5 Risky Entities</div>
                    <div className="space-y-2">
                      {summary.top_entities.slice(0, 5).map((entity, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="truncate flex-1 mr-2">{entity.address.slice(0, 10)}...</span>
                          <span className="font-bold" style={{ color: RadarEngine.getRiskColor(entity.score) }}>
                            {RadarEngine.formatScore(entity.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Risk Chains */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Top Risk Chains</div>
                    <div className="space-y-2">
                      {summary.chain_trends.slice(0, 5).map((chain, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="flex-1 mr-2">{chain.chain}</span>
                          <span className="font-bold" style={{ color: RadarEngine.getRiskColor(chain.score) }}>
                            {RadarEngine.formatScore(chain.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                    Last update: {new Date(summary.last_update).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel - Live Heatmap */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Live Heatmap</h2>

              {/* Layer Selector */}
              <div className="flex gap-2 mb-4">
                {(['chains', 'entities', 'tokens', 'networks'] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setSelectedLayer(layer)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedLayer === layer
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                  </button>
                ))}
              </div>

              {/* Heatmap Grid */}
              {currentLayer && (
                <div className="space-y-2">
                  {Object.entries(currentLayer.data)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 15)
                    .map(([key, score], i) => (
                      <div
                        key={i}
                        className="p-3 rounded transition-all duration-300"
                        style={{
                          backgroundColor: RadarEngine.getRiskColor(score) + '20',
                          borderLeft: `4px solid ${RadarEngine.getRiskColor(score)}`
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1 mr-2">
                            {selectedLayer === 'entities' ? `${key.slice(0, 12)}...` : key}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{RadarEngine.getRiskLevel(score)}</span>
                            <span className="font-bold" style={{ color: RadarEngine.getRiskColor(score) }}>
                              {RadarEngine.formatScore(score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Layer Stats */}
              {currentLayer && (
                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Max</div>
                    <div className="font-bold">{RadarEngine.formatScore(currentLayer.max_score)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Avg</div>
                    <div className="font-bold">{RadarEngine.formatScore(currentLayer.avg_score)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Min</div>
                    <div className="font-bold">{RadarEngine.formatScore(currentLayer.min_score)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Intelligence Events */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Intelligence Events</h2>

              {spikes && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Manipulation Spikes */}
                  {spikes.manipulation_spikes.map((spike, i) => (
                    <div
                      key={`manip-${i}`}
                      className="p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-400">MANIPULATION DETECTED</span>
                      </div>
                      <div className="text-sm truncate">{spike.entity.slice(0, 16)}...</div>
                      <div className="text-xs text-gray-400">Risk: {RadarEngine.formatScore(spike.score)}</div>
                    </div>
                  ))}

                  {/* Volatility Spikes */}
                  {spikes.volatility_spikes.map((spike, i) => (
                    <div
                      key={`vol-${i}`}
                      className="p-3 bg-yellow-900 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-yellow-400">VOLATILITY ALERT</span>
                      </div>
                      <div className="text-sm">{spike.token}</div>
                      <div className="text-xs text-gray-400">Score: {RadarEngine.formatScore(spike.score)}</div>
                    </div>
                  ))}

                  {/* Chain Pressure Bursts */}
                  {spikes.chain_pressure_bursts.map((spike, i) => (
                    <div
                      key={`chain-${i}`}
                      className="p-3 bg-orange-900 bg-opacity-20 border border-orange-500 border-opacity-30 rounded"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-orange-400">CHAIN PRESSURE BURST</span>
                      </div>
                      <div className="text-sm">{spike.chain}</div>
                      <div className="text-xs text-gray-400">Pressure: {RadarEngine.formatScore(spike.score)}</div>
                    </div>
                  ))}

                  {/* Synchronized Clusters */}
                  {spikes.synchronized_clusters.map((cluster, i) => (
                    <div
                      key={`cluster-${i}`}
                      className="p-3 bg-purple-900 bg-opacity-20 border border-purple-500 border-opacity-30 rounded"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-purple-400">CLUSTER FORMATION</span>
                      </div>
                      <div className="text-sm">Cluster #{cluster.cluster_id}</div>
                      <div className="text-xs text-gray-400">
                        {cluster.size} entities · {RadarEngine.formatScore(cluster.score)}
                      </div>
                    </div>
                  ))}

                  {spikes.spike_count === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No spikes detected in current timeframe
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3">Risk Level Legend</h3>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9333ea' }}></div>
              <span>Critical (90-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span>High (70-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Moderate (40-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>Low (15-39%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
              <span>Minimal (0-14%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
