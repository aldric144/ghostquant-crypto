/**
 * WIDB Components - Whale Intelligence Database UI Components
 * 
 * Export all WIDB frontend components.
 * These are NEW isolated modules - do NOT modify any existing code.
 */

export { default as WalletSearchBar } from './WalletSearchBar';
export type { WalletSearchBarProps } from './WalletSearchBar';

export { default as WalletProfileCard } from './WalletProfileCard';
export type { WalletProfile, WalletProfileCardProps } from './WalletProfileCard';

export { default as AssociationsList } from './AssociationsList';
export type { Association, AssociationsListProps } from './AssociationsList';

export { default as ClusterHistoryList } from './ClusterHistoryList';
export type { ClusterHistory, ClusterHistoryListProps } from './ClusterHistoryList';

export { default as WidbStatsPanel } from './WidbStatsPanel';
export type { WidbStats, WidbStatsPanelProps } from './WidbStatsPanel';

export { default as AnnotateWalletForm } from './AnnotateWalletForm';
export type { AnnotateRequest, AnnotateWalletFormProps } from './AnnotateWalletForm';
