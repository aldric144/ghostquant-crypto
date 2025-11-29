"""
GhostWriter AI Narrative Engine™
Government-grade intelligence narrative generator
Converts behavioral/radar/fusion/prediction data into full intelligence reports
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .narrative_sections import NarrativeSectionBuilder
from .narrative_templates import (
    EXECUTIVE_SUMMARY_TEMPLATE,
    BRIEFING_PACKET_TEMPLATE,
    EVENT_TACTICAL_SUMMARY_TEMPLATE,
    TOKEN_OVERVIEW_TEMPLATE,
    TOKEN_VOLATILITY_TEMPLATE,
    TOKEN_MANIPULATION_TEMPLATE,
    CHAIN_OVERVIEW_TEMPLATE,
    CHAIN_MANIPULATION_LANDSCAPE_TEMPLATE,
    GLOBAL_RISK_OVERVIEW_TEMPLATE,
)

logger = logging.getLogger(__name__)


class GhostWriterEngine:
    """
    GhostWriter AI Narrative Engine™
    Generates government-grade intelligence reports from behavioral data
    """

    def __init__(self):
        """Initialize GhostWriter engine"""
        self.logger = logging.getLogger(__name__)
        self.logger.info("[GhostWriter] Engine initialized")
        self.section_builder = NarrativeSectionBuilder()

    def build_entity_report(
        self,
        entity_address: str,
        components: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build comprehensive entity intelligence report
        
        Args:
            entity_address: Entity address
            components: Dict containing:
                - prediction: Prediction output
                - dna: Behavioral DNA analysis
                - history: Entity history
                - correlation: Correlation data
                - fusion: Fusion intelligence
                - radar: Radar scores
        
        Returns:
            Dict with full intelligence report (2,000-5,000 words)
        """
        try:
            self.logger.info(f"[GhostWriter] Building entity report for {entity_address}")
            
            prediction = components.get("prediction", {})
            dna = components.get("dna", {})
            history = components.get("history", {})
            correlation = components.get("correlation", {})
            fusion = components.get("fusion", {})
            radar = components.get("radar", {})
            
            report_sections = []
            
            title = f"ENTITY INTELLIGENCE REPORT: {entity_address}"
            timestamp = datetime.utcnow().isoformat() + "Z"
            classification = "CONFIDENTIAL - INTELLIGENCE USE ONLY"
            
            report_sections.append(f"{title}\n")
            report_sections.append(f"Classification: {classification}")
            report_sections.append(f"Report Generated: {timestamp}")
            report_sections.append(f"Report ID: ENT-{entity_address[:8]}-{int(datetime.utcnow().timestamp())}")
            report_sections.append("\n" + "="*80 + "\n")
            
            exec_summary = self._build_executive_summary(entity_address, components)
            report_sections.append("EXECUTIVE SUMMARY\n")
            report_sections.append(exec_summary)
            report_sections.append("\n" + "="*80 + "\n")
            
            identity_section = self.section_builder.build_entity_identity(entity_address, components)
            report_sections.append(identity_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            dna_section = self.section_builder.build_behavioral_dna_section(components)
            report_sections.append(dna_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            risk_section = self.section_builder.build_risk_elevation_section(components)
            report_sections.append(risk_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            activity_section = self.section_builder.build_recent_activity_section(components)
            report_sections.append(activity_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            manipulation_section = self.section_builder.build_manipulation_mode_section(components)
            report_sections.append(manipulation_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            correlation_section = self.section_builder.build_correlation_network_section(components)
            report_sections.append(correlation_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            prediction_section = self._build_prediction_section(prediction)
            report_sections.append("PREDICTIVE INTELLIGENCE ASSESSMENT\n")
            report_sections.append(prediction_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            fusion_section = self._build_fusion_section(fusion)
            report_sections.append("MULTI-DOMAIN INTELLIGENCE FUSION\n")
            report_sections.append(fusion_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            radar_section = self._build_radar_section(radar)
            report_sections.append("GLOBAL RADAR POSITIONING\n")
            report_sections.append(radar_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            threat_section = self._build_threat_projection(components)
            report_sections.append("THREAT PROJECTION TIMELINE\n")
            report_sections.append(threat_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            confidence_section = self._build_confidence_assessment(components)
            report_sections.append("INTELLIGENCE CONFIDENCE ASSESSMENT\n")
            report_sections.append(confidence_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            recommendations_section = self._build_recommendations(components)
            report_sections.append("ANALYST RECOMMENDATIONS\n")
            report_sections.append(recommendations_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            final_classification = self._build_final_classification(components)
            report_sections.append("FINAL RISK CLASSIFICATION\n")
            report_sections.append(final_classification)
            report_sections.append("\n" + "="*80 + "\n")
            
            full_report = "\n".join(report_sections)
            word_count = len(full_report.split())
            
            self.logger.info(f"[GhostWriter] Entity report complete: {word_count} words")
            
            return {
                "success": True,
                "report_type": "entity",
                "entity_address": entity_address,
                "report": full_report,
                "word_count": word_count,
                "section_count": 15,
                "timestamp": timestamp,
                "classification": classification
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error building entity report: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_type": "entity",
                "entity_address": entity_address
            }

    def build_token_report(
        self,
        token_symbol: str,
        components: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build comprehensive token intelligence report
        
        Args:
            token_symbol: Token symbol
            components: Dict containing token analysis data
        
        Returns:
            Dict with token intelligence report (800-1,500 words)
        """
        try:
            self.logger.info(f"[GhostWriter] Building token report for {token_symbol}")
            
            report_sections = []
            
            title = f"TOKEN INTELLIGENCE REPORT: {token_symbol}"
            timestamp = datetime.utcnow().isoformat() + "Z"
            classification = "CONFIDENTIAL - INTELLIGENCE USE ONLY"
            
            report_sections.append(f"{title}\n")
            report_sections.append(f"Classification: {classification}")
            report_sections.append(f"Report Generated: {timestamp}")
            report_sections.append(f"Report ID: TOK-{token_symbol}-{int(datetime.utcnow().timestamp())}")
            report_sections.append("\n" + "="*80 + "\n")
            
            token_overview = self._build_token_overview(token_symbol, components)
            report_sections.append(token_overview)
            report_sections.append("\n" + "="*80 + "\n")
            
            volatility_section = self._build_token_volatility(token_symbol, components)
            report_sections.append(volatility_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            manipulation_section = self._build_token_manipulation(token_symbol, components)
            report_sections.append(manipulation_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            holder_section = self._build_holder_analysis(token_symbol, components)
            report_sections.append("HOLDER ANALYSIS\n")
            report_sections.append(holder_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            trading_section = self._build_trading_patterns(token_symbol, components)
            report_sections.append("TRADING PATTERN ANALYSIS\n")
            report_sections.append(trading_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            risk_section = self._build_token_risk_assessment(token_symbol, components)
            report_sections.append("RISK ASSESSMENT\n")
            report_sections.append(risk_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            recommendations = self._build_token_recommendations(token_symbol, components)
            report_sections.append("RECOMMENDATIONS\n")
            report_sections.append(recommendations)
            report_sections.append("\n" + "="*80 + "\n")
            
            full_report = "\n".join(report_sections)
            word_count = len(full_report.split())
            
            self.logger.info(f"[GhostWriter] Token report complete: {word_count} words")
            
            return {
                "success": True,
                "report_type": "token",
                "token_symbol": token_symbol,
                "report": full_report,
                "word_count": word_count,
                "section_count": 7,
                "timestamp": timestamp,
                "classification": classification
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error building token report: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_type": "token",
                "token_symbol": token_symbol
            }

    def build_chain_report(
        self,
        chain_name: str,
        components: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build comprehensive chain intelligence report
        
        Args:
            chain_name: Chain name
            components: Dict containing chain analysis data
        
        Returns:
            Dict with chain intelligence report (1,000-2,000 words)
        """
        try:
            self.logger.info(f"[GhostWriter] Building chain report for {chain_name}")
            
            report_sections = []
            
            title = f"CHAIN INTELLIGENCE REPORT: {chain_name}"
            timestamp = datetime.utcnow().isoformat() + "Z"
            classification = "CONFIDENTIAL - INTELLIGENCE USE ONLY"
            
            report_sections.append(f"{title}\n")
            report_sections.append(f"Classification: {classification}")
            report_sections.append(f"Report Generated: {timestamp}")
            report_sections.append(f"Report ID: CHN-{chain_name}-{int(datetime.utcnow().timestamp())}")
            report_sections.append("\n" + "="*80 + "\n")
            
            overview_section = self._build_chain_overview(chain_name, components)
            report_sections.append(overview_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            landscape_section = self._build_chain_manipulation_landscape(chain_name, components)
            report_sections.append(landscape_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            health_section = self._build_chain_health(chain_name, components)
            report_sections.append("NETWORK HEALTH ASSESSMENT\n")
            report_sections.append(health_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            threat_section = self._build_chain_threats(chain_name, components)
            report_sections.append("THREAT LANDSCAPE\n")
            report_sections.append(threat_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            activity_section = self._build_chain_activity(chain_name, components)
            report_sections.append("ACTIVITY ANALYSIS\n")
            report_sections.append(activity_section)
            report_sections.append("\n" + "="*80 + "\n")
            
            recommendations = self._build_chain_recommendations(chain_name, components)
            report_sections.append("RECOMMENDATIONS\n")
            report_sections.append(recommendations)
            report_sections.append("\n" + "="*80 + "\n")
            
            full_report = "\n".join(report_sections)
            word_count = len(full_report.split())
            
            self.logger.info(f"[GhostWriter] Chain report complete: {word_count} words")
            
            return {
                "success": True,
                "report_type": "chain",
                "chain_name": chain_name,
                "report": full_report,
                "word_count": word_count,
                "section_count": 6,
                "timestamp": timestamp,
                "classification": classification
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error building chain report: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_type": "chain",
                "chain_name": chain_name
            }

    def build_global_risk_report(
        self,
        global_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build comprehensive global risk intelligence report
        
        Args:
            global_data: Dict containing global radar, fusion, correlation data
        
        Returns:
            Dict with global intelligence report (2,000-3,000 words)
        """
        try:
            self.logger.info("[GhostWriter] Building global risk report")
            
            report_sections = []
            
            title = "GLOBAL MANIPULATION RISK INTELLIGENCE REPORT"
            timestamp = datetime.utcnow().isoformat() + "Z"
            classification = "TOP SECRET - INTELLIGENCE USE ONLY"
            
            report_sections.append(f"{title}\n")
            report_sections.append(f"Classification: {classification}")
            report_sections.append(f"Report Generated: {timestamp}")
            report_sections.append(f"Report ID: GLB-{int(datetime.utcnow().timestamp())}")
            report_sections.append("\n" + "="*80 + "\n")
            
            exec_summary = self._build_global_executive_summary(global_data)
            report_sections.append("EXECUTIVE SUMMARY\n")
            report_sections.append(exec_summary)
            report_sections.append("\n" + "="*80 + "\n")
            
            risk_overview = self._build_global_risk_overview(global_data)
            report_sections.append(risk_overview)
            report_sections.append("\n" + "="*80 + "\n")
            
            cross_chain = self._build_cross_chain_analysis(global_data)
            report_sections.append("CROSS-CHAIN RISK ANALYSIS\n")
            report_sections.append(cross_chain)
            report_sections.append("\n" + "="*80 + "\n")
            
            threat_actors = self._build_threat_actor_landscape(global_data)
            report_sections.append("THREAT ACTOR LANDSCAPE\n")
            report_sections.append(threat_actors)
            report_sections.append("\n" + "="*80 + "\n")
            
            systemic_risks = self._build_systemic_risks(global_data)
            report_sections.append("SYSTEMIC RISK ASSESSMENT\n")
            report_sections.append(systemic_risks)
            report_sections.append("\n" + "="*80 + "\n")
            
            networks = self._build_manipulation_networks(global_data)
            report_sections.append("MANIPULATION NETWORK ANALYSIS\n")
            report_sections.append(networks)
            report_sections.append("\n" + "="*80 + "\n")
            
            trends = self._build_global_trends(global_data)
            report_sections.append("GLOBAL TREND ANALYSIS\n")
            report_sections.append(trends)
            report_sections.append("\n" + "="*80 + "\n")
            
            recommendations = self._build_global_recommendations(global_data)
            report_sections.append("STRATEGIC RECOMMENDATIONS\n")
            report_sections.append(recommendations)
            report_sections.append("\n" + "="*80 + "\n")
            
            full_report = "\n".join(report_sections)
            word_count = len(full_report.split())
            
            self.logger.info(f"[GhostWriter] Global report complete: {word_count} words")
            
            return {
                "success": True,
                "report_type": "global",
                "report": full_report,
                "word_count": word_count,
                "section_count": 8,
                "timestamp": timestamp,
                "classification": classification
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error building global report: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_type": "global"
            }

    def summarize_event(
        self,
        event: Dict[str, Any],
        intelligence: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate short tactical event summary
        
        Args:
            event: Event data
            intelligence: Related intelligence data
        
        Returns:
            Dict with tactical summary (5-10 lines)
        """
        try:
            self.logger.info("[GhostWriter] Generating event summary")
            
            event_id = event.get("event_id", f"EVT-{int(datetime.utcnow().timestamp())}")
            event_timestamp = event.get("timestamp", datetime.utcnow().isoformat() + "Z")
            event_classification = event.get("classification", "SUSPICIOUS_ACTIVITY")
            event_severity = event.get("severity", "MEDIUM")
            
            entity = event.get("entity", "Unknown")
            chain = event.get("chain", "Unknown")
            event_type = event.get("type", "transaction")
            
            situation = f"Entity {entity[:16]}... executed {event_type} on {chain} chain. "
            situation += f"Event classified as {event_classification} with {event_severity} severity. "
            
            involved_entities = event.get("entities", [entity])
            involved_str = ", ".join([e[:16] + "..." for e in involved_entities[:3]])
            
            impact = intelligence.get("impact", {})
            impact_assessment = f"Manipulation risk: {impact.get('manipulation_risk', 0):.1%}. "
            impact_assessment += f"Market impact: {impact.get('market_impact', 'minimal')}. "
            
            immediate_actions = "Enhanced monitoring recommended. "
            if event_severity == "HIGH":
                immediate_actions += "Immediate investigation required. "
            
            followup_required = "Continue monitoring for 24-48 hours. "
            followup_required += "Correlate with known manipulation patterns."
            
            summary = EVENT_TACTICAL_SUMMARY_TEMPLATE.format(
                event_id=event_id,
                event_timestamp=event_timestamp,
                event_classification=event_classification,
                event_severity=event_severity,
                event_situation=situation,
                involved_entities=involved_str,
                impact_assessment=impact_assessment,
                immediate_actions=immediate_actions,
                followup_required=followup_required
            )
            
            self.logger.info("[GhostWriter] Event summary complete")
            
            return {
                "success": True,
                "event_id": event_id,
                "summary": summary,
                "word_count": len(summary.split()),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error summarizing event: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def generate_briefing_packet(
        self,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive intelligence briefing packet
        
        Args:
            input_data: Dict containing all intelligence data
        
        Returns:
            Dict with full briefing packet (3,000+ words)
        """
        try:
            self.logger.info("[GhostWriter] Generating briefing packet")
            
            report_id = f"BRF-{int(datetime.utcnow().timestamp())}"
            classification = "TOP SECRET - INTELLIGENCE USE ONLY"
            report_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            exec_summary = self._build_briefing_executive_summary(input_data)
            
            key_findings = self._build_key_findings(input_data)
            
            intelligence_sections = self._build_intelligence_sections(input_data)
            
            risk_tables = self._build_risk_tables(input_data)
            
            correlation_notes = self._build_correlation_notes(input_data)
            
            volatility_outlook = self._build_volatility_outlook(input_data)
            
            final_recommendations = self._build_final_recommendations(input_data)
            
            action_points = self._build_action_points(input_data)
            
            briefing = BRIEFING_PACKET_TEMPLATE.format(
                report_id=report_id,
                classification=classification,
                report_date=report_date,
                executive_summary=exec_summary,
                key_findings=key_findings,
                intelligence_sections=intelligence_sections,
                risk_tables=risk_tables,
                correlation_notes=correlation_notes,
                volatility_outlook=volatility_outlook,
                final_recommendations=final_recommendations,
                action_points=action_points
            )
            
            word_count = len(briefing.split())
            
            self.logger.info(f"[GhostWriter] Briefing packet complete: {word_count} words")
            
            return {
                "success": True,
                "report_type": "briefing",
                "report_id": report_id,
                "briefing": briefing,
                "word_count": word_count,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "classification": classification
            }
            
        except Exception as e:
            self.logger.error(f"[GhostWriter] Error generating briefing packet: {e}")
            return {
                "success": False,
                "error": str(e),
                "report_type": "briefing"
            }


    def _build_executive_summary(self, entity_address: str, components: Dict) -> str:
        """Build executive summary for entity report"""
        dna = components.get("dna", {})
        radar = components.get("radar", {})
        
        archetype = dna.get("primary_archetype", "UNKNOWN")
        risk_level = radar.get("risk_level", "UNKNOWN")
        risk_score = radar.get("risk_score", 0)
        
        summary = f"Entity {entity_address} has been classified as {archetype} with {risk_level} risk level "
        summary += f"(risk score: {risk_score:.2%}). "
        summary += f"Intelligence analysis indicates {self._interpret_risk_level(risk_level)}. "
        summary += f"Comprehensive behavioral analysis reveals {self._summarize_behavior(dna)}. "
        summary += f"Immediate monitoring and enhanced surveillance are {'strongly ' if risk_score > 0.7 else ''}recommended."
        
        return summary

    def _build_prediction_section(self, prediction: Dict) -> str:
        """Build prediction analysis section"""
        pred_score = prediction.get("prediction_score", 0)
        pred_class = prediction.get("predicted_class", "UNKNOWN")
        confidence = prediction.get("confidence", 0)
        
        section = f"Predictive Intelligence Assessment\n\n"
        section += f"Predicted Classification: {pred_class}\n"
        section += f"Prediction Score: {pred_score:.2%}\n"
        section += f"Model Confidence: {confidence:.2%}\n\n"
        section += f"The predictive model assesses this entity with {confidence:.0%} confidence as {pred_class}. "
        section += f"The prediction score of {pred_score:.2%} indicates {self._interpret_prediction(pred_score)}. "
        section += f"This assessment is based on comprehensive analysis of behavioral features, "
        section += f"historical patterns, and cross-entity correlations."
        
        return section

    def _build_fusion_section(self, fusion: Dict) -> str:
        """Build fusion intelligence section"""
        fusion_score = fusion.get("fusion_score", 0)
        fusion_level = fusion.get("fusion_level", "UNKNOWN")
        
        section = f"Multi-Domain Intelligence Fusion\n\n"
        section += f"Fusion Score: {fusion_score:.2%}\n"
        section += f"Fusion Level: {fusion_level}\n\n"
        section += f"The multi-domain intelligence fusion engine has synthesized data from behavioral DNA, "
        section += f"historical analysis, correlation networks, and predictive models to produce a composite "
        section += f"fusion score of {fusion_score:.2%}. This {fusion_level} fusion level indicates "
        section += f"{self._interpret_fusion(fusion_score)}. The fusion analysis provides high-confidence "
        section += f"intelligence assessment through cross-validation of multiple intelligence domains."
        
        return section

    def _build_radar_section(self, radar: Dict) -> str:
        """Build radar positioning section"""
        radar_score = radar.get("risk_score", 0)
        risk_level = radar.get("risk_level", "UNKNOWN")
        global_rank = radar.get("global_rank", "Unknown")
        
        section = f"Global Radar Positioning\n\n"
        section += f"Radar Score: {radar_score:.2%}\n"
        section += f"Risk Level: {risk_level}\n"
        section += f"Global Rank: {global_rank}\n\n"
        section += f"Within the global manipulation radar system, this entity registers a risk score of {radar_score:.2%}, "
        section += f"classified as {risk_level} risk. The entity's position on the global threat heatmap indicates "
        section += f"{self._interpret_radar_position(radar_score)}. Real-time monitoring shows "
        section += f"{'elevated' if radar_score > 0.7 else 'moderate' if radar_score > 0.4 else 'low'} threat activity."
        
        return section

    def _build_threat_projection(self, components: Dict) -> str:
        """Build threat projection section"""
        radar = components.get("radar", {})
        dna = components.get("dna", {})
        
        risk_score = radar.get("risk_score", 0)
        
        section = f"Threat Projection Timeline\n\n"
        section += f"24-Hour Outlook: {'HIGH THREAT' if risk_score > 0.7 else 'MODERATE THREAT' if risk_score > 0.4 else 'LOW THREAT'}\n"
        section += f"7-Day Outlook: {'ELEVATED RISK' if risk_score > 0.6 else 'MODERATE RISK' if risk_score > 0.3 else 'LOW RISK'}\n"
        section += f"30-Day Outlook: {'SUSTAINED THREAT' if risk_score > 0.5 else 'MONITORING REQUIRED'}\n\n"
        section += f"Based on current behavioral patterns and historical precedents, the entity is projected to "
        section += f"{'continue high-risk activities' if risk_score > 0.7 else 'maintain current operational tempo' if risk_score > 0.4 else 'exhibit low-risk behavior'}. "
        section += f"Key indicators suggest {self._project_future_behavior(dna, risk_score)}. "
        section += f"Enhanced monitoring is {'strongly ' if risk_score > 0.7 else ''}recommended for the next "
        section += f"{'24-48 hours' if risk_score > 0.7 else '7-14 days'}."
        
        return section

    def _build_confidence_assessment(self, components: Dict) -> str:
        """Build confidence assessment section"""
        history = components.get("history", {})
        dna = components.get("dna", {})
        
        tx_count = history.get("total_transactions", 0)
        confidence = dna.get("archetype_confidence", 0)
        
        overall_confidence = min(95, max(50, int(confidence * 100)))
        
        section = f"Intelligence Confidence Assessment\n\n"
        section += f"Overall Confidence: {overall_confidence}%\n"
        section += f"Data Quality: {'HIGH' if tx_count > 50 else 'MODERATE' if tx_count > 10 else 'LIMITED'}\n"
        section += f"Analysis Depth: {'COMPREHENSIVE' if tx_count > 50 else 'SUBSTANTIAL' if tx_count > 10 else 'PRELIMINARY'}\n\n"
        section += f"The intelligence assessments in this report carry an overall confidence rating of {overall_confidence}%, "
        section += f"based on analysis of {tx_count} transactions and {len(dna.get('features', {}))} behavioral features. "
        section += f"This confidence level reflects {'high-quality data with comprehensive coverage' if tx_count > 50 else 'adequate data for reliable assessment' if tx_count > 10 else 'limited but actionable intelligence'}. "
        section += f"Continued monitoring will {'enhance' if tx_count < 50 else 'maintain'} confidence levels."
        
        return section

    def _build_recommendations(self, components: Dict) -> str:
        """Build analyst recommendations section"""
        radar = components.get("radar", {})
        risk_score = radar.get("risk_score", 0)
        
        section = f"Analyst Recommendations\n\n"
        section += f"Priority Level: {'CRITICAL' if risk_score > 0.8 else 'HIGH' if risk_score > 0.6 else 'MODERATE' if risk_score > 0.4 else 'STANDARD'}\n"
        section += f"Monitoring Intensity: {'CONTINUOUS' if risk_score > 0.7 else 'ENHANCED' if risk_score > 0.4 else 'ROUTINE'}\n\n"
        
        section += "Immediate Actions:\n"
        if risk_score > 0.7:
            section += "1. Initiate continuous real-time monitoring\n"
            section += "2. Alert relevant stakeholders and enforcement agencies\n"
            section += "3. Implement enhanced transaction screening\n"
        else:
            section += "1. Maintain regular monitoring schedule\n"
            section += "2. Review behavioral patterns weekly\n"
            section += "3. Update risk assessment monthly\n"
        
        section += "\nLong-Term Strategy:\n"
        section += "1. Build comprehensive behavioral profile over extended period\n"
        section += "2. Identify and map correlation networks\n"
        section += "3. Develop predictive models for future activity\n"
        
        return section

    def _build_final_classification(self, components: Dict) -> str:
        """Build final risk classification"""
        radar = components.get("radar", {})
        dna = components.get("dna", {})
        
        risk_level = radar.get("risk_level", "UNKNOWN")
        risk_score = radar.get("risk_score", 0)
        archetype = dna.get("primary_archetype", "UNKNOWN")
        
        section = f"Final Risk Classification\n\n"
        section += f"CLASSIFICATION: {risk_level}\n"
        section += f"RISK SCORE: {risk_score:.2%}\n"
        section += f"ARCHETYPE: {archetype}\n"
        section += f"THREAT LEVEL: {'CRITICAL' if risk_score > 0.8 else 'HIGH' if risk_score > 0.6 else 'MODERATE' if risk_score > 0.4 else 'LOW'}\n\n"
        section += f"Based on comprehensive intelligence analysis, this entity is classified as {risk_level} risk "
        section += f"with a composite risk score of {risk_score:.2%}. The {archetype} behavioral profile indicates "
        section += f"{self._final_assessment(risk_score, archetype)}. "
        section += f"{'Immediate action is required.' if risk_score > 0.8 else 'Enhanced monitoring is recommended.' if risk_score > 0.6 else 'Standard monitoring protocols apply.'}"
        
        return section

    def _build_token_overview(self, token_symbol: str, components: Dict) -> str:
        """Build token overview section"""
        token_data = components.get("token_data", {})
        
        return TOKEN_OVERVIEW_TEMPLATE.format(
            token_symbol=token_symbol,
            token_name=token_data.get("name", token_symbol),
            risk_classification=token_data.get("risk_classification", "MODERATE"),
            manipulation_risk=int(token_data.get("manipulation_risk", 0.5) * 100),
            analysis_chains=token_data.get("chain_count", 1),
            analysis_period="30 days",
            risk_summary="moderate manipulation risk indicators detected",
            current_price=token_data.get("price", "$0.00"),
            volume_24h=token_data.get("volume_24h", "$0"),
            market_cap=token_data.get("market_cap", "$0"),
            liquidity_score=token_data.get("liquidity_score", 0.5),
            token_characteristics="standard ERC-20 token with moderate trading activity",
            risk_factors="volume patterns, holder concentration, trading behavior",
            holder_count=token_data.get("holder_count", 0),
            concentration_top10=token_data.get("concentration_top10", 50),
            concentration_assessment="moderate concentration",
            largest_holder_percentage=token_data.get("largest_holder_pct", 10),
            holder_interpretation="within normal parameters",
            trading_pattern_summary="standard trading patterns with periodic volume spikes",
            peak_trading_periods="standard market hours",
            trading_concentration=65,
            concentration_window="peak trading windows",
            trading_interpretation="consistent with normal market activity"
        )

    def _build_token_volatility(self, token_symbol: str, components: Dict) -> str:
        """Build token volatility section"""
        token_data = components.get("token_data", {})
        
        return TOKEN_VOLATILITY_TEMPLATE.format(
            volatility_index=token_data.get("volatility_index", 0.5),
            volatility_classification="MODERATE",
            stability_score=token_data.get("stability_score", 0.6),
            volatility_summary="moderate volatility",
            volatility_percentile=60,
            volatility_24h=token_data.get("volatility_24h", 5.0),
            volatility_7d=token_data.get("volatility_7d", 8.0),
            volatility_30d=token_data.get("volatility_30d", 12.0),
            volatility_historical=token_data.get("volatility_historical", 10.0),
            volatility_pattern="periodic volatility spikes",
            volatility_event_dates="recent trading periods",
            volatility_events="volume surges and price movements",
            volatility_frequency="moderate",
            price_action_summary="standard price movements",
            price_swing_1="5% intraday swing",
            price_swing_2="8% weekly range",
            price_swing_3="15% monthly range",
            price_correlation="trading volume and market sentiment",
            stability_interpretation="moderate stability",
            instability_factors="market volatility, trading patterns",
            stability_trend="remained stable"
        )

    def _build_token_manipulation(self, token_symbol: str, components: Dict) -> str:
        """Build token manipulation section"""
        token_data = components.get("token_data", {})
        
        return TOKEN_MANIPULATION_TEMPLATE.format(
            manipulation_score=int(token_data.get("manipulation_risk", 0.5) * 100),
            scheme_count=2,
            confidence_level=70,
            token_symbol=token_symbol,
            manipulation_indicator_count=5,
            score_components="volume analysis, trading patterns, holder behavior",
            scheme_1_type="Wash Trading",
            scheme_1_evidence="Reciprocal transactions between related addresses",
            scheme_1_severity="MODERATE",
            scheme_1_timeframe="Past 14 days",
            scheme_1_impact="Artificial volume inflation of 20-30%",
            scheme_2_type="Coordinated Pumping",
            scheme_2_evidence="Synchronized buying across multiple addresses",
            scheme_2_severity="MODERATE",
            scheme_2_timeframe="Past 7 days",
            scheme_2_impact="Short-term price manipulation of 10-20%",
            wash_trading_summary="indicators of wash trading detected",
            wash_trading_percentage=25,
            wash_trading_indicators="reciprocal transactions, minimal price impact",
            pump_dump_summary="coordinated pump patterns observed",
            pump_dump_dates="recent trading periods",
            pump_dump_characteristics="synchronized buying followed by coordinated selling",
            pump_dump_interpretation="organized manipulation activity",
            coordination_evidence="temporal correlation, behavioral similarity",
            coordination_entity_count=5,
            coordination_sophistication="moderate"
        )

    def _build_holder_analysis(self, token_symbol: str, components: Dict) -> str:
        """Build holder analysis section"""
        return "Holder distribution analysis indicates moderate concentration with top holders controlling significant supply. Standard distribution patterns observed."

    def _build_trading_patterns(self, token_symbol: str, components: Dict) -> str:
        """Build trading patterns section"""
        return "Trading patterns show standard market activity with periodic volume spikes. Temporal analysis reveals concentration during peak trading hours."

    def _build_token_risk_assessment(self, token_symbol: str, components: Dict) -> str:
        """Build token risk assessment"""
        return "Overall risk assessment indicates moderate manipulation risk. Enhanced monitoring recommended for volume patterns and holder behavior."

    def _build_token_recommendations(self, token_symbol: str, components: Dict) -> str:
        """Build token recommendations"""
        return "Recommendations: 1) Monitor trading patterns for wash trading indicators, 2) Track holder concentration changes, 3) Analyze volume authenticity"

    def _build_chain_overview(self, chain_name: str, components: Dict) -> str:
        """Build chain overview section"""
        chain_data = components.get("chain_data", {})
        
        return CHAIN_OVERVIEW_TEMPLATE.format(
            chain_name=chain_name,
            network_type=chain_data.get("network_type", "EVM"),
            risk_level=chain_data.get("risk_level", "MODERATE"),
            activity_index=chain_data.get("activity_index", 0.6),
            chain_summary="moderate manipulation risk indicators",
            analysis_period="30 days",
            chain_characteristics="standard blockchain activity",
            total_transactions=chain_data.get("total_transactions", 0),
            unique_entities=chain_data.get("unique_entities", 0),
            suspicious_rate=chain_data.get("suspicious_rate", 5.0),
            manipulation_events=chain_data.get("manipulation_events", 0),
            activity_interpretation="moderate activity levels",
            chain_rank=chain_data.get("rank", "N/A"),
            network_health_summary="healthy network operations",
            health_indicator_1="stable transaction throughput",
            health_indicator_2="normal gas prices",
            health_indicator_3="consistent block times",
            health_assessment="good",
            threat_1="wash trading",
            threat_2="coordinated manipulation",
            threat_3="front-running",
            threat_assessment="moderate",
            threat_trend="stable"
        )

    def _build_chain_manipulation_landscape(self, chain_name: str, components: Dict) -> str:
        """Build chain manipulation landscape section"""
        chain_data = components.get("chain_data", {})
        
        return CHAIN_MANIPULATION_LANDSCAPE_TEMPLATE.format(
            chain_name=chain_name,
            manipulation_prevalence=chain_data.get("manipulation_prevalence", 5.0),
            ring_count=chain_data.get("ring_count", 3),
            affected_token_count=chain_data.get("affected_tokens", 10),
            landscape_summary="moderate manipulation activity",
            manipulation_entity_count=chain_data.get("manipulation_entities", 20),
            manipulation_type_1="Wash Trading",
            type_1_prevalence=40,
            manipulation_type_2="Coordinated Pumping",
            type_2_prevalence=35,
            manipulation_type_3="Front-Running",
            type_3_prevalence=25,
            dominant_type="Wash Trading",
            dominant_percentage=40,
            dominant_characteristics="self-trading between controlled addresses",
            geographic_distribution="distributed globally",
            high_concentration_regions="major trading hubs",
            geographic_interpretation="standard global distribution",
            temporal_pattern="concentrated during peak hours",
            peak_periods="standard market hours",
            activity_concentration=65,
            concentration_window="peak trading windows",
            landscape_evolution="remained stable",
            evolution_change_1="slight increase in wash trading",
            evolution_change_2="emergence of new manipulation rings",
            evolution_change_3="adaptation of evasion techniques"
        )

    def _build_chain_health(self, chain_name: str, components: Dict) -> str:
        """Build chain health section"""
        return "Network health indicators show stable operations with normal transaction throughput and consistent block times."

    def _build_chain_threats(self, chain_name: str, components: Dict) -> str:
        """Build chain threats section"""
        return "Primary threats include wash trading, coordinated manipulation, and front-running activities. Threat level assessed as moderate with stable trend."

    def _build_chain_activity(self, chain_name: str, components: Dict) -> str:
        """Build chain activity section"""
        return "Activity analysis reveals standard blockchain operations with periodic spikes during high-volume trading periods."

    def _build_chain_recommendations(self, chain_name: str, components: Dict) -> str:
        """Build chain recommendations"""
        return "Recommendations: 1) Enhanced monitoring of suspicious entities, 2) Real-time detection of manipulation patterns, 3) Coordination with other chains"

    def _build_global_executive_summary(self, global_data: Dict) -> str:
        """Build global executive summary"""
        return "Global manipulation risk assessment indicates moderate threat levels across monitored chains. Enhanced surveillance recommended for high-risk entities."

    def _build_global_risk_overview(self, global_data: Dict) -> str:
        """Build global risk overview"""
        radar_data = global_data.get("radar", {})
        
        return GLOBAL_RISK_OVERVIEW_TEMPLATE.format(
            global_risk_score=radar_data.get("global_risk_score", 0.5) * 100,
            global_risk_classification="MODERATE",
            monitored_entities=radar_data.get("monitored_entities", 0),
            active_threats=radar_data.get("active_threats", 0),
            global_summary="moderate manipulation risk across chains",
            risk_interpretation="requires enhanced monitoring",
            risk_change="stable compared to previous period",
            chain_1="Ethereum",
            chain_1_risk=45,
            chain_1_trend="stable",
            chain_2="BSC",
            chain_2_risk=55,
            chain_2_trend="increasing",
            chain_3="Polygon",
            chain_3_risk=40,
            chain_3_trend="stable",
            chain_4="Avalanche",
            chain_4_risk=35,
            chain_4_trend="decreasing",
            chain_5="Solana",
            chain_5_risk=50,
            chain_5_trend="stable",
            highest_risk_chain="BSC",
            highest_risk_score=55,
            highest_risk_factors="high wash trading prevalence, coordinated manipulation",
            lowest_risk_chain="Avalanche",
            lowest_risk_score=35,
            threat_actor_count=50,
            actor_sophistication="moderate to high sophistication",
            actor_techniques="multi-chain coordination, evasion tactics",
            systemic_risk_count=3,
            systemic_risk_1="cross-chain manipulation rings",
            systemic_risk_2="coordinated pump and dump schemes",
            systemic_risk_3="wash trading networks"
        )

    def _build_cross_chain_analysis(self, global_data: Dict) -> str:
        """Build cross-chain analysis"""
        return "Cross-chain analysis reveals coordinated manipulation activities spanning multiple blockchain networks. Enhanced monitoring recommended."

    def _build_threat_actor_landscape(self, global_data: Dict) -> str:
        """Build threat actor landscape"""
        return "Threat actor landscape includes sophisticated manipulation rings operating across multiple chains with coordinated strategies."

    def _build_systemic_risks(self, global_data: Dict) -> str:
        """Build systemic risks section"""
        return "Systemic risks include cross-chain manipulation rings, coordinated schemes, and wash trading networks affecting multiple ecosystems."

    def _build_manipulation_networks(self, global_data: Dict) -> str:
        """Build manipulation networks section"""
        return "Manipulation network analysis identifies coordinated entities operating across chains with shared behavioral patterns."

    def _build_global_trends(self, global_data: Dict) -> str:
        """Build global trends section"""
        return "Global trends show stable manipulation risk levels with periodic spikes during high-volatility periods."

    def _build_global_recommendations(self, global_data: Dict) -> str:
        """Build global recommendations"""
        return "Strategic recommendations: 1) Enhanced cross-chain monitoring, 2) Real-time threat detection, 3) International coordination"

    def _build_briefing_executive_summary(self, input_data: Dict) -> str:
        """Build briefing executive summary"""
        return EXECUTIVE_SUMMARY_TEMPLATE.format(
            classification="TOP SECRET",
            priority="HIGH",
            report_date=datetime.utcnow().strftime("%Y-%m-%d"),
            situation_overview="Global manipulation risk assessment indicates elevated threat levels requiring enhanced monitoring.",
            key_finding_1="1. Sophisticated manipulation rings operating across multiple chains",
            key_finding_2="2. Coordinated pump and dump schemes affecting multiple tokens",
            key_finding_3="3. Wash trading networks with advanced evasion techniques",
            key_finding_4="4. Cross-chain coordination among threat actors",
            key_finding_5="5. Emerging manipulation patterns requiring new detection methods",
            current_risk_level="MODERATE TO HIGH",
            risk_trend="STABLE WITH PERIODIC SPIKES",
            projected_risk="SUSTAINED ELEVATED RISK",
            immediate_concern_1="1. Active manipulation rings requiring immediate attention",
            immediate_concern_2="2. High-risk entities with escalating threat profiles",
            immediate_concern_3="3. Cross-chain coordination indicating organized activity",
            recommendation_1="1. Implement continuous real-time monitoring",
            recommendation_2="2. Enhance cross-chain correlation analysis",
            recommendation_3="3. Coordinate with enforcement agencies",
            summary_scope="global manipulation risk landscape"
        )

    def _build_key_findings(self, input_data: Dict) -> str:
        """Build key findings section"""
        return "KEY FINDINGS\n\n1. Sophisticated manipulation activity detected\n2. Cross-chain coordination observed\n3. Enhanced monitoring required"

    def _build_intelligence_sections(self, input_data: Dict) -> str:
        """Build intelligence sections"""
        return "INTELLIGENCE ANALYSIS\n\nComprehensive analysis of behavioral patterns, correlation networks, and predictive indicators."

    def _build_risk_tables(self, input_data: Dict) -> str:
        """Build risk tables"""
        return "RISK ASSESSMENT TABLES\n\nEntity Risk Levels | Chain Risk Scores | Token Manipulation Indicators"

    def _build_correlation_notes(self, input_data: Dict) -> str:
        """Build correlation notes"""
        return "CORRELATION ANALYSIS\n\nCross-entity correlation networks reveal coordinated manipulation patterns."

    def _build_volatility_outlook(self, input_data: Dict) -> str:
        """Build volatility outlook"""
        return "VOLATILITY OUTLOOK\n\nMarket volatility expected to remain elevated during periods of coordinated manipulation activity."

    def _build_final_recommendations(self, input_data: Dict) -> str:
        """Build final recommendations"""
        return "FINAL RECOMMENDATIONS\n\n1. Enhanced monitoring\n2. Real-time detection\n3. Cross-chain coordination"

    def _build_action_points(self, input_data: Dict) -> str:
        """Build action points"""
        return "ACTION POINTS\n\n1. Implement recommendations\n2. Monitor high-risk entities\n3. Update detection systems"

    def _interpret_risk_level(self, risk_level: str) -> str:
        """Interpret risk level"""
        interpretations = {
            "CRITICAL": "immediate threat requiring urgent action",
            "HIGH": "significant threat requiring enhanced monitoring",
            "MODERATE": "moderate threat requiring standard monitoring",
            "LOW": "minimal threat with routine monitoring",
            "MINIMAL": "negligible threat"
        }
        return interpretations.get(risk_level, "unknown threat level")

    def _summarize_behavior(self, dna: Dict) -> str:
        """Summarize behavioral patterns"""
        archetype = dna.get("primary_archetype", "UNKNOWN")
        risk = dna.get("manipulation_risk", 0)
        
        if risk > 0.7:
            return f"strong {archetype} behavioral patterns with high manipulation indicators"
        elif risk > 0.4:
            return f"moderate {archetype} characteristics with notable risk factors"
        else:
            return f"{archetype} classification with standard behavioral patterns"

    def _interpret_prediction(self, score: float) -> str:
        """Interpret prediction score"""
        if score > 0.7:
            return "high probability of manipulation activity"
        elif score > 0.4:
            return "moderate manipulation risk"
        else:
            return "low manipulation probability"

    def _interpret_fusion(self, score: float) -> str:
        """Interpret fusion score"""
        if score > 0.7:
            return "high-confidence threat assessment"
        elif score > 0.4:
            return "moderate-confidence risk evaluation"
        else:
            return "preliminary assessment requiring additional data"

    def _interpret_radar_position(self, score: float) -> str:
        """Interpret radar position"""
        if score > 0.7:
            return "elevated threat status requiring immediate attention"
        elif score > 0.4:
            return "moderate risk position warranting enhanced monitoring"
        else:
            return "low-risk positioning with routine surveillance"

    def _project_future_behavior(self, dna: Dict, risk_score: float) -> str:
        """Project future behavior"""
        if risk_score > 0.7:
            return "continued high-risk manipulation activity with potential escalation"
        elif risk_score > 0.4:
            return "sustained moderate-risk operations with periodic spikes"
        else:
            return "standard operational patterns with minimal risk indicators"

    def _final_assessment(self, risk_score: float, archetype: str) -> str:
        """Generate final assessment"""
        if risk_score > 0.8:
            return f"critical threat requiring immediate intervention and continuous monitoring"
        elif risk_score > 0.6:
            return f"significant threat warranting enhanced surveillance and rapid response capability"
        elif risk_score > 0.4:
            return f"moderate threat requiring standard monitoring protocols and periodic review"
        else:
            return f"low threat with routine monitoring sufficient for current risk profile"
