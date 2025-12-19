"use client";

import { ThreatHeatmapData } from "@/lib/threatMapClient";

interface ThreatHeatmapProps {
  data: ThreatHeatmapData[];
  categories: string[];
}

export default function ThreatHeatmap({ data, categories }: ThreatHeatmapProps) {
  const getHeatColor = (value: number) => {
    if (value >= 80) return "bg-red-600";
    if (value >= 60) return "bg-orange-500";
    if (value >= 40) return "bg-yellow-500";
    if (value >= 20) return "bg-green-500";
    return "bg-blue-500";
  };

  const getTextColor = (value: number) => {
    if (value >= 80) return "text-red-400";
    if (value >= 60) return "text-orange-400";
    if (value >= 40) return "text-yellow-400";
    if (value >= 20) return "text-green-400";
    return "text-blue-400";
  };

  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Threat Heatmap</h3>
        <p className="text-sm text-gray-400">Risk scores by asset and category</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              {categories.map((cat) => (
                <th
                  key={cat}
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {formatCategory(cat)}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Overall
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((row) => (
              <tr key={row.symbol} className="hover:bg-slate-700/30 transition">
                <td className="px-4 py-3">
                  <span className="font-semibold text-white">{row.symbol}</span>
                </td>
                {categories.map((cat) => {
                  const value = row[cat as keyof ThreatHeatmapData] as number;
                  return (
                    <td key={cat} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getHeatColor(value)} bg-opacity-30`}
                        >
                          <span className={`text-sm font-semibold ${getTextColor(value)}`}>
                            {Math.round(value)}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-12 h-10 rounded-lg flex items-center justify-center ${getHeatColor(row.overall)} bg-opacity-40`}
                    >
                      <span className={`text-sm font-bold ${getTextColor(row.overall)}`}>
                        {Math.round(row.overall)}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-700 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500 bg-opacity-30"></div>
          <span className="text-xs text-gray-400">0-20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 bg-opacity-30"></div>
          <span className="text-xs text-gray-400">20-40</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500 bg-opacity-30"></div>
          <span className="text-xs text-gray-400">40-60</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500 bg-opacity-30"></div>
          <span className="text-xs text-gray-400">60-80</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600 bg-opacity-30"></div>
          <span className="text-xs text-gray-400">80-100</span>
        </div>
      </div>
    </div>
  );
}
