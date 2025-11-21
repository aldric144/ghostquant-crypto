'use client'

interface ChartPreviewProps {
  title: string
  data?: number[]
  color?: string
  height?: number
}

export default function ChartPreview({ 
  title, 
  data = [30, 45, 35, 60, 50, 70, 65, 80, 75, 90],
  color = '#3b82f6',
  height = 60
}: ChartPreviewProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="bg-slate-900/50 border border-blue-900/30 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">{title}</h3>
      <div className="flex items-end gap-1" style={{ height: `${height}px` }}>
        {data.map((value, index) => {
          const heightPercent = ((value - min) / range) * 100
          return (
            <div
              key={index}
              className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
