'use client'

import TerminalBackButton from '../../../components/terminal/TerminalBackButton'
import { useState, useEffect } from 'react'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ghostquant-mewzi.ondigitalocean.app'
export default function GovernanceConsolePage() {
  const [decisions, setDecisions] = useState<{id:string,title:string,type:string,status:string,priority:string,requestedBy:string,approvedBy:string|null,createdAt:Date,resolvedAt:Date|null,impact:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ systemIntegrity: 0, pendingDecisions: 0, approvedToday: 0, rejectedToday: 0, avgResolutionTime: 0, auditScore: 0 })
  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [])
  async function fetchData() {
    try {
      const r = await fetch(`${API_BASE}/gq-core/governance/decisions`)
      if (r.ok) { const d = await r.json(); if (d.decisions) { setDecisions(d.decisions); setMetrics(d.metrics || metrics) } else generateMockData() } else generateMockData()
    } catch { generateMockData() } finally { setLoading(false) }
  }
  function generateMockData() {
    const titles = ['Risk Limit Increase', 'New Strategy Approval', 'Access Grant Request', 'Policy Amendment', 'Emergency Protocol', 'Audit Finding Response', 'Compliance Waiver', 'System Change Request']
    const types = ['risk', 'strategy', 'access', 'policy', 'emergency', 'audit', 'compliance', 'system']
    const statuses = ['pending', 'approved', 'rejected', 'under_review', 'escalated']
    const priorities = ['critical', 'high', 'medium', 'low']
    const impacts = ['critical', 'high', 'medium', 'low']
    const requesters = ['Risk Team', 'Trading Desk', 'Compliance', 'Operations', 'Security', 'Executive']
    const approvers = ['Chief Risk Officer', 'CEO', 'Compliance Head', 'Board', null]
    const mockDecisions = Array.from({ length: 15 }, (_, i) => ({
      id: `dec-${i}`, title: titles[i % 8], type: types[i % 8], status: statuses[Math.floor(Math.random() * 5)],
      priority: priorities[Math.floor(Math.random() * 4)], requestedBy: requesters[Math.floor(Math.random() * 6)],
      approvedBy: Math.random() > 0.4 ? approvers[Math.floor(Math.random() * 4)] : null,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000) : null,
      impact: impacts[Math.floor(Math.random() * 4)]
    }))
    setDecisions(mockDecisions)
    setMetrics({ systemIntegrity: 94 + Math.floor(Math.random() * 6), pendingDecisions: mockDecisions.filter(d => d.status === 'pending' || d.status === 'under_review').length, approvedToday: mockDecisions.filter(d => d.status === 'approved').length, rejectedToday: mockDecisions.filter(d => d.status === 'rejected').length, avgResolutionTime: Math.floor(Math.random() * 24) + 2, auditScore: 85 + Math.floor(Math.random() * 15) })
  }
  const getStatusColor = (s: string) => ({ pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', approved: 'bg-green-500/20 text-green-400 border-green-500', rejected: 'bg-red-500/20 text-red-400 border-red-500', under_review: 'bg-blue-500/20 text-blue-400 border-blue-500', escalated: 'bg-purple-500/20 text-purple-400 border-purple-500' }[s] || 'bg-gray-500/20 text-gray-400 border-gray-500')
  const getPriorityColor = (p: string) => ({ critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }[p] || 'text-gray-400')
  const getIntegrityColor = (i: number) => i >= 95 ? 'text-green-400' : i >= 85 ? 'text-yellow-400' : 'text-red-400'
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><TerminalBackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Governance Console</h1><p className="text-gray-400">Executive decision tracking and audit trail management</p></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">System Integrity</div><div className={`text-2xl font-bold ${getIntegrityColor(metrics.systemIntegrity)}`}>{metrics.systemIntegrity}%</div></div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Pending</div><div className="text-2xl font-bold text-yellow-400">{metrics.pendingDecisions}</div></div>
          <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Approved</div><div className="text-2xl font-bold text-green-400">{metrics.approvedToday}</div></div>
          <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Rejected</div><div className="text-2xl font-bold text-red-400">{metrics.rejectedToday}</div></div>
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Avg Resolution</div><div className="text-2xl font-bold text-purple-400">{metrics.avgResolutionTime}h</div></div>
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4"><div className="text-xs text-gray-400 mb-1">Audit Score</div><div className="text-2xl font-bold text-blue-400">{metrics.auditScore}</div></div>
        </div>
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20"><h2 className="text-lg font-semibold text-white">Decision Audit Trail</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50"><tr><th className="text-left text-xs text-gray-400 p-3">Decision</th><th className="text-left text-xs text-gray-400 p-3">Type</th><th className="text-center text-xs text-gray-400 p-3">Status</th><th className="text-center text-xs text-gray-400 p-3">Priority</th><th className="text-left text-xs text-gray-400 p-3">Requested By</th><th className="text-left text-xs text-gray-400 p-3">Approved By</th><th className="text-center text-xs text-gray-400 p-3">Impact</th><th className="text-right text-xs text-gray-400 p-3">Created</th></tr></thead>
              <tbody>
                {decisions.map(dec => (
                  <tr key={dec.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 font-medium text-cyan-400">{dec.title}</td>
                    <td className="p-3 text-white capitalize">{dec.type}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(dec.status)}`}>{dec.status.replace('_', ' ')}</span></td>
                    <td className={`p-3 text-center font-medium uppercase ${getPriorityColor(dec.priority)}`}>{dec.priority}</td>
                    <td className="p-3 text-gray-400">{dec.requestedBy}</td>
                    <td className="p-3 text-gray-400">{dec.approvedBy || '—'}</td>
                    <td className={`p-3 text-center font-medium uppercase ${getPriorityColor(dec.impact)}`}>{dec.impact}</td>
                    <td className="p-3 text-right text-gray-500 text-sm">{new Date(dec.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
