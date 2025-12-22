'use client'

import Link from 'next/link'
import { Twitter, Linkedin, Github, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0e1a] border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              GhostQuant™
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Autonomous Intelligence for the Global Financial System. Invisible signals. Undetected threats. Now visible.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Product</h3>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Pricing
              </Link>
              <Link href="/terminal/home" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Terminal
              </Link>
              <Link href="/docs" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Documentation
              </Link>
              <Link href="/threat-map" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Threat Map
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Company</h3>
            <div className="flex flex-col gap-3">
              <Link href="/sales" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Contact Sales
              </Link>
              <Link href="/compliance" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Compliance
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com/ghostquant" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/ghostquant" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/ghostquant" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contact@ghostquant.io"
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              contact@ghostquant.io
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} GhostQuant. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm">
              Built for institutional-grade intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
