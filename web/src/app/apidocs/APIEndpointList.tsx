'use client';

import React from 'react';
import { APIEndpointDoc, HTTPMethod, RiskLevel } from '@/lib/apiDocsClient';

interface APIEndpointListProps {
  endpoints: APIEndpointDoc[];
  selectedEndpointId?: string;
  onSelectEndpoint: (endpointId: string) => void;
}

export default function APIEndpointList({ endpoints, selectedEndpointId, onSelectEndpoint }: APIEndpointListProps) {
  const getMethodColor = (method: HTTPMethod) => {
    switch (method) {
      case HTTPMethod.GET:
        return '#37FFB0';
      case HTTPMethod.POST:
        return '#22E0FF';
      case HTTPMethod.PUT:
        return '#A78BFA';
      case HTTPMethod.DELETE:
        return '#FF6B9D';
      default:
        return '#94A3B8';
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.CRITICAL:
        return '#FF3B3B';
      case RiskLevel.HIGH:
        return '#FF6B9D';
      case RiskLevel.MEDIUM:
        return '#FFB84D';
      case RiskLevel.LOW:
        return '#37FFB0';
      default:
        return '#94A3B8';
    }
  };

  if (endpoints.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        No endpoints found
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {endpoints.map((endpoint) => (
        <div
          key={endpoint.endpoint_id}
          onClick={() => onSelectEndpoint(endpoint.endpoint_id)}
          style={{
            padding: '12px 16px',
            background: selectedEndpointId === endpoint.endpoint_id
              ? 'rgba(34, 224, 255, 0.1)'
              : 'rgba(15, 23, 42, 0.4)',
            border: `2px solid ${selectedEndpointId === endpoint.endpoint_id ? '#22E0FF' : '#334155'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (selectedEndpointId !== endpoint.endpoint_id) {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedEndpointId !== endpoint.endpoint_id) {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <span style={{
              padding: '4px 8px',
              background: getMethodColor(endpoint.method),
              color: '#0F172A',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '4px',
            }}>
              {endpoint.method}
            </span>
            <span style={{
              padding: '4px 8px',
              background: getRiskColor(endpoint.risk_level),
              color: '#0F172A',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '4px',
            }}>
              {endpoint.risk_level.toUpperCase()}
            </span>
          </div>
          
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#F1F5F9',
            marginBottom: '4px',
          }}>
            {endpoint.name}
          </div>
          
          <div style={{
            fontSize: '0.75rem',
            color: '#22E0FF',
            fontFamily: 'monospace',
            marginBottom: '8px',
          }}>
            {endpoint.path}
          </div>
          
          <div style={{
            fontSize: '0.75rem',
            color: '#94A3B8',
            lineHeight: '1.4',
          }}>
            {endpoint.summary}
          </div>
          
          {endpoint.tags && endpoint.tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginTop: '8px',
            }}>
              {endpoint.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    background: 'rgba(167, 139, 250, 0.2)',
                    color: '#A78BFA',
                    fontSize: '0.625rem',
                    borderRadius: '4px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
