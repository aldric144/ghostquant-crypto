"""
Proposal Storage

In-memory + filesystem storage for saved proposals, saved RFPs, saved compliance matrices, and history.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os


class ProposalStorage:
    """In-memory and file-based storage for proposals"""
    
    def __init__(self, storage_dir: str = "/tmp/ghostquant/proposals"):
        self.storage_dir = storage_dir
        self.proposals: Dict[str, Dict[str, Any]] = {}
        self.rfps: Dict[str, Dict[str, Any]] = {}
        self.compliance_matrices: Dict[str, Dict[str, Any]] = {}
        self.history: List[Dict[str, Any]] = []
        
        os.makedirs(storage_dir, exist_ok=True)
    
    
    def create_proposal(self, proposal_id: str, proposal: Dict[str, Any]) -> Dict[str, Any]:
        """Create new proposal"""
        proposal["created_at"] = datetime.utcnow().isoformat() + "Z"
        proposal["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.proposals[proposal_id] = proposal
        self._save_to_file("proposals", proposal_id, proposal)
        self._add_history("proposal_created", proposal_id)
        
        return proposal
    
    def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """Get proposal by ID"""
        if proposal_id in self.proposals:
            return self.proposals[proposal_id]
        
        return self._load_from_file("proposals", proposal_id)
    
    def update_proposal(self, proposal_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update proposal"""
        proposal = self.get_proposal(proposal_id)
        if not proposal:
            return None
        
        proposal.update(updates)
        proposal["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.proposals[proposal_id] = proposal
        self._save_to_file("proposals", proposal_id, proposal)
        self._add_history("proposal_updated", proposal_id)
        
        return proposal
    
    def delete_proposal(self, proposal_id: str) -> bool:
        """Delete proposal"""
        if proposal_id in self.proposals:
            del self.proposals[proposal_id]
        
        self._delete_file("proposals", proposal_id)
        self._add_history("proposal_deleted", proposal_id)
        
        return True
    
    def list_proposals(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """List all proposals"""
        all_proposals = list(self.proposals.values())
        
        if len(all_proposals) == 0:
            all_proposals = self._list_from_files("proposals")
        
        all_proposals.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return all_proposals[offset:offset + limit]
    
    
    def create_rfp(self, rfp_id: str, rfp: Dict[str, Any]) -> Dict[str, Any]:
        """Create new RFP"""
        rfp["created_at"] = datetime.utcnow().isoformat() + "Z"
        rfp["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.rfps[rfp_id] = rfp
        self._save_to_file("rfps", rfp_id, rfp)
        self._add_history("rfp_created", rfp_id)
        
        return rfp
    
    def get_rfp(self, rfp_id: str) -> Optional[Dict[str, Any]]:
        """Get RFP by ID"""
        if rfp_id in self.rfps:
            return self.rfps[rfp_id]
        
        return self._load_from_file("rfps", rfp_id)
    
    def update_rfp(self, rfp_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update RFP"""
        rfp = self.get_rfp(rfp_id)
        if not rfp:
            return None
        
        rfp.update(updates)
        rfp["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.rfps[rfp_id] = rfp
        self._save_to_file("rfps", rfp_id, rfp)
        self._add_history("rfp_updated", rfp_id)
        
        return rfp
    
    def delete_rfp(self, rfp_id: str) -> bool:
        """Delete RFP"""
        if rfp_id in self.rfps:
            del self.rfps[rfp_id]
        
        self._delete_file("rfps", rfp_id)
        self._add_history("rfp_deleted", rfp_id)
        
        return True
    
    def list_rfps(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """List all RFPs"""
        all_rfps = list(self.rfps.values())
        
        if len(all_rfps) == 0:
            all_rfps = self._list_from_files("rfps")
        
        all_rfps.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return all_rfps[offset:offset + limit]
    
    
    def create_compliance_matrix(self, matrix_id: str, matrix: Dict[str, Any]) -> Dict[str, Any]:
        """Create compliance matrix"""
        matrix["created_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.compliance_matrices[matrix_id] = matrix
        self._save_to_file("compliance_matrices", matrix_id, matrix)
        self._add_history("compliance_matrix_created", matrix_id)
        
        return matrix
    
    def get_compliance_matrix(self, matrix_id: str) -> Optional[Dict[str, Any]]:
        """Get compliance matrix by ID"""
        if matrix_id in self.compliance_matrices:
            return self.compliance_matrices[matrix_id]
        
        return self._load_from_file("compliance_matrices", matrix_id)
    
    def list_compliance_matrices(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """List all compliance matrices"""
        all_matrices = list(self.compliance_matrices.values())
        
        if len(all_matrices) == 0:
            all_matrices = self._list_from_files("compliance_matrices")
        
        all_matrices.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return all_matrices[offset:offset + limit]
    
    
    def get_history(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get operation history"""
        return self.history[-limit:]
    
    def _add_history(self, event_type: str, resource_id: str):
        """Add history event"""
        event = {
            "event_id": f"EVT-{len(self.history) + 1}",
            "event_type": event_type,
            "resource_id": resource_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        self.history.append(event)
        
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
    
    
    def _save_to_file(self, category: str, resource_id: str, data: Dict[str, Any]):
        """Save data to file"""
        category_dir = os.path.join(self.storage_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        file_path = os.path.join(category_dir, f"{resource_id}.json")
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_from_file(self, category: str, resource_id: str) -> Optional[Dict[str, Any]]:
        """Load data from file"""
        file_path = os.path.join(self.storage_dir, category, f"{resource_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception:
            return None
    
    def _delete_file(self, category: str, resource_id: str):
        """Delete file"""
        file_path = os.path.join(self.storage_dir, category, f"{resource_id}.json")
        
        if os.path.exists(file_path):
            os.remove(file_path)
    
    def _list_from_files(self, category: str) -> List[Dict[str, Any]]:
        """List all files in category"""
        category_dir = os.path.join(self.storage_dir, category)
        
        if not os.path.exists(category_dir):
            return []
        
        items = []
        for filename in os.listdir(category_dir):
            if filename.endswith('.json'):
                resource_id = filename[:-5]
                item = self._load_from_file(category, resource_id)
                if item:
                    items.append(item)
        
        return items
    
    
    def get_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        return {
            "proposals_count": len(self.proposals),
            "rfps_count": len(self.rfps),
            "compliance_matrices_count": len(self.compliance_matrices),
            "history_events_count": len(self.history),
            "storage_dir": self.storage_dir
        }
