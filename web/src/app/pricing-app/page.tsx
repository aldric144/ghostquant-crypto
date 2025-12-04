'use client'

import Link from 'next/link'
import { Check, X, Shield, Zap, ArrowRight } from 'lucide-react'
import { getAllTiers } from '@/lib/pricingModel'

export default function PricingPage() {
  const tiers = getAllTiers()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                GhostQuant Pricing
              </span>
              <br />
              <span className="text-white">
                Choose Your Level of Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From retail traders to exchanges to national security.
            </p>

            {/* Floating Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">New: Hydra Engine</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Government-Grade UltraFusion</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <span className="text-cyan-400 font-semibold">Sentinel Command Console Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers - 6 Cards */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-8 rounded-xl transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                {tier.governmentOnly && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-semibold rounded-full">
                    Government Only
                  </div>
                )}

                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{tier.subtitle}</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-cyan-400">{tier.priceMonthly}</span>
                      {tier.priceMonthly !== tier.priceYearly && tier.priceMonthly !== 'Custom' && tier.priceMonthly !== 'Classified' && (
                        <span className="text-gray-400">/month</span>
                      )}
                    </div>
                    {tier.priceYearly && tier.priceYearly !== tier.priceMonthly && tier.priceYearly !== 'Custom' && tier.priceYearly !== 'Classified' && (
                      <p className="text-sm text-gray-400">or {tier.priceYearly}/year (save 17%)</p>
                    )}
                  </div>

                  {/* User Type */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Best For</p>
                    <p className="text-sm text-cyan-400 font-semibold">{tier.userType}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Key Specs */}
                  <div className="space-y-2 pt-4 border-t border-cyan-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">API Limit:</span>
                      <span className="text-cyan-400 font-semibold">{tier.apiRateLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Data Retention:</span>
                      <span className="text-cyan-400 font-semibold">{tier.retention}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Support:</span>
                      <span className="text-cyan-400 font-semibold">{tier.support}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">SLA:</span>
                      <span className="text-cyan-400 font-semibold">{tier.sla}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={tier.ctaLink}
                    className={`block w-full py-3 text-center font-semibold rounded-lg transition-all duration-300 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70'
                        : 'bg-slate-800/50 text-white border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-slate-800/70'
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="relative py-20 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Complete Feature Comparison</h2>
            <p className="text-xl text-gray-400">
              Detailed breakdown of capabilities across all tiers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-white font-semibold sticky left-0 bg-slate-950">Feature</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[120px]">Free</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[120px]">Pro</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[120px]">Elite</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[120px]">Institutional</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[140px]">Government</th>
                  <th className="text-center p-4 text-white font-semibold min-w-[160px]">National Security</th>
                </tr>
              </thead>
              <tbody>
                {/* UltraFusion Engine */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">UltraFusion Engine</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">Limited</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Hydra Coordination Engine */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Hydra Coordination Engine</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Constellation Map */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Constellation Map</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Sentinel Command Console */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Sentinel Command Console</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Cortex Memory */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Cortex Memory</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Genesis Archive */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Genesis Archive</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">1 year</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Actor Profiler */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Actor Profiler</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Manipulation Radar */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Manipulation Radar</td>
                  <td className="p-4 text-center"><span className="text-yellow-400 text-sm">Limited</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Oracle Eye */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Oracle Eye</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* API Rate Limits */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">API Rate Limits</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">100/day</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">5k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">50k/mo</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Unlimited</span></td>
                </tr>

                {/* SSO / IAM */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">SSO / IAM</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Governance Mode */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Governance Mode</td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><X className="w-5 h-5 text-gray-600 mx-auto" /></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Contact Sales</span></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="w-5 h-5 text-cyan-400 mx-auto" /></td>
                </tr>

                {/* Deployment Model */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Deployment Model</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Cloud/Hybrid</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">All Options</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Gov Cloud</span></td>
                  <td className="p-4 text-center"><span className="text-red-400 text-sm">Air-Gapped Only</span></td>
                </tr>

                {/* Customer Support */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">Customer Support</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Community</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Priority Email</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Slack + Phone</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">24/7 Dedicated</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Gov Liaison</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">Security Liaison</span></td>
                </tr>

                {/* SLA Uptime */}
                <tr className="border-b border-cyan-500/10 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-gray-300 sticky left-0 bg-slate-950">SLA Uptime</td>
                  <td className="p-4 text-center"><span className="text-gray-400 text-sm">Best Effort</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">99.5%</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">99.9%</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">99.99%</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">99.99%</span></td>
                  <td className="p-4 text-center"><span className="text-cyan-400 text-sm">99.99%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise CTA Strip */}
      <section className="relative py-16 border-b border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Institutional or Government Customization?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our enterprise team specializes in custom deployments, on-premise installations, air-gapped systems, and compliance-ready architectures for institutions and government agencies.
            </p>
            <Link 
              href="/contact?type=enterprise"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
            >
              Talk to an Enterprise Specialist
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
