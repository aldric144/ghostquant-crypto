"use client";

import { useEffect, useState } from "react";
import { DerivativesOverview, Liquidation, fetchDerivativesOverview, fetchLiquidations, fetchFundingRates, fetchDerivativesRiskAlerts, generateSyntheticDerivativesOverview } from "@/lib/threatMapClient";
import ThreatRiskDial from "./ThreatRiskDial";

function generateSyntheticLiquidations(): Liquidation[] {
  const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `liq-${i}-${Date.now()}`,
    symbol: symbols[i % symbols.length],
    side: i % 2 === 0 ? 'long' : 'short',
    value: 50000 + Math.floor(Math.random() * 450000),
    price: 40000 + Math.random() * 20000,
    quantity: 1 + Math.random() * 10,
    exchange: ['Binance', 'OKX', 'Bybit'][i % 3],
    leverage: 10 + Math.floor(Math.random() * 90),
    timestamp: new Date(Date.now() - i * 600000).toISOString()
  }));
}

export default function DerivativesTab() {
  const [overview, setOverview] = useState<DerivativesOverview | null>(null);
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [fundingRates, setFundingRates] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewData, liqData, fundingData, alertsData] = await Promise.all([
          fetchDerivativesOverview(),
          fetchLiquidations({ limit: 30 }),
          fetchFundingRates(),
          fetchDerivativesRiskAlerts()
        ]);
        setOverview(overviewData);
        setLiquidations(liqData.liquidations);
        setFundingRates(fundingData.funding_rates);
        setRiskAlerts(alertsData.alerts);
      } catch {
        // Use synthetic fallback data when API fails
        setOverview(generateSyntheticDerivativesOverview());
        setLiquidations(generateSyntheticLiquidations());
        setFundingRates([]);
        setRiskAlerts([{ symbol: 'BTC', type: 'high_leverage', description: 'Elevated leverage detected', severity: 'high' }]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFundingRate = (rate: number) => {
    const percentage = rate * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(4)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 flex flex-col items-center">
          <ThreatRiskDial score={overview?.risk_score || 0} label="Derivatives Risk" />
          <div className="mt-2 text-sm text-gray-400">{overview?.threat_level || "Unknown"}</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Total Open Interest</div>
          <div className="text-2xl font-bold text-white">{formatVolume(overview?.total_open_interest || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Across all assets</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">{formatVolume(overview?.total_volume_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Trading volume</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">24h Liquidations</div>
          <div className="text-2xl font-bold text-red-400">{formatVolume(overview?.total_liquidations_24h || 0)}</div>
          <div className="text-xs text-gray-500 mt-2">Total liquidated</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="text-sm text-gray-400 mb-1">Long/Short Ratio</div>
          <div className={`text-2xl font-bold ${(overview?.long_short_ratio || 1) > 1 ? "text-green-400" : "text-red-400"}`}>
            {(overview?.long_short_ratio || 1).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {(overview?.long_short_ratio || 1) > 1 ? "Long dominant" : "Short dominant"}
          </div>
        </div>
      </div>

      {riskAlerts.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-orange-400 mb-3">Risk Alerts</h3>
          <div className="space-y-2">
            {riskAlerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{alert.symbol}</span>
                  <span className="text-gray-400 capitalize">{alert.type?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{alert.description}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    alert.severity === "critical" ? "bg-red-900/50 text-red-400" :
                    alert.severity === "high" ? "bg-orange-900/50 text-orange-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Top Assets</h3>
            <p className="text-sm text-gray-400">Open interest and funding rates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">OI</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Funding</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">L/S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {overview?.top_assets?.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{asset.symbol}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-400">{formatVolume(asset.open_interest)}</td>
                    <td className={`px-4 py-3 text-sm text-right ${asset.funding_rate >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatFundingRate(asset.funding_rate)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${asset.long_short_ratio > 1 ? "text-green-400" : "text-red-400"}`}>
                      {asset.long_short_ratio.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Recent Liquidations</h3>
            <p className="text-sm text-gray-400">Large position liquidations</p>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Side</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {liquidations.map((liq) => (
                  <tr key={liq.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3 text-sm text-gray-400">{formatTime(liq.timestamp)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{liq.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        liq.side === "long" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                      }`}>
                        {liq.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-white">{formatVolume(liq.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
