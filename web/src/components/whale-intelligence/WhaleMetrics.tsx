"use client";

import { memo, useMemo } from "react";
import type { WhaleData, WhaleMovement } from "./index";

interface WhaleMetricsProps {
  whales: WhaleData[];
  movements: WhaleMovement[];
  isLoading: boolean;
}

function MetricCard({
  label,
  value,
  subValue,
  icon,
  color = "cyan",
  isLoading,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: "cyan" | "green" | "yellow" | "red" | "purple" | "blue";
  isLoading?: boolean;
}) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 shadow-cyan-500/10",
    green: "from-green-500/20 to-green-600/10 border-green-500/30 shadow-green-500/10",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 shadow-yellow-500/10",
    red: "from-red-500/20 to-red-600/10 border-red-500/30 shadow-red-500/10",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 shadow-purple-500/10",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 shadow-blue-500/10",
  };

  const textColors = {
    cyan: "text-cyan-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
    blue: "text-blue-400",
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-slate-700 rounded w-32 mb-1"></div>
        <div className="h-3 bg-slate-700 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 shadow-lg transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={textColors[color]}>{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${textColors[color]} animate-countUp`}>
        {value}
      </div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
  );
}

function WhaleMetrics({ whales, movements, isLoading }: WhaleMetricsProps) {
  const metrics = useMemo(() => {
    const totalVolume = whales.reduce((sum, w) => sum + w.volume, 0);
    const totalMovements = whales.reduce((sum, w) => sum + w.movements, 0);
    const recentMovements = movements.filter(
      (m) => new Date().getTime() - m.timestamp.getTime() < 300000
    ).length;
    const highRiskCount = whales.filter((w) => w.risk === "high").length;

    return {
      whalesTracked: whales.length,
      totalVolume,
      totalMovements,
      recentActivity: recentMovements,
      highRiskWhales: highRiskCount,
      avgInfluence: whales.length > 0
        ? whales.reduce((sum, w) => sum + w.influenceScore, 0) / whales.length
        : 0,
    };
  }, [whales, movements]);

  const formatVolume = (vol: number): string => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        label="Whales Tracked"
        value={metrics.whalesTracked}
        subValue="Active entities"
        color="cyan"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      <MetricCard
        label="Total Volume"
        value={formatVolume(metrics.totalVolume)}
        subValue="All-time tracked"
        color="green"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <MetricCard
        label="Total Movements"
        value={metrics.totalMovements.toLocaleString()}
        subValue="Transactions tracked"
        color="blue"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />

      <MetricCard
        label="Recent Activity"
        value={metrics.recentActivity}
        subValue="Last 5 minutes"
        color="purple"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <MetricCard
        label="High Risk Whales"
        value={metrics.highRiskWhales}
        subValue="Requires attention"
        color="red"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <MetricCard
        label="Avg Influence"
        value={metrics.avgInfluence.toFixed(1)}
        subValue="Influence score"
        color="yellow"
        isLoading={isLoading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        }
      />
    </div>
  );
}

export default memo(WhaleMetrics);
