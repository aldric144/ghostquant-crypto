'use client';

import React from 'react';
import { SalesPipelineSummary } from '@/lib/salesClient';

interface SalesPipelineSummaryProps {
  summary: SalesPipelineSummary | null;
}

export default function SalesPipelineSummaryComponent({ summary }: SalesPipelineSummaryProps) {
  if (!summary) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Loading pipeline summary...
      </div>
    );
  }

  const stageNames: Record<string, string> = {
    new_lead: 'New Lead',
    qualification: 'Qualification',
    needs_analysis: 'Needs Analysis',
    technical_review: 'Technical Review',
    proof_of_concept: 'Proof of Concept',
    pricing_negotiation: 'Pricing & Negotiation',
    legal_compliance: 'Legal & Compliance',
    closed: 'Closed',
  };

  const stageColors: Record<string, string> = {
    new_lead: '#64748B',
    qualification: '#3A8DFF',
    needs_analysis: '#22E0FF',
    technical_review: '#A78BFA',
    proof_of_concept: '#F25F4C',
    pricing_negotiation: '#FFA500',
    legal_compliance: '#37FFB0',
    closed: '#10B981',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #22E0FF',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(34, 224, 255, 0.3)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748B',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Total Leads
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#22E0FF',
          }}>
            {summary.total_leads}
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #37FFB0',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(55, 255, 176, 0.3)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748B',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Pipeline Value
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#37FFB0',
          }}>
            ${(summary.total_pipeline_value / 1000000).toFixed(1)}M
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #3A8DFF',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(58, 141, 255, 0.3)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748B',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Weighted Value
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#3A8DFF',
          }}>
            ${(summary.weighted_pipeline_value / 1000000).toFixed(1)}M
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #A78BFA',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
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
            color: '#A78BFA',
          }}>
            ${(summary.average_deal_size / 1000).toFixed(0)}K
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
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
          Pipeline by Stage
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {Object.entries(summary.leads_by_stage).map(([stageId, count]) => (
            <div key={stageId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                flex: '0 0 180px',
                fontSize: '0.875rem',
                color: '#CBD5E1',
              }}>
                {stageNames[stageId] || stageId}
              </div>
              <div style={{
                flex: 1,
                height: '32px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count / summary.total_leads) * 100}%`,
                  background: stageColors[stageId] || '#64748B',
                  transition: 'width 0.3s ease',
                  boxShadow: `0 0 10px ${stageColors[stageId] || '#64748B'}`,
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#F1F5F9',
                }}>
                  {count} leads
                </div>
              </div>
              <div style={{
                flex: '0 0 60px',
                textAlign: 'right',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: stageColors[stageId] || '#64748B',
              }}>
                {((count / summary.total_leads) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category & Priority Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
      }}>
        {/* By Category */}
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '16px',
          }}>
            By Category
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {Object.entries(summary.leads_by_category).map(([category, count]) => (
              <div key={category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '6px',
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#CBD5E1',
                  textTransform: 'capitalize',
                }}>
                  {category.replace('_', ' ')}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#22E0FF',
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '16px',
          }}>
            By Priority
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {Object.entries(summary.leads_by_priority).map(([priority, count]) => {
              const colors: Record<string, string> = {
                critical: '#FF1E44',
                high: '#F25F4C',
                medium: '#3A8DFF',
                low: '#37FFB0',
              };
              return (
                <div key={priority} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '6px',
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#CBD5E1',
                    textTransform: 'capitalize',
                  }}>
                    {priority}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: colors[priority] || '#64748B',
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Leads */}
      {summary.top_leads.length > 0 && (
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '16px',
          }}>
            🔥 Top Opportunities
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {summary.top_leads.map((lead, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: '3px solid #22E0FF',
                borderRadius: '6px',
              }}>
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#F1F5F9',
                  }}>
                    {lead.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                  }}>
                    {lead.organization}
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
                    {(lead.probability * 100).toFixed(0)}%
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                  }}>
                    Score: {(lead.score * 100).toFixed(0)}
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
