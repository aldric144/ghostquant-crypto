'use client';

import React, { useState, useEffect } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import PitchSlidePreview from './PitchSlidePreview';
import PitchExportPanel from './PitchExportPanel';
import PitchDeckNavigator from './PitchDeckNavigator';
import { pitchdeckClient, Deck, DeckExportPackage, DeckSlide } from '@/lib/pitchdeckClient';

export default function PitchDeckPage() {
  const [deckType, setDeckType] = useState<'investor' | 'government'>('investor');
  const [companyName, setCompanyName] = useState('GhostQuant');
  const [generating, setGenerating] = useState(false);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [exportPackage, setExportPackage] = useState<DeckExportPackage | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [allSlides, setAllSlides] = useState<DeckSlide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const result = await pitchdeckClient.getMetadata();
        if (result.success) {
          setMetadata(result);
        }
      } catch (error) {
        console.error('Failed to load metadata:', error);
      }
    };
    loadMetadata();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setDeck(null);
    setExportPackage(null);
    setAllSlides([]);
    setCurrentSlideIndex(0);

    try {
      let result;
      if (deckType === 'investor') {
        result = await pitchdeckClient.generateInvestorDeck({
          company_name: companyName,
          company_profile: {},
        });
      } else {
        result = await pitchdeckClient.generateGovernmentDeck({
          agency_name: companyName,
          agency_profile: {},
        });
      }

      if (result.success && result.deck && result.export_package) {
        setDeck(result.deck);
        setExportPackage(result.export_package);
        
        const slides: DeckSlide[] = [];
        result.deck.sections.forEach(section => {
          slides.push(...section.slides);
        });
        setAllSlides(slides);
      } else {
        setError(result.error || 'Failed to generate deck');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate deck');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f18',
      color: '#ffffff',
      position: 'relative',
    }}>
      <StarfieldBackground />

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px',
        background: 'rgba(10, 15, 24, 0.95)',
        borderBottom: '2px solid #00d1ff',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 209, 255, 0.3)',
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#00d1ff',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px',
            }}>
              📊 GhostQuant Pitch Deck Generator™
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
            }}>
              Automated investor-grade pitch deck generation
            </p>
          </div>
          {metadata && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(0, 209, 255, 0.2)',
                border: '1px solid #00d1ff',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#00d1ff',
              }}>
                {metadata.investor_templates} Templates
              </div>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(167, 139, 250, 0.2)',
                border: '1px solid #a78bfa',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#a78bfa',
              }}>
                {metadata.export_formats?.length || 3} Formats
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '320px 1fr 380px',
        gap: '24px',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {/* Left Column - Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Generation Controls */}
          <div style={{
            padding: '24px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '2px solid #334155',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '16px',
            }}>
              Deck Configuration
            </h3>

            {/* Deck Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Deck Type
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  onClick={() => setDeckType('investor')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: deckType === 'investor' ? '#00d1ff' : 'transparent',
                    border: `1px solid ${deckType === 'investor' ? '#00d1ff' : '#334155'}`,
                    borderRadius: '6px',
                    color: deckType === 'investor' ? '#0a0f18' : '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Investor
                </button>
                <button
                  onClick={() => setDeckType('government')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: deckType === 'government' ? '#00d1ff' : 'transparent',
                    border: `1px solid ${deckType === 'government' ? '#00d1ff' : '#334155'}`,
                    borderRadius: '6px',
                    color: deckType === 'government' ? '#0a0f18' : '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Government
                </button>
              </div>
            </div>

            {/* Company Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Company/Agency Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !companyName}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: generating || !companyName ? '#1e293b' : '#00d1ff',
                border: 'none',
                borderRadius: '8px',
                color: generating || !companyName ? '#64748b' : '#0a0f18',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: generating || !companyName ? 'not-allowed' : 'pointer',
                boxShadow: generating || !companyName ? 'none' : '0 0 20px rgba(0, 209, 255, 0.4)',
              }}
            >
              {generating ? 'Generating...' : 'Generate Deck'}
            </button>
          </div>

          {/* Slide Navigator */}
          {allSlides.length > 0 && (
            <div style={{
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '2px solid #334155',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              maxHeight: 'calc(100vh - 400px)',
              overflowY: 'auto',
            }}>
              <PitchDeckNavigator
                slides={allSlides}
                currentSlideIndex={currentSlideIndex}
                onSlideSelect={setCurrentSlideIndex}
              />
            </div>
          )}
        </div>

        {/* Middle Column - Slide Preview */}
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
        }}>
          {error && (
            <div style={{
              padding: '16px',
              background: 'rgba(255, 59, 59, 0.1)',
              border: '1px solid rgba(255, 59, 59, 0.3)',
              borderRadius: '8px',
              color: '#ff3b3b',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!deck && !generating && !error && (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#64748b',
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '16px',
              }}>
                📊
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Generate Your Pitch Deck
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                lineHeight: '1.6',
              }}>
                Configure your deck settings and click "Generate Deck" to create a professional investor-grade pitch deck with 20-25 fully-written slides.
              </p>
            </div>
          )}

          {generating && (
            <div style={{
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid rgba(0, 209, 255, 0.2)',
                borderTop: '4px solid #00d1ff',
                borderRadius: '50%',
                margin: '0 auto 24px',
                animation: 'spin 1s linear infinite',
              }} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#00d1ff',
                marginBottom: '8px',
              }}>
                Generating Pitch Deck...
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
              }}>
                Creating {deckType} deck for {companyName}
              </p>
            </div>
          )}

          {allSlides.length > 0 && allSlides[currentSlideIndex] && (
            <PitchSlidePreview
              slide={allSlides[currentSlideIndex]}
              slideNumber={currentSlideIndex + 1}
            />
          )}
        </div>

        {/* Right Column - Export Panel */}
        <div style={{
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '2px solid #334155',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
        }}>
          <PitchExportPanel
            deck={deck}
            exportPackage={exportPackage}
          />
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
