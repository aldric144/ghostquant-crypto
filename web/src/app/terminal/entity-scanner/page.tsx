import { ModuleActivatedPlaceholder } from '@/components/terminal/ModuleActivatedPlaceholder'

export default function EntityScannerPage() {
  return (
    <ModuleActivatedPlaceholder
      title="Predictive Entity Scanner"
      description="Scans and classifies blockchain entities using machine learning. Predicts entity behavior, risk levels, and potential market impact based on historical patterns."
      gqCorePath="entities"
    />
  )
}
