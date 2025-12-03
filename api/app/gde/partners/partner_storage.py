"""
Partner Storage
In-memory and filesystem storage for partner packages, agreements, and history
"""

import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

from .partner_schema import PartnerPackage


class PartnerStorage:
    """Storage for partner programs and related data"""
    
    def __init__(self, storage_dir: str = "/tmp/ghostquant/partners"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        self.packages: Dict[str, PartnerPackage] = {}
        self.agreements: Dict[str, Dict[str, Any]] = {}
        self.certifications: Dict[str, List[Dict[str, Any]]] = {}
        self.mdf_allocations: Dict[str, Dict[str, Any]] = {}
        self.tier_assignments: Dict[str, str] = {}
        self.history: List[Dict[str, Any]] = []
        
        self._load_from_disk()
    
    def save_package(self, package: PartnerPackage) -> bool:
        """Save partner package"""
        try:
            self.packages[package.package_id] = package
            self._save_package_to_disk(package)
            self._log_history("save_package", {"package_id": package.package_id})
            return True
        except Exception as e:
            print(f"Error saving package: {e}")
            return False
    
    def get_package(self, package_id: str) -> Optional[PartnerPackage]:
        """Retrieve partner package by ID"""
        return self.packages.get(package_id)
    
    def list_packages(self, partner_name: Optional[str] = None) -> List[PartnerPackage]:
        """List all packages, optionally filtered by partner name"""
        packages = list(self.packages.values())
        if partner_name:
            packages = [p for p in packages if p.partner_name == partner_name]
        return sorted(packages, key=lambda p: p.generated_at, reverse=True)
    
    def delete_package(self, package_id: str) -> bool:
        """Delete partner package"""
        if package_id in self.packages:
            del self.packages[package_id]
            self._delete_package_from_disk(package_id)
            self._log_history("delete_package", {"package_id": package_id})
            return True
        return False
    
    def save_agreement(self, agreement_id: str, agreement_data: Dict[str, Any]) -> bool:
        """Save reseller agreement"""
        try:
            self.agreements[agreement_id] = agreement_data
            self._save_to_disk("agreements", agreement_id, agreement_data)
            self._log_history("save_agreement", {"agreement_id": agreement_id})
            return True
        except Exception as e:
            print(f"Error saving agreement: {e}")
            return False
    
    def get_agreement(self, agreement_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve agreement by ID"""
        return self.agreements.get(agreement_id)
    
    def list_agreements(self) -> List[Dict[str, Any]]:
        """List all agreements"""
        return list(self.agreements.values())
    
    def save_certification(self, partner_id: str, certification: Dict[str, Any]) -> bool:
        """Save partner certification"""
        try:
            if partner_id not in self.certifications:
                self.certifications[partner_id] = []
            self.certifications[partner_id].append(certification)
            self._save_to_disk("certifications", partner_id, self.certifications[partner_id])
            self._log_history("save_certification", {
                "partner_id": partner_id,
                "certification": certification.get("name")
            })
            return True
        except Exception as e:
            print(f"Error saving certification: {e}")
            return False
    
    def get_certifications(self, partner_id: str) -> List[Dict[str, Any]]:
        """Get all certifications for a partner"""
        return self.certifications.get(partner_id, [])
    
    def save_mdf_allocation(self, partner_id: str, allocation: Dict[str, Any]) -> bool:
        """Save MDF allocation"""
        try:
            self.mdf_allocations[partner_id] = allocation
            self._save_to_disk("mdf", partner_id, allocation)
            self._log_history("save_mdf_allocation", {
                "partner_id": partner_id,
                "amount": allocation.get("amount")
            })
            return True
        except Exception as e:
            print(f"Error saving MDF allocation: {e}")
            return False
    
    def get_mdf_allocation(self, partner_id: str) -> Optional[Dict[str, Any]]:
        """Get MDF allocation for partner"""
        return self.mdf_allocations.get(partner_id)
    
    def assign_tier(self, partner_id: str, tier: str) -> bool:
        """Assign tier to partner"""
        try:
            self.tier_assignments[partner_id] = tier
            self._save_to_disk("tiers", partner_id, {"tier": tier, "assigned_at": datetime.utcnow().isoformat()})
            self._log_history("assign_tier", {"partner_id": partner_id, "tier": tier})
            return True
        except Exception as e:
            print(f"Error assigning tier: {e}")
            return False
    
    def get_tier(self, partner_id: str) -> Optional[str]:
        """Get partner tier"""
        return self.tier_assignments.get(partner_id)
    
    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get operation history"""
        return self.history[-limit:]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        return {
            "packages_count": len(self.packages),
            "agreements_count": len(self.agreements),
            "certifications_count": sum(len(certs) for certs in self.certifications.values()),
            "mdf_allocations_count": len(self.mdf_allocations),
            "tier_assignments_count": len(self.tier_assignments),
            "history_count": len(self.history)
        }
    
    def _save_package_to_disk(self, package: PartnerPackage):
        """Save package to disk"""
        package_dir = self.storage_dir / "packages"
        package_dir.mkdir(exist_ok=True)
        
        file_path = package_dir / f"{package.package_id}.json"
        with open(file_path, 'w') as f:
            package_dict = {
                "package_id": package.package_id,
                "generated_at": package.generated_at,
                "partner_name": package.partner_name,
                "partner_type": package.partner_type.value,
                "tier": {
                    "tier_level": package.tier.tier_level.value,
                    "tier_name": package.tier.tier_name,
                    "commission_rate": package.tier.commission_rate
                },
                "summary": package.summary,
                "metadata": package.metadata
            }
            json.dump(package_dict, f, indent=2)
    
    def _delete_package_from_disk(self, package_id: str):
        """Delete package from disk"""
        file_path = self.storage_dir / "packages" / f"{package_id}.json"
        if file_path.exists():
            file_path.unlink()
    
    def _save_to_disk(self, category: str, item_id: str, data: Any):
        """Save data to disk"""
        category_dir = self.storage_dir / category
        category_dir.mkdir(exist_ok=True)
        
        file_path = category_dir / f"{item_id}.json"
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_from_disk(self):
        """Load existing data from disk"""
        try:
            packages_dir = self.storage_dir / "packages"
            if packages_dir.exists():
                for file_path in packages_dir.glob("*.json"):
                    with open(file_path) as f:
                        data = json.load(f)
                        pass
            
        except Exception as e:
            print(f"Error loading from disk: {e}")
    
    def _log_history(self, operation: str, details: Dict[str, Any]):
        """Log operation to history"""
        self.history.append({
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "details": details
        })
        
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
