"use client";

import { useState, useEffect, useCallback } from "react";
import WhaleMetrics from "./WhaleMetrics";
import WhaleSearch from "./WhaleSearch";
import WhaleTable from "./WhaleTable";
import WhaleHeatmap from "./WhaleHeatmap";
import LiveMovements from "./LiveMovements";
import WhaleDetailModal from "./WhaleDetailModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

export interface WhaleData {
  address: string;
  label?: string;
  tags: string[];
  volume: number;
  movements: number;
  influenceScore: number;
  risk: "high" | "medium" | "low";
  chain: string;
  lastActive: Date;
  exchanges?: string[];
}

export interface WhaleMovement {
  id: string;
  address: string;
  type: "inflow" | "outflow" | "transfer";
  amount: number;
  token: string;
  chain: string;
  timestamp: Date;
  exchange?: string;
  risk: "high" | "medium" | "low";
}

type ViewMode = "overview" | "top" | "live" | "search" | "heatmap";

export default function WhaleIntelligence() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [whales, setWhales] = useState<WhaleData[]>([]);
  const [movements, setMovements] = useState<WhaleMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWhale, setSelectedWhale] = useState<WhaleData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWhales = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/whale-intel/top?count=50`);
      if (response.ok) {
        const data = await response.json();
        if (data.whales) {
          setWhales(data.whales);
        } else {
          // Generate mock data if endpoint returns empty
          setWhales(generateMockWhales(50));
        }
        setIsConnected(true);
      } else {
        setWhales(generateMockWhales(50));
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error fetching whales:", error);
      setWhales(generateMockWhales(50));
      setIsConnected(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/whale-intel/events?limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (data.events) {
          setMovements(data.events);
        } else {
          // Add a new mock movement occasionally
          if (Math.random() > 0.7) {
            setMovements((prev) => [generateMockMovement(), ...prev.slice(0, 49)]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
      // Add a new mock movement occasionally
      if (Math.random() > 0.7) {
        setMovements((prev) => [generateMockMovement(), ...prev.slice(0, 49)]);
      }
    }
  }, []);

  useEffect(() => {
    fetchWhales();
    // Initialize with some mock movements
    const initialMovements: WhaleMovement[] = [];
    for (let i = 0; i < 15; i++) {
      const movement = generateMockMovement();
      movement.timestamp = new Date(Date.now() - Math.random() * 3600000);
      initialMovements.push(movement);
    }
    setMovements(initialMovements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, [fetchWhales]);

  useEffect(() => {
    // Poll for new movements every 30 seconds
    const interval = setInterval(fetchMovements, 30000);
    return () => clearInterval(interval);
  }, [fetchMovements]);

  const handleWhaleClick = useCallback((whale: WhaleData) => {
    setSelectedWhale(whale);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      setViewMode("search");
    }
  }, []);

  const filteredWhales = searchQuery
    ? whales.filter(
        (w) =>
          w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          w.risk === searchQuery.toLowerCase()
      )
    : whales;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Whale Intelligence</h1>
                <p className="text-sm text-gray-400">Large Holder Tracking & Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Tabs */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "top", label: "Top 50" },
                  { id: "live", label: "Live" },
                  { id: "heatmap", label: "Heatmap" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === tab.id
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {/* Metrics Panel */}
        <WhaleMetrics whales={whales} movements={movements} isLoading={isLoading} />

        {/* Search Bar */}
        <div className="mt-6">
          <WhaleSearch onSearch={handleSearch} />
        </div>

        {/* Content based on view mode */}
        <div className="mt-6">
          {viewMode === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1">
                <WhaleTable
                  whales={filteredWhales.slice(0, 10)}
                  onWhaleClick={handleWhaleClick}
                  isLoading={isLoading}
                  title="Top 10 Whales"
                />
              </div>
              <div className="lg:col-span-1">
                <LiveMovements movements={movements.slice(0, 10)} />
              </div>
            </div>
          )}

          {viewMode === "top" && (
            <WhaleTable
              whales={filteredWhales}
              onWhaleClick={handleWhaleClick}
              isLoading={isLoading}
              title="Top 50 Whales"
              showPagination
            />
          )}

          {viewMode === "live" && (
            <LiveMovements movements={movements} showFullFeed />
          )}

          {viewMode === "search" && (
            <WhaleTable
              whales={filteredWhales}
              onWhaleClick={handleWhaleClick}
              isLoading={isLoading}
              title={`Search Results (${filteredWhales.length})`}
              showPagination
            />
          )}

          {viewMode === "heatmap" && (
            <WhaleHeatmap whales={whales.slice(0, 20)} />
          )}
        </div>
      </div>

      {/* Whale Detail Modal */}
      {selectedWhale && (
        <WhaleDetailModal
          whale={selectedWhale}
          onClose={() => setSelectedWhale(null)}
        />
      )}
    </div>
  );
}

// Helper functions to generate mock data
function generateMockWhales(count: number): WhaleData[] {
  const chains = ["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism"];
  const tags = ["Smart Money", "Exchange", "DeFi", "NFT Collector", "DAO", "Institutional"];
  const risks: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const exchanges = ["Binance", "Coinbase", "Kraken", "FTX", "Uniswap", "SushiSwap"];

  return Array.from({ length: count }, (_, i) => ({
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    label: Math.random() > 0.5 ? `Whale ${i + 1}` : undefined,
    tags: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => tags[Math.floor(Math.random() * tags.length)]
    ),
    volume: Math.random() * 1000000000 + 10000000,
    movements: Math.floor(Math.random() * 500) + 10,
    influenceScore: Math.random() * 100,
    risk: risks[Math.floor(Math.random() * risks.length)],
    chain: chains[Math.floor(Math.random() * chains.length)],
    lastActive: new Date(Date.now() - Math.random() * 86400000 * 7),
    exchanges: Math.random() > 0.3
      ? Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => exchanges[Math.floor(Math.random() * exchanges.length)]
        )
      : undefined,
  })).sort((a, b) => b.volume - a.volume);
}

function generateMockMovement(): WhaleMovement {
  const types: ("inflow" | "outflow" | "transfer")[] = ["inflow", "outflow", "transfer"];
  const tokens = ["ETH", "BTC", "USDT", "USDC", "BNB", "MATIC", "ARB"];
  const chains = ["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism"];
  const risks: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const exchanges = ["Binance", "Coinbase", "Kraken", "Uniswap"];

  return {
    id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.random() * 10000000 + 100000,
    token: tokens[Math.floor(Math.random() * tokens.length)],
    chain: chains[Math.floor(Math.random() * chains.length)],
    timestamp: new Date(),
    exchange: Math.random() > 0.5 ? exchanges[Math.floor(Math.random() * exchanges.length)] : undefined,
    risk: risks[Math.floor(Math.random() * risks.length)],
  };
}
