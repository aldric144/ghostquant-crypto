'use client';

import React from 'react';
import { DeckSlide } from './DeckClient';

interface DeckPreviewProps {
  slide: DeckSlide;
  slideNumber: number;
}

export default function DeckPreview({ slide, slideNumber }: DeckPreviewProps) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Slide Number Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          background: 'rgba(0, 209, 255, 0.2)',
          border: '1px solid #00d1ff',
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#00d1ff',
        }}>
          Slide {slideNumber}
        </div>
        
        {slide.confidence && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
            }}>
              Confidence:
            </span>
            <div style={{
              width: '100px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${slide.confidence * 100}%`,
                height: '100%',
                background: slide.confidence > 0.8 ? '#10b981' : slide.confidence > 0.6 ? '#00d1ff' : '#f59e0b',
                transition: 'width 0.3s',
              }} />
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: slide.confidence > 0.8 ? '#10b981' : slide.confidence > 0.6 ? '#00d1ff' : '#f59e0b',
            }}>
              {Math.round(slide.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Title and Subtitle */}
      <div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: '#00d1ff',
          marginBottom: '0.5rem',
          lineHeight: 1.2,
        }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#9ca3af',
            lineHeight: 1.4,
          }}>
            {slide.subtitle}
          </h3>
        )}
      </div>

      {/* Bullet Points */}
      {slide.bullets && slide.bullets.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 209, 255, 0.1)',
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {slide.bullets.map((bullet, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  minWidth: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00d1ff 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#000',
                  flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <span style={{
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: '#e5e7eb',
                }}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Narrative */}
      {slide.narrative && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 209, 255, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#00d1ff',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Narrative
          </h4>
          <p style={{
            fontSize: '0.875rem',
            lineHeight: 1.7,
            color: '#d1d5db',
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {slide.narrative}
          </p>
        </div>
      )}

      {/* Visual Elements */}
      {slide.visuals && slide.visuals.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#00d1ff',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Visual Elements
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            {slide.visuals.map((visual, index) => (
              <span
                key={index}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#10b981',
                  fontWeight: 500,
                }}
              >
                {visual}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {slide.risk_flags && slide.risk_flags.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ef4444',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            ⚠️ Risk Flags
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {slide.risk_flags.map((flag, index) => (
              <li
                key={index}
                style={{
                  fontSize: '0.875rem',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: '#ef4444' }}>•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
