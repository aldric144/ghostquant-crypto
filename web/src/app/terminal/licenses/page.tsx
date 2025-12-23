'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { Key, Shield, CheckCircle, AlertCircle, Loader2, TrendingUp, Users, Activity } from 'lucide-react'
import { licenseClient } from '@/lib/licenseClient'

export default function LicenseManagementPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [licenses, setLicenses] = useState<any[]>([])
  const [selectedLicense, setSelectedLicense] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [tiers, setTiers] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [selectedTier, setSelectedTier] = useState('business')
  const [expiresInDays, setExpiresInDays] = useState(365)
  const [ipWhitelist, setIpWhitelist] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<string[]>([])
  
  const [testApiKey, setTestApiKey] = useState('')
  const [testModule, setTestModule] = useState('fusion')
  const [validationResult, setValidationResult] = useState<any>(null)

  const availableEngines = [
    'fusion', 'hydra', 'radar', 'profiler', 'constellation',
    'sentinel', 'cortex', 'genesis', 'oracle_eye', 'ultrafusion',
    'operation_hydra', 'threat_actor', 'valkyrie', 'phantom'
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [healthRes, tiersRes, analyticsRes, licensesRes] = await Promise.all([
        licenseClient.health(),
        licenseClient.getTiers(),
        licenseClient.getAnalytics(),
        licenseClient.list()
      ])
      
      setHealth(healthRes.health)
      setTiers(tiersRes.tiers)
      setAnalytics(analyticsRes.analytics)
      setLicenses(licensesRes.licenses)
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  const handleCreateLicense = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const ipList = ipWhitelist.split(',').map(ip => ip.trim()).filter(ip => ip)
      
      const response = await licenseClient.createLicense({
        customer_name: customerName,
        customer_email: customerEmail,
        tier: selectedTier,
        expires_in_days: expiresInDays,
        ip_whitelist: ipList.length > 0 ? ipList : undefined,
        custom_permissions: selectedEngines.length > 0 ? {
          allowed_engines: selectedEngines
        } : undefined
      })
      
      const licensesRes = await licenseClient.list()
      setLicenses(licensesRes.licenses)
      
      const analyticsRes = await licenseClient.getAnalytics()
      setAnalytics(analyticsRes.analytics)
      
      setCustomerName('')
      setCustomerEmail('')
      setIpWhitelist('')
      setSelectedEngines([])
      
      setSelectedLicense(response.license)
    } catch (err: any) {
      setError(err.message || 'Failed to create license')
    } finally {
      setLoading(false)
    }
  }

  const handleValidateRequest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await licenseClient.validate({
        api_key: testApiKey,
        module_name: testModule
      })
      
      setValidationResult(response.validation)
    } catch (err: any) {
      setError(err.message || 'Validation failed')
      setValidationResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeLicense = async (apiKey: string) => {
    if (!confirm('Are you sure you want to revoke this license?')) return
    
    try {
      await licenseClient.revoke(apiKey, 'Revoked by administrator')
      
      const licensesRes = await licenseClient.list()
      setLicenses(licensesRes.licenses)
      
      const analyticsRes = await licenseClient.getAnalytics()
      setAnalytics(analyticsRes.analytics)
      
      if (selectedLicense?.key?.api_key === apiKey) {
        setSelectedLicense(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to revoke license')
    }
  }

  const handleSelectLicense = async (license: any) => {
    try {
      const response = await licenseClient.export(license.api_key)
      setSelectedLicense(response.license)
      setTestApiKey(license.api_key)
    } catch (err) {
      console.error('Failed to load license details:', err)
    }
  }

  const toggleEngine = (engine: string) => {
    if (selectedEngines.includes(engine)) {
      setSelectedEngines(selectedEngines.filter(e => e !== engine))
    } else {
      setSelectedEngines([...selectedEngines, engine])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'expired': return 'text-yellow-400'
      case 'revoked': return 'text-red-400'
      case 'suspended': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'developer': return 'text-blue-400'
      case 'business': return 'text-cyan-400'
      case 'enterprise': return 'text-purple-400'
      case 'government': return 'text-amber-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <Key className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Enterprise API Licensing Framework™</h1>
            <p className="text-gray-400">Manage commercial API licenses for GhostQuant intelligence engines</p>
          </div>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Create License */}
        <div className="col-span-3 space-y-6">
          {/* Create License Form */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              Create API Key
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="api@acme.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="developer">Developer - 5K/mo</option>
                  <option value="business">Business - 50K/mo</option>
                  <option value="enterprise">Enterprise - 500K/mo</option>
                  <option value="government">Government - Unlimited</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="365"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">IP Whitelist (comma-separated)</label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="1.2.3.4, 5.6.7.8"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Custom Engines (optional)</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableEngines.map(engine => (
                    <label key={engine} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedEngines.includes(engine)}
                        onChange={() => toggleEngine(engine)}
                        className="rounded border-cyan-500/20"
                      />
                      {engine}
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleCreateLicense}
                disabled={loading || !customerName || !customerEmail}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Create License
                  </>
                )}
              </button>
            </div>
          </div>

          {/* System Health */}
          {health && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                System Health
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Status: {health.status}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Version: {health.version}
                </div>
                <div className="text-xs text-gray-400">
                  Active: {health.active_licenses}
                </div>
                <div className="text-xs text-gray-400">
                  Total: {health.total_licenses}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - License List */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-4">License Management</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {/* Analytics Summary */}
            {analytics && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <p className="text-xs text-gray-400 mb-1">Total Licenses</p>
                  <p className="text-2xl font-bold text-cyan-400">{analytics.total_licenses}</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs text-gray-400 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.active_licenses}</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-xs text-gray-400 mb-1">Expired</p>
                  <p className="text-2xl font-bold text-yellow-400">{analytics.expired_licenses}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-gray-400 mb-1">Revoked</p>
                  <p className="text-2xl font-bold text-red-400">{analytics.revoked_licenses}</p>
                </div>
              </div>
            )}
            
            {/* License List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {licenses.length === 0 && (
                <div className="text-center py-20">
                  <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No Licenses Created</p>
                  <p className="text-gray-500 text-sm">Create your first API license to get started</p>
                </div>
              )}
              
              {licenses.map((license) => (
                <div
                  key={license.api_key}
                  onClick={() => handleSelectLicense(license)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedLicense?.key?.api_key === license.api_key
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-slate-800/30 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{license.customer_name}</p>
                      <p className="text-sm text-gray-400">{license.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${getTierColor(license.tier)}`}>
                        {license.tier.toUpperCase()}
                      </span>
                      <span className={`text-xs font-semibold ${getStatusColor(license.status)}`}>
                        {license.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-mono break-all">{license.api_key}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Requests: {license.total_requests.toLocaleString()}</span>
                    <span>Engines: {license.allowed_engines.length}</span>
                  </div>
                  
                  {license.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRevokeLicense(license.api_key)
                      }}
                      className="mt-2 w-full px-3 py-1 bg-red-500/20 border border-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-all"
                    >
                      Revoke License
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Details & Validation */}
        <div className="col-span-3 space-y-6">
          {/* Validation Tester */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Live Validation
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">API Key</label>
                <input
                  type="text"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                  placeholder="Enter API key to test"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Module</label>
                <select
                  value={testModule}
                  onChange={(e) => setTestModule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  {availableEngines.map(engine => (
                    <option key={engine} value={engine}>{engine}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleValidateRequest}
                disabled={loading || !testApiKey}
                className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate Request
              </button>
              
              {validationResult && (
                <div className={`p-3 rounded-lg border ${
                  validationResult.valid
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${
                      validationResult.valid ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {validationResult.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  
                  {validationResult.reason && (
                    <p className="text-xs text-gray-400 mb-2">{validationResult.reason}</p>
                  )}
                  
                  {validationResult.valid && (
                    <div className="space-y-1 text-xs text-gray-400">
                      <p>Tier: {validationResult.tier}</p>
                      <p>Remaining (hour): {validationResult.remaining_requests_hour ?? 'Unlimited'}</p>
                      <p>Remaining (day): {validationResult.remaining_requests_today ?? 'Unlimited'}</p>
                      <p>Remaining (month): {validationResult.remaining_requests_month ?? 'Unlimited'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* License Details */}
          {selectedLicense && (
            <>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">License Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Customer</p>
                    <p className="text-sm text-white">{selectedLicense.key.customer_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-white">{selectedLicense.key.customer_email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tier</p>
                    <p className={`text-sm font-semibold ${getTierColor(selectedLicense.key.tier)}`}>
                      {selectedLicense.key.tier.toUpperCase()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className={`text-sm font-semibold ${getStatusColor(selectedLicense.key.status)}`}>
                      {selectedLicense.key.status.toUpperCase()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Created</p>
                    <p className="text-sm text-white">{new Date(selectedLicense.key.created_at).toLocaleString()}</p>
                  </div>
                  
                  {selectedLicense.key.expires_at && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Expires</p>
                      <p className="text-sm text-white">{new Date(selectedLicense.key.expires_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Permissions</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rate Limits</p>
                    <div className="space-y-1 text-sm text-white">
                      <p>Hour: {selectedLicense.permissions.rate_limit_per_hour === -1 ? 'Unlimited' : selectedLicense.permissions.rate_limit_per_hour.toLocaleString()}</p>
                      <p>Day: {selectedLicense.permissions.rate_limit_per_day === -1 ? 'Unlimited' : selectedLicense.permissions.rate_limit_per_day.toLocaleString()}</p>
                      <p>Month: {selectedLicense.permissions.rate_limit_per_month === -1 ? 'Unlimited' : selectedLicense.permissions.rate_limit_per_month.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Concurrency Limit</p>
                    <p className="text-sm text-white">{selectedLicense.permissions.concurrency_limit}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Allowed Engines ({selectedLicense.permissions.allowed_engines.length})</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedLicense.permissions.allowed_engines.map((engine: string) => (
                        <span key={engine} className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                          {engine}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedLicense.permissions.ip_whitelist.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">IP Whitelist</p>
                      <div className="space-y-1">
                        {selectedLicense.permissions.ip_whitelist.map((ip: string) => (
                          <p key={ip} className="text-xs text-white font-mono">{ip}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>
                
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-gray-400 mb-1">Total Requests</p>
                    <p className="text-2xl font-bold text-cyan-400">{selectedLicense.usage.total_requests.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Current Period</p>
                    <div className="space-y-1 text-sm text-white">
                      <p>This Hour: {selectedLicense.usage.requests_this_hour.toLocaleString()}</p>
                      <p>Today: {selectedLicense.usage.requests_today.toLocaleString()}</p>
                      <p>This Month: {selectedLicense.usage.requests_this_month.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {Object.keys(selectedLicense.usage.engine_usage).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Engine Usage</p>
                      <div className="space-y-1">
                        {Object.entries(selectedLicense.usage.engine_usage).map(([engine, count]: [string, any]) => (
                          <div key={engine} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">{engine}</span>
                            <span className="text-cyan-400 font-semibold">{count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
