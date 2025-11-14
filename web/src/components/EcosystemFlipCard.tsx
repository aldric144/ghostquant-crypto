"use client";

import { useState, useEffect } from "react";
import { ChevronRight, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface Ecosystem {
  chain: string;
  emi_score: number;
  stage: string;
  tvl_usd: number;
  wallets_24h?: number;
  volume_24h?: number;
}

interface Analysis {
  emi_score: number;
  emi_raw: number;
  deltas: {
    tvl_24h_pct: number;
    wallets_24h_pct: number;
    volume_24h_pct: number;
    bridge_net_24h_usd: number;
  };
  contributions: Array<{
    metric: string;
    value: number;
    weight: number;
    contribution: number;
    note: string;
  }>;
  top_drivers: Array<{
    metric: string;
    contribution_pct: number;
  }>;
  rationale: string;
  stage: string;
}

interface EcosystemFlipCardProps {
  ecosystem: Ecosystem;
  getEMIColor: (emi: number) => string;
}

export default function EcosystemFlipCard({ ecosystem, getEMIColor }: EcosystemFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (analysis) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/ecoscan/ecosystem/${ecosystem.chain}/analysis`);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Error fetching analysis:", err);
      setError("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    if (!isFlipped && !analysis && !loading) {
      fetchAnalysis();
    }
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFlipped) {
        setIsFlipped(false);
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFlipped]);

  return (
    <div
      className="relative h-48"
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isFlipped}
        aria-label={`${ecosystem.chain} ecosystem card. Press Enter to ${isFlipped ? "hide" : "show"} analysis`}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 p-4 rounded-lg border-2 transition-all hover:scale-105"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: `${getEMIColor(ecosystem.emi_score)}20`,
            borderColor: getEMIColor(ecosystem.emi_score),
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-lg font-bold capitalize">{ecosystem.chain}</div>
            <ChevronRight className="text-gray-400" size={20} />
          </div>
          <div
            className="text-3xl font-bold my-2"
            style={{ color: getEMIColor(ecosystem.emi_score) }}
          >
            {ecosystem.emi_score.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400 uppercase mb-2">{ecosystem.stage.replace(/_/g, " ")}</div>
          <div className="text-xs text-gray-500">
            TVL: ${(ecosystem.tvl_usd / 1e9).toFixed(2)}B
          </div>
          <div className="text-xs text-gray-600 mt-2 italic">
            Click to see analysis →
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 p-4 rounded-lg border-2 overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "#1A2332",
            borderColor: getEMIColor(ecosystem.emi_score),
          }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchAnalysis();
                }}
                className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
              >
                Retry
              </button>
            </div>
          )}
          
          {analysis && !loading && (
            <div className="space-y-3 text-sm">
              <div className="border-b border-gray-700 pb-2">
                <div className="text-lg font-bold capitalize text-[#D4AF37]">
                  {ecosystem.chain}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {analysis.rationale}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-300 mb-2">Top Drivers</div>
                {analysis.top_drivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{driver.metric}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: `${Math.min(driver.contribution_pct, 100)}px`,
                          backgroundColor: getEMIColor(ecosystem.emi_score),
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {driver.contribution_pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0B1622] p-2 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-green-400" />
                    <span className="text-xs text-gray-400">TVL</span>
                  </div>
                  <div className={`text-sm font-bold ${analysis.deltas.tvl_24h_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysis.deltas.tvl_24h_pct >= 0 ? '+' : ''}{analysis.deltas.tvl_24h_pct.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-[#0B1622] p-2 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity size={12} className="text-blue-400" />
                    <span className="text-xs text-gray-400">Wallets</span>
                  </div>
                  <div className={`text-sm font-bold ${analysis.deltas.wallets_24h_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysis.deltas.wallets_24h_pct >= 0 ? '+' : ''}{analysis.deltas.wallets_24h_pct.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-[#0B1622] p-2 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingDown size={12} className="text-purple-400" />
                    <span className="text-xs text-gray-400">Volume</span>
                  </div>
                  <div className={`text-sm font-bold ${analysis.deltas.volume_24h_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysis.deltas.volume_24h_pct >= 0 ? '+' : ''}{analysis.deltas.volume_24h_pct.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-[#0B1622] p-2 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign size={12} className="text-yellow-400" />
                    <span className="text-xs text-gray-400">Bridge</span>
                  </div>
                  <div className={`text-sm font-bold ${analysis.deltas.bridge_net_24h_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(analysis.deltas.bridge_net_24h_usd / 1e6).toFixed(1)}M
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                Click to flip back
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
