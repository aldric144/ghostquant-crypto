"use client";

import { useState, useCallback, memo } from "react";

interface WhaleSearchProps {
  onSearch: (query: string) => void;
}

function WhaleSearch({ onSearch }: WhaleSearchProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "address" | "label" | "risk" | "exchange">("all");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query);
    },
    [query, onSearch]
  );

  const handleQuickSearch = useCallback(
    (term: string) => {
      setQuery(term);
      onSearch(term);
    },
    [onSearch]
  );

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        {/* Search Type Selector */}
        <div className="flex items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as typeof searchType)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Fields</option>
            <option value="address">Wallet Address</option>
            <option value="label">Label/Tag</option>
            <option value="risk">Risk Rating</option>
            <option value="exchange">Exchange</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by wallet address, label, tag, risk level, or exchange..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          Search
        </button>
      </form>

      {/* Quick Search Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Quick filters:</span>
        {[
          { label: "High Risk", value: "high" },
          { label: "Smart Money", value: "Smart Money" },
          { label: "Exchange", value: "Exchange" },
          { label: "DeFi", value: "DeFi" },
          { label: "Institutional", value: "Institutional" },
          { label: "NFT Collector", value: "NFT Collector" },
        ].map((tag) => (
          <button
            key={tag.value}
            onClick={() => handleQuickSearch(tag.value)}
            className="px-3 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded-full text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(WhaleSearch);
