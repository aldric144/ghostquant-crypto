import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function ThreatActorProfilerPage() {
  return (
    <ModuleActivatedPlaceholder
      title="Threat Actor Profiler"
      description="Profiles coordinated entities and surfaces risk signals across blockchain networks. Identifies malicious actors, wash traders, and manipulation patterns."
      gqCorePath="entities"
    />
  )
}
