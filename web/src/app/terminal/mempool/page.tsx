import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function MempoolRadarPage() {
  return (
    <ModuleActivatedPlaceholder
      title="Mempool Manipulation Radar"
      description="Real-time monitoring of pending transactions across major blockchains. Detects sandwich attacks, front-running, and MEV extraction patterns before they execute."
      gqCorePath="anomalies"
    />
  )
}
