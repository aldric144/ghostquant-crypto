'use client';

import React, { useState, useEffect } from 'react';
import { deckClient, Deck, Theme, SlideTemplate, DeckSlide } from './DeckClient';
import DeckPreview from './DeckPreview';
import DeckEditor from './DeckEditor';

export default function DeckBuilderPage() {
  const [deckType, setDeckType] = useState<'investor' | 'government'>('investor');
  const [companyName, setCompanyName] = useState('GhostQuant');
  const [selectedTheme, setSelectedTheme] = useState('ghostquant_dark_fusion');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [slides, setSlides] = useState<SlideTemplate[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [allSlides, setAllSlides] = useState<DeckSlide[]>([]);
  const [building, setBuilding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
    loadSlides();
  }, []);

  useEffect(() => {
    loadSlides();
  }, [deckType]);

  useEffect(() => {
    if (deck) {
      const slides: DeckSlide[] = [];
      deck.sections.forEach(section => {
        slides.push(...section.slides);
      });
      setAllSlides(slides);
    }
  }, [deck]);

  const loadThemes = async () => {
    try {
      const response = await deckClient.getThemes();
      if (response.success) {
        setThemes(response.themes);
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
    }
  };

  const loadSlides = async () => {
    try {
      const response = await deckClient.getSlides(deckType);
      if (response.success) {
        setSlides(response.slides);
      }
    } catch (err) {
      console.error('Failed to load slides:', err);
    }
  };

  const handleBuildDeck = async () => {
    setBuilding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await deckClient.buildDeck({
        deck_type: deckType,
        company_name: companyName,
        theme: selectedTheme,
      });

      if (response.success) {
        setDeck(response.deck);
        setCurrentSlideIndex(0);
        setSuccess('Deck built successfully!');
      } else {
        setError('Failed to build deck');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build deck');
    } finally {
      setBuilding(false);
    }
  };

  const handleExportHTML = async () => {
    if (!deck) return;

    setExporting(true);
    try {
      const html = await deckClient.exportHTML(deck);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}_pitch_deck.html`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('HTML exported successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export HTML');
    } finally {
      setExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!deck) return;

    setExporting(true);
    try {
      const markdown = await deckClient.exportMarkdown(deck);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}_pitch_deck.md`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Markdown exported successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export Markdown');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!deck) return;

    setExporting(true);
    try {
      const json = await deckClient.exportJSON(deck);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}_pitch_deck.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('JSON exported successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export JSON');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!deck) return;

    setExporting(true);
    try {
      const pdfHtml = await deckClient.exportPDF(deck);
      const blob = new Blob([pdfHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}_pitch_deck_pdf.html`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('PDF-ready HTML exported! Open in browser and print to PDF.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < allSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f18 0%, #1a1f2e 100%)',
      color: '#e5e7eb',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          borderBottom: '2px solid #00d1ff',
          paddingBottom: '1rem',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #00d1ff 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            GhostQuant Investor Pitch Deck Builder™
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '1rem',
          }}>
            Interactive HTML/PDF Deck Generator
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#ef4444',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#10b981',
          }}>
            {success}
          </div>
        )}

        {/* 3-Panel Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr 380px',
          gap: '1.5rem',
          minHeight: '600px',
        }}>
          {/* LEFT PANEL - Controls & Slide List */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 209, 255, 0.2)',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#00d1ff',
            }}>
              Deck Configuration
            </h2>

            {/* Deck Type Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#9ca3af',
              }}>
                Deck Type
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setDeckType('investor')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: deckType === 'investor' ? '#00d1ff' : 'rgba(255, 255, 255, 0.1)',
                    color: deckType === 'investor' ? '#000' : '#e5e7eb',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Investor
                </button>
                <button
                  onClick={() => setDeckType('government')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: deckType === 'government' ? '#00d1ff' : 'rgba(255, 255, 255, 0.1)',
                    color: deckType === 'government' ? '#000' : '#e5e7eb',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Government
                </button>
              </div>
            </div>

            {/* Company Name Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#9ca3af',
              }}>
                Company/Agency Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Theme Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#9ca3af',
              }}>
                Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#e5e7eb',
                  fontSize: '1rem',
                }}
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Build Button */}
            <button
              onClick={handleBuildDeck}
              disabled={building}
              style={{
                width: '100%',
                padding: '1rem',
                background: building ? '#6b7280' : 'linear-gradient(90deg, #00d1ff 0%, #10b981 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: building ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              {building ? 'Building...' : 'Build Full Deck'}
            </button>

            {/* Slide Navigator */}
            {allSlides.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#00d1ff',
                }}>
                  Slides ({allSlides.length})
                </h3>
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}>
                  {allSlides.map((slide, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentSlideIndex(index)}
                      style={{
                        padding: '0.75rem',
                        background: index === currentSlideIndex ? 'rgba(0, 209, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: index === currentSlideIndex ? '2px solid #00d1ff' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: index === currentSlideIndex ? '#00d1ff' : '#e5e7eb',
                        marginBottom: '0.25rem',
                      }}>
                        {index + 1}. {slide.title}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                      }}>
                        {slide.bullets.length} bullets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE PANEL - Slide Preview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 209, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {allSlides.length > 0 ? (
              <>
                <DeckPreview
                  slide={allSlides[currentSlideIndex]}
                  slideNumber={currentSlideIndex + 1}
                />
                
                {/* Navigation Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem',
                }}>
                  <button
                    onClick={handlePreviousSlide}
                    disabled={currentSlideIndex === 0}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: currentSlideIndex === 0 ? '#374151' : 'rgba(0, 209, 255, 0.2)',
                      color: currentSlideIndex === 0 ? '#6b7280' : '#00d1ff',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      borderRadius: '6px',
                      cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === allSlides.length - 1}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: currentSlideIndex === allSlides.length - 1 ? '#374151' : 'rgba(0, 209, 255, 0.2)',
                      color: currentSlideIndex === allSlides.length - 1 ? '#6b7280' : '#00d1ff',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      borderRadius: '6px',
                      cursor: currentSlideIndex === allSlides.length - 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b7280',
                fontSize: '1.125rem',
              }}>
                Build a deck to preview slides
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Export Actions */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 209, 255, 0.2)',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#00d1ff',
            }}>
              Export Actions
            </h2>

            {deck ? (
              <>
                {/* Deck Info */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Company:</span>
                    <span style={{ color: '#e5e7eb', marginLeft: '0.5rem', fontWeight: 600 }}>
                      {deck.metadata.company_name}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Type:</span>
                    <span style={{ color: '#e5e7eb', marginLeft: '0.5rem', fontWeight: 600 }}>
                      {deck.metadata.deck_type}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Slides:</span>
                    <span style={{ color: '#e5e7eb', marginLeft: '0.5rem', fontWeight: 600 }}>
                      {deck.metadata.slide_count}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Theme:</span>
                    <span style={{ color: '#e5e7eb', marginLeft: '0.5rem', fontWeight: 600 }}>
                      {selectedTheme}
                    </span>
                  </div>
                </div>

                {/* Export Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={handleExportHTML}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Export HTML Slideshow
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Export PDF-Ready HTML
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Export Markdown
                  </button>

                  <button
                    onClick={handleExportJSON}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      border: '1px solid #a855f7',
                      borderRadius: '6px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    Export JSON
                  </button>
                </div>

                {/* Compliance Badges */}
                {deck.metadata.compliance_badges.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      color: '#9ca3af',
                    }}>
                      Compliance
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {deck.metadata.compliance_badges.map(badge => (
                        <span
                          key={badge}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            border: '1px solid #10b981',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                color: '#6b7280',
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: '2rem 0',
              }}>
                Build a deck to enable export options
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
