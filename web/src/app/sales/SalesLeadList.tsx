'use client';

import React from 'react';
import { SalesLead, LeadPriority } from '@/lib/salesClient';

interface SalesLeadListProps {
  leads: SalesLead[];
  selectedLeadId?: string;
  onSelectLead: (leadId: string) => void;
}

export default function SalesLeadList({ leads, selectedLeadId, onSelectLead }: SalesLeadListProps) {
  const getPriorityColor = (priority: LeadPriority) => {
    switch (priority) {
      case LeadPriority.CRITICAL:
        return '#FF1E44';
      case LeadPriority.HIGH:
        return '#F25F4C';
      case LeadPriority.MEDIUM:
        return '#3A8DFF';
      case LeadPriority.LOW:
        return '#37FFB0';
      default:
        return '#64748B';
    }
  };

  const getStageColor = (stage: string) => {
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
    return stageColors[stage] || '#64748B';
  };

  const formatStage = (stage: string) => {
    return stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: '600px',
      overflowY: 'auto',
    }}>
      {leads.map((lead) => (
        <div
          key={lead.lead_id}
          onClick={() => onSelectLead(lead.lead_id)}
          style={{
            padding: '16px',
            background: selectedLeadId === lead.lead_id ? 'rgba(34, 224, 255, 0.1)' : 'rgba(15, 23, 42, 0.6)',
            border: `2px solid ${selectedLeadId === lead.lead_id ? '#22E0FF' : '#334155'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (selectedLeadId !== lead.lead_id) {
              e.currentTarget.style.borderColor = '#475569';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedLeadId !== lead.lead_id) {
              e.currentTarget.style.borderColor = '#334155';
            }
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: '4px',
              }}>
                {lead.name}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#94A3B8',
              }}>
                {lead.organization}
              </div>
            </div>
            <div style={{
              padding: '4px 12px',
              background: `${getPriorityColor(lead.priority)}20`,
              border: `1px solid ${getPriorityColor(lead.priority)}`,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: getPriorityColor(lead.priority),
              textTransform: 'uppercase',
            }}>
              {lead.priority}
            </div>
          </div>

          {/* Stage */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: getStageColor(lead.current_stage),
              borderRadius: '50%',
              boxShadow: `0 0 10px ${getStageColor(lead.current_stage)}`,
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: '#CBD5E1',
            }}>
              {formatStage(lead.current_stage)}
            </span>
          </div>

          {/* Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748B',
                marginBottom: '4px',
              }}>
                Score
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#22E0FF',
              }}>
                {(lead.lead_score * 100).toFixed(0)}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748B',
                marginBottom: '4px',
              }}>
                Probability
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#37FFB0',
              }}>
                {(lead.close_probability * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748B',
                marginBottom: '4px',
              }}>
                Value
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#F1F5F9',
              }}>
                {lead.estimated_value ? `$${(lead.estimated_value / 1000).toFixed(0)}K` : 'TBD'}
              </div>
            </div>
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}>
              {lead.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '2px 8px',
                    background: 'rgba(58, 141, 255, 0.2)',
                    border: '1px solid #3A8DFF',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#3A8DFF',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Last Updated */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #334155',
            fontSize: '0.75rem',
            color: '#64748B',
          }}>
            Updated {formatDate(lead.updated_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
