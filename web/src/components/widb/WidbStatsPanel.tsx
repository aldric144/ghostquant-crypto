/**
 * WidbStatsPanel - Display component for WIDB statistics
 * 
 * Shows overall WIDB statistics including total wallets,
 * associations, clusters, and breakdowns by type.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

export interface WidbStats {
  total_wallets: number;
  total_associations: number;
  total_clusters: number;
  wallets_by_type: Record<string, number>;
  clusters_by_risk: Record<string, number>;
  timestamp: string;
}

export interface WidbStatsPanelProps {
  stats: WidbStats | null;
  isLoading?: boolean;
  className?: string;
}

export default function WidbStatsPanel({
  stats,
  isLoading = false,
  className = '',
}: WidbStatsPanelProps) {
  const getEntityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      whale: 'bg-blue-500',
      exchange: 'bg-green-500',
      mixer: 'bg-red-500',
      exploit: 'bg-orange-500',
      normal: 'bg-gray-500',
      unknown: 'bg-slate-600',
    };
    return colors[type.toLowerCase()] || colors.unknown;
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
      unknown: 'bg-slate-600',
    };
    return colors[level.toLowerCase()] || colors.unknown;
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">WIDB Statistics</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">WIDB Statistics</h3>
        <p className="text-gray-500 text-center py-4">No statistics available</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">WIDB Statistics</h3>
      
      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{stats.total_wallets}</p>
          <p className="text-gray-500 text-sm">Wallets</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{stats.total_associations}</p>
          <p className="text-gray-500 text-sm">Associations</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{stats.total_clusters}</p>
          <p className="text-gray-500 text-sm">Clusters</p>
        </div>
      </div>

      {/* Wallets by Type */}
      {Object.keys(stats.wallets_by_type).length > 0 && (
        <div className="mb-4">
          <p className="text-gray-500 text-xs mb-2">Wallets by Entity Type</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.wallets_by_type).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 bg-slate-900/50 rounded px-3 py-1"
              >
                <div className={`w-2 h-2 rounded-full ${getEntityTypeColor(type)}`}></div>
                <span className="text-gray-300 text-sm capitalize">{type}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clusters by Risk */}
      {Object.keys(stats.clusters_by_risk).length > 0 && (
        <div>
          <p className="text-gray-500 text-xs mb-2">Clusters by Risk Level</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.clusters_by_risk).map(([level, count]) => (
              <div
                key={level}
                className="flex items-center gap-2 bg-slate-900/50 rounded px-3 py-1"
              >
                <div className={`w-2 h-2 rounded-full ${getRiskColor(level)}`}></div>
                <span className="text-gray-300 text-sm capitalize">{level}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
