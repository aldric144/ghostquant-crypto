"""
Oracle Eye™ - Visual Deception Engine
Simulated CV intelligence for image-based fraud detection
Pure Python, zero external dependencies
"""

import logging
import re
from typing import Dict, Any, List
from .oracle_schema import (
    OracleInput,
    OracleVisualSignals,
    OracleDeceptionScores,
    OracleNarrative,
    OracleOutput
)

logger = logging.getLogger(__name__)


class OracleEyeEngine:
    """
    Visual Deception Engine for detecting image-based financial manipulation
    
    Simulates CV intelligence through metadata analysis, pattern heuristics,
    and signal detection without actual image processing.
    
    Detects:
    - Fake charts
    - Doctored wallet balances
    - Edited transaction screenshots
    - Altered news headlines
    - Scam pop-ups
    - Fake KYC documents
    - Manipulated IDs
    - Phishing dashboards
    """
    
    SUSPICIOUS_PATTERNS = [
        'screenshot', 'edited', 'modified', 'fake', 'scam', 'phishing',
        'copy', 'temp', 'untitled', 'new', 'draft', 'test'
    ]
    
    HIGH_RISK_SOURCES = [
        'telegram', 'discord', 'unknown', 'anonymous', 'temp',
        'pastebin', 'imgur', 'anonymous_upload'
    ]
    
    PHISHING_KEYWORDS = [
        'verify', 'urgent', 'suspended', 'confirm', 'security',
        'action required', 'click here', 'limited time', 'expires'
    ]
    
    EXCHANGE_MIMICS = [
        'binance', 'coinbase', 'kraken', 'metamask', 'trust wallet',
        'ledger', 'trezor', 'uniswap', 'pancakeswap'
    ]
    
    def __init__(self):
        """Initialize Oracle Eye Engine"""
        logger.info("[OracleEye] Engine initialized")
    
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
    
    @staticmethod
    def safe_str(data: Any, default: str = "") -> str:
        """Safely extract string value"""
        try:
            if isinstance(data, str):
                return data.lower()
            return str(data).lower()
        except Exception:
            return default
    
    def analyze_image(self, metadata: Dict[str, Any]) -> OracleOutput:
        """
        Complete visual intelligence analysis
        
        Simulates "image intelligence" using metadata fields:
        - filename
        - size_kb
        - extension
        - description
        - suspected_content
        - tags
        - hashes
        - sources
        
        Args:
            metadata: Dictionary with image metadata
            
        Returns:
            OracleOutput with complete analysis
        """
        try:
            logger.info("[OracleEye] Starting visual analysis")
            
            classification = self.classify_image_type(metadata)
            
            signals = self.simulate_visual_signals(metadata)
            
            fraud_detected, fraud_types = self.detect_visual_fraud(metadata)
            
            scores = self.compute_risk_scores(metadata)
            
            narrative = self.generate_visual_narrative(classification, scores, signals)
            
            severity = self._determine_severity(scores)
            
            key_indicators = self._extract_key_indicators(signals, fraud_types, scores)
            
            output = OracleOutput(
                classification=classification,
                severity=severity,
                signals=signals.to_dict(),
                scores=scores.to_dict(),
                narrative=narrative.to_dict(),
                key_indicators=key_indicators,
                fraud_detected=fraud_detected,
                fraud_types=fraud_types,
                metadata_analyzed=metadata
            )
            
            logger.info(f"[OracleEye] Analysis complete: {output.id} ({classification})")
            return output
            
        except Exception as e:
            logger.error(f"[OracleEye] Error in analysis: {e}")
            return OracleOutput(
                classification="other",
                severity="error",
                signals={},
                scores={},
                narrative={"full_narrative": "Error during visual analysis"},
                key_indicators=["Analysis error"],
                fraud_detected=False,
                fraud_types=[],
                metadata_analyzed=metadata
            )
    
    def detect_visual_fraud(self, metadata: Dict[str, Any]) -> tuple:
        """
        Detect visual fraud patterns
        
        Simulates detection of:
        - Fake charts
        - Doctored wallet balances
        - Edited transaction screenshots
        - Altered news headlines
        - Scam pop-ups
        - Fake KYC
        - Manipulated IDs
        - Phishing dashboards
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            Tuple of (fraud_detected: bool, fraud_types: List[str])
        """
        try:
            fraud_types = []
            
            filename = self.safe_str(metadata.get('filename', ''))
            description = self.safe_str(metadata.get('description', ''))
            suspected_content = self.safe_str(metadata.get('suspected_content', ''))
            tags = [self.safe_str(t) for t in metadata.get('tags', [])]
            source = self.safe_str(metadata.get('source', ''))
            
            if suspected_content == 'chart' or 'chart' in tags:
                if any(p in filename for p in ['fake', 'edited', 'modified']):
                    fraud_types.append("fake_chart")
                if any(p in description for p in ['pump', 'moon', 'guaranteed']):
                    fraud_types.append("manipulated_chart")
            
            if suspected_content == 'wallet' or 'wallet' in tags:
                if any(p in filename for p in ['screenshot', 'edited', 'photoshop']):
                    fraud_types.append("doctored_wallet_balance")
                if metadata.get('size_kb', 0) < 10:  # Suspiciously small
                    fraud_types.append("suspicious_wallet_screenshot")
            
            if suspected_content == 'transaction' or 'transaction' in tags:
                if any(p in filename for p in ['edited', 'modified', 'fake']):
                    fraud_types.append("edited_transaction_screenshot")
                if 'copy' in filename or 'temp' in filename:
                    fraud_types.append("suspicious_transaction_image")
            
            if suspected_content == 'news' or 'news' in tags:
                if any(p in description for p in ['breaking', 'exclusive', 'leaked']):
                    fraud_types.append("altered_news_headline")
                if source in self.HIGH_RISK_SOURCES:
                    fraud_types.append("unverified_news_screenshot")
            
            if 'popup' in tags or 'alert' in tags:
                if any(kw in description for kw in self.PHISHING_KEYWORDS):
                    fraud_types.append("scam_popup")
                if 'urgent' in description or 'verify' in description:
                    fraud_types.append("phishing_alert")
            
            if suspected_content == 'id' or 'kyc' in tags:
                if any(p in filename for p in ['fake', 'template', 'sample']):
                    fraud_types.append("fake_kyc_document")
                if metadata.get('size_kb', 0) < 20:  # Too small for real ID
                    fraud_types.append("suspicious_id_document")
            
            if suspected_content == 'id_document' or 'id' in tags:
                if any(p in filename for p in ['edited', 'modified', 'photoshop']):
                    fraud_types.append("manipulated_id")
                if 'template' in filename or 'blank' in filename:
                    fraud_types.append("id_template")
            
            if suspected_content == 'exchange_ui' or 'dashboard' in tags:
                if any(ex in description for ex in self.EXCHANGE_MIMICS):
                    fraud_types.append("phishing_dashboard")
                if source in self.HIGH_RISK_SOURCES:
                    fraud_types.append("suspicious_exchange_ui")
                if any(kw in description for kw in self.PHISHING_KEYWORDS):
                    fraud_types.append("exchange_phishing_attempt")
            
            fraud_detected = len(fraud_types) > 0
            
            logger.info(f"[OracleEye] Fraud detection: {fraud_detected} ({len(fraud_types)} types)")
            return fraud_detected, fraud_types
            
        except Exception as e:
            logger.error(f"[OracleEye] Error detecting fraud: {e}")
            return False, []
    
    def classify_image_type(self, metadata: Dict[str, Any]) -> str:
        """
        Classify image into type categories
        
        Possible classes:
        - financial_chart
        - wallet_balance
        - transaction_history
        - id_document
        - exchange_ui
        - social_media_post
        - news_screenshot
        - contract_document
        - other
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            Classification string
        """
        try:
            suspected_content = self.safe_str(metadata.get('suspected_content', ''))
            tags = [self.safe_str(t) for t in metadata.get('tags', [])]
            description = self.safe_str(metadata.get('description', ''))
            filename = self.safe_str(metadata.get('filename', ''))
            
            if suspected_content == 'chart':
                return 'financial_chart'
            elif suspected_content == 'wallet':
                return 'wallet_balance'
            elif suspected_content == 'transaction':
                return 'transaction_history'
            elif suspected_content == 'id':
                return 'id_document'
            elif suspected_content == 'exchange_ui':
                return 'exchange_ui'
            elif suspected_content == 'news':
                return 'news_screenshot'
            elif suspected_content == 'contract':
                return 'contract_document'
            
            if 'chart' in tags or 'graph' in tags:
                return 'financial_chart'
            elif 'wallet' in tags or 'balance' in tags:
                return 'wallet_balance'
            elif 'transaction' in tags or 'tx' in tags:
                return 'transaction_history'
            elif 'id' in tags or 'kyc' in tags or 'passport' in tags:
                return 'id_document'
            elif 'exchange' in tags or 'dashboard' in tags:
                return 'exchange_ui'
            elif 'social' in tags or 'twitter' in tags or 'telegram' in tags:
                return 'social_media_post'
            elif 'news' in tags or 'article' in tags:
                return 'news_screenshot'
            elif 'contract' in tags or 'document' in tags:
                return 'contract_document'
            
            if 'chart' in description or 'chart' in filename:
                return 'financial_chart'
            elif 'wallet' in description or 'wallet' in filename:
                return 'wallet_balance'
            elif 'transaction' in description or 'tx' in filename:
                return 'transaction_history'
            elif 'exchange' in description or 'dashboard' in filename:
                return 'exchange_ui'
            elif 'news' in description or 'article' in filename:
                return 'news_screenshot'
            
            return 'other'
            
        except Exception as e:
            logger.error(f"[OracleEye] Error classifying image: {e}")
            return 'other'
    
    def compute_risk_scores(self, metadata: Dict[str, Any]) -> OracleDeceptionScores:
        """
        Compute composite risk scores
        
        Output:
        - deception_risk (0-1)
        - manipulation_signal (0-1)
        - scam_likelihood (0-1)
        - synthetic_artifact_score (0-1)
        - trust_factor (0-1)
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            OracleDeceptionScores object
        """
        try:
            signals = self.simulate_visual_signals(metadata)
            
            deception_risk = (
                signals.filename_anomaly * 0.15 +
                signals.metadata_inconsistency * 0.20 +
                signals.phishing_pattern * 0.25 +
                signals.ui_mimicry * 0.20 +
                signals.description_mismatch * 0.20
            )
            
            manipulation_signal = (
                signals.size_anomaly * 0.15 +
                signals.compression_artifact * 0.25 +
                signals.timestamp_anomaly * 0.20 +
                signals.hash_collision * 0.20 +
                signals.extension_risk * 0.20
            )
            
            scam_likelihood = (
                signals.phishing_pattern * 0.30 +
                signals.ui_mimicry * 0.25 +
                signals.source_risk * 0.25 +
                signals.tag_suspicion * 0.20
            )
            
            synthetic_artifact_score = (
                signals.compression_artifact * 0.30 +
                signals.metadata_inconsistency * 0.25 +
                signals.size_anomaly * 0.25 +
                signals.hash_collision * 0.20
            )
            
            trust_factor = 1.0 - (
                (deception_risk + manipulation_signal + scam_likelihood) / 3.0
            )
            
            scores = OracleDeceptionScores(
                deception_risk=max(0.0, min(1.0, deception_risk)),
                manipulation_signal=max(0.0, min(1.0, manipulation_signal)),
                scam_likelihood=max(0.0, min(1.0, scam_likelihood)),
                synthetic_artifact_score=max(0.0, min(1.0, synthetic_artifact_score)),
                trust_factor=max(0.0, min(1.0, trust_factor))
            )
            
            logger.info(f"[OracleEye] Risk scores computed: deception={scores.deception_risk:.3f}")
            return scores
            
        except Exception as e:
            logger.error(f"[OracleEye] Error computing risk scores: {e}")
            return OracleDeceptionScores()
    
    def generate_visual_narrative(
        self,
        image_type: str,
        scores: OracleDeceptionScores,
        signals: OracleVisualSignals
    ) -> OracleNarrative:
        """
        Generate intelligence-style narrative
        
        Creates 200-500 word narrative with:
        - Assessment
        - Indicators
        - Warnings
        - Likelihood
        - Recommendations
        
        Args:
            image_type: Classified image type
            scores: Risk scores
            signals: Visual signals
            
        Returns:
            OracleNarrative object
        """
        try:
            assessment = self._build_assessment(image_type, scores)
            
            indicators = self._build_indicators(signals, scores)
            
            warnings = self._build_warnings(scores, image_type)
            
            likelihood = self._determine_likelihood(scores)
            
            recommendations = self._build_recommendations(scores, image_type)
            
            full_narrative = self._construct_full_narrative(
                assessment, indicators, warnings, likelihood, recommendations
            )
            
            narrative = OracleNarrative(
                assessment=assessment,
                indicators=indicators,
                warnings=warnings,
                likelihood=likelihood,
                recommendations=recommendations,
                full_narrative=full_narrative
            )
            
            logger.info("[OracleEye] Narrative generated")
            return narrative
            
        except Exception as e:
            logger.error(f"[OracleEye] Error generating narrative: {e}")
            return OracleNarrative(
                assessment="Error generating visual narrative",
                indicators=[],
                warnings=[],
                likelihood="unknown",
                recommendations=[],
                full_narrative="Unable to generate complete narrative due to processing error."
            )
    
    def simulate_visual_signals(self, metadata: Dict[str, Any]) -> OracleVisualSignals:
        """
        Simulate visual signal detection from metadata
        
        Interprets:
        - Filename anomalies
        - Unrealistic file size
        - Suspicious extensions
        - Metadata inconsistencies
        - Repeated hashes
        - Social-media-origin signals
        - Phishing patterns
        - Exchange UI mimicry
        - Compression artifacts (simulated)
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            OracleVisualSignals object
        """
        try:
            signals = OracleVisualSignals()
            
            filename = self.safe_str(metadata.get('filename', ''))
            size_kb = self.safe_value(metadata.get('size_kb', 0))
            extension = self.safe_str(metadata.get('extension', ''))
            description = self.safe_str(metadata.get('description', ''))
            suspected_content = self.safe_str(metadata.get('suspected_content', ''))
            tags = [self.safe_str(t) for t in metadata.get('tags', [])]
            hash_value = self.safe_str(metadata.get('hash', ''))
            source = self.safe_str(metadata.get('source', ''))
            
            signals.filename_anomaly = self._detect_filename_anomaly(filename)
            
            signals.size_anomaly = self._detect_size_anomaly(size_kb, suspected_content)
            
            signals.extension_risk = self._detect_extension_risk(extension)
            
            signals.metadata_inconsistency = self._detect_metadata_inconsistency(
                filename, description, suspected_content, tags
            )
            
            signals.hash_collision = self._detect_hash_collision(hash_value)
            
            signals.source_risk = self._detect_source_risk(source)
            
            signals.phishing_pattern = self._detect_phishing_pattern(description, tags)
            
            signals.ui_mimicry = self._detect_ui_mimicry(description, suspected_content)
            
            signals.compression_artifact = self._detect_compression_artifact(size_kb, extension)
            
            signals.timestamp_anomaly = self._detect_timestamp_anomaly(metadata)
            
            signals.description_mismatch = self._detect_description_mismatch(
                filename, description, suspected_content
            )
            
            signals.tag_suspicion = self._detect_tag_suspicion(tags)
            
            logger.info("[OracleEye] Visual signals simulated")
            return signals
            
        except Exception as e:
            logger.error(f"[OracleEye] Error simulating signals: {e}")
            return OracleVisualSignals()
    
    def get_summary(self, output: OracleOutput) -> Dict[str, Any]:
        """
        Get concise summary of analysis
        
        Returns:
        - classification
        - severity
        - 6 key indicators
        - risk scores
        
        Args:
            output: OracleOutput object
            
        Returns:
            Summary dictionary
        """
        try:
            summary = {
                "classification": output.classification,
                "severity": output.severity,
                "key_indicators": output.key_indicators[:6],  # Top 6
                "risk_scores": output.scores,
                "fraud_detected": output.fraud_detected,
                "fraud_types": output.fraud_types,
                "timestamp": output.timestamp
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"[OracleEye] Error getting summary: {e}")
            return {
                "classification": "error",
                "severity": "unknown",
                "key_indicators": [],
                "risk_scores": {},
                "fraud_detected": False,
                "fraud_types": [],
                "timestamp": ""
            }
    
    
    def _detect_filename_anomaly(self, filename: str) -> float:
        """Detect filename anomalies"""
        score = 0.0
        for pattern in self.SUSPICIOUS_PATTERNS:
            if pattern in filename:
                score += 0.15
        return min(score, 1.0)
    
    def _detect_size_anomaly(self, size_kb: float, content_type: str) -> float:
        """Detect unrealistic file sizes"""
        if size_kb < 5:
            return 0.8  # Too small
        elif size_kb > 10000:
            return 0.6  # Suspiciously large
        elif content_type == 'id' and size_kb < 20:
            return 0.9  # ID too small
        elif content_type == 'chart' and size_kb < 10:
            return 0.7  # Chart too small
        return 0.0
    
    def _detect_extension_risk(self, extension: str) -> float:
        """Detect suspicious extensions"""
        high_risk = ['exe', 'bat', 'cmd', 'scr', 'vbs']
        medium_risk = ['zip', 'rar', '7z', 'tar']
        
        if extension in high_risk:
            return 1.0
        elif extension in medium_risk:
            return 0.5
        return 0.0
    
    def _detect_metadata_inconsistency(
        self,
        filename: str,
        description: str,
        content_type: str,
        tags: List[str]
    ) -> float:
        """Detect metadata inconsistencies"""
        score = 0.0
        
        if content_type and content_type not in filename and content_type not in description:
            score += 0.3
        
        if tags and description:
            matching_tags = sum(1 for tag in tags if tag in description)
            if matching_tags == 0:
                score += 0.3
        
        return min(score, 1.0)
    
    def _detect_hash_collision(self, hash_value: str) -> float:
        """Detect hash collisions (simulated)"""
        if not hash_value:
            return 0.5  # No hash provided
        
        if len(hash_value) < 32:
            return 0.7  # Invalid hash length
        
        if hash_value.count('0') > 20 or hash_value.count('f') > 20:
            return 0.6  # Suspicious pattern
        
        return 0.0
    
    def _detect_source_risk(self, source: str) -> float:
        """Detect high-risk sources"""
        if source in self.HIGH_RISK_SOURCES:
            return 0.8
        elif 'unknown' in source or not source:
            return 0.6
        return 0.0
    
    def _detect_phishing_pattern(self, description: str, tags: List[str]) -> float:
        """Detect phishing patterns"""
        score = 0.0
        
        for keyword in self.PHISHING_KEYWORDS:
            if keyword in description:
                score += 0.15
        
        if 'phishing' in tags or 'scam' in tags:
            score += 0.5
        
        return min(score, 1.0)
    
    def _detect_ui_mimicry(self, description: str, content_type: str) -> float:
        """Detect exchange UI mimicry"""
        if content_type != 'exchange_ui':
            return 0.0
        
        score = 0.0
        for exchange in self.EXCHANGE_MIMICS:
            if exchange in description:
                score += 0.2
        
        return min(score, 1.0)
    
    def _detect_compression_artifact(self, size_kb: float, extension: str) -> float:
        """Detect compression artifacts (simulated)"""
        if extension in ['jpg', 'jpeg'] and size_kb < 15:
            return 0.7  # Over-compressed
        elif extension == 'png' and size_kb > 5000:
            return 0.5  # Under-compressed
        return 0.0
    
    def _detect_timestamp_anomaly(self, metadata: Dict[str, Any]) -> float:
        """Detect timestamp anomalies"""
        created = metadata.get('created_timestamp', 0)
        modified = metadata.get('modified_timestamp', 0)
        
        if created and modified and modified < created:
            return 0.9  # Modified before created
        
        return 0.0
    
    def _detect_description_mismatch(
        self,
        filename: str,
        description: str,
        content_type: str
    ) -> float:
        """Detect description mismatches"""
        if not description:
            return 0.3  # No description
        
        if content_type and content_type not in description.lower():
            return 0.5
        
        return 0.0
    
    def _detect_tag_suspicion(self, tags: List[str]) -> float:
        """Detect suspicious tags"""
        suspicious_tags = ['fake', 'scam', 'phishing', 'fraud', 'edited']
        
        score = 0.0
        for tag in tags:
            if tag in suspicious_tags:
                score += 0.3
        
        return min(score, 1.0)
    
    
    def _build_assessment(self, image_type: str, scores: OracleDeceptionScores) -> str:
        """Build assessment section"""
        risk_level = "critical" if scores.deception_risk >= 0.8 else \
                     "high" if scores.deception_risk >= 0.6 else \
                     "moderate" if scores.deception_risk >= 0.4 else \
                     "low"
        
        assessment = f"Visual intelligence analysis of {image_type.replace('_', ' ')} reveals {risk_level} risk profile. "
        assessment += f"Deception risk assessed at {scores.deception_risk:.0%} with manipulation signal strength of {scores.manipulation_signal:.0%}. "
        assessment += f"Scam likelihood probability stands at {scores.scam_likelihood:.0%}. "
        
        return assessment
    
    def _build_indicators(self, signals: OracleVisualSignals, scores: OracleDeceptionScores) -> List[str]:
        """Build indicators list"""
        indicators = []
        
        if signals.filename_anomaly > 0.5:
            indicators.append("Suspicious filename patterns detected")
        if signals.phishing_pattern > 0.5:
            indicators.append("Phishing language indicators present")
        if signals.ui_mimicry > 0.5:
            indicators.append("Exchange UI mimicry detected")
        if signals.source_risk > 0.5:
            indicators.append("High-risk source origin")
        if signals.metadata_inconsistency > 0.5:
            indicators.append("Metadata inconsistencies identified")
        if scores.synthetic_artifact_score > 0.6:
            indicators.append("Synthetic artifact signatures")
        
        return indicators[:6]  # Top 6
    
    def _build_warnings(self, scores: OracleDeceptionScores, image_type: str) -> List[str]:
        """Build warnings list"""
        warnings = []
        
        if scores.deception_risk >= 0.7:
            warnings.append("Critical deception risk - immediate verification required")
        if scores.scam_likelihood >= 0.7:
            warnings.append("High scam probability - exercise extreme caution")
        if scores.manipulation_signal >= 0.6:
            warnings.append("Manipulation signals detected - verify authenticity")
        if scores.trust_factor < 0.3:
            warnings.append("Low trust factor - do not rely on this image")
        
        return warnings
    
    def _determine_likelihood(self, scores: OracleDeceptionScores) -> str:
        """Determine fraud likelihood"""
        avg_risk = (scores.deception_risk + scores.scam_likelihood + scores.manipulation_signal) / 3.0
        
        if avg_risk >= 0.8:
            return "extremely high likelihood of fraud"
        elif avg_risk >= 0.6:
            return "high likelihood of manipulation"
        elif avg_risk >= 0.4:
            return "moderate likelihood of deception"
        elif avg_risk >= 0.2:
            return "low likelihood of fraud"
        else:
            return "minimal fraud indicators"
    
    def _build_recommendations(self, scores: OracleDeceptionScores, image_type: str) -> List[str]:
        """Build recommendations list"""
        recommendations = []
        
        if scores.deception_risk >= 0.7:
            recommendations.append("Do not trust this image without independent verification")
            recommendations.append("Cross-reference with official sources")
        elif scores.deception_risk >= 0.5:
            recommendations.append("Verify image authenticity through multiple channels")
            recommendations.append("Exercise caution when making decisions based on this image")
        
        if scores.scam_likelihood >= 0.6:
            recommendations.append("Report to fraud prevention team")
            recommendations.append("Block source if possible")
        
        if scores.trust_factor < 0.4:
            recommendations.append("Treat as untrusted content")
        
        return recommendations
    
    def _construct_full_narrative(
        self,
        assessment: str,
        indicators: List[str],
        warnings: List[str],
        likelihood: str,
        recommendations: List[str]
    ) -> str:
        """Construct full narrative"""
        narrative = assessment + "\n\n"
        
        if indicators:
            narrative += "Key indicators identified include: " + ", ".join(indicators) + ". "
        
        narrative += f"Analysis suggests {likelihood}. "
        
        if warnings:
            narrative += "Critical warnings: " + " ".join(warnings) + " "
        
        if recommendations:
            narrative += "Recommended actions: " + " ".join(recommendations)
        
        return narrative
    
    def _determine_severity(self, scores: OracleDeceptionScores) -> str:
        """Determine severity level"""
        max_risk = max(scores.deception_risk, scores.scam_likelihood, scores.manipulation_signal)
        
        if max_risk >= 0.8:
            return "critical"
        elif max_risk >= 0.6:
            return "high"
        elif max_risk >= 0.4:
            return "moderate"
        elif max_risk >= 0.2:
            return "low"
        else:
            return "minimal"
    
    def _extract_key_indicators(
        self,
        signals: OracleVisualSignals,
        fraud_types: List[str],
        scores: OracleDeceptionScores
    ) -> List[str]:
        """Extract key indicators"""
        indicators = []
        
        indicators.extend(fraud_types[:3])
        
        signal_dict = signals.to_dict()
        high_signals = [(k, v) for k, v in signal_dict.items() if v > 0.5]
        high_signals.sort(key=lambda x: x[1], reverse=True)
        
        for signal_name, _ in high_signals[:3]:
            indicators.append(signal_name.replace('_', ' ').title())
        
        return indicators[:6]  # Top 6
