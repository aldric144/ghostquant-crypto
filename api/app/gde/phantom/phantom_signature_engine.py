"""
Phantom Deception Engine™ - Signature Engine
Maps deception features into 10 known fraudster archetypes
"""

import logging
from typing import Dict, Any, List, Tuple
from .phantom_schema import PhantomSignature

logger = logging.getLogger(__name__)


class PhantomSignatureEngine:
    """
    Classifies deception patterns into 10 scammer signature types:
    1. THE MANIPULATOR - Emotional manipulation, guilt tactics
    2. THE PREDATOR - Aggressive, urgent, high-pressure
    3. THE IMPOSTOR - Identity theft, impersonation
    4. THE FANTOM - Silent synthetic actor, minimal interaction
    5. THE HUSTLER - Fast-talking, overpromising, urgency
    6. THE SOCIAL ENGINEER - Trust-building, information extraction
    7. THE INSIDER - Claims privileged information, exclusivity
    8. THE PSYCH-MODEL - Emotional mimic, empathy exploitation
    9. THE MIMIC - AI-generated persona, synthetic patterns
    10. UNKNOWN - Insufficient data or mixed signals
    """
    
    SIGNATURE_TYPES = [
        "THE MANIPULATOR",
        "THE PREDATOR",
        "THE IMPOSTOR",
        "THE FANTOM",
        "THE HUSTLER",
        "THE SOCIAL ENGINEER",
        "THE INSIDER",
        "THE PSYCH-MODEL",
        "THE MIMIC",
        "UNKNOWN"
    ]
    
    def __init__(self):
        """Initialize signature engine"""
        logger.info("[Phantom] SignatureEngine initialized")
    
    def score_signature(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Score all signature types based on features
        
        Returns:
            Dictionary mapping signature type to score (0-1)
        """
        try:
            scores = {}
            
            scores["THE MANIPULATOR"] = self._score_manipulator(features)
            scores["THE PREDATOR"] = self._score_predator(features)
            scores["THE IMPOSTOR"] = self._score_impostor(features)
            scores["THE FANTOM"] = self._score_fantom(features)
            scores["THE HUSTLER"] = self._score_hustler(features)
            scores["THE SOCIAL ENGINEER"] = self._score_social_engineer(features)
            scores["THE INSIDER"] = self._score_insider(features)
            scores["THE PSYCH-MODEL"] = self._score_psych_model(features)
            scores["THE MIMIC"] = self._score_mimic(features)
            scores["UNKNOWN"] = self._score_unknown(features, scores)
            
            logger.info(f"[Phantom] Scored {len(scores)} signature types")
            return scores
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring signatures: {e}")
            return {sig: 0.0 for sig in self.SIGNATURE_TYPES}
    
    def _score_manipulator(self, features: Dict[str, float]) -> float:
        """
        Score THE MANIPULATOR signature
        Characteristics: Emotional manipulation, guilt tactics, sympathy appeals
        """
        try:
            score = 0.0
            
            score += features.get('guilt_manipulation_score', 0) * 0.3
            score += features.get('sympathy_appeal_score', 0) * 0.25
            score += features.get('emotional_volatility', 0) * 0.2
            score += features.get('manipulation_density', 0) * 0.15
            score += features.get('second_person_density', 0) * 0.1  # Focus on "you"
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring manipulator: {e}")
            return 0.0
    
    def _score_predator(self, features: Dict[str, float]) -> float:
        """
        Score THE PREDATOR signature
        Characteristics: Aggressive, urgent, high-pressure tactics
        """
        try:
            score = 0.0
            
            score += features.get('urgency_density', 0) * 0.3
            score += features.get('aggression_score', 0) * 0.25
            score += features.get('exclamation_density', 0) * 0.2
            score += features.get('anger_emotion_density', 0) * 0.15
            score += features.get('caps_ratio', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring predator: {e}")
            return 0.0
    
    def _score_impostor(self, features: Dict[str, float]) -> float:
        """
        Score THE IMPOSTOR signature
        Characteristics: Identity theft, impersonation, false credentials
        """
        try:
            score = 0.0
            
            score += features.get('identity_verification_score', 0) * 0.3
            score += (1.0 - features.get('trust_score', 0.5)) * 0.25  # Low trust
            score += features.get('device_anomaly_score', 0) * 0.2
            score += features.get('vpn_probability', 0) * 0.15
            score += features.get('fraud_history_score', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring impostor: {e}")
            return 0.0
    
    def _score_fantom(self, features: Dict[str, float]) -> float:
        """
        Score THE FANTOM signature
        Characteristics: Silent synthetic actor, minimal interaction, dormant patterns
        """
        try:
            score = 0.0
            
            score += features.get('synthetic_composite', 0) * 0.3
            score += features.get('bot_probability', 0) * 0.25
            score += features.get('dormancy_score', 0) * 0.2
            score += features.get('ai_generated_probability', 0) * 0.15
            
            word_count = features.get('word_count', 100)
            if word_count < 20:
                score += 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring fantom: {e}")
            return 0.0
    
    def _score_hustler(self, features: Dict[str, float]) -> float:
        """
        Score THE HUSTLER signature
        Characteristics: Fast-talking, overpromising, urgency, manipulation
        """
        try:
            score = 0.0
            
            score += features.get('manipulation_density', 0) * 0.3
            score += features.get('urgency_density', 0) * 0.25
            score += features.get('deception_keyword_density', 0) * 0.2
            score += features.get('confidence_score', 0) * 0.15  # Overconfidence
            score += features.get('oversharing_indicator', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring hustler: {e}")
            return 0.0
    
    def _score_social_engineer(self, features: Dict[str, float]) -> float:
        """
        Score THE SOCIAL ENGINEER signature
        Characteristics: Trust-building, information extraction, rapport
        """
        try:
            score = 0.0
            
            score += features.get('sympathy_appeal_score', 0) * 0.25
            score += features.get('question_density', 0) * 0.25  # Asking questions
            score += features.get('second_person_density', 0) * 0.2  # Focus on target
            score += features.get('evasion_density', 0) * 0.15
            score += features.get('confidence_score', 0) * 0.15
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring social engineer: {e}")
            return 0.0
    
    def _score_insider(self, features: Dict[str, float]) -> float:
        """
        Score THE INSIDER signature
        Characteristics: Claims privileged information, exclusivity, secrets
        """
        try:
            score = 0.0
            
            score += features.get('evasion_density', 0) * 0.3  # Secretive language
            score += features.get('manipulation_density', 0) * 0.25  # "Exclusive opportunity"
            score += features.get('urgency_density', 0) * 0.2  # "Limited time"
            score += features.get('first_person_density', 0) * 0.15  # "I know"
            score += features.get('confidence_score', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring insider: {e}")
            return 0.0
    
    def _score_psych_model(self, features: Dict[str, float]) -> float:
        """
        Score THE PSYCH-MODEL signature
        Characteristics: Emotional mimic, empathy exploitation, psychological tactics
        """
        try:
            score = 0.0
            
            score += features.get('emotional_instability', 0) * 0.3
            score += features.get('sympathy_appeal_score', 0) * 0.25
            score += features.get('guilt_manipulation_score', 0) * 0.2
            score += features.get('emotional_volatility', 0) * 0.15
            score += features.get('second_person_density', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring psych-model: {e}")
            return 0.0
    
    def _score_mimic(self, features: Dict[str, float]) -> float:
        """
        Score THE MIMIC signature
        Characteristics: AI-generated persona, synthetic patterns, bot-like
        """
        try:
            score = 0.0
            
            score += features.get('ai_generated_probability', 0) * 0.3
            score += features.get('bot_probability', 0) * 0.25
            score += features.get('synthetic_composite', 0) * 0.2
            score += features.get('repetition_score', 0) * 0.15  # Repetitive patterns
            score += features.get('consistency_score', 0) * 0.1  # Too consistent
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring mimic: {e}")
            return 0.0
    
    def _score_unknown(self, features: Dict[str, float], scores: Dict[str, float]) -> float:
        """
        Score UNKNOWN signature
        High when no clear signature emerges or mixed signals
        """
        try:
            other_scores = [s for k, s in scores.items() if k != "UNKNOWN"]
            
            if not other_scores:
                return 0.5
            
            max_score = max(other_scores)
            avg_score = sum(other_scores) / len(other_scores)
            
            if max_score < 0.3:
                return 0.8  # No clear signature
            elif avg_score > 0.4 and max_score < 0.6:
                return 0.6  # Mixed signals
            else:
                return 0.2  # Clear signature exists
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring unknown: {e}")
            return 0.5
    
    def classify_signature(self, feature_scores: Dict[str, float]) -> PhantomSignature:
        """
        Classify into primary signature type
        
        Returns:
            PhantomSignature with label, score, pattern, risk_level
        """
        try:
            max_score = 0.0
            max_label = "UNKNOWN"
            
            for label, score in feature_scores.items():
                if score > max_score:
                    max_score = score
                    max_label = label
            
            pattern = self._get_pattern_description(max_label)
            
            risk_level = self._determine_risk_level(max_label, max_score)
            
            signature = PhantomSignature(
                label=max_label,
                score=max_score,
                pattern=pattern,
                risk_level=risk_level
            )
            
            logger.info(f"[Phantom] Classified as {max_label} (score: {max_score:.3f})")
            return signature
            
        except Exception as e:
            logger.error(f"[Phantom] Error classifying signature: {e}")
            return PhantomSignature(
                label="UNKNOWN",
                score=0.0,
                pattern="Unable to classify",
                risk_level="UNKNOWN"
            )
    
    def _get_pattern_description(self, label: str) -> str:
        """Get pattern description for signature type"""
        patterns = {
            "THE MANIPULATOR": "Emotional manipulation with guilt tactics and sympathy appeals",
            "THE PREDATOR": "Aggressive high-pressure tactics with urgency and threats",
            "THE IMPOSTOR": "Identity theft and impersonation with false credentials",
            "THE FANTOM": "Silent synthetic actor with minimal interaction patterns",
            "THE HUSTLER": "Fast-talking overpromising with urgency manipulation",
            "THE SOCIAL ENGINEER": "Trust-building rapport with information extraction",
            "THE INSIDER": "Claims privileged information with exclusivity tactics",
            "THE PSYCH-MODEL": "Emotional mimic exploiting empathy and psychology",
            "THE MIMIC": "AI-generated persona with synthetic behavioral patterns",
            "UNKNOWN": "Mixed or insufficient signals for classification"
        }
        return patterns.get(label, "Unknown pattern")
    
    def _determine_risk_level(self, label: str, score: float) -> str:
        """Determine risk level based on signature and score"""
        try:
            high_risk = ["THE PREDATOR", "THE IMPOSTOR", "THE MANIPULATOR"]
            moderate_risk = ["THE HUSTLER", "THE SOCIAL ENGINEER", "THE INSIDER", "THE PSYCH-MODEL"]
            low_risk = ["THE FANTOM", "THE MIMIC", "UNKNOWN"]
            
            if label in high_risk:
                if score >= 0.7:
                    return "CRITICAL"
                elif score >= 0.5:
                    return "HIGH"
                else:
                    return "MODERATE"
            elif label in moderate_risk:
                if score >= 0.7:
                    return "HIGH"
                elif score >= 0.5:
                    return "MODERATE"
                else:
                    return "LOW"
            else:  # low_risk
                if score >= 0.7:
                    return "MODERATE"
                elif score >= 0.5:
                    return "LOW"
                else:
                    return "MINIMAL"
            
        except Exception as e:
            logger.error(f"[Phantom] Error determining risk level: {e}")
            return "UNKNOWN"
    
    def explain_signature(self, signature: PhantomSignature) -> str:
        """
        Generate detailed explanation for signature type
        
        Returns:
            Multi-sentence explanation
        """
        try:
            explanations = {
                "THE MANIPULATOR": "This actor employs emotional manipulation tactics to exploit targets. They use guilt, sympathy appeals, and emotional volatility to create psychological pressure. Their language patterns show high emotional content with frequent appeals to feelings and personal connections. This signature is associated with romance scams, charity fraud, and emotional exploitation schemes.",
                
                "THE PREDATOR": "This actor uses aggressive high-pressure tactics to force immediate action. They create artificial urgency, use threatening language, and employ intimidation strategies. Their communication shows high aggression scores with frequent exclamations and demanding language. This signature is common in extortion schemes, blackmail operations, and aggressive investment scams.",
                
                "THE IMPOSTOR": "This actor engages in identity theft and impersonation. They present false credentials, stolen identities, or fabricated authority. Their profile shows verification anomalies, device fingerprint issues, and trust score discrepancies. This signature appears in authority impersonation scams, credential theft operations, and identity fraud schemes.",
                
                "THE FANTOM": "This actor operates as a silent synthetic entity with minimal direct interaction. They exhibit dormant patterns, synthetic identity markers, and bot-like characteristics. Their activity shows low engagement with high automation indicators. This signature is associated with automated fraud operations, bot networks, and synthetic identity schemes.",
                
                "THE HUSTLER": "This actor employs fast-talking overpromising tactics with artificial urgency. They make exaggerated claims, promise unrealistic returns, and create false scarcity. Their language shows high manipulation density with confidence overstatement. This signature appears in get-rich-quick schemes, pyramid operations, and investment fraud.",
                
                "THE SOCIAL ENGINEER": "This actor builds trust and rapport to extract sensitive information. They ask probing questions, create false relationships, and exploit social dynamics. Their communication shows high question density with sympathy appeals. This signature is common in phishing operations, information theft, and social manipulation schemes.",
                
                "THE INSIDER": "This actor claims privileged access to exclusive information or opportunities. They use secretive language, create artificial exclusivity, and imply special knowledge. Their patterns show high evasion density with insider terminology. This signature appears in insider trading scams, exclusive opportunity fraud, and privileged information schemes.",
                
                "THE PSYCH-MODEL": "This actor mimics emotional patterns to exploit psychological vulnerabilities. They mirror emotions, exploit empathy, and use psychological manipulation. Their communication shows emotional instability with targeted sympathy appeals. This signature is associated with psychological manipulation schemes, emotional exploitation, and empathy-based fraud.",
                
                "THE MIMIC": "This actor presents as an AI-generated or synthetic persona. They exhibit bot-like patterns, repetitive language, and synthetic behavioral markers. Their profile shows high AI-generation probability with consistency anomalies. This signature appears in automated scam operations, AI-generated fraud, and synthetic persona schemes.",
                
                "UNKNOWN": "This actor presents mixed or insufficient signals for clear classification. They may be employing multiple tactics, operating with limited data, or using novel approaches. Further analysis and additional data points are recommended for accurate classification."
            }
            
            return explanations.get(signature.label, "Unable to generate explanation for this signature type.")
            
        except Exception as e:
            logger.error(f"[Phantom] Error explaining signature: {e}")
            return "Error generating signature explanation."
