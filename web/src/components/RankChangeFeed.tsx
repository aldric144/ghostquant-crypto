"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface RankChange {
  id: string;
  symbol: string;
  name: string;
  current_rank: number;
  previous_rank: number;
  rank_delta: number;
  momentum_score: number;
  timestamp: string;
}

export default function RankChangeFeed() {
  const [changes, setChanges] = useState<RankChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState("15m");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

  const fetchRankChanges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/market/rank-changes?since=${timeWindow}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch rank changes");

      const data = await response.json();
      setChanges(data.changes || []);
    } catch (err) {
      console.error("Error fetching rank changes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankChanges();
    const interval = setInterval(fetchRankChanges, 60000);
    return () => clearInterval(interval);
  }, [timeWindow]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          Rank Changes
        </h3>
        <select
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="24h">24h</option>
        </select>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
          Loading...
        </div>
      )}

      {!loading && changes.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No rank changes in the last {timeWindow}
        </div>
      )}

      {!loading && changes.length > 0 && (
        <div className="space-y-2">
          {changes.map((change) => (
            <div
              key={change.id}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-white">{change.symbol.toUpperCase()}</div>
                  <div className="text-xs text-slate-400">{change.name}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">
                      #{change.previous_rank} → #{change.current_rank}
                    </div>
                    <div className={`text-xs font-medium ${change.rank_delta < 0 ? "text-green-400" : "text-red-400"}`}>
                      {change.rank_delta < 0 ? (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {Math.abs(change.rank_delta)} up
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <TrendingDown size={12} />
                          {change.rank_delta} down
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                    {change.momentum_score.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
