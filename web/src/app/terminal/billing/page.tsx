'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Users, TrendingUp, AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react'
import { billingClient } from '@/lib/billingClient'
import { BillingDashboardEngine } from '@/lib/BillingDashboardEngine'

export default function BillingConsolePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [stripeToken, setStripeToken] = useState('tok_ok')
  
  const [usageMetric, setUsageMetric] = useState('api_calls')
  const [usageAmount, setUsageAmount] = useState(1000)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        billingClient.health(),
        billingClient.getMetrics()
      ])
      
      if (healthRes.success) {
        setHealth(healthRes)
      }
      
      if (metricsRes.success) {
        setMetrics(metricsRes.report)
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerEmail || !newCustomerName) {
      setError('Email and name are required')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await billingClient.createCustomer({
        email: newCustomerEmail,
        name: newCustomerName,
        currency: 'usd'
      })
      
      if (response.success) {
        setSelectedCustomerId(response.customer.id)
        setNewCustomerEmail('')
        setNewCustomerName('')
        await loadSummary(response.customer.id)
      } else {
        setError(response.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const handleAttachPayment = async () => {
    if (!selectedCustomerId) {
      setError('Please create a customer first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await billingClient.attachPayment(selectedCustomerId, stripeToken)
      
      if (response.success) {
        await loadSummary(selectedCustomerId)
      } else {
        setError(response.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to attach payment')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!selectedCustomerId) {
      setError('Please create a customer first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await billingClient.createSubscription(selectedCustomerId, selectedPlan)
      
      if (response.success) {
        await loadSummary(selectedCustomerId)
      } else {
        setError(response.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleRecordUsage = async () => {
    if (!selectedCustomerId) {
      setError('Please create a customer first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await billingClient.recordUsage(selectedCustomerId, usageMetric, usageAmount)
      
      if (response.success) {
        await loadSummary(selectedCustomerId)
      } else {
        setError(response.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record usage')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async (customerId: string) => {
    try {
      const response = await billingClient.getSummary(customerId)
      
      if (response.success) {
        setSummary(response.billing_summary)
      }
    } catch (err) {
      console.error('Failed to load summary:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': 'text-green-400',
      'past_due': 'text-yellow-400',
      'canceled': 'text-red-400',
      'current': 'text-green-400',
      'overdue': 'text-red-400',
      'at_risk': 'text-yellow-400'
    }
    return colorMap[status] || 'text-gray-400'
  }

  const renderUsageBars = () => {
    if (!summary || !summary.usage_this_month) return null
    
    const bars = BillingDashboardEngine.calculateUsageBars(
      summary.usage_this_month,
      summary.usage_limits
    )
    
    return (
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.metric}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{bar.metric}</span>
              <span className="text-gray-400">
                {BillingDashboardEngine.formatNumber(bar.current)} / {bar.limit === -1 ? '∞' : BillingDashboardEngine.formatNumber(bar.limit)}
              </span>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  bar.status === 'critical' ? 'bg-red-500' :
                  bar.status === 'warning' ? 'bg-yellow-500' :
                  bar.status === 'unlimited' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${bar.status === 'unlimited' ? 0 : Math.min(bar.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
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
            <h1 className="text-3xl font-bold text-white">Billing System & Payment Gateway™</h1>
            <p className="text-gray-400">Subscription management, usage metering, and payment processing</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Customer & Subscription Management */}
        <div className="col-span-3 space-y-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Customer
            </h2>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <button
              onClick={handleCreateCustomer}
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Create Customer
                </>
              )}
            </button>
          </div>

          {selectedCustomerId && (
            <>
              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  Payment
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Token</label>
                    <select
                      value={stripeToken}
                      onChange={(e) => setStripeToken(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="tok_ok">Success (4242)</option>
                      <option value="tok_fail">Decline (0002)</option>
                      <option value="tok_insufficient">Insufficient (9995)</option>
                      <option value="tok_risk">Risk (0019)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleAttachPayment}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Attach Payment
                </button>
              </div>

              <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Subscription
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Plan</label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="free">FREE ($0/mo)</option>
                      <option value="pro">PRO ($199/mo)</option>
                      <option value="institutional">INSTITUTIONAL ($9,999/yr)</option>
                      <option value="government">GOVERNMENT ($24,999/yr)</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleCreateSubscription}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Subscription
                </button>
              </div>
            </>
          )}

          {health && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                System Health
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Engine:</span>
                  <span className="text-green-400">{health.engine?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customers:</span>
                  <span className="text-white">{health.engine?.customers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subscriptions:</span>
                  <span className="text-white">{health.engine?.subscriptions || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - Usage Meters & Billing Summary */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-4">Usage Meters & Billing Summary</h2>
            
            {selectedCustomerId && (
              <div className="space-y-6">
                {/* Usage Recording */}
                <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Record Usage</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Metric</label>
                      <select
                        value={usageMetric}
                        onChange={(e) => setUsageMetric(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="api_calls">API Calls</option>
                        <option value="predictions">Predictions</option>
                        <option value="ultrafusion_calls">UltraFusion Calls</option>
                        <option value="hydra_scans">Hydra Scans</option>
                        <option value="constellation_updates">Constellation Updates</option>
                        <option value="oracle_eye_analyses">Oracle Eye Analyses</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount</label>
                      <input
                        type="number"
                        value={usageAmount}
                        onChange={(e) => setUsageAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRecordUsage}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-500/20 text-white text-sm rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Record Usage
                  </button>
                </div>

                {/* Billing Summary */}
                {summary && (
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {summary.current_plan?.name || 'No Plan'}
                      </p>
                      {summary.current_plan && (
                        <p className="text-sm text-gray-400 mt-1">
                          {formatCurrency(summary.current_plan.price)}/{summary.current_plan.billing_period}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
                        <p className="text-sm text-gray-400 mb-1">Status</p>
                        <p className={`text-lg font-semibold ${getStatusColor(summary.subscription_status || 'none')}`}>
                          {summary.subscription_status?.toUpperCase() || 'NONE'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
                        <p className="text-sm text-gray-400 mb-1">Payment</p>
                        <p className={`text-lg font-semibold ${getStatusColor(summary.payment_status)}`}>
                          {summary.payment_status.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Usage Bars */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Usage This Month</h3>
                      {renderUsageBars()}
                    </div>

                    {/* Risk Flags */}
                    {(summary.fraud_risk || summary.overdue) && (
                      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-red-400 font-semibold mb-2">⚠️ Risk Alerts</p>
                        {summary.fraud_risk && (
                          <p className="text-red-300 text-sm">• Fraud risk detected</p>
                        )}
                        {summary.overdue && (
                          <p className="text-red-300 text-sm">• Account overdue</p>
                        )}
                        {summary.failed_payments_count > 0 && (
                          <p className="text-red-300 text-sm">• {summary.failed_payments_count} failed payment(s)</p>
                        )}
                      </div>
                    )}

                    {/* Summary Narrative */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
                      <p className="text-sm text-gray-300">{summary.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedCustomerId && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Create a customer to view billing summary</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Invoices & Revenue Metrics */}
        <div className="col-span-3 space-y-6">
          {summary && summary.unpaid_invoices && summary.unpaid_invoices.length > 0 && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                Unpaid Invoices
              </h2>
              
              <div className="space-y-3">
                {summary.unpaid_invoices.map((invoice: any) => (
                  <div key={invoice.id} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-400">Invoice</span>
                      <span className="text-yellow-400 font-semibold">{invoice.status.toUpperCase()}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(invoice.amount_due)}</p>
                    <p className="text-xs text-gray-400 mt-1">Due: {BillingDashboardEngine.formatDate(invoice.due_date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Revenue Metrics
              </h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-gray-400 mb-1">MRR</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(metrics.metrics?.mrr || 0)}
                  </p>
                </div>
                
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-gray-400 mb-1">ARR</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(metrics.metrics?.arr || 0)}
                  </p>
                </div>
                
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-gray-400 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {metrics.metrics?.churn_rate?.toFixed(1) || 0}%
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Subs:</span>
                    <span className="text-white">{metrics.metrics?.active_subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Customers:</span>
                    <span className="text-white">{metrics.metrics?.total_customers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {metrics && metrics.fraud && metrics.fraud.fraud_risk_customers > 0 && (
            <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Fraud Alerts
              </h2>
              
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-400 font-semibold mb-2">
                  🚨 {metrics.fraud.fraud_risk_customers} Customer(s) at Risk
                </p>
                <p className="text-red-300 text-xs">
                  {metrics.fraud.patterns_detected.join(', ')}
                </p>
              </div>
            </div>
          )}

          {metrics && metrics.plan_changes && (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Plan Changes (30d)</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Upgrades:</span>
                  <span className="text-green-400">{metrics.plan_changes.upgrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Downgrades:</span>
                  <span className="text-yellow-400">{metrics.plan_changes.downgrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Net Change:</span>
                  <span className={metrics.plan_changes.net_change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {metrics.plan_changes.net_change >= 0 ? '+' : ''}{metrics.plan_changes.net_change}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
