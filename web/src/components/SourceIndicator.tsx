/**
 * Source Indicator Component
 * 
 * Displays a small colored dot indicating whether data is from
 * live (real) or synthetic fallback sources.
 * 
 * Part of Layer 3: Frontend Fallback Firewall
 */

import React from 'react';

export interface SourceIndicatorProps {
  source: 'real' | 'synthetic' | 'live' | 'unknown';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const sourceColors = {
  real: 'bg-green-500',
  live: 'bg-green-500',
  synthetic: 'bg-yellow-500',
  unknown: 'bg-gray-500',
};

const sourceLabels = {
  real: 'Live',
  live: 'Live',
  synthetic: 'Synthetic',
  unknown: 'Unknown',
};

export function SourceIndicator({
  source,
  showLabel = false,
  size = 'sm',
  className = '',
}: SourceIndicatorProps) {
  const normalizedSource = source === 'live' ? 'real' : source;
  const colorClass = sourceColors[normalizedSource] || sourceColors.unknown;
  const sizeClass = sizeClasses[size];
  const label = sourceLabels[normalizedSource] || sourceLabels.unknown;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`${sizeClass} ${colorClass} rounded-full animate-pulse`}
        title={`Data source: ${label}`}
      />
      {showLabel && (
        <span className="text-xs text-gray-400">{label}</span>
      )}
    </div>
  );
}

export function DataSourceBadge({
  source,
  timestamp,
  className = '',
}: {
  source: 'real' | 'synthetic' | 'live' | 'unknown';
  timestamp?: string;
  className?: string;
}) {
  const normalizedSource = source === 'live' ? 'real' : source;
  const isLive = normalizedSource === 'real';
  
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs ${
      isLive ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
    } ${className}`}>
      <SourceIndicator source={source} size="sm" />
      <span>{isLive ? 'Live Data' : 'Synthetic Fallback'}</span>
      {timestamp && (
        <span className="text-gray-500">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default SourceIndicator;
