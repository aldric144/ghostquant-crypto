'use client'

import Link from 'next/link'
import { Check, X, Shield, Lock, Server, ArrowRight } from 'lucide-react'
import { getAllLicenseTiers, contractOptions } from '@/lib/licensingModel'

export default function LicensingPage() {
  const tiers = getAllLicenseTiers()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                GhostQuant Enterprise & Government Licensing
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Mission-critical intelligence for national security, financial stability, and global risk protection.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">CJIS-Aligned Architecture</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">FedRAMP LITE Ready</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Critical Infrastructure Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Licensing Models */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Licensing Models</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the licensing framework that matches your organization's security and operational requirements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="relative p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300"
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {tier.description}
                    </p>
                  </div>

                  {/* Scope */}
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Scope</p>
                    <p className="text-sm text-cyan-400">{tier.scope}</p>
                  </div>

                  {/* Key Capabilities */}
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Key Capabilities</p>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {tier.capabilities.slice(0, 8).map((capability, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-xs">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deployment */}
                  <div className="space-y-2 pt-4 border-t border-cyan-500/20">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Deployment:</span>
                      <span className="text-cyan-400 font-semibold text-right max-w-[60%]">{tier.deployment.split(' ').slice(0, 4).join(' ')}...</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">SLA:</span>
                      <span className="text-cyan-400 font-semibold">{tier.sla.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Availability Matrix */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Feature Availability Matrix</h2>
            <p className="text-xl text-gray-400">
              Comprehensive breakdown of intelligence capabilities across licensing tiers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-white font-semibold sticky left-0 bg-slate-950">Feature</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[180px]">Enterprise (EIL)</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[180px]">Government (GIL)</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[200px]">National Security (NSL)</th>
                </tr>
              </thead>
              <tbody>
                {/* Hydra multi-head detection */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Hydra multi-head detection</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* UltraFusion supervisor */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">UltraFusion supervisor</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Constellation 3D map */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Constellation 3D map</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Sentinel command console */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Sentinel command console</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Cortex Memory Engine */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Cortex Memory Engine</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Genesis Archive (immutable ledger) */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Genesis Archive (immutable ledger)</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Threat Actor Profiler */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Threat Actor Profiler</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Oracle Eye image intelligence */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Oracle Eye image intelligence</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* 24/7 alert ingestion */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">24/7 alert ingestion</td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Air-gapped offline mode */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Air-gapped offline mode</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-red-400 text-sm font-semibold">Air-Gapped Only</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contract Options */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Contract Options</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Flexible licensing structures designed for diverse organizational needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contractOptions.map((option) => (
              <div
                key={option.id}
                className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{option.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  <div className="pt-4 border-t border-cyan-500/20">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Suitable For</p>
                    <p className="text-sm text-cyan-400">{option.suitableFor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance Panel */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Security & Compliance</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built to meet the highest security and regulatory standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CJIS Readiness */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <Shield className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">CJIS Readiness</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  GhostQuant architecture aligns with CJIS Security Policy v5.9 requirements for law enforcement and criminal justice information systems. Includes advanced authentication, audit controls, encryption standards, and personnel security measures required for handling sensitive justice data.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Multi-factor authentication (MFA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Encryption at rest and in transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Comprehensive audit logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Personnel security screening</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* FedRAMP LITE Roadmap */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <Lock className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">FedRAMP LITE Roadmap</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  GhostQuant is on the FedRAMP LITE authorization pathway for federal agency cloud deployments. Our roadmap includes Third Party Assessment Organization (3PAO) evaluation, Authority to Operate (ATO) package preparation, and continuous monitoring implementation for federal compliance.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">NIST 800-53 control implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Continuous monitoring (ConMon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">FedRAMP authorized hosting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">3PAO assessment readiness</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* SOC 2 Type II Control Posture */}
            <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <Server className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">SOC 2 Type II Control Posture</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  GhostQuant maintains SOC 2 Type II compliance for service organization controls across security, availability, processing integrity, confidentiality, and privacy. Annual audits by independent CPA firms validate our control effectiveness and operational excellence for enterprise deployments.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Security controls (CC1-CC9)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Availability and uptime SLAs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Processing integrity validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-sm">Annual independent audits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Action Panel */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Deploy GhostQuant Intelligence?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Our licensing specialists will work with your procurement, security, and compliance teams to design a deployment that meets your exact requirements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/contact?type=government"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
              >
                <Shield className="w-6 h-6" />
                Request Government Briefing
                <ArrowRight className="w-6 h-6" />
              </Link>
              
              <Link 
                href="/contact?type=enterprise"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-800/50 text-white text-lg font-semibold rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all duration-300"
              >
                <Server className="w-6 h-6" />
                Schedule Enterprise Demo
                <ArrowRight className="w-6 h-6" />
              </Link>
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
              <Link href="/" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/enterprise" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Enterprise
              </Link>
              <Link href="/licensing" className="block text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                Licensing
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
