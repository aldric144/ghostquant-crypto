"use client";

import { useState, useEffect, useCallback } from "react";
import { EntityInfo } from "./index";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface SearchResult {
  id: string;
  type: "wallet" | "token" | "entity" | "contract";
  address?: string;
  symbol?: string;
  name: string;
  riskScore?: number;
  chains?: string[];
}

interface EntitySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEntitySelect: (entity: EntityInfo) => void;
  selectedEntity: EntityInfo | null;
}

export default function EntitySearch({
  searchQuery,
  onSearchChange,
  onEntitySelect,
  selectedEntity,
}: EntitySearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  const searchEntities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use correct existing endpoints for search
      const endpoints = [
        `/whales/search?q=${encodeURIComponent(query)}`,        // Whale search endpoint
        `/widb/wallets?limit=50`,                                // WIDB wallets for entity data
        `/manipulation/alerts?limit=20`,                         // Manipulation alerts
      ];

      const responses = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(`${API_BASE}${endpoint}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );

      const allResults: SearchResult[] = [];
      const seenIds = new Set<string>();

      responses.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          const data = result.value;
          const items = Array.isArray(data) ? data : data.results || data.entities || [];

          items.forEach((item: Record<string, unknown>) => {
            const id = (item.id as string) || (item.address as string) || (item.entity_id as string) || "";
            if (id && !seenIds.has(id)) {
              seenIds.add(id);

              let type: SearchResult["type"] = "entity";
              if ((item.type as string)?.includes("wallet") || (item.address as string)?.startsWith("0x")) {
                type = "wallet";
              } else if ((item.type as string)?.includes("token") || item.symbol) {
                type = "token";
              } else if ((item.type as string)?.includes("contract")) {
                type = "contract";
              }

              allResults.push({
                id,
                type,
                address: (item.address as string) || undefined,
                symbol: (item.symbol as string) || undefined,
                name: (item.name as string) || (item.label as string) || id.substring(0, 12) + "...",
                riskScore: (item.risk_score as number) || (item.score as number) || undefined,
                chains: (item.chains as string[]) || [(item.chain as string)].filter(Boolean),
              });
            }
          });
        }
      });

      // If no results from API, create a synthetic result for the search query
      if (allResults.length === 0 && query.length >= 10) {
        const isAddress = query.startsWith("0x") || query.length >= 32;
        allResults.push({
          id: query,
          type: isAddress ? "wallet" : "entity",
          address: isAddress ? query : undefined,
          name: isAddress ? `${query.substring(0, 8)}...${query.substring(query.length - 6)}` : query,
        });
      }

      setResults(allResults.slice(0, 10));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchEntities(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, searchEntities]);

  const handleSelect = (result: SearchResult) => {
    const entity: EntityInfo = {
      id: result.id,
      type: result.type,
      address: result.address,
      symbol: result.symbol,
      name: result.name,
    };

    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [result, ...filtered].slice(0, 5);
    });

    onEntitySelect(entity);
  };

  const getRiskColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 0.8) return "text-red-400";
    if (score >= 0.5) return "text-yellow-400";
    return "text-green-400";
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "wallet":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "token":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "contract":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search wallet, token, entity..."
            className="w-full px-4 py-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Search by:</span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 rounded">wallet</span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 rounded">token</span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 rounded">entity</span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 rounded">cluster</span>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 mb-2">Results ({results.length})</div>
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedEntity?.id === result.id
                      ? "bg-cyan-600/20 border border-cyan-500/50"
                      : "bg-slate-800/50 hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-cyan-400">{getTypeIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{result.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.address || result.symbol || result.id}
                      </div>
                    </div>
                    {result.riskScore !== undefined && (
                      <div className={`text-sm font-medium ${getRiskColor(result.riskScore)}`}>
                        {(result.riskScore * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                  {result.chains && result.chains.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {result.chains.map((chain, i) => (
                        <span
                          key={i}
                          className="text-xs px-1.5 py-0.5 bg-slate-700 text-gray-400 rounded"
                        >
                          {chain}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : searchQuery.length > 0 && !loading ? (
          <div className="px-4 text-center text-gray-500 text-sm">
            No results found for &quot;{searchQuery}&quot;
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="px-4">
            <div className="text-xs text-gray-500 mb-2">Recent Searches</div>
            <div className="space-y-2">
              {recentSearches.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full p-3 rounded-lg text-left bg-slate-800/30 hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{getTypeIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-300 truncate">{result.name}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {result.address || result.symbol || result.id}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 text-center text-gray-600 text-sm">
            Start typing to search entities
          </div>
        )}
      </div>
    </div>
  );
}
