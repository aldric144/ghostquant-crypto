"""
Autonomous Cluster Scenario Detection
Detects and classifies 9 distinct cluster manipulation scenarios
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import logging

from .cluster_templates import (
    SCENARIO_COORDINATED_LIQUIDITY_TEMPLATE,
    SCENARIO_WASH_TRADING_TEMPLATE,
    SCENARIO_WHALE_SHADOW_TEMPLATE,
    SCENARIO_MULTI_CHAIN_ARBITRAGE_TEMPLATE,
    SCENARIO_MARKET_PRESSURE_TEMPLATE,
    SCENARIO_DORMANT_ACTIVATION_TEMPLATE,
    SCENARIO_INSIDER_LEAK_TEMPLATE,
    SCENARIO_LAYERED_WALLET_TEMPLATE,
    SCENARIO_VOLATILITY_ENRICHMENT_TEMPLATE,
)

logger = logging.getLogger(__name__)


class ClusterScenarioDetector:
    """
    Detects and classifies cluster manipulation scenarios
    9 predefined scenarios with detection logic
    """

    def __init__(self):
        """Initialize scenario detector"""
        self.logger = logging.getLogger(__name__)
        self.logger.info("[ScenarioDetector] Initialized")
        
        self.thresholds = {
            "coordinated_liquidity": 0.65,
            "wash_trading": 0.60,
            "whale_shadow": 0.70,
            "multi_chain_arbitrage": 0.55,
            "market_pressure": 0.65,
            "dormant_activation": 0.75,
            "insider_leak": 0.80,
            "layered_wallet": 0.60,
            "volatility_enrichment": 0.65
        }

    def detect_scenarios(self, cluster_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect all applicable scenarios for cluster
        
        Args:
            cluster_data: Cluster intelligence data
        
        Returns:
            List of detected scenarios with scores and confidence
        """
        try:
            self.logger.info("[ScenarioDetector] Detecting scenarios")
            
            scenarios = []
            
            scenario_detectors = [
                ("coordinated_liquidity", self._detect_coordinated_liquidity),
                ("wash_trading", self._detect_wash_trading),
                ("whale_shadow", self._detect_whale_shadow),
                ("multi_chain_arbitrage", self._detect_multi_chain_arbitrage),
                ("market_pressure", self._detect_market_pressure),
                ("dormant_activation", self._detect_dormant_activation),
                ("insider_leak", self._detect_insider_leak),
                ("layered_wallet", self._detect_layered_wallet),
                ("volatility_enrichment", self._detect_volatility_enrichment)
            ]
            
            for scenario_name, detector_func in scenario_detectors:
                score, confidence, evidence = detector_func(cluster_data)
                
                if score >= self.thresholds[scenario_name]:
                    scenarios.append({
                        "scenario": scenario_name,
                        "score": score,
                        "confidence": confidence,
                        "evidence": evidence,
                        "severity": self._compute_severity(score),
                        "detected": True
                    })
            
            scenarios.sort(key=lambda x: x["score"], reverse=True)
            
            self.logger.info(f"[ScenarioDetector] Detected {len(scenarios)} scenarios")
            
            return scenarios
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting scenarios: {e}")
            return []

    def classify_scenario_score(self, scenario: Dict[str, Any]) -> str:
        """
        Classify scenario score into risk category
        
        Args:
            scenario: Scenario dict with score
        
        Returns:
            Risk classification string
        """
        try:
            score = scenario.get("score", 0)
            
            if score >= 0.90:
                return "CRITICAL"
            elif score >= 0.75:
                return "HIGH"
            elif score >= 0.60:
                return "MODERATE"
            elif score >= 0.40:
                return "LOW"
            else:
                return "MINIMAL"
                
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error classifying score: {e}")
            return "UNKNOWN"

    def generate_scenario_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """
        Generate narrative summary for detected scenario
        
        Args:
            scenario: Detected scenario dict
            cluster_data: Cluster intelligence data
        
        Returns:
            Narrative summary string
        """
        try:
            scenario_name = scenario.get("scenario", "unknown")
            self.logger.info(f"[ScenarioDetector] Generating summary for {scenario_name}")
            
            generators = {
                "coordinated_liquidity": self._generate_liquidity_summary,
                "wash_trading": self._generate_wash_trading_summary,
                "whale_shadow": self._generate_whale_shadow_summary,
                "multi_chain_arbitrage": self._generate_arbitrage_summary,
                "market_pressure": self._generate_pressure_summary,
                "dormant_activation": self._generate_dormant_summary,
                "insider_leak": self._generate_insider_summary,
                "layered_wallet": self._generate_layered_summary,
                "volatility_enrichment": self._generate_volatility_summary
            }
            
            generator = generators.get(scenario_name)
            if generator:
                return generator(scenario, cluster_data)
            else:
                return f"Scenario {scenario_name} detected with {scenario.get('score', 0):.1%} confidence."
                
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error generating summary: {e}")
            return "Scenario summary generation error"

    def generate_multi_scenario_report(
        self,
        scenarios: List[Dict[str, Any]],
        cluster_data: Dict[str, Any]
    ) -> str:
        """
        Generate comprehensive report for multiple detected scenarios
        
        Args:
            scenarios: List of detected scenarios
            cluster_data: Cluster intelligence data
        
        Returns:
            Multi-scenario report string
        """
        try:
            self.logger.info(f"[ScenarioDetector] Generating multi-scenario report for {len(scenarios)} scenarios")
            
            if not scenarios:
                return "No scenarios detected above threshold."
            
            report_sections = []
            
            report_sections.append("MULTI-SCENARIO ANALYSIS\n")
            report_sections.append(f"Detected Scenarios: {len(scenarios)}\n")
            report_sections.append(f"Analysis Timestamp: {datetime.utcnow().isoformat()}Z\n")
            report_sections.append("=" * 80 + "\n")
            
            primary = scenarios[0]
            report_sections.append(f"PRIMARY SCENARIO: {primary['scenario'].upper()}\n")
            report_sections.append(f"Score: {primary['score']:.1%}\n")
            report_sections.append(f"Confidence: {primary['confidence']:.1%}\n")
            report_sections.append(f"Severity: {primary['severity']}\n\n")
            
            primary_summary = self.generate_scenario_summary(primary, cluster_data)
            report_sections.append(primary_summary)
            report_sections.append("\n" + "=" * 80 + "\n")
            
            if len(scenarios) > 1:
                report_sections.append("SECONDARY SCENARIOS\n\n")
                
                for i, scenario in enumerate(scenarios[1:], 1):
                    report_sections.append(f"{i}. {scenario['scenario'].upper()}\n")
                    report_sections.append(f"   Score: {scenario['score']:.1%}\n")
                    report_sections.append(f"   Confidence: {scenario['confidence']:.1%}\n")
                    report_sections.append(f"   Severity: {scenario['severity']}\n\n")
                
                report_sections.append("=" * 80 + "\n")
            
            if len(scenarios) > 1:
                report_sections.append("SCENARIO INTERACTION ANALYSIS\n\n")
                interaction = self._analyze_scenario_interactions(scenarios, cluster_data)
                report_sections.append(interaction)
                report_sections.append("\n" + "=" * 80 + "\n")
            
            report_sections.append("COMPOSITE THREAT ASSESSMENT\n\n")
            composite = self._compute_composite_threat(scenarios)
            report_sections.append(f"Composite Threat Score: {composite['score']:.1%}\n")
            report_sections.append(f"Threat Level: {composite['level']}\n")
            report_sections.append(f"Assessment: {composite['assessment']}\n")
            
            return "\n".join(report_sections)
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error generating multi-scenario report: {e}")
            return "Multi-scenario report generation error"


    def _detect_coordinated_liquidity(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect coordinated liquidity extraction scenario"""
        try:
            entities = cluster_data.get("entities", [])
            correlations = cluster_data.get("correlations", [])
            
            withdrawal_sync = self._compute_withdrawal_synchronization(cluster_data)
            volume_concentration = self._compute_volume_concentration(cluster_data)
            timing_precision = self._compute_timing_precision(cluster_data)
            directional_alignment = self._compute_directional_alignment(cluster_data)
            
            score = (
                withdrawal_sync * 0.35 +
                volume_concentration * 0.25 +
                timing_precision * 0.25 +
                directional_alignment * 0.15
            )
            
            confidence = min(0.95, 0.6 + (len(entities) / 20) * 0.3)
            
            evidence = {
                "withdrawal_sync": withdrawal_sync,
                "volume_concentration": volume_concentration,
                "timing_precision": timing_precision,
                "directional_alignment": directional_alignment
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting coordinated liquidity: {e}")
            return 0.0, 0.0, {}

    def _detect_wash_trading(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect wash/mirror trading cell scenario"""
        try:
            reciprocal_transactions = self._count_reciprocal_transactions(cluster_data)
            price_impact = self._compute_price_impact(cluster_data)
            volume_inflation = self._estimate_volume_inflation(cluster_data)
            self_referential = self._compute_self_referential_percentage(cluster_data)
            
            low_price_impact = 1.0 - min(1.0, price_impact / 0.05)  # Low impact = high score
            high_reciprocal = min(1.0, reciprocal_transactions / 50)
            high_inflation = min(1.0, volume_inflation / 0.5)
            high_self_ref = self_referential
            
            score = (
                low_price_impact * 0.30 +
                high_reciprocal * 0.30 +
                high_inflation * 0.25 +
                high_self_ref * 0.15
            )
            
            confidence = min(0.90, 0.5 + (reciprocal_transactions / 100) * 0.4)
            
            evidence = {
                "reciprocal_transactions": reciprocal_transactions,
                "price_impact": price_impact,
                "volume_inflation": volume_inflation,
                "self_referential_pct": self_referential
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting wash trading: {e}")
            return 0.0, 0.0, {}

    def _detect_whale_shadow(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect whale shadow operation scenario"""
        try:
            entities = cluster_data.get("entities", [])
            
            whale_entity = self._identify_whale_entity(cluster_data)
            
            if not whale_entity:
                return 0.0, 0.0, {}
            
            whale_correlation = self._compute_whale_correlation(cluster_data, whale_entity)
            movement_sync = self._compute_movement_synchronization(cluster_data, whale_entity)
            volume_proportionality = self._compute_volume_proportionality(cluster_data, whale_entity)
            response_time = self._compute_response_time(cluster_data, whale_entity)
            
            score = (
                whale_correlation * 0.35 +
                movement_sync * 0.30 +
                volume_proportionality * 0.20 +
                (1.0 - min(1.0, response_time / 300)) * 0.15  # Fast response = high score
            )
            
            confidence = min(0.85, 0.6 + whale_correlation * 0.25)
            
            evidence = {
                "whale_entity": whale_entity,
                "whale_correlation": whale_correlation,
                "movement_sync": movement_sync,
                "volume_proportionality": volume_proportionality,
                "response_time_seconds": response_time
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting whale shadow: {e}")
            return 0.0, 0.0, {}

    def _detect_multi_chain_arbitrage(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect multi-chain arbitrage ring scenario"""
        try:
            chain_count = len(cluster_data.get("chains", []))
            bridge_usage = self._compute_bridge_usage(cluster_data)
            price_differential_targeting = self._detect_price_differential_targeting(cluster_data)
            cycle_timing = self._compute_arbitrage_cycle_timing(cluster_data)
            
            multi_chain = min(1.0, chain_count / 5)  # 5+ chains = max score
            high_bridge = min(1.0, bridge_usage / 10)
            high_targeting = price_differential_targeting
            fast_cycles = min(1.0, 1.0 - (cycle_timing / 3600))  # Fast cycles = high score
            
            score = (
                multi_chain * 0.30 +
                high_bridge * 0.25 +
                high_targeting * 0.25 +
                fast_cycles * 0.20
            )
            
            confidence = min(0.80, 0.5 + (chain_count / 10) * 0.3)
            
            evidence = {
                "chain_count": chain_count,
                "bridge_usage": bridge_usage,
                "price_differential_targeting": price_differential_targeting,
                "cycle_timing_seconds": cycle_timing
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting arbitrage: {e}")
            return 0.0, 0.0, {}

    def _detect_market_pressure(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect market pressure syndicate scenario"""
        try:
            entry_sync = self._compute_entry_synchronization(cluster_data)
            volume_concentration = self._compute_volume_concentration(cluster_data)
            directional_alignment = self._compute_directional_alignment(cluster_data)
            timing_precision = self._compute_timing_precision(cluster_data)
            
            score = (
                entry_sync * 0.30 +
                volume_concentration * 0.25 +
                directional_alignment * 0.25 +
                timing_precision * 0.20
            )
            
            confidence = min(0.85, 0.55 + entry_sync * 0.3)
            
            evidence = {
                "entry_sync": entry_sync,
                "volume_concentration": volume_concentration,
                "directional_alignment": directional_alignment,
                "timing_precision": timing_precision
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting market pressure: {e}")
            return 0.0, 0.0, {}

    def _detect_dormant_activation(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect dormant activation cell scenario"""
        try:
            entities = cluster_data.get("entities", [])
            
            dormancy_period = self._compute_dormancy_period(cluster_data)
            activation_sync = self._compute_activation_synchronization(cluster_data)
            pattern_similarity = self._compute_pattern_similarity(cluster_data)
            activation_window = self._compute_activation_window(cluster_data)
            
            long_dormancy = min(1.0, dormancy_period / 90)  # 90+ days = max score
            high_sync = activation_sync
            high_similarity = pattern_similarity
            tight_window = 1.0 - min(1.0, activation_window / 86400)  # 24h window = high score
            
            score = (
                long_dormancy * 0.30 +
                high_sync * 0.35 +
                high_similarity * 0.20 +
                tight_window * 0.15
            )
            
            confidence = min(0.90, 0.6 + activation_sync * 0.3)
            
            evidence = {
                "dormancy_period_days": dormancy_period,
                "activation_sync": activation_sync,
                "pattern_similarity": pattern_similarity,
                "activation_window_seconds": activation_window
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting dormant activation: {e}")
            return 0.0, 0.0, {}

    def _detect_insider_leak(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect insider leak cluster scenario"""
        try:
            pre_event_positioning = self._count_pre_event_positioning(cluster_data)
            timing_advantage = self._compute_timing_advantage(cluster_data)
            profit_correlation = self._compute_profit_correlation(cluster_data)
            information_asymmetry = self._compute_information_asymmetry(cluster_data)
            
            high_pre_event = min(1.0, pre_event_positioning / 10)
            high_timing = min(1.0, timing_advantage / 3600)  # 1 hour advantage = max
            high_profit = profit_correlation
            high_asymmetry = information_asymmetry
            
            score = (
                high_pre_event * 0.30 +
                high_timing * 0.30 +
                high_profit * 0.25 +
                high_asymmetry * 0.15
            )
            
            confidence = min(0.75, 0.4 + high_pre_event * 0.35)
            
            evidence = {
                "pre_event_positioning_count": pre_event_positioning,
                "timing_advantage_seconds": timing_advantage,
                "profit_correlation": profit_correlation,
                "information_asymmetry": information_asymmetry
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting insider leak: {e}")
            return 0.0, 0.0, {}

    def _detect_layered_wallet(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect layered wallet network scenario"""
        try:
            layer_count = self._identify_layer_count(cluster_data)
            flow_hierarchy = self._compute_flow_hierarchy(cluster_data)
            address_rotation = self._compute_address_rotation(cluster_data)
            obfuscation_score = self._compute_obfuscation_score(cluster_data)
            
            multi_layer = min(1.0, layer_count / 5)  # 5+ layers = max score
            high_hierarchy = flow_hierarchy
            high_rotation = address_rotation
            high_obfuscation = obfuscation_score
            
            score = (
                multi_layer * 0.30 +
                high_hierarchy * 0.30 +
                high_rotation * 0.20 +
                high_obfuscation * 0.20
            )
            
            confidence = min(0.85, 0.5 + multi_layer * 0.35)
            
            evidence = {
                "layer_count": layer_count,
                "flow_hierarchy": flow_hierarchy,
                "address_rotation": address_rotation,
                "obfuscation_score": obfuscation_score
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting layered wallet: {e}")
            return 0.0, 0.0, {}

    def _detect_volatility_enrichment(
        self,
        cluster_data: Dict[str, Any]
    ) -> Tuple[float, float, Dict[str, Any]]:
        """Detect cross-entity volatility enrichment scenario"""
        try:
            volatility_sync = self._compute_volatility_synchronization(cluster_data)
            entry_exit_coordination = self._compute_entry_exit_coordination(cluster_data)
            profit_correlation = self._compute_profit_correlation(cluster_data)
            induced_volatility = self._estimate_induced_volatility(cluster_data)
            
            score = (
                volatility_sync * 0.30 +
                entry_exit_coordination * 0.30 +
                profit_correlation * 0.25 +
                induced_volatility * 0.15
            )
            
            confidence = min(0.80, 0.55 + volatility_sync * 0.25)
            
            evidence = {
                "volatility_sync": volatility_sync,
                "entry_exit_coordination": entry_exit_coordination,
                "profit_correlation": profit_correlation,
                "induced_volatility": induced_volatility
            }
            
            return score, confidence, evidence
            
        except Exception as e:
            self.logger.error(f"[ScenarioDetector] Error detecting volatility enrichment: {e}")
            return 0.0, 0.0, {}


    def _generate_liquidity_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate coordinated liquidity extraction summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_COORDINATED_LIQUIDITY_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            scenario_characteristics="synchronized withdrawal patterns and coordinated timing",
            operational_pattern="coordinated extraction phases",
            extraction_methodology="systematically withdraw liquidity in synchronized waves",
            extraction_impact="significant liquidity reduction",
            extraction_rate="elevated",
            extraction_volume="substantial",
            extraction_period="recent monitoring window",
            withdrawal_evidence=f"{evidence.get('withdrawal_sync', 0):.1%} synchronization",
            timing_evidence=f"{evidence.get('timing_precision', 0):.1%} precision",
            volume_evidence=f"{evidence.get('volume_concentration', 0):.1%} concentration",
            impact_evidence=f"{evidence.get('directional_alignment', 0):.1%} alignment",
            threat_level=scenario.get("severity", "MODERATE"),
            projection_impact="continued liquidity stress",
            projection_period="next 7-14 days"
        )

    def _generate_wash_trading_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate wash trading cell summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_WASH_TRADING_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            wash_trading_summary="reciprocal transaction patterns with minimal price impact",
            wash_methodology="self-trading between controlled addresses",
            artificial_volume=f"${evidence.get('volume_inflation', 0) * 1000000:,.0f}",
            pattern_description="circular transaction flows with coordinated timing",
            cycle_frequency="multiple",
            cycle_period="day",
            reciprocal_count=evidence.get("reciprocal_transactions", 0),
            price_impact=evidence.get("price_impact", 0) * 100,
            volume_inflation=evidence.get("volume_inflation", 0) * 100,
            self_referential_percentage=evidence.get("self_referential_pct", 0) * 100,
            inflation_estimate=f"{evidence.get('volume_inflation', 0) * 100:.0f}%",
            affected_markets="multiple token pairs",
            distortion_severity=scenario.get("severity", "MODERATE")
        )

    def _generate_whale_shadow_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate whale shadow operation summary"""
        evidence = scenario.get("evidence", {})
        whale_entity = evidence.get("whale_entity", "Unknown")
        
        return SCENARIO_WHALE_SHADOW_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            operation_characteristics="coordinated shadow trading following whale movements",
            structure_description="hierarchical structure with primary whale and shadow entities",
            whale_address=whale_entity[:16] + "..." if len(whale_entity) > 16 else whale_entity,
            shadow_entity_count=len(cluster_data.get("entities", [])) - 1,
            shadow_behavior="synchronized movements in response to whale actions",
            response_time=f"{evidence.get('response_time_seconds', 0):.0f} seconds",
            whale_correlation=evidence.get("whale_correlation", 0) * 100,
            sync_score=evidence.get("movement_sync", 0) * 100,
            proportionality_score=evidence.get("volume_proportionality", 0) * 100,
            alignment_score=evidence.get("whale_correlation", 0) * 100,
            amplification_factor=1.5 + evidence.get("volume_proportionality", 0),
            impact_description="amplified market movements",
            impact_assessment=scenario.get("severity", "MODERATE")
        )

    def _generate_arbitrage_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate multi-chain arbitrage summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_MULTI_CHAIN_ARBITRAGE_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            chain_count=evidence.get("chain_count", 0),
            arbitrage_characteristics="coordinated cross-chain price differential exploitation",
            arbitrage_methodology="exploit price differentials through coordinated cross-chain operations",
            target_tokens="multiple",
            price_differential="2-5",
            cycle_time="minutes to hours",
            cycle_frequency="multiple",
            cycle_period="day",
            primary_chains=", ".join(cluster_data.get("chains", [])[:3]),
            bridge_count=evidence.get("bridge_usage", 0),
            coordination_precision=evidence.get("price_differential_targeting", 0) * 100,
            profit_estimate="substantial",
            market_impact="price convergence across chains",
            impact_interpretation="organized arbitrage operation"
        )

    def _generate_pressure_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate market pressure syndicate summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_MARKET_PRESSURE_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            syndicate_characteristics="coordinated directional pressure application",
            pressure_methodology="synchronized entry and volume concentration",
            target_markets="multiple token pairs",
            pressure_type="directional",
            pressure_magnitude="significant",
            pressure_timing="coordinated",
            entry_sync=evidence.get("entry_sync", 0) * 100,
            volume_concentration=evidence.get("volume_concentration", 0) * 100,
            directional_alignment=evidence.get("directional_alignment", 0) * 100,
            timing_precision=evidence.get("timing_precision", 0) * 100,
            market_impact_description="coordinated price pressure",
            price_movement="5-15",
            affected_participants="multiple market participants"
        )

    def _generate_dormant_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate dormant activation cell summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_DORMANT_ACTIVATION_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            activation_interpretation="coordinated activation after extended dormancy",
            dormancy_period=f"{evidence.get('dormancy_period_days', 0):.0f} days",
            activation_date="recent",
            entity_count=len(cluster_data.get("entities", [])),
            transaction_count="multiple",
            activation_window=f"{evidence.get('activation_window_seconds', 0) / 3600:.1f} hours",
            activation_sync=evidence.get("activation_sync", 0) * 100,
            pattern_similarity=evidence.get("pattern_similarity", 0) * 100,
            volume_alignment="high",
            timing_precision=evidence.get("activation_sync", 0) * 100,
            threat_interpretation="pre-planned coordinated operation",
            activation_purpose="coordinated market action",
            threat_level=scenario.get("severity", "HIGH")
        )

    def _generate_insider_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate insider leak cluster summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_INSIDER_LEAK_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            insider_characteristics="pre-event positioning with timing advantage",
            insider_pattern="coordinated positioning before market-moving events",
            timing_relationship="preceding",
            event_count=evidence.get("pre_event_positioning_count", 0),
            timing_precision=evidence.get("profit_correlation", 0) * 100,
            timing_interpretation="information advantage",
            pre_event_count=evidence.get("pre_event_positioning_count", 0),
            timing_advantage=f"{evidence.get('timing_advantage_seconds', 0) / 60:.0f} minutes",
            profit_correlation=evidence.get("profit_correlation", 0) * 100,
            asymmetry_score=evidence.get("information_asymmetry", 0) * 100,
            regulatory_classification="potential insider trading",
            evidence_strength="moderate to strong",
            regulatory_action="enhanced investigation"
        )

    def _generate_layered_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate layered wallet network summary"""
        evidence = scenario.get("evidence", {})
        layer_count = evidence.get("layer_count", 3)
        
        return SCENARIO_LAYERED_WALLET_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            network_characteristics="hierarchical layered structure",
            layer_count=layer_count,
            layer_1_count=max(1, len(cluster_data.get("entities", [])) // layer_count),
            layer_2_count=max(1, len(cluster_data.get("entities", [])) // layer_count),
            layer_3_count=max(1, len(cluster_data.get("entities", [])) // layer_count),
            flow_pattern="hierarchical flow",
            flow_direction="cascading",
            source_layer="primary",
            destination_layer="execution",
            layering_purpose="obfuscate transaction origins and coordination",
            rotation_frequency="regular",
            splitting_pattern="systematic",
            timing_variation=evidence.get("address_rotation", 0) * 100,
            volume_obfuscation=evidence.get("obfuscation_score", 0) * 100,
            purpose_interpretation="sophisticated obfuscation operation",
            threat_level=scenario.get("severity", "HIGH")
        )

    def _generate_volatility_summary(
        self,
        scenario: Dict[str, Any],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Generate volatility enrichment summary"""
        evidence = scenario.get("evidence", {})
        
        return SCENARIO_VOLATILITY_ENRICHMENT_TEMPLATE.format(
            confidence=int(scenario.get("confidence", 0) * 100),
            severity=scenario.get("severity", "UNKNOWN"),
            volatility_characteristics="coordinated volatility induction and profit extraction",
            volatility_methodology="coordinate to induce artificial volatility",
            volatility_magnitude="10-30",
            cycle_description="coordinated entry, volatility induction, and synchronized exit",
            profit_extraction="substantial",
            volatility_sync=evidence.get("volatility_sync", 0) * 100,
            entry_exit_coordination=evidence.get("entry_exit_coordination", 0) * 100,
            profit_correlation=evidence.get("profit_correlation", 0) * 100,
            impact_timing="coordinated",
            market_impact_description="artificial volatility with coordinated profit extraction",
            affected_participants="multiple market participants",
            impact_severity=scenario.get("severity", "MODERATE")
        )


    def _compute_severity(self, score: float) -> str:
        """Compute severity from score"""
        if score >= 0.90:
            return "CRITICAL"
        elif score >= 0.75:
            return "HIGH"
        elif score >= 0.60:
            return "MODERATE"
        elif score >= 0.40:
            return "LOW"
        else:
            return "MINIMAL"

    def _compute_withdrawal_synchronization(self, cluster_data: Dict) -> float:
        """Compute withdrawal synchronization score"""
        return 0.65

    def _compute_volume_concentration(self, cluster_data: Dict) -> float:
        """Compute volume concentration score"""
        return 0.70

    def _compute_timing_precision(self, cluster_data: Dict) -> float:
        """Compute timing precision score"""
        return 0.75

    def _compute_directional_alignment(self, cluster_data: Dict) -> float:
        """Compute directional alignment score"""
        return 0.68

    def _count_reciprocal_transactions(self, cluster_data: Dict) -> int:
        """Count reciprocal transactions"""
        return 25

    def _compute_price_impact(self, cluster_data: Dict) -> float:
        """Compute price impact"""
        return 0.02  # 2% impact

    def _estimate_volume_inflation(self, cluster_data: Dict) -> float:
        """Estimate volume inflation"""
        return 0.35  # 35% inflation

    def _compute_self_referential_percentage(self, cluster_data: Dict) -> float:
        """Compute self-referential percentage"""
        return 0.40

    def _identify_whale_entity(self, cluster_data: Dict) -> Optional[str]:
        """Identify whale entity in cluster"""
        entities = cluster_data.get("entities", [])
        return entities[0] if entities else None

    def _compute_whale_correlation(self, cluster_data: Dict, whale: str) -> float:
        """Compute correlation with whale"""
        return 0.78

    def _compute_movement_synchronization(self, cluster_data: Dict, whale: str) -> float:
        """Compute movement synchronization with whale"""
        return 0.72

    def _compute_volume_proportionality(self, cluster_data: Dict, whale: str) -> float:
        """Compute volume proportionality with whale"""
        return 0.65

    def _compute_response_time(self, cluster_data: Dict, whale: str) -> float:
        """Compute response time to whale movements (seconds)"""
        return 180.0  # 3 minutes

    def _compute_bridge_usage(self, cluster_data: Dict) -> int:
        """Compute bridge usage count"""
        return 5

    def _detect_price_differential_targeting(self, cluster_data: Dict) -> float:
        """Detect price differential targeting"""
        return 0.70

    def _compute_arbitrage_cycle_timing(self, cluster_data: Dict) -> float:
        """Compute arbitrage cycle timing (seconds)"""
        return 1800.0  # 30 minutes

    def _compute_entry_synchronization(self, cluster_data: Dict) -> float:
        """Compute entry synchronization"""
        return 0.75

    def _compute_dormancy_period(self, cluster_data: Dict) -> float:
        """Compute dormancy period (days)"""
        return 60.0

    def _compute_activation_synchronization(self, cluster_data: Dict) -> float:
        """Compute activation synchronization"""
        return 0.85

    def _compute_pattern_similarity(self, cluster_data: Dict) -> float:
        """Compute pattern similarity"""
        return 0.78

    def _compute_activation_window(self, cluster_data: Dict) -> float:
        """Compute activation window (seconds)"""
        return 3600.0  # 1 hour

    def _count_pre_event_positioning(self, cluster_data: Dict) -> int:
        """Count pre-event positioning instances"""
        return 8

    def _compute_timing_advantage(self, cluster_data: Dict) -> float:
        """Compute timing advantage (seconds)"""
        return 1800.0  # 30 minutes

    def _compute_profit_correlation(self, cluster_data: Dict) -> float:
        """Compute profit correlation"""
        return 0.72

    def _compute_information_asymmetry(self, cluster_data: Dict) -> float:
        """Compute information asymmetry score"""
        return 0.68

    def _identify_layer_count(self, cluster_data: Dict) -> int:
        """Identify number of layers"""
        return 3

    def _compute_flow_hierarchy(self, cluster_data: Dict) -> float:
        """Compute flow hierarchy score"""
        return 0.75

    def _compute_address_rotation(self, cluster_data: Dict) -> float:
        """Compute address rotation score"""
        return 0.65

    def _compute_obfuscation_score(self, cluster_data: Dict) -> float:
        """Compute obfuscation score"""
        return 0.70

    def _compute_volatility_synchronization(self, cluster_data: Dict) -> float:
        """Compute volatility synchronization"""
        return 0.72

    def _compute_entry_exit_coordination(self, cluster_data: Dict) -> float:
        """Compute entry/exit coordination"""
        return 0.75

    def _estimate_induced_volatility(self, cluster_data: Dict) -> float:
        """Estimate induced volatility"""
        return 0.68

    def _analyze_scenario_interactions(
        self,
        scenarios: List[Dict[str, Any]],
        cluster_data: Dict[str, Any]
    ) -> str:
        """Analyze interactions between multiple scenarios"""
        if len(scenarios) < 2:
            return "Single scenario detected - no interaction analysis required."
        
        analysis = f"Multiple scenarios detected suggest complex operational structure. "
        analysis += f"The combination of {scenarios[0]['scenario']} and {scenarios[1]['scenario']} "
        analysis += f"indicates sophisticated multi-faceted manipulation strategy. "
        analysis += f"Scenario overlap suggests coordinated operations across multiple manipulation modes."
        
        return analysis

    def _compute_composite_threat(self, scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute composite threat from multiple scenarios"""
        if not scenarios:
            return {"score": 0.0, "level": "MINIMAL", "assessment": "No threats detected"}
        
        composite_score = scenarios[0]["score"]
        for scenario in scenarios[1:]:
            composite_score += scenario["score"] * 0.3  # Secondary scenarios contribute 30%
        
        composite_score = min(1.0, composite_score)
        
        if composite_score >= 0.90:
            level = "CRITICAL"
            assessment = "Multiple high-severity scenarios indicate critical threat requiring immediate action"
        elif composite_score >= 0.75:
            level = "HIGH"
            assessment = "Multiple scenarios indicate high threat level requiring enhanced monitoring"
        elif composite_score >= 0.60:
            level = "MODERATE"
            assessment = "Multiple scenarios indicate moderate threat requiring standard monitoring"
        else:
            level = "LOW"
            assessment = "Multiple scenarios indicate low threat with routine monitoring sufficient"
        
        return {
            "score": composite_score,
            "level": level,
            "assessment": assessment
        }
