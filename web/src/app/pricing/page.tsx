'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Check, 
  X, 
  Shield, 
  Zap, 
  Globe, 
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react'

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Choose Your Intelligence Tier
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From retail analysts to enterprise teams to national-level intelligence operations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tier 1: Retail Plus */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Retail Plus</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-cyan-400">$29</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">or $290/year (save 17%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Real-time predictions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Behavioral DNA™ quick scans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Entity lookup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Volatility detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Light API usage</span>
                  </li>
                </ul>

                <Link 
                  href="/signup?tier=retail"
                  className="block w-full py-3 text-center bg-slate-800/50 text-white font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
                >
                  Start Retail Plus
                </Link>
              </div>
            </div>

            {/* Tier 2: Pro Elite */}
            <div className="relative p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/50 rounded-xl shadow-xl shadow-cyan-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Pro Elite</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-cyan-400">$99</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">or $990/year (save 17%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">All Retail features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">UltraFusion Meta-AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Hydra Coordinated-Actor Detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Threat Actor Profiler™</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Global Radar Heatmap</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Token Intelligence Explorer</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">5,000 API calls/mo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Priority support</span>
                  </li>
                </ul>

                <Link 
                  href="/signup?tier=pro"
                  className="block w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
                >
                  Start Pro Elite
                </Link>
              </div>
            </div>

            {/* Tier 3: Institutional Command */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Institutional Command</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-cyan-400">$499</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">or $4,990/year (save 17%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full Hydra</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full UltraFusion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Global Constellation 3D Map</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Sentinel Command Console</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Genesis Archive access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Historical Replay + Cortex Memory</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Arbitration dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full developer API (50k calls)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Multi-user SSO</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">SOC 2 aligned logging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Compliance export</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Private Slack support</span>
                  </li>
                </ul>

                <Link 
                  href="/contact?type=institutional"
                  className="block w-full py-3 text-center bg-slate-800/50 text-white font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
                >
                  Contact Institutional Sales
                </Link>
              </div>
            </div>

            {/* Tier 4: Government / National Security */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Government / National Security Access</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-cyan-400">Custom Pricing</span>
                  </div>
                  <p className="text-sm text-gray-400">Contact for secure briefing</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">CJIS-aligned architecture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">FedRAMP LITE pathway</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">National-scale coordination detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Multi-chain correlation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Real-time constellation intelligence</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Regulatory + enforcement dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Air-gapped deployment available</span>
                  </li>
                </ul>

                <Link 
                  href="/contact?type=government"
                  className="block w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
                >
                  Request Secure Briefing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix Table */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Feature Comparison</h2>
            <p className="text-xl text-gray-400">
              Detailed breakdown of capabilities across all tiers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-white font-semibold">Feature</th>
                  <th className="text-center p-4 text-white font-semibold">Retail Plus</th>
                  <th className="text-center p-4 text-white font-semibold">Pro Elite</th>
                  <th className="text-center p-4 text-white font-semibold">Institutional</th>
                  <th className="text-center p-4 text-white font-semibold">Government</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Predictions</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Entity Intelligence</td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">Limited</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Token Explorer</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Fusion Engine</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Hydra</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">Limited</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Actor Profiler</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Oracle Eye (Image Forensics)</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Global Constellation Map</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Genesis Archive</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Radar Heatmap</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Sentinel Console</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">API Access</td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">1k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">5k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">50k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">SSO / IAM</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Compliance & Audit Exports</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Deployment Options</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Cloud/Hybrid</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">All Options</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about GhostQuant pricing
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Which tier is right for me?</span>
                {openFaq === 0 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 0 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  <p className="mb-3">
                    <strong className="text-white">Retail Plus</strong> is ideal for individual traders and analysts who need real-time predictions, entity lookups, and basic behavioral analysis. If you're managing a personal portfolio and want protection from manipulation, this tier provides essential intelligence at an accessible price point.
                  </p>
                  <p className="mb-3">
                    <strong className="text-white">Pro Elite</strong> is designed for professional traders, quantitative analysts, and small trading firms who require advanced features like UltraFusion Meta-AI, Hydra coordinated-actor detection, and comprehensive threat profiling. This tier is perfect if you're making trading decisions based on sophisticated market intelligence.
                  </p>
                  <p className="mb-3">
                    <strong className="text-white">Institutional Command</strong> serves hedge funds, exchanges, market makers, and large trading operations that need the complete intelligence stack, including Constellation 3D mapping, Genesis Archive, Sentinel Console, and enterprise-grade API access with SOC 2 compliance.
                  </p>
                  <p>
                    <strong className="text-white">Government / National Security</strong> is for regulatory agencies, law enforcement, and national security organizations requiring CJIS-aligned architecture, FedRAMP compliance, and air-gapped deployment options for sensitive operations.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Do you offer annual discounts?</span>
                {openFaq === 1 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 1 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Yes, all tiers offer approximately 17% savings when billed annually. Retail Plus is $290/year (vs $348 monthly), Pro Elite is $990/year (vs $1,188 monthly), and Institutional Command is $4,990/year (vs $5,988 monthly). Annual billing provides predictable costs and ensures uninterrupted access to intelligence services. Government contracts are structured based on specific requirements and may include multi-year agreements with custom terms.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Is GhostQuant suitable for hedge funds?</span>
                {openFaq === 2 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 2 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Absolutely. GhostQuant is built for institutional-grade intelligence and is already used by hedge funds managing billions in AUM. The Institutional Command tier provides everything hedge funds need: full Hydra cross-chain tracking, UltraFusion meta-analysis, Global Constellation network mapping, Genesis Archive for historical analysis, Sentinel Console for automated threat detection, and 50,000 API calls per month for programmatic integration. We also offer SOC 2 aligned logging, compliance exports, multi-user SSO, and private Slack support. For larger funds or those with specific requirements, we can provide custom deployments, dedicated infrastructure, and white-glove onboarding.
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Do governments need a separate contract?</span>
                {openFaq === 3 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 3 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Yes, government and regulatory agencies require specialized contracts that address security clearances, data sovereignty, compliance requirements (CJIS, FedRAMP, NIST 800-53), and deployment options including air-gapped systems. Government pricing is custom and depends on the scope of deployment, number of users, data retention requirements, and specific compliance needs. We work directly with procurement offices to structure contracts that meet federal acquisition regulations and agency-specific requirements. Contact us for a secure briefing to discuss your organization's needs.
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(4)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Is GhostQuant SOC 2 / NIST / FedRAMP aligned?</span>
                {openFaq === 4 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 4 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Yes. GhostQuant is built to meet the highest security and compliance standards. We maintain SOC 2 Type II certification for service organization controls, implement NIST 800-53 Rev 5 security controls, and are on the FedRAMP LITE authorization pathway for federal agency deployment. Our architecture also supports CJIS Security Policy v5.9 for law enforcement use and AML/KYC compliance (BSA/FinCEN) for financial institutions. All Institutional Command and Government tiers include compliance-ready audit logging, evidence trails, and documentation suitable for regulatory submission. We provide detailed compliance documentation during the sales process and can arrange security assessments for enterprise and government clients.
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(5)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Can I switch plans later?</span>
                {openFaq === 5 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 5 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, giving you instant access to additional features and higher API limits. When you upgrade, we prorate the remaining time on your current plan and apply it as credit toward your new tier. Downgrades take effect at the end of your current billing cycle to ensure you retain access to paid features through the period you've already paid for. Note that downgrading may result in loss of access to certain features (like Hydra, Constellation, or Genesis Archive) and reduced API limits, so we recommend reviewing your usage before downgrading.
                </div>
              )}
            </div>

            {/* FAQ 7 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(6)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Do you offer refunds?</span>
                {openFaq === 6 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 6 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  We offer a 14-day money-back guarantee for all new subscriptions (Retail Plus and Pro Elite tiers). If you're not satisfied with GhostQuant within the first 14 days, contact support for a full refund. After the 14-day period, subscriptions are non-refundable, but you can cancel at any time to prevent future charges. Institutional Command and Government contracts have custom terms negotiated during the sales process. We also offer free trials for Pro Elite upon request—contact sales to arrange a trial period before committing to a paid subscription.
                </div>
              )}
            </div>

            {/* FAQ 8 */}
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(7)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">Can we deploy GhostQuant on-prem?</span>
                {openFaq === 7 ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              {openFaq === 7 && (
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  Yes, on-premise and hybrid deployments are available for Institutional Command and Government tiers. We support deployment on your own infrastructure (cloud or physical data centers), hybrid configurations that combine cloud and on-prem components, and fully air-gapped systems for maximum security. On-prem deployments are ideal for organizations with strict data sovereignty requirements, regulatory constraints, or security policies that prohibit cloud-based intelligence systems. We provide full installation support, ongoing maintenance, and updates for on-prem deployments. Custom deployment options require an enterprise contract—contact our institutional sales team to discuss your specific requirements and receive a deployment architecture proposal.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA Strip */}
      <section className="relative py-16 border-b border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a Custom Deployment?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              On-prem systems, high-security integrations, or specialized intelligence requirements? We'll build a solution tailored to your organization.
            </p>
            <Link 
              href="/contact?type=enterprise"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
            >
              Request Enterprise Briefing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">GhostQuant™</h3>
              <p className="text-gray-400 text-sm">
                Intelligence Beyond the Visible
              </p>
            </div>

            {/* Links Column 1 */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <Link href="/" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/terminal" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Terminal
              </Link>
            </div>

            {/* Links Column 2 */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <Link href="/support" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Contact Sales
              </Link>
              <a href="mailto:info@ghostquant.com" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                info@ghostquant.com
              </a>
            </div>

            {/* Links Column 3 */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <Link href="/legal/terms" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/compliance" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Compliance
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-cyan-500/10">
            <p className="text-center text-gray-400 text-sm">
              © 2025 GhostQuant™. All rights reserved. Intelligence Beyond the Visible.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
