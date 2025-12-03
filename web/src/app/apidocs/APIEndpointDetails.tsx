'use client';

import React from 'react';
import { APIEndpointDoc, HTTPMethod, RiskLevel } from '@/lib/apiDocsClient';

interface APIEndpointDetailsProps {
  endpoint: APIEndpointDoc | null;
}

export default function APIEndpointDetails({ endpoint }: APIEndpointDetailsProps) {
  if (!endpoint) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Select an endpoint to view details
      </div>
    );
  }

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}>
          <span style={{
            padding: '6px 12px',
            background: getMethodColor(endpoint.method),
            color: '#0F172A',
            fontSize: '0.875rem',
            fontWeight: 700,
            borderRadius: '6px',
          }}>
            {endpoint.method}
          </span>
          <span style={{
            padding: '6px 12px',
            background: getRiskColor(endpoint.risk_level),
            color: '#0F172A',
            fontSize: '0.875rem',
            fontWeight: 700,
            borderRadius: '6px',
          }}>
            {endpoint.risk_level.toUpperCase()}
          </span>
        </div>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#F1F5F9',
          marginBottom: '8px',
        }}>
          {endpoint.name}
        </h2>
        
        <div style={{
          fontSize: '1rem',
          color: '#22E0FF',
          fontFamily: 'monospace',
          marginBottom: '12px',
        }}>
          {endpoint.path}
        </div>
        
        <p style={{
          fontSize: '0.875rem',
          color: '#94A3B8',
          lineHeight: '1.6',
        }}>
          {endpoint.description}
        </p>
      </div>

      {/* Parameters */}
      {endpoint.params && endpoint.params.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Path Parameters
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {endpoint.params.map((param) => (
              <div
                key={param.name}
                style={{
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#22E0FF',
                    fontFamily: 'monospace',
                  }}>
                    {param.name}
                  </span>
                  {param.required && (
                    <span style={{
                      padding: '2px 6px',
                      background: '#FF6B9D',
                      color: '#0F172A',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                    }}>
                      REQUIRED
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                }}>
                  Type: {param.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {endpoint.query_params && endpoint.query_params.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Query Parameters
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {endpoint.query_params.map((param) => (
              <div
                key={param.name}
                style={{
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#22E0FF',
                    fontFamily: 'monospace',
                  }}>
                    {param.name}
                  </span>
                  {param.required && (
                    <span style={{
                      padding: '2px 6px',
                      background: '#FF6B9D',
                      color: '#0F172A',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                    }}>
                      REQUIRED
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                }}>
                  Type: {param.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {endpoint.body_schema && Object.keys(endpoint.body_schema).length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Request Body
          </h3>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#94A3B8',
            overflowX: 'auto',
          }}>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(endpoint.body_schema, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Response Schema */}
      {endpoint.response_schema && Object.keys(endpoint.response_schema).length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Response Schema
          </h3>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#94A3B8',
            overflowX: 'auto',
          }}>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(endpoint.response_schema, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Use Cases */}
      {endpoint.use_cases && endpoint.use_cases.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Use Cases
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {endpoint.use_cases.map((useCase, index) => (
              <li
                key={index}
                style={{
                  padding: '12px',
                  background: 'rgba(55, 255, 176, 0.1)',
                  border: '1px solid rgba(55, 255, 176, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#37FFB0',
                }}
              >
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Notes */}
      {endpoint.risk_notes && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Risk Notes
          </h3>
          <div style={{
            padding: '12px',
            background: 'rgba(255, 107, 157, 0.1)',
            border: '1px solid rgba(255, 107, 157, 0.3)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#FF6B9D',
          }}>
            {endpoint.risk_notes}
          </div>
        </div>
      )}

      {/* Tags */}
      {endpoint.tags && endpoint.tags.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '12px',
          }}>
            Tags
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {endpoint.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(167, 139, 250, 0.2)',
                  border: '1px solid rgba(167, 139, 250, 0.4)',
                  color: '#A78BFA',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
