/**
 * AssociationsList - Display component for wallet associations
 * 
 * Shows a list of known associations (linked wallets) with
 * confidence scores and relationship types.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

export interface Association {
  id: string;
  address: string;
  linked_address: string;
  confidence: number;
  relationship_type: string;
  first_seen: string;
  last_seen: string;
  metadata: Record<string, unknown>;
}

export interface AssociationsListProps {
  associations: Association[];
  currentAddress: string;
  onAddressClick?: (address: string) => void;
  className?: string;
}

export default function AssociationsList({
  associations,
  currentAddress,
  onAddressClick,
  className = '',
}: AssociationsListProps) {
  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      funding: 'text-green-400 bg-green-500/20',
      withdrawal: 'text-blue-400 bg-blue-500/20',
      coordination: 'text-purple-400 bg-purple-500/20',
      cluster_member: 'text-cyan-400 bg-cyan-500/20',
      mixer_link: 'text-red-400 bg-red-500/20',
      exchange_deposit: 'text-yellow-400 bg-yellow-500/20',
      exchange_withdrawal: 'text-orange-400 bg-orange-500/20',
      unknown: 'text-gray-400 bg-gray-500/20',
    };
    return colors[type.toLowerCase()] || colors.unknown;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    if (confidence >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLinkedAddress = (assoc: Association) => {
    const normalizedCurrent = currentAddress.toLowerCase();
    if (assoc.address.toLowerCase() === normalizedCurrent) {
      return assoc.linked_address;
    }
    return assoc.address;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (associations.length === 0) {
    return (
      <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">Known Associations</h3>
        <p className="text-gray-500 text-center py-4">No associations found</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Known Associations ({associations.length})
      </h3>
      
      <div className="space-y-3">
        {associations.map((assoc) => {
          const linkedAddr = getLinkedAddress(assoc);
          return (
            <div
              key={assoc.id}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <button
                  onClick={() => onAddressClick?.(linkedAddr)}
                  className="text-cyan-400 font-mono text-sm hover:text-cyan-300 transition-colors text-left"
                  title={linkedAddr}
                >
                  {truncateAddress(linkedAddr)}
                </button>
                <span className={`px-2 py-1 rounded text-xs ${getRelationshipColor(assoc.relationship_type)}`}>
                  {assoc.relationship_type.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  Confidence:{' '}
                  <span className={getConfidenceColor(assoc.confidence)}>
                    {(assoc.confidence * 100).toFixed(0)}%
                  </span>
                </span>
                <span className="text-gray-500">
                  First seen: {new Date(assoc.first_seen).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
