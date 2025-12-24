"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useIntelFeed } from "@/hooks/useIntelFeed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: string;
  severity: "high" | "medium" | "low";
  score: number;
  message: string;
  token?: string;
  wallet?: string;
  chain?: string;
  riskType?: string;
  source?: string;
  intelligence?: Record<string, unknown>;
  isNew: boolean;
  synthetic?: boolean;
}

function generateSyntheticTimelineEvents(): TimelineEvent[] {
  const now = Date.now();
  return [
    {
      id: 'syn-whale-1',
      timestamp: now - 60000,
      type: 'whale_movement',
      severity: 'high',
      score: 0.87,
      message: 'Large BTC transfer detected: 2,500 BTC moved from dormant wallet to Binance hot wallet',
      token: 'BTC',
      wallet: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      chain: 'bitcoin',
      riskType: 'whale',
      source: 'synthetic',
      intelligence: { amount: 2500, destination: 'binance' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-manipulation-1',
      timestamp: now - 180000,
      type: 'manipulation_alert',
      severity: 'high',
      score: 0.82,
      message: 'Potential wash trading detected on PEPE/USDT pair with coordinated volume spikes',
      token: 'PEPE',
      chain: 'ethereum',
      riskType: 'manipulation',
      source: 'synthetic',
      intelligence: { pattern: 'wash_trading', confidence: 0.82 },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-risk-1',
      timestamp: now - 300000,
      type: 'risk_score_change',
      severity: 'medium',
      score: 0.65,
      message: 'SOL risk score elevated from 42 to 67 due to increased volatility and leverage positions',
      token: 'SOL',
      chain: 'solana',
      riskType: 'risk',
      source: 'synthetic',
      intelligence: { previous_score: 42, new_score: 67 },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-crosschain-1',
      timestamp: now - 480000,
      type: 'cross_chain_activity',
      severity: 'medium',
      score: 0.58,
      message: 'Large cross-chain bridge activity: $15M USDC bridged from Ethereum to Arbitrum',
      token: 'USDC',
      chain: 'ethereum',
      riskType: 'bridge',
      source: 'synthetic',
      intelligence: { amount_usd: 15000000, destination_chain: 'arbitrum' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-entity-1',
      timestamp: now - 720000,
      type: 'entity_behavior_shift',
      severity: 'medium',
      score: 0.61,
      message: 'Known accumulator wallet changed behavior: shifted from DeFi to CEX deposits',
      wallet: '0xdeadbeef1234567890abcdef1234567890abcdef',
      chain: 'ethereum',
      riskType: 'entity',
      source: 'synthetic',
      intelligence: { behavior_change: 'defi_to_cex' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-predictive-1',
      timestamp: now - 1200000,
      type: 'predictive_signal',
      severity: 'low',
      score: 0.45,
      message: 'GhostMind AI predicts 73% probability of ETH breakout above $2,400 within 24h',
      token: 'ETH',
      chain: 'ethereum',
      riskType: 'ai',
      source: 'synthetic',
      intelligence: { prediction: 'bullish_breakout', probability: 0.73, target: 2400 },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-anomaly-1',
      timestamp: now - 1800000,
      type: 'network_anomaly',
      severity: 'medium',
      score: 0.55,
      message: 'Unusual mempool congestion detected on Ethereum with 45% increase in pending transactions',
      chain: 'ethereum',
      riskType: 'network',
      source: 'synthetic',
      intelligence: { congestion_increase: 0.45 },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-governance-1',
      timestamp: now - 2400000,
      type: 'governance_alert',
      severity: 'low',
      score: 0.38,
      message: 'Major governance proposal submitted for Uniswap: Fee switch activation vote scheduled',
      token: 'UNI',
      chain: 'ethereum',
      riskType: 'governance',
      source: 'synthetic',
      intelligence: { proposal_type: 'fee_switch', protocol: 'uniswap' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-darkpool-1',
      timestamp: now - 3600000,
      type: 'darkpool_activity',
      severity: 'medium',
      score: 0.52,
      message: 'Institutional block trade executed: $8.5M BTC OTC transaction detected off-exchange',
      token: 'BTC',
      chain: 'bitcoin',
      riskType: 'darkpool',
      source: 'synthetic',
      intelligence: { amount_usd: 8500000, trade_type: 'otc' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-stablecoin-1',
      timestamp: now - 5400000,
      type: 'stablecoin_flow',
      severity: 'low',
      score: 0.42,
      message: 'Large USDT mint detected: 500M USDT minted on Tron network by Tether Treasury',
      token: 'USDT',
      chain: 'tron',
      riskType: 'stablecoin',
      source: 'synthetic',
      intelligence: { amount: 500000000, action: 'mint' },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-whale-2',
      timestamp: now - 7200000,
      type: 'whale_movement',
      severity: 'high',
      score: 0.79,
      message: 'Whale wallet activated after 18 months dormancy: 15,000 ETH moved to unknown address',
      token: 'ETH',
      wallet: '0xabcdef1234567890abcdef1234567890abcdef12',
      chain: 'ethereum',
      riskType: 'whale',
      source: 'synthetic',
      intelligence: { dormancy_months: 18, amount: 15000 },
      isNew: false,
      synthetic: true
    },
    {
      id: 'syn-derivatives-1',
      timestamp: now - 10800000,
      type: 'derivatives_alert',
      severity: 'medium',
      score: 0.68,
      message: 'Elevated funding rates on BTC perpetuals: 0.15% per 8h indicating overleveraged longs',
      token: 'BTC',
      chain: 'ethereum',
      riskType: 'derivatives',
      source: 'synthetic',
      intelligence: { funding_rate: 0.0015, direction: 'long' },
      isNew: false,
      synthetic: true
    }
  ];
}

interface AllEventsTabProps {
  timeWindow: string;
}

const severityColors = {
  high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
};

const getEventColor = (type: string): string => {
  const typeStr = type.toLowerCase();
  if (typeStr.includes("manipulation")) return "#ef4444";
  if (typeStr.includes("whale")) return "#06b6d4";
  if (typeStr.includes("ai") || typeStr.includes("signal")) return "#fbbf24";
  if (typeStr.includes("stablecoin")) return "#10b981";
  if (typeStr.includes("derivative")) return "#f97316";
  if (typeStr.includes("billionaire") || typeStr.includes("institution")) return "#a855f7";
  if (typeStr.includes("darkpool")) return "#6366f1";
  return "#06b6d4";
};

const getEventIcon = (type: string): string => {
  const typeStr = type.toLowerCase();
  if (typeStr.includes("whale")) return "\u{1F40B}";
  if (typeStr.includes("manipulation")) return "\u26A0\uFE0F";
  if (typeStr.includes("ai") || typeStr.includes("signal")) return "\u{1F916}";
  if (typeStr.includes("stablecoin")) return "\u{1F4B5}";
  if (typeStr.includes("derivative")) return "\u{1F4CA}";
  if (typeStr.includes("billionaire")) return "\u{1F48E}";
  if (typeStr.includes("institution")) return "\u{1F3DB}\uFE0F";
  if (typeStr.includes("darkpool")) return "\u{1F576}\uFE0F";
  return "\u{1F4E1}";
};

export default function AllEventsTab({ timeWindow }: AllEventsTabProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyntheticMode, setIsSyntheticMode] = useState(false);

  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        "/unified-risk/events",
        "/manipulation/events",
        "/darkpool/events",
        "/stablecoin/events",
        "/derivatives/events",
        "/whale-intel/events",
      ];

      const windowParam = timeWindow ? `?window=${timeWindow}` : "";

      const responses = await Promise.allSettled(
        endpoints.map((endpoint) =>
          fetch(`${API_BASE}${endpoint}${windowParam}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );

      const allEvents: TimelineEvent[] = [];

      responses.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          const data = result.value;
          const eventList = Array.isArray(data) ? data : data.events || [];
          const source = endpoints[index].split("/")[1];

          eventList.forEach((event: Record<string, unknown>, i: number) => {
            const score = (event.score as number) || (event.risk_score as number) || 0;
            const severity: "high" | "medium" | "low" =
              score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";

            allEvents.push({
              id: `${source}-${i}-${Date.now()}`,
              timestamp: event.timestamp
                ? new Date(event.timestamp as string).getTime()
                : Date.now() - i * 60000,
              type: (event.event_type as string) || (event.type as string) || source,
              severity,
              score,
              message:
                (event.message as string) ||
                (event.description as string) ||
                `${source} event detected`,
              token: event.token as string | undefined,
              wallet: (event.wallet as string) || (event.address as string) || undefined,
              chain: event.chain as string | undefined,
              riskType: (event.risk_type as string) || source,
              source,
              intelligence: event,
              isNew: false,
            });
          });
        }
      });

      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      
      // If no live events, inject synthetic events to maintain continuity
      if (allEvents.length === 0) {
        const syntheticEvents = generateSyntheticTimelineEvents();
        setEvents(syntheticEvents);
        setIsSyntheticMode(true);
      } else {
        setEvents(allEvents.slice(0, 500));
        setIsSyntheticMode(false);
      }
    } catch {
      // Use synthetic fallback data when API fails
      const syntheticEvents = generateSyntheticTimelineEvents();
      setEvents(syntheticEvents);
      setIsSyntheticMode(true);
    } finally {
      setLoading(false);
    }
  }, [timeWindow]);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => {
    if (!latestAlert) return;

    const alertType =
      latestAlert.intelligence?.event?.event_type || latestAlert.type || "alert";
    const score = latestAlert.score || 0;
    const severity: "high" | "medium" | "low" =
      score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";

    const newEvent: TimelineEvent = {
      id: `live-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type: alertType,
      severity,
      score,
      message: alertType,
      token: latestAlert.intelligence?.event?.token || undefined,
      wallet: latestAlert.intelligence?.entity?.entity_id || undefined,
      chain: latestAlert.intelligence?.event?.chain || undefined,
      riskType: latestAlert.intelligence?.event?.risk_type || "live",
      source: "live",
      intelligence: latestAlert.intelligence,
      isNew: true,
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 500));

    setTimeout(() => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === newEvent.id ? { ...event, isNew: false } : event
        )
      );
    }, 3000);
  }, [latestAlert]);

  useEffect(() => {
    if (alertHistory && alertHistory.length > 0 && events.length === 0) {
      const initialEvents: TimelineEvent[] = alertHistory.map((alert, index) => {
        const alertType =
          alert.intelligence?.event?.event_type || alert.type || "alert";
        const score = alert.score || 0;
        const severity: "high" | "medium" | "low" =
          score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";

        return {
          id: `init-${index}`,
          timestamp: Date.now() - index * 60000,
          type: alertType,
          severity,
          score,
          message: alertType,
          token: alert.intelligence?.event?.token || undefined,
          wallet: alert.intelligence?.entity?.entity_id || undefined,
          chain: alert.intelligence?.event?.chain || undefined,
          riskType: alert.intelligence?.event?.risk_type || "history",
          source: "history",
          intelligence: alert.intelligence,
          isNew: false,
        };
      });

      setEvents((prev) => [...initialEvents, ...prev].slice(0, 500));
    }
  }, [alertHistory, events.length]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.message.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.token?.toLowerCase().includes(query) ||
        event.wallet?.toLowerCase().includes(query) ||
        event.chain?.toLowerCase().includes(query) ||
        event.riskType?.toLowerCase().includes(query) ||
        event.severity.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const groupedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.getTime();

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisWeekStart = thisWeek.getTime();

    const groups: { [key: string]: TimelineEvent[] } = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Older: [],
    };

    filteredEvents.forEach((event) => {
      if (event.timestamp >= todayStart) {
        groups["Today"].push(event);
      } else if (event.timestamp >= yesterdayStart) {
        groups["Yesterday"].push(event);
      } else if (event.timestamp >= thisWeekStart) {
        groups["This Week"].push(event);
      } else {
        groups["Older"].push(event);
      }
    });

    return groups;
  }, [filteredEvents]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* SYNTHETIC MODE Badge */}
      {isSyntheticMode && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-amber-400">SYNTHETIC MODE</span>
          </div>
          <div className="group relative">
            <svg className="w-4 h-4 text-amber-400/70 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute left-0 top-6 w-72 p-3 bg-slate-800 border border-amber-500/30 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
              Timeline is displaying synthesized intelligence to maintain continuity when live signals are unavailable. Events are representative of typical GhostQuant intelligence patterns.
            </div>
          </div>
          <span className="text-xs text-amber-400/70">
            Displaying synthesized intelligence events
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              connectionStatus === "connected"
                ? "bg-green-500/20 text-green-400"
                : isSyntheticMode
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : isSyntheticMode
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-xs font-medium">
              {connectionStatus === "connected" ? "Live" : isSyntheticMode ? "Synthetic" : "Disconnected"}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {filteredEvents.length} events
          </span>
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by token, wallet, chain, message, risk type, severity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
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
      </div>

      {filteredEvents.length === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center h-64 text-center py-12">
          <svg
            className="w-16 h-16 text-gray-600 mb-4"
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
          <p className="text-gray-500 text-lg">No matching events</p>
          <p className="text-gray-600 text-sm mt-2">
            Try adjusting your search query: &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([groupName, groupEvents]) => {
            if (groupEvents.length === 0) return null;

            return (
              <div key={groupName}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-cyan-400">{groupName}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                  <span className="text-xs text-gray-500">
                    {groupEvents.length} events
                  </span>
                </div>

                <div className="relative pl-8 space-y-4">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />

                  {groupEvents.map((event) => {
                    const color = getEventColor(event.type);
                    const icon = getEventIcon(event.type);
                    const severityStyle = severityColors[event.severity];

                    return (
                      <div
                        key={event.id}
                        className={`relative transition-all duration-500 ${
                          event.isNew
                            ? "animate-pulse"
                            : "opacity-100"
                        }`}
                      >
                        <div
                          className="absolute left-[-1.75rem] top-3 w-4 h-4 rounded-full border-2 border-slate-950 z-10"
                          style={{ backgroundColor: color }}
                        />

                        <div
                          className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4 hover:border-cyan-500/30 transition-all ${
                            event.isNew ? "shadow-lg shadow-cyan-500/20" : ""
                          }`}
                          style={{ borderColor: `${color}20` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0">{icon}</div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className="text-xs px-2 py-0.5 rounded font-medium"
                                  style={{
                                    backgroundColor: `${color}20`,
                                    color: color,
                                  }}
                                >
                                  {event.type}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${severityStyle.bg} ${severityStyle.text}`}
                                >
                                  {event.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                                {event.isNew && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-300 mb-2">
                                {event.message}
                              </p>

                              {(event.token || event.chain || event.wallet) && (
                                <div className="flex flex-wrap gap-3 text-xs">
                                  {event.token && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Token:</span>
                                      <span className="text-cyan-400 font-medium">
                                        {event.token}
                                      </span>
                                    </div>
                                  )}
                                  {event.chain && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Chain:</span>
                                      <span className="text-cyan-400 font-medium">
                                        {event.chain}
                                      </span>
                                    </div>
                                  )}
                                  {event.wallet && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Wallet:</span>
                                      <span className="text-cyan-400 font-mono text-xs">
                                        {event.wallet.substring(0, 8)}...
                                        {event.wallet.substring(event.wallet.length - 6)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${event.score * 100}%`,
                                      backgroundColor: color,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 font-mono">
                                  {(event.score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
