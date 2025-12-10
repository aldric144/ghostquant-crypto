/**
 * WalletSearchBar - Search component for WIDB
 * 
 * Provides a search input for looking up wallet profiles.
 * This is a NEW isolated component - does NOT modify any existing code.
 */

'use client';

import { useState, FormEvent } from 'react';

export interface WalletSearchBarProps {
  onSearch: (address: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export default function WalletSearchBar({
  onSearch,
  isLoading = false,
  placeholder = 'Enter wallet address (0x...)',
  className = '',
}: WalletSearchBarProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim().toLowerCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 px-4 py-3 bg-slate-900/70 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50 font-mono text-sm"
      />
      <button
        type="submit"
        disabled={isLoading || !address.trim()}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Searching...
          </span>
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
}
