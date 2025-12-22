import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function CrossChainGraphPage() {
  return (
    <ModuleActivatedPlaceholder
      title="Cross-Chain Entity Graph"
      description="Visualizes entity relationships and fund flows across multiple blockchain networks. Tracks cross-chain bridges, atomic swaps, and multi-chain wallet clusters."
      gqCorePath="map"
    />
  )
}
