'use client'

import { useEffect, useRef } from 'react'

interface LineChartProps {
  data: any[]
  xKey: string
  yKey: string
  title: string
}

export default function LineChart({ data, xKey, yKey, title }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current || data.length === 0) return

    import('plotly.js-dist-min').then((Plotly) => {
      const x = data.map(d => new Date(d[xKey]))
      const y = data.map(d => d[yKey])

      const trace = {
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#60a5fa', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(96, 165, 250, 0.1)'
      }

      const layout = {
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
      }

      const config = {
        responsive: true,
        displayModeBar: false
      }

      Plotly.newPlot(chartRef.current, [trace], layout, config)
    })
  }, [data, xKey, yKey])

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  return <div ref={chartRef} className="h-64" />
}
