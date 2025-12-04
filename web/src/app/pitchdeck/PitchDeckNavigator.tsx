'use client';

import React from 'react';
import { DeckSlide } from '@/lib/pitchdeckClient';

interface PitchDeckNavigatorProps {
  slides: DeckSlide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

export default function PitchDeckNavigator({ slides, currentSlideIndex, onSlideSelect }: PitchDeckNavigatorProps) {
  if (slides.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#64748b',
      }}>
        No slides available
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {/* Navigation Header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0, 209, 255, 0.1)',
        border: '1px solid rgba(0, 209, 255, 0.3)',
        borderRadius: '8px',
        marginBottom: '8px',
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#00d1ff',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Slide Navigator
        </h3>
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          marginTop: '4px',
        }}>
          {slides.length} slides total
        </p>
      </div>

      {/* Slide List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto',
      }}>
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onSlideSelect(index)}
            style={{
              padding: '12px',
              background: currentSlideIndex === index
                ? 'linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)'
                : 'rgba(15, 23, 42, 0.4)',
              border: `2px solid ${currentSlideIndex === index ? '#00d1ff' : '#334155'}`,
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (currentSlideIndex !== index) {
                e.currentTarget.style.borderColor = '#475569';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSlideIndex !== index) {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '6px',
            }}>
              <span style={{
                minWidth: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: currentSlideIndex === index ? '#00d1ff' : '#334155',
                color: currentSlideIndex === index ? '#0a0f18' : '#94a3b8',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}>
                {index + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: currentSlideIndex === index ? '#ffffff' : '#e2e8f0',
                  marginBottom: '2px',
                  lineHeight: '1.3',
                }}>
                  {slide.title}
                </div>
                {slide.subtitle && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: currentSlideIndex === index ? '#00d1ff' : '#94a3b8',
                    lineHeight: '1.3',
                  }}>
                    {slide.subtitle.length > 50 ? slide.subtitle.substring(0, 50) + '...' : slide.subtitle}
                  </div>
                )}
              </div>
            </div>
            
            {/* Bullet Count */}
            {slide.bullets && slide.bullets.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
              }}>
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(55, 255, 176, 0.2)',
                  border: '1px solid rgba(55, 255, 176, 0.3)',
                  borderRadius: '4px',
                  fontSize: '0.625rem',
                  color: '#37ffb0',
                  fontWeight: 600,
                }}>
                  {slide.bullets.length} bullets
                </span>
                {slide.visuals && slide.visuals.length > 0 && (
                  <span style={{
                    padding: '2px 8px',
                    background: 'rgba(167, 139, 250, 0.2)',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    borderRadius: '4px',
                    fontSize: '0.625rem',
                    color: '#a78bfa',
                    fontWeight: 600,
                  }}>
                    {slide.visuals.length} visuals
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
      }}>
        <button
          onClick={() => onSlideSelect(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          style={{
            flex: 1,
            padding: '10px',
            background: currentSlideIndex === 0 ? '#1e293b' : '#00d1ff',
            border: 'none',
            borderRadius: '6px',
            color: currentSlideIndex === 0 ? '#64748b' : '#0a0f18',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => onSlideSelect(Math.min(slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          style={{
            flex: 1,
            padding: '10px',
            background: currentSlideIndex === slides.length - 1 ? '#1e293b' : '#00d1ff',
            border: 'none',
            borderRadius: '6px',
            color: currentSlideIndex === slides.length - 1 ? '#64748b' : '#0a0f18',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: currentSlideIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
