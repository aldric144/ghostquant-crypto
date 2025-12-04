'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useIntelFeed } from '@/hooks/useIntelFeed'
import { ghostmind } from '@/lib/ghostmindClient'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isTyping?: boolean
}

interface Insight {
  id: string
  content: string
  severity: 'high' | 'medium' | 'low'
  timestamp: number
  alertType: string
}

type ContextType = 'entity' | 'token' | 'chain' | 'ring' | 'global'

export default function GhostMindPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [inputValue, setInputValue] = useState('')
  const [contextType, setContextType] = useState<ContextType>('global')
  const [isThinking, setIsThinking] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [showContext, setShowContext] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const { latestAlert, alertHistory, connectionStatus } = useIntelFeed()

  const suggestedQueries = [
    "Summarize the last 10 minutes",
    "Show current manipulation risks",
    "Explain today's whale flows",
    "Which entities are most active?",
    "What rings are forming right now?",
    "What chain has the highest risk?",
    "Today's cross-chain threats"
  ]

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '👋 **Welcome to GhostMind AI Console**\n\nI\'m your real-time intelligence analyst. I can help you:\n\n• Analyze entity behavior patterns\n• Detect manipulation rings\n• Assess cross-chain threats\n• Predict risk trends\n• Explain market intelligence\n\nAsk me anything about the current intelligence landscape, or click a suggested query below.',
      timestamp: Date.now()
    }])
  }, [])

  useEffect(() => {
    if (!latestAlert) return

    const alertType = latestAlert.intelligence?.event?.event_type || latestAlert.type || 'alert'
    const score = latestAlert.score || 0
    const severity: 'high' | 'medium' | 'low' = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low'

    const insightContent = ghostmind.generateInsight(latestAlert)

    const newInsight: Insight = {
      id: `insight-${Date.now()}-${Math.random()}`,
      content: insightContent,
      severity,
      timestamp: Date.now(),
      alertType
    }

    setInsights(prev => [newInsight, ...prev].slice(0, 50)) // Keep last 50 insights

  }, [latestAlert])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsThinking(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = ghostmind.answerQuestion(messageText, alertHistory || [])

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      isTyping: true
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsThinking(false)

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id ? { ...msg, isTyping: false } : msg
        )
      )
    }, response.length * 20) // Typing speed based on content length
  }

  const handleInsightClick = (insight: Insight) => {
    const query = `Explain this alert: ${insight.content}`
    handleSendMessage(query)
  }

  const getContextContent = () => {
    if (!alertHistory || alertHistory.length === 0) {
      return {
        title: 'System Metrics',
        content: 'Waiting for intelligence data...'
      }
    }

    switch (contextType) {
      case 'entity':
        const entityCount = new Set(alertHistory.map(a => a.intelligence?.entity?.entity_id).filter(Boolean)).size
        return {
          title: 'Entity Context',
          content: `**Active Entities:** ${entityCount}\n\n**Top Entity Types:**\n• Whales: ${alertHistory.filter(a => a.type?.toLowerCase().includes('whale')).length}\n• Manipulation: ${alertHistory.filter(a => a.type?.toLowerCase().includes('manipulation')).length}\n• Darkpool: ${alertHistory.filter(a => a.type?.toLowerCase().includes('darkpool')).length}`
        }

      case 'token':
        const tokens = new Set(alertHistory.map(a => a.intelligence?.event?.token).filter(Boolean))
        return {
          title: 'Token Context',
          content: `**Active Tokens:** ${tokens.size}\n\n**Top Tokens:**\n${Array.from(tokens).slice(0, 5).map(t => `• ${t}`).join('\n')}`
        }

      case 'chain':
        const chains = new Set(alertHistory.map(a => a.intelligence?.event?.chain).filter(Boolean))
        const chainRisks = new Map<string, number>()
        alertHistory.forEach(a => {
          const chain = a.intelligence?.event?.chain
          if (chain) {
            chainRisks.set(chain, (chainRisks.get(chain) || 0) + (a.score || 0))
          }
        })
        const topChain = Array.from(chainRisks.entries()).sort((a, b) => b[1] - a[1])[0]
        return {
          title: 'Chain Context',
          content: `**Active Chains:** ${chains.size}\n\n**Highest Risk:** ${topChain?.[0] || 'N/A'}\n\n**Chains:**\n${Array.from(chains).slice(0, 5).map(c => `• ${c}`).join('\n')}`
        }

      case 'ring':
        const manipulationCount = alertHistory.filter(a => 
          a.type?.toLowerCase().includes('manipulation') || 
          a.type?.toLowerCase().includes('coordination')
        ).length
        return {
          title: 'Ring Context',
          content: `**Coordination Events:** ${manipulationCount}\n\n**Status:** ${manipulationCount > 5 ? '🔴 High coordination activity' : manipulationCount > 2 ? '🟡 Moderate coordination' : '🟢 Low coordination'}\n\n**Recommendation:** ${manipulationCount > 5 ? 'Immediate monitoring required' : 'Continue routine surveillance'}`
        }

      case 'global':
      default:
        const totalEvents = alertHistory.length
        const highRisk = alertHistory.filter(a => (a.score || 0) >= 0.7).length
        const mediumRisk = alertHistory.filter(a => (a.score || 0) >= 0.4 && (a.score || 0) < 0.7).length
        const avgScore = alertHistory.reduce((sum, a) => sum + (a.score || 0), 0) / totalEvents
        return {
          title: 'System Metrics',
          content: `**Intelligence Velocity:** ${totalEvents} events\n\n**Risk Distribution:**\n🔴 High: ${highRisk}\n🟡 Medium: ${mediumRisk}\n⚪ Low: ${totalEvents - highRisk - mediumRisk}\n\n**Average Risk Score:** ${(avgScore * 100).toFixed(0)}%\n\n**Active Chains:** ${new Set(alertHistory.map(a => a.intelligence?.event?.chain).filter(Boolean)).size}\n\n**Status:** ${avgScore >= 0.7 ? '🔴 Elevated Threat' : avgScore >= 0.4 ? '🟡 Moderate Risk' : '🟢 Normal Operations'}`
        }
    }
  }

  const contextContent = getContextContent()

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">GhostMind AI Console</h1>
          <p className="text-sm text-gray-400">Real-time conversational intelligence analyst</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          connectionStatus === 'connected' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span className="text-xs font-medium">
            {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-400">Suggested Queries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(query)}
              className="px-3 py-1.5 bg-slate-800/50 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 rounded-lg text-xs text-gray-300 hover:text-cyan-400 transition-all"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Insights Feed */}
        <div className={`${showInsights ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="h-full bg-slate-900/50 border border-cyan-500/20 rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-bold text-cyan-400">Live Insights</h3>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-cyan-400 transition-colors md:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Waiting for intelligence...
                </div>
              ) : (
                insights.map(insight => (
                  <button
                    key={insight.id}
                    onClick={() => handleInsightClick(insight)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all border
                      ${insight.severity === 'high' 
                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' 
                        : insight.severity === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                        : 'bg-gray-500/10 border-gray-500/30 hover:border-gray-500/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                        insight.severity === 'high' ? 'bg-red-400 animate-pulse' :
                        insight.severity === 'medium' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {insight.content}
                        </p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {formatTimestamp(insight.timestamp)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-slate-900/50 border border-cyan-500/20 rounded-lg flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'bg-slate-800/50 border border-cyan-500/20'
                      }
                      ${message.isTyping ? 'animate-pulse' : ''}
                    `}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-xs font-bold text-cyan-400">GhostMind</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <span className="text-xs font-bold text-cyan-400">GhostMind</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">Analyzing intelligence...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-cyan-500/20">
              <div className="flex gap-2 mb-2">
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value as ContextType)}
                  className="px-3 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="global">Global Context</option>
                  <option value="entity">Entity Context</option>
                  <option value="token">Token Context</option>
                  <option value="chain">Chain Context</option>
                  <option value="ring">Ring Context</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask GhostMind anything..."
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  disabled={isThinking}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isThinking || !inputValue.trim()}
                  className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Context Intelligence */}
        <div className={`${showContext ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden hidden lg:block`}>
          <div className="h-full bg-slate-900/50 border border-cyan-500/20 rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-bold text-cyan-400">{contextContent.title}</h3>
              <button
                onClick={() => setShowContext(false)}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {contextContent.content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="flex gap-2 mt-4 md:hidden">
        {!showInsights && (
          <button
            onClick={() => setShowInsights(true)}
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-cyan-500/20 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            Show Insights
          </button>
        )}
      </div>
    </div>
  )
}
