"""
API Documentation Engine
Core engine for building and managing API documentation.
"""

from typing import List, Dict, Any
from datetime import datetime
from .apidocs_schema import APIDocsSummary, APIEndpointDoc, APISection
from .apidocs_registry import get_all_endpoints, get_all_sections, get_endpoints_by_section
from .apidocs_examples import CodeExampleGenerator


class APIDocsEngine:
    """
    Core API documentation engine.
    
    Aggregates endpoints, generates examples, builds documentation datasets,
    and provides developer resources.
    """
    
    def __init__(self, api_base_url: str = "https://api.ghostquant.ai"):
        self.api_base_url = api_base_url
        self.example_generator = CodeExampleGenerator(api_base_url)
    
    def build_full_documentation(self) -> Dict[str, Any]:
        """
        Build complete documentation dataset.
        
        Returns:
            Dict: Complete documentation
        """
        endpoints = get_all_endpoints()
        sections = get_all_sections()
        
        for endpoint in endpoints:
            endpoint.code_examples = self.example_generator.generate_all_examples(endpoint)
        
        return {
            "metadata": {
                "title": "GhostQuant API Documentation",
                "version": "1.0.0",
                "description": "Complete API reference for GhostQuant Enterprise Intelligence Platform",
                "base_url": self.api_base_url,
                "generated_at": datetime.utcnow().isoformat(),
            },
            "sections": [s.dict() for s in sections],
            "endpoints": [e.dict() for e in endpoints],
            "total_endpoints": len(endpoints),
            "total_sections": len(sections),
        }
    
    def generate_summary(self) -> APIDocsSummary:
        """
        Generate documentation summary.
        
        Returns:
            APIDocsSummary: Documentation summary
        """
        endpoints = get_all_endpoints()
        sections = get_all_sections()
        
        endpoints_by_section = {}
        for section in sections:
            section_endpoints = get_endpoints_by_section(section.section_id)
            endpoints_by_section[section.section_id] = len(section_endpoints)
        
        endpoints_by_method = {}
        for endpoint in endpoints:
            method = endpoint.method.value
            endpoints_by_method[method] = endpoints_by_method.get(method, 0) + 1
        
        endpoints_by_risk = {}
        for endpoint in endpoints:
            risk = endpoint.risk_level.value
            endpoints_by_risk[risk] = endpoints_by_risk.get(risk, 0) + 1
        
        documented_endpoints = len([e for e in endpoints if e.description])
        endpoints_with_examples = len([e for e in endpoints if e.code_examples])
        
        top_endpoints = self._get_top_endpoints(endpoints)
        recommended_endpoints = self._get_recommended_endpoints(endpoints)
        
        return APIDocsSummary(
            timestamp=datetime.utcnow(),
            total_endpoints=len(endpoints),
            total_sections=len(sections),
            endpoints_by_section=endpoints_by_section,
            endpoints_by_method=endpoints_by_method,
            endpoints_by_risk=endpoints_by_risk,
            documented_endpoints=documented_endpoints,
            endpoints_with_examples=endpoints_with_examples,
            endpoints_with_tests=0,
            top_endpoints=top_endpoints,
            recommended_endpoints=recommended_endpoints,
            sections=[s.dict() for s in sections],
        )
    
    def _get_top_endpoints(self, endpoints: List[APIEndpointDoc]) -> List[Dict[str, Any]]:
        """Get top 20 most important endpoints."""
        scored_endpoints = []
        for endpoint in endpoints:
            score = 0
            
            if endpoint.risk_level.value == "critical":
                score += 100
            elif endpoint.risk_level.value == "high":
                score += 75
            elif endpoint.risk_level.value == "medium":
                score += 50
            
            score += len(endpoint.use_cases) * 10
            
            score += len(endpoint.tags) * 5
            
            scored_endpoints.append((score, endpoint))
        
        scored_endpoints.sort(key=lambda x: x[0], reverse=True)
        
        return [
            {
                "endpoint_id": e.endpoint_id,
                "name": e.name,
                "path": e.path,
                "method": e.method.value,
                "section": e.section,
                "summary": e.summary,
                "risk_level": e.risk_level.value,
            }
            for _, e in scored_endpoints[:20]
        ]
    
    def _get_recommended_endpoints(self, endpoints: List[APIEndpointDoc]) -> List[Dict[str, Any]]:
        """Get recommended endpoints for institutions."""
        recommended = []
        
        priority_sections = ["prediction", "dna", "correlation", "sentinel", "compliance"]
        
        for endpoint in endpoints:
            if endpoint.section in priority_sections:
                recommended.append({
                    "endpoint_id": endpoint.endpoint_id,
                    "name": endpoint.name,
                    "path": endpoint.path,
                    "method": endpoint.method.value,
                    "section": endpoint.section,
                    "summary": endpoint.summary,
                    "use_cases": endpoint.use_cases,
                })
        
        return recommended[:15]
    
    def generate_quickstart(self) -> Dict[str, Any]:
        """
        Generate quickstart guide.
        
        Returns:
            Dict: Quickstart guide
        """
        return {
            "title": "GhostQuant API Quickstart",
            "steps": [
                {
                    "step": 1,
                    "title": "Get API Access",
                    "description": "Contact sales@ghostquant.ai for API credentials",
                },
                {
                    "step": 2,
                    "title": "Install Client Library",
                    "description": "Install the GhostQuant Python client",
                    "code": "pip install ghostquant-client",
                },
                {
                    "step": 3,
                    "title": "Make Your First Request",
                    "description": "Test the API with a simple prediction request",
                    "code": '''import requests

url = "https://api.ghostquant.ai/predict/entity"
payload = {
    "entity_id": "0x1234...",
    "entity_type": "wallet"
}

response = requests.post(url, json=payload)
print(response.json())''',
                },
                {
                    "step": 4,
                    "title": "Explore the Documentation",
                    "description": "Browse the complete API reference to discover all capabilities",
                },
            ],
            "next_steps": [
                "Review authentication requirements",
                "Explore prediction endpoints",
                "Set up real-time intelligence feeds",
                "Configure compliance reporting",
            ],
        }
    
    def generate_top_20_actions(self) -> List[Dict[str, Any]]:
        """
        Generate top 20 intelligence queries.
        
        Returns:
            List: Top 20 actions
        """
        return [
            {
                "rank": 1,
                "action": "Predict Entity Risk",
                "endpoint": "/predict/entity",
                "use_case": "Pre-transaction risk assessment",
            },
            {
                "rank": 2,
                "action": "Get Behavioral DNA Profile",
                "endpoint": "/dna/profile/{entity_id}",
                "use_case": "Entity behavioral analysis",
            },
            {
                "rank": 3,
                "action": "Correlate Events",
                "endpoint": "/correlation/events",
                "use_case": "Cross-chain attack detection",
            },
            {
                "rank": 4,
                "action": "Get Active Threats",
                "endpoint": "/radar/threats",
                "use_case": "Real-time threat monitoring",
            },
            {
                "rank": 5,
                "action": "Detect Entity Clusters",
                "endpoint": "/cluster/detect",
                "use_case": "Sybil network detection",
            },
            {
                "rank": 6,
                "action": "Get Entity Graph",
                "endpoint": "/constellation/graph/{entity_id}",
                "use_case": "Relationship mapping",
            },
            {
                "rank": 7,
                "action": "Get Active Alerts",
                "endpoint": "/sentinel/alerts",
                "use_case": "Security monitoring",
            },
            {
                "rank": 8,
                "action": "Predict Token Risk",
                "endpoint": "/predict/token",
                "use_case": "Token due diligence",
            },
            {
                "rank": 9,
                "action": "Multi-Source Fusion Analysis",
                "endpoint": "/fusion/analyze",
                "use_case": "Comprehensive threat assessment",
            },
            {
                "rank": 10,
                "action": "Launch Threat Hunt",
                "endpoint": "/hydra/hunt",
                "use_case": "Advanced threat hunting",
            },
            {
                "rank": 11,
                "action": "Get Threat Actor Profile",
                "endpoint": "/actor/profile/{actor_id}",
                "use_case": "Adversary attribution",
            },
            {
                "rank": 12,
                "action": "Generate Forecast",
                "endpoint": "/oracle/forecast",
                "use_case": "Predictive intelligence",
            },
            {
                "rank": 13,
                "action": "Compare DNA Profiles",
                "endpoint": "/dna/compare",
                "use_case": "Related actor identification",
            },
            {
                "rank": 14,
                "action": "Find Path Between Entities",
                "endpoint": "/constellation/path",
                "use_case": "Connection discovery",
            },
            {
                "rank": 15,
                "action": "Predict Transaction Risk",
                "endpoint": "/predict/transaction",
                "use_case": "Real-time transaction screening",
            },
            {
                "rank": 16,
                "action": "Get Threat Heatmap",
                "endpoint": "/radar/heatmap",
                "use_case": "Geographic threat visualization",
            },
            {
                "rank": 17,
                "action": "Process Intelligence",
                "endpoint": "/cortex/process",
                "use_case": "Intelligence enrichment",
            },
            {
                "rank": 18,
                "action": "Reconstruct Historical Data",
                "endpoint": "/genesis/reconstruct",
                "use_case": "Forensic analysis",
            },
            {
                "rank": 19,
                "action": "Generate Compliance Report",
                "endpoint": "/compliance/report",
                "use_case": "Regulatory reporting",
            },
            {
                "rank": 20,
                "action": "UltraFusion Analysis",
                "endpoint": "/ultrafusion/analyze",
                "use_case": "Advanced multi-dimensional analysis",
            },
        ]
    
    def generate_console_config(self) -> Dict[str, Any]:
        """
        Generate API console configuration.
        
        Returns:
            Dict: Console configuration
        """
        return {
            "api_base_url": self.api_base_url,
            "default_headers": {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            "auth_required": False,
            "rate_limits": {
                "requests_per_minute": 60,
                "requests_per_hour": 1000,
            },
            "supported_languages": [
                "python",
                "javascript",
                "curl",
                "go",
                "java",
            ],
            "features": {
                "live_testing": True,
                "code_generation": True,
                "response_formatting": True,
                "error_handling": True,
            },
        }
