'use client';

import React, { useState } from 'react';
import { DeckSlide } from './DeckClient';

interface DeckEditorProps {
  slide: DeckSlide;
  onSave: (updatedSlide: DeckSlide) => void;
  onCancel: () => void;
}

export default function DeckEditor({ slide, onSave, onCancel }: DeckEditorProps) {
  const [editedSlide, setEditedSlide] = useState<DeckSlide>({ ...slide });

  const handleTitleChange = (value: string) => {
    setEditedSlide({ ...editedSlide, title: value });
  };

  const handleSubtitleChange = (value: string) => {
    setEditedSlide({ ...editedSlide, subtitle: value });
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...editedSlide.bullets];
    newBullets[index] = value;
    setEditedSlide({ ...editedSlide, bullets: newBullets });
  };

  const handleAddBullet = () => {
    setEditedSlide({
      ...editedSlide,
      bullets: [...editedSlide.bullets, ''],
    });
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = editedSlide.bullets.filter((_, i) => i !== index);
    setEditedSlide({ ...editedSlide, bullets: newBullets });
  };

  const handleNarrativeChange = (value: string) => {
    setEditedSlide({ ...editedSlide, narrative: value });
  };

  const handleSave = () => {
    onSave(editedSlide);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      height: '100%',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1rem',
        borderBottom: '2px solid rgba(0, 209, 255, 0.3)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#00d1ff',
        }}>
          Edit Slide
        </h2>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(90deg, #00d1ff 0%, #10b981 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* Title Input */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#9ca3af',
          }}>
            Title
          </label>
          <input
            type="text"
            value={editedSlide.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Subtitle Input */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#9ca3af',
          }}>
            Subtitle
          </label>
          <input
            type="text"
            value={editedSlide.subtitle}
            onChange={(e) => handleSubtitleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Bullets */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#9ca3af',
            }}>
              Bullet Points
            </label>
            <button
              onClick={handleAddBullet}
              style={{
                padding: '0.25rem 0.75rem',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid #10b981',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              + Add Bullet
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {editedSlide.bullets.map((bullet, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  minWidth: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00d1ff 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#000',
                }}>
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 209, 255, 0.3)',
                    borderRadius: '6px',
                    color: '#e5e7eb',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  onClick={() => handleRemoveBullet(index)}
                  style={{
                    padding: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#9ca3af',
          }}>
            Narrative
          </label>
          <textarea
            value={editedSlide.narrative}
            onChange={(e) => handleNarrativeChange(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              borderRadius: '6px',
              color: '#e5e7eb',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Metadata Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid rgba(0, 209, 255, 0.1)',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#00d1ff',
            marginBottom: '0.75rem',
          }}>
            Slide Metadata
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Visuals:</span>
              <span style={{ color: '#e5e7eb', marginLeft: '0.5rem' }}>
                {editedSlide.visuals.length} elements
              </span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Risk Flags:</span>
              <span style={{ color: '#e5e7eb', marginLeft: '0.5rem' }}>
                {editedSlide.risk_flags.length} flags
              </span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Confidence:</span>
              <span style={{ color: '#e5e7eb', marginLeft: '0.5rem' }}>
                {Math.round(editedSlide.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
