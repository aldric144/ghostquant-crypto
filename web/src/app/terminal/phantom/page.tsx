'use client'

import ModuleGuide, { ModuleGuideButton } from '../../../components/terminal/ModuleGuide'
import { getModuleGuideContent } from '../../../components/terminal/moduleGuideContent'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
;

/**
 * Phantom Deception Engine™ - Voice-Print Analyzer
 * Real-time fraud detection and deception scoring interface
 */

import { useState, useEffect } from 'react';
import { phantomClient, PhantomResult } from '@/lib/phantomClient';

export default function PhantomPage() {
  const [showGuide, setShowGuide] = useState(false)
  const [transcript, setTranscript] = useState('');
  const [metadata, setMetadata] = useState('');
  const [result, setResult] = useState<PhantomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PhantomResult[]>([]);

  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return 'text-purple-400 border-purple-500 bg-purple-500/20';
    if (score >= 0.6) return 'text-red-400 border-red-500 bg-red-500/20';
    if (score >= 0.4) return 'text-orange-400 border-orange-500 bg-orange-500/20';
    if (score >= 0.2) return 'text-yellow-400 border-yellow-500 bg-yellow-500/20';
    return 'text-green-400 border-green-500 bg-green-500/20';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-purple-400 bg-purple-500/20';
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      case 'MODERATE': return 'text-orange-400 bg-orange-500/20';
      case 'LOW': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let metadataObj = {};
      if (metadata.trim()) {
        try {
          metadataObj = JSON.parse(metadata);
        } catch (e) {
          setError('Invalid metadata JSON');
          setLoading(false);
          return;
        }
      }

      const response = await phantomClient.analyze(transcript, metadataObj);

      if (response.success && response.result) {
        setResult(response.result);
        setHistory(prev => [response.result!, ...prev].slice(0, 10));
        setError(null);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getCircularGaugePosition = (score: number) => {
    const angle = (score * 180) - 90; // -90 to 90 degrees
    return angle;
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-8">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <h1 className="text-4xl font-bold mb-2 text-cyan-300">
          👻 Phantom Deception Engine™
        </h1>
        <p className="text-cyan-500">
          Voice-Print Behavioral Analysis • Fraud Detection • Scammer Signature Classification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Voice-Print Analyzer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">
              🎤 Voice-Print Deception Analyzer
            </h2>

            {/* Transcript Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-cyan-400">
                Transcript / Communication Text
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Enter transcript, message, or communication text to analyze for deception indicators..."
                className="w-full h-32 p-3 bg-black border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-cyan-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Metadata Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-cyan-400">
                Optional Metadata (JSON)
              </label>
              <textarea
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder='{"wallet": "0x...", "ip_risk": 0.5, "device_anomaly": 0.3}'
                className="w-full h-20 p-3 bg-black border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-cyan-700 focus:outline-none focus:border-cyan-500 font-mono text-sm"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black font-bold rounded-lg transition-colors"
            >
              {loading ? 'Analyzing...' : '🔍 Analyze Deception'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <>
              {/* Deception Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Deception Score - Circular Gauge */}
                <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-4 text-cyan-400 text-center">
                    Deception Score
                  </h3>
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Circular gauge background */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke={result.deception_score >= 0.8 ? '#a855f7' : result.deception_score >= 0.6 ? '#ef4444' : result.deception_score >= 0.4 ? '#f97316' : '#22c55e'}
                        strokeWidth="8"
                        strokeDasharray={`${result.deception_score * 351.86} 351.86`}
                        className={result.deception_score >= 0.7 ? 'animate-pulse' : ''}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${result.deception_score >= 0.8 ? 'text-purple-400' : result.deception_score >= 0.6 ? 'text-red-400' : result.deception_score >= 0.4 ? 'text-orange-400' : 'text-green-400'}`}>
                          {(result.deception_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intent Score - Horizontal Bar */}
                <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-4 text-cyan-400">
                    Intent Score
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Benign</span>
                      <span className="font-bold">{(result.intent_score * 100).toFixed(0)}%</span>
                      <span>Malicious</span>
                    </div>
                    <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${result.intent_score >= 0.7 ? 'bg-red-500' : result.intent_score >= 0.5 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                        style={{ width: `${result.intent_score * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-center text-xs text-cyan-500">
                    {result.intent_score >= 0.8 ? 'MALICIOUS' : result.intent_score >= 0.6 ? 'SUSPICIOUS' : result.intent_score >= 0.4 ? 'QUESTIONABLE' : 'UNCLEAR'}
                  </div>
                </div>

                {/* Synthetic Probability - Horizontal Bar */}
                <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-4 text-cyan-400">
                    Synthetic Identity
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Human</span>
                      <span className="font-bold">{(result.synthetic_probability * 100).toFixed(0)}%</span>
                      <span>Bot/AI</span>
                    </div>
                    <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${result.synthetic_probability >= 0.7 ? 'bg-purple-500' : result.synthetic_probability >= 0.5 ? 'bg-orange-500' : 'bg-cyan-500'}`}
                        style={{ width: `${result.synthetic_probability * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-center text-xs text-cyan-500">
                    {result.synthetic_probability >= 0.7 ? 'SYNTHETIC' : result.synthetic_probability >= 0.5 ? 'POSSIBLE BOT' : 'LIKELY HUMAN'}
                  </div>
                </div>
              </div>

              {/* Signature Classification */}
              <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">
                  🎭 Signature Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-cyan-500 mb-1">Actor Type</div>
                    <div className="text-2xl font-bold text-cyan-300">{result.actor_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-500 mb-1">Risk Level</div>
                    <div className={`text-2xl font-bold ${getRiskColor(result.classification)}`}>
                      {result.classification}
                    </div>
                  </div>
                </div>
                {result.signature && (
                  <div className="mt-4 p-3 bg-black/50 rounded-lg border border-cyan-500/20">
                    <div className="text-sm text-cyan-400 leading-relaxed">
                      {result.signature.pattern}
                    </div>
                  </div>
                )}
              </div>

              {/* Flags */}
              {result.flags && result.flags.length > 0 && (
                <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-cyan-300">
                    🚩 Active Flags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-300 text-sm font-semibold"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Panel */}
              <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">
                  📋 Analysis Narrative
                </h3>

                {/* Summary */}
                <div className="mb-4 p-4 bg-black/50 rounded-lg border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Summary</h4>
                  <p className="text-cyan-300 leading-relaxed">{result.summary}</p>
                </div>

                {/* Full Narrative */}
                <div className="p-4 bg-black/50 rounded-lg border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Detailed Analysis</h4>
                  <p className="text-cyan-300 leading-relaxed">{result.narrative}</p>
                </div>
              </div>

              {/* Feature Radar */}
              <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">
                  📡 Feature Domain Radar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Linguistic', value: result.features_used?.linguistic_risk || 0 },
                    { name: 'Behavioral', value: result.features_used?.behavioral_risk || 0 },
                    { name: 'Synthetic', value: result.features_used?.synthetic_risk || 0 },
                    { name: 'Emotional', value: result.features_used?.emotional_risk || 0 },
                    { name: 'Metadata', value: result.features_used?.metadata_risk || 0 },
                    { name: 'Overall', value: result.features_used?.overall_risk || 0 },
                  ].map((domain, idx) => (
                    <div key={idx} className="p-3 bg-black/50 rounded-lg border border-cyan-500/20">
                      <div className="text-xs text-cyan-500 mb-2">{domain.name}</div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full ${domain.value >= 0.7 ? 'bg-red-500' : domain.value >= 0.5 ? 'bg-orange-500' : domain.value >= 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${domain.value * 100}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold text-cyan-300">
                        {(domain.value * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Timeline */}
        <div className="space-y-6">
          {/* Deception Timeline */}
          <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-cyan-300">
              ⏱️ Deception Timeline
            </h3>
            
            {history.length === 0 ? (
              <div className="text-center text-cyan-500 py-8">
                No analyses yet
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 transition-all ${getSeverityColor(item.deception_score)} ${
                      item.deception_score >= 0.7 ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">
                        {item.actor_type}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold mb-1">
                      Deception: {(item.deception_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs opacity-75">
                      Intent: {(item.intent_score * 100).toFixed(0)}% • 
                      Synthetic: {(item.synthetic_probability * 100).toFixed(0)}%
                    </div>
                    <div className="mt-2 text-xs">
                      <span className={`px-2 py-1 rounded ${getRiskColor(item.classification)}`}>
                        {item.classification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {history.length > 0 && (
            <div className="p-6 bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-cyan-300">
                📊 Session Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-500">Total Analyses</span>
                  <span className="text-lg font-bold text-cyan-300">{history.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-500">High Deception</span>
                  <span className="text-lg font-bold text-red-300">
                    {history.filter(h => h.deception_score >= 0.6).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-500">Synthetic Detected</span>
                  <span className="text-lg font-bold text-purple-300">
                    {history.filter(h => h.synthetic_probability >= 0.7).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-500">Avg Deception</span>
                  <span className="text-lg font-bold text-cyan-300">
                    {((history.reduce((sum, h) => sum + h.deception_score, 0) / history.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    
      {/* Module Guide Panel */}
      <ModuleGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        content={getModuleGuideContent('Phantom')}
      />
    </div>
  );
}
