'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { FileText, Download, CheckCircle, AlertCircle, Loader2, Shield, Building2, FileCheck } from 'lucide-react'
import { rfpClient, RFPGenerateResponse, RFPSection, RFPSummary } from '@/lib/rfpClient'

export default function RFPBuilderPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rfpData, setRfpData] = useState<RFPGenerateResponse | null>(null)
  const [activeSection, setActiveSection] = useState<string>('executive_summary')
  const [health, setHealth] = useState<any>(null)
  
  const [agency, setAgency] = useState('Department of Homeland Security')
  const [solicitationNumber, setSolicitationNumber] = useState('DHS-2025-001')
  const [deadline, setDeadline] = useState('2025-12-31')

  useEffect(() => {
    loadHealth()
  }, [])

  const loadHealth = async () => {
    try {
      const response = await rfpClient.health()
      setHealth(response.health)
    } catch (err) {
      console.error('Health check failed:', err)
    }
  }

  const handleGenerateFullRFP = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfpClient.generateRFP({
        agency,
        solicitation_number: solicitationNumber,
        deadline
      })
      
      setRfpData(response)
      setActiveSection('executive_summary')
    } catch (err: any) {
      setError(err.message || 'Failed to generate RFP')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSection = async (sectionName: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await rfpClient.generateSection(sectionName, {
        agency,
        solicitation_number: solicitationNumber,
        deadline
      })
      
      if (rfpData) {
        const updatedSections = rfpData.sections.map(s => 
          s.name === sectionName ? response.section : s
        )
        
        if (!updatedSections.find(s => s.name === sectionName)) {
          updatedSections.push(response.section)
        }
        
        setRfpData({
          ...rfpData,
          sections: updatedSections
        })
      }
      
      setActiveSection(sectionName)
    } catch (err: any) {
      setError(err.message || `Failed to generate section: ${sectionName}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExportJSON = async () => {
    try {
      const response = await rfpClient.exportJSON()
      rfpClient.downloadFile(
        response.content,
        `GhostQuant-RFP-${response.document_id}.json`,
        'application/json'
      )
    } catch (err: any) {
      setError(err.message || 'Failed to export JSON')
    }
  }

  const handleExportMarkdown = async () => {
    try {
      const response = await rfpClient.exportMarkdown()
      rfpClient.downloadFile(
        response.content,
        `GhostQuant-RFP-${response.document_id}.md`,
        'text/markdown'
      )
    } catch (err: any) {
      setError(err.message || 'Failed to export Markdown')
    }
  }

  const handleExportHTML = async () => {
    try {
      const response = await rfpClient.exportHTML()
      rfpClient.downloadFile(
        response.content,
        `GhostQuant-RFP-${response.document_id}.html`,
        'text/html'
      )
    } catch (err: any) {
      setError(err.message || 'Failed to export HTML')
    }
  }

  const sectionTitles: Record<string, string> = {
    executive_summary: 'Executive Summary',
    technical_volume: 'Technical Volume',
    management_volume: 'Management Volume',
    past_performance: 'Past Performance',
    compliance_volume: 'Compliance Volume',
    pricing_volume: 'Pricing Volume',
    integration_volume: 'Integration Volume',
    appendices: 'Appendices',
    required_forms: 'Required Forms'
  }

  const activeContent = rfpData?.sections.find(s => s.name === activeSection)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <FileText className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Government RFP Pack Generator™</h1>
            <p className="text-gray-400">Automated RFP response generation for federal procurement</p>
          </div>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Controls */}
        <div className="col-span-3 space-y-6">
          {/* Context Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              RFP Context
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Agency</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="Department of Homeland Security"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Solicitation Number</label>
                <input
                  type="text"
                  value={solicitationNumber}
                  onChange={(e) => setSolicitationNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="DHS-2025-001"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Response Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Generate Controls */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              Generate
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleGenerateFullRFP}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Full RFP
                  </>
                )}
              </button>
              
              <div className="pt-3 border-t border-cyan-500/20">
                <p className="text-xs text-gray-400 mb-2">Generate Individual Section:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(sectionTitles).map(([key, title]) => (
                    <button
                      key={key}
                      onClick={() => handleGenerateSection(key)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export Controls */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Export
            </h2>
            
            <div className="space-y-2">
              <button
                onClick={handleExportJSON}
                disabled={!rfpData}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              
              <button
                onClick={handleExportMarkdown}
                disabled={!rfpData}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Markdown
              </button>
              
              <button
                onClick={handleExportHTML}
                disabled={!rfpData}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export HTML
              </button>
            </div>
          </div>

          {/* Health Status */}
          {health && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                System Health
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Status: {health.status}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Version: {health.version}
                </div>
                <div className="text-xs text-gray-400">
                  Sections: {health.available_sections?.length || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - RFP Viewer */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-4">RFP Document Viewer</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {!rfpData && !loading && (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No RFP Generated</p>
                <p className="text-gray-500 text-sm">Click "Generate Full RFP" to create a complete response package</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-20">
                <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400 text-lg mb-2">Generating RFP...</p>
                <p className="text-gray-500 text-sm">This may take a few moments</p>
              </div>
            )}
            
            {rfpData && !loading && (
              <div>
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-cyan-500/20">
                  {rfpData.sections.map((section) => (
                    <button
                      key={section.name}
                      onClick={() => setActiveSection(section.name)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeSection === section.name
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'bg-slate-800/50 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/40'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
                
                {/* Section Content */}
                {activeContent && (
                  <div className="prose prose-invert max-w-none">
                    <div className="mb-4 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/20">
                      <h3 className="text-lg font-bold text-white mb-2">{activeContent.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>Word Count: {activeContent.word_count.toLocaleString()}</span>
                        <span>Subsections: {activeContent.subsections.length}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/20 rounded-lg p-6 border border-cyan-500/10 max-h-[600px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                        {activeContent.content}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Summary & Metadata */}
        <div className="col-span-3 space-y-6">
          {rfpData && (
            <>
              {/* Document Metadata */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Document Metadata</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Document ID</p>
                    <p className="text-sm text-cyan-400 font-mono">{rfpData.document_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Agency</p>
                    <p className="text-sm text-white">{rfpData.metadata.agency}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Solicitation Number</p>
                    <p className="text-sm text-white">{rfpData.metadata.solicitation_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Deadline</p>
                    <p className="text-sm text-white">{rfpData.metadata.response_deadline}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Generated</p>
                    <p className="text-sm text-white">{new Date(rfpData.metadata.generated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Summary Statistics</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total Sections</p>
                    <p className="text-3xl font-bold text-cyan-400">{rfpData.summary.total_sections}</p>
                  </div>
                  
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total Words</p>
                    <p className="text-3xl font-bold text-cyan-400">{rfpData.summary.total_words.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Section Breakdown</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {rfpData.summary.sections.map((section) => (
                        <div key={section.name} className="p-2 bg-slate-800/30 rounded border border-cyan-500/10">
                          <p className="text-sm text-white font-semibold">{section.title}</p>
                          <p className="text-xs text-gray-400">{section.word_count.toLocaleString()} words</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Frameworks */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Compliance Frameworks</h2>
                
                <div className="space-y-2">
                  {rfpData.metadata.compliance_frameworks.map((framework) => (
                    <div key={framework} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded border border-cyan-500/10">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">{framework}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrity Hash */}
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Integrity Hash</h2>
                
                <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-500/10">
                  <p className="text-xs text-cyan-400 font-mono break-all">{rfpData.summary.integrity_hash}</p>
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  SHA-256 hash for document verification and integrity checking
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
