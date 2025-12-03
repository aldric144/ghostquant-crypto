'use client';

import React from 'react';

interface SalesInvestorViewProps {
  investorData: any;
}

export default function SalesInvestorView({ investorData }: SalesInvestorViewProps) {
  if (!investorData) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Loading investor metrics...
      </div>
    );
  }

  const { pipeline_health, conversion_metrics, lead_quality, top_opportunities, recent_wins } = investorData;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxHeight: '600px',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(34, 224, 255, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)',
        border: '2px solid #22E0FF',
        borderRadius: '12px',
        boxShadow: '0 0 30px rgba(34, 224, 255, 0.3)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#22E0FF',
          marginBottom: '8px',
        }}>
          📊 Investor Dashboard
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#CBD5E1',
        }}>
          Real-time sales pipeline metrics and performance indicators
        </p>
      </div>

      {/* Pipeline Health */}
      <div style={{
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '20px',
        }}>
          Pipeline Health
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Total Active Leads
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#22E0FF',
            }}>
              {pipeline_health.total_active_leads}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Qualified Leads
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#37FFB0',
            }}>
              {pipeline_health.qualified_leads}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Total Pipeline Value
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#3A8DFF',
            }}>
              ${(pipeline_health.total_pipeline_value / 1000000).toFixed(2)}M
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Weighted Pipeline Value
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#A78BFA',
            }}>
              ${(pipeline_health.weighted_pipeline_value / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div style={{
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '20px',
        }}>
          Conversion Metrics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Avg Close Probability
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#37FFB0',
            }}>
              {(conversion_metrics.average_close_probability * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Avg Cycle Time
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#3A8DFF',
            }}>
              {conversion_metrics.average_cycle_time_days.toFixed(0)}d
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#64748B',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>
              Avg Deal Size
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#22E0FF',
            }}>
              ${(pipeline_health.average_deal_size / 1000).toFixed(0)}K
            </div>
          </div>
        </div>
      </div>

      {/* Lead Quality */}
      <div style={{
        padding: '24px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '20px',
        }}>
          Lead Quality Distribution
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(255, 30, 68, 0.1)',
            border: '2px solid #FF1E44',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#FF1E44',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              High Priority
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#FF1E44',
            }}>
              {lead_quality.high_priority_leads}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(58, 141, 255, 0.1)',
            border: '2px solid #3A8DFF',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#3A8DFF',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              Government
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#3A8DFF',
            }}>
              {lead_quality.government_leads}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(34, 224, 255, 0.1)',
            border: '2px solid #22E0FF',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#22E0FF',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              Exchange
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#22E0FF',
            }}>
              {lead_quality.exchange_leads}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(167, 139, 250, 0.1)',
            border: '2px solid #A78BFA',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#A78BFA',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              Enterprise
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#A78BFA',
            }}>
              {lead_quality.enterprise_leads}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wins */}
      {recent_wins && recent_wins.length > 0 && (
        <div style={{
          padding: '24px',
          background: 'rgba(55, 255, 176, 0.1)',
          border: '2px solid #37FFB0',
          borderRadius: '12px',
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#37FFB0',
            marginBottom: '20px',
          }}>
            🎉 Recent Wins
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {recent_wins.map((win: any, idx: number) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: '3px solid #37FFB0',
                borderRadius: '6px',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                  }}>
                    {win.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                  }}>
                    {win.organization}
                  </div>
                </div>
                <div style={{
                  textAlign: 'right',
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#37FFB0',
                  }}>
                    ${win.value ? (win.value / 1000).toFixed(0) + 'K' : 'TBD'}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                  }}>
                    {new Date(win.closed_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
