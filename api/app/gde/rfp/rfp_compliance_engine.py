"""
RFP Compliance Engine

Validates requirements, scores compliance, and generates compliance matrices.
"""

from typing import List, Dict, Any
from enum import Enum


class ComplianceStatus(str, Enum):
    """Compliance status levels"""
    EXCEEDS = "EXCEEDS"
    MEETS = "MEETS"
    PARTIAL = "PARTIAL"
    DOES_NOT_MEET = "DOES NOT MEET"
    OUT_OF_SCOPE = "OUT OF SCOPE"


class RiskLevel(str, Enum):
    """Risk classification levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RFPComplianceEngine:
    """
    RFP Compliance Engine
    
    Validates requirements, scores compliance, and generates compliance matrices.
    """
    
    def __init__(self):
        """Initialize compliance engine"""
        self.compliance_rules = {}
        self.risk_thresholds = {
            "critical": 0.5,
            "high": 0.7,
            "medium": 0.85,
            "low": 1.0
        }
        
    def validate_requirements(self, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate RFP requirements.
        
        Args:
            requirements: List of requirement dictionaries
            
        Returns:
            Validation results
        """
        validation_results = {
            "valid": True,
            "total_requirements": len(requirements),
            "mandatory_requirements": 0,
            "optional_requirements": 0,
            "issues": []
        }
        
        for idx, req in enumerate(requirements):
            if not req.get("requirement_id"):
                validation_results["issues"].append({
                    "index": idx,
                    "field": "requirement_id",
                    "message": "Missing requirement_id"
                })
                validation_results["valid"] = False
                
            if not req.get("description"):
                validation_results["issues"].append({
                    "index": idx,
                    "field": "description",
                    "message": "Missing requirement description"
                })
                validation_results["valid"] = False
                
            if req.get("mandatory", True):
                validation_results["mandatory_requirements"] += 1
            else:
                validation_results["optional_requirements"] += 1
                
        return validation_results
        
    def score_requirements(self, requirements: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Score compliance for requirements.
        
        Args:
            requirements: List of requirements
            responses: List of responses
            
        Returns:
            Scoring results
        """
        response_map = {r.get("requirement_id"): r for r in responses}
        
        scores = {
            "total_requirements": len(requirements),
            "scored_requirements": 0,
            "exceeds_count": 0,
            "meets_count": 0,
            "partial_count": 0,
            "does_not_meet_count": 0,
            "out_of_scope_count": 0,
            "unscored_count": 0,
            "weighted_score": 0.0,
            "total_weight": 0.0,
            "compliance_percentage": 0.0,
            "requirement_scores": []
        }
        
        for req in requirements:
            req_id = req.get("requirement_id")
            weight = req.get("weight", 1.0)
            mandatory = req.get("mandatory", True)
            
            response = response_map.get(req_id)
            
            if not response:
                scores["unscored_count"] += 1
                scores["requirement_scores"].append({
                    "requirement_id": req_id,
                    "status": None,
                    "score": 0.0,
                    "weight": weight,
                    "mandatory": mandatory
                })
                continue
                
            status = response.get("compliance_status", ComplianceStatus.DOES_NOT_MEET)
            
            status_scores = {
                ComplianceStatus.EXCEEDS: 1.2,
                ComplianceStatus.MEETS: 1.0,
                ComplianceStatus.PARTIAL: 0.5,
                ComplianceStatus.DOES_NOT_MEET: 0.0,
                ComplianceStatus.OUT_OF_SCOPE: 0.0
            }
            
            score = status_scores.get(status, 0.0)
            weighted_score = score * weight
            
            scores["scored_requirements"] += 1
            scores["total_weight"] += weight
            scores["weighted_score"] += weighted_score
            
            if status == ComplianceStatus.EXCEEDS:
                scores["exceeds_count"] += 1
            elif status == ComplianceStatus.MEETS:
                scores["meets_count"] += 1
            elif status == ComplianceStatus.PARTIAL:
                scores["partial_count"] += 1
            elif status == ComplianceStatus.DOES_NOT_MEET:
                scores["does_not_meet_count"] += 1
            elif status == ComplianceStatus.OUT_OF_SCOPE:
                scores["out_of_scope_count"] += 1
                
            scores["requirement_scores"].append({
                "requirement_id": req_id,
                "status": status,
                "score": score,
                "weight": weight,
                "weighted_score": weighted_score,
                "mandatory": mandatory
            })
            
        if scores["total_weight"] > 0:
            scores["compliance_percentage"] = (scores["weighted_score"] / scores["total_weight"]) * 100
        else:
            scores["compliance_percentage"] = 0.0
            
        return scores
        
    def generate_matrix(self, requirements: List[Dict[str, Any]], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate compliance matrix.
        
        Args:
            requirements: List of requirements
            responses: List of responses
            
        Returns:
            Compliance matrix
        """
        scores = self.score_requirements(requirements, responses)
        
        response_map = {r.get("requirement_id"): r for r in responses}
        
        matrix_rows = []
        for req in requirements:
            req_id = req.get("requirement_id")
            response = response_map.get(req_id)
            
            row = {
                "requirement_id": req_id,
                "section": req.get("section", ""),
                "description": req.get("description", ""),
                "mandatory": req.get("mandatory", True),
                "weight": req.get("weight", 1.0),
                "compliance_status": response.get("compliance_status") if response else None,
                "response_text": response.get("response_text", "") if response else "",
                "risk_level": response.get("risk_level", RiskLevel.LOW) if response else RiskLevel.HIGH,
                "notes": response.get("notes", "") if response else ""
            }
            
            matrix_rows.append(row)
            
        risk_level = self.classify_risk(scores)
        
        matrix = {
            "requirements": matrix_rows,
            "summary": scores,
            "risk_level": risk_level,
            "generated_at": self._get_timestamp()
        }
        
        return matrix
        
    def classify_risk(self, scores: Dict[str, Any]) -> str:
        """
        Classify overall risk level.
        
        Args:
            scores: Scoring results
            
        Returns:
            Risk level (low, medium, high, critical)
        """
        compliance_pct = scores.get("compliance_percentage", 0.0) / 100.0
        
        if compliance_pct >= self.risk_thresholds["low"]:
            return RiskLevel.LOW
        elif compliance_pct >= self.risk_thresholds["medium"]:
            return RiskLevel.MEDIUM
        elif compliance_pct >= self.risk_thresholds["high"]:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL
            
    def build_compliance_report(self, matrix: Dict[str, Any]) -> str:
        """
        Build compliance report text.
        
        Args:
            matrix: Compliance matrix
            
        Returns:
            Formatted compliance report
        """
        summary = matrix.get("summary", {})
        risk_level = matrix.get("risk_level", RiskLevel.MEDIUM)
        
        report_lines = [
            "# RFP Compliance Report",
            "",
            f"**Generated**: {matrix.get('generated_at', 'N/A')}",
            f"**Overall Risk Level**: {risk_level}",
            "",
            "## Summary",
            "",
            f"- **Total Requirements**: {summary.get('total_requirements', 0)}",
            f"- **Scored Requirements**: {summary.get('scored_requirements', 0)}",
            f"- **Compliance Percentage**: {summary.get('compliance_percentage', 0.0):.1f}%",
            "",
            "### Compliance Breakdown",
            "",
            f"- **EXCEEDS**: {summary.get('exceeds_count', 0)} requirements",
            f"- **MEETS**: {summary.get('meets_count', 0)} requirements",
            f"- **PARTIAL**: {summary.get('partial_count', 0)} requirements",
            f"- **DOES NOT MEET**: {summary.get('does_not_meet_count', 0)} requirements",
            f"- **OUT OF SCOPE**: {summary.get('out_of_scope_count', 0)} requirements",
            f"- **UNSCORED**: {summary.get('unscored_count', 0)} requirements",
            "",
            "## Detailed Matrix",
            ""
        ]
        
        for row in matrix.get("requirements", []):
            status = row.get("compliance_status", "UNSCORED")
            mandatory = "MANDATORY" if row.get("mandatory") else "OPTIONAL"
            
            report_lines.extend([
                f"### {row.get('requirement_id')} - {mandatory}",
                "",
                f"**Section**: {row.get('section')}",
                f"**Status**: {status}",
                f"**Risk Level**: {row.get('risk_level')}",
                "",
                f"**Requirement**: {row.get('description')}",
                "",
                f"**Response**: {row.get('response_text', 'No response provided')}",
                "",
                "---",
                ""
            ])
            
        return "\n".join(report_lines)
        
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"
