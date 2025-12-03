"""
Channel Partner Contract Compliance Engine
Global Distributor Edition (GDE)

Comprehensive compliance management for distributor contracts including
regulatory requirements, audit tracking, and certification management.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .contract_schema import (
    DistributorTier,
    RegionCode,
    ComplianceLevel,
    ComplianceRequirement,
    DistributorContract,
    DistributorProfile
)


class ComplianceEngine:
    """
    GhostQuant Contract Compliance Engine™
    
    Manages compliance requirements, certifications, audits, and
    regulatory adherence for global distributor contracts.
    """
    
    VERSION = "3.0.0"
    
    COMPLIANCE_FRAMEWORKS = {
        'GDPR': {
            'name': 'General Data Protection Regulation',
            'regions': [RegionCode.EMEA, RegionCode.DACH, RegionCode.NORDICS],
            'level': ComplianceLevel.STRICT,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Data processing agreements',
                'Privacy impact assessments',
                'Data subject rights procedures',
                'Breach notification procedures',
                'Records of processing activities'
            ]
        },
        'SOC 2': {
            'name': 'Service Organization Control 2',
            'regions': [RegionCode.AMERICAS, RegionCode.GLOBAL],
            'level': ComplianceLevel.ENHANCED,
            'certification_required': True,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Security policies and procedures',
                'Access controls',
                'Change management',
                'Risk assessment',
                'Incident response'
            ]
        },
        'ISO 27001': {
            'name': 'Information Security Management System',
            'regions': [RegionCode.GLOBAL],
            'level': ComplianceLevel.ENHANCED,
            'certification_required': True,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Information security policy',
                'Risk assessment and treatment',
                'Asset management',
                'Access control',
                'Cryptography'
            ]
        },
        'HIPAA': {
            'name': 'Health Insurance Portability and Accountability Act',
            'regions': [RegionCode.AMERICAS],
            'level': ComplianceLevel.HEALTHCARE,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Privacy Rule compliance',
                'Security Rule compliance',
                'Business Associate Agreements',
                'Breach notification',
                'Administrative safeguards'
            ]
        },
        'PCI DSS': {
            'name': 'Payment Card Industry Data Security Standard',
            'regions': [RegionCode.GLOBAL],
            'level': ComplianceLevel.FINANCIAL_SERVICES,
            'certification_required': True,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Network security',
                'Cardholder data protection',
                'Vulnerability management',
                'Access control',
                'Monitoring and testing'
            ]
        },
        'FedRAMP': {
            'name': 'Federal Risk and Authorization Management Program',
            'regions': [RegionCode.AMERICAS],
            'level': ComplianceLevel.GOVERNMENT,
            'certification_required': True,
            'audit_frequency': 'continuous',
            'key_requirements': [
                'Security assessment',
                'Authorization package',
                'Continuous monitoring',
                'Incident response',
                'Plan of action and milestones'
            ]
        },
        'CCPA': {
            'name': 'California Consumer Privacy Act',
            'regions': [RegionCode.AMERICAS],
            'level': ComplianceLevel.STANDARD,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Privacy notices',
                'Consumer rights procedures',
                'Data inventory',
                'Opt-out mechanisms',
                'Service provider agreements'
            ]
        },
        'PIPL': {
            'name': 'Personal Information Protection Law',
            'regions': [RegionCode.GREATER_CHINA],
            'level': ComplianceLevel.STRICT,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Consent management',
                'Cross-border transfer rules',
                'Data localization',
                'Security measures',
                'Individual rights'
            ]
        },
        'PDPA': {
            'name': 'Personal Data Protection Act',
            'regions': [RegionCode.ASEAN, RegionCode.APAC],
            'level': ComplianceLevel.STANDARD,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Consent requirements',
                'Purpose limitation',
                'Data protection policies',
                'Access and correction rights',
                'Data breach notification'
            ]
        },
        'LGPD': {
            'name': 'Lei Geral de Proteção de Dados',
            'regions': [RegionCode.LATAM],
            'level': ComplianceLevel.STANDARD,
            'certification_required': False,
            'audit_frequency': 'annual',
            'key_requirements': [
                'Legal basis for processing',
                'Data subject rights',
                'Data protection officer',
                'Security measures',
                'International transfers'
            ]
        }
    }
    
    TIER_COMPLIANCE_REQUIREMENTS = {
        DistributorTier.AUTHORIZED: {
            'required_frameworks': [],
            'recommended_frameworks': ['ISO 27001'],
            'audit_frequency': 'biennial',
            'self_assessment_allowed': True
        },
        DistributorTier.PREFERRED: {
            'required_frameworks': ['ISO 27001'],
            'recommended_frameworks': ['SOC 2'],
            'audit_frequency': 'annual',
            'self_assessment_allowed': True
        },
        DistributorTier.PREMIER: {
            'required_frameworks': ['ISO 27001', 'SOC 2'],
            'recommended_frameworks': ['ISO 22301'],
            'audit_frequency': 'annual',
            'self_assessment_allowed': False
        },
        DistributorTier.STRATEGIC: {
            'required_frameworks': ['ISO 27001', 'SOC 2'],
            'recommended_frameworks': ['ISO 22301', 'ISO 20000'],
            'audit_frequency': 'annual',
            'self_assessment_allowed': False
        },
        DistributorTier.GLOBAL_ELITE: {
            'required_frameworks': ['ISO 27001', 'SOC 2', 'ISO 22301'],
            'recommended_frameworks': ['ISO 20000', 'CMMI'],
            'audit_frequency': 'semi-annual',
            'self_assessment_allowed': False
        }
    }
    
    def __init__(self):
        self._compliance_records: Dict[str, Dict[str, Any]] = {}
        self._audit_history: List[Dict[str, Any]] = []
        self._certification_registry: Dict[str, List[Dict[str, Any]]] = {}
    
    def get_required_compliance(
        self,
        tier: DistributorTier,
        regions: List[RegionCode]
    ) -> List[ComplianceRequirement]:
        """
        Get required compliance frameworks for tier and regions
        
        Args:
            tier: Distributor tier
            regions: List of operating regions
        
        Returns:
            List of ComplianceRequirement objects
        """
        requirements = []
        tier_config = self.TIER_COMPLIANCE_REQUIREMENTS[tier]
        
        for framework_id in tier_config['required_frameworks']:
            if framework_id in self.COMPLIANCE_FRAMEWORKS:
                framework = self.COMPLIANCE_FRAMEWORKS[framework_id]
                requirements.append(self._create_compliance_requirement(
                    framework_id, framework, regions, is_required=True
                ))
        
        for region in regions:
            for framework_id, framework in self.COMPLIANCE_FRAMEWORKS.items():
                if region in framework['regions']:
                    existing = any(r.requirement_name == f"{framework_id} Compliance" for r in requirements)
                    if not existing:
                        requirements.append(self._create_compliance_requirement(
                            framework_id, framework, [region], is_required=True
                        ))
        
        return requirements
    
    def _create_compliance_requirement(
        self,
        framework_id: str,
        framework: Dict[str, Any],
        regions: List[RegionCode],
        is_required: bool = True
    ) -> ComplianceRequirement:
        """Create a ComplianceRequirement from framework definition"""
        
        return ComplianceRequirement(
            requirement_id=f"COMP-{secrets.token_hex(4).upper()}",
            requirement_name=f"{framework_id} Compliance",
            compliance_level=framework['level'],
            applicable_regions=regions,
            regulatory_framework=framework['name'],
            certification_required=framework['certification_required'],
            certification_name=framework_id if framework['certification_required'] else None,
            audit_frequency=framework['audit_frequency'],
            documentation_requirements=framework['key_requirements'],
            penalties_for_non_compliance="Contract suspension pending remediation; potential termination for repeated violations.",
            remediation_timeline_days=30,
            reporting_requirements=[
                f"Quarterly {framework_id} compliance status report",
                "Immediate notification of compliance incidents",
                f"Annual {framework_id} audit results"
            ]
        )
    
    def assess_distributor_compliance(
        self,
        distributor: DistributorProfile,
        tier: DistributorTier,
        regions: List[RegionCode]
    ) -> Dict[str, Any]:
        """
        Assess distributor's compliance readiness
        
        Args:
            distributor: Distributor profile
            tier: Target tier
            regions: Operating regions
        
        Returns:
            Compliance assessment results
        """
        required = self.get_required_compliance(tier, regions)
        
        assessment_results = []
        compliant_count = 0
        gaps = []
        
        for requirement in required:
            framework_name = requirement.requirement_name.replace(" Compliance", "")
            
            has_certification = framework_name in distributor.industry_certifications
            
            if requirement.certification_required:
                is_compliant = has_certification
            else:
                is_compliant = has_certification or True
            
            if is_compliant:
                compliant_count += 1
            else:
                gaps.append({
                    'framework': framework_name,
                    'requirement': requirement.requirement_name,
                    'certification_required': requirement.certification_required,
                    'remediation_steps': [
                        f"Obtain {framework_name} certification",
                        f"Implement {framework_name} controls",
                        "Schedule compliance audit"
                    ]
                })
            
            assessment_results.append({
                'requirement_id': requirement.requirement_id,
                'framework': framework_name,
                'required': True,
                'certification_required': requirement.certification_required,
                'has_certification': has_certification,
                'is_compliant': is_compliant,
                'compliance_level': requirement.compliance_level.value
            })
        
        compliance_score = (compliant_count / len(required) * 100) if required else 100
        
        return {
            'distributor_id': distributor.distributor_id,
            'distributor_name': distributor.company_name,
            'tier': tier.value,
            'regions': [r.value for r in regions],
            'assessment_date': datetime.utcnow().isoformat(),
            'total_requirements': len(required),
            'compliant_count': compliant_count,
            'compliance_score': round(compliance_score, 1),
            'is_fully_compliant': compliant_count == len(required),
            'assessment_results': assessment_results,
            'compliance_gaps': gaps,
            'recommendations': self._generate_compliance_recommendations(gaps, tier)
        }
    
    def _generate_compliance_recommendations(
        self,
        gaps: List[Dict[str, Any]],
        tier: DistributorTier
    ) -> List[str]:
        """Generate compliance recommendations based on gaps"""
        
        recommendations = []
        
        if not gaps:
            recommendations.append("Distributor meets all compliance requirements for the requested tier.")
            recommendations.append("Schedule annual compliance review to maintain certification status.")
            return recommendations
        
        for gap in gaps:
            framework = gap['framework']
            if gap['certification_required']:
                recommendations.append(
                    f"Priority: Obtain {framework} certification before contract execution."
                )
            else:
                recommendations.append(
                    f"Implement {framework} compliance controls within 90 days of contract start."
                )
        
        if len(gaps) > 2:
            recommendations.append(
                "Consider engaging a compliance consultant to accelerate certification process."
            )
        
        tier_config = self.TIER_COMPLIANCE_REQUIREMENTS[tier]
        if not tier_config['self_assessment_allowed']:
            recommendations.append(
                f"{tier.value} tier requires third-party audit verification."
            )
        
        return recommendations
    
    def register_certification(
        self,
        distributor_id: str,
        certification_name: str,
        certification_body: str,
        issue_date: str,
        expiry_date: str,
        certificate_number: str,
        scope: str
    ) -> Dict[str, Any]:
        """
        Register a compliance certification for a distributor
        
        Args:
            distributor_id: Distributor identifier
            certification_name: Name of certification
            certification_body: Issuing organization
            issue_date: Date issued
            expiry_date: Expiration date
            certificate_number: Certificate reference number
            scope: Scope of certification
        
        Returns:
            Certification record
        """
        cert_id = f"CERT-{secrets.token_hex(6).upper()}"
        
        certification = {
            'certification_id': cert_id,
            'distributor_id': distributor_id,
            'certification_name': certification_name,
            'certification_body': certification_body,
            'issue_date': issue_date,
            'expiry_date': expiry_date,
            'certificate_number': certificate_number,
            'scope': scope,
            'status': 'active',
            'registered_at': datetime.utcnow().isoformat(),
            'verified': False,
            'verification_date': None
        }
        
        if distributor_id not in self._certification_registry:
            self._certification_registry[distributor_id] = []
        
        self._certification_registry[distributor_id].append(certification)
        
        return certification
    
    def verify_certification(
        self,
        distributor_id: str,
        certification_id: str,
        verifier: Dict[str, str],
        verification_notes: str = ""
    ) -> Dict[str, Any]:
        """Verify a registered certification"""
        
        if distributor_id not in self._certification_registry:
            raise ValueError(f"No certifications found for distributor {distributor_id}")
        
        for cert in self._certification_registry[distributor_id]:
            if cert['certification_id'] == certification_id:
                cert['verified'] = True
                cert['verification_date'] = datetime.utcnow().isoformat()
                cert['verified_by'] = verifier
                cert['verification_notes'] = verification_notes
                return cert
        
        raise ValueError(f"Certification {certification_id} not found")
    
    def get_distributor_certifications(
        self,
        distributor_id: str,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all certifications for a distributor"""
        
        certs = self._certification_registry.get(distributor_id, [])
        
        if active_only:
            now = datetime.utcnow()
            certs = [
                c for c in certs
                if c['status'] == 'active' and
                datetime.fromisoformat(c['expiry_date']) > now
            ]
        
        return certs
    
    def schedule_audit(
        self,
        contract_id: str,
        distributor_id: str,
        audit_type: str,
        scheduled_date: str,
        auditor: Dict[str, str],
        scope: List[str]
    ) -> Dict[str, Any]:
        """
        Schedule a compliance audit
        
        Args:
            contract_id: Contract identifier
            distributor_id: Distributor identifier
            audit_type: Type of audit (internal, external, certification)
            scheduled_date: Scheduled audit date
            auditor: Auditor information
            scope: Audit scope items
        
        Returns:
            Audit record
        """
        audit_id = f"AUD-{secrets.token_hex(6).upper()}"
        
        audit = {
            'audit_id': audit_id,
            'contract_id': contract_id,
            'distributor_id': distributor_id,
            'audit_type': audit_type,
            'scheduled_date': scheduled_date,
            'auditor': auditor,
            'scope': scope,
            'status': 'scheduled',
            'created_at': datetime.utcnow().isoformat(),
            'findings': [],
            'recommendations': [],
            'completed_at': None,
            'report_url': None
        }
        
        self._audit_history.append(audit)
        
        return audit
    
    def record_audit_findings(
        self,
        audit_id: str,
        findings: List[Dict[str, Any]],
        recommendations: List[str],
        overall_rating: str,
        report_url: str = None
    ) -> Dict[str, Any]:
        """
        Record audit findings and complete audit
        
        Args:
            audit_id: Audit identifier
            findings: List of audit findings
            recommendations: List of recommendations
            overall_rating: Overall compliance rating
            report_url: URL to audit report
        
        Returns:
            Updated audit record
        """
        for audit in self._audit_history:
            if audit['audit_id'] == audit_id:
                audit['findings'] = findings
                audit['recommendations'] = recommendations
                audit['overall_rating'] = overall_rating
                audit['report_url'] = report_url
                audit['status'] = 'completed'
                audit['completed_at'] = datetime.utcnow().isoformat()
                return audit
        
        raise ValueError(f"Audit {audit_id} not found")
    
    def get_audit_history(
        self,
        distributor_id: str = None,
        contract_id: str = None,
        status: str = None
    ) -> List[Dict[str, Any]]:
        """Get audit history with optional filters"""
        
        audits = self._audit_history
        
        if distributor_id:
            audits = [a for a in audits if a['distributor_id'] == distributor_id]
        
        if contract_id:
            audits = [a for a in audits if a['contract_id'] == contract_id]
        
        if status:
            audits = [a for a in audits if a['status'] == status]
        
        return audits
    
    def check_compliance_status(
        self,
        contract: DistributorContract
    ) -> Dict[str, Any]:
        """
        Check current compliance status for a contract
        
        Args:
            contract: Contract to check
        
        Returns:
            Compliance status report
        """
        requirements = contract.terms.compliance_requirements
        distributor = contract.distributor
        
        status_items = []
        compliant_count = 0
        
        for req in requirements:
            framework_name = req.requirement_name.replace(" Compliance", "")
            
            has_cert = framework_name in distributor.industry_certifications
            
            certs = self.get_distributor_certifications(distributor.distributor_id)
            cert_valid = any(
                c['certification_name'] == framework_name and c['verified']
                for c in certs
            )
            
            is_compliant = has_cert or cert_valid or not req.certification_required
            
            if is_compliant:
                compliant_count += 1
            
            status_items.append({
                'requirement_id': req.requirement_id,
                'requirement_name': req.requirement_name,
                'compliance_level': req.compliance_level.value,
                'certification_required': req.certification_required,
                'is_compliant': is_compliant,
                'has_certification': has_cert,
                'certification_verified': cert_valid,
                'audit_frequency': req.audit_frequency,
                'last_audit': None,
                'next_audit_due': None
            })
        
        compliance_score = (compliant_count / len(requirements) * 100) if requirements else 100
        
        return {
            'contract_id': contract.contract_id,
            'distributor_id': distributor.distributor_id,
            'check_date': datetime.utcnow().isoformat(),
            'total_requirements': len(requirements),
            'compliant_count': compliant_count,
            'compliance_score': round(compliance_score, 1),
            'is_fully_compliant': compliant_count == len(requirements),
            'status_items': status_items,
            'pending_audits': len([
                a for a in self._audit_history
                if a['distributor_id'] == distributor.distributor_id and a['status'] == 'scheduled'
            ]),
            'risk_level': self._calculate_risk_level(compliance_score)
        }
    
    def _calculate_risk_level(self, compliance_score: float) -> str:
        """Calculate risk level based on compliance score"""
        if compliance_score >= 95:
            return 'low'
        elif compliance_score >= 80:
            return 'medium'
        elif compliance_score >= 60:
            return 'high'
        else:
            return 'critical'
    
    def generate_compliance_report(
        self,
        contract: DistributorContract,
        report_period: str = "quarterly"
    ) -> Dict[str, Any]:
        """
        Generate compliance report for a contract
        
        Args:
            contract: Contract to report on
            report_period: Reporting period
        
        Returns:
            Compliance report
        """
        status = self.check_compliance_status(contract)
        audits = self.get_audit_history(
            distributor_id=contract.distributor.distributor_id
        )
        certs = self.get_distributor_certifications(
            contract.distributor.distributor_id
        )
        
        return {
            'report_id': f"RPT-{secrets.token_hex(6).upper()}",
            'contract_id': contract.contract_id,
            'distributor_name': contract.distributor.company_name,
            'report_period': report_period,
            'generated_at': datetime.utcnow().isoformat(),
            'compliance_summary': {
                'overall_score': status['compliance_score'],
                'risk_level': status['risk_level'],
                'total_requirements': status['total_requirements'],
                'compliant_count': status['compliant_count']
            },
            'certification_summary': {
                'total_certifications': len(certs),
                'verified_certifications': len([c for c in certs if c['verified']]),
                'expiring_soon': len([
                    c for c in certs
                    if datetime.fromisoformat(c['expiry_date']) < datetime.utcnow() + timedelta(days=90)
                ])
            },
            'audit_summary': {
                'total_audits': len(audits),
                'completed_audits': len([a for a in audits if a['status'] == 'completed']),
                'scheduled_audits': len([a for a in audits if a['status'] == 'scheduled'])
            },
            'detailed_status': status['status_items'],
            'recommendations': self._generate_report_recommendations(status, certs, audits)
        }
    
    def _generate_report_recommendations(
        self,
        status: Dict[str, Any],
        certs: List[Dict[str, Any]],
        audits: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations for compliance report"""
        
        recommendations = []
        
        if status['compliance_score'] < 100:
            non_compliant = [
                s['requirement_name'] for s in status['status_items']
                if not s['is_compliant']
            ]
            recommendations.append(
                f"Address compliance gaps in: {', '.join(non_compliant)}"
            )
        
        expiring_certs = [
            c for c in certs
            if datetime.fromisoformat(c['expiry_date']) < datetime.utcnow() + timedelta(days=90)
        ]
        if expiring_certs:
            recommendations.append(
                f"Renew expiring certifications: {', '.join(c['certification_name'] for c in expiring_certs)}"
            )
        
        unverified = [c for c in certs if not c['verified']]
        if unverified:
            recommendations.append(
                f"Submit verification for: {', '.join(c['certification_name'] for c in unverified)}"
            )
        
        if not recommendations:
            recommendations.append("Compliance status is healthy. Continue regular monitoring.")
        
        return recommendations
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'frameworks_configured': len(self.COMPLIANCE_FRAMEWORKS),
            'tier_requirements_configured': len(self.TIER_COMPLIANCE_REQUIREMENTS),
            'active_certifications': sum(len(c) for c in self._certification_registry.values()),
            'total_audits': len(self._audit_history),
            'pending_audits': len([a for a in self._audit_history if a['status'] == 'scheduled'])
        }
