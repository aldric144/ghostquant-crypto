"""
SaveStage - Model persistence stage for GhostTrainer™ pipeline.
Saves champion model and registers it in the model registry.
"""

from typing import Dict, Any
import os
from datetime import datetime


class SaveStage:
    """Save and register champion models for GhostTrainer™ pipeline."""

    def __init__(self, save_dir: str = "models", registry_path: str = "model_registry.json"):
        """Initialize save stage with directory and registry."""
        try:
            self.save_dir = save_dir
            self.registry_path = registry_path
            self.metadata: Dict[str, Any] = {}
            self.last_saved: str = ""

            if not os.path.exists(save_dir):
                os.makedirs(save_dir, exist_ok=True)
                print(f"[SaveStage] Created directory: {save_dir}")

            from app.gde.predictor.model_save_load_manager import ModelSaveLoadManager
            from app.gde.predictor.model_registry_manager import ModelRegistryManager

            self.manager = ModelSaveLoadManager()
            self.registry = ModelRegistryManager(os.path.join(save_dir, registry_path))

            print(f"[SaveStage] Initialized with save_dir='{save_dir}', registry='{registry_path}'")

        except Exception as e:
            print(f"[SaveStage] Error during initialization: {e}")
            self.manager = None
            self.registry = None

    def save_champion(self, champion_info: Dict[str, Any]) -> Dict[str, Any]:
        """Save champion model to disk and register in model registry."""
        try:
            print("[SaveStage] Saving champion model...")

            if not champion_info:
                print("[SaveStage] Error: No champion info provided")
                return {"error": "No champion info provided"}

            if self.manager is None or self.registry is None:
                print("[SaveStage] Error: SaveStage not properly initialized")
                return {"error": "SaveStage not properly initialized"}

            model_name = champion_info.get("model_name")
            model_object = champion_info.get("model_object")
            version = champion_info.get("version", 1)

            if not model_name:
                print("[SaveStage] Error: No model_name in champion_info")
                return {"error": "No model_name in champion_info"}

            if model_object is None:
                print("[SaveStage] Error: No model_object in champion_info")
                return {"error": "No model_object in champion_info"}

            filename = f"{model_name}_v{version}"
            file_path = os.path.join(self.save_dir, filename)

            print(f"[SaveStage] Saving model to: {file_path}.ghostmodel.json")

            save_success = self.manager.save_model(model_object, file_path)

            if not save_success:
                print("[SaveStage] Error: Failed to save model")
                return {"error": "Failed to save model"}

            full_path = f"{file_path}.ghostmodel.json"

            print(f"[SaveStage] Registering model in registry...")

            metrics = champion_info.get("metrics", {})
            if not metrics and "ranking_info" in champion_info:
                ranking_info = champion_info["ranking_info"]
                metrics = {
                    "mean_f1": ranking_info.get("mean_f1", 0.0),
                    "mean_accuracy": ranking_info.get("mean_accuracy", 0.0),
                    "mean_precision": ranking_info.get("mean_precision", 0.0),
                    "mean_recall": ranking_info.get("mean_recall", 0.0),
                    "rank": ranking_info.get("rank", 1)
                }

            registry_entry = self.registry.register_model(
                model=model_object,
                model_type=model_name,
                path=full_path,
                metadata=metrics
            )

            if not registry_entry:
                print("[SaveStage] Warning: Failed to register model in registry")
                registry_version = None
            else:
                registry_version = registry_entry.get("version")
                print(f"[SaveStage] Model registered as version {registry_version}")

            timestamp = datetime.utcnow().isoformat()

            self.metadata = {
                "model_name": model_name,
                "version": version,
                "file_path": full_path,
                "registry_version": registry_version,
                "timestamp": timestamp,
                "metrics": metrics
            }

            self.last_saved = f"{model_name}_v{version}"

            print(f"[SaveStage] Champion saved successfully: {self.last_saved}")

            return {
                "success": True,
                "file_path": full_path,
                "registry_version": registry_version,
                "timestamp": timestamp,
                "model_name": model_name,
                "version": version
            }

        except Exception as e:
            print(f"[SaveStage] Error saving champion: {e}")
            return {"error": str(e)}

    def get_metadata(self) -> Dict[str, Any]:
        """Return save metadata."""
        try:
            if not self.metadata:
                return {"error": "No metadata available"}

            return self.metadata

        except Exception as e:
            print(f"[SaveStage] Error getting metadata: {e}")
            return {"error": str(e)}

    def __repr__(self) -> str:
        """String representation for debugging."""
        if self.last_saved:
            return f"<SaveStage last_saved='{self.last_saved}'>"
        else:
            return "<SaveStage last_saved=None>"
