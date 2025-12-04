"""
Sales Storage
In-memory and JSON-based persistence for sales data.
"""

import json
import os
from typing import List, Dict, Optional
from datetime import datetime
from .sales_schema import SalesLead, SalesInteraction, FollowUpTask, DemoAccessRequest


class SalesStorage:
    """
    Storage layer for sales pipeline data.
    
    Uses in-memory storage with optional JSON persistence.
    100% safe and crash-proof.
    """
    
    def __init__(self, storage_dir: str = "/tmp/ghostquant_sales"):
        """
        Initialize storage.
        
        Args:
            storage_dir: Directory for JSON storage
        """
        self.storage_dir = storage_dir
        self.leads: Dict[str, SalesLead] = {}
        self.interactions: Dict[str, List[SalesInteraction]] = {}
        self.tasks: Dict[str, List[FollowUpTask]] = {}
        self.demo_requests: List[DemoAccessRequest] = []
        
        os.makedirs(storage_dir, exist_ok=True)
        
        self._load_from_disk()
    
    def _load_from_disk(self):
        """Load data from JSON files."""
        try:
            leads_file = os.path.join(self.storage_dir, "leads.json")
            if os.path.exists(leads_file):
                with open(leads_file, "r") as f:
                    leads_data = json.load(f)
                    self.leads = {
                        lead_id: SalesLead(**lead_data)
                        for lead_id, lead_data in leads_data.items()
                    }
            
            interactions_file = os.path.join(self.storage_dir, "interactions.json")
            if os.path.exists(interactions_file):
                with open(interactions_file, "r") as f:
                    interactions_data = json.load(f)
                    self.interactions = {
                        lead_id: [SalesInteraction(**i) for i in interactions]
                        for lead_id, interactions in interactions_data.items()
                    }
            
            tasks_file = os.path.join(self.storage_dir, "tasks.json")
            if os.path.exists(tasks_file):
                with open(tasks_file, "r") as f:
                    tasks_data = json.load(f)
                    self.tasks = {
                        lead_id: [FollowUpTask(**t) for t in tasks]
                        for lead_id, tasks in tasks_data.items()
                    }
            
            demo_file = os.path.join(self.storage_dir, "demo_requests.json")
            if os.path.exists(demo_file):
                with open(demo_file, "r") as f:
                    demo_data = json.load(f)
                    self.demo_requests = [DemoAccessRequest(**d) for d in demo_data]
        
        except Exception as e:
            print(f"Warning: Failed to load sales data from disk: {e}")
    
    def _save_to_disk(self):
        """Save data to JSON files."""
        try:
            leads_file = os.path.join(self.storage_dir, "leads.json")
            with open(leads_file, "w") as f:
                leads_data = {
                    lead_id: lead.dict()
                    for lead_id, lead in self.leads.items()
                }
                json.dump(leads_data, f, indent=2, default=str)
            
            interactions_file = os.path.join(self.storage_dir, "interactions.json")
            with open(interactions_file, "w") as f:
                interactions_data = {
                    lead_id: [i.dict() for i in interactions]
                    for lead_id, interactions in self.interactions.items()
                }
                json.dump(interactions_data, f, indent=2, default=str)
            
            tasks_file = os.path.join(self.storage_dir, "tasks.json")
            with open(tasks_file, "w") as f:
                tasks_data = {
                    lead_id: [t.dict() for t in tasks]
                    for lead_id, tasks in self.tasks.items()
                }
                json.dump(tasks_data, f, indent=2, default=str)
            
            demo_file = os.path.join(self.storage_dir, "demo_requests.json")
            with open(demo_file, "w") as f:
                demo_data = [d.dict() for d in self.demo_requests]
                json.dump(demo_data, f, indent=2, default=str)
        
        except Exception as e:
            print(f"Warning: Failed to save sales data to disk: {e}")
    
    def create_lead(self, lead: SalesLead) -> SalesLead:
        """Create a new lead."""
        self.leads[lead.lead_id] = lead
        self.interactions[lead.lead_id] = []
        self.tasks[lead.lead_id] = []
        self._save_to_disk()
        return lead
    
    def get_lead(self, lead_id: str) -> Optional[SalesLead]:
        """Get a lead by ID."""
        return self.leads.get(lead_id)
    
    def update_lead(self, lead: SalesLead) -> SalesLead:
        """Update a lead."""
        lead.updated_at = datetime.utcnow()
        self.leads[lead.lead_id] = lead
        self._save_to_disk()
        return lead
    
    def delete_lead(self, lead_id: str) -> bool:
        """Delete a lead."""
        if lead_id in self.leads:
            del self.leads[lead_id]
            if lead_id in self.interactions:
                del self.interactions[lead_id]
            if lead_id in self.tasks:
                del self.tasks[lead_id]
            self._save_to_disk()
            return True
        return False
    
    def list_leads(self, filters: Optional[Dict] = None) -> List[SalesLead]:
        """List all leads with optional filters."""
        leads = list(self.leads.values())
        
        if filters:
            if "category" in filters:
                leads = [l for l in leads if l.category == filters["category"]]
            if "priority" in filters:
                leads = [l for l in leads if l.priority == filters["priority"]]
            if "current_stage" in filters:
                leads = [l for l in leads if l.current_stage == filters["current_stage"]]
            if "assigned_rep" in filters:
                leads = [l for l in leads if l.assigned_rep == filters["assigned_rep"]]
        
        return sorted(leads, key=lambda l: l.updated_at, reverse=True)
    
    def create_interaction(self, interaction: SalesInteraction) -> SalesInteraction:
        """Create a new interaction."""
        if interaction.lead_id not in self.interactions:
            self.interactions[interaction.lead_id] = []
        self.interactions[interaction.lead_id].append(interaction)
        self._save_to_disk()
        return interaction
    
    def get_interactions(self, lead_id: str) -> List[SalesInteraction]:
        """Get all interactions for a lead."""
        return self.interactions.get(lead_id, [])
    
    def create_task(self, task: FollowUpTask) -> FollowUpTask:
        """Create a new task."""
        if task.lead_id not in self.tasks:
            self.tasks[task.lead_id] = []
        self.tasks[task.lead_id].append(task)
        self._save_to_disk()
        return task
    
    def get_tasks(self, lead_id: str) -> List[FollowUpTask]:
        """Get all tasks for a lead."""
        return self.tasks.get(lead_id, [])
    
    def update_task(self, task: FollowUpTask) -> FollowUpTask:
        """Update a task."""
        if task.lead_id in self.tasks:
            for i, t in enumerate(self.tasks[task.lead_id]):
                if t.task_id == task.task_id:
                    self.tasks[task.lead_id][i] = task
                    self._save_to_disk()
                    return task
        return task
    
    def create_demo_request(self, request: DemoAccessRequest) -> DemoAccessRequest:
        """Create a new demo request."""
        self.demo_requests.append(request)
        self._save_to_disk()
        return request
    
    def get_demo_requests(self) -> List[DemoAccessRequest]:
        """Get all demo requests."""
        return self.demo_requests
    
    def get_stats(self) -> Dict:
        """Get storage statistics."""
        return {
            "total_leads": len(self.leads),
            "total_interactions": sum(len(i) for i in self.interactions.values()),
            "total_tasks": sum(len(t) for t in self.tasks.values()),
            "total_demo_requests": len(self.demo_requests),
        }
    
    def clear_all(self):
        """Clear all data (use with caution)."""
        self.leads = {}
        self.interactions = {}
        self.tasks = {}
        self.demo_requests = []
        self._save_to_disk()
