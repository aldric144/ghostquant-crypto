"""
Proposal Cost Engine

Implements detailed cost modeling, multi-year pricing, labor categories,
FTE modeling, ODC modeling, travel/data/security cost estimation, and cost risk classification.
"""

from typing import Dict, Any, List
from datetime import datetime
from .proposal_schema import ProposalCostBreakdown


class ProposalCostEngine:
    """Detailed cost modeling and pricing engine"""
    
    def __init__(self):
        self.labor_rates = {
            "program_manager": 250,
            "technical_lead": 225,
            "senior_engineer": 200,
            "engineer": 175,
            "security_specialist": 200,
            "qa_engineer": 150,
            "training_specialist": 175,
            "support_engineer": 150
        }
        
        self.standard_hours_per_year = 2080
    
    def calculate_labor_costs(self, fte_breakdown: Dict[str, float], years: int = 3) -> Dict[str, Any]:
        """
        Calculate detailed labor costs.
        
        Args:
            fte_breakdown: Dictionary of role -> FTE count
            years: Number of years
            
        Returns:
            Labor cost breakdown
        """
        labor_costs = {}
        total_annual = 0
        
        for role, fte_count in fte_breakdown.items():
            rate = self.labor_rates.get(role, 175)
            annual_cost = rate * self.standard_hours_per_year * fte_count
            
            labor_costs[role] = {
                "fte": fte_count,
                "rate": rate,
                "hours_per_year": self.standard_hours_per_year * fte_count,
                "annual_cost": annual_cost,
                "total_cost": annual_cost * years
            }
            
            total_annual += annual_cost
        
        labor_costs["total_annual"] = total_annual
        labor_costs["total_all_years"] = total_annual * years
        
        return labor_costs
    
    def calculate_odc_costs(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Other Direct Costs (ODC).
        
        Args:
            requirements: Cost requirements
            
        Returns:
            ODC breakdown
        """
        odc_costs = {
            "cloud_infrastructure": {
                "compute": 120000,
                "storage": 60000,
                "networking": 40000,
                "total": 220000
            },
            "software_licenses": {
                "development_tools": 30000,
                "security_tools": 20000,
                "monitoring_tools": 10000,
                "total": 60000
            },
            "third_party_services": {
                "data_feeds": 30000,
                "api_services": 15000,
                "support_services": 5000,
                "total": 50000
            },
            "total": 330000
        }
        
        return odc_costs
    
    def calculate_travel_costs(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate travel costs.
        
        Args:
            requirements: Travel requirements
            
        Returns:
            Travel cost breakdown
        """
        travel_costs = {
            "on_site_visits": {
                "trips_per_year": 12,
                "cost_per_trip": 2500,
                "annual_cost": 30000
            },
            "training_travel": {
                "trips_per_year": 8,
                "cost_per_trip": 2500,
                "annual_cost": 20000
            },
            "emergency_support": {
                "trips_per_year": 4,
                "cost_per_trip": 3000,
                "annual_cost": 12000
            },
            "total_annual": 62000
        }
        
        return travel_costs
    
    def calculate_data_costs(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate data storage and bandwidth costs.
        
        Args:
            requirements: Data requirements
            
        Returns:
            Data cost breakdown
        """
        data_costs = {
            "storage": {
                "capacity_tb": 100,
                "cost_per_tb": 100,
                "annual_cost": 10000
            },
            "bandwidth": {
                "monthly_gb": 10000,
                "cost_per_gb": 0.05,
                "annual_cost": 6000
            },
            "backup": {
                "capacity_tb": 50,
                "cost_per_tb": 80,
                "annual_cost": 4000
            },
            "total_annual": 20000
        }
        
        return data_costs
    
    def calculate_security_costs(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate security-related costs.
        
        Args:
            requirements: Security requirements
            
        Returns:
            Security cost breakdown
        """
        security_costs = {
            "security_tools": {
                "siem": 15000,
                "vulnerability_scanning": 8000,
                "penetration_testing": 12000,
                "total": 35000
            },
            "security_assessments": {
                "annual_audit": 25000,
                "penetration_tests": 15000,
                "compliance_reviews": 10000,
                "total": 50000
            },
            "security_training": {
                "staff_training": 5000,
                "certifications": 3000,
                "total": 8000
            },
            "total_annual": 93000
        }
        
        return security_costs
    
    def model_multi_year_pricing(self, base_costs: Dict[str, Any], 
                                 years: int = 3, 
                                 discount_rate: float = 0.05) -> List[Dict[str, Any]]:
        """
        Model multi-year pricing with discounts.
        
        Args:
            base_costs: Base annual costs
            years: Number of years
            discount_rate: Annual discount rate
            
        Returns:
            Year-by-year cost breakdown
        """
        yearly_costs = []
        
        for year in range(1, years + 1):
            discount = 0 if year == 1 else discount_rate * (year - 1)
            
            year_costs = {
                "year": year,
                "labor": base_costs.get("labor", 0) * (1 - discount),
                "odc": base_costs.get("odc", 0),
                "travel": base_costs.get("travel", 0),
                "data": base_costs.get("data", 0),
                "security": base_costs.get("security", 0),
                "discount_percentage": discount * 100,
                "total": 0
            }
            
            year_costs["total"] = sum([
                year_costs["labor"],
                year_costs["odc"],
                year_costs["travel"],
                year_costs["data"],
                year_costs["security"]
            ])
            
            yearly_costs.append(year_costs)
        
        return yearly_costs
    
    def classify_cost_risk(self, cost_breakdown: Dict[str, Any]) -> str:
        """
        Classify cost risk level.
        
        Args:
            cost_breakdown: Cost breakdown data
            
        Returns:
            Risk classification (LOW, MEDIUM, HIGH)
        """
        total_cost = cost_breakdown.get("total_cost", 0)
        
        if total_cost < 1000000:
            return "LOW"
        elif total_cost < 5000000:
            return "MEDIUM"
        else:
            return "HIGH"
    
    def generate_cost_breakdown(self, requirements: Dict[str, Any]) -> ProposalCostBreakdown:
        """
        Generate complete cost breakdown.
        
        Args:
            requirements: Cost requirements
            
        Returns:
            Complete cost breakdown
        """
        fte_breakdown = requirements.get("fte_breakdown", {
            "program_manager": 1,
            "technical_lead": 1,
            "senior_engineer": 2,
            "engineer": 2,
            "security_specialist": 1,
            "qa_engineer": 1,
            "support_engineer": 2
        })
        
        labor = self.calculate_labor_costs(fte_breakdown, years=3)
        odc = self.calculate_odc_costs(requirements)
        travel = self.calculate_travel_costs(requirements)
        data = self.calculate_data_costs(requirements)
        security = self.calculate_security_costs(requirements)
        
        total_annual = (
            labor["total_annual"] +
            odc["total"] +
            travel["total_annual"] +
            data["total_annual"] +
            security["total_annual"]
        )
        
        total_cost = total_annual * 3
        
        base_costs = {
            "labor": labor["total_annual"],
            "odc": odc["total"],
            "travel": travel["total_annual"],
            "data": data["total_annual"],
            "security": security["total_annual"]
        }
        
        cost_by_year = self.model_multi_year_pricing(base_costs, years=3)
        
        breakdown = ProposalCostBreakdown(
            cost_id=f"COST-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            labor_costs=labor,
            odc_costs=odc,
            travel_costs=travel,
            data_costs=data,
            security_costs=security,
            total_cost=total_cost,
            cost_by_year=cost_by_year,
            fte_breakdown=fte_breakdown,
            cost_risk_level=self.classify_cost_risk({"total_cost": total_cost}),
            generated_at=datetime.utcnow().isoformat() + "Z",
            metadata={"requirements": requirements}
        )
        
        return breakdown
    
    def calculate_roi(self, costs: Dict[str, Any], benefits: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate return on investment.
        
        Args:
            costs: Total costs
            benefits: Expected benefits
            
        Returns:
            ROI analysis
        """
        total_cost = costs.get("total_cost", 0)
        total_benefit = benefits.get("total_benefit", 0)
        
        roi_percentage = ((total_benefit - total_cost) / total_cost) * 100 if total_cost > 0 else 0
        payback_period = total_cost / (total_benefit / 3) if total_benefit > 0 else 0
        
        return {
            "total_cost": total_cost,
            "total_benefit": total_benefit,
            "net_benefit": total_benefit - total_cost,
            "roi_percentage": roi_percentage,
            "payback_period_years": payback_period,
            "benefit_cost_ratio": total_benefit / total_cost if total_cost > 0 else 0
        }
