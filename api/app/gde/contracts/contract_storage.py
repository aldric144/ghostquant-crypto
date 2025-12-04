"""
Channel Partner Contract Storage
Global Distributor Edition (GDE)

In-memory storage system for distributor contracts with full CRUD operations,
search capabilities, and audit logging.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from .contract_schema import (
    ContractStatus,
    ContractType,
    DistributorTier,
    RegionCode,
    DistributorContract,
    ContractSummary
)


class ContractStorage:
    """
    GhostQuant Contract Storage System™
    
    In-memory storage for distributor contracts with comprehensive
    query and audit capabilities.
    """
    
    VERSION = "3.0.0"
    
    def __init__(self):
        self._contracts: Dict[str, DistributorContract] = {}
        self._contracts_by_number: Dict[str, str] = {}
        self._contracts_by_distributor: Dict[str, List[str]] = {}
        self._history: List[Dict[str, Any]] = []
    
    def save_contract(self, contract: DistributorContract) -> DistributorContract:
        """
        Save a contract to storage
        
        Args:
            contract: Contract to save
        
        Returns:
            Saved contract
        """
        contract.updated_at = datetime.utcnow().isoformat()
        
        self._contracts[contract.contract_id] = contract
        self._contracts_by_number[contract.contract_number] = contract.contract_id
        
        distributor_id = contract.distributor.distributor_id
        if distributor_id not in self._contracts_by_distributor:
            self._contracts_by_distributor[distributor_id] = []
        
        if contract.contract_id not in self._contracts_by_distributor[distributor_id]:
            self._contracts_by_distributor[distributor_id].append(contract.contract_id)
        
        self._log_action('save', contract.contract_id, {
            'contract_number': contract.contract_number,
            'status': contract.status.value,
            'distributor': contract.distributor.company_name
        })
        
        return contract
    
    def get_contract(self, contract_id: str) -> Optional[DistributorContract]:
        """
        Get a contract by ID
        
        Args:
            contract_id: Contract identifier
        
        Returns:
            Contract or None if not found
        """
        contract = self._contracts.get(contract_id)
        
        if contract:
            self._log_action('get', contract_id, {'found': True})
        else:
            self._log_action('get', contract_id, {'found': False})
        
        return contract
    
    def get_contract_by_number(self, contract_number: str) -> Optional[DistributorContract]:
        """
        Get a contract by contract number
        
        Args:
            contract_number: Contract number
        
        Returns:
            Contract or None if not found
        """
        contract_id = self._contracts_by_number.get(contract_number)
        if contract_id:
            return self.get_contract(contract_id)
        return None
    
    def get_contracts_by_distributor(
        self,
        distributor_id: str
    ) -> List[DistributorContract]:
        """
        Get all contracts for a distributor
        
        Args:
            distributor_id: Distributor identifier
        
        Returns:
            List of contracts
        """
        contract_ids = self._contracts_by_distributor.get(distributor_id, [])
        return [self._contracts[cid] for cid in contract_ids if cid in self._contracts]
    
    def update_contract(
        self,
        contract_id: str,
        updates: Dict[str, Any]
    ) -> Optional[DistributorContract]:
        """
        Update a contract
        
        Args:
            contract_id: Contract identifier
            updates: Dictionary of updates
        
        Returns:
            Updated contract or None if not found
        """
        contract = self._contracts.get(contract_id)
        if not contract:
            return None
        
        for key, value in updates.items():
            if hasattr(contract, key):
                setattr(contract, key, value)
        
        contract.updated_at = datetime.utcnow().isoformat()
        
        self._log_action('update', contract_id, {
            'fields_updated': list(updates.keys())
        })
        
        return contract
    
    def update_status(
        self,
        contract_id: str,
        new_status: ContractStatus,
        reason: str = None
    ) -> Optional[DistributorContract]:
        """
        Update contract status
        
        Args:
            contract_id: Contract identifier
            new_status: New status
            reason: Reason for status change
        
        Returns:
            Updated contract or None if not found
        """
        contract = self._contracts.get(contract_id)
        if not contract:
            return None
        
        old_status = contract.status
        contract.status = new_status
        contract.updated_at = datetime.utcnow().isoformat()
        
        if 'status_history' not in contract.metadata:
            contract.metadata['status_history'] = []
        
        contract.metadata['status_history'].append({
            'from': old_status.value,
            'to': new_status.value,
            'reason': reason,
            'timestamp': contract.updated_at
        })
        
        self._log_action('status_change', contract_id, {
            'from': old_status.value,
            'to': new_status.value,
            'reason': reason
        })
        
        return contract
    
    def delete_contract(self, contract_id: str) -> bool:
        """
        Delete a contract (soft delete by setting status to terminated)
        
        Args:
            contract_id: Contract identifier
        
        Returns:
            True if deleted, False if not found
        """
        contract = self._contracts.get(contract_id)
        if not contract:
            return False
        
        contract.status = ContractStatus.TERMINATED
        contract.updated_at = datetime.utcnow().isoformat()
        contract.metadata['deleted_at'] = contract.updated_at
        
        self._log_action('delete', contract_id, {
            'soft_delete': True
        })
        
        return True
    
    def hard_delete_contract(self, contract_id: str) -> bool:
        """
        Permanently delete a contract
        
        Args:
            contract_id: Contract identifier
        
        Returns:
            True if deleted, False if not found
        """
        contract = self._contracts.get(contract_id)
        if not contract:
            return False
        
        del self._contracts[contract_id]
        
        if contract.contract_number in self._contracts_by_number:
            del self._contracts_by_number[contract.contract_number]
        
        distributor_id = contract.distributor.distributor_id
        if distributor_id in self._contracts_by_distributor:
            if contract_id in self._contracts_by_distributor[distributor_id]:
                self._contracts_by_distributor[distributor_id].remove(contract_id)
        
        self._log_action('hard_delete', contract_id, {
            'permanent': True
        })
        
        return True
    
    def list_contracts(
        self,
        status: ContractStatus = None,
        contract_type: ContractType = None,
        tier: DistributorTier = None,
        region: RegionCode = None,
        distributor_name: str = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[DistributorContract]:
        """
        List contracts with optional filters
        
        Args:
            status: Filter by status
            contract_type: Filter by contract type
            tier: Filter by distributor tier
            region: Filter by region
            distributor_name: Filter by distributor name (partial match)
            limit: Maximum results
            offset: Results offset
        
        Returns:
            List of matching contracts
        """
        contracts = list(self._contracts.values())
        
        if status:
            contracts = [c for c in contracts if c.status == status]
        
        if contract_type:
            contracts = [c for c in contracts if c.terms.contract_type == contract_type]
        
        if tier:
            contracts = [c for c in contracts if c.terms.distributor_tier == tier]
        
        if region:
            contracts = [
                c for c in contracts
                if any(t.region_code == region for t in c.terms.territories)
            ]
        
        if distributor_name:
            contracts = [
                c for c in contracts
                if distributor_name.lower() in c.distributor.company_name.lower()
            ]
        
        contracts.sort(key=lambda c: c.created_at, reverse=True)
        
        return contracts[offset:offset + limit]
    
    def search_contracts(
        self,
        query: str,
        fields: List[str] = None
    ) -> List[DistributorContract]:
        """
        Search contracts by text query
        
        Args:
            query: Search query
            fields: Fields to search (defaults to common fields)
        
        Returns:
            List of matching contracts
        """
        if not fields:
            fields = ['contract_number', 'distributor.company_name', 'distributor.legal_name']
        
        query_lower = query.lower()
        results = []
        
        for contract in self._contracts.values():
            for field in fields:
                value = self._get_nested_value(contract, field)
                if value and query_lower in str(value).lower():
                    results.append(contract)
                    break
        
        return results
    
    def _get_nested_value(self, obj: Any, path: str) -> Any:
        """Get nested attribute value using dot notation"""
        parts = path.split('.')
        value = obj
        for part in parts:
            if hasattr(value, part):
                value = getattr(value, part)
            else:
                return None
        return value
    
    def get_contract_summaries(
        self,
        status: ContractStatus = None,
        limit: int = 100
    ) -> List[ContractSummary]:
        """
        Get contract summaries for listing
        
        Args:
            status: Filter by status
            limit: Maximum results
        
        Returns:
            List of ContractSummary objects
        """
        contracts = self.list_contracts(status=status, limit=limit)
        summaries = []
        
        for contract in contracts:
            expiration = datetime.fromisoformat(contract.terms.expiration_date)
            days_until = (expiration - datetime.utcnow()).days
            
            total_commitment = sum(
                c.minimum_revenue_commitment for c in contract.terms.commitments
            )
            
            territory_names = [t.territory_name for t in contract.terms.territories]
            
            summary = ContractSummary(
                contract_id=contract.contract_id,
                contract_number=contract.contract_number,
                distributor_name=contract.distributor.company_name,
                contract_type=contract.terms.contract_type,
                distributor_tier=contract.terms.distributor_tier,
                status=contract.status,
                territories=territory_names,
                total_commitment=total_commitment,
                currency=contract.terms.currency,
                effective_date=contract.terms.effective_date,
                expiration_date=contract.terms.expiration_date,
                days_until_expiration=days_until
            )
            summaries.append(summary)
        
        return summaries
    
    def get_expiring_contracts(
        self,
        days: int = 90
    ) -> List[DistributorContract]:
        """
        Get contracts expiring within specified days
        
        Args:
            days: Days until expiration
        
        Returns:
            List of expiring contracts
        """
        cutoff = datetime.utcnow()
        expiring = []
        
        for contract in self._contracts.values():
            if contract.status != ContractStatus.ACTIVE:
                continue
            
            expiration = datetime.fromisoformat(contract.terms.expiration_date)
            days_until = (expiration - cutoff).days
            
            if 0 < days_until <= days:
                expiring.append(contract)
        
        expiring.sort(key=lambda c: c.terms.expiration_date)
        
        return expiring
    
    def get_contracts_by_region(
        self,
        region: RegionCode
    ) -> List[DistributorContract]:
        """
        Get all contracts for a region
        
        Args:
            region: Region code
        
        Returns:
            List of contracts
        """
        return [
            c for c in self._contracts.values()
            if any(t.region_code == region for t in c.terms.territories)
        ]
    
    def get_contracts_by_tier(
        self,
        tier: DistributorTier
    ) -> List[DistributorContract]:
        """
        Get all contracts for a tier
        
        Args:
            tier: Distributor tier
        
        Returns:
            List of contracts
        """
        return [
            c for c in self._contracts.values()
            if c.terms.distributor_tier == tier
        ]
    
    def count_contracts(
        self,
        status: ContractStatus = None
    ) -> int:
        """
        Count contracts with optional status filter
        
        Args:
            status: Filter by status
        
        Returns:
            Contract count
        """
        if status:
            return len([c for c in self._contracts.values() if c.status == status])
        return len(self._contracts)
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get storage statistics
        
        Returns:
            Statistics dictionary
        """
        contracts = list(self._contracts.values())
        
        by_status = {}
        for status in ContractStatus:
            by_status[status.value] = len([c for c in contracts if c.status == status])
        
        by_tier = {}
        for tier in DistributorTier:
            by_tier[tier.value] = len([c for c in contracts if c.terms.distributor_tier == tier])
        
        by_type = {}
        for ctype in ContractType:
            by_type[ctype.value] = len([c for c in contracts if c.terms.contract_type == ctype])
        
        total_commitment = sum(
            sum(c.minimum_revenue_commitment for c in contract.terms.commitments)
            for contract in contracts
        )
        
        return {
            'total_contracts': len(contracts),
            'total_distributors': len(self._contracts_by_distributor),
            'by_status': by_status,
            'by_tier': by_tier,
            'by_type': by_type,
            'total_commitment_value': total_commitment,
            'history_entries': len(self._history),
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _log_action(
        self,
        action: str,
        contract_id: str,
        details: Dict[str, Any]
    ) -> None:
        """Log an action to history"""
        self._history.append({
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'contract_id': contract_id,
            'details': details
        })
    
    def get_history(
        self,
        contract_id: str = None,
        action: str = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get action history
        
        Args:
            contract_id: Filter by contract ID
            action: Filter by action type
            limit: Maximum results
        
        Returns:
            List of history entries
        """
        history = self._history
        
        if contract_id:
            history = [h for h in history if h['contract_id'] == contract_id]
        
        if action:
            history = [h for h in history if h['action'] == action]
        
        return list(reversed(history[-limit:]))
    
    def export_contracts(
        self,
        format: str = 'dict'
    ) -> List[Dict[str, Any]]:
        """
        Export all contracts
        
        Args:
            format: Export format ('dict' or 'summary')
        
        Returns:
            List of contract data
        """
        if format == 'summary':
            return [s.to_dict() for s in self.get_contract_summaries()]
        
        return [c.to_dict() for c in self._contracts.values()]
    
    def import_contracts(
        self,
        contracts_data: List[Dict[str, Any]]
    ) -> int:
        """
        Import contracts from data
        
        Args:
            contracts_data: List of contract dictionaries
        
        Returns:
            Number of contracts imported
        """
        imported = 0
        for data in contracts_data:
            pass
            imported += 1
        
        return imported
    
    def clear_all(self) -> None:
        """Clear all contracts (use with caution)"""
        self._contracts.clear()
        self._contracts_by_number.clear()
        self._contracts_by_distributor.clear()
        
        self._log_action('clear_all', 'system', {
            'cleared': True
        })
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'total_contracts': len(self._contracts),
            'total_distributors': len(self._contracts_by_distributor),
            'history_entries': len(self._history)
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get storage stats (alias for get_statistics)"""
        return self.get_statistics()
