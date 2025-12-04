"""
Phantom Deception Engine™ - Master Engine
Complete deception analysis with scoring, classification, and narrative generation
"""

import logging
from typing import Dict, Any
from .phantom_schema import PhantomInput, PhantomResult, PhantomSignature
from .phantom_feature_engine import PhantomFeatureEngine
from .phantom_signature_engine import PhantomSignatureEngine

logger = logging.getLogger(__name__)


class PhantomEngine:
    """
    Master deception analysis engine
    
    Flow:
    1. Extract features (50-80 features across 6 domains)
    2. Score deception (0-1)
    3. Detect signature type (10 archetypes)
    4. Build final composite
    5. Produce narrative + summary
    """
    
    def __init__(self):
        """Initialize Phantom Engine"""
        self.feature_engine = PhantomFeatureEngine()
        self.signature_engine = PhantomSignatureEngine()
        logger.info("[Phantom] Engine initialized")
    
    def analyze(self, input_data: PhantomInput) -> PhantomResult:
        """
        Complete deception analysis
        
        Args:
            input_data: PhantomInput with transcript and metadata
            
        Returns:
            PhantomResult with complete analysis
        """
        try:
            logger.info("[Phantom] Starting deception analysis")
            
            features = self.feature_engine.extract_features(input_data)
            
            deception_score = self.compute_deception_score(features)
            
            signature_scores = self.signature_engine.score_signature(features)
            
            signature = self.signature_engine.classify_signature(signature_scores)
            
            intent_score = self.compute_intent_score(features, signature)
            
            synthetic_probability = self.compute_synthetic_probability(features)
            
            result = PhantomResult(
                deception_score=deception_score,
                intent_score=intent_score,
                synthetic_probability=synthetic_probability,
                actor_type=signature.label,
                classification=signature.risk_level,
                features_used=features,
                signature=signature.to_dict()
            )
            
            result = self.generate_flags(result)
            
            result = self.generate_summary(result)
            
            result = self.generate_narrative(result)
            
            logger.info(f"[Phantom] Analysis complete: {result.id} ({result.actor_type})")
            return result
            
        except Exception as e:
            logger.error(f"[Phantom] Error in analysis: {e}")
            return PhantomResult(
                deception_score=0.0,
                intent_score=0.0,
                synthetic_probability=0.0,
                actor_type="UNKNOWN",
                classification="ERROR",
                summary="Error during analysis",
                narrative="Unable to complete deception analysis due to processing error.",
                features_used={}
            )
    
    def compute_deception_score(self, features: Dict[str, float]) -> float:
        """
        Compute composite deception score (0-1)
        
        Combines:
        - Linguistic deception cues
        - Behavioral patterns
        - Emotional manipulation
        - Metadata risk flags
        
        Args:
            features: Extracted feature dictionary
            
        Returns:
            Deception score 0.0-1.0
        """
        try:
            linguistic_score = self.feature_engine.score_linguistic(features)
            behavioral_score = self.feature_engine.score_behavioral(features)
            synthetic_score = self.feature_engine.score_synthetic_identity(features)
            
            emotional_score = features.get('emotional_risk', 0.0)
            metadata_score = features.get('metadata_risk', 0.0)
            
            weights = {
                'linguistic': 0.25,
                'behavioral': 0.25,
                'synthetic': 0.20,
                'emotional': 0.15,
                'metadata': 0.15
            }
            
            deception_score = (
                linguistic_score * weights['linguistic'] +
                behavioral_score * weights['behavioral'] +
                synthetic_score * weights['synthetic'] +
                emotional_score * weights['emotional'] +
                metadata_score * weights['metadata']
            )
            
            deception_score = max(0.0, min(1.0, deception_score))
            
            logger.info(f"[Phantom] Deception score: {deception_score:.3f}")
            return deception_score
            
        except Exception as e:
            logger.error(f"[Phantom] Error computing deception score: {e}")
            return 0.0
    
    def compute_intent_score(self, features: Dict[str, float], signature: PhantomSignature) -> float:
        """
        Compute intent score (0=benign, 1=malicious)
        
        Considers:
        - Signature type risk level
        - Deception indicators
        - Manipulation tactics
        - Historical fraud patterns
        
        Args:
            features: Extracted feature dictionary
            signature: Classified signature
            
        Returns:
            Intent score 0.0-1.0
        """
        try:
            intent_score = 0.0
            
            risk_intent = {
                'CRITICAL': 0.95,
                'HIGH': 0.80,
                'MODERATE': 0.60,
                'LOW': 0.35,
                'MINIMAL': 0.15,
                'UNKNOWN': 0.50
            }
            intent_score += risk_intent.get(signature.risk_level, 0.5) * 0.4
            
            manipulation_score = features.get('manipulation_density', 0.0)
            intent_score += manipulation_score * 0.25
            
            fraud_history = features.get('fraud_history_score', 0.0)
            intent_score += fraud_history * 0.20
            
            urgency_score = features.get('urgency_density', 0.0)
            intent_score += urgency_score * 0.15
            
            intent_score = max(0.0, min(1.0, intent_score))
            
            logger.info(f"[Phantom] Intent score: {intent_score:.3f}")
            return intent_score
            
        except Exception as e:
            logger.error(f"[Phantom] Error computing intent score: {e}")
            return 0.5
    
    def compute_synthetic_probability(self, features: Dict[str, float]) -> float:
        """
        Compute synthetic identity probability (0-1)
        
        Considers:
        - Bot indicators
        - AI-generated patterns
        - Device anomalies
        - Behavioral consistency
        
        Args:
            features: Extracted feature dictionary
            
        Returns:
            Synthetic probability 0.0-1.0
        """
        try:
            return self.feature_engine.score_synthetic_identity(features)
        except Exception as e:
            logger.error(f"[Phantom] Error computing synthetic probability: {e}")
            return 0.0
    
    def generate_flags(self, result: PhantomResult) -> PhantomResult:
        """
        Generate warning flags based on analysis
        
        Args:
            result: PhantomResult to add flags to
            
        Returns:
            Updated PhantomResult with flags
        """
        try:
            flags = []
            
            if result.deception_score >= 0.8:
                flags.append("CRITICAL_DECEPTION")
            elif result.deception_score >= 0.6:
                flags.append("HIGH_DECEPTION")
            elif result.deception_score >= 0.4:
                flags.append("MODERATE_DECEPTION")
            
            if result.intent_score >= 0.8:
                flags.append("MALICIOUS_INTENT")
            elif result.intent_score >= 0.6:
                flags.append("SUSPICIOUS_INTENT")
            
            if result.synthetic_probability >= 0.7:
                flags.append("SYNTHETIC_IDENTITY")
            elif result.synthetic_probability >= 0.5:
                flags.append("POSSIBLE_BOT")
            
            if result.actor_type == "THE PREDATOR":
                flags.append("AGGRESSIVE_TACTICS")
            elif result.actor_type == "THE MANIPULATOR":
                flags.append("EMOTIONAL_MANIPULATION")
            elif result.actor_type == "THE IMPOSTOR":
                flags.append("IDENTITY_FRAUD")
            elif result.actor_type == "THE SOCIAL ENGINEER":
                flags.append("INFORMATION_EXTRACTION")
            elif result.actor_type == "THE HUSTLER":
                flags.append("OVERPROMISING")
            elif result.actor_type == "THE INSIDER":
                flags.append("FALSE_EXCLUSIVITY")
            
            features = result.features_used
            
            if features.get('urgency_density', 0) > 0.1:
                flags.append("URGENCY_PRESSURE")
            
            if features.get('manipulation_density', 0) > 0.1:
                flags.append("MANIPULATION_LANGUAGE")
            
            if features.get('evasion_density', 0) > 0.05:
                flags.append("EVASIVE_BEHAVIOR")
            
            if features.get('fraud_history_score', 0) > 0.5:
                flags.append("FRAUD_HISTORY")
            
            if features.get('vpn_probability', 0) > 0.7:
                flags.append("VPN_DETECTED")
            
            if features.get('device_anomaly_score', 0) > 0.6:
                flags.append("DEVICE_ANOMALY")
            
            result.flags = flags
            logger.info(f"[Phantom] Generated {len(flags)} flags")
            return result
            
        except Exception as e:
            logger.error(f"[Phantom] Error generating flags: {e}")
            result.flags = []
            return result
    
    def generate_summary(self, result: PhantomResult) -> PhantomResult:
        """
        Generate concise summary (2-3 sentences)
        
        Args:
            result: PhantomResult to add summary to
            
        Returns:
            Updated PhantomResult with summary
        """
        try:
            deception_level = self._get_deception_level(result.deception_score)
            intent_level = self._get_intent_level(result.intent_score)
            
            summary = f"{deception_level} deception detected with {intent_level} intent. "
            summary += f"Actor classified as {result.actor_type} with {result.classification} risk level. "
            
            if result.synthetic_probability >= 0.7:
                summary += f"High synthetic identity probability ({result.synthetic_probability:.0%}). "
            
            if len(result.flags) > 0:
                summary += f"Active flags: {', '.join(result.flags[:3])}."
            
            result.summary = summary
            logger.info("[Phantom] Generated summary")
            return result
            
        except Exception as e:
            logger.error(f"[Phantom] Error generating summary: {e}")
            result.summary = "Deception analysis completed with mixed results."
            return result
    
    def generate_narrative(self, result: PhantomResult) -> PhantomResult:
        """
        Generate detailed narrative (5-10 sentences)
        
        Args:
            result: PhantomResult to add narrative to
            
        Returns:
            Updated PhantomResult with narrative
        """
        try:
            narrative_parts = []
            
            narrative_parts.append(self._build_opening_statement(result))
            
            if result.signature:
                signature_obj = PhantomSignature(**result.signature)
                explanation = self.signature_engine.explain_signature(signature_obj)
                narrative_parts.append(explanation)
            
            narrative_parts.append(self._build_feature_analysis(result))
            
            narrative_parts.append(self._build_risk_assessment(result))
            
            narrative_parts.append(self._build_recommendations(result))
            
            result.narrative = " ".join(narrative_parts)
            logger.info("[Phantom] Generated narrative")
            return result
            
        except Exception as e:
            logger.error(f"[Phantom] Error generating narrative: {e}")
            result.narrative = "Complete deception analysis narrative unavailable due to processing error."
            return result
    
    def _get_deception_level(self, score: float) -> str:
        """Get deception level description"""
        if score >= 0.8:
            return "Critical"
        elif score >= 0.6:
            return "High"
        elif score >= 0.4:
            return "Moderate"
        elif score >= 0.2:
            return "Low"
        else:
            return "Minimal"
    
    def _get_intent_level(self, score: float) -> str:
        """Get intent level description"""
        if score >= 0.8:
            return "malicious"
        elif score >= 0.6:
            return "suspicious"
        elif score >= 0.4:
            return "questionable"
        else:
            return "unclear"
    
    def _build_opening_statement(self, result: PhantomResult) -> str:
        """Build opening statement for narrative"""
        try:
            deception_pct = f"{result.deception_score:.0%}"
            intent_pct = f"{result.intent_score:.0%}"
            
            statement = f"Deception analysis reveals {deception_pct} deception probability with {intent_pct} malicious intent score. "
            statement += f"The actor has been classified as {result.actor_type} based on behavioral and linguistic patterns. "
            
            return statement
            
        except Exception as e:
            logger.error(f"[Phantom] Error building opening: {e}")
            return "Deception analysis completed. "
    
    def _build_feature_analysis(self, result: PhantomResult) -> str:
        """Build feature analysis section"""
        try:
            features = result.features_used
            
            analysis = "Feature analysis indicates "
            
            linguistic_risk = features.get('linguistic_risk', 0.0)
            if linguistic_risk > 0.5:
                analysis += "elevated linguistic deception cues including manipulation language and urgency tactics. "
            
            behavioral_risk = features.get('behavioral_risk', 0.0)
            if behavioral_risk > 0.5:
                analysis += "Behavioral patterns show contradiction density and confidence misalignment. "
            
            synthetic_risk = features.get('synthetic_risk', 0.0)
            if synthetic_risk > 0.5:
                analysis += "Synthetic identity markers detected with bot-like characteristics. "
            
            if linguistic_risk <= 0.5 and behavioral_risk <= 0.5 and synthetic_risk <= 0.5:
                analysis += "relatively normal patterns across linguistic, behavioral, and synthetic domains. "
            
            return analysis
            
        except Exception as e:
            logger.error(f"[Phantom] Error building feature analysis: {e}")
            return "Feature analysis completed. "
    
    def _build_risk_assessment(self, result: PhantomResult) -> str:
        """Build risk assessment section"""
        try:
            assessment = f"Risk assessment classifies this actor as {result.classification} risk. "
            
            if result.classification in ["CRITICAL", "HIGH"]:
                assessment += "Immediate action recommended including enhanced monitoring and fraud prevention protocols. "
            elif result.classification == "MODERATE":
                assessment += "Elevated surveillance recommended with continued monitoring of behavioral patterns. "
            else:
                assessment += "Standard monitoring protocols sufficient with periodic reassessment. "
            
            return assessment
            
        except Exception as e:
            logger.error(f"[Phantom] Error building risk assessment: {e}")
            return "Risk assessment completed. "
    
    def _build_recommendations(self, result: PhantomResult) -> str:
        """Build recommendations section"""
        try:
            recommendations = "Recommended actions: "
            
            if result.deception_score >= 0.7:
                recommendations += "Block or restrict account access. "
            elif result.deception_score >= 0.5:
                recommendations += "Flag for manual review. "
            
            if result.intent_score >= 0.7:
                recommendations += "Report to fraud prevention team. "
            
            if result.synthetic_probability >= 0.7:
                recommendations += "Verify identity through additional authentication. "
            
            if "FRAUD_HISTORY" in result.flags:
                recommendations += "Cross-reference with fraud database. "
            
            if not any([
                result.deception_score >= 0.5,
                result.intent_score >= 0.5,
                result.synthetic_probability >= 0.5
            ]):
                recommendations += "Continue standard monitoring with periodic reassessment."
            
            return recommendations
            
        except Exception as e:
            logger.error(f"[Phantom] Error building recommendations: {e}")
            return "Standard monitoring recommended."
