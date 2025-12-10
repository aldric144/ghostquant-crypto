/**
 * Whale Intelligence Database Page
 * 
 * Main page for the WIDB subsystem.
 * Provides wallet search, profile display, associations, and cluster history.
 * 
 * This is a NEW isolated page - does NOT modify any existing code.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import WalletSearchBar from '../../../components/widb/WalletSearchBar';
import WalletProfileCard from '../../../components/widb/WalletProfileCard';
import AssociationsList from '../../../components/widb/AssociationsList';
import ClusterHistoryList from '../../../components/widb/ClusterHistoryList';
import WidbStatsPanel from '../../../components/widb/WidbStatsPanel';
import AnnotateWalletForm from '../../../components/widb/AnnotateWalletForm';
import type { WalletProfile } from '../../../components/widb/WalletProfileCard';
import type { Association } from '../../../components/widb/AssociationsList';
import type { ClusterHistory } from '../../../components/widb/ClusterHistoryList';
import type { WidbStats } from '../../../components/widb/WidbStatsPanel';
import type { AnnotateRequest } from '../../../components/widb/AnnotateWalletForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

interface WalletProfileResponse {
  profile: WalletProfile;
  associations_count: number;
  clusters_count: number;
}

interface AssociationsResponse {
  address: string;
  associations: Association[];
  total: number;
}

interface ClustersResponse {
  clusters: ClusterHistory[];
  total: number;
}

export default function WhaleIntelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  
  // Profile data
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [associationsCount, setAssociationsCount] = useState(0);
  const [clustersCount, setClustersCount] = useState(0);
  
  // Associations and clusters
  const [associations, setAssociations] = useState<Association[]>([]);
  const [clusters, setClusters] = useState<ClusterHistory[]>([]);
  
  // Stats
  const [stats, setStats] = useState<WidbStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Annotation
  const [annotating, setAnnotating] = useState(false);

  // Fetch WIDB stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/widb/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch WIDB stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const searchWallet = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    setSearchedAddress(address);
    setProfile(null);
    setAssociations([]);
    setClusters([]);

    try {
      // Fetch wallet profile
      const profileResponse = await fetch(`${API_BASE}/widb/wallet/${address}`);
      
      if (profileResponse.status === 404) {
        setError(`Wallet not found in WIDB: ${address}`);
        setLoading(false);
        return;
      }
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch wallet profile');
      }
      
      const profileData: WalletProfileResponse = await profileResponse.json();
      setProfile(profileData.profile);
      setAssociationsCount(profileData.associations_count);
      setClustersCount(profileData.clusters_count);

      // Fetch associations
      const assocResponse = await fetch(`${API_BASE}/widb/wallet/${address}/associations`);
      if (assocResponse.ok) {
        const assocData: AssociationsResponse = await assocResponse.json();
        setAssociations(assocData.associations);
      }

      // Fetch clusters
      const clustersResponse = await fetch(`${API_BASE}/widb/wallet/${address}/clusters`);
      if (clustersResponse.ok) {
        const clustersData: ClustersResponse = await clustersResponse.json();
        setClusters(clustersData.clusters);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnnotate = async (data: AnnotateRequest) => {
    setAnnotating(true);
    try {
      const response = await fetch(`${API_BASE}/widb/wallet/annotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to annotate wallet');
      }

      // Refresh the profile
      if (searchedAddress) {
        await searchWallet(searchedAddress);
      }
      
      // Refresh stats
      await fetchStats();
    } finally {
      setAnnotating(false);
    }
  };

  const handleIngestDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/widb/ingest/demo`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchStats();
        setError(null);
      } else {
        setError('Failed to ingest demo data');
      }
    } catch (err) {
      setError('Failed to ingest demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestBootstrap = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/widb/ingest/bootstrap`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchStats();
        setError(null);
      } else {
        setError('Failed to ingest bootstrap data');
      }
    } catch (err) {
      setError('Failed to ingest bootstrap data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Whale Intelligence Database
          </h1>
          <p className="text-gray-400">
            Track wallets, clusters, and entity metadata across the blockchain ecosystem
          </p>
        </div>

        {/* Stats Panel */}
        <div className="mb-8">
          <WidbStatsPanel stats={stats} isLoading={statsLoading} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={handleIngestDemo}
            disabled={loading}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 transition-colors text-sm"
          >
            Ingest Demo Data
          </button>
          <button
            onClick={handleIngestBootstrap}
            disabled={loading}
            className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-colors text-sm"
          >
            Ingest Bootstrap Data
          </button>
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors text-sm"
          >
            Refresh Stats
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <WalletSearchBar
            onSearch={searchWallet}
            isLoading={loading}
            placeholder="Search wallet address (0x...)"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile and Annotation */}
            <div className="lg:col-span-1 space-y-6">
              <WalletProfileCard
                profile={profile}
                associationsCount={associationsCount}
                clustersCount={clustersCount}
              />
              
              <AnnotateWalletForm
                address={profile.address}
                onSubmit={handleAnnotate}
                isLoading={annotating}
              />
            </div>

            {/* Right Column - Associations and Clusters */}
            <div className="lg:col-span-2 space-y-6">
              <AssociationsList
                associations={associations}
                currentAddress={profile.address}
                onAddressClick={searchWallet}
              />
              
              <ClusterHistoryList
                clusters={clusters}
                onAddressClick={searchWallet}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!profile && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐋</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Search for a Wallet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a wallet address above to view its intelligence profile,
              known associations, and cluster participation history.
            </p>
            <p className="text-gray-600 text-sm mt-4">
              Or click &quot;Ingest Demo Data&quot; to populate the database with sample wallets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
