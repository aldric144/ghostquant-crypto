"""
Threat Actor Profiler™ - Pure Python implementation
Intelligence-driven threat actor classification with 9 actor types
100% crash-proof, zero external dependencies
"""

from typing import Dict, Any, List, Tuple
import logging

from .threat_actor_schema import ThreatActorInput, ThreatActorProfile

logger = logging.getLogger(__name__)


class ThreatActorProfiler:
    """
    Threat Actor Profiler™
    Classifies entities into 9 threat actor types based on multi-domain intelligence
    """
    
    WHALE = "WHALE"
    PREDATOR = "PREDATOR"
    SYNDICATE = "SYNDICATE"
    INSIDER = "INSIDER"
    COORDINATED_ACTOR = "COORDINATED ACTOR"
    GHOST = "GHOST"
    MANIPULATOR = "MANIPULATOR"
    ARBITRAGE_BOT = "ARBITRAGE BOT"
    UNKNOWN_ACTOR = "UNKNOWN ACTOR"
    
    def __init__(self):
        """Initialize threat actor profiler"""
        self.logger = logging.getLogger(__name__)
        self.logger.info("[ThreatActor] Profiler initialized")
        
        self.actor_types = [
            self.WHALE,
            self.PREDATOR,
            self.SYNDICATE,
            self.INSIDER,
            self.COORDINATED_ACTOR,
            self.GHOST,
            self.MANIPULATOR,
            self.ARBITRAGE_BOT,
            self.UNKNOWN_ACTOR
        ]
    
    def profile_actor(self, input_data: ThreatActorInput) -> ThreatActorProfile:
        """
        Generate comprehensive threat actor profile
        
        Args:
            input_data: ThreatActorInput with intelligence from all domains
        
        Returns:
            ThreatActorProfile with classification and analysis
        """
        try:
            self.logger.info("[ThreatActor] Profiling actor")
            
            scores = self._compute_all_scores(input_data)
            
            actor_type, confidence = self._classify_actor_type(scores)
            
            risk_level = self._determine_risk_level(actor_type, scores, input_data)
            
            indicators = self._extract_indicators(input_data, actor_type)
            
            behavioral_traits = self._extract_behavioral_traits(input_data, actor_type)
            coordination_traits = self._extract_coordination_traits(input_data, actor_type)
            chain_traits = self._extract_chain_traits(input_data, actor_type)
            manipulation_traits = self._extract_manipulation_traits(input_data, actor_type)
            
            summary = self._build_actor_summary(actor_type, indicators, input_data)
            
            recommendations = self._generate_recommendations(actor_type, risk_level, input_data)
            
            profile = ThreatActorProfile(
                actor_type=actor_type,
                risk_level=risk_level,
                confidence=confidence,
                indicators=indicators,
                behavioral_traits=behavioral_traits,
                coordination_traits=coordination_traits,
                chain_traits=chain_traits,
                manipulation_traits=manipulation_traits,
                summary=summary,
                recommendations=recommendations,
                scores=scores
            )
            
            self.logger.info(f"[ThreatActor] Classified as {actor_type} with {confidence:.1%} confidence")
            
            return profile
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error profiling actor: {e}")
            return ThreatActorProfile(
                actor_type=self.UNKNOWN_ACTOR,
                risk_level="UNKNOWN",
                confidence=0.0,
                summary=f"Error during profiling: {str(e)}"
            )
    
    
    def _compute_all_scores(self, input_data: ThreatActorInput) -> Dict[str, float]:
        """Compute scores for all actor types"""
        try:
            scores = {
                self.WHALE: self._score_whale(input_data),
                self.PREDATOR: self._score_predator(input_data),
                self.SYNDICATE: self._score_syndicate(input_data),
                self.INSIDER: self._score_insider(input_data),
                self.COORDINATED_ACTOR: self._score_coordinated_actor(input_data),
                self.GHOST: self._score_ghost(input_data),
                self.MANIPULATOR: self._score_manipulator(input_data),
                self.ARBITRAGE_BOT: self._score_arbitrage_bot(input_data)
            }
            
            return scores
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error computing scores: {e}")
            return {actor: 0.0 for actor in self.actor_types[:-1]}  # Exclude UNKNOWN
    
    def _score_whale(self, input_data: ThreatActorInput) -> float:
        """
        Score WHALE actor type
        Characteristics: Large-value, slow-moving, high-impact
        """
        try:
            score = 0.0
            
            entity = input_data.entity
            if entity:
                avg_value = self.safe_value(entity.get("avg_transaction_value", 0))
                if avg_value > 100000:  # $100k+
                    score += 0.25
                elif avg_value > 50000:  # $50k+
                    score += 0.15
                
                tx_count = self.safe_value(entity.get("transaction_count", 0))
                if tx_count < 50:
                    score += 0.15
                elif tx_count < 100:
                    score += 0.10
            
            history = input_data.history
            if history:
                max_balance = self.safe_value(history.get("max_balance", 0))
                if max_balance > 1000000:  # $1M+
                    score += 0.20
                elif max_balance > 500000:  # $500k+
                    score += 0.10
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype in ["WHALE", "HOLDER"]:
                    score += 0.20
                
                aggressiveness = self.safe_value(dna.get("aggressiveness", 0.5))
                if aggressiveness < 0.3:  # Low aggressiveness
                    score += 0.10
            
            radar = input_data.radar
            if radar:
                risk_score = self.safe_value(radar.get("risk_score", 0))
                if 0.4 <= risk_score <= 0.7:  # Moderate risk
                    score += 0.10
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring whale: {e}")
            return 0.0
    
    def _score_predator(self, input_data: ThreatActorInput) -> float:
        """
        Score PREDATOR actor type
        Characteristics: Aggressive manipulation, high DNA risk, rapid bursts
        """
        try:
            score = 0.0
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype in ["PREDATOR", "MANIPULATOR"]:
                    score += 0.30
                
                aggressiveness = self.safe_value(dna.get("aggressiveness", 0))
                if aggressiveness > 0.7:  # High aggressiveness
                    score += 0.20
                
                burstiness = self.safe_value(dna.get("burstiness", 0))
                if burstiness > 0.7:  # Rapid bursts
                    score += 0.15
            
            history = input_data.history
            if history:
                spike_count = self.safe_value(history.get("spike_count", 0))
                if spike_count > 10:
                    score += 0.15
                elif spike_count > 5:
                    score += 0.10
            
            fusion = input_data.fusion
            if fusion:
                manipulation_mode = fusion.get("manipulation_mode", "")
                if manipulation_mode in ["PUMP_DUMP", "FRONT_RUNNING"]:
                    score += 0.15
            
            radar = input_data.radar
            if radar:
                risk_score = self.safe_value(radar.get("risk_score", 0))
                if risk_score > 0.8:  # High risk
                    score += 0.15
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring predator: {e}")
            return 0.0
    
    def _score_syndicate(self, input_data: ThreatActorInput) -> float:
        """
        Score SYNDICATE actor type
        Characteristics: Multi-entity cluster with high correlation
        """
        try:
            score = 0.0
            
            correlation = input_data.correlation
            if correlation:
                cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                if cluster_size >= 5:
                    score += 0.30
                elif cluster_size >= 3:
                    score += 0.20
                
                avg_correlation = self.safe_value(correlation.get("avg_correlation", 0))
                if avg_correlation > 0.7:  # Strong correlation
                    score += 0.25
                elif avg_correlation > 0.5:
                    score += 0.15
                
                coordination_score = self.safe_value(correlation.get("coordination_score", 0))
                if coordination_score > 0.7:
                    score += 0.20
            
            fusion = input_data.fusion
            if fusion:
                coordination_detected = fusion.get("coordination_detected", False)
                if coordination_detected:
                    score += 0.15
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype == "COORDINATED":
                    score += 0.10
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring syndicate: {e}")
            return 0.0
    
    def _score_insider(self, input_data: ThreatActorInput) -> float:
        """
        Score INSIDER actor type
        Characteristics: Low activity but high timing accuracy
        """
        try:
            score = 0.0
            
            entity = input_data.entity
            if entity:
                tx_count = self.safe_value(entity.get("transaction_count", 0))
                if tx_count < 20:  # Very low activity
                    score += 0.20
                elif tx_count < 50:
                    score += 0.10
            
            history = input_data.history
            if history:
                timing_advantage = self.safe_value(history.get("timing_advantage", 0))
                if timing_advantage > 0.8:  # High timing accuracy
                    score += 0.30
                elif timing_advantage > 0.6:
                    score += 0.20
                
                pre_event_positioning = self.safe_value(history.get("pre_event_positioning", 0))
                if pre_event_positioning > 5:
                    score += 0.20
            
            prediction = input_data.prediction
            if prediction:
                accuracy = self.safe_value(prediction.get("accuracy", 0))
                if accuracy > 0.8:
                    score += 0.15
            
            fusion = input_data.fusion
            if fusion:
                insider_indicators = fusion.get("insider_indicators", [])
                if len(insider_indicators) > 0:
                    score += 0.15
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring insider: {e}")
            return 0.0
    
    def _score_coordinated_actor(self, input_data: ThreatActorInput) -> float:
        """
        Score COORDINATED ACTOR type
        Characteristics: Moderate correlation + moderate manipulation
        """
        try:
            score = 0.0
            
            correlation = input_data.correlation
            if correlation:
                cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                if 2 <= cluster_size <= 4:  # Small to medium cluster
                    score += 0.20
                
                avg_correlation = self.safe_value(correlation.get("avg_correlation", 0))
                if 0.4 <= avg_correlation <= 0.7:  # Moderate correlation
                    score += 0.20
                
                coordination_score = self.safe_value(correlation.get("coordination_score", 0))
                if 0.4 <= coordination_score <= 0.7:
                    score += 0.15
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype in ["COORDINATED", "TRADER"]:
                    score += 0.15
                
                manipulation_flags = dna.get("manipulation_flags", [])
                if 1 <= len(manipulation_flags) <= 3:
                    score += 0.15
            
            fusion = input_data.fusion
            if fusion:
                risk_score = self.safe_value(fusion.get("risk_score", 0))
                if 0.4 <= risk_score <= 0.7:
                    score += 0.15
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring coordinated actor: {e}")
            return 0.0
    
    def _score_ghost(self, input_data: ThreatActorInput) -> float:
        """
        Score GHOST actor type
        Characteristics: Dormant → sudden high-level burst
        """
        try:
            score = 0.0
            
            history = input_data.history
            if history:
                dormancy_period = self.safe_value(history.get("dormancy_period_days", 0))
                if dormancy_period > 90:  # 90+ days dormant
                    score += 0.30
                elif dormancy_period > 30:
                    score += 0.20
                
                activation_burst = self.safe_value(history.get("activation_burst", 0))
                if activation_burst > 0.8:  # Sudden burst
                    score += 0.25
                
                recent_activity_spike = self.safe_value(history.get("recent_activity_spike", 0))
                if recent_activity_spike > 5.0:  # 5x spike
                    score += 0.20
            
            dna = input_data.dna
            if dna:
                burstiness = self.safe_value(dna.get("burstiness", 0))
                if burstiness > 0.8:
                    score += 0.15
            
            entity = input_data.entity
            if entity:
                recent_tx_ratio = self.safe_value(entity.get("recent_tx_ratio", 0))
                if recent_tx_ratio > 0.8:  # 80% of activity is recent
                    score += 0.10
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring ghost: {e}")
            return 0.0
    
    def _score_manipulator(self, input_data: ThreatActorInput) -> float:
        """
        Score MANIPULATOR actor type
        Characteristics: Pump/dump patterns, volatility forcing
        """
        try:
            score = 0.0
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype == "MANIPULATOR":
                    score += 0.30
                
                manipulation_flags = dna.get("manipulation_flags", [])
                if len(manipulation_flags) >= 3:
                    score += 0.20
                elif len(manipulation_flags) >= 1:
                    score += 0.10
            
            fusion = input_data.fusion
            if fusion:
                manipulation_mode = fusion.get("manipulation_mode", "")
                if manipulation_mode in ["PUMP_DUMP", "WASH_TRADING", "SPOOFING"]:
                    score += 0.25
                
                volatility_forcing = self.safe_value(fusion.get("volatility_forcing", 0))
                if volatility_forcing > 0.7:
                    score += 0.15
            
            history = input_data.history
            if history:
                pump_dump_count = self.safe_value(history.get("pump_dump_count", 0))
                if pump_dump_count > 5:
                    score += 0.15
                elif pump_dump_count > 2:
                    score += 0.10
            
            radar = input_data.radar
            if radar:
                manipulation_score = self.safe_value(radar.get("manipulation_score", 0))
                if manipulation_score > 0.7:
                    score += 0.10
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring manipulator: {e}")
            return 0.0
    
    def _score_arbitrage_bot(self, input_data: ThreatActorInput) -> float:
        """
        Score ARBITRAGE BOT actor type
        Characteristics: Precision, fast timing, narrow volatility bands
        """
        try:
            score = 0.0
            
            entity = input_data.entity
            if entity:
                tx_count = self.safe_value(entity.get("transaction_count", 0))
                if tx_count > 1000:  # Very high frequency
                    score += 0.25
                elif tx_count > 500:
                    score += 0.15
                
                avg_tx_interval = self.safe_value(entity.get("avg_tx_interval_seconds", 0))
                if avg_tx_interval < 60:  # Sub-minute intervals
                    score += 0.20
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype in ["BOT", "ARBITRAGE"]:
                    score += 0.25
                
                timing_precision = self.safe_value(dna.get("timing_precision", 0))
                if timing_precision > 0.9:  # Very precise
                    score += 0.15
            
            chain = input_data.chain
            if chain:
                chain_count = self.safe_value(chain.get("chain_count", 0))
                if chain_count >= 3:  # Multi-chain
                    score += 0.15
            
            history = input_data.history
            if history:
                volatility = self.safe_value(history.get("volatility", 0))
                if volatility < 0.2:  # Low volatility
                    score += 0.10
            
            return min(1.0, score)
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error scoring arbitrage bot: {e}")
            return 0.0
    
    
    def _classify_actor_type(self, scores: Dict[str, float]) -> Tuple[str, float]:
        """
        Classify actor type based on scores
        
        Returns:
            Tuple of (actor_type, confidence)
        """
        try:
            if not scores:
                return self.UNKNOWN_ACTOR, 0.0
            
            max_score = max(scores.values())
            
            if max_score < 0.3:
                return self.UNKNOWN_ACTOR, max_score
            
            for actor_type, score in scores.items():
                if score == max_score:
                    confidence = min(0.95, score)
                    return actor_type, confidence
            
            return self.UNKNOWN_ACTOR, 0.0
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error classifying actor: {e}")
            return self.UNKNOWN_ACTOR, 0.0
    
    def _determine_risk_level(
        self,
        actor_type: str,
        scores: Dict[str, float],
        input_data: ThreatActorInput
    ) -> str:
        """Determine risk level based on actor type and intelligence"""
        try:
            high_risk_actors = [self.PREDATOR, self.MANIPULATOR, self.SYNDICATE]
            medium_risk_actors = [self.COORDINATED_ACTOR, self.GHOST, self.INSIDER]
            low_risk_actors = [self.WHALE, self.ARBITRAGE_BOT]
            
            fusion_risk = self.safe_value(input_data.fusion.get("risk_score", 0))
            radar_risk = self.safe_value(input_data.radar.get("risk_score", 0))
            
            combined_risk = (fusion_risk + radar_risk) / 2.0
            
            if actor_type in high_risk_actors or combined_risk > 0.8:
                return "CRITICAL"
            elif actor_type in medium_risk_actors or combined_risk > 0.6:
                return "HIGH"
            elif actor_type in low_risk_actors or combined_risk > 0.4:
                return "MODERATE"
            elif combined_risk > 0.2:
                return "LOW"
            else:
                return "MINIMAL"
                
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error determining risk level: {e}")
            return "UNKNOWN"
    
    def _extract_indicators(
        self,
        input_data: ThreatActorInput,
        actor_type: str
    ) -> List[str]:
        """Extract key indicators for the actor type"""
        try:
            indicators = []
            
            dna = input_data.dna
            if dna:
                archetype = dna.get("archetype", "")
                if archetype:
                    indicators.append(f"Behavioral archetype: {archetype}")
                
                manipulation_flags = dna.get("manipulation_flags", [])
                if manipulation_flags:
                    indicators.append(f"Manipulation flags: {len(manipulation_flags)} detected")
            
            history = input_data.history
            if history:
                spike_count = self.safe_value(history.get("spike_count", 0))
                if spike_count > 0:
                    indicators.append(f"Activity spikes: {spike_count} detected")
            
            correlation = input_data.correlation
            if correlation:
                cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                if cluster_size > 0:
                    indicators.append(f"Cluster membership: {cluster_size} entities")
            
            fusion = input_data.fusion
            if fusion:
                manipulation_mode = fusion.get("manipulation_mode", "")
                if manipulation_mode:
                    indicators.append(f"Manipulation mode: {manipulation_mode}")
            
            radar = input_data.radar
            if radar:
                risk_score = self.safe_value(radar.get("risk_score", 0))
                if risk_score > 0.5:
                    indicators.append(f"Global risk score: {risk_score:.1%}")
            
            return indicators[:10]  # Limit to 10 indicators
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error extracting indicators: {e}")
            return []
    
    def _extract_behavioral_traits(
        self,
        input_data: ThreatActorInput,
        actor_type: str
    ) -> List[str]:
        """Extract behavioral traits"""
        try:
            traits = []
            
            dna = input_data.dna
            if dna:
                aggressiveness = self.safe_value(dna.get("aggressiveness", 0))
                if aggressiveness > 0.7:
                    traits.append("Highly aggressive trading patterns")
                elif aggressiveness > 0.4:
                    traits.append("Moderate aggressiveness")
                else:
                    traits.append("Conservative trading behavior")
                
                burstiness = self.safe_value(dna.get("burstiness", 0))
                if burstiness > 0.7:
                    traits.append("Burst-driven activity patterns")
                elif burstiness > 0.4:
                    traits.append("Moderate activity bursts")
                
                timing_precision = self.safe_value(dna.get("timing_precision", 0))
                if timing_precision > 0.8:
                    traits.append("High timing precision")
            
            return traits
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error extracting behavioral traits: {e}")
            return []
    
    def _extract_coordination_traits(
        self,
        input_data: ThreatActorInput,
        actor_type: str
    ) -> List[str]:
        """Extract coordination traits"""
        try:
            traits = []
            
            correlation = input_data.correlation
            if correlation:
                cluster_size = self.safe_value(correlation.get("cluster_size", 0))
                if cluster_size >= 5:
                    traits.append("Large-scale coordination detected")
                elif cluster_size >= 3:
                    traits.append("Multi-entity coordination")
                elif cluster_size >= 2:
                    traits.append("Paired coordination")
                
                coordination_score = self.safe_value(correlation.get("coordination_score", 0))
                if coordination_score > 0.7:
                    traits.append("High coordination strength")
                elif coordination_score > 0.4:
                    traits.append("Moderate coordination")
            
            return traits
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error extracting coordination traits: {e}")
            return []
    
    def _extract_chain_traits(
        self,
        input_data: ThreatActorInput,
        actor_type: str
    ) -> List[str]:
        """Extract chain-specific traits"""
        try:
            traits = []
            
            chain = input_data.chain
            if chain:
                chain_count = self.safe_value(chain.get("chain_count", 0))
                if chain_count >= 5:
                    traits.append("Multi-chain operations (5+ chains)")
                elif chain_count >= 3:
                    traits.append("Cross-chain activity")
                elif chain_count >= 2:
                    traits.append("Dual-chain operations")
                
                primary_chain = chain.get("primary_chain", "")
                if primary_chain:
                    traits.append(f"Primary chain: {primary_chain}")
            
            return traits
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error extracting chain traits: {e}")
            return []
    
    def _extract_manipulation_traits(
        self,
        input_data: ThreatActorInput,
        actor_type: str
    ) -> List[str]:
        """Extract manipulation-specific traits"""
        try:
            traits = []
            
            fusion = input_data.fusion
            if fusion:
                manipulation_mode = fusion.get("manipulation_mode", "")
                if manipulation_mode:
                    traits.append(f"Detected mode: {manipulation_mode}")
                
                volatility_forcing = self.safe_value(fusion.get("volatility_forcing", 0))
                if volatility_forcing > 0.7:
                    traits.append("High volatility forcing")
            
            dna = input_data.dna
            if dna:
                manipulation_flags = dna.get("manipulation_flags", [])
                for flag in manipulation_flags[:3]:  # Top 3 flags
                    traits.append(f"Flag: {flag}")
            
            return traits
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error extracting manipulation traits: {e}")
            return []
    
    def _build_actor_summary(
        self,
        actor_type: str,
        indicators: List[str],
        input_data: ThreatActorInput
    ) -> str:
        """Build narrative summary for actor type"""
        try:
            summaries = {
                self.WHALE: self._build_whale_summary(indicators, input_data),
                self.PREDATOR: self._build_predator_summary(indicators, input_data),
                self.SYNDICATE: self._build_syndicate_summary(indicators, input_data),
                self.INSIDER: self._build_insider_summary(indicators, input_data),
                self.COORDINATED_ACTOR: self._build_coordinated_summary(indicators, input_data),
                self.GHOST: self._build_ghost_summary(indicators, input_data),
                self.MANIPULATOR: self._build_manipulator_summary(indicators, input_data),
                self.ARBITRAGE_BOT: self._build_arbitrage_summary(indicators, input_data),
                self.UNKNOWN_ACTOR: "Insufficient intelligence data to classify actor type. Additional monitoring required to establish behavioral patterns and risk profile."
            }
            
            return summaries.get(actor_type, summaries[self.UNKNOWN_ACTOR])
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error building summary: {e}")
            return "Error generating actor summary."
    
    def _build_whale_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build WHALE actor summary"""
        entity = input_data.entity
        avg_value = self.safe_value(entity.get("avg_transaction_value", 0))
        
        return (
            f"Intelligence analysis classifies this entity as a WHALE actor, characterized by large-value transactions "
            f"(average ${avg_value:,.0f}) and slow-moving behavior patterns. Whale actors typically maintain significant "
            f"holdings and execute high-impact transactions with low frequency. The entity demonstrates conservative "
            f"trading behavior with minimal aggressiveness indicators. Market impact potential is high due to transaction "
            f"size, though manipulation risk remains moderate. Whale actors often serve as market anchors and their "
            f"movements can signal significant market shifts. Monitoring recommended for position changes and large transfers."
        )
    
    def _build_predator_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build PREDATOR actor summary"""
        dna = input_data.dna
        aggressiveness = self.safe_value(dna.get("aggressiveness", 0))
        
        return (
            f"Intelligence analysis identifies this entity as a PREDATOR actor with high aggressiveness score ({aggressiveness:.1%}). "
            f"Predator actors exhibit aggressive manipulation tactics, rapid burst patterns, and elevated DNA risk indicators. "
            f"The entity demonstrates sophisticated market manipulation capabilities with coordinated timing and high-impact execution. "
            f"Behavioral patterns suggest active hunting for market opportunities with predatory trading strategies. "
            f"Risk level is elevated due to manipulation potential and market impact. Enhanced monitoring and potential "
            f"intervention recommended to mitigate systemic risk."
        )
    
    def _build_syndicate_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build SYNDICATE actor summary"""
        correlation = input_data.correlation
        cluster_size = self.safe_value(correlation.get("cluster_size", 0))
        
        return (
            f"Intelligence analysis classifies this entity as part of a SYNDICATE operation involving {cluster_size} coordinated entities. "
            f"Syndicate actors operate through multi-entity clusters with high correlation and coordinated execution patterns. "
            f"The entity demonstrates strong coordination indicators with synchronized timing and aligned behavioral patterns. "
            f"Syndicate operations typically involve sophisticated coordination mechanisms and shared strategic objectives. "
            f"Risk level is elevated due to coordinated manipulation potential and systemic impact. "
            f"Comprehensive cluster monitoring and cross-entity analysis recommended."
        )
    
    def _build_insider_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build INSIDER actor summary"""
        history = input_data.history
        timing_advantage = self.safe_value(history.get("timing_advantage", 0))
        
        return (
            f"Intelligence analysis identifies this entity as an INSIDER actor with exceptional timing advantage ({timing_advantage:.1%}). "
            f"Insider actors demonstrate low activity levels but high timing accuracy, suggesting information asymmetry. "
            f"The entity exhibits pre-event positioning patterns and consistently advantageous entry/exit timing. "
            f"Behavioral patterns indicate potential access to non-public information or advanced market intelligence. "
            f"Risk level is high due to regulatory implications and market fairness concerns. "
            f"Enhanced investigation recommended to determine information sources and trading legitimacy."
        )
    
    def _build_coordinated_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build COORDINATED ACTOR summary"""
        correlation = input_data.correlation
        coordination_score = self.safe_value(correlation.get("coordination_score", 0))
        
        return (
            f"Intelligence analysis classifies this entity as a COORDINATED ACTOR with moderate coordination score ({coordination_score:.1%}). "
            f"Coordinated actors exhibit moderate correlation with other entities and balanced manipulation indicators. "
            f"The entity demonstrates coordinated trading patterns without extreme aggressiveness or sophistication. "
            f"Behavioral patterns suggest participation in coordinated operations with shared objectives. "
            f"Risk level is moderate with potential for escalation under certain market conditions. "
            f"Standard monitoring protocols recommended with periodic reassessment."
        )
    
    def _build_ghost_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build GHOST actor summary"""
        history = input_data.history
        dormancy_period = self.safe_value(history.get("dormancy_period_days", 0))
        
        return (
            f"Intelligence analysis identifies this entity as a GHOST actor with extended dormancy period ({dormancy_period:.0f} days) "
            f"followed by sudden high-level activation burst. Ghost actors remain dormant for extended periods before "
            f"executing rapid, high-impact operations. The entity demonstrates sudden activation patterns with significant "
            f"activity spikes following dormancy. Behavioral patterns suggest strategic timing and coordinated activation. "
            f"Risk level is elevated due to unpredictability and potential for coordinated operations. "
            f"Enhanced monitoring during activation periods and dormancy tracking recommended."
        )
    
    def _build_manipulator_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build MANIPULATOR actor summary"""
        fusion = input_data.fusion
        manipulation_mode = fusion.get("manipulation_mode", "UNKNOWN")
        
        return (
            f"Intelligence analysis classifies this entity as a MANIPULATOR actor with detected manipulation mode: {manipulation_mode}. "
            f"Manipulator actors exhibit pump/dump patterns, volatility forcing, and sophisticated market manipulation tactics. "
            f"The entity demonstrates multiple manipulation flags and coordinated price distortion activities. "
            f"Behavioral patterns indicate systematic manipulation operations with measurable market impact. "
            f"Risk level is critical due to market integrity concerns and regulatory implications. "
            f"Immediate enhanced monitoring and potential intervention recommended."
        )
    
    def _build_arbitrage_summary(self, indicators: List[str], input_data: ThreatActorInput) -> str:
        """Build ARBITRAGE BOT actor summary"""
        entity = input_data.entity
        tx_count = self.safe_value(entity.get("transaction_count", 0))
        
        return (
            f"Intelligence analysis identifies this entity as an ARBITRAGE BOT with high-frequency operations ({tx_count} transactions). "
            f"Arbitrage bots demonstrate precision timing, fast execution, and narrow volatility bands. "
            f"The entity exhibits bot-like behavioral patterns with sub-minute transaction intervals and multi-chain operations. "
            f"Behavioral patterns suggest automated arbitrage strategies exploiting price differentials across markets. "
            f"Risk level is low to moderate as arbitrage activities generally contribute to market efficiency. "
            f"Routine monitoring recommended to ensure compliance with platform policies."
        )
    
    def _generate_recommendations(
        self,
        actor_type: str,
        risk_level: str,
        input_data: ThreatActorInput
    ) -> List[str]:
        """Generate actionable recommendations"""
        try:
            recommendations = []
            
            if risk_level in ["CRITICAL", "HIGH"]:
                recommendations.append("Implement continuous real-time monitoring")
                recommendations.append("Activate enhanced alert thresholds")
                recommendations.append("Consider entity freeze or transaction limits")
            elif risk_level == "MODERATE":
                recommendations.append("Maintain enhanced monitoring protocols")
                recommendations.append("Periodic reassessment recommended")
            else:
                recommendations.append("Standard monitoring protocols sufficient")
            
            if actor_type == self.WHALE:
                recommendations.append("Monitor for large position changes")
                recommendations.append("Track market impact of transactions")
            elif actor_type == self.PREDATOR:
                recommendations.append("Deploy manipulation detection algorithms")
                recommendations.append("Monitor for coordinated attack patterns")
            elif actor_type == self.SYNDICATE:
                recommendations.append("Implement cluster-wide monitoring")
                recommendations.append("Track cross-entity coordination")
            elif actor_type == self.INSIDER:
                recommendations.append("Investigate information sources")
                recommendations.append("Monitor pre-event positioning")
            elif actor_type == self.GHOST:
                recommendations.append("Track dormancy periods and activation triggers")
                recommendations.append("Monitor for coordinated activation events")
            elif actor_type == self.MANIPULATOR:
                recommendations.append("Immediate investigation recommended")
                recommendations.append("Consider regulatory reporting")
            
            return recommendations[:6]  # Limit to 6 recommendations
            
        except Exception as e:
            self.logger.error(f"[ThreatActor] Error generating recommendations: {e}")
            return ["Enhanced monitoring recommended"]
    
    
    @staticmethod
    def safe_value(value: Any, default: float = 0.0) -> float:
        """
        Safely extract numeric value with default fallback
        100% crash-proof
        """
        try:
            if value is None:
                return default
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                try:
                    return float(value)
                except (ValueError, TypeError):
                    return default
            return default
        except Exception:
            return default
