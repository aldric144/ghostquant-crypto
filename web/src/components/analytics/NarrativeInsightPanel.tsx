'use client';

import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Info, AlertCircle, Copy, Check } from 'lucide-react';

interface NarrativeHighlight {
  title: string;
  detail: string;
  severity: string;
}

interface NarrativeData {
  summary: string;
  market_regime: string;
  risk_outlook_24h: string;
  key_highlights: NarrativeHighlight[];
  call_to_action: string;
  demo_mode: boolean;
}

interface NarrativeInsightPanelProps {
  refreshToken: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ghostquant-mewzi.ondigitalocean.app';

export default function NarrativeInsightPanel({ refreshToken }: NarrativeInsightPanelProps) {
  const [data, setData] = useState<NarrativeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_BASE_URL}/demo/analytics/narrative`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { cancelled = true; };
  }, [refreshToken]);

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'RISK_OFF': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'RISK_ON': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'UNSTABLE': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    const text = `GhostQuant Intelligence Summary\n\n${data.summary}\n\nMarket Regime: ${data.market_regime}\n\n24h Outlook:\n${data.risk_outlook_24h}\n\nRecommended Action: ${data.call_to_action}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-700 rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-900/50 border border-red-500/30 rounded-xl">
        <p className="text-red-400 text-sm">Failed to load narrative data</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">AI Intelligence Summary</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRegimeColor(data.market_regime)}`}>
            {data.market_regime.replace('_', ' ')}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy summary"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-slate-800/50 rounded-lg mb-4 border border-slate-700">
        <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">24h Risk Outlook</h4>
        <p className="text-gray-300 text-sm leading-relaxed">{data.risk_outlook_24h}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Highlights</h4>
        <div className="space-y-2">
          {data.key_highlights.map((highlight, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${getSeverityBg(highlight.severity)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getSeverityIcon(highlight.severity)}
                <span className="font-semibold text-sm text-white">{highlight.title}</span>
              </div>
              <p className="text-xs text-gray-400 ml-6">{highlight.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-400">Recommended Action</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">{data.call_to_action}</p>
      </div>
    </div>
  );
}
