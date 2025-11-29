"""
Phantom Deception Engine™ - Feature Engine
Generates 50-80 simulated deception features across 6 domains
"""

import logging
import re
from typing import Dict, Any
from .phantom_schema import PhantomInput

logger = logging.getLogger(__name__)


class PhantomFeatureEngine:
    """
    Extracts and scores deception features across 6 domains:
    1. Linguistic deception cues
    2. Behavioral patterns
    3. Synthetic identity indicators
    4. Emotional instability
    5. Metadata risk flags
    6. Risk-weighted composite
    """
    
    DECEPTION_KEYWORDS = [
        'honestly', 'trust me', 'believe me', 'to be honest', 'frankly',
        'guaranteed', 'promise', 'swear', 'absolutely', 'definitely',
        'never', 'always', 'everyone', 'nobody', 'impossible'
    ]
    
    URGENCY_KEYWORDS = [
        'urgent', 'hurry', 'now', 'immediately', 'quick', 'fast',
        'limited time', 'expires', 'deadline', 'act now', 'don\'t wait'
    ]
    
    MANIPULATION_KEYWORDS = [
        'opportunity', 'exclusive', 'secret', 'insider', 'special',
        'guaranteed returns', 'risk-free', 'easy money', 'passive income'
    ]
    
    EVASION_KEYWORDS = [
        'can\'t say', 'confidential', 'off the record', 'between us',
        'don\'t tell', 'keep quiet', 'private', 'discreet'
    ]
    
    def __init__(self):
        """Initialize feature engine"""
        logger.info("[Phantom] FeatureEngine initialized")
    
    @staticmethod
    def safe_value(data: Any, default: float = 0.0) -> float:
        """Safely extract numeric value"""
        try:
            if isinstance(data, (int, float)):
                return float(data)
            if isinstance(data, str):
                return float(data)
            return default
        except (ValueError, TypeError):
            return default
    
    def extract_features(self, input_data: PhantomInput) -> Dict[str, Any]:
        """
        Extract all deception features from input
        
        Returns:
            Dictionary with 50-80 features across 6 domains
        """
        try:
            logger.info("[Phantom] Extracting deception features")
            
            transcript = input_data.transcript.lower()
            metadata = input_data.metadata
            
            features = {}
            
            features.update(self._extract_linguistic_features(transcript))
            
            features.update(self._extract_behavioral_features(transcript, metadata))
            
            features.update(self._extract_synthetic_features(metadata))
            
            features.update(self._extract_emotional_features(transcript))
            
            features.update(self._extract_metadata_features(metadata))
            
            features.update(self._compute_composite_features(features))
            
            logger.info(f"[Phantom] Extracted {len(features)} features")
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting features: {e}")
            return {}
    
    def _extract_linguistic_features(self, transcript: str) -> Dict[str, float]:
        """Extract linguistic deception cues (20+ features)"""
        try:
            features = {}
            
            words = transcript.split()
            features['word_count'] = len(words)
            features['avg_word_length'] = sum(len(w) for w in words) / max(len(words), 1)
            features['unique_word_ratio'] = len(set(words)) / max(len(words), 1)
            
            deception_count = sum(1 for kw in self.DECEPTION_KEYWORDS if kw in transcript)
            features['deception_keyword_density'] = deception_count / max(len(words), 1)
            features['deception_keyword_count'] = deception_count
            
            urgency_count = sum(1 for kw in self.URGENCY_KEYWORDS if kw in transcript)
            features['urgency_density'] = urgency_count / max(len(words), 1)
            features['urgency_count'] = urgency_count
            
            manipulation_count = sum(1 for kw in self.MANIPULATION_KEYWORDS if kw in transcript)
            features['manipulation_density'] = manipulation_count / max(len(words), 1)
            features['manipulation_count'] = manipulation_count
            
            evasion_count = sum(1 for kw in self.EVASION_KEYWORDS if kw in transcript)
            features['evasion_density'] = evasion_count / max(len(words), 1)
            features['evasion_count'] = evasion_count
            
            sentences = [s.strip() for s in re.split(r'[.!?]+', transcript) if s.strip()]
            features['sentence_count'] = len(sentences)
            features['avg_sentence_length'] = len(words) / max(len(sentences), 1)
            
            features['question_count'] = transcript.count('?')
            features['question_density'] = features['question_count'] / max(len(sentences), 1)
            
            features['exclamation_count'] = transcript.count('!')
            features['exclamation_density'] = features['exclamation_count'] / max(len(sentences), 1)
            
            first_person = len(re.findall(r'\b(i|me|my|mine|myself)\b', transcript))
            second_person = len(re.findall(r'\b(you|your|yours|yourself)\b', transcript))
            third_person = len(re.findall(r'\b(he|she|they|them|their)\b', transcript))
            
            features['first_person_density'] = first_person / max(len(words), 1)
            features['second_person_density'] = second_person / max(len(words), 1)
            features['third_person_density'] = third_person / max(len(words), 1)
            
            hedge_words = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'probably']
            hedge_count = sum(transcript.count(hw) for hw in hedge_words)
            features['hedge_density'] = hedge_count / max(len(words), 1)
            
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting linguistic features: {e}")
            return {}
    
    def _extract_behavioral_features(self, transcript: str, metadata: Dict[str, Any]) -> Dict[str, float]:
        """Extract behavioral pattern features (15+ features)"""
        try:
            features = {}
            
            features['response_time'] = self.safe_value(metadata.get('response_time', 0))
            features['typing_speed'] = self.safe_value(metadata.get('typing_speed', 0))
            features['pause_frequency'] = self.safe_value(metadata.get('pause_frequency', 0))
            
            contradiction_indicators = ['but', 'however', 'although', 'actually', 'wait']
            features['contradiction_density'] = sum(transcript.count(ci) for ci in contradiction_indicators) / max(len(transcript.split()), 1)
            
            words = transcript.split()
            word_freq = {}
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            repeated_words = sum(1 for count in word_freq.values() if count > 2)
            features['repetition_score'] = repeated_words / max(len(set(words)), 1)
            
            confidence_words = ['sure', 'certain', 'confident', 'know', 'positive']
            uncertainty_words = ['unsure', 'uncertain', 'maybe', 'guess', 'think']
            
            confidence_count = sum(transcript.count(cw) for cw in confidence_words)
            uncertainty_count = sum(transcript.count(uw) for uw in uncertainty_words)
            
            features['confidence_score'] = confidence_count / max(len(words), 1)
            features['uncertainty_score'] = uncertainty_count / max(len(words), 1)
            features['confidence_misalignment'] = abs(features['confidence_score'] - features['uncertainty_score'])
            
            aggression_words = ['must', 'need', 'have to', 'should', 'demand', 'require']
            features['aggression_score'] = sum(transcript.count(aw) for aw in aggression_words) / max(len(words), 1)
            
            deflection_words = ['anyway', 'moving on', 'forget that', 'never mind', 'doesn\'t matter']
            features['deflection_score'] = sum(transcript.count(dw) for dw in deflection_words) / max(len(words), 1)
            
            features['detail_density'] = len(transcript) / max(len(words), 1)
            features['oversharing_indicator'] = 1.0 if features['detail_density'] > 8.0 else 0.0
            
            features['consistency_score'] = self.safe_value(metadata.get('consistency_score', 0.5))
            
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting behavioral features: {e}")
            return {}
    
    def _extract_synthetic_features(self, metadata: Dict[str, Any]) -> Dict[str, float]:
        """Extract synthetic identity indicators (10+ features)"""
        try:
            features = {}
            
            features['device_anomaly_score'] = self.safe_value(metadata.get('device_anomaly', 0))
            features['ip_risk_score'] = self.safe_value(metadata.get('ip_risk', 0))
            features['vpn_probability'] = self.safe_value(metadata.get('vpn_detected', 0))
            
            features['identity_age_days'] = self.safe_value(metadata.get('account_age_days', 0))
            features['identity_verification_score'] = self.safe_value(metadata.get('verification_score', 0))
            
            features['activity_burst_score'] = self.safe_value(metadata.get('activity_burst', 0))
            features['dormancy_score'] = self.safe_value(metadata.get('dormancy_period', 0))
            
            features['bot_probability'] = self.safe_value(metadata.get('bot_score', 0))
            features['ai_generated_probability'] = self.safe_value(metadata.get('ai_generated', 0))
            
            features['peer_risk_score'] = self.safe_value(metadata.get('peer_risk', 0))
            features['cluster_anomaly_score'] = self.safe_value(metadata.get('cluster_anomaly', 0))
            
            synthetic_indicators = [
                features['device_anomaly_score'],
                features['ip_risk_score'],
                features['vpn_probability'],
                features['bot_probability'],
                features['ai_generated_probability']
            ]
            features['synthetic_composite'] = sum(synthetic_indicators) / len(synthetic_indicators)
            
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting synthetic features: {e}")
            return {}
    
    def _extract_emotional_features(self, transcript: str) -> Dict[str, float]:
        """Extract emotional instability patterns (10+ features)"""
        try:
            features = {}
            
            positive_words = ['happy', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'perfect']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disaster']
            fear_words = ['scared', 'afraid', 'worried', 'nervous', 'anxious', 'concerned']
            anger_words = ['angry', 'mad', 'furious', 'upset', 'frustrated', 'annoyed']
            
            words = transcript.split()
            word_count = max(len(words), 1)
            
            features['positive_emotion_density'] = sum(transcript.count(pw) for pw in positive_words) / word_count
            features['negative_emotion_density'] = sum(transcript.count(nw) for nw in negative_words) / word_count
            features['fear_emotion_density'] = sum(transcript.count(fw) for fw in fear_words) / word_count
            features['anger_emotion_density'] = sum(transcript.count(aw) for aw in anger_words) / word_count
            
            features['emotional_volatility'] = abs(features['positive_emotion_density'] - features['negative_emotion_density'])
            
            guilt_words = ['sorry', 'apologize', 'fault', 'blame', 'regret']
            sympathy_words = ['understand', 'feel', 'empathy', 'care', 'support']
            
            features['guilt_manipulation_score'] = sum(transcript.count(gw) for gw in guilt_words) / word_count
            features['sympathy_appeal_score'] = sum(transcript.count(sw) for sw in sympathy_words) / word_count
            
            features['caps_ratio'] = sum(1 for c in transcript if c.isupper()) / max(len(transcript), 1)
            features['emotional_intensity'] = features['exclamation_density'] if 'exclamation_density' in features else 0.0
            
            features['emotional_instability'] = (
                features['emotional_volatility'] +
                features['guilt_manipulation_score'] +
                features['anger_emotion_density']
            ) / 3.0
            
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting emotional features: {e}")
            return {}
    
    def _extract_metadata_features(self, metadata: Dict[str, Any]) -> Dict[str, float]:
        """Extract metadata risk flags (10+ features)"""
        try:
            features = {}
            
            features['wallet_age_days'] = self.safe_value(metadata.get('wallet_age_days', 0))
            features['wallet_risk_score'] = self.safe_value(metadata.get('wallet_risk', 0))
            features['transaction_count'] = self.safe_value(metadata.get('tx_count', 0))
            
            features['fraud_history_score'] = self.safe_value(metadata.get('fraud_history', 0))
            features['scam_association_score'] = self.safe_value(metadata.get('scam_association', 0))
            
            features['previous_violations'] = self.safe_value(metadata.get('violations', 0))
            features['trust_score'] = self.safe_value(metadata.get('trust_score', 0.5))
            
            features['network_risk_score'] = self.safe_value(metadata.get('network_risk', 0))
            features['blacklist_hits'] = self.safe_value(metadata.get('blacklist_hits', 0))
            
            features['off_hours_activity'] = self.safe_value(metadata.get('off_hours', 0))
            features['timezone_anomaly'] = self.safe_value(metadata.get('timezone_anomaly', 0))
            
            return features
            
        except Exception as e:
            logger.error(f"[Phantom] Error extracting metadata features: {e}")
            return {}
    
    def _compute_composite_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Compute composite risk features (5+ features)"""
        try:
            composite = {}
            
            linguistic_features = [
                features.get('deception_keyword_density', 0),
                features.get('urgency_density', 0),
                features.get('manipulation_density', 0),
                features.get('evasion_density', 0)
            ]
            composite['linguistic_risk'] = sum(linguistic_features) / len(linguistic_features)
            
            behavioral_features = [
                features.get('contradiction_density', 0),
                features.get('confidence_misalignment', 0),
                features.get('aggression_score', 0),
                features.get('deflection_score', 0)
            ]
            composite['behavioral_risk'] = sum(behavioral_features) / len(behavioral_features)
            
            composite['synthetic_risk'] = features.get('synthetic_composite', 0)
            
            composite['emotional_risk'] = features.get('emotional_instability', 0)
            
            metadata_features = [
                features.get('wallet_risk_score', 0),
                features.get('fraud_history_score', 0),
                features.get('network_risk_score', 0)
            ]
            composite['metadata_risk'] = sum(metadata_features) / len(metadata_features)
            
            all_risks = [
                composite['linguistic_risk'],
                composite['behavioral_risk'],
                composite['synthetic_risk'],
                composite['emotional_risk'],
                composite['metadata_risk']
            ]
            composite['overall_risk'] = sum(all_risks) / len(all_risks)
            
            return composite
            
        except Exception as e:
            logger.error(f"[Phantom] Error computing composite features: {e}")
            return {}
    
    def score_linguistic(self, features: Dict[str, float]) -> float:
        """Score linguistic deception indicators"""
        try:
            score = 0.0
            
            score += features.get('deception_keyword_density', 0) * 0.3
            score += features.get('urgency_density', 0) * 0.25
            score += features.get('manipulation_density', 0) * 0.25
            score += features.get('evasion_density', 0) * 0.2
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring linguistic: {e}")
            return 0.0
    
    def score_behavioral(self, features: Dict[str, float]) -> float:
        """Score behavioral deception indicators"""
        try:
            score = 0.0
            
            score += features.get('contradiction_density', 0) * 0.3
            score += features.get('confidence_misalignment', 0) * 0.25
            score += features.get('repetition_score', 0) * 0.2
            score += features.get('deflection_score', 0) * 0.15
            score += features.get('aggression_score', 0) * 0.1
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"[Phantom] Error scoring behavioral: {e}")
            return 0.0
    
    def score_synthetic_identity(self, features: Dict[str, float]) -> float:
        """Score synthetic identity probability"""
        try:
            return min(features.get('synthetic_composite', 0), 1.0)
        except Exception as e:
            logger.error(f"[Phantom] Error scoring synthetic: {e}")
            return 0.0
    
    def aggregate(self, features: Dict[str, float]) -> float:
        """Aggregate all features into composite deception score"""
        try:
            return min(features.get('overall_risk', 0), 1.0)
        except Exception as e:
            logger.error(f"[Phantom] Error aggregating features: {e}")
            return 0.0
