interface HeatmapProps {
  signals: any[]
  assets: any[]
}

export default function Heatmap({ signals, assets }: HeatmapProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-600'
    if (score >= 60) return 'bg-green-700'
    if (score >= 50) return 'bg-yellow-600'
    if (score >= 40) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getScoreText = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 60) return 'text-green-500'
    if (score >= 50) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3">
        {assets.map((asset) => {
          const signal = signals.find(s => s.asset_id === asset.asset_id)
          const score = signal?.trend_score || 50

          return (
            <a
              key={asset.asset_id}
              href={`/assets/${asset.symbol}`}
              className="block bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-blue-600 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-200">{asset.symbol}</div>
                <div className={`w-3 h-3 rounded-full ${getScoreColor(score)}`}></div>
              </div>
              <div className={`text-2xl font-bold ${getScoreText(score)}`}>
                {score.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {signal?.action || 'HOLD'}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
