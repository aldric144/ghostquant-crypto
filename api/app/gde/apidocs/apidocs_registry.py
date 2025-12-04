"""
API Documentation Registry
Complete registry of all GhostQuant API endpoints.
"""

from typing import List, Dict
from .apidocs_schema import APIEndpointDoc, APISection, HTTPMethod, RiskLevel


def get_all_sections() -> List[APISection]:
    """Get all API documentation sections."""
    return [
        APISection(
            section_id="prediction",
            name="Prediction Engine",
            description="ML-powered threat prediction and risk scoring",
            icon="🔮",
            order=1,
        ),
        APISection(
            section_id="dna",
            name="Behavioral DNA",
            description="Entity behavioral profiling and pattern analysis",
            icon="🧬",
            order=2,
        ),
        APISection(
            section_id="correlation",
            name="Correlation Engine",
            description="Cross-chain event correlation and relationship mapping",
            icon="🔗",
            order=3,
        ),
        APISection(
            section_id="fusion",
            name="Fusion Engine",
            description="Multi-source intelligence fusion and synthesis",
            icon="⚡",
            order=4,
        ),
        APISection(
            section_id="radar",
            name="Global Radar",
            description="Real-time threat detection and monitoring",
            icon="📡",
            order=5,
        ),
        APISection(
            section_id="cluster",
            name="Cluster Intelligence",
            description="Entity clustering and network analysis",
            icon="🕸️",
            order=6,
        ),
        APISection(
            section_id="hydra",
            name="Operation Hydra",
            description="Advanced threat hunting and investigation",
            icon="🐉",
            order=7,
        ),
        APISection(
            section_id="constellation",
            name="Constellation",
            description="Entity relationship mapping and graph analysis",
            icon="✨",
            order=8,
        ),
        APISection(
            section_id="sentinel",
            name="Sentinel",
            description="Automated threat detection and alerting",
            icon="🛡️",
            order=9,
        ),
        APISection(
            section_id="cortex",
            name="Cortex",
            description="Intelligence processing and analysis",
            icon="🧠",
            order=10,
        ),
        APISection(
            section_id="genesis",
            name="Genesis",
            description="Historical data analysis and reconstruction",
            icon="🌌",
            order=11,
        ),
        APISection(
            section_id="actor",
            name="Threat Actor Profiler",
            description="Adversary profiling and attribution",
            icon="👤",
            order=12,
        ),
        APISection(
            section_id="oracle",
            name="Oracle Eye",
            description="Predictive intelligence and forecasting",
            icon="👁️",
            order=13,
        ),
        APISection(
            section_id="ultrafusion",
            name="UltraFusion",
            description="Advanced multi-dimensional analysis",
            icon="💫",
            order=14,
        ),
        APISection(
            section_id="sales",
            name="Sales Pipeline",
            description="Enterprise sales and lead management",
            icon="🚀",
            order=15,
        ),
        APISection(
            section_id="intelligence",
            name="Intelligence Feed",
            description="Real-time intelligence streaming",
            icon="📊",
            order=16,
        ),
        APISection(
            section_id="compliance",
            name="Compliance & Audit",
            description="Regulatory compliance and audit trails",
            icon="📋",
            order=17,
        ),
    ]


def get_all_endpoints() -> List[APIEndpointDoc]:
    """Get complete registry of all API endpoints."""
    endpoints = []
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="predict_entity_risk",
            name="Predict Entity Risk",
            method=HTTPMethod.POST,
            path="/predict/entity",
            section="prediction",
            summary="Predict risk score for a cryptocurrency entity",
            description="Uses ML models to predict threat risk for wallets, contracts, and entities based on behavioral patterns, transaction history, and network analysis.",
            body_schema={
                "entity_id": "string",
                "entity_type": "wallet|contract|exchange",
                "features": "object (optional)",
            },
            response_schema={
                "entity_id": "string",
                "risk_score": "float (0-1)",
                "risk_level": "critical|high|medium|low",
                "confidence": "float",
                "factors": "array",
                "predictions": "object",
            },
            risk_level=RiskLevel.MEDIUM,
            use_cases=[
                "Pre-transaction risk assessment",
                "Wallet screening",
                "Exchange compliance checks",
            ],
            tags=["prediction", "risk", "ml"],
        ),
        APIEndpointDoc(
            endpoint_id="predict_token_risk",
            name="Predict Token Risk",
            method=HTTPMethod.POST,
            path="/predict/token",
            section="prediction",
            summary="Predict risk score for a cryptocurrency token",
            description="Analyzes token contracts, liquidity, holder distribution, and market behavior to predict rug pull risk, manipulation risk, and overall token safety.",
            body_schema={
                "token_address": "string",
                "chain": "string",
                "features": "object (optional)",
            },
            response_schema={
                "token_address": "string",
                "risk_score": "float (0-1)",
                "rug_pull_probability": "float",
                "manipulation_risk": "float",
                "liquidity_risk": "float",
                "holder_risk": "float",
            },
            risk_level=RiskLevel.HIGH,
            use_cases=[
                "Token due diligence",
                "Investment risk assessment",
                "Scam detection",
            ],
            tags=["prediction", "token", "defi"],
        ),
        APIEndpointDoc(
            endpoint_id="predict_chain_risk",
            name="Predict Chain Risk",
            method=HTTPMethod.POST,
            path="/predict/chain",
            section="prediction",
            summary="Predict risk for blockchain networks",
            description="Evaluates blockchain security, centralization, validator behavior, and network health to predict systemic risks.",
            body_schema={
                "chain_id": "string",
                "features": "object (optional)",
            },
            response_schema={
                "chain_id": "string",
                "risk_score": "float",
                "centralization_risk": "float",
                "security_score": "float",
                "validator_health": "float",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["prediction", "chain", "security"],
        ),
        APIEndpointDoc(
            endpoint_id="predict_transaction",
            name="Predict Transaction Risk",
            method=HTTPMethod.POST,
            path="/predict/transaction",
            section="prediction",
            summary="Real-time transaction risk prediction",
            description="Analyzes pending transactions for fraud, money laundering, and manipulation patterns before execution.",
            body_schema={
                "from_address": "string",
                "to_address": "string",
                "amount": "float",
                "token": "string (optional)",
                "chain": "string",
            },
            response_schema={
                "risk_score": "float",
                "fraud_probability": "float",
                "aml_risk": "float",
                "recommendation": "approve|review|reject",
            },
            risk_level=RiskLevel.CRITICAL,
            use_cases=[
                "Real-time transaction screening",
                "AML compliance",
                "Fraud prevention",
            ],
            tags=["prediction", "transaction", "aml"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="dna_profile",
            name="Get Behavioral DNA Profile",
            method=HTTPMethod.GET,
            path="/dna/profile/{entity_id}",
            section="dna",
            summary="Retrieve complete behavioral DNA profile",
            description="Returns comprehensive behavioral fingerprint including transaction patterns, interaction networks, temporal behavior, and risk indicators.",
            params=[{"name": "entity_id", "type": "string", "required": True}],
            response_schema={
                "entity_id": "string",
                "dna_signature": "string",
                "behavioral_patterns": "array",
                "risk_indicators": "array",
                "temporal_profile": "object",
                "network_profile": "object",
            },
            risk_level=RiskLevel.LOW,
            tags=["dna", "profiling", "behavior"],
        ),
        APIEndpointDoc(
            endpoint_id="dna_compare",
            name="Compare DNA Profiles",
            method=HTTPMethod.POST,
            path="/dna/compare",
            section="dna",
            summary="Compare behavioral DNA between entities",
            description="Calculates similarity scores between entity behavioral profiles to identify related actors, sybil attacks, or coordinated behavior.",
            body_schema={
                "entity_ids": "array[string]",
                "comparison_type": "full|temporal|network|transaction",
            },
            response_schema={
                "similarity_matrix": "array",
                "clusters": "array",
                "related_entities": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["dna", "comparison", "clustering"],
        ),
        APIEndpointDoc(
            endpoint_id="dna_timeline",
            name="Get DNA Timeline",
            method=HTTPMethod.GET,
            path="/dna/timeline/{entity_id}",
            section="dna",
            summary="Retrieve behavioral evolution timeline",
            description="Shows how entity behavior has evolved over time, detecting behavioral shifts and anomalies.",
            params=[{"name": "entity_id", "type": "string", "required": True}],
            query_params=[
                {"name": "start_date", "type": "string", "required": False},
                {"name": "end_date", "type": "string", "required": False},
            ],
            response_schema={
                "entity_id": "string",
                "timeline": "array",
                "behavioral_shifts": "array",
                "anomalies": "array",
            },
            risk_level=RiskLevel.LOW,
            tags=["dna", "timeline", "evolution"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="correlation_events",
            name="Correlate Events",
            method=HTTPMethod.POST,
            path="/correlation/events",
            section="correlation",
            summary="Find correlated events across chains",
            description="Identifies related events, coordinated attacks, and cross-chain patterns using temporal and behavioral correlation.",
            body_schema={
                "event_ids": "array[string]",
                "time_window": "integer (seconds)",
                "correlation_threshold": "float (0-1)",
            },
            response_schema={
                "correlations": "array",
                "correlation_score": "float",
                "event_clusters": "array",
                "attack_patterns": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["correlation", "events", "cross-chain"],
        ),
        APIEndpointDoc(
            endpoint_id="correlation_entities",
            name="Correlate Entities",
            method=HTTPMethod.POST,
            path="/correlation/entities",
            section="correlation",
            summary="Find entity relationships",
            description="Discovers hidden relationships between entities through transaction patterns, shared addresses, and behavioral similarities.",
            body_schema={
                "entity_ids": "array[string]",
                "depth": "integer (1-5)",
            },
            response_schema={
                "relationships": "array",
                "relationship_graph": "object",
                "shared_patterns": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["correlation", "entities", "relationships"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="fusion_analyze",
            name="Multi-Source Fusion Analysis",
            method=HTTPMethod.POST,
            path="/fusion/analyze",
            section="fusion",
            summary="Fuse intelligence from multiple sources",
            description="Combines on-chain data, off-chain intelligence, social signals, and market data into unified threat assessment.",
            body_schema={
                "target": "string",
                "sources": "array[string]",
                "analysis_depth": "shallow|medium|deep",
            },
            response_schema={
                "fusion_score": "float",
                "source_contributions": "object",
                "unified_assessment": "object",
                "confidence": "float",
            },
            risk_level=RiskLevel.HIGH,
            tags=["fusion", "intelligence", "multi-source"],
        ),
        APIEndpointDoc(
            endpoint_id="fusion_realtime",
            name="Real-Time Fusion Stream",
            method=HTTPMethod.GET,
            path="/fusion/stream",
            section="fusion",
            summary="Stream fused intelligence updates",
            description="WebSocket endpoint for real-time fused intelligence updates combining multiple data sources.",
            response_schema={
                "stream_id": "string",
                "updates": "array",
                "fusion_events": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["fusion", "streaming", "realtime"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="radar_threats",
            name="Get Active Threats",
            method=HTTPMethod.GET,
            path="/radar/threats",
            section="radar",
            summary="Retrieve active threats from global radar",
            description="Returns currently active threats, attacks, and suspicious activities detected across all monitored chains.",
            query_params=[
                {"name": "severity", "type": "string", "required": False},
                {"name": "chain", "type": "string", "required": False},
                {"name": "limit", "type": "integer", "required": False},
            ],
            response_schema={
                "threats": "array",
                "total_count": "integer",
                "severity_distribution": "object",
            },
            risk_level=RiskLevel.HIGH,
            tags=["radar", "threats", "monitoring"],
        ),
        APIEndpointDoc(
            endpoint_id="radar_heatmap",
            name="Get Threat Heatmap",
            method=HTTPMethod.GET,
            path="/radar/heatmap",
            section="radar",
            summary="Retrieve global threat heatmap",
            description="Provides geographic and network-based threat distribution for visualization.",
            response_schema={
                "heatmap_data": "array",
                "hotspots": "array",
                "threat_density": "object",
            },
            risk_level=RiskLevel.LOW,
            tags=["radar", "heatmap", "visualization"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="cluster_detect",
            name="Detect Entity Clusters",
            method=HTTPMethod.POST,
            path="/cluster/detect",
            section="cluster",
            summary="Detect entity clusters and networks",
            description="Identifies clusters of related entities, sybil networks, and coordinated actor groups.",
            body_schema={
                "entity_ids": "array[string]",
                "algorithm": "dbscan|hierarchical|kmeans",
                "min_cluster_size": "integer",
            },
            response_schema={
                "clusters": "array",
                "cluster_stats": "object",
                "outliers": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["cluster", "detection", "network"],
        ),
        APIEndpointDoc(
            endpoint_id="cluster_analyze",
            name="Analyze Cluster",
            method=HTTPMethod.GET,
            path="/cluster/analyze/{cluster_id}",
            section="cluster",
            summary="Analyze specific cluster",
            description="Provides detailed analysis of a detected cluster including members, behavior patterns, and risk assessment.",
            params=[{"name": "cluster_id", "type": "string", "required": True}],
            response_schema={
                "cluster_id": "string",
                "members": "array",
                "behavioral_profile": "object",
                "risk_assessment": "object",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["cluster", "analysis"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="hydra_hunt",
            name="Launch Threat Hunt",
            method=HTTPMethod.POST,
            path="/hydra/hunt",
            section="hydra",
            summary="Launch advanced threat hunting operation",
            description="Initiates comprehensive threat hunting across multiple chains and data sources.",
            body_schema={
                "hunt_name": "string",
                "targets": "array[string]",
                "hunt_parameters": "object",
            },
            response_schema={
                "hunt_id": "string",
                "status": "string",
                "initial_findings": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["hydra", "hunting", "investigation"],
        ),
        APIEndpointDoc(
            endpoint_id="hydra_status",
            name="Get Hunt Status",
            method=HTTPMethod.GET,
            path="/hydra/hunt/{hunt_id}",
            section="hydra",
            summary="Check threat hunt status",
            description="Retrieves current status and findings from an active threat hunt.",
            params=[{"name": "hunt_id", "type": "string", "required": True}],
            response_schema={
                "hunt_id": "string",
                "status": "string",
                "progress": "float",
                "findings": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["hydra", "status"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="constellation_graph",
            name="Get Entity Graph",
            method=HTTPMethod.GET,
            path="/constellation/graph/{entity_id}",
            section="constellation",
            summary="Retrieve entity relationship graph",
            description="Returns graph of entity relationships, connections, and interaction patterns.",
            params=[{"name": "entity_id", "type": "string", "required": True}],
            query_params=[
                {"name": "depth", "type": "integer", "required": False},
                {"name": "max_nodes", "type": "integer", "required": False},
            ],
            response_schema={
                "nodes": "array",
                "edges": "array",
                "graph_metrics": "object",
            },
            risk_level=RiskLevel.LOW,
            tags=["constellation", "graph", "relationships"],
        ),
        APIEndpointDoc(
            endpoint_id="constellation_path",
            name="Find Path Between Entities",
            method=HTTPMethod.POST,
            path="/constellation/path",
            section="constellation",
            summary="Find connection path between entities",
            description="Discovers shortest path and all paths between two entities in the relationship graph.",
            body_schema={
                "source_entity": "string",
                "target_entity": "string",
                "max_depth": "integer",
            },
            response_schema={
                "paths": "array",
                "shortest_path": "array",
                "path_analysis": "object",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["constellation", "path", "analysis"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="sentinel_alerts",
            name="Get Active Alerts",
            method=HTTPMethod.GET,
            path="/sentinel/alerts",
            section="sentinel",
            summary="Retrieve active security alerts",
            description="Returns all active alerts from automated threat detection systems.",
            query_params=[
                {"name": "severity", "type": "string", "required": False},
                {"name": "status", "type": "string", "required": False},
            ],
            response_schema={
                "alerts": "array",
                "total_count": "integer",
                "critical_count": "integer",
            },
            risk_level=RiskLevel.HIGH,
            tags=["sentinel", "alerts", "monitoring"],
        ),
        APIEndpointDoc(
            endpoint_id="sentinel_rules",
            name="Get Detection Rules",
            method=HTTPMethod.GET,
            path="/sentinel/rules",
            section="sentinel",
            summary="Retrieve active detection rules",
            description="Returns configured detection rules and their current status.",
            response_schema={
                "rules": "array",
                "active_rules": "integer",
                "rule_categories": "array",
            },
            risk_level=RiskLevel.LOW,
            tags=["sentinel", "rules"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="cortex_process",
            name="Process Intelligence",
            method=HTTPMethod.POST,
            path="/cortex/process",
            section="cortex",
            summary="Process raw intelligence data",
            description="Processes and enriches raw intelligence data through Cortex analysis pipeline.",
            body_schema={
                "data": "object",
                "processing_level": "basic|standard|advanced",
            },
            response_schema={
                "processed_data": "object",
                "enrichments": "array",
                "insights": "array",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["cortex", "processing", "intelligence"],
        ),
        APIEndpointDoc(
            endpoint_id="cortex_analyze",
            name="Analyze Intelligence",
            method=HTTPMethod.POST,
            path="/cortex/analyze",
            section="cortex",
            summary="Deep intelligence analysis",
            description="Performs deep analysis on intelligence data to extract patterns, anomalies, and insights.",
            body_schema={
                "intelligence_id": "string",
                "analysis_type": "array[string]",
            },
            response_schema={
                "analysis_results": "object",
                "patterns": "array",
                "anomalies": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["cortex", "analysis"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="genesis_reconstruct",
            name="Reconstruct Historical Data",
            method=HTTPMethod.POST,
            path="/genesis/reconstruct",
            section="genesis",
            summary="Reconstruct historical blockchain data",
            description="Rebuilds historical blockchain state and transaction history for forensic analysis.",
            body_schema={
                "chain": "string",
                "block_range": "object",
                "reconstruction_depth": "shallow|medium|deep",
            },
            response_schema={
                "reconstruction_id": "string",
                "status": "string",
                "estimated_time": "integer",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["genesis", "historical", "reconstruction"],
        ),
        APIEndpointDoc(
            endpoint_id="genesis_timeline",
            name="Get Historical Timeline",
            method=HTTPMethod.GET,
            path="/genesis/timeline/{entity_id}",
            section="genesis",
            summary="Retrieve complete historical timeline",
            description="Returns complete historical timeline of entity activity from genesis.",
            params=[{"name": "entity_id", "type": "string", "required": True}],
            response_schema={
                "timeline": "array",
                "total_events": "integer",
                "first_seen": "string",
                "last_seen": "string",
            },
            risk_level=RiskLevel.LOW,
            tags=["genesis", "timeline", "history"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="actor_profile",
            name="Get Actor Profile",
            method=HTTPMethod.GET,
            path="/actor/profile/{actor_id}",
            section="actor",
            summary="Retrieve threat actor profile",
            description="Returns comprehensive threat actor profile including TTPs, attribution, and activity history.",
            params=[{"name": "actor_id", "type": "string", "required": True}],
            response_schema={
                "actor_id": "string",
                "profile": "object",
                "ttps": "array",
                "attribution": "object",
                "activity_history": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["actor", "profiling", "attribution"],
        ),
        APIEndpointDoc(
            endpoint_id="actor_search",
            name="Search Threat Actors",
            method=HTTPMethod.POST,
            path="/actor/search",
            section="actor",
            summary="Search threat actor database",
            description="Searches threat actor database by TTPs, indicators, or behavioral patterns.",
            body_schema={
                "query": "string",
                "search_type": "ttp|indicator|behavior",
            },
            response_schema={
                "results": "array",
                "total_matches": "integer",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["actor", "search"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="oracle_forecast",
            name="Generate Forecast",
            method=HTTPMethod.POST,
            path="/oracle/forecast",
            section="oracle",
            summary="Generate predictive forecast",
            description="Generates predictive forecasts for threats, market movements, or entity behavior.",
            body_schema={
                "target": "string",
                "forecast_horizon": "integer (hours)",
                "confidence_threshold": "float",
            },
            response_schema={
                "forecast": "object",
                "confidence": "float",
                "scenarios": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["oracle", "forecast", "prediction"],
        ),
        APIEndpointDoc(
            endpoint_id="oracle_scenarios",
            name="Get Threat Scenarios",
            method=HTTPMethod.GET,
            path="/oracle/scenarios",
            section="oracle",
            summary="Retrieve predicted threat scenarios",
            description="Returns predicted threat scenarios and their probabilities.",
            response_schema={
                "scenarios": "array",
                "high_probability_threats": "array",
            },
            risk_level=RiskLevel.HIGH,
            tags=["oracle", "scenarios"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="ultrafusion_analyze",
            name="UltraFusion Analysis",
            method=HTTPMethod.POST,
            path="/ultrafusion/analyze",
            section="ultrafusion",
            summary="Advanced multi-dimensional analysis",
            description="Performs ultra-deep multi-dimensional analysis combining all GhostQuant capabilities.",
            body_schema={
                "target": "string",
                "dimensions": "array[string]",
                "depth": "integer (1-10)",
            },
            response_schema={
                "analysis_id": "string",
                "results": "object",
                "insights": "array",
                "risk_assessment": "object",
            },
            risk_level=RiskLevel.CRITICAL,
            tags=["ultrafusion", "advanced", "analysis"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="sales_create_lead",
            name="Create Sales Lead",
            method=HTTPMethod.POST,
            path="/sales/lead",
            section="sales",
            summary="Create new sales lead",
            description="Creates a new lead in the enterprise sales pipeline with automatic scoring.",
            body_schema={
                "name": "string",
                "organization": "string",
                "email": "string",
                "use_case": "string",
            },
            response_schema={
                "lead_id": "string",
                "lead_score": "float",
                "priority": "string",
            },
            risk_level=RiskLevel.LOW,
            tags=["sales", "crm"],
        ),
        APIEndpointDoc(
            endpoint_id="sales_list_leads",
            name="List Sales Leads",
            method=HTTPMethod.GET,
            path="/sales/leads",
            section="sales",
            summary="List all sales leads",
            description="Retrieves all leads with optional filtering by category, priority, or stage.",
            query_params=[
                {"name": "category", "type": "string", "required": False},
                {"name": "priority", "type": "string", "required": False},
            ],
            response_schema={
                "leads": "array",
                "total_count": "integer",
            },
            risk_level=RiskLevel.LOW,
            tags=["sales", "crm"],
        ),
        APIEndpointDoc(
            endpoint_id="sales_summary",
            name="Get Pipeline Summary",
            method=HTTPMethod.GET,
            path="/sales/summary",
            section="sales",
            summary="Get sales pipeline summary",
            description="Returns comprehensive sales pipeline metrics and analytics.",
            response_schema={
                "total_leads": "integer",
                "pipeline_value": "float",
                "conversion_rates": "object",
            },
            risk_level=RiskLevel.LOW,
            tags=["sales", "analytics"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="intel_feed",
            name="Get Intelligence Feed",
            method=HTTPMethod.GET,
            path="/intel/feed",
            section="intelligence",
            summary="Retrieve intelligence feed",
            description="Returns real-time intelligence feed with latest threats, alerts, and insights.",
            query_params=[
                {"name": "severity", "type": "string", "required": False},
                {"name": "limit", "type": "integer", "required": False},
            ],
            response_schema={
                "items": "array",
                "total_count": "integer",
            },
            risk_level=RiskLevel.MEDIUM,
            tags=["intelligence", "feed"],
        ),
        APIEndpointDoc(
            endpoint_id="intel_subscribe",
            name="Subscribe to Intelligence",
            method=HTTPMethod.POST,
            path="/intel/subscribe",
            section="intelligence",
            summary="Subscribe to intelligence topics",
            description="Subscribe to specific intelligence topics for real-time updates.",
            body_schema={
                "topics": "array[string]",
                "delivery_method": "webhook|websocket",
            },
            response_schema={
                "subscription_id": "string",
                "status": "string",
            },
            risk_level=RiskLevel.LOW,
            tags=["intelligence", "subscription"],
        ),
    ])
    
    endpoints.extend([
        APIEndpointDoc(
            endpoint_id="compliance_report",
            name="Generate Compliance Report",
            method=HTTPMethod.POST,
            path="/compliance/report",
            section="compliance",
            summary="Generate compliance report",
            description="Generates comprehensive compliance report for regulatory requirements.",
            body_schema={
                "report_type": "soc2|fedramp|cjis|gdpr",
                "date_range": "object",
            },
            response_schema={
                "report_id": "string",
                "status": "string",
                "download_url": "string",
            },
            risk_level=RiskLevel.LOW,
            tags=["compliance", "reporting"],
        ),
        APIEndpointDoc(
            endpoint_id="compliance_audit",
            name="Get Audit Trail",
            method=HTTPMethod.GET,
            path="/compliance/audit",
            section="compliance",
            summary="Retrieve audit trail",
            description="Returns detailed audit trail of all system activities.",
            query_params=[
                {"name": "start_date", "type": "string", "required": False},
                {"name": "end_date", "type": "string", "required": False},
            ],
            response_schema={
                "audit_entries": "array",
                "total_count": "integer",
            },
            risk_level=RiskLevel.LOW,
            tags=["compliance", "audit"],
        ),
    ])
    
    return endpoints


def get_endpoint_by_id(endpoint_id: str) -> APIEndpointDoc:
    """Get endpoint documentation by ID."""
    endpoints = get_all_endpoints()
    for endpoint in endpoints:
        if endpoint.endpoint_id == endpoint_id:
            return endpoint
    raise ValueError(f"Endpoint not found: {endpoint_id}")


def get_endpoints_by_section(section_id: str) -> List[APIEndpointDoc]:
    """Get all endpoints in a section."""
    endpoints = get_all_endpoints()
    return [e for e in endpoints if e.section == section_id]
