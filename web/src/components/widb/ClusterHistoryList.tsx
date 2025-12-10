/**
 * ClusterHistoryList - Display component for cluster participation history
 * 
 * Shows a timeline of cluster detection events that include a wallet.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

export interface ClusterHistory {
  id: string;
  cluster_id: string;
  timestamp: string;
  related_addresses: string[];
  risk_level: string;
  label: string | null;
  source: string;
  metadata: Record<string, unknown>;
}

export interface ClusterHistoryListProps {
  clusters: ClusterHistory[];
  onAddressClick?: (address: string) => void;
  className?: string;
}

export default function ClusterHistoryList({
  clusters,
  onAddressClick,
  className = '',
}: ClusterHistoryListProps) {
  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-400 bg-red-500/20 border-red-500/40',
      high: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
      medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
      low: 'text-green-400 bg-green-500/20 border-green-500/40',
      unknown: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
    };
    return colors[level.toLowerCase()] || colors.unknown;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      hydra: 'text-purple-400',
      whale_intel: 'text-blue-400',
      ecoscan: 'text-cyan-400',
      manual: 'text-gray-400',
      demo: 'text-yellow-400',
      bootstrap: 'text-green-400',
    };
    return colors[source.toLowerCase()] || 'text-gray-400';
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (clusters.length === 0) {
    return (
      <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Cluster History</h3>
        <p className="text-gray-500 text-center py-4">No cluster history found</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Cluster History ({clusters.length})
      </h3>
      
      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-cyan-400 font-mono text-sm">{cluster.cluster_id}</p>
                <p className="text-gray-500 text-xs mt-1">{formatTimestamp(cluster.timestamp)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${getSourceColor(cluster.source)}`}>
                  {cluster.source}
                </span>
                <span className={`px-2 py-1 rounded text-xs border ${getRiskLevelColor(cluster.risk_level)}`}>
                  {cluster.risk_level.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Label */}
            {cluster.label && (
              <p className="text-gray-300 text-sm mb-3">{cluster.label}</p>
            )}

            {/* Related Addresses */}
            <div>
              <p className="text-gray-500 text-xs mb-2">
                Related Addresses ({cluster.related_addresses.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {cluster.related_addresses.slice(0, 6).map((address, index) => (
                  <button
                    key={index}
                    onClick={() => onAddressClick?.(address)}
                    className="px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-xs text-cyan-400 font-mono hover:border-cyan-500/50 transition-colors"
                    title={address}
                  >
                    {truncateAddress(address)}
                  </button>
                ))}
                {cluster.related_addresses.length > 6 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{cluster.related_addresses.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
