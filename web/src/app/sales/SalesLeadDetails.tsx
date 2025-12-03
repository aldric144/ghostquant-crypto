'use client';

import React, { useState } from 'react';
import { SalesLead, SalesInteraction, InteractionType, salesClient } from '@/lib/salesClient';

interface SalesLeadDetailsProps {
  leadDetails: any;
  onRefresh: () => void;
}

export default function SalesLeadDetails({ leadDetails, onRefresh }: SalesLeadDetailsProps) {
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionType, setInteractionType] = useState<InteractionType>(InteractionType.NOTE);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  if (!leadDetails) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#64748B',
      }}>
        Select a lead to view details
      </div>
    );
  }

  const lead: SalesLead = leadDetails.lead;
  const interactions: SalesInteraction[] = leadDetails.interactions || [];
  const aiInsights = leadDetails.ai_insights || {};

  const handleAddInteraction = async () => {
    try {
      await salesClient.createInteraction(lead.lead_id, {
        interaction_type: interactionType,
        subject,
        notes,
      });
      setShowInteractionForm(false);
      setSubject('');
      setNotes('');
      onRefresh();
    } catch (error) {
      console.error('Failed to add interaction:', error);
      alert('Failed to add interaction');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxHeight: '600px',
      overflowY: 'auto',
    }}>
      {/* Lead Info */}
      <div style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#22E0FF',
          marginBottom: '16px',
        }}>
          {lead.name}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Organization</div>
            <div style={{ fontSize: '0.875rem', color: '#F1F5F9' }}>{lead.organization}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Email</div>
            <div style={{ fontSize: '0.875rem', color: '#F1F5F9' }}>{lead.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Category</div>
            <div style={{ fontSize: '0.875rem', color: '#F1F5F9' }}>{lead.category}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Source</div>
            <div style={{ fontSize: '0.875rem', color: '#F1F5F9' }}>{lead.source}</div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {Object.keys(aiInsights).length > 0 && (
        <div style={{
          padding: '20px',
          background: 'rgba(34, 224, 255, 0.1)',
          border: '2px solid #22E0FF',
          borderRadius: '12px',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#22E0FF',
            marginBottom: '12px',
          }}>
            🤖 AI Insights
          </h4>
          {Object.entries(aiInsights).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                {key}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#CBD5E1',
                lineHeight: 1.6,
              }}>
                {value as string}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use Case */}
      <div style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '12px',
        }}>
          Use Case
        </h4>
        <p style={{
          fontSize: '0.875rem',
          color: '#CBD5E1',
          lineHeight: 1.6,
        }}>
          {lead.use_case}
        </p>
      </div>

      {/* Interactions */}
      <div style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '2px solid #334155',
        borderRadius: '12px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#F1F5F9',
          }}>
            Interactions ({interactions.length})
          </h4>
          <button
            onClick={() => setShowInteractionForm(!showInteractionForm)}
            style={{
              padding: '8px 16px',
              background: '#22E0FF',
              border: 'none',
              borderRadius: '6px',
              color: '#0F172A',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add
          </button>
        </div>

        {showInteractionForm && (
          <div style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Type
              </label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#F1F5F9',
                  fontSize: '0.875rem',
                }}
              >
                {Object.values(InteractionType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#F1F5F9',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#F1F5F9',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddInteraction}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#22E0FF',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowInteractionForm(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {interactions.map((interaction) => (
            <div
              key={interaction.interaction_id}
              style={{
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: '3px solid #3A8DFF',
                borderRadius: '6px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#3A8DFF',
                  textTransform: 'uppercase',
                }}>
                  {interaction.interaction_type}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                }}>
                  {formatDate(interaction.timestamp)}
                </span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#F1F5F9',
                marginBottom: '4px',
              }}>
                {interaction.subject}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#94A3B8',
                lineHeight: 1.6,
              }}>
                {interaction.notes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
