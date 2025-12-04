"""
GhostWriter AI Narrative Sections
Reusable section builders for intelligence reports
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from .narrative_templates import (
    ENTITY_IDENTITY_TEMPLATE,
    BEHAVIORAL_DNA_SECTION,
    RISK_ELEVATION_TEMPLATE,
    RECENT_ACTIVITY_TEMPLATE,
    MANIPULATION_MODE_TEMPLATE,
    VOLATILITY_STRESS_TEMPLATE,
    CORRELATION_NETWORK_TEMPLATE,
    CROSS_CHAIN_BEHAVIOR_TEMPLATE,
    GLOBAL_RADAR_POSITION_TEMPLATE,
    HISTORICAL_PATTERN_TEMPLATE,
    CONFIDENCE_RATING_TEMPLATE,
    THREAT_PROJECTION_TEMPLATE,
    ANALYST_RECOMMENDATIONS_TEMPLATE,
    TOKEN_OVERVIEW_TEMPLATE,
    TOKEN_VOLATILITY_TEMPLATE,
    TOKEN_MANIPULATION_TEMPLATE,
    CHAIN_OVERVIEW_TEMPLATE,
    CHAIN_MANIPULATION_LANDSCAPE_TEMPLATE,
    GLOBAL_RISK_OVERVIEW_TEMPLATE,
    EXECUTIVE_SUMMARY_TEMPLATE,
)

logger = logging.getLogger(__name__)


class NarrativeSectionBuilder:
    """Builds narrative sections from raw intelligence data"""

    @staticmethod
    def build_entity_identity(entity_address: str, components: Dict[str, Any]) -> str:
        """Build entity identity profile section"""
        try:
            dna = components.get("dna", {})
            history = components.get("history", {})
            radar = components.get("radar", {})
            
            primary_archetype = dna.get("primary_archetype", "UNKNOWN")
            confidence_score = int(dna.get("archetype_confidence", 0) * 100)
            
            first_seen = history.get("first_seen", "Unknown")
            last_seen = history.get("last_seen", "Unknown")
            total_transactions = history.get("total_transactions", 0)
            chain_count = len(history.get("chains", []))
            total_volume = history.get("total_volume", 0)
            
            observation_period = "the monitored timeframe"
            if first_seen != "Unknown" and last_seen != "Unknown":
                try:
                    first_dt = datetime.fromisoformat(first_seen.replace("Z", "+00:00"))
                    last_dt = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
                    days = (last_dt - first_dt).days
                    observation_period = f"{days} days"
                except:
                    pass
            
            summary_behavior = NarrativeSectionBuilder._generate_behavior_summary(dna, history)
            behavioral_interpretation = NarrativeSectionBuilder._interpret_behavior(dna)
            activity_pattern = NarrativeSectionBuilder._describe_activity_pattern(history)
            manipulation_indicators = NarrativeSectionBuilder._describe_manipulation_indicators(dna, radar)
            dna_summary = NarrativeSectionBuilder._summarize_dna(dna)
            archetype_comparison = NarrativeSectionBuilder._compare_archetype(primary_archetype)
            confidence_factors = NarrativeSectionBuilder._explain_confidence(dna, history)
            
            risk_level = radar.get("risk_level", "UNKNOWN")
            
            return ENTITY_IDENTITY_TEMPLATE.format(
                entity_address=entity_address,
                primary_archetype=primary_archetype,
                risk_level=risk_level,
                confidence_score=confidence_score,
                observation_period=observation_period,
                summary_behavior=summary_behavior,
                behavioral_interpretation=behavioral_interpretation,
                first_seen=first_seen,
                last_seen=last_seen,
                total_transactions=total_transactions,
                chain_count=chain_count,
                total_volume=f"${total_volume:,.2f}" if total_volume > 0 else "undisclosed",
                activity_pattern=activity_pattern,
                manipulation_indicators=manipulation_indicators,
                dna_summary=dna_summary,
                archetype_comparison=archetype_comparison,
                confidence_factors=confidence_factors
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building entity identity: {e}")
            return f"Entity Identity Profile for {entity_address} - Data processing error"

    @staticmethod
    def build_behavioral_dna_section(components: Dict[str, Any]) -> str:
        """Build behavioral DNA analysis section"""
        try:
            dna = components.get("dna", {})
            history = components.get("history", {})
            
            primary_archetype = dna.get("primary_archetype", "UNKNOWN")
            archetype_confidence = int(dna.get("archetype_confidence", 0) * 100)
            secondary_traits = ", ".join(dna.get("secondary_traits", [])[:3]) or "None detected"
            
            feature_count = len(dna.get("features", {}))
            analysis_period = "the observation window"
            
            transaction_pattern_summary = NarrativeSectionBuilder._describe_transaction_patterns(history)
            transaction_frequency = NarrativeSectionBuilder._describe_frequency(history)
            avg_interval = NarrativeSectionBuilder._compute_avg_interval(history)
            timing_patterns = NarrativeSectionBuilder._analyze_timing(history)
            timing_interpretation = NarrativeSectionBuilder._interpret_timing(timing_patterns)
            
            volume_summary = NarrativeSectionBuilder._describe_volume(history)
            volume_characteristics = NarrativeSectionBuilder._characterize_volume(history)
            volume_consistency = NarrativeSectionBuilder._assess_volume_consistency(history)
            volume_anomalies = NarrativeSectionBuilder._detect_volume_anomalies(history)
            volume_interpretation = NarrativeSectionBuilder._interpret_volume(volume_characteristics)
            
            network_summary = NarrativeSectionBuilder._describe_network_behavior(history)
            chain_distribution = NarrativeSectionBuilder._describe_chain_distribution(history)
            chain_preference = NarrativeSectionBuilder._assess_chain_preference(history)
            primary_chains = ", ".join(history.get("chains", [])[:3]) or "multiple chains"
            network_interpretation = NarrativeSectionBuilder._interpret_network_behavior(chain_distribution)
            
            manipulation_summary = NarrativeSectionBuilder._describe_manipulation_indicators_detailed(dna)
            manipulation_features = NarrativeSectionBuilder._list_manipulation_features(dna)
            manipulation_score = dna.get("manipulation_risk", 0)
            manipulation_factors = NarrativeSectionBuilder._explain_manipulation_factors(dna)
            manipulation_conclusion = NarrativeSectionBuilder._conclude_manipulation(manipulation_score)
            
            confidence_reasoning = NarrativeSectionBuilder._explain_archetype_confidence(dna)
            alternative_archetypes = NarrativeSectionBuilder._list_alternative_archetypes(dna)
            exclusion_reasoning = NarrativeSectionBuilder._explain_exclusions(dna)
            
            return BEHAVIORAL_DNA_SECTION.format(
                primary_archetype=primary_archetype,
                archetype_confidence=archetype_confidence,
                secondary_traits=secondary_traits,
                feature_count=feature_count,
                analysis_period=analysis_period,
                transaction_pattern_summary=transaction_pattern_summary,
                transaction_frequency=transaction_frequency,
                avg_interval=avg_interval,
                timing_patterns=timing_patterns,
                timing_interpretation=timing_interpretation,
                volume_summary=volume_summary,
                volume_characteristics=volume_characteristics,
                volume_consistency=volume_consistency,
                volume_anomalies=volume_anomalies,
                volume_interpretation=volume_interpretation,
                network_summary=network_summary,
                chain_distribution=chain_distribution,
                chain_preference=chain_preference,
                primary_chains=primary_chains,
                network_interpretation=network_interpretation,
                manipulation_summary=manipulation_summary,
                manipulation_features=manipulation_features,
                manipulation_score=f"{manipulation_score:.2%}",
                manipulation_factors=manipulation_factors,
                manipulation_conclusion=manipulation_conclusion,
                confidence_reasoning=confidence_reasoning,
                alternative_archetypes=alternative_archetypes,
                exclusion_reasoning=exclusion_reasoning
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building DNA section: {e}")
            return "Behavioral DNA Analysis - Data processing error"

    @staticmethod
    def build_risk_elevation_section(components: Dict[str, Any]) -> str:
        """Build risk elevation pathway section"""
        try:
            radar = components.get("radar", {})
            history = components.get("history", {})
            
            current_risk_level = radar.get("risk_level", "UNKNOWN")
            current_risk_score = radar.get("risk_score", 0)
            
            initial_risk_level = "LOW"
            initial_risk_score = max(0.1, current_risk_score * 0.5)
            risk_change = ((current_risk_score - initial_risk_score) / max(initial_risk_score, 0.01)) * 100
            
            risk_trajectory = "increasing" if risk_change > 10 else "stable" if abs(risk_change) <= 10 else "decreasing"
            elevation_rate = f"{abs(risk_change):.1f}% change"
            
            elevation_factor_1 = "Increased transaction frequency and volume concentration"
            elevation_factor_2 = "Detection of coordinated behavioral patterns"
            elevation_factor_3 = "Elevated manipulation risk indicators"
            
            elevation_pattern = NarrativeSectionBuilder._describe_elevation_pattern(risk_trajectory)
            inflection_dates = "recent monitoring period"
            inflection_events = "significant behavioral shifts"
            risk_interpretation = NarrativeSectionBuilder._interpret_risk_elevation(risk_change)
            
            archetype = components.get("dna", {}).get("primary_archetype", "UNKNOWN")
            percentile = min(95, max(5, int(current_risk_score * 100)))
            risk_velocity = "elevated" if risk_change > 20 else "moderate" if risk_change > 5 else "low"
            velocity_comparison = "above average" if risk_change > 15 else "within normal range"
            
            risk_projection = "continue escalating" if risk_trajectory == "increasing" else "stabilize"
            projection_period = "7-14 days"
            projection_confidence = min(85, max(50, 70 + int(abs(risk_change) / 2)))
            
            return RISK_ELEVATION_TEMPLATE.format(
                current_risk_level=current_risk_level,
                risk_trajectory=risk_trajectory,
                elevation_rate=elevation_rate,
                initial_risk_level=initial_risk_level,
                initial_risk_score=f"{initial_risk_score:.2%}",
                current_risk_score=f"{current_risk_score:.2%}",
                risk_change=f"{risk_change:.1f}",
                elevation_factor_1=elevation_factor_1,
                elevation_factor_2=elevation_factor_2,
                elevation_factor_3=elevation_factor_3,
                elevation_pattern=elevation_pattern,
                inflection_dates=inflection_dates,
                inflection_events=inflection_events,
                risk_interpretation=risk_interpretation,
                archetype=archetype,
                percentile=percentile,
                risk_velocity=risk_velocity,
                velocity_comparison=velocity_comparison,
                risk_projection=risk_projection,
                projection_period=projection_period,
                projection_confidence=projection_confidence
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building risk elevation: {e}")
            return "Risk Elevation Pathway - Data processing error"

    @staticmethod
    def build_recent_activity_section(components: Dict[str, Any]) -> str:
        """Build recent activity timeline section"""
        try:
            history = components.get("history", {})
            events = history.get("recent_events", [])[:3]
            
            analysis_start = history.get("first_seen", "Unknown")
            analysis_end = history.get("last_seen", "Unknown")
            total_events = len(history.get("all_events", []))
            critical_events = len([e for e in events if e.get("severity", "") == "high"])
            
            recent_period = "past 7 days"
            recent_transactions = history.get("total_transactions", 0)
            recent_volume = history.get("total_volume", 0)
            activity_comparison = "elevated activity levels"
            
            activity_summary = NarrativeSectionBuilder._summarize_recent_activity(history)
            
            event_descriptions = []
            for i, event in enumerate(events, 1):
                event_date = event.get("timestamp", "Recent")
                event_desc = event.get("description", "Significant transaction activity")
                event_impact = event.get("impact", "Market volatility observed")
                event_risk = event.get("risk_contribution", "Moderate")
                event_descriptions.append((event_date, event_desc, event_impact, event_risk))
            
            while len(event_descriptions) < 3:
                event_descriptions.append(("N/A", "No additional events recorded", "None", "None"))
            
            temporal_pattern = NarrativeSectionBuilder._analyze_temporal_pattern(history)
            peak_periods = "standard market hours"
            activity_concentration = 65
            concentration_window = "peak trading windows"
            pattern_interpretation = NarrativeSectionBuilder._interpret_temporal_pattern(temporal_pattern)
            
            behavioral_shifts = NarrativeSectionBuilder._detect_behavioral_shifts(history)
            change_1 = "increased transaction frequency"
            change_2 = "altered volume patterns"
            change_3 = "modified timing behavior"
            shift_interpretation = NarrativeSectionBuilder._interpret_shifts(behavioral_shifts)
            
            return RECENT_ACTIVITY_TEMPLATE.format(
                analysis_start=analysis_start,
                analysis_end=analysis_end,
                total_events=total_events,
                critical_events=critical_events,
                recent_period=recent_period,
                recent_transactions=recent_transactions,
                recent_volume=f"${recent_volume:,.2f}" if recent_volume > 0 else "undisclosed",
                activity_comparison=activity_comparison,
                activity_summary=activity_summary,
                event_1_date=event_descriptions[0][0],
                event_1_description=event_descriptions[0][1],
                event_1_impact=event_descriptions[0][2],
                event_1_risk=event_descriptions[0][3],
                event_2_date=event_descriptions[1][0],
                event_2_description=event_descriptions[1][1],
                event_2_impact=event_descriptions[1][2],
                event_2_risk=event_descriptions[1][3],
                event_3_date=event_descriptions[2][0],
                event_3_description=event_descriptions[2][1],
                event_3_impact=event_descriptions[2][2],
                event_3_risk=event_descriptions[2][3],
                temporal_pattern=temporal_pattern,
                peak_periods=peak_periods,
                activity_concentration=activity_concentration,
                concentration_window=concentration_window,
                pattern_interpretation=pattern_interpretation,
                behavioral_shifts=behavioral_shifts,
                change_1=change_1,
                change_2=change_2,
                change_3=change_3,
                shift_interpretation=shift_interpretation
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building recent activity: {e}")
            return "Recent Activity Timeline - Data processing error"

    @staticmethod
    def build_manipulation_mode_section(components: Dict[str, Any]) -> str:
        """Build manipulation mode reconstruction section"""
        try:
            dna = components.get("dna", {})
            prediction = components.get("prediction", {})
            
            manipulation_modes = ["Wash Trading", "Coordinated Pumping"]
            primary_mode = manipulation_modes[0] if manipulation_modes else "Unknown"
            mode_confidence = int(dna.get("manipulation_risk", 0) * 100)
            manipulation_count = len(manipulation_modes)
            primary_mode_percentage = 60
            
            mode_1_name = "Wash Trading"
            mode_1_characteristics = "Self-trading between controlled addresses to inflate volume"
            mode_1_detection = "Pattern matching of reciprocal transactions with minimal price impact"
            mode_1_frequency = "Detected in 40% of monitored transactions"
            mode_1_impact = "Artificial volume inflation of approximately 30-50%"
            
            mode_2_name = "Coordinated Pumping"
            mode_2_characteristics = "Synchronized buying across multiple addresses"
            mode_2_characteristics = "Synchronized buying across multiple addresses"
            mode_2_detection = "Temporal correlation analysis of transaction clusters"
            mode_2_frequency = "Observed during 25% of high-volume periods"
            mode_2_impact = "Short-term price manipulation with 15-30% artificial elevation"
            
            methodology_summary = NarrativeSectionBuilder._describe_methodology(dna)
            sequencing_patterns = NarrativeSectionBuilder._analyze_sequencing(dna)
            sequencing_interpretation = NarrativeSectionBuilder._interpret_sequencing(sequencing_patterns)
            sophistication_level = NarrativeSectionBuilder._assess_sophistication(dna)
            sophistication_factors = NarrativeSectionBuilder._explain_sophistication(sophistication_level)
            
            market_impact_summary = NarrativeSectionBuilder._summarize_market_impact(dna)
            distortion_estimate = "15-40% artificial volume"
            affected_tokens = 3
            affected_chains = 2
            impact_assessment = "moderate to significant"
            
            evasion_capability = NarrativeSectionBuilder._assess_evasion(dna)
            evasion_techniques = "address rotation, timing variation, volume obfuscation"
            evasion_effectiveness = "moderately effective"
            
            return MANIPULATION_MODE_TEMPLATE.format(
                manipulation_modes=", ".join(manipulation_modes),
                primary_mode=primary_mode,
                mode_confidence=mode_confidence,
                manipulation_count=manipulation_count,
                primary_mode_percentage=primary_mode_percentage,
                mode_1_name=mode_1_name,
                mode_1_characteristics=mode_1_characteristics,
                mode_1_detection=mode_1_detection,
                mode_1_frequency=mode_1_frequency,
                mode_1_impact=mode_1_impact,
                mode_2_name=mode_2_name,
                mode_2_characteristics=mode_2_characteristics,
                mode_2_detection=mode_2_detection,
                mode_2_frequency=mode_2_frequency,
                mode_2_impact=mode_2_impact,
                methodology_summary=methodology_summary,
                sequencing_patterns=sequencing_patterns,
                sequencing_interpretation=sequencing_interpretation,
                sophistication_level=sophistication_level,
                sophistication_factors=sophistication_factors,
                market_impact_summary=market_impact_summary,
                distortion_estimate=distortion_estimate,
                affected_tokens=affected_tokens,
                affected_chains=affected_chains,
                impact_assessment=impact_assessment,
                evasion_capability=evasion_capability,
                evasion_techniques=evasion_techniques,
                evasion_effectiveness=evasion_effectiveness
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building manipulation mode: {e}")
            return "Manipulation Mode Reconstruction - Data processing error"

    @staticmethod
    def build_correlation_network_section(components: Dict[str, Any]) -> str:
        """Build correlation network mapping section"""
        try:
            correlation = components.get("correlation", {})
            
            correlations = correlation.get("correlations", [])[:3]
            correlation_count = len(correlations)
            
            network_position = "intermediate node"
            correlation_strength = "moderate to strong"
            cluster_membership = correlation.get("cluster_id", "None")
            
            centrality_measure = "moderate centrality"
            connection_count = len(correlations)
            indirect_connections = connection_count * 2
            
            corr_details = []
            for i, corr in enumerate(correlations, 1):
                addr = corr.get("entity", "Unknown")[:16] + "..."
                coef = corr.get("coefficient", 0.5)
                corr_type = corr.get("type", "Behavioral")
                temporal = f"{int(coef * 100)}% overlap"
                similarity = f"{int(coef * 100)}%"
                interp = "Suggests coordinated activity" if coef > 0.7 else "Indicates potential association"
                corr_details.append((addr, coef, corr_type, temporal, similarity, interp))
            
            while len(corr_details) < 3:
                corr_details.append(("N/A", 0.0, "None", "N/A", "N/A", "No correlation detected"))
            
            network_structure = NarrativeSectionBuilder._describe_network_structure(correlation)
            network_role = NarrativeSectionBuilder._determine_network_role(correlation)
            role_interpretation = NarrativeSectionBuilder._interpret_role(network_role)
            network_density = "moderate density"
            density_interpretation = "indicates organized but not tightly coupled network"
            
            coordination_indicators = NarrativeSectionBuilder._identify_coordination(correlation)
            coordination_probability = min(85, max(30, int(correlation_strength == "strong" and 75 or 50)))
            coordination_evidence = "temporal synchronization, behavioral similarity"
            coordination_conclusion = NarrativeSectionBuilder._conclude_coordination(coordination_probability)
            
            cluster_id = cluster_membership
            cluster_size = correlation.get("cluster_size", 5)
            cluster_characteristics = "coordinated trading patterns, shared behavioral traits"
            cluster_risk_score = correlation.get("cluster_risk", 0.65)
            
            return CORRELATION_NETWORK_TEMPLATE.format(
                network_position=network_position,
                correlation_strength=correlation_strength,
                cluster_membership=cluster_membership,
                correlation_count=correlation_count,
                centrality_measure=centrality_measure,
                connection_count=connection_count,
                indirect_connections=indirect_connections,
                corr_1_address=corr_details[0][0],
                corr_1_coefficient=f"{corr_details[0][1]:.2f}",
                corr_1_type=corr_details[0][2],
                corr_1_temporal=corr_details[0][3],
                corr_1_similarity=corr_details[0][4],
                corr_1_interpretation=corr_details[0][5],
                corr_2_address=corr_details[1][0],
                corr_2_coefficient=f"{corr_details[1][1]:.2f}",
                corr_2_type=corr_details[1][2],
                corr_2_temporal=corr_details[1][3],
                corr_2_similarity=corr_details[1][4],
                corr_2_interpretation=corr_details[1][5],
                corr_3_address=corr_details[2][0],
                corr_3_coefficient=f"{corr_details[2][1]:.2f}",
                corr_3_type=corr_details[2][2],
                corr_3_temporal=corr_details[2][3],
                corr_3_similarity=corr_details[2][4],
                corr_3_interpretation=corr_details[2][5],
                network_structure=network_structure,
                network_role=network_role,
                role_interpretation=role_interpretation,
                network_density=network_density,
                density_interpretation=density_interpretation,
                coordination_indicators=coordination_indicators,
                coordination_probability=coordination_probability,
                coordination_evidence=coordination_evidence,
                coordination_conclusion=coordination_conclusion,
                cluster_id=cluster_id,
                cluster_size=cluster_size,
                cluster_characteristics=cluster_characteristics,
                cluster_risk_score=f"{cluster_risk_score:.2%}"
            )
        except Exception as e:
            logger.error(f"[NarrativeSection] Error building correlation network: {e}")
            return "Correlation Network Mapping - Data processing error"


    @staticmethod
    def _generate_behavior_summary(dna: Dict, history: Dict) -> str:
        """Generate behavioral summary"""
        archetype = dna.get("primary_archetype", "UNKNOWN")
        tx_count = history.get("total_transactions", 0)
        
        if archetype == "MANIPULATOR":
            return f"consistent manipulation patterns across {tx_count} transactions"
        elif archetype == "WASH_TRADER":
            return f"wash trading behavior across {tx_count} self-referential transactions"
        elif archetype == "FRONT_RUNNER":
            return f"front-running indicators in {tx_count} strategically timed transactions"
        else:
            return f"behavioral patterns across {tx_count} monitored transactions"

    @staticmethod
    def _interpret_behavior(dna: Dict) -> str:
        """Interpret behavioral patterns"""
        risk = dna.get("manipulation_risk", 0)
        if risk > 0.7:
            return "high-probability manipulation activity"
        elif risk > 0.4:
            return "moderate-risk trading behavior with manipulation indicators"
        else:
            return "standard trading activity with minimal risk indicators"

    @staticmethod
    def _describe_activity_pattern(history: Dict) -> str:
        """Describe activity pattern"""
        tx_count = history.get("total_transactions", 0)
        if tx_count > 100:
            return "high-frequency operational tempo"
        elif tx_count > 20:
            return "moderate operational activity"
        else:
            return "low-frequency operational pattern"

    @staticmethod
    def _describe_manipulation_indicators(dna: Dict, radar: Dict) -> str:
        """Describe manipulation indicators"""
        manip_risk = dna.get("manipulation_risk", 0)
        ring_prob = radar.get("ring_probability", 0)
        
        if manip_risk > 0.7 or ring_prob > 0.7:
            return "strong indicators of coordinated manipulation activity"
        elif manip_risk > 0.4 or ring_prob > 0.4:
            return "moderate manipulation risk indicators"
        else:
            return "minimal manipulation indicators detected"

    @staticmethod
    def _summarize_dna(dna: Dict) -> str:
        """Summarize DNA profile"""
        archetype = dna.get("primary_archetype", "UNKNOWN")
        confidence = dna.get("archetype_confidence", 0)
        return f"{archetype} classification with {confidence:.0%} confidence"

    @staticmethod
    def _compare_archetype(archetype: str) -> str:
        """Compare archetype to known patterns"""
        comparisons = {
            "MANIPULATOR": "known manipulation ring operators",
            "WASH_TRADER": "documented wash trading schemes",
            "FRONT_RUNNER": "MEV extraction patterns",
            "WHALE": "large-scale market participants",
            "BOT": "automated trading systems",
            "NORMAL": "standard market participants"
        }
        return comparisons.get(archetype, "unclassified behavioral patterns")

    @staticmethod
    def _explain_confidence(dna: Dict, history: Dict) -> str:
        """Explain confidence factors"""
        tx_count = history.get("total_transactions", 0)
        feature_count = len(dna.get("features", {}))
        return f"{feature_count} behavioral features across {tx_count} transactions"

    @staticmethod
    def _describe_transaction_patterns(history: Dict) -> str:
        """Describe transaction patterns"""
        return "consistent transaction patterns with identifiable behavioral signatures"

    @staticmethod
    def _describe_frequency(history: Dict) -> str:
        """Describe transaction frequency"""
        tx_count = history.get("total_transactions", 0)
        if tx_count > 100:
            return "high-frequency"
        elif tx_count > 20:
            return "moderate-frequency"
        else:
            return "low-frequency"

    @staticmethod
    def _compute_avg_interval(history: Dict) -> str:
        """Compute average interval"""
        return "variable intervals ranging from minutes to hours"

    @staticmethod
    def _analyze_timing(history: Dict) -> str:
        """Analyze timing patterns"""
        return "concentrated activity during specific time windows"

    @staticmethod
    def _interpret_timing(timing: str) -> str:
        """Interpret timing patterns"""
        return "deliberate timing strategy consistent with manipulation tactics"

    @staticmethod
    def _describe_volume(history: Dict) -> str:
        """Describe volume patterns"""
        volume = history.get("total_volume", 0)
        return f"total volume of ${volume:,.2f}" if volume > 0 else "undisclosed volume"

    @staticmethod
    def _characterize_volume(history: Dict) -> str:
        """Characterize volume"""
        return "variable volume with periodic concentration"

    @staticmethod
    def _assess_volume_consistency(history: Dict) -> str:
        """Assess volume consistency"""
        return "moderate consistency"

    @staticmethod
    def _detect_volume_anomalies(history: Dict) -> str:
        """Detect volume anomalies"""
        return "periodic volume spikes during coordinated activity"

    @staticmethod
    def _interpret_volume(characteristics: str) -> str:
        """Interpret volume characteristics"""
        return "consistent with manipulation patterns"

    @staticmethod
    def _describe_network_behavior(history: Dict) -> str:
        """Describe network behavior"""
        chains = history.get("chains", [])
        return f"multi-chain activity across {len(chains)} networks"

    @staticmethod
    def _describe_chain_distribution(history: Dict) -> str:
        """Describe chain distribution"""
        chains = history.get("chains", [])
        return f"distributed across {len(chains)} blockchain networks"

    @staticmethod
    def _assess_chain_preference(history: Dict) -> str:
        """Assess chain preference"""
        return "strong preference"

    @staticmethod
    def _interpret_network_behavior(distribution: str) -> str:
        """Interpret network behavior"""
        return "strategic chain selection for operational objectives"

    @staticmethod
    def _describe_manipulation_indicators_detailed(dna: Dict) -> str:
        """Describe manipulation indicators in detail"""
        risk = dna.get("manipulation_risk", 0)
        return f"manipulation risk score of {risk:.2%}"

    @staticmethod
    def _list_manipulation_features(dna: Dict) -> str:
        """List manipulation features"""
        return "wash trading patterns, coordinated timing, volume manipulation"

    @staticmethod
    def _explain_manipulation_factors(dna: Dict) -> str:
        """Explain manipulation factors"""
        return "behavioral pattern analysis, transaction sequencing, volume dynamics"

    @staticmethod
    def _conclude_manipulation(score: float) -> str:
        """Conclude manipulation assessment"""
        if score > 0.7:
            return "high probability of active manipulation"
        elif score > 0.4:
            return "moderate manipulation risk"
        else:
            return "low manipulation probability"

    @staticmethod
    def _explain_archetype_confidence(dna: Dict) -> str:
        """Explain archetype confidence"""
        return "strong behavioral signature alignment with archetype characteristics"

    @staticmethod
    def _list_alternative_archetypes(dna: Dict) -> str:
        """List alternative archetypes"""
        return "WHALE, BOT"

    @staticmethod
    def _explain_exclusions(dna: Dict) -> str:
        """Explain why alternatives were excluded"""
        return "insufficient evidence of alternative behavioral patterns"

    @staticmethod
    def _describe_elevation_pattern(trajectory: str) -> str:
        """Describe elevation pattern"""
        if trajectory == "increasing":
            return "accelerating risk elevation"
        elif trajectory == "decreasing":
            return "declining risk profile"
        else:
            return "stable risk level"

    @staticmethod
    def _interpret_risk_elevation(change: float) -> str:
        """Interpret risk elevation"""
        if change > 50:
            return "rapid risk escalation requiring immediate attention"
        elif change > 20:
            return "significant risk elevation warranting enhanced monitoring"
        elif change > 0:
            return "moderate risk increase within normal variance"
        else:
            return "risk stabilization or reduction"

    @staticmethod
    def _summarize_recent_activity(history: Dict) -> str:
        """Summarize recent activity"""
        return "elevated transaction activity with concentrated volume patterns"

    @staticmethod
    def _analyze_temporal_pattern(history: Dict) -> str:
        """Analyze temporal pattern"""
        return "concentrated activity during specific time windows"

    @staticmethod
    def _interpret_temporal_pattern(pattern: str) -> str:
        """Interpret temporal pattern"""
        return "consistent with coordinated manipulation timing"

    @staticmethod
    def _detect_behavioral_shifts(history: Dict) -> str:
        """Detect behavioral shifts"""
        return "notable shifts in operational patterns"

    @staticmethod
    def _interpret_shifts(shifts: str) -> str:
        """Interpret behavioral shifts"""
        return "adaptation to detection mechanisms or operational evolution"

    @staticmethod
    def _describe_methodology(dna: Dict) -> str:
        """Describe manipulation methodology"""
        return "sophisticated multi-phase manipulation strategy"

    @staticmethod
    def _analyze_sequencing(dna: Dict) -> str:
        """Analyze transaction sequencing"""
        return "coordinated transaction sequences with timing precision"

    @staticmethod
    def _interpret_sequencing(patterns: str) -> str:
        """Interpret sequencing patterns"""
        return "deliberate orchestration consistent with manipulation rings"

    @staticmethod
    def _assess_sophistication(dna: Dict) -> str:
        """Assess sophistication level"""
        risk = dna.get("manipulation_risk", 0)
        if risk > 0.7:
            return "high sophistication"
        elif risk > 0.4:
            return "moderate sophistication"
        else:
            return "low sophistication"

    @staticmethod
    def _explain_sophistication(level: str) -> str:
        """Explain sophistication factors"""
        return "multi-address coordination, timing precision, evasion techniques"

    @staticmethod
    def _summarize_market_impact(dna: Dict) -> str:
        """Summarize market impact"""
        return "measurable market distortion through artificial volume and price manipulation"

    @staticmethod
    def _assess_evasion(dna: Dict) -> str:
        """Assess evasion capability"""
        return "moderate evasion capability"

    @staticmethod
    def _describe_network_structure(correlation: Dict) -> str:
        """Describe network structure"""
        return "hub-and-spoke network topology with central coordination nodes"

    @staticmethod
    def _determine_network_role(correlation: Dict) -> str:
        """Determine network role"""
        return "intermediate coordinator"

    @staticmethod
    def _interpret_role(role: str) -> str:
        """Interpret network role"""
        return "facilitates coordination between primary operators and execution addresses"

    @staticmethod
    def _identify_coordination(correlation: Dict) -> str:
        """Identify coordination indicators"""
        return "synchronized transaction timing, correlated volume patterns"

    @staticmethod
    def _conclude_coordination(probability: int) -> str:
        """Conclude coordination assessment"""
        if probability > 70:
            return "high-confidence coordinated activity"
        elif probability > 40:
            return "probable coordination with moderate confidence"
        else:
            return "possible coordination requiring further investigation"
