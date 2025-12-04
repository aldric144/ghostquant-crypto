"""
RFP Storage

In-memory and file-based storage for RFP proposals, compliance matrices, and history.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os


class RFPStorage:
    """
    RFP Storage
    
    Manages storage and retrieval of RFP proposals, compliance matrices, and history.
    Implements in-memory caching with optional file-based persistence.
    """
    
    def __init__(self, storage_dir: str = "/tmp/rfp_storage"):
        """
        Initialize storage.
        
        Args:
            storage_dir: Directory for file-based storage
        """
        self.storage_dir = storage_dir
        self.proposals = {}
        self.compliance_matrices = {}
        self.requirements = {}
        self.history = []
        
        os.makedirs(storage_dir, exist_ok=True)
        
    
    def create_proposal(self, proposal_id: str, proposal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new proposal.
        
        Args:
            proposal_id: Unique proposal identifier
            proposal: Proposal data
            
        Returns:
            Created proposal
        """
        proposal["proposal_id"] = proposal_id
        proposal["created_at"] = datetime.utcnow().isoformat() + "Z"
        proposal["updated_at"] = proposal["created_at"]
        
        self.proposals[proposal_id] = proposal
        self._save_to_file("proposals", proposal_id, proposal)
        self._add_to_history("create_proposal", proposal_id)
        
        return proposal
        
    def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a proposal by ID.
        
        Args:
            proposal_id: Proposal identifier
            
        Returns:
            Proposal data or None if not found
        """
        if proposal_id in self.proposals:
            return self.proposals[proposal_id]
            
        proposal = self._load_from_file("proposals", proposal_id)
        if proposal:
            self.proposals[proposal_id] = proposal
            
        return proposal
        
    def update_proposal(self, proposal_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a proposal.
        
        Args:
            proposal_id: Proposal identifier
            updates: Fields to update
            
        Returns:
            Updated proposal or None if not found
        """
        proposal = self.get_proposal(proposal_id)
        if not proposal:
            return None
            
        proposal.update(updates)
        proposal["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.proposals[proposal_id] = proposal
        self._save_to_file("proposals", proposal_id, proposal)
        self._add_to_history("update_proposal", proposal_id)
        
        return proposal
        
    def delete_proposal(self, proposal_id: str) -> bool:
        """
        Delete a proposal.
        
        Args:
            proposal_id: Proposal identifier
            
        Returns:
            True if deleted, False if not found
        """
        if proposal_id not in self.proposals:
            return False
            
        del self.proposals[proposal_id]
        self._delete_file("proposals", proposal_id)
        self._add_to_history("delete_proposal", proposal_id)
        
        return True
        
    def list_proposals(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List all proposals.
        
        Args:
            limit: Maximum number of proposals to return
            offset: Number of proposals to skip
            
        Returns:
            List of proposals
        """
        proposals = list(self.proposals.values())
        proposals.sort(key=lambda p: p.get("created_at", ""), reverse=True)
        
        return proposals[offset:offset + limit]
        
    
    def create_compliance_matrix(self, matrix_id: str, matrix: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new compliance matrix.
        
        Args:
            matrix_id: Unique matrix identifier
            matrix: Matrix data
            
        Returns:
            Created matrix
        """
        matrix["matrix_id"] = matrix_id
        matrix["created_at"] = datetime.utcnow().isoformat() + "Z"
        
        self.compliance_matrices[matrix_id] = matrix
        self._save_to_file("matrices", matrix_id, matrix)
        self._add_to_history("create_matrix", matrix_id)
        
        return matrix
        
    def get_compliance_matrix(self, matrix_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a compliance matrix by ID.
        
        Args:
            matrix_id: Matrix identifier
            
        Returns:
            Matrix data or None if not found
        """
        if matrix_id in self.compliance_matrices:
            return self.compliance_matrices[matrix_id]
            
        matrix = self._load_from_file("matrices", matrix_id)
        if matrix:
            self.compliance_matrices[matrix_id] = matrix
            
        return matrix
        
    def list_compliance_matrices(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List all compliance matrices.
        
        Args:
            limit: Maximum number of matrices to return
            offset: Number of matrices to skip
            
        Returns:
            List of matrices
        """
        matrices = list(self.compliance_matrices.values())
        matrices.sort(key=lambda m: m.get("created_at", ""), reverse=True)
        
        return matrices[offset:offset + limit]
        
    
    def create_requirements(self, rfp_id: str, requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create requirements for an RFP.
        
        Args:
            rfp_id: RFP identifier
            requirements: List of requirements
            
        Returns:
            Requirements data
        """
        req_data = {
            "rfp_id": rfp_id,
            "requirements": requirements,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        self.requirements[rfp_id] = req_data
        self._save_to_file("requirements", rfp_id, req_data)
        self._add_to_history("create_requirements", rfp_id)
        
        return req_data
        
    def get_requirements(self, rfp_id: str) -> Optional[Dict[str, Any]]:
        """
        Get requirements for an RFP.
        
        Args:
            rfp_id: RFP identifier
            
        Returns:
            Requirements data or None if not found
        """
        if rfp_id in self.requirements:
            return self.requirements[rfp_id]
            
        req_data = self._load_from_file("requirements", rfp_id)
        if req_data:
            self.requirements[rfp_id] = req_data
            
        return req_data
        
    def list_requirements(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List all requirements.
        
        Args:
            limit: Maximum number to return
            offset: Number to skip
            
        Returns:
            List of requirements
        """
        reqs = list(self.requirements.values())
        reqs.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        
        return reqs[offset:offset + limit]
        
    
    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get operation history.
        
        Args:
            limit: Maximum number of history entries to return
            
        Returns:
            List of history entries
        """
        return self.history[-limit:]
        
    def _add_to_history(self, operation: str, resource_id: str):
        """
        Add entry to history.
        
        Args:
            operation: Operation type
            resource_id: Resource identifier
        """
        entry = {
            "operation": operation,
            "resource_id": resource_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        self.history.append(entry)
        
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
            
    
    def _save_to_file(self, category: str, resource_id: str, data: Dict[str, Any]):
        """
        Save data to file.
        
        Args:
            category: Category (proposals, matrices, requirements)
            resource_id: Resource identifier
            data: Data to save
        """
        try:
            category_dir = os.path.join(self.storage_dir, category)
            os.makedirs(category_dir, exist_ok=True)
            
            filepath = os.path.join(category_dir, f"{resource_id}.json")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving to file: {e}")
            
    def _load_from_file(self, category: str, resource_id: str) -> Optional[Dict[str, Any]]:
        """
        Load data from file.
        
        Args:
            category: Category (proposals, matrices, requirements)
            resource_id: Resource identifier
            
        Returns:
            Data or None if not found
        """
        try:
            filepath = os.path.join(self.storage_dir, category, f"{resource_id}.json")
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading from file: {e}")
            
        return None
        
    def _delete_file(self, category: str, resource_id: str):
        """
        Delete file.
        
        Args:
            category: Category (proposals, matrices, requirements)
            resource_id: Resource identifier
        """
        try:
            filepath = os.path.join(self.storage_dir, category, f"{resource_id}.json")
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            print(f"Error deleting file: {e}")
            
    
    def clear_all(self):
        """Clear all in-memory data"""
        self.proposals = {}
        self.compliance_matrices = {}
        self.requirements = {}
        self.history = []
        
    def get_stats(self) -> Dict[str, Any]:
        """
        Get storage statistics.
        
        Returns:
            Statistics dictionary
        """
        return {
            "proposals_count": len(self.proposals),
            "matrices_count": len(self.compliance_matrices),
            "requirements_count": len(self.requirements),
            "history_entries": len(self.history),
            "storage_dir": self.storage_dir
        }
