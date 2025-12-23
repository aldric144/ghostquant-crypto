'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Users, Building2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { pricingClient } from '@/lib/pricingClient'

export default function PricingConsolePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tiers, setTiers] = useState<any[]>([])
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  
  const [predictions, setPredictions] = useState(0)
  const [hydraScans, setHydraScans] = useState(0)
  const [ultrafusionCalls, setUltrafusionCalls] = useState(0)
  const [constellationUpdates, setConstellationUpdates] = useState(0)
  const [oracleEyeAnalyses, setOracleEyeAnalyses] = useState(0)
  const [usageCost, setUsageCost] = useState<any>(null)
  const [suggestedPlan, setSuggestedPlan] = useState<any>(null)
  
  const [mode, setMode] = useState<'revenue' | 'contract'>('revenue')
  const [starterUsers, setStarterUsers] = useState(1000)
  const [proUsers, setProUsers] = useState(500)
  const [eliteUsers, setEliteUsers] = useState(100)
  const [businessUsers, setBusinessUsers] = useState(50)
  const [institutionalUsers, setInstitutionalUsers] = useState(10)
  const [governmentUsers, setGovernmentUsers] = useState(5)
  const [sovereignUsers, setSovereignUsers] = useState(1)
  const [growthRate, setGrowthRate] = useState(15)
  const [revenueProjection, setRevenueProjection] = useState<any>(null)
  
  const [contractType, setContractType] = useState('bank')
  const [orgName, setOrgName] = useState('')
  const [numUsers, setNumUsers] = useState(50)
  const [numEngines, setNumEngines] = useState(10)
  const [isGovernment, setIsGovernment] = useState(false)
  const [discountRate, setDiscountRate] = useState(10)
  const [enterpriseContract, setEnterpriseContract] = useState<any>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [healthRes, tiersRes] = await Promise.all([
        pricingClient.health(),
        pricingClient.getTiers()
      ])
      
      setHealth(healthRes.health)
      setTiers(tiersRes.tiers)
      
      if (tiersRes.tiers.length > 0) {
        setSelectedTier(tiersRes.tiers[0])
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  const handleCalculateUsageCost = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const usage = {
        predictions,
        ultrafusion_calls: ultrafusionCalls,
        hydra_scans: hydraScans,
        constellation_updates: constellationUpdates,
        oracle_eye_analyses: oracleEyeAnalyses
      }
      
      const response = await pricingClient.calculateUsageCost(usage)
      setUsageCost(response.result)
      
      const totalRequests = predictions + ultrafusionCalls + hydraScans + constellationUpdates + oracleEyeAnalyses
      const suggestionResponse = await pricingClient.suggestBestPlan({
        monthly_requests: totalRequests,
        required_engines: ['fusion', 'hydra', 'radar', 'constellation', 'oracle_eye'],
        num_users: 1,
        needs_api: true,
        needs_export: true,
        needs_webhooks: false,
        needs_custom_integrations: false,
        is_enterprise: false
      })
      
      setSuggestedPlan(suggestionResponse.result)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate usage cost')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectRevenue = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await pricingClient.projectRevenue({
        tier_distribution: {
          starter: starterUsers,
          pro_trader: proUsers,
          elite_trader: eliteUsers,
          business: businessUsers,
          institutional: institutionalUsers,
          government: governmentUsers,
          sovereign: sovereignUsers
        },
        growth_rate: growthRate / 100,
        months: 36
      })
      
      setRevenueProjection(response.result)
    } catch (err: any) {
      setError(err.message || 'Failed to project revenue')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateContract = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await pricingClient.calculateEnterpriseContract({
        contract_type: contractType,
        organization_name: orgName || 'Organization',
        num_users: numUsers,
        num_engines: numEngines,
        is_government: isGovernment,
        discount_rate: discountRate / 100
      })
      
      setEnterpriseContract(response.result)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate contract')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    return category === 'consumer' ? 'text-blue-400' : 'text-purple-400'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const renderSparkline = (projections: number[]) => {
    if (!projections || projections.length === 0) return null
    
    const max = Math.max(...projections)
    const min = Math.min(...projections)
    const range = max - min
    
    return (
      <div className="flex items-end gap-0.5 h-12">
        {projections.slice(0, 36).map((value, i) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50
          return (
            <div
              key={i}
              className="flex-1 bg-cyan-500/50 rounded-t"
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <TerminalBackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <DollarSign className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Pricing Engine & Revenue Model Generator™</h1>
            <p className="text-gray-400">Dynamic pricing system for enterprise licensing and revenue modeling</p>
          </div>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Pricing Tiers */}
        <div className="col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              Pricing Tiers
            </h2>
            
            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTier?.name === tier.name
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-slate-800/30 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="mb-2">
                    <p className="text-white font-semibold">{tier.name}</p>
                    <p className={`text-xs font-semibold ${getCategoryColor(tier.category)}`}>
                      {tier.category.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-cyan-400">{formatCurrency(tier.monthly_price)}</p>
                    <p className="text-xs text-gray-400">per month</p>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    <p>Annual: {formatCurrency(tier.annual_price)}</p>
                    <p>Modules: {tier.included_modules.length}</p>
                    <p>Rate: {tier.rate_limit_per_month === -1 ? 'Unlimited' : tier.rate_limit_per_month.toLocaleString()}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {health && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                System Health
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">{health.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">{health.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiers:</span>
                  <span className="text-white">{health.total_tiers}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - Usage Cost Calculator */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Usage Cost Calculator</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Predictions</label>
                <input
                  type="number"
                  value={predictions}
                  onChange={(e) => setPredictions(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="50000"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">UltraFusion Calls</label>
                <input
                  type="number"
                  value={ultrafusionCalls}
                  onChange={(e) => setUltrafusionCalls(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="10000"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Hydra Scans</label>
                <input
                  type="number"
                  value={hydraScans}
                  onChange={(e) => setHydraScans(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Constellation Updates</label>
                <input
                  type="number"
                  value={constellationUpdates}
                  onChange={(e) => setConstellationUpdates(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="8000"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Oracle Eye Analyses</label>
                <input
                  type="number"
                  value={oracleEyeAnalyses}
                  onChange={(e) => setOracleEyeAnalyses(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="2000"
                />
              </div>
            </div>
            
            <button
              onClick={handleCalculateUsageCost}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Calculate Cost
                </>
              )}
            </button>
            
            {usageCost && (
              <div className="space-y-4">
                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <p className="text-sm text-gray-400 mb-1">Total Cost</p>
                  <p className="text-3xl font-bold text-cyan-400">{formatCurrency(usageCost.total_cost)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {usageCost.total_requests.toLocaleString()} total requests
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Cost Breakdown</p>
                  <div className="space-y-2">
                    {Object.entries(usageCost.breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{key.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{value.count.toLocaleString()}</span>
                          <span className="text-cyan-400 font-semibold">{formatCurrency(value.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {suggestedPlan?.recommended && (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-400 font-semibold mb-2">Suggested Plan</p>
                    <p className="text-white font-semibold">{suggestedPlan.recommended.tier.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatCurrency(suggestedPlan.recommended.tier.monthly_price)}/month
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Revenue Model / Enterprise Contract */}
        <div className="col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('revenue')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'revenue'
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-800/30 border border-cyan-500/20 text-gray-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setMode('contract')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'contract'
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-800/30 border border-cyan-500/20 text-gray-400 hover:text-white'
                }`}
              >
                Contract
              </button>
            </div>
            
            {mode === 'revenue' ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Revenue Projection
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Starter</label>
                      <input
                        type="number"
                        value={starterUsers}
                        onChange={(e) => setStarterUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pro</label>
                      <input
                        type="number"
                        value={proUsers}
                        onChange={(e) => setProUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Elite</label>
                      <input
                        type="number"
                        value={eliteUsers}
                        onChange={(e) => setEliteUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business</label>
                      <input
                        type="number"
                        value={businessUsers}
                        onChange={(e) => setBusinessUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Institutional</label>
                      <input
                        type="number"
                        value={institutionalUsers}
                        onChange={(e) => setInstitutionalUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Government</label>
                      <input
                        type="number"
                        value={governmentUsers}
                        onChange={(e) => setGovernmentUsers(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sovereign</label>
                    <input
                      type="number"
                      value={sovereignUsers}
                      onChange={(e) => setSovereignUsers(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Growth Rate (%)</label>
                    <input
                      type="number"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleProjectRevenue}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Project Revenue
                </button>
                
                {revenueProjection && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <p className="text-xs text-gray-400 mb-1">Monthly Revenue</p>
                      <p className="text-xl font-bold text-cyan-400">
                        {formatCurrency(revenueProjection.projection.monthly_revenue)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-xs text-gray-400 mb-1">Annual Revenue</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatCurrency(revenueProjection.projection.annual_revenue)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-xs text-gray-400 mb-1">3-Year Projection</p>
                      <p className="text-xl font-bold text-purple-400">
                        {formatCurrency(revenueProjection.projection.three_year_projection)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Revenue Trend</p>
                      {renderSparkline(revenueProjection.monthly_projections)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Enterprise Contract
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Contract Type</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="bank">Bank</option>
                      <option value="exchange">Exchange</option>
                      <option value="hedge_fund">Hedge Fund</option>
                      <option value="doj">DOJ</option>
                      <option value="sec">SEC</option>
                      <option value="dhs">DHS</option>
                      <option value="fincen">FinCEN</option>
                      <option value="cyber_threat">Cyber Threat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      placeholder="Acme Corp"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Number of Users</label>
                    <input
                      type="number"
                      value={numUsers}
                      onChange={(e) => setNumUsers(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Number of Engines</label>
                    <input
                      type="number"
                      value={numEngines}
                      onChange={(e) => setNumEngines(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-cyan-500/20 rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGovernment}
                        onChange={(e) => setIsGovernment(e.target.checked)}
                        className="rounded border-cyan-500/20"
                      />
                      Government Contract
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleCalculateContract}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Calculate Contract
                </button>
                
                {enterpriseContract && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <p className="text-xs text-gray-400 mb-1">Annual Commit</p>
                      <p className="text-xl font-bold text-cyan-400">
                        {formatCurrency(enterpriseContract.contract.annual_commit)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-xs text-gray-400 mb-1">Onboarding Fee</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {formatCurrency(enterpriseContract.contract.onboarding_fee)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-xs text-gray-400 mb-1">Total First Year</p>
                      <p className="text-xl font-bold text-purple-400">
                        {formatCurrency(enterpriseContract.cost_breakdown.total_first_year)}
                      </p>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Support:</span>
                        <span className="text-white">{enterpriseContract.contract.support_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">SLA:</span>
                        <span className="text-white">{enterpriseContract.contract.sla_uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Training:</span>
                        <span className="text-white">{enterpriseContract.contract.training_hours}h</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {selectedTier && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Selected Tier</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white font-semibold text-lg">{selectedTier.name}</p>
                  <p className={`text-xs font-semibold ${getCategoryColor(selectedTier.category)}`}>
                    {selectedTier.category.toUpperCase()}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Support Level</p>
                  <p className="text-sm text-white">{selectedTier.support_level}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">SLA Uptime</p>
                  <p className="text-sm text-white">{selectedTier.sla_uptime}%</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Max Users</p>
                  <p className="text-sm text-white">
                    {selectedTier.max_users === -1 ? 'Unlimited' : selectedTier.max_users}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Features</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTier.api_access && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        API
                      </span>
                    )}
                    {selectedTier.export_enabled && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        Export
                      </span>
                    )}
                    {selectedTier.webhooks_enabled && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        Webhooks
                      </span>
                    )}
                    {selectedTier.custom_integrations && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        Custom
                      </span>
                    )}
                    {selectedTier.white_label && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        White Label
                      </span>
                    )}
                    {selectedTier.dedicated_instance && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded">
                        Dedicated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
