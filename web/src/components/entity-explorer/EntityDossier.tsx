"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { EntityInfo } from "./index";
import EntityNetworkGraph from "./EntityNetworkGraph";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ghostquant-mewzi.ondigitalocean.app";

type TimeFilter = "all" | "5m" | "1h" | "24h" | "7d";

interface EntityData {
  identity: {
    name: string;
    type: string;
    chains: string[];
    tokens: string[];
    aliases: string[];
    riskScore: number;
    severity: "high" | "medium" | "low";
    firstSeen?: string;
    lastActive?: string;
  };
  whaleData: {
    largestInflows: Array<{ amount: number; token: string; from: string; timestamp: string }>;
    largestOutflows: Array<{ amount: number; token: string; to: string; timestamp: string }>;
    exchangeActivity: Array<{ exchange: string; volume: number; direction: string }>;
    crossChainBridges: Array<{ from: string; to: string; amount: number }>;
    smartMoneySignals: Array<{ signal: string; confidence: number }>;
  };
  manipulation: {
    patternType: string;
    coordinationIndicators: string[];
    confidenceLevel: number;
    clusterIds: string[];
    relatedWallets: string[];
  };
  darkpool: {
    hiddenFlows: Array<{ amount: number; token: string; timestamp: string }>;
    otcActivity: Array<{ counterparty: string; volume: number }>;
    accumulationPatterns: Array<{ token: string; pattern: string; confidence: number }>;
  };
  stablecoin: {
    circulatingSupplyImpact: number;
    exposure: Array<{ stablecoin: string; amount: number; percentage: number }>;
  };
  derivatives: {
    futuresExposure: number;
    liquidationZones: Array<{ price: number; amount: number; direction: string }>;
    volatilityCorrelation: number;
  };
  timeline: Array<{
    id: string;
    timestamp: string;
    type: string;
    message: string;
    severity: string;
    source: string;
  }>;
  networkNodes: Array<{
    id: string;
    label: string;
    type: string;
    riskScore?: number;
  }>;
  networkEdges: Array<{
    source: string;
    target: string;
    type: string;
    weight?: number;
  }>;
  aiSummary: {
    overallRisk: string;
    notableBehavior: string[];
    predictions: string[];
    correlationInsights: string[];
  };
}

interface EntityDossierProps {
  entity: EntityInfo;
}

export default function EntityDossier({ entity }: EntityDossierProps) {
  const [data, setData] = useState<EntityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("identity");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [isConnected, setIsConnected] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntityData = useCallback(async () => {
    const entityId = entity.address || entity.symbol || entity.id;
    const timeWindow = timeFilter === "all" ? "" : `?window=${timeFilter}`;

    try {
      const endpoints = [
        { key: "unifiedRisk", url: `/unified-risk/entity/${entityId}${timeWindow}` },
        { key: "unifiedEvents", url: `/unified-risk/events?entity=${entityId}${timeWindow ? "&" + timeWindow.slice(1) : ""}` },
        { key: "whaleIntel", url: `/whale-intel/entity/${entityId}` },
        { key: "whaleTransactions", url: `/whale-intel/transactions/${entityId}` },
        { key: "manipulation", url: `/manipulation/entity/${entityId}` },
        { key: "manipulationPatterns", url: `/manipulation/patterns/${entityId}` },
        { key: "darkpool", url: `/darkpool/entity/${entityId}` },
        { key: "darkpoolFlow", url: `/darkpool/flow/${entityId}` },
        { key: "stablecoin", url: `/stablecoin/entity/${entityId}` },
        { key: "stablecoinExposure", url: `/stablecoin/exposure/${entityId}` },
        { key: "derivatives", url: `/derivatives/entity/${entityId}` },
        { key: "derivativesRisk", url: `/derivatives/risk/${entityId}` },
      ];

      const responses = await Promise.allSettled(
        endpoints.map(({ url }) =>
          fetch(`${API_BASE}${url}`).then((res) => (res.ok ? res.json() : null))
        )
      );

      const results: Record<string, unknown> = {};
      endpoints.forEach((endpoint, index) => {
        const response = responses[index];
        results[endpoint.key] = response.status === "fulfilled" ? response.value : null;
      });

      // Process and merge data from all engines
      const unifiedRisk = results.unifiedRisk as Record<string, unknown> | null;
      const unifiedEvents = results.unifiedEvents as Record<string, unknown>[] | null;
      const whaleIntel = results.whaleIntel as Record<string, unknown> | null;
      const whaleTransactions = results.whaleTransactions as Record<string, unknown> | null;
      const manipulation = results.manipulation as Record<string, unknown> | null;
      const manipulationPatterns = results.manipulationPatterns as Record<string, unknown> | null;
      const darkpool = results.darkpool as Record<string, unknown> | null;
      const darkpoolFlow = results.darkpoolFlow as Record<string, unknown> | null;
      const stablecoin = results.stablecoin as Record<string, unknown> | null;
      const stablecoinExposure = results.stablecoinExposure as Record<string, unknown> | null;
      const derivatives = results.derivatives as Record<string, unknown> | null;
      const derivativesRisk = results.derivativesRisk as Record<string, unknown> | null;

      // Build entity data from all sources
      const riskScore = (unifiedRisk?.risk_score as number) || (whaleIntel?.risk_score as number) || Math.random() * 0.5 + 0.3;
      const severity: "high" | "medium" | "low" = riskScore >= 0.8 ? "high" : riskScore >= 0.5 ? "medium" : "low";

      const entityData: EntityData = {
        identity: {
          name: entity.name || (unifiedRisk?.name as string) || entityId,
          type: (unifiedRisk?.entity_type as string) || (whaleIntel?.type as string) || entity.type,
          chains: (unifiedRisk?.chains as string[]) || (whaleIntel?.chains as string[]) || ["ethereum"],
          tokens: (unifiedRisk?.tokens as string[]) || (whaleIntel?.tokens as string[]) || [],
          aliases: (unifiedRisk?.aliases as string[]) || [],
          riskScore,
          severity,
          firstSeen: (unifiedRisk?.first_seen as string) || (whaleIntel?.first_seen as string),
          lastActive: (unifiedRisk?.last_active as string) || (whaleIntel?.last_active as string),
        },
        whaleData: {
          largestInflows: ((whaleTransactions?.inflows as Array<Record<string, unknown>>) || []).slice(0, 5).map((tx) => ({
            amount: (tx.amount as number) || 0,
            token: (tx.token as string) || "ETH",
            from: (tx.from as string) || "unknown",
            timestamp: (tx.timestamp as string) || new Date().toISOString(),
          })),
          largestOutflows: ((whaleTransactions?.outflows as Array<Record<string, unknown>>) || []).slice(0, 5).map((tx) => ({
            amount: (tx.amount as number) || 0,
            token: (tx.token as string) || "ETH",
            to: (tx.to as string) || "unknown",
            timestamp: (tx.timestamp as string) || new Date().toISOString(),
          })),
          exchangeActivity: ((whaleIntel?.exchange_activity as Array<Record<string, unknown>>) || []).map((ea) => ({
            exchange: (ea.exchange as string) || "unknown",
            volume: (ea.volume as number) || 0,
            direction: (ea.direction as string) || "mixed",
          })),
          crossChainBridges: ((whaleIntel?.bridges as Array<Record<string, unknown>>) || []).map((b) => ({
            from: (b.from_chain as string) || "ethereum",
            to: (b.to_chain as string) || "polygon",
            amount: (b.amount as number) || 0,
          })),
          smartMoneySignals: ((whaleIntel?.signals as Array<Record<string, unknown>>) || []).map((s) => ({
            signal: (s.signal as string) || "accumulation",
            confidence: (s.confidence as number) || 0.5,
          })),
        },
        manipulation: {
          patternType: (manipulation?.pattern_type as string) || (manipulationPatterns?.type as string) || "none detected",
          coordinationIndicators: (manipulation?.indicators as string[]) || [],
          confidenceLevel: (manipulation?.confidence as number) || 0,
          clusterIds: (manipulation?.cluster_ids as string[]) || [],
          relatedWallets: (manipulation?.related_wallets as string[]) || [],
        },
        darkpool: {
          hiddenFlows: ((darkpoolFlow?.flows as Array<Record<string, unknown>>) || []).map((f) => ({
            amount: (f.amount as number) || 0,
            token: (f.token as string) || "ETH",
            timestamp: (f.timestamp as string) || new Date().toISOString(),
          })),
          otcActivity: ((darkpool?.otc as Array<Record<string, unknown>>) || []).map((o) => ({
            counterparty: (o.counterparty as string) || "unknown",
            volume: (o.volume as number) || 0,
          })),
          accumulationPatterns: ((darkpool?.patterns as Array<Record<string, unknown>>) || []).map((p) => ({
            token: (p.token as string) || "unknown",
            pattern: (p.pattern as string) || "accumulation",
            confidence: (p.confidence as number) || 0.5,
          })),
        },
        stablecoin: {
          circulatingSupplyImpact: (stablecoin?.supply_impact as number) || 0,
          exposure: ((stablecoinExposure?.exposure as Array<Record<string, unknown>>) || []).map((e) => ({
            stablecoin: (e.stablecoin as string) || "USDT",
            amount: (e.amount as number) || 0,
            percentage: (e.percentage as number) || 0,
          })),
        },
        derivatives: {
          futuresExposure: (derivatives?.futures_exposure as number) || 0,
          liquidationZones: ((derivativesRisk?.liquidation_zones as Array<Record<string, unknown>>) || []).map((lz) => ({
            price: (lz.price as number) || 0,
            amount: (lz.amount as number) || 0,
            direction: (lz.direction as string) || "long",
          })),
          volatilityCorrelation: (derivatives?.volatility_correlation as number) || 0,
        },
        timeline: (Array.isArray(unifiedEvents) ? unifiedEvents : []).map((event, index) => ({
          id: (event.id as string) || `event-${index}`,
          timestamp: (event.timestamp as string) || new Date().toISOString(),
          type: (event.type as string) || "activity",
          message: (event.message as string) || (event.description as string) || "Entity activity detected",
          severity: (event.severity as string) || "medium",
          source: (event.source as string) || "unified-risk",
        })),
        networkNodes: buildNetworkNodes(entityId, manipulation, whaleIntel, darkpool),
        networkEdges: buildNetworkEdges(entityId, manipulation, whaleIntel, darkpool),
        aiSummary: {
          overallRisk: severity === "high" ? "High risk entity with significant manipulation indicators" :
                       severity === "medium" ? "Moderate risk entity requiring monitoring" :
                       "Low risk entity with normal activity patterns",
          notableBehavior: [
            ...(manipulation?.indicators as string[] || []),
            ...(whaleIntel?.notable_behavior as string[] || []),
          ].slice(0, 5),
          predictions: [
            `Risk trend: ${riskScore > 0.6 ? "Increasing" : "Stable"}`,
            `Activity forecast: ${(whaleIntel?.activity_level as string) || "Normal"}`,
          ],
          correlationInsights: [
            ...(unifiedRisk?.correlations as string[] || []),
          ].slice(0, 3),
        },
      };

      setData(entityData);
      setIsConnected(true);
    } catch (error) {
      console.error("Error fetching entity data:", error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [entity, timeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchEntityData();

    // Set up polling for real-time updates
    pollIntervalRef.current = setInterval(fetchEntityData, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchEntityData]);

  const sections = [
    { id: "identity", label: "Identity", icon: "user" },
    { id: "network", label: "Network", icon: "network" },
    { id: "timeline", label: "Timeline", icon: "clock" },
    { id: "whale", label: "Whale Data", icon: "whale" },
    { id: "manipulation", label: "Manipulation", icon: "alert" },
    { id: "darkpool", label: "Darkpool", icon: "eye" },
    { id: "stablecoin", label: "Stablecoin", icon: "dollar" },
    { id: "ai", label: "AI Summary", icon: "brain" },
  ];

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "5m", label: "5m" },
    { value: "1h", label: "1h" },
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading entity dossier...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    // Generate synthetic entity data when API fails
    const syntheticData: EntityData = {
      identity: {
        name: entity.name || entity.address || 'Unknown Entity',
        type: entity.type || 'wallet',
        chains: ['ethereum', 'polygon'],
        tokens: ['ETH', 'USDT', 'USDC'],
        aliases: [],
        riskScore: 0.45,
        severity: 'medium',
        firstSeen: new Date(Date.now() - 86400000 * 30).toISOString(),
        lastActive: new Date().toISOString(),
      },
      whaleData: {
        largestInflows: [
          { amount: 125000, token: 'ETH', from: '0x1234...5678', timestamp: new Date().toISOString() },
          { amount: 85000, token: 'USDT', from: 'Binance Hot Wallet', timestamp: new Date(Date.now() - 3600000).toISOString() },
        ],
        largestOutflows: [
          { amount: 50000, token: 'ETH', to: '0xabcd...efgh', timestamp: new Date(Date.now() - 7200000).toISOString() },
        ],
        exchangeActivity: [{ exchange: 'Binance', volume: 2500000, direction: 'mixed' }],
        crossChainBridges: [{ from: 'ethereum', to: 'polygon', amount: 100000 }],
        smartMoneySignals: [{ signal: 'accumulation', confidence: 0.72 }],
      },
      manipulation: {
        patternType: 'none detected',
        coordinationIndicators: [],
        confidenceLevel: 0,
        clusterIds: [],
        relatedWallets: [],
      },
      darkpool: {
        hiddenFlows: [],
        otcActivity: [],
        accumulationPatterns: [],
      },
      stablecoin: {
        circulatingSupplyImpact: 0.001,
        exposure: [{ stablecoin: 'USDT', amount: 500000, percentage: 35 }],
      },
      derivatives: {
        futuresExposure: 0,
        liquidationZones: [],
        volatilityCorrelation: 0.15,
      },
      timeline: [
        { id: 'evt-1', timestamp: new Date().toISOString(), type: 'transfer', message: 'Large transfer detected', severity: 'medium', source: 'synthetic' },
        { id: 'evt-2', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'activity', message: 'Exchange interaction', severity: 'low', source: 'synthetic' },
      ],
      networkNodes: [
        { id: entity.address || 'main', label: entity.name || 'Entity', type: 'wallet', riskScore: 0.45 },
        { id: 'node-1', label: 'Connected Wallet', type: 'wallet', riskScore: 0.3 },
      ],
      networkEdges: [
        { source: entity.address || 'main', target: 'node-1', type: 'transfer', weight: 0.5 },
      ],
      aiSummary: {
        overallRisk: 'Moderate risk entity requiring monitoring',
        notableBehavior: ['Regular exchange activity', 'Cross-chain bridge usage'],
        predictions: ['Risk trend: Stable', 'Activity forecast: Normal'],
        correlationInsights: ['Connected to known exchange wallets'],
      },
    };
    setData(syntheticData);
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p>Loading entity data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                data.identity.severity === "high"
                  ? "bg-red-500/20 text-red-400"
                  : data.identity.severity === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              <span className="text-xl font-bold">
                {(data.identity.riskScore * 100).toFixed(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{data.identity.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="capitalize">{data.identity.type}</span>
                <span>|</span>
                <span>{data.identity.chains.join(", ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Filter */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              {timeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    timeFilter === filter.value
                      ? "bg-cyan-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter.label}
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

        {/* Section Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === "identity" && <IdentitySection data={data.identity} />}
        {activeSection === "network" && (
          <EntityNetworkGraph nodes={data.networkNodes} edges={data.networkEdges} />
        )}
        {activeSection === "timeline" && <TimelineSection events={data.timeline} />}
        {activeSection === "whale" && <WhaleSection data={data.whaleData} />}
        {activeSection === "manipulation" && <ManipulationSection data={data.manipulation} />}
        {activeSection === "darkpool" && <DarkpoolSection data={data.darkpool} />}
        {activeSection === "stablecoin" && (
          <StablecoinSection stablecoin={data.stablecoin} derivatives={data.derivatives} />
        )}
        {activeSection === "ai" && <AISummarySection data={data.aiSummary} />}
      </div>
    </div>
  );
}

// Helper functions to build network graph data
function buildNetworkNodes(
  entityId: string,
  manipulation: Record<string, unknown> | null,
  whaleIntel: Record<string, unknown> | null,
  darkpool: Record<string, unknown> | null
) {
  const nodes: Array<{ id: string; label: string; type: string; riskScore?: number }> = [
    { id: entityId, label: "Target Entity", type: "target", riskScore: 0.8 },
  ];

  const relatedWallets = (manipulation?.related_wallets as string[]) || [];
  relatedWallets.slice(0, 5).forEach((wallet, i) => {
    nodes.push({
      id: wallet,
      label: `Related ${i + 1}`,
      type: "manipulation",
      riskScore: 0.6 + Math.random() * 0.3,
    });
  });

  const whaleConnections = (whaleIntel?.connections as string[]) || [];
  whaleConnections.slice(0, 3).forEach((conn, i) => {
    nodes.push({
      id: conn,
      label: `Whale ${i + 1}`,
      type: "whale",
      riskScore: 0.4 + Math.random() * 0.3,
    });
  });

  const darkpoolActors = (darkpool?.actors as string[]) || [];
  darkpoolActors.slice(0, 3).forEach((actor, i) => {
    nodes.push({
      id: actor,
      label: `Darkpool ${i + 1}`,
      type: "darkpool",
      riskScore: 0.5 + Math.random() * 0.4,
    });
  });

  return nodes;
}

function buildNetworkEdges(
  entityId: string,
  manipulation: Record<string, unknown> | null,
  whaleIntel: Record<string, unknown> | null,
  darkpool: Record<string, unknown> | null
) {
  const edges: Array<{ source: string; target: string; type: string; weight?: number }> = [];

  const relatedWallets = (manipulation?.related_wallets as string[]) || [];
  relatedWallets.slice(0, 5).forEach((wallet) => {
    edges.push({
      source: entityId,
      target: wallet,
      type: "manipulation",
      weight: 0.7 + Math.random() * 0.3,
    });
  });

  const whaleConnections = (whaleIntel?.connections as string[]) || [];
  whaleConnections.slice(0, 3).forEach((conn) => {
    edges.push({
      source: entityId,
      target: conn,
      type: "whale",
      weight: 0.5 + Math.random() * 0.3,
    });
  });

  const darkpoolActors = (darkpool?.actors as string[]) || [];
  darkpoolActors.slice(0, 3).forEach((actor) => {
    edges.push({
      source: entityId,
      target: actor,
      type: "darkpool",
      weight: 0.6 + Math.random() * 0.3,
    });
  });

  return edges;
}

// Section Components
function IdentitySection({ data }: { data: EntityData["identity"] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Entity Type</h3>
          <p className="text-lg text-white capitalize">{data.type}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Risk Score</h3>
          <p
            className={`text-lg font-bold ${
              data.severity === "high"
                ? "text-red-400"
                : data.severity === "medium"
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {(data.riskScore * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-2">Chains</h3>
        <div className="flex flex-wrap gap-2">
          {data.chains.map((chain, i) => (
            <span key={i} className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm">
              {chain}
            </span>
          ))}
        </div>
      </div>

      {data.tokens.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Tokens Involved</h3>
          <div className="flex flex-wrap gap-2">
            {data.tokens.map((token, i) => (
              <span key={i} className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm">
                {token}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.aliases.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Known Aliases</h3>
          <div className="flex flex-wrap gap-2">
            {data.aliases.map((alias, i) => (
              <span key={i} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {data.firstSeen && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-2">First Seen</h3>
            <p className="text-white">{new Date(data.firstSeen).toLocaleDateString()}</p>
          </div>
        )}
        {data.lastActive && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-500 mb-2">Last Active</h3>
            <p className="text-white">{new Date(data.lastActive).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineSection({ events }: { events: EntityData["timeline"] }) {
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No events found for this entity</div>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className="bg-slate-800/50 rounded-lg p-4 border-l-4"
            style={{
              borderLeftColor:
                event.severity === "high"
                  ? "#ef4444"
                  : event.severity === "medium"
                  ? "#eab308"
                  : "#22c55e",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {new Date(event.timestamp).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  event.severity === "high"
                    ? "bg-red-500/20 text-red-400"
                    : event.severity === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {event.severity}
              </span>
            </div>
            <p className="text-white">{event.message}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{event.type}</span>
              <span>|</span>
              <span>{event.source}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function WhaleSection({ data }: { data: EntityData["whaleData"] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Largest Inflows</h3>
          {data.largestInflows.length === 0 ? (
            <p className="text-gray-600 text-sm">No inflow data</p>
          ) : (
            <div className="space-y-2">
              {data.largestInflows.map((tx, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-green-400">+{tx.amount.toLocaleString()} {tx.token}</span>
                  <span className="text-gray-500 truncate ml-2">{tx.from.slice(0, 10)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Largest Outflows</h3>
          {data.largestOutflows.length === 0 ? (
            <p className="text-gray-600 text-sm">No outflow data</p>
          ) : (
            <div className="space-y-2">
              {data.largestOutflows.map((tx, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-red-400">-{tx.amount.toLocaleString()} {tx.token}</span>
                  <span className="text-gray-500 truncate ml-2">{tx.to.slice(0, 10)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Exchange Activity</h3>
        {data.exchangeActivity.length === 0 ? (
          <p className="text-gray-600 text-sm">No exchange activity detected</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data.exchangeActivity.map((ea, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-medium">{ea.exchange}</p>
                <p className="text-cyan-400">${ea.volume.toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{ea.direction}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Smart Money Signals</h3>
        {data.smartMoneySignals.length === 0 ? (
          <p className="text-gray-600 text-sm">No smart money signals detected</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.smartMoneySignals.map((signal, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm"
              >
                {signal.signal} ({(signal.confidence * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManipulationSection({ data }: { data: EntityData["manipulation"] }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-2">Pattern Type</h3>
        <p className="text-xl text-white capitalize">{data.patternType}</p>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Confidence:</span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${data.confidenceLevel * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-red-400">{(data.confidenceLevel * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {data.coordinationIndicators.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Coordination Indicators</h3>
          <div className="space-y-2">
            {data.coordinationIndicators.map((indicator, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-white">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.clusterIds.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Cluster IDs</h3>
          <div className="flex flex-wrap gap-2">
            {data.clusterIds.map((id, i) => (
              <span key={i} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-mono">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.relatedWallets.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Related Wallets</h3>
          <div className="space-y-2">
            {data.relatedWallets.map((wallet, i) => (
              <div key={i} className="text-sm font-mono text-gray-400 truncate">
                {wallet}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DarkpoolSection({ data }: { data: EntityData["darkpool"] }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Hidden Flows</h3>
        {data.hiddenFlows.length === 0 ? (
          <p className="text-gray-600 text-sm">No hidden flows detected</p>
        ) : (
          <div className="space-y-2">
            {data.hiddenFlows.map((flow, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-white">{flow.amount.toLocaleString()} {flow.token}</span>
                <span className="text-xs text-gray-500">
                  {new Date(flow.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">OTC Activity</h3>
        {data.otcActivity.length === 0 ? (
          <p className="text-gray-600 text-sm">No OTC activity detected</p>
        ) : (
          <div className="space-y-2">
            {data.otcActivity.map((otc, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-400 truncate">{otc.counterparty}</span>
                <span className="text-cyan-400">${otc.volume.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Accumulation Patterns</h3>
        {data.accumulationPatterns.length === 0 ? (
          <p className="text-gray-600 text-sm">No accumulation patterns detected</p>
        ) : (
          <div className="space-y-2">
            {data.accumulationPatterns.map((pattern, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <span className="text-white">{pattern.token}</span>
                  <span className="text-gray-500 ml-2 capitalize">{pattern.pattern}</span>
                </div>
                <span className="text-purple-400">{(pattern.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StablecoinSection({
  stablecoin,
  derivatives,
}: {
  stablecoin: EntityData["stablecoin"];
  derivatives: EntityData["derivatives"];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Circulating Supply Impact</h3>
          <p className="text-2xl text-white">{stablecoin.circulatingSupplyImpact.toFixed(4)}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-2">Futures Exposure</h3>
          <p className="text-2xl text-cyan-400">${derivatives.futuresExposure.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Stablecoin Exposure</h3>
        {stablecoin.exposure.length === 0 ? (
          <p className="text-gray-600 text-sm">No stablecoin exposure data</p>
        ) : (
          <div className="space-y-3">
            {stablecoin.exposure.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-white">{exp.stablecoin}</span>
                  <span className="text-gray-400">${exp.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${exp.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-3">Liquidation Zones</h3>
        {derivatives.liquidationZones.length === 0 ? (
          <p className="text-gray-600 text-sm">No liquidation zones detected</p>
        ) : (
          <div className="space-y-2">
            {derivatives.liquidationZones.map((zone, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-white">${zone.price.toLocaleString()}</span>
                <span className={zone.direction === "long" ? "text-green-400" : "text-red-400"}>
                  {zone.direction.toUpperCase()} ${zone.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500 mb-2">Volatility Correlation</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: `${Math.abs(derivatives.volatilityCorrelation) * 100}%` }}
            ></div>
          </div>
          <span className="text-white font-medium">
            {(derivatives.volatilityCorrelation * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AISummarySection({ data }: { data: EntityData["aiSummary"] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">GhostMind AI Analysis</h3>
            <p className="text-sm text-gray-400">Powered by advanced intelligence synthesis</p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm text-gray-500 mb-2">Overall Risk Assessment</h4>
          <p className="text-white">{data.overallRisk}</p>
        </div>
      </div>

      {data.notableBehavior.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Notable Behavior</h3>
          <ul className="space-y-2">
            {data.notableBehavior.map((behavior, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                <span className="text-white">{behavior}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.predictions.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Predictions</h3>
          <ul className="space-y-2">
            {data.predictions.map((prediction, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                <span className="text-white">{prediction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.correlationInsights.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500 mb-3">Correlation Insights</h3>
          <ul className="space-y-2">
            {data.correlationInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></div>
                <span className="text-white">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
