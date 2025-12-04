'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertCircle, Presentation } from 'lucide-react'
import { pitchdeckClient, type Deck, type DeckSlide, type DeckExportPackage } from '@/lib/pitchdeckClient'

export default function PitchDeckConsolePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deckType, setDeckType] = useState<'investor' | 'government' | 'custom'>('investor')
  const [companyName, setCompanyName] = useState('GhostQuant')
  const [agencyName, setAgencyName] = useState('Government Agency')
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
  const [exportPackage, setExportPackage] = useState<DeckExportPackage | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [deckHistory, setDeckHistory] = useState<Array<{name: string, type: string, timestamp: string}>>([])
  const [metadata, setMetadata] = useState<any>(null)

  useEffect(() => {
    loadMetadata()
  }, [])

  const loadMetadata = async () => {
    const result = await pitchdeckClient.getMetadata()
    if (result.success) {
      setMetadata(result)
    }
  }

  const handleGenerateDeck = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let result
      
      if (deckType === 'investor') {
        result = await pitchdeckClient.generateInvestorDeck({
          company_name: companyName,
          company_profile: {}
        })
      } else if (deckType === 'government') {
        result = await pitchdeckClient.generateGovernmentDeck({
          agency_name: agencyName,
          agency_profile: {}
        })
      } else {
        setError('Custom deck generation not yet implemented')
        setLoading(false)
        return
      }
      
      if (result.success && result.deck && result.export_package) {
        setCurrentDeck(result.deck)
        setExportPackage(result.export_package)
        setCurrentSlideIndex(0)
        
        const historyItem = {
          name: deckType === 'investor' ? companyName : agencyName,
          type: deckType,
          timestamp: new Date().toISOString()
        }
        setDeckHistory([historyItem, ...deckHistory.slice(0, 9)])
      } else {
        setError(result.error || 'Failed to generate deck')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate deck')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (format: 'json' | 'markdown' | 'html') => {
    if (!exportPackage) return
    
    let content = ''
    let filename = ''
    let mimeType = ''
    
    if (format === 'json') {
      content = JSON.stringify(exportPackage.deck_json, null, 2)
      filename = `${currentDeck?.metadata.company_name || 'deck'}.json`
      mimeType = 'application/json'
    } else if (format === 'markdown') {
      content = exportPackage.deck_markdown
      filename = `${currentDeck?.metadata.company_name || 'deck'}.md`
      mimeType = 'text/markdown'
    } else if (format === 'html') {
      content = exportPackage.deck_html
      filename = `${currentDeck?.metadata.company_name || 'deck'}.html`
      mimeType = 'text/html'
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getAllSlides = (): DeckSlide[] => {
    if (!currentDeck) return []
    const slides: DeckSlide[] = []
    for (const section of currentDeck.sections) {
      slides.push(...section.slides)
    }
    return slides
  }

  const currentSlide = getAllSlides()[currentSlideIndex]

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleNextSlide = () => {
    const allSlides = getAllSlides()
    if (currentSlideIndex < allSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Presentation className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Pitch Deck Generator™</h1>
            <p className="text-gray-400">Investor-grade and government-grade pitch decks</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Three-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Deck Type & Generation */}
        <div className="col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Deck Type
            </h2>
            
            <div className="space-y-3 mb-4">
              <button
                onClick={() => setDeckType('investor')}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  deckType === 'investor'
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                    : 'bg-slate-800/50 border border-purple-500/20 text-gray-400 hover:border-purple-500/40'
                }`}
              >
                <div className="font-semibold">Investor Deck</div>
                <div className="text-xs text-gray-400">15-20 slides</div>
              </button>
              
              <button
                onClick={() => setDeckType('government')}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  deckType === 'government'
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                    : 'bg-slate-800/50 border border-purple-500/20 text-gray-400 hover:border-purple-500/40'
                }`}
              >
                <div className="font-semibold">Government Deck</div>
                <div className="text-xs text-gray-400">20-30 slides</div>
              </button>
              
              <button
                onClick={() => setDeckType('custom')}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  deckType === 'custom'
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                    : 'bg-slate-800/50 border border-purple-500/20 text-gray-400 hover:border-purple-500/40'
                }`}
              >
                <div className="font-semibold">Custom Deck</div>
                <div className="text-xs text-gray-400">Select templates</div>
              </button>
            </div>
            
            {deckType === 'investor' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="Company name"
                />
              </div>
            )}
            
            {deckType === 'government' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="Agency name"
                />
              </div>
            )}
            
            <button
              onClick={handleGenerateDeck}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Deck
                </>
              )}
            </button>
          </div>

          {/* Deck History */}
          {deckHistory.length > 0 && (
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">History</h2>
              
              <div className="space-y-2">
                {deckHistory.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-800/30 rounded-lg border border-purple-500/10">
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.type} • {new Date(item.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {metadata && (
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">System Info</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">{metadata.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Investor Templates:</span>
                  <span className="text-white">{metadata.investor_templates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gov Templates:</span>
                  <span className="text-white">{metadata.government_templates}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Slide Viewer */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Slide Viewer</h2>
            
            {currentDeck && currentSlide ? (
              <div className="space-y-6">
                {/* Slide Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="px-4 py-2 bg-slate-800/50 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400">
                      Slide {currentSlideIndex + 1} of {getAllSlides().length}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === getAllSlides().length - 1}
                    className="px-4 py-2 bg-slate-800/50 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Slide Content */}
                <div className="p-6 bg-white rounded-lg text-gray-900 min-h-[500px]">
                  <h2 className="text-3xl font-bold text-purple-600 mb-2">{currentSlide.title}</h2>
                  <h3 className="text-xl text-gray-600 mb-6">{currentSlide.subtitle}</h3>
                  
                  <ul className="space-y-3 mb-6">
                    {currentSlide.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-lg">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm leading-relaxed">{currentSlide.narrative.substring(0, 300)}...</p>
                  </div>
                  
                  {currentSlide.visuals.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-2">Visuals:</div>
                      <div className="space-y-1">
                        {currentSlide.visuals.map((visual, index) => (
                          <div key={index} className="text-sm text-blue-700">{visual}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentSlide.risk_flags.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Risk Flags:</div>
                      <div className="space-y-1">
                        {currentSlide.risk_flags.map((flag, index) => (
                          <div key={index} className="text-sm text-yellow-700">{flag}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload('json')}
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/20 text-white text-sm rounded-lg hover:border-purple-500/50 hover:bg-slate-800/70 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleDownload('markdown')}
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/20 text-white text-sm rounded-lg hover:border-purple-500/50 hover:bg-slate-800/70 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Markdown
                  </button>
                  <button
                    onClick={() => handleDownload('html')}
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/20 text-white text-sm rounded-lg hover:border-purple-500/50 hover:bg-slate-800/70 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    HTML
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Generate a deck to view slides</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Executive Summary & Details */}
        <div className="col-span-3 space-y-6">
          {currentDeck && (
            <>
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Executive Summary
                </h2>
                
                <p className="text-sm text-gray-300 leading-relaxed">
                  {currentDeck.executive_summary.substring(0, 400)}...
                </p>
              </div>

              <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Deck Details</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{currentDeck.metadata.deck_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Slides:</span>
                    <span className="text-white">{currentDeck.metadata.slide_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sections:</span>
                    <span className="text-white">{currentDeck.metadata.section_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version:</span>
                    <span className="text-white">{currentDeck.metadata.version}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Compliance Badges</h2>
                
                <div className="flex flex-wrap gap-2">
                  {currentDeck.metadata.compliance_badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Table of Contents</h2>
                
                <div className="space-y-2">
                  {currentDeck.table_of_contents.map((item, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {index + 1}. {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
