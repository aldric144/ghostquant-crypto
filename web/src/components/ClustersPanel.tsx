"use client";

import { useState, useEffect } from "react";
import { Layers, TrendingUp } from "lucide-react";

interface Cluster {
  cluster_id: number;
  label: string;
  coin_count: number;
  avg_momentum: number;
  top_coins: string[];
}

export default function ClustersPanel() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

  const fetchClusters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/market/clusters`);
      if (!response.ok) throw new Error("Failed to fetch clusters");

      const data = await response.json();
      setClusters(data.clusters || []);
    } catch (err) {
      console.error("Error fetching clusters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
    const interval = setInterval(fetchClusters, 300000);
    return () => clearInterval(interval);
  }, []);

  const getClusterColor = (avgMomentum: number) => {
    if (avgMomentum >= 70) return "from-emerald-500 to-green-500";
    if (avgMomentum >= 60) return "from-yellow-500 to-amber-500";
    if (avgMomentum >= 50) return "from-blue-500 to-cyan-500";
    return "from-slate-500 to-slate-600";
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold">Coin Clusters</h3>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          Loading...
        </div>
      )}

      {!loading && clusters.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No clusters available
        </div>
      )}

      {!loading && clusters.length > 0 && (
        <div className="space-y-3">
          {clusters.map((cluster) => (
            <div
              key={cluster.cluster_id}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">{cluster.label}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {cluster.coin_count} coins
                  </div>
                </div>
                
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getClusterColor(cluster.avg_momentum)} flex items-center justify-center text-xs font-bold shadow-lg`}>
                  {cluster.avg_momentum.toFixed(0)}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {cluster.top_coins.map((symbol, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400"
                  >
                    {symbol.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
