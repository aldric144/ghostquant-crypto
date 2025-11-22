"""
ModelRegistryManager - Pure Python model versioning and registry management.
Tracks all saved models with automatic versioning and metadata.
"""

from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime
import uuid


class ModelRegistryManager:
    """Manage model registry with versioning and metadata tracking."""

    def __init__(self, registry_path: str = "model_registry.json"):
        """Initialize the model registry manager."""
        self.registry_path = registry_path
        self.registry = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        """Load registry from JSON file."""
        try:
            if os.path.exists(self.registry_path):
                with open(self.registry_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "models" not in data:
                        print("[ModelRegistry] Invalid registry format, initializing new registry")
                        return {"models": []}
                    return data
            else:
                print("[ModelRegistry] Registry file not found, creating new registry")
                return {"models": []}
        except Exception as e:
            print(f"[ModelRegistry] Error loading registry: {e}")
            print("[ModelRegistry] Creating backup and initializing new registry")
            if os.path.exists(self.registry_path):
                backup_path = f"{self.registry_path}.backup.{int(datetime.utcnow().timestamp())}"
                try:
                    os.rename(self.registry_path, backup_path)
                    print(f"[ModelRegistry] Backed up corrupted registry to {backup_path}")
                except Exception:
                    pass
            return {"models": []}

    def _save_registry(self) -> bool:
        """Save registry to JSON file with atomic write."""
        try:
            directory = os.path.dirname(self.registry_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
            
            temp_path = f"{self.registry_path}.tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(self.registry, f, indent=2, sort_keys=True)
            
            os.replace(temp_path, self.registry_path)
            return True
        except Exception as e:
            print(f"[ModelRegistry] Error saving registry: {e}")
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
            return False

    def register_model(
        self, 
        model: Any, 
        model_type: str, 
        path: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Register a model in the registry."""
        try:
            model_id = uuid.uuid4().hex[:12]
            existing_versions = [
                m["version"] for m in self.registry["models"] 
                if m.get("model_type") == model_type
            ]
            version = max(existing_versions) + 1 if existing_versions else 1
            
            entry = {
                "model_id": model_id,
                "model_type": model_type,
                "version": version,
                "created_at": datetime.utcnow().isoformat(),
                "path": path,
                "metadata": metadata or {}
            }
            
            self.registry["models"].append(entry)
            
            if self._save_registry():
                print(f"[ModelRegistry] Registered {model_type} v{version} (ID: {model_id})")
                return entry
            else:
                self.registry["models"].remove(entry)
                return {}
        except Exception as e:
            print(f"[ModelRegistry] Error registering model: {e}")
            return {}

    def list_models(self) -> List[Dict[str, Any]]:
        """List all registered models."""
        try:
            return self.registry["models"]
        except Exception as e:
            print(f"[ModelRegistry] Error listing models: {e}")
            return []

    def list_by_type(self, model_type: str) -> List[Dict[str, Any]]:
        """List all models of a specific type."""
        try:
            models = [
                m for m in self.registry["models"] 
                if m.get("model_type") == model_type
            ]
            return sorted(models, key=lambda x: x.get("version", 0))
        except Exception as e:
            print(f"[ModelRegistry] Error listing models by type: {e}")
            return []

    def get_latest(self, model_type: str) -> Optional[Dict[str, Any]]:
        """Get the latest version of a model type."""
        try:
            models = self.list_by_type(model_type)
            if models:
                return models[-1]
            return None
        except Exception as e:
            print(f"[ModelRegistry] Error getting latest model: {e}")
            return None

    def get_version(self, model_type: str, version: int) -> Optional[Dict[str, Any]]:
        """Get a specific version of a model type."""
        try:
            for model in self.registry["models"]:
                if model.get("model_type") == model_type and model.get("version") == version:
                    return model
            return None
        except Exception as e:
            print(f"[ModelRegistry] Error getting model version: {e}")
            return None

    def exists(self, model_type: str, version: int) -> bool:
        """Check if a model version exists."""
        try:
            return self.get_version(model_type, version) is not None
        except Exception as e:
            print(f"[ModelRegistry] Error checking model existence: {e}")
            return False

    def delete_model(self, model_type: str, version: int) -> bool:
        """Delete a model from the registry."""
        try:
            initial_count = len(self.registry["models"])
            self.registry["models"] = [
                m for m in self.registry["models"]
                if not (m.get("model_type") == model_type and m.get("version") == version)
            ]
            
            if len(self.registry["models"]) < initial_count:
                if self._save_registry():
                    print(f"[ModelRegistry] Deleted {model_type} v{version}")
                    return True
            return False
        except Exception as e:
            print(f"[ModelRegistry] Error deleting model: {e}")
            return False

    def rebuild_registry(self) -> bool:
        """Rebuild registry by scanning model files."""
        try:
            print("[ModelRegistry] Rebuilding registry from model files...")
            backup_path = f"{self.registry_path}.backup.{int(datetime.utcnow().timestamp())}"
            
            if os.path.exists(self.registry_path):
                try:
                    os.rename(self.registry_path, backup_path)
                    print(f"[ModelRegistry] Backed up old registry to {backup_path}")
                except Exception:
                    pass
            
            self.registry = {"models": []}
            
            directory = os.path.dirname(self.registry_path) or "."
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    if filename.endswith(".ghostmodel.json"):
                        file_path = os.path.join(directory, filename)
                        try:
                            with open(file_path, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                model_type = data.get("model_class", "unknown")
                                
                                entry = {
                                    "model_id": uuid.uuid4().hex[:12],
                                    "model_type": model_type,
                                    "version": 1,
                                    "created_at": data.get("timestamp", datetime.utcnow().isoformat()),
                                    "path": file_path,
                                    "metadata": data.get("metadata", {})
                                }
                                self.registry["models"].append(entry)
                        except Exception as e:
                            print(f"[ModelRegistry] Error processing {filename}: {e}")
            
            existing_versions = {}
            for model in self.registry["models"]:
                model_type = model["model_type"]
                if model_type not in existing_versions:
                    existing_versions[model_type] = 0
                existing_versions[model_type] += 1
                model["version"] = existing_versions[model_type]
            
            if self._save_registry():
                print(f"[ModelRegistry] Registry rebuilt with {len(self.registry['models'])} models")
                return True
            return False
        except Exception as e:
            print(f"[ModelRegistry] Error rebuilding registry: {e}")
            return False

    def integrity_check(self) -> Dict[str, Any]:
        """Check registry integrity and file existence."""
        try:
            results = {
                "total_models": len(self.registry["models"]),
                "valid_models": 0,
                "missing_files": [],
                "invalid_entries": [],
                "duplicate_versions": []
            }
            
            version_tracker = {}
            
            for model in self.registry["models"]:
                required_fields = ["model_id", "model_type", "version", "created_at", "path"]
                missing_fields = [f for f in required_fields if f not in model]
                
                if missing_fields:
                    results["invalid_entries"].append({
                        "model": model.get("model_id", "unknown"),
                        "missing_fields": missing_fields
                    })
                    continue
                
                if not os.path.exists(model["path"]):
                    results["missing_files"].append({
                        "model_id": model["model_id"],
                        "model_type": model["model_type"],
                        "version": model["version"],
                        "path": model["path"]
                    })
                else:
                    results["valid_models"] += 1
                
                key = f"{model['model_type']}_v{model['version']}"
                if key in version_tracker:
                    results["duplicate_versions"].append({
                        "model_type": model["model_type"],
                        "version": model["version"],
                        "ids": [version_tracker[key], model["model_id"]]
                    })
                else:
                    version_tracker[key] = model["model_id"]
            
            print(f"[ModelRegistry] Integrity check: {results['valid_models']}/{results['total_models']} valid")
            if results["missing_files"]:
                print(f"[ModelRegistry] Warning: {len(results['missing_files'])} missing files")
            if results["invalid_entries"]:
                print(f"[ModelRegistry] Warning: {len(results['invalid_entries'])} invalid entries")
            if results["duplicate_versions"]:
                print(f"[ModelRegistry] Warning: {len(results['duplicate_versions'])} duplicate versions")
            
            return results
        except Exception as e:
            print(f"[ModelRegistry] Error during integrity check: {e}")
            return {"error": str(e)}

    def summary(self) -> Dict[str, Any]:
        """Generate registry summary statistics."""
        try:
            model_types = {}
            total_models = len(self.registry["models"])
            
            for model in self.registry["models"]:
                model_type = model.get("model_type", "unknown")
                if model_type not in model_types:
                    model_types[model_type] = {
                        "count": 0,
                        "versions": [],
                        "latest_version": 0
                    }
                model_types[model_type]["count"] += 1
                version = model.get("version", 0)
                model_types[model_type]["versions"].append(version)
                if version > model_types[model_type]["latest_version"]:
                    model_types[model_type]["latest_version"] = version
            
            summary = {
                "total_models": total_models,
                "model_types": len(model_types),
                "breakdown": model_types,
                "registry_path": self.registry_path,
                "last_updated": datetime.utcnow().isoformat()
            }
            
            return summary
        except Exception as e:
            print(f"[ModelRegistry] Error generating summary: {e}")
            return {"error": str(e)}
