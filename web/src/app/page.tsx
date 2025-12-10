'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Brain, 
  Globe, 
  Network, 
  Eye, 
  Target, 
  Zap, 
  Database, 
  Activity,
  TrendingUp,
  Lock,
  CheckCircle,
  ArrowRight,
  Play,
  Scan,
  Map
} from 'lucide-react'
import { PredictionDemoModal, EntityScanDemoModal, RiskMapDemoModal } from '@/components/demo'

export default function HomePage() {
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [showEntityScanModal, setShowEntityScanModal] = useState(false)
  const [showRiskMapModal, setShowRiskMapModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="text-center space-y-8">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  The Intelligence Engine
                </span>
                <br />
                <span className="text-white">
                  for the Financial Future
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
                Real-time manipulation detection, behavioral analytics, multi-chain risk intelligence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/terminal"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Launch Terminal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                href="#pricing"
                className="px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
              >
                See Pricing
              </Link>
            </div>

            {/* Live Metrics */}
            <div className="inline-flex items-center gap-6 px-6 py-3 bg-slate-900/80 border border-cyan-500/20 rounded-full backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Active Threat Monitors: <span className="text-cyan-400 font-semibold">7</span></span>
              </div>
              <div className="w-px h-4 bg-cyan-500/20"></div>
              <div className="text-sm text-gray-400">
                Entities Observed: <span className="text-cyan-400 font-semibold">2,948</span>
              </div>
              <div className="w-px h-4 bg-cyan-500/20"></div>
              <div className="text-sm text-gray-400">
                Global Risk: <span className="text-yellow-400 font-semibold">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Strip */}
      <section className="relative py-16 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Block 1 */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Government-Grade Intelligence</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Built to CJIS, NIST 800-53, and FedRAMP standards. Forensic-grade evidence trails suitable for regulatory submission and legal proceedings.
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2 */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <Brain className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Autonomous Multi-Domain Detection</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    20+ specialized AI engines operating continuously to detect manipulation, track entities, and predict behavioral patterns across all chains.
                  </p>
                </div>
              </div>
            </div>

            {/* Block 3 */}
            <div className="group relative p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Real-Time Threat Mapping</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Cross-chain entity tracking with behavioral fingerprinting that persists despite obfuscation. See threats before they complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Intelligence Platform</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four core systems working together to reveal invisible market patterns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product 1 */}
            <div className="group relative p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg w-fit group-hover:bg-cyan-500/20 transition-colors">
                  <Network className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">GhostQuant Intelligence Engine</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  20+ specialized AI engines for autonomous threat detection, behavioral analysis, and predictive intelligence.
                </p>
                <Link href="/terminal" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Product 2 */}
            <div className="group relative p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg w-fit group-hover:bg-cyan-500/20 transition-colors">
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">UltraFusion Meta-AI</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Multi-domain intelligence synthesis combining blockchain, exchange, mempool, and social data into unified understanding.
                </p>
                <Link href="/terminal/ultrafusion" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Product 3 */}
            <div className="group relative p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg w-fit group-hover:bg-cyan-500/20 transition-colors">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Hydra Coordinated Actor Detection</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Cross-chain entity tracking with behavioral DNA fingerprinting that follows actors across Bitcoin, Ethereum, Solana, and L2s.
                </p>
                <Link href="/terminal/hydra" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Product 4 */}
            <div className="group relative p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg w-fit group-hover:bg-cyan-500/20 transition-colors">
                  <Globe className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Global Constellation 3D Map</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Network topology visualization revealing entity relationships, money flows, and coordinated behavior patterns.
                </p>
                <Link href="/terminal/constellation" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subsystem Highlight Section */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Intelligence Subsystems</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Specialized engines for every aspect of crypto market intelligence
            </p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Behavioral DNA */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Behavioral DNA™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Every entity leaves a unique behavioral signature—transaction patterns, timing preferences, gas optimization strategies, and interaction networks. Behavioral DNA creates persistent fingerprints that follow actors across addresses, chains, and time. Unlike traditional blockchain analysis that tracks addresses, we track behavior. This allows identification of sophisticated actors who attempt to obscure their activity through mixing, tumbling, or address rotation. Behavioral patterns persist despite obfuscation attempts, enabling attribution and tracking that would be impossible through address clustering alone.
                </p>
              </div>
            </div>

            {/* Oracle Eye */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Eye className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Oracle Eye™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Visual pattern recognition for charts, order books, and market microstructure. Oracle Eye applies computer vision and pattern matching to identify manipulation that manifests visually but is difficult to quantify algorithmically. Detects spoofing through order book visualization, identifies layering patterns in depth charts, and recognizes coordinated pump-and-dump schemes through price action signatures. The system learns from historical manipulation events to identify similar patterns in real-time, providing visual evidence alongside quantitative analysis. Essential for detecting sophisticated manipulation tactics that exploit human visual processing limitations.
                </p>
              </div>
            </div>

            {/* Threat Actor Profiler */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Threat Actor Profiler™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Comprehensive profiling of market participants based on behavioral history, manipulation indicators, and network relationships. Builds detailed dossiers including historical activity timelines, manipulation tactics employed, credibility scores, and relationship maps. Profiles evolve continuously as new behavior is observed, maintaining accuracy even as actors adapt their tactics. Risk scoring (0-10 scale) with confidence intervals and supporting evidence enables informed decision-making about counterparty risk. Essential for exchanges conducting due diligence, institutions assessing counterparty risk, and regulators investigating suspicious activity. Profiles are forensic-grade with complete audit trails suitable for regulatory submission.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sentinel Command Console */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sentinel Command Console™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Advanced threat detection and alert management system with complex multi-condition logic, predictive alerts, and automated response workflows. Sentinel operates continuously, monitoring all intelligence engines for patterns that indicate threats. Supports sophisticated alert logic combining multiple signals—for example, trigger when whale movement exceeds threshold AND manipulation risk is elevated AND network topology shows coordinated behavior. Predictive alerts forecast likely threats based on pattern recognition and historical precedent. Automated response workflows enable instant action when threats are detected. Integration with external systems (Slack, PagerDuty, custom webhooks) ensures alerts reach the right people instantly. Essential for institutional operations requiring 24/7 monitoring.
                </p>
              </div>
            </div>

            {/* Global Radar Heatmap */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Global Radar Heatmap™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Real-time visualization of market-wide risk and anomaly detection across all monitored chains and exchanges. Radar displays risk intensity through color-coded heatmaps, enabling instant identification of elevated threat areas. Monitors Bitcoin, Ethereum, Solana, Polygon, Arbitrum, Optimism, and 100+ exchanges simultaneously. Anomaly detection algorithms identify deviations from normal behavior—unusual volume spikes, coordinated activity, manipulation patterns. Custom heatmap configurations allow focus on specific sectors, chains, or risk types. Correlation matrices reveal relationships between seemingly unrelated events. Essential for market makers, exchanges, and institutions requiring comprehensive market surveillance. Updates in real-time as new data arrives.
                </p>
              </div>
            </div>

            {/* Genesis Archive */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Database className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Genesis Archive™</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Deep historical analysis and pattern reconstruction from 10+ years of blockchain data. Genesis Archive enables time-series analysis, behavioral evolution tracking, and historical precedent identification. Reconstruct past events from incomplete data through pattern completion and inference. Identify long-term behavioral patterns that reveal entity strategies and tactics. Historical scenario replay allows testing of detection algorithms against known manipulation events. Essential for research, due diligence, and understanding how current patterns relate to historical precedent. Forensic-grade evidence preservation with complete chain of custody suitable for legal proceedings. Unlimited data retention for institutional and government clients ensures no evidence is lost to time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Strip */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">See GhostQuant in Action</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the power of autonomous intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Demo 1 */}
            <div 
              onClick={() => setShowPredictionModal(true)}
              className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto group-hover:bg-cyan-500/20 transition-colors">
                  <Play className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white text-center">Run Prediction</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                  Forecast entity behavior and market movements with behavioral forecasting models
                </p>
                <div className="pt-4 text-center">
                  <span className="text-cyan-400 text-sm font-semibold group-hover:text-cyan-300">
                    Try Demo →
                  </span>
                </div>
              </div>
            </div>

            {/* Demo 2 */}
            <div 
              onClick={() => setShowEntityScanModal(true)}
              className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto group-hover:bg-cyan-500/20 transition-colors">
                  <Scan className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white text-center">Scan Entity</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                  Deep behavioral analysis and risk scoring for any blockchain address or entity
                </p>
                <div className="pt-4 text-center">
                  <span className="text-cyan-400 text-sm font-semibold group-hover:text-cyan-300">
                    Try Demo →
                  </span>
                </div>
              </div>
            </div>

            {/* Demo 3 */}
            <div 
              onClick={() => setShowRiskMapModal(true)}
              className="group relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto group-hover:bg-cyan-500/20 transition-colors">
                  <Map className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white text-center">View Risk Map</h3>
                <p className="text-gray-400 text-sm text-center leading-relaxed">
                  Global market surveillance with real-time anomaly detection and threat visualization
                </p>
                <div className="pt-4 text-center">
                  <span className="text-cyan-400 text-sm font-semibold group-hover:text-cyan-300">
                    Try Demo →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Strip */}
      <section id="pricing" className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Intelligence Tier</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From retail traders to federal agencies—intelligence for every need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Retail Plus */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Retail Plus</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-cyan-400">$49</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">$470/year (save 20%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full manipulation detection across all patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">100 analyses/day, 25 active alerts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Basic behavioral DNA and entity tracking</span>
                  </li>
                </ul>

                <Link 
                  href="#pricing"
                  className="block w-full py-3 text-center bg-slate-800/50 text-white font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
                >
                  View Full Pricing
                </Link>
              </div>
            </div>

            {/* Pro Elite */}
            <div className="relative p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/50 rounded-xl shadow-xl shadow-cyan-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Elite</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-cyan-400">$499</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">$4,790/year (save 20%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full Hydra cross-chain tracking (6 blockchains)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Constellation 3D network mapping</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Unlimited analysis, UltraFusion meta-AI</span>
                  </li>
                </ul>

                <Link 
                  href="#pricing"
                  className="block w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
                >
                  View Full Pricing
                </Link>
              </div>
            </div>

            {/* Institutional Command */}
            <div className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Institutional Command</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-cyan-400">$9,999</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">$95,990/year (save 20%)</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Complete intelligence stack, dedicated nodes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Custom predictive models, 5,000 req/min API</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Genesis Archive, compliance reporting bundle</span>
                  </li>
                </ul>

                <Link 
                  href="#pricing"
                  className="block w-full py-3 text-center bg-slate-800/50 text-white font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
                >
                  View Full Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built for Enterprise & Government</h2>
            <p className="text-lg text-gray-400">
              Compliance-ready infrastructure meeting the highest security standards
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {/* Badge 1 */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <Lock className="w-8 h-8 text-cyan-400 mb-3" />
              <span className="text-white font-semibold text-sm text-center">SOC 2 Ready</span>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <Shield className="w-8 h-8 text-cyan-400 mb-3" />
              <span className="text-white font-semibold text-sm text-center">NIST-Aligned</span>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <CheckCircle className="w-8 h-8 text-cyan-400 mb-3" />
              <span className="text-white font-semibold text-sm text-center">FedRAMP LITE Pathway</span>
            </div>

            {/* Badge 4 */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <Target className="w-8 h-8 text-cyan-400 mb-3" />
              <span className="text-white font-semibold text-sm text-center">AML/KYC Compliant</span>
            </div>

            {/* Badge 5 */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300">
              <Network className="w-8 h-8 text-cyan-400 mb-3" />
              <span className="text-white font-semibold text-sm text-center">Enterprise API</span>
            </div>
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
              <Link href="#pricing" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/terminal" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Terminal
              </Link>
              <Link href="/docs" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Documentation
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

      {/* Demo Modals */}
      <PredictionDemoModal 
        isOpen={showPredictionModal} 
        onClose={() => setShowPredictionModal(false)} 
      />
      <EntityScanDemoModal 
        isOpen={showEntityScanModal} 
        onClose={() => setShowEntityScanModal(false)} 
      />
      <RiskMapDemoModal 
        isOpen={showRiskMapModal} 
        onClose={() => setShowRiskMapModal(false)} 
      />
    </div>
  )
}
