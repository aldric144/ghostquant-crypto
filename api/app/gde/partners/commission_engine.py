"""
Commission Engine for Partner Program
Pure Python calculations for tiered commissions, bonuses, MDF, and margins
"""
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from enum import Enum

from .partner_schema import PartnerTierLevel


class Sector(str, Enum):
    GOVERNMENT = "government"
    PRIVATE = "private"


@dataclass
class Deal:
    deal_id: str
    amount: float
    sector: Sector
    region: str
    is_new_business: bool
    registered: bool
    term_months: int
    tier: PartnerTierLevel


@dataclass
class CommissionResult:
    deal_id: str
    base_commission: float
    registration_bonus: float
    renewal_adjustment: float
    volume_bonus: float
    sector_adjustment: float
    total_commission: float
    mdf_allocation: float
    reseller_margin: float
    notes: List[str]


class CommissionEngine:
    def __init__(self,
                 tier_rates: Dict[PartnerTierLevel, float],
                 new_business_rate: float = 0.03,
                 renewal_rate: float = 0.02,
                 registration_bonus_rate: float = 0.02,
                 government_discount: float = -0.01,
                 private_bonus: float = 0.0,
                 volume_thresholds: Optional[List[Dict[str, float]]] = None,
                 mdf_percentage: float = 0.05,
                 reseller_margins: Optional[Dict[PartnerTierLevel, float]] = None):
        self.tier_rates = tier_rates
        self.new_business_rate = new_business_rate
        self.renewal_rate = renewal_rate
        self.registration_bonus_rate = registration_bonus_rate
        self.government_discount = government_discount
        self.private_bonus = private_bonus
        self.volume_thresholds = volume_thresholds or [
            {"threshold": 50_000.0, "bonus": 0.005},
            {"threshold": 200_000.0, "bonus": 0.01},
            {"threshold": 1_000_000.0, "bonus": 0.015},
        ]
        self.mdf_percentage = mdf_percentage
        self.reseller_margins = reseller_margins or {
            PartnerTierLevel.BRONZE: 0.10,
            PartnerTierLevel.SILVER: 0.15,
            PartnerTierLevel.GOLD: 0.20,
            PartnerTierLevel.PLATINUM: 0.25,
            PartnerTierLevel.ELITE: 0.30,
        }

    def _volume_bonus_rate(self, amount: float) -> float:
        rate = 0.0
        for tier in self.volume_thresholds:
            if amount >= tier["threshold"]:
                rate = max(rate, tier["bonus"])
        return rate

    def compute_commission_for_deal(self, deal: Deal) -> CommissionResult:
        notes: List[str] = []
        base_rate = self.tier_rates.get(deal.tier, 0.10)
        base_commission = deal.amount * base_rate
        notes.append(f"Base commission at tier {deal.tier.value}: {base_rate:.2%}")

        if deal.is_new_business:
            renewal_adj_rate = self.new_business_rate
            notes.append("New business bonus applied")
        else:
            renewal_adj_rate = self.renewal_rate
            notes.append("Renewal adjustment applied")
        renewal_adjustment = deal.amount * renewal_adj_rate

        registration_bonus = deal.amount * self.registration_bonus_rate if deal.registered else 0.0
        if deal.registered:
            notes.append("Deal registration bonus applied")

        volume_bonus_rate = self._volume_bonus_rate(deal.amount)
        volume_bonus = deal.amount * volume_bonus_rate
        if volume_bonus_rate > 0:
            notes.append(f"Volume bonus applied at {volume_bonus_rate:.2%}")

        if deal.sector == Sector.GOVERNMENT:
            sector_adj_rate = self.government_discount
            notes.append("Government sector adjustment applied")
        else:
            sector_adj_rate = self.private_bonus
        sector_adjustment = deal.amount * sector_adj_rate

        mdf_allocation = deal.amount * self.mdf_percentage
        reseller_margin_rate = self.reseller_margins.get(deal.tier, 0.15)
        reseller_margin = deal.amount * reseller_margin_rate

        total_commission = base_commission + renewal_adjustment + registration_bonus + volume_bonus + sector_adjustment

        return CommissionResult(
            deal_id=deal.deal_id,
            base_commission=round(base_commission, 2),
            registration_bonus=round(registration_bonus, 2),
            renewal_adjustment=round(renewal_adjustment, 2),
            volume_bonus=round(volume_bonus, 2),
            sector_adjustment=round(sector_adjustment, 2),
            total_commission=round(total_commission, 2),
            mdf_allocation=round(mdf_allocation, 2),
            reseller_margin=round(reseller_margin, 2),
            notes=notes,
        )

    def compute_batch(self, deals: List[Deal]) -> Dict[str, Any]:
        results: List[CommissionResult] = []
        totals = {
            "amount": 0.0,
            "base_commission": 0.0,
            "registration_bonus": 0.0,
            "renewal_adjustment": 0.0,
            "volume_bonus": 0.0,
            "sector_adjustment": 0.0,
            "total_commission": 0.0,
            "mdf_allocation": 0.0,
            "reseller_margin": 0.0,
        }
        for d in deals:
            r = self.compute_commission_for_deal(d)
            results.append(r)
            totals["amount"] += d.amount
            totals["base_commission"] += r.base_commission
            totals["registration_bonus"] += r.registration_bonus
            totals["renewal_adjustment"] += r.renewal_adjustment
            totals["volume_bonus"] += r.volume_bonus
            totals["sector_adjustment"] += r.sector_adjustment
            totals["total_commission"] += r.total_commission
            totals["mdf_allocation"] += r.mdf_allocation
            totals["reseller_margin"] += r.reseller_margin
        for k in totals:
            totals[k] = round(totals[k], 2)
        return {"results": results, "totals": totals}
