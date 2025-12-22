'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Building2, 
  Globe,
  Crown,
  ArrowRight
} from 'lucide-react'

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: React.ElementType
  highlighted?: boolean
  ctaText: string
  tier: string
}

const pricingTiers: PricingTier[] = [
  {
    name: "Retail Sentinel",
    price: "$39",
    period: "/month",
    description: "Essential market intelligence for individual traders",
    features: [
      "Manipulation detection",
      "Whale movement alerts",
      "Trend analytics",
      "Basic entity scoring"
    ],
    icon: Star,
    ctaText: "Subscribe with Stripe",
    tier: "retail"
  },
  {
    name: "Trader Pro",
    price: "$149",
    period: "/month",
    description: "Advanced tools for serious traders",
    features: [
      "Full trend suite",
      "Hydra Light",
      "3D network mapping",
      "AI narratives",
      "Up to 300 analyses/day"
    ],
    icon: Zap,
    highlighted: true,
    ctaText: "Subscribe with Stripe",
    tier: "trader-pro"
  },
  {
    name: "Elite Quant",
    price: "$399",
    period: "/month",
    description: "Professional-grade intelligence platform",
    features: [
      "All Hydra capabilities",
      "UltraFusion meta-AI",
      "Behavioral DNA advanced",
      "Unlimited analyses"
    ],
    icon: Crown,
    ctaText: "Subscribe with Stripe",
    tier: "elite"
  },
  {
    name: "Fund Command",
    price: "$1,999",
    period: "/month",
    description: "Enterprise solution for hedge funds and trading desks",
    features: [
      "Full intelligence stack",
      "Predictive modeling API",
      "Multi-user license",
      "Genesis historical analysis"
    ],
    icon: Building2,
    ctaText: "Subscribe with Stripe",
    tier: "fund"
  },
  {
    name: "Exchange Surveillance",
    price: "$12,000",
    period: "/month",
    description: "Exchange-wide monitoring and compliance",
    features: [
      "Dedicated nodes",
      "Exchange-wide manipulation detection",
      "Compliance reporting suite",
      "5,000 req/min API"
    ],
    icon: Shield,
    ctaText: "Contact Sales",
    tier: "exchange"
  },
  {
    name: "Government & National Intelligence",
    price: "$150,000–$2,000,000",
    period: "/year",
    description: "Mission-critical deployment for government agencies",
    features: [
      "Forensic audit systems",
      "Cross-chain intelligence hub",
      "Investigation engines",
      "Mission-critical deployment"
    ],
    icon: Globe,
    ctaText: "Contact Sales",
    tier: "government"
  }
]

function SubscribeButton({ tier, ctaText }: { tier: string, ctaText: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (ctaText === "Contact Sales") {
      window.location.href = "/sales"
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
        ctaText === "Contact Sales"
          ? "bg-transparent border-2 border-cyan-500/50 text-white hover:border-cyan-400 hover:bg-cyan-500/10"
          : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/40"
      }`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {ctaText}
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1321] to-[#0a0e1a]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold">
              <span className="text-white">Choose Your </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Intelligence Tier
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From individual traders to government agencies, GhostQuant scales to meet your market intelligence needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                  tier.highlighted
                    ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-400/60 shadow-2xl shadow-cyan-500/20"
                    : "bg-gradient-to-br from-[#0d1321] to-[#0a0e1a] border-cyan-500/20 hover:border-cyan-500/40"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      tier.highlighted 
                        ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/20" 
                        : "bg-cyan-500/10"
                    }`}>
                      <tier.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-400">{tier.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{tier.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 py-6 border-t border-cyan-500/10">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <SubscribeButton tier={tier.tier} ctaText={tier.ctaText} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing cycle."
              },
              {
                q: "Is there a free trial?",
                a: "We offer a 14-day free trial for Retail Sentinel and Trader Pro tiers. Enterprise and Government tiers include a custom demo period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe. Enterprise and Government clients can arrange invoicing and wire transfers."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 30-day money-back guarantee for all subscription tiers. Contact support for assistance."
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-[#0d1321]/60 border border-cyan-500/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-white">Ready to See the Invisible?</h2>
            <p className="text-xl text-gray-400">
              Start your free trial today and experience autonomous market intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/terminal/home"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
              >
                Launch Terminal
              </Link>
              <Link 
                href="/sales"
                className="px-8 py-4 bg-transparent border-2 border-cyan-500/50 text-white font-bold rounded-xl hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
