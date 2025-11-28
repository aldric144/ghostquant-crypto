"""
DNA Analyzer - High-level wrapper for Behavioral DNA™ analysis.
Provides a clean API interface for analyzing entity behavior.
"""

from typing import Dict, List, Any
from datetime import datetime, timezone

from .behavioral_dna_engine import (
    extract_behavioral_features,
    classify_archetype,
    generate_dna_code
)


class DNAAnalyzer:
    """
    High-level analyzer for Behavioral DNA™ analysis.
    Orchestrates feature extraction, archetype classification, and DNA code generation.
    """
    
    def __init__(self):
        """Initialize the DNA Analyzer."""
        print("[BehavioralDNA] DNAAnalyzer initialized")
        self.version = "1.0.0"
        self.archetypes = [
            "PREDATOR",
            "OPPORTUNIST",
            "COORDINATED_ACTOR",
            "GHOST",
            "AGENT",
            "MANIPULATOR"
        ]
    
    def analyze(self, entity_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Perform complete Behavioral DNA™ analysis on entity history.
        
        Args:
            entity_history: List of transaction/event dictionaries
            
        Returns:
            Complete analysis results with archetype, DNA code, features, and signals
        """
        try:
            print(f"[BehavioralDNA] Starting analysis for {len(entity_history)} events")
            
            if not isinstance(entity_history, list):
                return self._error_response("entity_history must be a list")
            
            features = extract_behavioral_features(entity_history)
            
            if not features:
                return self._error_response("Failed to extract features")
            
            classification = classify_archetype(features)
            
            if not classification:
                return self._error_response("Failed to classify archetype")
            
            archetype = classification.get('classification_name', 'UNKNOWN')
            archetype_score = classification.get('classification_score', 0.0)
            top_signals = classification.get('top_signals', [])
            supporting_features = classification.get('supporting_features', {})
            all_scores = classification.get('all_scores', {})
            
            dna_code = generate_dna_code(features, archetype)
            
            result = {
                "success": True,
                "archetype": archetype,
                "archetype_score": archetype_score,
                "dna_code": dna_code,
                "scores": all_scores,
                "top_signals": top_signals,
                "supporting_features": supporting_features,
                "features": features,
                "metadata": {
                    "analyzer_version": self.version,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "events_analyzed": len(entity_history),
                    "features_extracted": len(features)
                }
            }
            
            print(f"[BehavioralDNA] Analysis complete: {archetype} ({dna_code})")
            return result
            
        except Exception as e:
            print(f"[BehavioralDNA] Error in analysis: {e}")
            return self._error_response(f"Analysis error: {str(e)}")
    
    def analyze_batch(self, entities: List[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Analyze multiple entities in batch.
        
        Args:
            entities: List of entity histories (each is a list of events)
            
        Returns:
            List of analysis results
        """
        try:
            print(f"[BehavioralDNA] Starting batch analysis for {len(entities)} entities")
            
            results = []
            for i, entity_history in enumerate(entities):
                try:
                    result = self.analyze(entity_history)
                    result['entity_index'] = i
                    results.append(result)
                except Exception as e:
                    print(f"[BehavioralDNA] Error analyzing entity {i}: {e}")
                    results.append({
                        "success": False,
                        "error": f"Error analyzing entity {i}: {str(e)}",
                        "entity_index": i
                    })
            
            print(f"[BehavioralDNA] Batch analysis complete: {len(results)} results")
            return results
            
        except Exception as e:
            print(f"[BehavioralDNA] Error in batch analysis: {e}")
            return [self._error_response(f"Batch analysis error: {str(e)}")]
    
    def get_archetype_definitions(self) -> Dict[str, Dict[str, Any]]:
        """
        Get definitions and characteristics of all archetypes.
        
        Returns:
            Dictionary of archetype definitions
        """
        return {
            "PREDATOR": {
                "name": "PREDATOR",
                "description": "Aggressive, manipulation-prone entity with high-risk behavior",
                "characteristics": [
                    "High manipulation bias",
                    "Strong profit seeking",
                    "Aggressive risk acceleration",
                    "Large value movements"
                ],
                "risk_level": "HIGH",
                "typical_features": {
                    "manipulation_bias": "> 0.6",
                    "profit_seeking_score": "> 0.7",
                    "risk_acceleration": "> 0.5",
                    "aggression_index": "> 0.6"
                }
            },
            "OPPORTUNIST": {
                "name": "OPPORTUNIST",
                "description": "Reactive, profit-chasing entity responding to market events",
                "characteristics": [
                    "High opportunistic index",
                    "Rapid activity velocity",
                    "Bursty transaction patterns",
                    "Quick response to events"
                ],
                "risk_level": "MEDIUM",
                "typical_features": {
                    "opportunistic_index": "> 0.6",
                    "activity_velocity": "> 5.0",
                    "burstiness_index": "> 0.5",
                    "value_momentum": "> 0.4"
                }
            },
            "COORDINATED_ACTOR": {
                "name": "COORDINATED_ACTOR",
                "description": "Ring-linked entity with coordinated, pattern-aligned behavior",
                "characteristics": [
                    "Strong coordination signals",
                    "Temporal clustering",
                    "Pattern regularity",
                    "Network effects"
                ],
                "risk_level": "HIGH",
                "typical_features": {
                    "coordination_signal": "> 0.6",
                    "temporal_clustering": "> 0.5",
                    "pattern_regularity": "> 0.7",
                    "network_effect": "> 0.4"
                }
            },
            "GHOST": {
                "name": "GHOST",
                "description": "Stealthy entity with minimal footprint and high anonymity",
                "characteristics": [
                    "High stealth factor",
                    "Strong identity stability",
                    "Low activity density",
                    "Minimal detection signals"
                ],
                "risk_level": "MEDIUM",
                "typical_features": {
                    "stealth_factor": "> 0.6",
                    "identity_stability": "> 0.7",
                    "stealth_mode": "> 0.5",
                    "ghost_score": "> 0.6"
                }
            },
            "AGENT": {
                "name": "AGENT",
                "description": "AI-like or bot-like entity with automated behavior patterns",
                "characteristics": [
                    "High bot-like score",
                    "Strong coordination",
                    "Pattern regularity",
                    "High predictability"
                ],
                "risk_level": "MEDIUM",
                "typical_features": {
                    "bot_like_score": "> 0.7",
                    "coordination_signal": "> 0.6",
                    "pattern_regularity": "> 0.7",
                    "predictability_score": "> 0.7"
                }
            },
            "MANIPULATOR": {
                "name": "MANIPULATOR",
                "description": "Market-moving entity with abnormal manipulation patterns",
                "characteristics": [
                    "High manipulation signal",
                    "Frequent anomalies",
                    "High volatility",
                    "Value concentration"
                ],
                "risk_level": "CRITICAL",
                "typical_features": {
                    "manipulation_signal": "> 0.7",
                    "anomaly_frequency": "> 0.4",
                    "volatility_score": "> 0.6",
                    "value_concentration": "> 0.7"
                }
            }
        }
    
    def get_feature_descriptions(self) -> Dict[str, str]:
        """
        Get descriptions of all behavioral features.
        
        Returns:
            Dictionary mapping feature names to descriptions
        """
        return {
            "activity_velocity": "Transactions per hour",
            "burstiness_index": "Variance in inter-transaction times",
            "circadian_offset": "Hour of day preference deviation",
            "volatility_score": "Value variance normalized",
            "time_consistency": "Inverse of burstiness",
            "activity_rhythm": "Daily activity pattern regularity",
            "chain_hopping_rate": "Unique chains per transaction",
            "cross_chain_entropy": "Chain distribution entropy",
            "multi_chain_complexity": "Multi-chain usage complexity",
            "chain_switching_frequency": "Rate of chain changes",
            "chain_diversity": "Number of unique chains used",
            "profit_seeking_score": "Trend toward increasing values",
            "manipulation_bias": "Frequency of large value spikes",
            "stealth_factor": "Low value, high frequency indicator",
            "opportunistic_index": "Rapid response to events",
            "value_concentration": "Top 10% value concentration",
            "risk_trend_slope": "Risk increase/decrease trend",
            "anomaly_frequency": "Outlier transaction frequency",
            "stress_reactivity": "Response to large values",
            "risk_acceleration": "Recent vs older risk levels",
            "risk_volatility": "Risk variance over time",
            "behavioral_consistency": "Low variance in patterns",
            "identity_stability": "Consistent chains and tokens",
            "predictability_score": "Pattern predictability",
            "pattern_regularity": "Inverse of anomaly frequency",
            "stability_index": "Overall stability measure",
            "token_diversity": "Number of unique tokens",
            "tx_size_variance": "Transaction size variance",
            "temporal_clustering": "Time-clustered events",
            "value_momentum": "Recent value trend",
            "activity_density": "Transactions per day",
            "coordination_signal": "Regular interval indicator",
            "stealth_mode": "Combined stealth indicator",
            "bot_like_score": "Automated behavior indicator",
            "manipulation_signal": "Combined manipulation indicator",
            "ghost_score": "Stealth and stability combined",
            "predator_score": "Aggressive behavior indicator",
            "opportunist_score": "Opportunistic behavior indicator",
            "agent_score": "AI/bot behavior indicator",
            "coordinated_actor_score": "Coordination indicator",
            "network_effect": "Multi-chain/token network usage",
            "complexity_score": "Overall complexity measure",
            "aggression_index": "Aggressive behavior measure",
            "patience_score": "Inverse of opportunistic index",
            "sophistication_level": "Complexity and stealth combined"
        }
    
    def _error_response(self, error_message: str) -> Dict[str, Any]:
        """Generate standardized error response."""
        return {
            "success": False,
            "error": error_message,
            "archetype": "UNKNOWN",
            "dna_code": "Q0-XXX-UNKNOWN",
            "scores": {},
            "top_signals": [],
            "supporting_features": {},
            "features": {},
            "metadata": {
                "analyzer_version": self.version,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "events_analyzed": 0,
                "features_extracted": 0
            }
        }
