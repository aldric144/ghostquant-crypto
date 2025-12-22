'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  ArrowRight,
  Play,
  Scan,
  Map,
  Radio,
  Archive,
  Command,
  Radar,
  Users
} from 'lucide-react'

// Particle field component for hero background
function ParticleField() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number, speed: number}>>([])
  
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 2 + 0.5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.speed * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1321] to-[#0a0e1a]">
      {/* SECTION A - HERO SECTION */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated particle field */}
        <ParticleField />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main headline with glowing effect */}
            <div className="space-y-6">
              <motion.h1 
                className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="relative">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30"></span>
                  <span className="relative bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    GhostQuant™
                  </span>
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-2xl sm:text-3xl lg:text-4xl text-cyan-100 font-light max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Autonomous Intelligence for the Global Financial System
              </motion.p>
              
              <motion.p 
                className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                The world's first multi-domain AI that detects manipulation, tracks coordinated actors, analyzes risk, and predicts market behavior across every major blockchain — in real time.
              </motion.p>

              <motion.p 
                className="text-xl text-cyan-400 font-medium italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Invisible signals. Undetected threats. Now visible.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Link 
                href="/terminal/home"
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-3">
                  Launch Terminal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                href="/pricing"
                className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
              >
                See Pricing
              </Link>
            </motion.div>

            {/* Live Metrics Row */}
            <motion.div 
              className="inline-flex flex-wrap justify-center items-center gap-6 px-8 py-4 bg-[#0d1321]/80 border border-cyan-500/30 rounded-2xl backdrop-blur-xl mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm text-gray-400">Threat Detectors Active: <span className="text-cyan-400 font-bold text-lg">27</span></span>
              </div>
              <div className="w-px h-6 bg-cyan-500/30"></div>
              <div className="text-sm text-gray-400">
                Entities Observed: <span className="text-cyan-400 font-bold text-lg">3,942</span>
              </div>
              <div className="w-px h-6 bg-cyan-500/30"></div>
              <div className="text-sm text-gray-400">
                Global Market Risk: <span className="text-yellow-400 font-bold text-lg">Moderate</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION B - WHY GHOSTQUANT EXISTS */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Beyond Analytics. This Is{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Autonomous Market Intelligence.
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Markets move fast — but manipulation moves faster. GhostQuant's 20+ intelligence engines continuously monitor:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Database, label: "Blockchain transactions" },
              { icon: Activity, label: "Mempool behavior" },
              { icon: TrendingUp, label: "Exchange order books" },
              { icon: Network, label: "Cross-chain money flows" },
              { icon: Lock, label: "Darkpool movement" },
              { icon: Users, label: "Whale coordination" },
              { icon: Radio, label: "Social manipulation signals" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-4 bg-[#0d1321]/60 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-gray-300">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              All interpreted through behavioral DNA, UltraFusion meta-AI, and Hydra coordinated actor detection.
            </p>
            <p className="text-2xl text-white font-semibold">
              You don't just see the markets.
            </p>
            <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold">
              You see the forces controlling them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION C - FOUR PILLARS */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">The Four Pillars</h2>
            <p className="text-xl text-gray-400">Core systems powering autonomous market intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 - GhostQuant Intelligence Engine */}
            <motion.div
              className="group relative p-8 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <Network className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">GhostQuant Intelligence Engine</h3>
                <p className="text-gray-400 leading-relaxed">
                  20+ specialized AI engines for autonomous threat detection, behavioral analysis, and predictive intelligence across all major blockchains.
                </p>
                <Link href="/terminal/home" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Pillar 2 - UltraFusion Meta-AI */}
            <motion.div
              className="group relative p-8 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <Zap className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">UltraFusion Meta-AI</h3>
                <p className="text-gray-400 leading-relaxed">
                  Multi-domain intelligence synthesis combining blockchain, exchange, mempool, and social data into unified market understanding.
                </p>
                <Link href="/terminal/ultrafusion" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Pillar 3 - Hydra Coordinated Actor Detection */}
            <motion.div
              className="group relative p-8 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <Target className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Hydra Coordinated Actor Detection</h3>
                <p className="text-gray-400 leading-relaxed">
                  Cross-chain entity tracking with behavioral DNA fingerprinting that follows actors across Bitcoin, Ethereum, Solana, and L2s.
                </p>
                <Link href="/terminal/hydra" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Pillar 4 - Global Constellation 3D Map */}
            <motion.div
              className="group relative p-8 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <Globe className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Global Constellation 3D Map</h3>
                <p className="text-gray-400 leading-relaxed">
                  Network topology visualization revealing entity relationships, money flows, and coordinated behavior patterns in real-time.
                </p>
                <Link href="/terminal/constellation" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group/link">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION D - INTELLIGENCE SUBSYSTEMS */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Intelligence Subsystems</h2>
            <p className="text-xl text-gray-400">Specialized engines for every aspect of market intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Behavioral DNA */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Behavioral DNA™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Every entity leaves a unique behavioral signature—transaction patterns, timing preferences, gas optimization strategies, and interaction networks. Creates persistent fingerprints that follow actors across addresses, chains, and time.
                </p>
              </div>
            </motion.div>

            {/* Oracle Eye */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Eye className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Oracle Eye™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Visual pattern recognition for charts, order books, and market microstructure. Detects spoofing, layering patterns, and coordinated pump-and-dump schemes through price action signatures.
                </p>
              </div>
            </motion.div>

            {/* Threat Actor Profiler */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Target className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Threat Actor Profiler™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Comprehensive profiling of market participants based on behavioral history, manipulation indicators, and network relationships. Builds detailed dossiers with risk scoring and forensic-grade evidence trails.
                </p>
              </div>
            </motion.div>

            {/* Sentinel Command Console */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Command className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sentinel Command Console™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Unified command center for monitoring all intelligence streams, configuring alerts, and coordinating response actions. Real-time dashboard with customizable threat thresholds.
                </p>
              </div>
            </motion.div>

            {/* Global Radar Heatmap */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Radar className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Global Radar Heatmap™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Geographic and network-based visualization of threat activity, showing concentration of suspicious behavior, emerging hotspots, and cross-jurisdictional patterns.
                </p>
              </div>
            </motion.div>

            {/* Genesis Archive */}
            <motion.div
              className="group p-8 bg-gradient-to-br from-[#0d1321]/80 to-[#0a0e1a]/60 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                    <Archive className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Genesis Archive™</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Complete historical intelligence database with forensic-grade audit trails. Query past events, reconstruct timelines, and generate compliance reports for regulatory submission.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION E - GHOSTQUANT IN ACTION */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">GhostQuant in Action</h2>
            <p className="text-xl text-gray-400">Experience the power of autonomous market intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Run Prediction */}
            <motion.div
              className="group relative p-10 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="mx-auto p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-2xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <Play className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Run Prediction</h3>
                <p className="text-gray-400">
                  Execute AI-powered market predictions using multi-domain intelligence synthesis
                </p>
                <Link 
                  href="/terminal/predict"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Run Prediction
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Scan Entity */}
            <motion.div
              className="group relative p-10 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="mx-auto p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-2xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <Scan className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Scan Entity</h3>
                <p className="text-gray-400">
                  Deep-dive analysis of any wallet, contract, or entity with behavioral DNA profiling
                </p>
                <Link 
                  href="/entity-explorer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Scan Entity
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* View Risk Map */}
            <motion.div
              className="group relative p-10 bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border border-cyan-500/20 rounded-2xl hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative space-y-6">
                <div className="mx-auto p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-2xl w-fit group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <Map className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">View Risk Map</h3>
                <p className="text-gray-400">
                  Global threat visualization with real-time risk assessment across all monitored chains
                </p>
                <Link 
                  href="/threat-map"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  View Risk Map
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                GhostQuant™
              </h3>
              <p className="text-gray-400 text-sm">
                Autonomous Intelligence for the Global Financial System
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-400 hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><Link href="/apidocs" className="text-gray-400 hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link href="/terminal/home" className="text-gray-400 hover:text-cyan-400 transition-colors">Terminal</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/sales" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact Sales</Link></li>
                <li><Link href="/compliance" className="text-gray-400 hover:text-cyan-400 transition-colors">Compliance</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Discord</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-cyan-500/10 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GhostQuant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
