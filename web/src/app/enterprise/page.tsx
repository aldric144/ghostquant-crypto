'use client'

import Link from 'next/link'
import { 
  Check, 
  X,
  Shield, 
  Brain, 
  Globe, 
  Network, 
  Eye, 
  Target, 
  Zap, 
  Database, 
  Activity,
  Lock,
  Server,
  Cloud,
  HardDrive,
  ArrowRight,
  Layers,
  GitBranch,
  Radar,
  Scan,
  AlertTriangle
} from 'lucide-react'

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                GhostQuant Enterprise
              </span>
              <br />
              <span className="text-white">
                Intelligence Suite
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
              A full-spectrum intelligence platform for institutions, exchanges, and national security partners.
            </p>

            {/* Floating Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">UltraFusion AI Supervisor™</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Hydra Coordinated Actor Engine™</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Sentinel Command Console™</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Module Grid */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise Intelligence Modules</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Twelve specialized systems working in concert to provide comprehensive market intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Module 1: UltraFusion Meta-AI */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">UltraFusion Meta-AI</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Multi-domain intelligence synthesis combining blockchain, exchange, mempool, and social data into unified threat understanding. The AI supervisor that coordinates all other intelligence engines.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Cross-domain pattern correlation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Autonomous threat prioritization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Predictive intelligence generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Real-time anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-chain event fusion</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/ultrafusion"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 2: Hydra Coordinated Network Engine */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Network className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Hydra Coordinated Network Engine</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Cross-chain entity tracking with behavioral DNA fingerprinting that follows actors across Bitcoin, Ethereum, Solana, and L2s despite obfuscation attempts. Persistent identity tracking through mixing and tumbling.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Behavioral DNA fingerprinting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Cross-chain entity linking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Coordinated actor detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Obfuscation-resistant tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-chain correlation engine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Network topology analysis</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/hydra"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 3: Global Constellation Map */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Globe className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Global Constellation Map</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  3D network topology visualization revealing entity relationships, money flows, and coordinated behavior patterns across all monitored chains. Interactive force-directed graph with risk-based coloring.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">3D force-directed visualization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Real-time relationship mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Risk-based node coloring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Money flow visualization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Cluster detection algorithms</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/constellation"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 4: Sentinel Command Console */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Shield className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sentinel Command Console</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Advanced threat detection and alert management system with complex multi-condition logic, predictive alerts, and automated response workflows. 24/7 autonomous monitoring with instant escalation.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-condition alert logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Predictive threat forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Automated response workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">External system integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Custom escalation policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Slack/PagerDuty/webhook support</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/sentinel"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 5: Cortex Memory Engine */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Cortex Memory Engine</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Long-term intelligence storage and retrieval system that maintains institutional knowledge of entities, patterns, and historical events. Enables pattern recognition across years of market data.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Persistent entity knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Historical pattern matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Behavioral evolution tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Cross-temporal correlation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Institutional memory retention</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/cortex"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 6: Genesis Archive */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Database className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Genesis Archive</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Deep historical analysis and pattern reconstruction from 10+ years of blockchain data. Forensic-grade evidence preservation with complete chain of custody suitable for legal proceedings and regulatory submission.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">10+ years historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Forensic-grade preservation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Chain of custody tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Historical scenario replay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Regulatory evidence export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Unlimited data retention</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/genesis"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 7: Threat Actor Profiler */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Target className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Threat Actor Profiler</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Comprehensive profiling of market participants based on behavioral history, manipulation indicators, and network relationships. Risk scoring with confidence intervals and supporting evidence for due diligence.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Behavioral history analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Manipulation tactic identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Risk scoring (0-10 scale)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Relationship mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Credibility assessment</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/profiler"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 8: Operation Hydra */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <GitBranch className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Operation Hydra</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Large-scale coordinated investigation framework for tracking sophisticated multi-actor operations. Designed for regulatory agencies and law enforcement conducting complex market manipulation investigations.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-actor coordination tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Case file management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Evidence collection workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Timeline reconstruction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Regulatory report generation</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/operation-hydra"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 9: Global Manipulation Radar */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Radar className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Global Manipulation Radar</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Real-time visualization of market-wide risk and anomaly detection across all monitored chains and exchanges. Color-coded heatmaps enable instant identification of elevated threat areas and coordinated activity.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Real-time risk heatmaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-chain surveillance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Anomaly detection algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">100+ exchange monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Correlation matrix analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Custom sector filtering</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/radar"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 10: Oracle Eye */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Eye className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Oracle Eye</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Visual pattern recognition for charts, order books, and market microstructure. Computer vision and pattern matching to identify manipulation that manifests visually but is difficult to quantify algorithmically.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Computer vision analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Order book spoofing detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Layering pattern recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Pump-and-dump signatures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Visual evidence generation</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/oracle-eye"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 11: Ring Intelligence Engine */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Layers className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Ring Intelligence Engine</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Circular cluster detection for identifying coordinated actor rings operating in concert. Detects wash trading rings, pump groups, and sophisticated multi-party manipulation schemes through behavioral clustering.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Circular cluster detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Wash trading identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Pump group detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-party scheme analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Behavioral clustering algorithms</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/ring"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Module 12: Chain Pressure Analyzer */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Chain Pressure Analyzer</h3>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Network congestion and gas price manipulation detection. Identifies attempts to manipulate transaction ordering through gas price manipulation, MEV exploitation, and mempool manipulation tactics.
                </p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Gas price manipulation detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">MEV exploitation tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Mempool manipulation analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Transaction ordering attacks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Network congestion monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Front-running detection</span>
                  </li>
                </ul>

                <Link 
                  href="/enterprise/chain-pressure"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Comparison Table */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise Tier Comparison</h2>
            <p className="text-xl text-gray-400">
              Choose the deployment that matches your organization's requirements
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-white font-semibold">Feature</th>
                  <th className="text-center p-4 text-white font-semibold">Institutional Command</th>
                  <th className="text-center p-4 text-white font-semibold">Institutional Max</th>
                  <th className="text-center p-4 text-white font-semibold">Government</th>
                  <th className="text-center p-4 text-white font-semibold">National Security Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">UltraFusion Access</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Hydra</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Constellation Map</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Sentinel</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Cortex Memory</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Genesis Ledger</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Actor Profiling</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">API Rate Limits</td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">50k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">500k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">SSO / IAM</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300">Deployment Options</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Cloud/Hybrid</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">All Options</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Air-Gapped Only</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Deployment Options</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the infrastructure model that meets your security and operational requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cloud Enterprise */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <Cloud className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Cloud Enterprise</h3>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Fully managed cloud deployment with enterprise-grade infrastructure, automatic scaling, and 24/7 monitoring.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">SOC 2 aligned infrastructure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Multi-region deployment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Automatic updates & patches</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Managed backups & disaster recovery</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <span className="text-cyan-400 font-semibold">Best for: Hedge funds, exchanges, trading firms</span>
                </div>
              </div>
            </div>

            {/* Hybrid Cloud */}
            <div className="relative p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/50 rounded-xl shadow-xl shadow-cyan-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-full">
                Recommended
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <Server className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Hybrid Cloud</h3>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Sensitive modules deployed on-premises while non-critical components run in the cloud. Best of both worlds for security and performance.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Sensitive modules local</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Non-critical modules cloud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">SSO + VPN integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Data sovereignty compliance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Flexible scaling options</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <span className="text-cyan-400 font-semibold">Best for: Large institutions, banks, regulated entities</span>
                </div>
              </div>
            </div>

            {/* Air-Gapped Government */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <HardDrive className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Air-Gapped Government Edition</h3>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  Completely isolated deployment with zero external data flow. Maximum security for classified operations and national security applications.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Zero external data flow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Available only to governments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Dedicated hardware deployment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Offline updates via secure media</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">CJIS & FedRAMP compliant</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <span className="text-cyan-400 font-semibold">Best for: National security, law enforcement, regulators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Schedule an Enterprise Intelligence Briefing
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Our enterprise team will walk you through the complete GhostQuant intelligence suite, discuss your specific requirements, and design a deployment architecture tailored to your organization.
            </p>
            <Link 
              href="/contact?type=enterprise"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
            >
              Request Enterprise Consultation
              <ArrowRight className="w-6 h-6" />
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
              <Link href="/enterprise" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Enterprise
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
