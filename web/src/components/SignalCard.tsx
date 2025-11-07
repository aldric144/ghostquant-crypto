interface SignalCardProps {
  symbol: string
  signal: {
    ts: string
    trend_score: number
    pretrend_prob: number
    action: string
    confidence: number
    rationale: any
  }
}

export default function SignalCard({ symbol, signal }: SignalCardProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-900/30 border-green-700 text-green-400'
      case 'TRIM':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
      case 'EXIT':
        return 'bg-red-900/30 border-red-700 text-red-400'
      default:
        return 'bg-slate-800 border-slate-700 text-gray-400'
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-600 text-white'
      case 'TRIM':
        return 'bg-yellow-600 text-white'
      case 'EXIT':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const formatTime = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleString()
  }

  const topDrivers = signal.rationale?.top_drivers || []

  return (
    <div className={`border rounded-lg p-4 ${getActionColor(signal.action)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold">{symbol}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getActionBadgeColor(signal.action)}`}>
            {signal.action}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {formatTime(signal.ts)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">TrendScore</div>
          <div className="text-lg font-semibold">{signal.trend_score?.toFixed(1) || 'N/A'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Pre-Trend</div>
          <div className="text-lg font-semibold">{((signal.pretrend_prob || 0) * 100).toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Confidence</div>
          <div className="text-lg font-semibold">{((signal.confidence || 0) * 100).toFixed(0)}%</div>
        </div>
      </div>

      {topDrivers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 mb-2">Top Drivers</div>
          <div className="flex flex-wrap gap-2">
            {topDrivers.map((driver: any, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                {driver.name}: {driver.contribution?.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
