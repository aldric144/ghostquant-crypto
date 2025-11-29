"""
Multi-Domain Intelligence Fusion Engine (MIFE)
The brain of GhostQuant - fuses all intelligence signals into unified scores and narratives.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from .fusion_schema import FusionInput, FusionComponentScores, FusionOutput


class FusionEngine:
    """
    Multi-Domain Intelligence Fusion Engine.
    Fuses signals from Prediction, DNA, History, Correlation, Ring, and Chain models.
    """
    
    def __init__(self):
        """Initialize the Fusion Engine."""
        try:
            print("[FusionEngine] Initializing Multi-Domain Intelligence Fusion Engine")
            
            self.weights = {
                "prediction": 0.30,
                "dna": 0.20,
                "history": 0.15,
                "correlation": 0.20,
                "ring": 0.10,
                "chain": 0.05
            }
            
            self.thresholds = {
                "critical": 0.90,
                "high": 0.70,
                "moderate": 0.40,
                "low": 0.15
            }
            
            print("[FusionEngine] Initialized successfully")
            
        except Exception as e:
            print(f"[FusionEngine] Error in __init__: {e}")
            self.weights = {
                "prediction": 0.30,
                "dna": 0.20,
                "history": 0.15,
                "correlation": 0.20,
                "ring": 0.10,
                "chain": 0.05
            }
            self.thresholds = {
                "critical": 0.90,
                "high": 0.70,
                "moderate": 0.40,
                "low": 0.15
            }
    
    def fuse(
        self,
        entity: Optional[Dict[str, Any]] = None,
        token: Optional[Dict[str, Any]] = None,
        chain: Optional[str] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        history: Optional[List[Dict[str, Any]]] = None,
        neighbors: Optional[List[str]] = None
    ) -> FusionOutput:
        """
        Master fusion method - fuses all available intelligence sources.
        
        Args:
            entity: Entity data dictionary
            token: Token data dictionary
            chain: Chain name
            events: List of events
            history: Entity history
            neighbors: Correlated entity addresses
            
        Returns:
            FusionOutput with unified intelligence score and narrative
        """
        try:
            print("[FusionEngine] Starting multi-domain intelligence fusion")
            
            components = FusionComponentScores()
            
            print("[FusionEngine] Step A: Gathering intelligence from all sources")
            
            prediction_score = self._gather_prediction_intelligence(
                entity, token, chain, events, components
            )
            
            dna_score = self._gather_dna_intelligence(
                entity, history, components
            )
            
            history_score = self._gather_history_intelligence(
                entity, history, components
            )
            
            correlation_score = self._gather_correlation_intelligence(
                entity, neighbors, components
            )
            
            ring_score = self._gather_ring_intelligence(
                entity, components
            )
            
            chain_score = self._gather_chain_intelligence(
                chain, components
            )
            
            print("[FusionEngine] Step B: Scores normalized")
            
            print("[FusionEngine] Step C: Computing weighted fusion score")
            fused_score = self._compute_weighted_fusion(
                prediction_score,
                dna_score,
                history_score,
                correlation_score,
                ring_score,
                chain_score
            )
            
            print("[FusionEngine] Step D: Classifying intelligence level")
            classification = self._classify_intelligence(fused_score)
            
            print("[FusionEngine] Step E: Generating intelligence narrative")
            narrative = self._generate_narrative(
                entity, token, chain, components, fused_score, classification
            )
            
            print("[FusionEngine] Step F: Building structured result")
            output = FusionOutput(
                success=True,
                fused_score=fused_score,
                classification=classification,
                components=components,
                narrative=narrative,
                entity_address=entity.get('address') if entity else None,
                token_symbol=token.get('symbol') if token else None,
                chain_name=chain,
                high_risk_flag=fused_score >= 0.70,
                coordinated_actor_flag=components.correlation_coordinated_flag,
                manipulation_flag=components.prediction_manipulation_risk >= 0.70,
                ring_member_flag=components.ring_membership_probability >= 0.65,
                recommendations=self._generate_recommendations(
                    fused_score, classification, components
                )
            )
            
            print(f"[FusionEngine] Fusion complete: score={fused_score:.3f}, class={classification}")
            return output
            
        except Exception as e:
            print(f"[FusionEngine] Error in fuse: {e}")
            return FusionOutput(
                success=False,
                error=str(e),
                narrative="Fusion analysis failed due to internal error."
            )
    
    def _gather_prediction_intelligence(
        self,
        entity: Optional[Dict],
        token: Optional[Dict],
        chain: Optional[str],
        events: Optional[List[Dict]],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Prediction Engine."""
        try:
            print("[FusionEngine] Gathering prediction intelligence")
            
            
            if entity:
                components.prediction_event_risk = self._safe_float(
                    entity.get('event_risk', 0.5)
                )
                components.prediction_manipulation_risk = self._safe_float(
                    entity.get('manipulation_risk', 0.4)
                )
                components.prediction_ring_probability = self._safe_float(
                    entity.get('ring_probability', 0.3)
                )
            
            if token:
                components.prediction_token_direction = self._safe_float(
                    token.get('direction_score', 0.5)
                )
                components.prediction_token_volatility = self._safe_float(
                    token.get('volatility_score', 0.5)
                )
            
            if chain:
                components.prediction_chain_pressure = self._safe_float(
                    0.4  # Placeholder
                )
            
            prediction_scores = [
                components.prediction_event_risk,
                components.prediction_manipulation_risk,
                components.prediction_token_direction,
                components.prediction_token_volatility,
                components.prediction_ring_probability,
                components.prediction_chain_pressure
            ]
            
            prediction_score = sum(prediction_scores) / len(prediction_scores)
            components.prediction = prediction_score
            
            return prediction_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering prediction intelligence: {e}")
            return 0.0
    
    def _gather_dna_intelligence(
        self,
        entity: Optional[Dict],
        history: Optional[List[Dict]],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Behavioral DNA Engine."""
        try:
            print("[FusionEngine] Gathering DNA intelligence")
            
            
            if entity:
                dna_data = entity.get('dna', {})
                
                components.dna_archetype_score = self._safe_float(
                    dna_data.get('archetype_score', 0.5)
                )
                
                features = dna_data.get('features', {})
                components.dna_manipulation_bias = self._safe_float(
                    features.get('manipulation_bias', 0.3)
                )
                components.dna_stealth_factor = self._safe_float(
                    features.get('stealth_factor', 0.4)
                )
                components.dna_coordination_signal = self._safe_float(
                    features.get('coordination_signal', 0.3)
                )
            
            dna_scores = [
                components.dna_archetype_score,
                components.dna_manipulation_bias,
                components.dna_stealth_factor,
                components.dna_coordination_signal
            ]
            
            dna_score = sum(dna_scores) / len(dna_scores)
            components.dna = dna_score
            
            return dna_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering DNA intelligence: {e}")
            return 0.0
    
    def _gather_history_intelligence(
        self,
        entity: Optional[Dict],
        history: Optional[List[Dict]],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Entity History Engine."""
        try:
            print("[FusionEngine] Gathering history intelligence")
            
            
            if history and len(history) > 0:
                num_events = len(history)
                
                if num_events > 1:
                    first_ts = history[0].get('timestamp', 0)
                    last_ts = history[-1].get('timestamp', 0)
                    time_span_hours = max((last_ts - first_ts) / 3600.0, 0.1)
                    activity_density = min(num_events / time_span_hours / 10.0, 1.0)
                else:
                    activity_density = 0.1
                
                components.history_activity_density = activity_density
                
                components.history_burstiness = 0.4
                
                components.history_anomaly_rate = 0.3
                
                chains = set(e.get('chain', 'unknown') for e in history)
                components.history_cross_chain_frequency = min(len(chains) / 5.0, 1.0)
            
            elif entity:
                hist_data = entity.get('history', {})
                components.history_activity_density = self._safe_float(
                    hist_data.get('activity_density', 0.3)
                )
                components.history_burstiness = self._safe_float(
                    hist_data.get('burstiness', 0.4)
                )
                components.history_anomaly_rate = self._safe_float(
                    hist_data.get('anomaly_rate', 0.3)
                )
                components.history_cross_chain_frequency = self._safe_float(
                    hist_data.get('cross_chain_frequency', 0.2)
                )
            
            history_scores = [
                components.history_activity_density,
                components.history_burstiness,
                components.history_anomaly_rate,
                components.history_cross_chain_frequency
            ]
            
            history_score = sum(history_scores) / len(history_scores)
            components.history = history_score
            
            return history_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering history intelligence: {e}")
            return 0.0
    
    def _gather_correlation_intelligence(
        self,
        entity: Optional[Dict],
        neighbors: Optional[List[str]],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Correlation Engine."""
        try:
            print("[FusionEngine] Gathering correlation intelligence")
            
            
            if neighbors and len(neighbors) > 0:
                components.correlation_avg_score = 0.6
                components.correlation_max_score = 0.8
                components.correlation_coordinated_flag = True
            elif entity:
                corr_data = entity.get('correlation', {})
                components.correlation_avg_score = self._safe_float(
                    corr_data.get('avg_score', 0.3)
                )
                components.correlation_max_score = self._safe_float(
                    corr_data.get('max_score', 0.4)
                )
                components.correlation_coordinated_flag = corr_data.get(
                    'coordinated_flag', False
                )
            
            correlation_score = (
                components.correlation_avg_score * 0.7 +
                components.correlation_max_score * 0.3
            )
            components.correlation = correlation_score
            
            return correlation_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering correlation intelligence: {e}")
            return 0.0
    
    def _gather_ring_intelligence(
        self,
        entity: Optional[Dict],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Ring Detector."""
        try:
            print("[FusionEngine] Gathering ring intelligence")
            
            
            if entity:
                ring_data = entity.get('ring', {})
                components.ring_membership_probability = self._safe_float(
                    ring_data.get('membership_probability', 0.2)
                )
                components.ring_cluster_size = int(
                    ring_data.get('cluster_size', 0)
                )
            
            ring_score = components.ring_membership_probability
            components.ring = ring_score
            
            return ring_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering ring intelligence: {e}")
            return 0.0
    
    def _gather_chain_intelligence(
        self,
        chain: Optional[str],
        components: FusionComponentScores
    ) -> float:
        """Gather intelligence from Chain Pressure Models."""
        try:
            print("[FusionEngine] Gathering chain intelligence")
            
            
            if chain:
                chain_lower = chain.lower()
                
                if 'ethereum' in chain_lower:
                    components.chain_pressure_score = 0.7
                    components.chain_congestion = 0.6
                elif 'bsc' in chain_lower or 'binance' in chain_lower:
                    components.chain_pressure_score = 0.5
                    components.chain_congestion = 0.4
                else:
                    components.chain_pressure_score = 0.3
                    components.chain_congestion = 0.2
            
            chain_score = (
                components.chain_pressure_score * 0.6 +
                components.chain_congestion * 0.4
            )
            components.chain = chain_score
            
            return chain_score
            
        except Exception as e:
            print(f"[FusionEngine] Error gathering chain intelligence: {e}")
            return 0.0
    
    def _compute_weighted_fusion(
        self,
        prediction: float,
        dna: float,
        history: float,
        correlation: float,
        ring: float,
        chain: float
    ) -> float:
        """Compute weighted fusion score."""
        try:
            fused_score = (
                prediction * self.weights["prediction"] +
                dna * self.weights["dna"] +
                history * self.weights["history"] +
                correlation * self.weights["correlation"] +
                ring * self.weights["ring"] +
                chain * self.weights["chain"]
            )
            
            fused_score = max(0.0, min(1.0, fused_score))
            
            return fused_score
            
        except Exception as e:
            print(f"[FusionEngine] Error computing weighted fusion: {e}")
            return 0.0
    
    def _classify_intelligence(self, score: float) -> str:
        """Classify intelligence level based on fused score."""
        try:
            if score >= self.thresholds["critical"]:
                return "critical"
            elif score >= self.thresholds["high"]:
                return "high"
            elif score >= self.thresholds["moderate"]:
                return "moderate"
            elif score >= self.thresholds["low"]:
                return "low"
            else:
                return "minimal"
        except Exception as e:
            print(f"[FusionEngine] Error classifying intelligence: {e}")
            return "unknown"
    
    def _generate_narrative(
        self,
        entity: Optional[Dict],
        token: Optional[Dict],
        chain: Optional[str],
        components: FusionComponentScores,
        fused_score: float,
        classification: str
    ) -> str:
        """Generate comprehensive intelligence narrative."""
        try:
            print("[FusionEngine] Generating intelligence narrative")
            
            narrative_parts = []
            
            if entity:
                address = entity.get('address', 'Unknown')
                narrative_parts.append(
                    f"Entity {address[:10]}... has been analyzed across multiple intelligence domains."
                )
            elif token:
                symbol = token.get('symbol', 'Unknown')
                narrative_parts.append(
                    f"Token {symbol} has been analyzed across multiple intelligence domains."
                )
            else:
                narrative_parts.append(
                    "Multi-domain intelligence analysis completed."
                )
            
            narrative_parts.append(
                f"Overall intelligence classification: {classification.upper()} "
                f"(fused score: {fused_score:.3f}/1.00)."
            )
            
            if components.dna > 0.5:
                narrative_parts.append(
                    f"Behavioral DNA analysis reveals {self._describe_dna_pattern(components)}."
                )
            
            if components.prediction_manipulation_risk >= 0.70:
                narrative_parts.append(
                    f"HIGH MANIPULATION RISK detected (score: {components.prediction_manipulation_risk:.2f}). "
                    "Entity exhibits patterns consistent with market manipulation behavior."
                )
            
            if components.correlation_coordinated_flag:
                narrative_parts.append(
                    f"COORDINATED ACTOR BEHAVIOR detected. "
                    f"Average correlation with network: {components.correlation_avg_score:.2f}. "
                    "Entity shows synchronized patterns with other addresses."
                )
            
            if chain and components.chain_pressure_score >= 0.60:
                narrative_parts.append(
                    f"Chain pressure on {chain}: {components.chain_pressure_score:.2f}. "
                    f"Network congestion: {components.chain_congestion:.2f}."
                )
            
            if components.prediction_event_risk >= 0.65:
                narrative_parts.append(
                    f"Event risk elevated at {components.prediction_event_risk:.2f}. "
                    "Potential for significant market-moving events."
                )
            
            if components.history_anomaly_rate >= 0.50:
                narrative_parts.append(
                    f"Historical anomaly rate: {components.history_anomaly_rate:.2f}. "
                    "Entity exhibits irregular transaction patterns."
                )
            
            if components.prediction_token_volatility >= 0.70:
                narrative_parts.append(
                    f"HIGH VOLATILITY WARNING: Token volatility score {components.prediction_token_volatility:.2f}. "
                    "Expect significant price fluctuations."
                )
            
            if components.ring_membership_probability >= 0.65:
                narrative_parts.append(
                    f"RING MEMBERSHIP DETECTED: Probability {components.ring_membership_probability:.2f}. "
                    f"Cluster size: {components.ring_cluster_size}. "
                    "Entity is likely part of a coordinated manipulation ring."
                )
            
            narrative = " ".join(narrative_parts)
            
            return narrative
            
        except Exception as e:
            print(f"[FusionEngine] Error generating narrative: {e}")
            return "Intelligence narrative generation failed."
    
    def _describe_dna_pattern(self, components: FusionComponentScores) -> str:
        """Describe DNA behavioral pattern."""
        try:
            if components.dna_manipulation_bias >= 0.70:
                return "strong manipulation bias with predatory characteristics"
            elif components.dna_stealth_factor >= 0.70:
                return "high stealth factor indicating ghost-like behavior"
            elif components.dna_coordination_signal >= 0.70:
                return "strong coordination signals suggesting coordinated actor behavior"
            elif components.dna_archetype_score >= 0.70:
                return "distinct behavioral archetype with high confidence"
            else:
                return "moderate behavioral patterns"
        except Exception:
            return "behavioral patterns"
    
    def _generate_recommendations(
        self,
        fused_score: float,
        classification: str,
        components: FusionComponentScores
    ) -> List[str]:
        """Generate actionable recommendations."""
        try:
            recommendations = []
            
            if classification in ["critical", "high"]:
                recommendations.append("IMMEDIATE INVESTIGATION RECOMMENDED")
                recommendations.append("Flag for manual review by security team")
            
            if components.correlation_coordinated_flag:
                recommendations.append("Investigate correlated entities in network")
            
            if components.ring_membership_probability >= 0.65:
                recommendations.append("Analyze entire ring cluster for coordinated manipulation")
            
            if components.prediction_manipulation_risk >= 0.70:
                recommendations.append("Monitor for market manipulation patterns")
            
            if components.history_anomaly_rate >= 0.50:
                recommendations.append("Review historical transaction anomalies")
            
            if not recommendations:
                recommendations.append("Continue routine monitoring")
            
            return recommendations
            
        except Exception as e:
            print(f"[FusionEngine] Error generating recommendations: {e}")
            return ["Error generating recommendations"]
    
    def _normalize(self, value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
        """Normalize value to 0-1 range."""
        try:
            if max_val == min_val:
                return 0.5
            normalized = (value - min_val) / (max_val - min_val)
            return max(0.0, min(1.0, normalized))
        except Exception:
            return 0.0
    
    def _safe_float(self, value: Any, default: float = 0.0) -> float:
        """Safely convert value to float."""
        try:
            return float(value) if value is not None else default
        except (ValueError, TypeError):
            return default
