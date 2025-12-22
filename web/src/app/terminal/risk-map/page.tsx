import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function RiskMapPage() {
  return (
    <ModuleActivatedPlaceholder
      title="Unified Risk Map"
      description="Comprehensive risk visualization combining all intelligence sources. Displays systemic risk, concentration risk, and threat levels across the crypto ecosystem."
      gqCorePath="risk"
    />
  )
}
