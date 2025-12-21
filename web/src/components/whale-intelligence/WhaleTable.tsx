"use client";

import { useState, useMemo, memo } from "react";
import type { WhaleData } from "./index";

interface WhaleTableProps {
  whales: WhaleData[];
  onWhaleClick: (whale: WhaleData) => void;
  isLoading: boolean;
  title?: string;
  showPagination?: boolean;
}

function WhaleTable({
  whales,
  onWhaleClick,
  isLoading,
  title = "Top Whales",
  showPagination = false,
}: WhaleTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof WhaleData>("volume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  const sortedWhales = useMemo(() => {
    return [...whales].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });
  }, [whales, sortField, sortDirection]);

  const paginatedWhales = useMemo(() => {
    if (!showPagination) return sortedWhales;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedWhales.slice(start, start + itemsPerPage);
  }, [sortedWhales, currentPage, showPagination]);

  const totalPages = Math.ceil(whales.length / itemsPerPage);

  const handleSort = (field: keyof WhaleData) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const SortIcon = ({ field }: { field: keyof WhaleData }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDirection === "desc" ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
          </svg>
        )
      ) : (
        <svg className="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      )}
    </span>
  );

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl p-4">
        <div className="h-6 bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tags
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("volume")}
              >
                Volume <SortIcon field="volume" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("movements")}
              >
                Movements <SortIcon field="movements" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400"
                onClick={() => handleSort("influenceScore")}
              >
                Influence <SortIcon field="influenceScore" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Risk
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedWhales.map((whale, index) => (
              <tr
                key={whale.address}
                onClick={() => onWhaleClick(whale)}
                className="hover:bg-slate-700/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-gray-500 font-mono">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-cyan-400 font-mono text-sm hover:underline">
                      {whale.address}
                    </span>
                    {whale.label && (
                      <span className="text-xs text-gray-500">{whale.label}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {whale.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-slate-700 text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {whale.tags.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-gray-500 rounded-full">
                        +{whale.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-green-400 font-medium">
                    {formatVolume(whale.volume)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-blue-400">{whale.movements.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${whale.influenceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {whale.influenceScore.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(
                      whale.risk
                    )}`}
                  >
                    {whale.risk.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, whales.length)} of {whales.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700 text-gray-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700 text-gray-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WhaleTable);
