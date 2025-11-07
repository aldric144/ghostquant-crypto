'use client'

import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface LineChartProps {
  data: any[]
  xKey: string
  yKey: string
  title: string
}

export default function LineChart({ data, xKey, yKey, title }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  const x = data.map(d => new Date(d[xKey]))
  const y = data.map(d => d[yKey])

  return (
    <Plot
      data={[
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#60a5fa', width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(96, 165, 250, 0.1)'
        }
      ]}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#9ca3af' },
        margin: { l: 40, r: 20, t: 20, b: 40 },
        xaxis: {
          gridcolor: '#374151',
          showgrid: true
        },
        yaxis: {
          gridcolor: '#374151',
          showgrid: true
        },
        hovermode: 'closest'
      }}
      config={{
        responsive: true,
        displayModeBar: false
      }}
      className="h-64 w-full"
    />
  )
}
