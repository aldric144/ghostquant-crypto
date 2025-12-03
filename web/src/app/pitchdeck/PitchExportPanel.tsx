'use client';

import React, { useState } from 'react';
import { DeckExportPackage, PitchDeck } from '@/lib/pitchdeckClient';

interface PitchExportPanelProps {
  deck: PitchDeck | null;
  exportPackage: DeckExportPackage | null;
}

export default function PitchExportPanel({ deck, exportPackage }: PitchExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!deck || !exportPackage) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748b',
      }}>
        Generate a deck to view export options
      </div>
    );
  }

  const handleCopy = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Deck Metadata */}
      <div style={{
        padding: '20px',
        background: 'rgba(0, 209, 255, 0.1)',
        border: '2px solid rgba(0, 209, 255, 0.3)',
        borderRadius: '12px',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#00d1ff',
          marginBottom: '16px',
        }}>
          Deck Information
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Company:</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{deck.metadata.company_name}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Type:</span>
            <span style={{ color: '#ffffff', fontWeight: 600, textTransform: 'capitalize' }}>
              {deck.metadata.deck_type}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Slides:</span>
            <span style={{ color: '#00d1ff', fontWeight: 700, fontSize: '1.125rem' }}>
              {deck.total_slides}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sections:</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{deck.metadata.section_count}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Generated:</span>
            <span style={{ color: '#ffffff', fontSize: '0.75rem' }}>
              {new Date(deck.metadata.generated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '16px',
        }}>
          Export Formats
        </h3>

        {/* JSON Export */}
        <div style={{
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #334155',
          borderRadius: '8px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '4px',
              }}>
                JSON
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                Structured data format for programmatic use
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleCopy(JSON.stringify(exportPackage.deck_json, null, 2), 'JSON')}
                style={{
                  padding: '8px 16px',
                  background: copied === 'JSON' ? '#37ffb0' : 'rgba(55, 255, 176, 0.2)',
                  border: '1px solid #37ffb0',
                  borderRadius: '6px',
                  color: copied === 'JSON' ? '#0a0f18' : '#37ffb0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied === 'JSON' ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(
                  JSON.stringify(exportPackage.deck_json, null, 2),
                  `${deck.metadata.company_name.replace(/\s+/g, '_')}_deck.json`,
                  'application/json'
                )}
                style={{
                  padding: '8px 16px',
                  background: '#00d1ff',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#0a0f18',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Markdown Export */}
        <div style={{
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #334155',
          borderRadius: '8px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '4px',
              }}>
                Markdown
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                Human-readable format for documentation
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleCopy(exportPackage.deck_markdown, 'Markdown')}
                style={{
                  padding: '8px 16px',
                  background: copied === 'Markdown' ? '#37ffb0' : 'rgba(55, 255, 176, 0.2)',
                  border: '1px solid #37ffb0',
                  borderRadius: '6px',
                  color: copied === 'Markdown' ? '#0a0f18' : '#37ffb0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied === 'Markdown' ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(
                  exportPackage.deck_markdown,
                  `${deck.metadata.company_name.replace(/\s+/g, '_')}_deck.md`,
                  'text/markdown'
                )}
                style={{
                  padding: '8px 16px',
                  background: '#00d1ff',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#0a0f18',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* HTML Export */}
        <div style={{
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid #334155',
          borderRadius: '8px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '4px',
              }}>
                HTML
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}>
                Web-ready format for presentations
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleCopy(exportPackage.deck_html, 'HTML')}
                style={{
                  padding: '8px 16px',
                  background: copied === 'HTML' ? '#37ffb0' : 'rgba(55, 255, 176, 0.2)',
                  border: '1px solid #37ffb0',
                  borderRadius: '6px',
                  color: copied === 'HTML' ? '#0a0f18' : '#37ffb0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied === 'HTML' ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(
                  exportPackage.deck_html,
                  `${deck.metadata.company_name.replace(/\s+/g, '_')}_deck.html`,
                  'text/html'
                )}
                style={{
                  padding: '8px 16px',
                  background: '#00d1ff',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#0a0f18',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Badges */}
      {deck.metadata.compliance_badges && deck.metadata.compliance_badges.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Compliance Badges
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {deck.metadata.compliance_badges.map((badge, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(167, 139, 250, 0.2)',
                  border: '1px solid rgba(167, 139, 250, 0.4)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#a78bfa',
                  fontWeight: 600,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {deck.metadata.tags && deck.metadata.tags.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Tags
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {deck.metadata.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0, 209, 255, 0.2)',
                  border: '1px solid rgba(0, 209, 255, 0.4)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#00d1ff',
                  fontWeight: 600,
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
