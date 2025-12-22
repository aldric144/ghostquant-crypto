import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function GenesisArchivePage() {
  return (
    <ModuleActivatedPlaceholder
      title="Genesis Archive"
      description="Historical intelligence archive containing past market events, manipulation incidents, and threat actor activities. Provides context for current market conditions."
      gqCorePath="narratives"
    />
  )
}
