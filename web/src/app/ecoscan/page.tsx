"use client";

import { useEffect, useState } from "react";
import BridgeLeaderboard from "@/components/BridgeLeaderboard";
import WhaleTimeline from "@/components/WhaleTimeline";
import EcoscanMap from "@/components/EcoscanMap";
import AlertsPanel from "@/components/AlertsPanel";
import EcosystemFlipCard from "@/components/EcosystemFlipCard";
import { Search, Filter, ArrowUpDown, Info } from "lucide-react";

interface Ecosystem {
  chain: string;
  emi_score: number;
  ecosystem_stage: string;
  stage?: string; // Legacy compatibility
  tvl: number;
  tvl_usd?: number; // Legacy compatibility
  delta_24h: number;
  whale_activity_score: number;
  bridge_flow_score: number;
  risk_level: string;
  growth_phase: string;
  stability_score: number;
  synthetic: boolean;
  wallets_24h?: number;
  volume_24h?: number;
}

// GQ-Core API base path
const GQ_CORE_API = "/api/gq-core";

interface WhaleFlow {
  asset: string;
  flow_in_usd: number;
  flow_out_usd: number;
  net_flow_usd: number;
  wcf: number;
  sentiment: string;
}

interface Opportunity {
  asset: string;
  ecoscore: number;
  signal: string;
  emi: number;
  wcf: number;
  pretrend: number;
}

interface ClusterSummary {
  cluster_counts: {
    accumulation: number;
    distribution: number;
    dormant_activation: number;
  };
  cluster_percentages: {
    accumulation: number;
    distribution: number;
    dormant_activation: number;
  };
}

interface BridgeFlowSummary {
  total_inflows: number;
  total_outflows: number;
  total_net_flow: number;
  top_inflow_chains: Array<{ chain: string; inflows: number }>;
  top_outflow_chains: Array<{ chain: string; outflows: number }>;
}

export default function EcoscanPage() {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([]);
  const [whaleFlows, setWhaleFlows] = useState<WhaleFlow[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clusterSummary, setClusterSummary] = useState<ClusterSummary | null>(null);
  const [bridgeFlows, setBridgeFlows] = useState<BridgeFlowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"emi" | "tvl" | "wallets" | "volume">("emi");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  useEffect(() => {
    fetchEcoscanData();
    const interval = setInterval(fetchEcoscanData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchEcoscanData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try GQ-Core ecosystems endpoint first
      let ecosystemData: Ecosystem[] = [];
      try {
        const gqCoreRes = await fetch(`${GQ_CORE_API}/ecosystems`);
        if (gqCoreRes.ok) {
          const gqCoreData = await gqCoreRes.json();
          // GQ-Core returns { source, timestamp, data: [...ecosystems] }
          const rawEcosystems = gqCoreData.data || gqCoreData;
          ecosystemData = Array.isArray(rawEcosystems) ? rawEcosystems : [];
          
          // Map GQ-Core fields to component expected fields
          ecosystemData = ecosystemData.map(eco => ({
            ...eco,
            stage: eco.ecosystem_stage || eco.stage,
            tvl_usd: eco.tvl || eco.tvl_usd,
          }));
        }
      } catch (gqErr) {
        console.warn("GQ-Core ecosystems fetch failed, falling back to legacy:", gqErr);
      }

      // Fallback to legacy endpoint if GQ-Core failed
      if (ecosystemData.length === 0) {
        const summaryRes = await fetch('/api/ecoscan/summary');
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          ecosystemData = (summary.ecosystems?.top_10 || []).map((eco: any) => ({
            ...eco,
            ecosystem_stage: eco.stage,
            tvl: eco.tvl_usd,
            delta_24h: 0,
            whale_activity_score: 50,
            bridge_flow_score: 50,
            risk_level: "medium",
            growth_phase: eco.stage,
            stability_score: 50,
            synthetic: true,
          }));
          setWhaleFlows(summary.whale_activity?.heatmap || []);
          setOpportunities(summary.opportunities?.top_10 || []);
          setClusterSummary(summary.smart_money || null);
          setBridgeFlows(summary.bridge_flows?.summary || null);
        }
      } else {
        // Fetch additional data from legacy endpoint for whale flows, opportunities, etc.
        try {
          const summaryRes = await fetch('/api/ecoscan/summary');
          if (summaryRes.ok) {
            const summary = await summaryRes.json();
            setWhaleFlows(summary.whale_activity?.heatmap || []);
            setOpportunities(summary.opportunities?.top_10 || []);
            setClusterSummary(summary.smart_money || null);
            setBridgeFlows(summary.bridge_flows?.summary || null);
          }
        } catch (legacyErr) {
          console.warn("Legacy summary fetch failed:", legacyErr);
        }
      }

      setEcosystems(ecosystemData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Ecoscan data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  const getEMIColor = (emi: number): string => {
    if (emi >= 70) return "#10B981"; // Green
    if (emi >= 60) return "#84CC16"; // Light green
    if (emi >= 50) return "#F59E0B"; // Orange
    if (emi >= 40) return "#EF4444"; // Red
    return "#991B1B"; // Dark red
  };

  const getWCFColor = (wcf: number): string => {
    if (wcf >= 70) return "#10B981"; // Very bullish
    if (wcf >= 60) return "#84CC16"; // Bullish
    if (wcf >= 40) return "#6B7280"; // Neutral
    if (wcf >= 30) return "#F59E0B"; // Bearish
    return "#EF4444"; // Very bearish
  };

  const getSignalColor = (signal: string): string => {
    if (signal === "STRONG_BUY") return "#10B981";
    if (signal === "BUY") return "#84CC16";
    if (signal === "ACCUMULATE") return "#F59E0B";
    if (signal === "HOLD") return "#6B7280";
    if (signal === "REDUCE") return "#F97316";
    return "#EF4444"; // SELL
  };

  const filteredAndSortedEcosystems = () => {
    let filtered = ecosystems;
    
    if (searchQuery) {
      filtered = filtered.filter(eco =>
        eco.chain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStage !== "all") {
      filtered = filtered.filter(eco => eco.stage === filterStage);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "emi":
          return b.emi_score - a.emi_score;
        case "tvl":
          return b.tvl_usd - a.tvl_usd;
        case "wallets":
          return (b.wallets_24h || 0) - (a.wallets_24h || 0);
        case "volume":
          return (b.volume_24h || 0) - (a.volume_24h || 0);
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const toggleComparison = (chain: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(chain)) {
        return prev.filter(c => c !== chain);
      } else if (prev.length < 3) {
        return [...prev, chain];
      }
      return prev;
    });
  };

  if (loading && ecosystems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1622] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#D4AF37]">
            Ecoscan 🗺️
          </h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading ecosystem data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1622] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#D4AF37]">
            Ecoscan 🗺️
          </h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchEcoscanData}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1622] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
            Ecoscan 🗺️
          </h1>
          <p className="text-gray-400">
            Ecosystem Mapper + Whale Intelligence • Cross-chain opportunity discovery
          </p>
          <a
            href="/alphabrain"
            className="inline-block mt-2 text-sm text-[#D4AF37] hover:underline"
          >
            → View in AlphaBrain for cross-analysis
          </a>
        </div>

        {/* Emerging Ecosystems Heatmap */}
        <div className="mb-8 bg-[#1A2332] rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                Emerging Ecosystems Heatmap
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Ranked by Ecosystem Momentum Index (EMI) • Click cards to see analysis
              </p>
            </div>
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                comparisonMode
                  ? "bg-[#D4AF37] text-[#0B1622]"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {comparisonMode ? `Compare (${selectedForComparison.length}/3)` : "Compare Mode"}
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search ecosystems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0B1622] border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3 py-2 bg-[#0B1622] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Stages</option>
                <option value="explosive_growth">Explosive Growth</option>
                <option value="rapid_growth">Rapid Growth</option>
                <option value="steady_growth">Steady Growth</option>
                <option value="emerging">Emerging</option>
                <option value="mature_or_declining">Mature/Declining</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#0B1622] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="emi">Sort by EMI</option>
                <option value="tvl">Sort by TVL</option>
                <option value="wallets">Sort by Wallets</option>
                <option value="volume">Sort by Volume</option>
              </select>
            </div>
          </div>

          {/* Tooltip */}
          <div className="flex items-start gap-2 mb-4 p-3 bg-[#0B1622] rounded border border-gray-700">
            <Info size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              <strong className="text-[#D4AF37]">EMI (Ecosystem Momentum Index)</strong> is a composite score weighted by TVL growth (30%), wallet activity (25%), transaction volume (25%), and bridge flows (20%). Higher scores indicate stronger momentum.
            </p>
          </div>

          {/* Comparison Panel */}
          {comparisonMode && selectedForComparison.length > 0 && (
            <div className="mb-4 p-4 bg-[#0B1622] rounded border border-[#D4AF37]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#D4AF37]">
                  Selected for Comparison ({selectedForComparison.length}/3)
                </span>
                <button
                  onClick={() => setSelectedForComparison([])}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedForComparison.map(chain => (
                  <span
                    key={chain}
                    className="px-3 py-1 bg-[#D4AF37] text-[#0B1622] rounded text-sm font-medium capitalize"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ecosystem Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {filteredAndSortedEcosystems().map((eco) => (
              <div key={eco.chain} className="relative">
                {comparisonMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedForComparison.includes(eco.chain)}
                      onChange={() => toggleComparison(eco.chain)}
                      className="w-5 h-5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <EcosystemFlipCard ecosystem={eco} getEMIColor={getEMIColor} />
              </div>
            ))}
          </div>

          {filteredAndSortedEcosystems().length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No ecosystems match your filters
            </div>
          )}
        </div>

        {/* Whale Flow Tracker */}
        <div className="mb-8 bg-[#1A2332] rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">
            Whale Flow Tracker
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Large wallet transactions (&gt;$250k) • WCF = Whale Confidence Factor
          </p>
          <div className="space-y-3">
            {whaleFlows.slice(0, 10).map((flow) => (
              <div
                key={flow.asset}
                className="flex items-center justify-between p-4 bg-[#0B1622] rounded-lg border border-gray-700"
              >
                <div className="flex-1">
                  <div className="font-bold text-lg">{flow.asset}</div>
                  <div className="text-sm text-gray-400">
                    Sentiment: <span className="capitalize">{flow.sentiment}</span>
                  </div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div
                        className="h-6 rounded"
                        style={{
                          width: `${Math.min(
                            (flow.flow_in_usd / Math.max(flow.flow_in_usd, flow.flow_out_usd)) *
                              100,
                            100
                          )}%`,
                          backgroundColor: "#10B981",
                        }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-1">
                        In: ${(flow.flow_in_usd / 1e6).toFixed(1)}M
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-6 rounded"
                        style={{
                          width: `${Math.min(
                            (flow.flow_out_usd / Math.max(flow.flow_in_usd, flow.flow_out_usd)) *
                              100,
                            100
                          )}%`,
                          backgroundColor: "#EF4444",
                        }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-1">
                        Out: ${(flow.flow_out_usd / 1e6).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: getWCFColor(flow.wcf) }}
                  >
                    {flow.wcf.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">WCF</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bridge Flow Monitor */}
        {bridgeFlows && (
          <div className="mb-8 bg-[#1A2332] rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">
              Cross-Chain Bridge Flows
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              24h bridge activity • Wormhole, LayerZero, Stargate, Across, Hop, Synapse, Multichain
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-[#0B1622] rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400">Total Inflows</div>
                <div className="text-2xl font-bold text-green-400">
                  ${(bridgeFlows.total_inflows / 1e6).toFixed(1)}M
                </div>
              </div>
              <div className="p-4 bg-[#0B1622] rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400">Total Outflows</div>
                <div className="text-2xl font-bold text-red-400">
                  ${(bridgeFlows.total_outflows / 1e6).toFixed(1)}M
                </div>
              </div>
              <div className="p-4 bg-[#0B1622] rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400">Net Flow</div>
                <div className={`text-2xl font-bold ${bridgeFlows.total_net_flow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(bridgeFlows.total_net_flow / 1e6).toFixed(1)}M
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-bold text-gray-300 mb-2">Top Inflow Chains</div>
                {bridgeFlows.top_inflow_chains.slice(0, 5).map((chain) => (
                  <div key={chain.chain} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="capitalize">{chain.chain}</span>
                    <span className="text-green-400">${(chain.inflows / 1e6).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-300 mb-2">Top Outflow Chains</div>
                {bridgeFlows.top_outflow_chains.slice(0, 5).map((chain) => (
                  <div key={chain.chain} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="capitalize">{chain.chain}</span>
                    <span className="text-red-400">${(chain.outflows / 1e6).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Smart Money Clusters */}
        {clusterSummary && (
          <div className="mb-8 bg-[#1A2332] rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">
              Smart Money Clusters
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Wallet behavior patterns • K-Means clustering analysis
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0B1622] rounded-lg border-2 border-green-500">
                <div className="text-lg font-bold text-green-400">Accumulation</div>
                <div className="text-3xl font-bold my-2">
                  {clusterSummary.cluster_counts.accumulation}
                </div>
                <div className="text-sm text-gray-400">
                  {clusterSummary.cluster_percentages.accumulation.toFixed(1)}% of wallets
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Consistent buying, low selling
                </div>
              </div>
              <div className="p-4 bg-[#0B1622] rounded-lg border-2 border-red-500">
                <div className="text-lg font-bold text-red-400">Distribution</div>
                <div className="text-3xl font-bold my-2">
                  {clusterSummary.cluster_counts.distribution}
                </div>
                <div className="text-sm text-gray-400">
                  {clusterSummary.cluster_percentages.distribution.toFixed(1)}% of wallets
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  High selling activity
                </div>
              </div>
              <div className="p-4 bg-[#0B1622] rounded-lg border-2 border-yellow-500">
                <div className="text-lg font-bold text-yellow-400">
                  Dormant Activation
                </div>
                <div className="text-3xl font-bold my-2">
                  {clusterSummary.cluster_counts.dormant_activation}
                </div>
                <div className="text-sm text-gray-400">
                  {clusterSummary.cluster_percentages.dormant_activation.toFixed(1)}% of wallets
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Recently reactivated wallets
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Ecoscore Opportunities */}
        <div className="mb-8 bg-[#1A2332] rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">
            Top 10 Ecoscore Opportunities
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Unified score combining EMI + WCF + Pre-Trend • Sorted by Ecoscore
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Asset</th>
                  <th className="text-right py-3 px-4">Ecoscore</th>
                  <th className="text-right py-3 px-4">EMI</th>
                  <th className="text-right py-3 px-4">WCF</th>
                  <th className="text-right py-3 px-4">Pre-Trend</th>
                  <th className="text-center py-3 px-4">Signal</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, idx) => (
                  <tr
                    key={opp.asset}
                    className="border-b border-gray-800 hover:bg-[#0B1622] transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-bold">{opp.asset}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-2xl font-bold text-[#D4AF37]">
                        {opp.ecoscore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: getEMIColor(opp.emi) }}>
                        {opp.emi.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span style={{ color: getWCFColor(opp.wcf) }}>
                        {opp.wcf.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {opp.pretrend.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${getSignalColor(opp.signal)}20`,
                          color: getSignalColor(opp.signal),
                        }}
                      >
                        {opp.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phase 8: Cross-Chain Flow Map */}
        <div className="mb-8">
          <EcoscanMap period="24h" minVolume={100000} />
        </div>

        {/* Phase 8: Bridge Flow Leaderboard */}
        <div className="mb-8">
          <BridgeLeaderboard defaultPeriod="24h" showChains={true} />
        </div>

        {/* Phase 8: Whale Activity Timeline */}
        <div className="mb-8">
          <WhaleTimeline minValueUsd={1_000_000} limit={20} />
        </div>

        {/* Phase 1: Active Alerts Panel */}
        <div className="mb-8">
          <AlertsPanel lookbackHours={24} limit={50} autoRefresh={true} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Ecoscan updates every 5 minutes • Data aggregated from cross-chain sources
          </p>
          <p className="mt-2">
            Research only • No trading execution • For informational purposes
          </p>
        </div>
      </div>
    </div>
  );
}
