/**
 * WalletProfileCard - Display component for wallet profiles
 * 
 * Shows wallet profile information including entity type, risk score,
 * first/last seen timestamps, and tags.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

export interface WalletProfile {
  address: string;
  entity_type: string;
  risk_score: number;
  tags: string[];
  first_seen: string;
  last_seen: string;
  total_clusters: number;
  notes: string | null;
  metadata: Record<string, unknown>;
}

export interface WalletProfileCardProps {
  profile: WalletProfile;
  associationsCount?: number;
  clustersCount?: number;
  className?: string;
}

export default function WalletProfileCard({
  profile,
  associationsCount = 0,
  clustersCount = 0,
  className = '',
}: WalletProfileCardProps) {
  const getEntityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      whale: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
      exchange: 'text-green-400 bg-green-500/20 border-green-500/40',
      mixer: 'text-red-400 bg-red-500/20 border-red-500/40',
      exploit: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
      normal: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
      unknown: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
    };
    return colors[type.toLowerCase()] || colors.unknown;
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-400';
    if (score >= 0.6) return 'text-orange-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Wallet Profile</h3>
          <p className="text-cyan-400 font-mono text-sm break-all">{profile.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEntityTypeColor(profile.entity_type)}`}>
          {profile.entity_type.toUpperCase()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Risk Score</p>
          <p className={`text-xl font-bold ${getRiskColor(profile.risk_score)}`}>
            {(profile.risk_score * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Clusters</p>
          <p className="text-xl font-bold text-white">{clustersCount || profile.total_clusters}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Associations</p>
          <p className="text-xl font-bold text-white">{associationsCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Tags</p>
          <p className="text-xl font-bold text-white">{profile.tags.length}</p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-500 text-xs mb-1">First Seen</p>
          <p className="text-gray-300 text-sm">{formatDate(profile.first_seen)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Last Seen</p>
          <p className="text-gray-300 text-sm">{formatDate(profile.last_seen)}</p>
        </div>
      </div>

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-500 text-xs mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {profile.notes && (
        <div>
          <p className="text-gray-500 text-xs mb-2">Analyst Notes</p>
          <p className="text-gray-300 text-sm bg-slate-900/50 rounded p-3">{profile.notes}</p>
        </div>
      )}
    </div>
  );
}
