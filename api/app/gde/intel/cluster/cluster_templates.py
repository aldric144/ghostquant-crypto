"""
Autonomous Cluster Narrative Templates
Government-grade intelligence templates for correlated entity clusters
"""


CLUSTER_IDENTITY_TEMPLATE = """
CLUSTER IDENTITY PROFILE

Cluster ID: {cluster_id}
Entity Count: {entity_count}
Primary Classification: {primary_classification}
Risk Level: {risk_level}
Coordination Score: {coordination_score}%

Intelligence analysis has identified a coordinated cluster of {entity_count} entities operating with {coordination_level} coordination. The cluster exhibits behavioral signatures consistent with {primary_classification} operational patterns. Comprehensive analysis spanning {observation_period} reveals {cluster_summary}.

The cluster's coordination score of {coordination_score}% indicates {coordination_interpretation}. Cross-entity correlation analysis shows {correlation_summary}, with {strong_correlation_count} strong correlations (coefficient > 0.7) and {moderate_correlation_count} moderate correlations (coefficient 0.4-0.7).

Temporal synchronization analysis reveals {timing_summary}. The cluster demonstrates {timing_precision} in transaction timing, with {synchronized_percentage}% of transactions occurring within {synchronization_window} time windows. This level of synchronization is {synchronization_assessment}.

Behavioral DNA analysis across cluster entities shows {dna_consistency}. The dominant archetype is {dominant_archetype}, present in {archetype_percentage}% of cluster members. This consistency suggests {archetype_interpretation}.
"""

CLUSTER_EXECUTIVE_SUMMARY_TEMPLATE = """
EXECUTIVE SUMMARY

Cluster Classification: {classification}
Threat Level: {threat_level}
Entities Monitored: {entity_count}
Risk Score: {risk_score}%

This intelligence dossier presents comprehensive analysis of a {entity_count}-entity cluster identified through cross-entity correlation analysis. The cluster has been classified as {classification} with {threat_level} threat level, based on {classification_factors}.

Key findings indicate {key_finding_1}. Analysis reveals {key_finding_2}. Intelligence assessment concludes {key_finding_3}.

The cluster's composite risk score of {risk_score}% places it in the {risk_percentile}th percentile among monitored clusters. Immediate concerns include {immediate_concern_1}, {immediate_concern_2}, and {immediate_concern_3}.

Recommended actions: {recommendation_summary}. Enhanced monitoring is {'strongly ' if risk_score > 70 else ''}recommended for the next {monitoring_period}.
"""

COORDINATION_EVIDENCE_TEMPLATE = """
COORDINATION EVIDENCE ANALYSIS

Coordination Level: {coordination_level}
Evidence Strength: {evidence_strength}
Confidence: {confidence}%

Forensic analysis has identified {evidence_count} distinct indicators of coordinated activity among cluster entities. The evidence strength is assessed as {evidence_strength}, with {confidence}% confidence based on {confidence_factors}.

Primary Coordination Indicators:

Temporal Synchronization: {temporal_sync_score}%
Analysis: {temporal_analysis}
Evidence: {temporal_evidence}

Transaction Pattern Alignment: {pattern_alignment_score}%
Analysis: {pattern_analysis}
Evidence: {pattern_evidence}

Volume Correlation: {volume_correlation_score}%
Analysis: {volume_analysis}
Evidence: {volume_evidence}

Chain Pressure Synchronization: {chain_pressure_score}%
Analysis: {chain_pressure_analysis}
Evidence: {chain_pressure_evidence}

Cross-Entity Flow Analysis: {flow_analysis_score}%
Analysis: {flow_analysis}
Evidence: {flow_evidence}

The cumulative evidence indicates {coordination_conclusion}. The coordination mechanism appears to be {coordination_mechanism}, suggesting {mechanism_interpretation}.

Network topology analysis reveals {network_topology}. The cluster exhibits {centralization_level} centralization, with {hub_count} hub entities and {peripheral_count} peripheral entities. This structure is consistent with {structure_interpretation}.
"""

MANIPULATION_MODE_CLUSTER_TEMPLATE = """
CLUSTER MANIPULATION MODE ANALYSIS

Detected Modes: {manipulation_modes}
Primary Mode: {primary_mode}
Sophistication: {sophistication_level}

Behavioral analysis has identified {mode_count} distinct manipulation modes operating within the cluster. The primary mode, {primary_mode}, accounts for {primary_mode_percentage}% of suspicious activity and demonstrates {sophistication_level} sophistication.

Mode Analysis:

{mode_1_name}:
Prevalence: {mode_1_prevalence}%
Entities Involved: {mode_1_entity_count}
Methodology: {mode_1_methodology}
Market Impact: {mode_1_impact}
Detection Confidence: {mode_1_confidence}%

{mode_2_name}:
Prevalence: {mode_2_prevalence}%
Entities Involved: {mode_2_entity_count}
Methodology: {mode_2_methodology}
Market Impact: {mode_2_impact}
Detection Confidence: {mode_2_confidence}%

Cluster Coordination: The manipulation modes exhibit {coordination_pattern}. Evidence suggests {coordination_evidence}, indicating {coordination_level} coordination among cluster members.

Operational Methodology: The cluster employs {operational_methodology}. Transaction sequencing shows {sequencing_pattern}, with {leader_count} leader entities initiating actions and {follower_count} follower entities responding within {response_window}.

Market Impact Assessment: The cluster's collective manipulation activities have resulted in {market_impact_summary}. Estimated market distortion is {distortion_estimate}, affecting {affected_tokens} tokens across {affected_chains} chains. The cumulative impact is assessed as {impact_severity}.

Evasion Techniques: The cluster demonstrates {evasion_sophistication} in evading detection. Observed techniques include {evasion_technique_1}, {evasion_technique_2}, and {evasion_technique_3}. The effectiveness of these techniques is {evasion_effectiveness}.
"""


SCENARIO_COORDINATED_LIQUIDITY_TEMPLATE = """
SCENARIO: COORDINATED LIQUIDITY EXTRACTION

Classification Confidence: {confidence}%
Severity: {severity}

Intelligence analysis indicates this cluster is engaged in coordinated liquidity extraction operations. This scenario is characterized by {scenario_characteristics}.

Operational Pattern:
The cluster operates through {operational_pattern}. Entities coordinate to {extraction_methodology}, resulting in {extraction_impact}. The extraction rate is {extraction_rate}, with {extraction_volume} extracted over {extraction_period}.

Evidence:
- Synchronized withdrawal patterns: {withdrawal_evidence}
- Coordinated timing: {timing_evidence}
- Volume concentration: {volume_evidence}
- Market impact: {impact_evidence}

Threat Assessment: This operation poses {threat_level} threat to market stability. Projected continuation could result in {projection_impact} over the next {projection_period}.
"""

SCENARIO_WASH_TRADING_TEMPLATE = """
SCENARIO: WASH/MIRROR TRADING CELL

Classification Confidence: {confidence}%
Severity: {severity}

The cluster exhibits behavioral signatures consistent with wash trading and mirror trading operations. Analysis reveals {wash_trading_summary}.

Operational Methodology:
Entities engage in {wash_methodology}, creating artificial volume of approximately {artificial_volume}. The wash trading pattern involves {pattern_description}, with {cycle_frequency} cycles per {cycle_period}.

Detection Evidence:
- Reciprocal transactions: {reciprocal_count} identified
- Minimal price impact: {price_impact}% average
- Volume inflation: {volume_inflation}% estimated
- Self-referential flows: {self_referential_percentage}%

Market Distortion: The wash trading activities have inflated reported volume by {inflation_estimate}, affecting {affected_markets}. This distortion is {distortion_severity}.
"""

SCENARIO_WHALE_SHADOW_TEMPLATE = """
SCENARIO: WHALE SHADOW OPERATION

Classification Confidence: {confidence}%
Severity: {severity}

Intelligence assessment identifies this cluster as a whale shadow operation, where smaller entities coordinate movements in anticipation of or in response to whale activities. The operation demonstrates {operation_characteristics}.

Operational Structure:
The cluster operates with {structure_description}. A primary whale entity ({whale_address}) is shadowed by {shadow_entity_count} coordinated entities. The shadow entities demonstrate {shadow_behavior}, with {response_time} average response time to whale movements.

Coordination Evidence:
- Temporal correlation with whale: {whale_correlation}%
- Movement synchronization: {sync_score}%
- Volume proportionality: {proportionality_score}%
- Directional alignment: {alignment_score}%

Market Impact: The shadow operation amplifies whale movements by {amplification_factor}x, creating {impact_description}. This amplification is {impact_assessment}.
"""

SCENARIO_MULTI_CHAIN_ARBITRAGE_TEMPLATE = """
SCENARIO: MULTI-CHAIN ARBITRAGE RING

Classification Confidence: {confidence}%
Severity: {severity}

The cluster has been identified as a multi-chain arbitrage ring, exploiting price differentials across {chain_count} blockchain networks. The operation exhibits {arbitrage_characteristics}.

Operational Methodology:
Entities coordinate to {arbitrage_methodology}, targeting {target_tokens} tokens with average price differentials of {price_differential}%. The arbitrage cycle time is {cycle_time}, with {cycle_frequency} cycles per {cycle_period}.

Cross-Chain Coordination:
- Primary chains: {primary_chains}
- Bridge utilization: {bridge_count} bridges
- Coordination precision: {coordination_precision}%
- Profit extraction: {profit_estimate}

Market Impact: The arbitrage activities contribute to {market_impact}. While arbitrage can provide market efficiency, this operation's scale and coordination suggest {impact_interpretation}.
"""

SCENARIO_MARKET_PRESSURE_TEMPLATE = """
SCENARIO: MARKET PRESSURE SYNDICATE

Classification Confidence: {confidence}%
Severity: {severity}

Intelligence analysis classifies this cluster as a market pressure syndicate, coordinating to apply directional pressure on targeted markets. The syndicate demonstrates {syndicate_characteristics}.

Operational Pattern:
The syndicate operates through {pressure_methodology}, targeting {target_markets}. Coordinated actions create {pressure_type} pressure with {pressure_magnitude} magnitude. The pressure application is {pressure_timing}.

Coordination Indicators:
- Synchronized entries: {entry_sync}%
- Volume concentration: {volume_concentration}%
- Directional alignment: {directional_alignment}%
- Timing precision: {timing_precision}%

Market Impact: The syndicate's pressure operations have resulted in {market_impact_description}. Price movements of {price_movement}% have been observed during pressure events, affecting {affected_participants}.
"""

SCENARIO_DORMANT_ACTIVATION_TEMPLATE = """
SCENARIO: DORMANT ACTIVATION CELL

Classification Confidence: {confidence}%
Severity: {severity}

The cluster exhibits characteristics of a dormant activation cell, where previously inactive entities activate simultaneously in coordinated fashion. This pattern suggests {activation_interpretation}.

Activation Analysis:
Entities remained dormant for {dormancy_period} before simultaneous activation on {activation_date}. The activation involved {entity_count} entities executing {transaction_count} transactions within {activation_window}.

Coordination Evidence:
- Activation synchronization: {activation_sync}%
- Transaction pattern similarity: {pattern_similarity}%
- Volume alignment: {volume_alignment}%
- Timing precision: {timing_precision}%

Threat Assessment: Dormant activation cells typically indicate {threat_interpretation}. The coordinated activation suggests {activation_purpose}, posing {threat_level} threat.
"""

SCENARIO_INSIDER_LEAK_TEMPLATE = """
SCENARIO: INSIDER LEAK CLUSTER

Classification Confidence: {confidence}%
Severity: {severity}

Intelligence analysis indicates this cluster may be operating on insider information, with coordinated actions preceding market-moving events. The cluster demonstrates {insider_characteristics}.

Operational Pattern:
Entities exhibit {insider_pattern}, with coordinated actions occurring {timing_relationship} to {event_count} significant market events. The timing precision is {timing_precision}%, suggesting {timing_interpretation}.

Evidence Indicators:
- Pre-event positioning: {pre_event_count} instances
- Timing advantage: {timing_advantage} average
- Profit correlation: {profit_correlation}%
- Information asymmetry: {asymmetry_score}%

Regulatory Implications: If confirmed, this activity constitutes {regulatory_classification}. The evidence strength is {evidence_strength}, warranting {regulatory_action}.
"""

SCENARIO_LAYERED_WALLET_TEMPLATE = """
SCENARIO: LAYERED WALLET NETWORK

Classification Confidence: {confidence}%
Severity: {severity}

The cluster exhibits characteristics of a layered wallet network, where entities are organized in hierarchical layers for obfuscation and coordination. The network demonstrates {network_characteristics}.

Network Structure:
Analysis reveals {layer_count} distinct layers:
- Layer 1 (Primary): {layer_1_count} entities
- Layer 2 (Intermediate): {layer_2_count} entities
- Layer 3 (Execution): {layer_3_count} entities

Flow patterns show {flow_pattern}, with {flow_direction} flow from {source_layer} to {destination_layer}. The layering serves to {layering_purpose}.

Obfuscation Techniques:
- Address rotation: {rotation_frequency}
- Transaction splitting: {splitting_pattern}
- Timing variation: {timing_variation}%
- Volume obfuscation: {volume_obfuscation}%

Purpose Assessment: The layered structure suggests {purpose_interpretation}, indicating {threat_level} threat level.
"""

SCENARIO_VOLATILITY_ENRICHMENT_TEMPLATE = """
SCENARIO: CROSS-ENTITY VOLATILITY ENRICHMENT

Classification Confidence: {confidence}%
Severity: {severity}

Intelligence assessment identifies this cluster as engaged in cross-entity volatility enrichment, where entities coordinate to profit from induced volatility. The operation exhibits {volatility_characteristics}.

Operational Methodology:
Entities coordinate to {volatility_methodology}, creating artificial volatility of {volatility_magnitude}%. The enrichment cycle involves {cycle_description}, with {profit_extraction} profit extraction per cycle.

Coordination Evidence:
- Volatility synchronization: {volatility_sync}%
- Entry/exit coordination: {entry_exit_coordination}%
- Profit correlation: {profit_correlation}%
- Market impact timing: {impact_timing}%

Market Impact: The volatility enrichment activities have resulted in {market_impact_description}. Estimated market participants affected: {affected_participants}. Impact severity: {impact_severity}.
"""


CLUSTER_BEHAVIORAL_PATTERNS_TEMPLATE = """
CLUSTER BEHAVIORAL PATTERN ANALYSIS

Pattern Consistency: {pattern_consistency}%
Behavioral Alignment: {behavioral_alignment}%

Cross-entity behavioral analysis reveals {pattern_count} distinct behavioral patterns shared across cluster members. The pattern consistency of {pattern_consistency}% indicates {consistency_interpretation}.

Primary Patterns:

Pattern 1: {pattern_1_name}
Prevalence: {pattern_1_prevalence}%
Entities: {pattern_1_entity_count}
Description: {pattern_1_description}
Significance: {pattern_1_significance}

Pattern 2: {pattern_2_name}
Prevalence: {pattern_2_prevalence}%
Entities: {pattern_2_entity_count}
Description: {pattern_2_description}
Significance: {pattern_2_significance}

Pattern 3: {pattern_3_name}
Prevalence: {pattern_3_prevalence}%
Entities: {pattern_3_entity_count}
Description: {pattern_3_description}
Significance: {pattern_3_significance}

Temporal Analysis: Behavioral patterns show {temporal_consistency} over time. Pattern evolution indicates {evolution_pattern}, suggesting {evolution_interpretation}.

Coordination Inference: The behavioral alignment suggests {coordination_inference}. The probability of independent emergence of these patterns is {independence_probability}%, indicating {coordination_conclusion}.
"""

CLUSTER_TIMELINE_TEMPLATE = """
CLUSTER CHRONOLOGICAL RECONSTRUCTION

Timeline Period: {timeline_start} to {timeline_end}
Total Events: {total_events}
Critical Events: {critical_events}

Chronological reconstruction of cluster activities reveals {timeline_summary}. The timeline analysis identifies {phase_count} distinct operational phases.

Phase 1: {phase_1_period}
Characteristics: {phase_1_characteristics}
Leading Entities: {phase_1_leaders}
Activity Level: {phase_1_activity}
Key Events: {phase_1_events}

Phase 2: {phase_2_period}
Characteristics: {phase_2_characteristics}
Leading Entities: {phase_2_leaders}
Activity Level: {phase_2_activity}
Key Events: {phase_2_events}

Phase 3: {phase_3_period}
Characteristics: {phase_3_characteristics}
Leading Entities: {phase_3_leaders}
Activity Level: {phase_3_activity}
Key Events: {phase_3_events}

Leadership Analysis: Entity {leader_entity} demonstrates consistent leadership, initiating {leadership_percentage}% of coordinated actions. Follower entities respond within {response_time} average response time.

Coordination Windows: Analysis identifies {coordination_window_count} distinct coordination windows, with {window_duration} average duration. These windows are characterized by {window_characteristics}.

Pressure Building: The timeline shows {pressure_pattern} pressure building, with {pressure_events} pressure events. Peak pressure occurred on {peak_pressure_date}, corresponding to {peak_pressure_event}.
"""

CLUSTER_RISK_ASSESSMENT_TEMPLATE = """
CLUSTER RISK ASSESSMENT

Composite Risk Score: {risk_score}%
Risk Level: {risk_level}
Threat Classification: {threat_classification}

Comprehensive risk assessment yields a composite risk score of {risk_score}%, placing the cluster in the {risk_level} category. This assessment is based on {assessment_factors}.

Risk Components:

Manipulation Risk: {manipulation_risk}%
Assessment: {manipulation_assessment}

Coordination Risk: {coordination_risk}%
Assessment: {coordination_assessment}

Market Impact Risk: {market_impact_risk}%
Assessment: {market_impact_assessment}

Systemic Risk: {systemic_risk}%
Assessment: {systemic_assessment}

Escalation Risk: {escalation_risk}%
Assessment: {escalation_assessment}

Risk Gradient: The cluster's risk profile shows {risk_gradient}. Comparative analysis indicates the cluster ranks in the {risk_percentile}th percentile among monitored clusters.

Threat Projection:

24-Hour Outlook: {outlook_24h}
Probability: {probability_24h}%
Projected Activity: {activity_24h}

7-Day Outlook: {outlook_7d}
Probability: {probability_7d}%
Projected Activity: {activity_7d}

Escalation Probability: The probability of risk escalation is {escalation_probability}%, based on {escalation_factors}. Trigger events that could accelerate escalation include {trigger_1}, {trigger_2}, and {trigger_3}.
"""

CLUSTER_RECOMMENDATIONS_TEMPLATE = """
ANALYST RECOMMENDATIONS

Priority Level: {priority_level}
Monitoring Intensity: {monitoring_intensity}
Action Urgency: {action_urgency}

Based on comprehensive intelligence analysis, the following recommendations are provided for cluster monitoring and risk mitigation:

Immediate Actions:
1. {immediate_action_1}
2. {immediate_action_2}
3. {immediate_action_3}

Enhanced Monitoring:
- Entities: {monitoring_entities}
- Frequency: {monitoring_frequency}
- Indicators: {monitoring_indicators}
- Alert Thresholds: {alert_thresholds}

Behavioral Surveillance:
- Pattern Detection: {pattern_detection_recommendation}
- Timing Analysis: {timing_analysis_recommendation}
- Volume Monitoring: {volume_monitoring_recommendation}
- Cross-Chain Tracking: {cross_chain_recommendation}

Entity Freeze Candidates:
{freeze_candidate_1}: {freeze_reason_1}
{freeze_candidate_2}: {freeze_reason_2}
{freeze_candidate_3}: {freeze_reason_3}

Moving-Average Alerting:
Implement moving-average alerts for {alert_metrics} with {alert_window} windows. Alert on deviations exceeding {alert_threshold}%.

Cross-Chain Surveillance:
Intensify surveillance on {surveillance_chains} with focus on {surveillance_focus}. Coordinate monitoring across {coordination_points}.

Risk Mitigation:
To mitigate identified risks, implement {mitigation_1}, {mitigation_2}, and {mitigation_3}. These measures should reduce risk exposure by an estimated {risk_reduction}%.

Intelligence Gaps:
Further intelligence collection needed regarding {gap_1}, {gap_2}, and {gap_3}. Addressing these gaps will improve assessment confidence by {confidence_improvement}%.
"""

CLUSTER_ANALYST_NOTES_TEMPLATE = """
FINAL ANALYST NOTES

Assessment Confidence: {confidence}%
Intelligence Quality: {intelligence_quality}
Analysis Depth: {analysis_depth}

This intelligence dossier represents comprehensive analysis of a {entity_count}-entity cluster identified through cross-entity correlation and behavioral analysis. The assessment carries {confidence}% confidence based on {confidence_factors}.

Key Observations:
{observation_1}
{observation_2}
{observation_3}

Alternative Interpretations:
While the primary assessment classifies this cluster as {primary_classification}, alternative interpretations include {alternative_1} and {alternative_2}. These alternatives were considered but deemed less probable due to {exclusion_reasoning}.

Limitations:
The following limitations affect this assessment: {limitation_1}, {limitation_2}, {limitation_3}. These limitations result in {limitation_impact}.

Monitoring Recommendations:
Continue monitoring this cluster with {monitoring_intensity} intensity. Re-assess classification and risk level {reassessment_frequency}. Update intelligence dossier as new data becomes available.

Analyst Conclusion:
{analyst_conclusion}

Report Classification: {report_classification}
Distribution: {distribution_level}
Next Review: {next_review_date}
"""

INTER_ENTITY_CORRELATION_TEMPLATE = """
INTER-ENTITY CORRELATION ANALYSIS

Correlation Network Density: {network_density}%
Average Correlation Coefficient: {avg_correlation}
Strong Correlations: {strong_correlation_count}

Pairwise correlation analysis reveals {correlation_summary}. The network exhibits {network_density}% density, indicating {density_interpretation}.

Top Correlations:

{entity_1} ↔ {entity_2}:
Coefficient: {correlation_1}
Type: {correlation_type_1}
Temporal Overlap: {temporal_overlap_1}%
Behavioral Similarity: {behavioral_similarity_1}%
Interpretation: {interpretation_1}

{entity_3} ↔ {entity_4}:
Coefficient: {correlation_2}
Type: {correlation_type_2}
Temporal Overlap: {temporal_overlap_2}%
Behavioral Similarity: {behavioral_similarity_2}%
Interpretation: {interpretation_2}

{entity_5} ↔ {entity_6}:
Coefficient: {correlation_3}
Type: {correlation_type_3}
Temporal Overlap: {temporal_overlap_3}%
Behavioral Similarity: {behavioral_similarity_3}%
Interpretation: {interpretation_3}

Network Topology: The correlation network exhibits {topology_type} topology with {hub_count} hub entities. The most central entity is {central_entity} with {centrality_score} centrality score.

Correlation Evolution: Temporal analysis shows correlation strength has {correlation_trend} over the observation period. This trend suggests {trend_interpretation}.
"""

MULTI_DOMAIN_FUSION_CLUSTER_TEMPLATE = """
MULTI-DOMAIN INTELLIGENCE FUSION

Fusion Score: {fusion_score}%
Fusion Confidence: {fusion_confidence}%
Domains Integrated: {domain_count}

Multi-domain intelligence fusion synthesizes data from {domain_count} intelligence domains to produce a comprehensive cluster assessment. The fusion score of {fusion_score}% indicates {fusion_interpretation}.

Domain Contributions:

Behavioral DNA: {dna_contribution}%
Analysis: {dna_analysis}

Entity History: {history_contribution}%
Analysis: {history_analysis}

Correlation Analysis: {correlation_contribution}%
Analysis: {correlation_analysis}

Global Radar: {radar_contribution}%
Analysis: {radar_analysis}

Prediction Models: {prediction_contribution}%
Analysis: {prediction_analysis}

Fusion Synthesis: Cross-domain validation reveals {validation_summary}. Consensus indicators include {consensus_1}, {consensus_2}, and {consensus_3}. Conflicting signals include {conflict_1}, which is interpreted as {conflict_interpretation}.

Confidence Assessment: The fusion analysis carries {fusion_confidence}% confidence. This confidence level reflects {confidence_reasoning}. Domain agreement is {agreement_level}%, indicating {agreement_interpretation}.
"""

FUTURE_PROJECTION_TEMPLATE = """
FUTURE ACTIVITY PROJECTION

Projection Horizon: {projection_horizon}
Projection Confidence: {projection_confidence}%

Based on historical patterns and current behavioral indicators, the following projections are assessed for cluster future activity:

Short-Term (24-48 hours):
Projected Activity: {short_term_activity}
Probability: {short_term_probability}%
Risk Level: {short_term_risk}
Key Indicators: {short_term_indicators}

Medium-Term (7-14 days):
Projected Activity: {medium_term_activity}
Probability: {medium_term_probability}%
Risk Level: {medium_term_risk}
Key Indicators: {medium_term_indicators}

Long-Term (30+ days):
Projected Activity: {long_term_activity}
Probability: {long_term_probability}%
Risk Level: {long_term_risk}
Key Indicators: {long_term_indicators}

Scenario Projections:
Most Likely: {most_likely_scenario} ({most_likely_probability}%)
Alternative: {alternative_scenario} ({alternative_probability}%)
Worst Case: {worst_case_scenario} ({worst_case_probability}%)

Trigger Events: Specific events that could alter projections include {trigger_event_1}, {trigger_event_2}, and {trigger_event_3}. Monitoring for these triggers is recommended.

Projection Limitations: These projections are based on {projection_basis} and carry {projection_confidence}% confidence. Limitations include {projection_limitation_1} and {projection_limitation_2}.
"""
