/**
 * GhostQuant Voice Copilot UI Components
 * Premium, cinematic UI for the Voice Copilot
 */

export { 
  SingularityOrb, 
  createOrbController,
  type SingularityOrbProps,
  type SingularityOrbRef,
  type OrbState,
  type InsightType,
} from './SingularityOrb';

export {
  ANIMATION_CONFIG,
  ORB_COLORS,
  generateIdleKeyframes,
  generateWakeWordKeyframes,
  generateListeningKeyframes,
  generateThinkingKeyframes,
  generateSpeakingKeyframes,
  generateInsightKeyframes,
  getAnimationCSS,
  generateSparkPositions,
  calculateVolumeScale,
} from './SingularityOrbAnimations';
