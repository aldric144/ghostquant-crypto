'use client';

import React from 'react';
import { DeckSlide } from '@/lib/pitchdeckClient';

interface PitchSlidePreviewProps {
  slide: DeckSlide;
  slideNumber: number;
}

export default function PitchSlidePreview({ slide, slideNumber }: PitchSlidePreviewProps) {
  return (
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #0a0f18 0%, #1a1f2e 100%)',
      border: '2px solid #00d1ff',
      borderRadius: '16px',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxShadow: '0 8px 32px rgba(0, 209, 255, 0.3)',
    }}>
      {/* Slide Number */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        padding: '8px 16px',
        background: 'rgba(0, 209, 255, 0.2)',
        border: '1px solid #00d1ff',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 700,
        color: '#00d1ff',
      }}>
        Slide {slideNumber}
      </div>

      {/* Title */}
      <div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p style={{
            fontSize: '1.125rem',
            color: '#00d1ff',
            fontWeight: 600,
          }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Bullet Points */}
      {slide.bullets && slide.bullets.length > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {slide.bullets.map((bullet, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '1rem',
                color: '#e2e8f0',
                lineHeight: '1.6',
              }}
            >
              <span style={{
                minWidth: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#00d1ff',
                color: '#0a0f18',
                borderRadius: '50%',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginTop: '2px',
              }}>
                {index + 1}
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Narrative */}
      {slide.narrative && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 209, 255, 0.1)',
          border: '1px solid rgba(0, 209, 255, 0.3)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          maxHeight: '150px',
          overflowY: 'auto',
        }}>
          {slide.narrative}
        </div>
      )}

      {/* Visuals */}
      {slide.visuals && slide.visuals.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            Visual Elements
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {slide.visuals.map((visual, index) => (
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
                {visual}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {slide.risk_flags && slide.risk_flags.length > 0 && (
        <div style={{
          padding: '12px',
          background: 'rgba(255, 107, 157, 0.1)',
          border: '1px solid rgba(255, 107, 157, 0.3)',
          borderRadius: '8px',
        }}>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#ff6b9d',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Risk Flags
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {slide.risk_flags.map((flag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 107, 157, 0.2)',
                  borderRadius: '4px',
                  fontSize: '0.625rem',
                  color: '#ff6b9d',
                  fontWeight: 600,
                }}
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {slide.confidence !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}>
            Confidence:
          </span>
          <div style={{
            flex: 1,
            height: '8px',
            background: 'rgba(148, 163, 184, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${slide.confidence * 100}%`,
              height: '100%',
              background: slide.confidence >= 0.8 ? '#37ffb0' : slide.confidence >= 0.6 ? '#00d1ff' : '#ffb84d',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: slide.confidence >= 0.8 ? '#37ffb0' : slide.confidence >= 0.6 ? '#00d1ff' : '#ffb84d',
          }}>
            {(slide.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
