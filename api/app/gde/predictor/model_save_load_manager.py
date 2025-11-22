"""
ModelSaveLoadManager - Pure Python model persistence for GhostPredictor.
Custom JSON-based serialization without external dependencies.
"""

from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime


class ModelSaveLoadManager:
    """Manage saving and loading of ML models using pure Python serialization."""

    def __init__(self):
        """Initialize the model save/load manager."""
        self.supported_models = [
            "LSTMPredictor",
            "GradientBoostPredictor",
            "RandomForestRiskModel",
            "LogisticRiskModel"
        ]

    def _serialize_model(self, model: Any) -> Dict[str, Any]:
        """
        Convert model object to pure-Python serializable dict.
        
        Args:
            model: Model instance to serialize
            
        Returns:
            Dictionary with model class, parameters, and metadata
        """
        try:
            model_class = model.__class__.__name__
            
            if model_class not in self.supported_models:
                raise ValueError(f"Unsupported model class: {model_class}")
            
            if model_class == "LSTMPredictor":
                parameters = {
                    "input_size": model.input_size,
                    "hidden_size": model.hidden_size,
                    "num_layers": model.num_layers
                }
            elif model_class == "GradientBoostPredictor":
                parameters = {
                    "n_estimators": model.n_estimators,
                    "max_depth": model.max_depth,
                    "learning_rate": model.learning_rate
                }
            elif model_class == "RandomForestRiskModel":
                parameters = {
                    "n_estimators": model.n_estimators,
                    "max_depth": model.max_depth
                }
            elif model_class == "LogisticRiskModel":
                parameters = {
                    "regularization": model.regularization
                }
            else:
                parameters = {}
            
            serialized = {
                "model_class": model_class,
                "parameters": parameters,
                "metadata": {
                    "created_at": datetime.utcnow().isoformat(),
                    "version": "1.0",
                    "framework": "GhostPredictor"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return serialized
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Serialization error: {e}")
            return {}

    def _deserialize_model(self, data: Dict[str, Any]) -> Optional[Any]:
        """Rebuild model object from serialized dict."""
        try:
            from .models import LSTMPredictor, GradientBoostPredictor, RandomForestRiskModel, LogisticRiskModel
            model_class = data.get("model_class")
            parameters = data.get("parameters", {})
            
            if model_class == "LSTMPredictor":
                model = LSTMPredictor(input_size=parameters.get("input_size", 30), hidden_size=parameters.get("hidden_size", 64), num_layers=parameters.get("num_layers", 2))
            elif model_class == "GradientBoostPredictor":
                model = GradientBoostPredictor(n_estimators=parameters.get("n_estimators", 100), max_depth=parameters.get("max_depth", 6), learning_rate=parameters.get("learning_rate", 0.1))
            elif model_class == "RandomForestRiskModel":
                model = RandomForestRiskModel(n_estimators=parameters.get("n_estimators", 100), max_depth=parameters.get("max_depth", 10))
            elif model_class == "LogisticRiskModel":
                model = LogisticRiskModel(regularization=parameters.get("regularization", 1.0))
            else:
                print(f"[ModelSaveLoadManager] Unknown model class: {model_class}")
                return None
            return model
        except Exception as e:
            print(f"[ModelSaveLoadManager] Deserialization error: {e}")
            return None

    def save_model(self, model: Any, path: str) -> bool:
        """
        Save model to .ghostmodel.json file.
        
        Args:
            model: Model instance to save
            path: File path (will append .ghostmodel.json if needed)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not path.endswith(".ghostmodel.json"):
                path = path + ".ghostmodel.json"
            
            directory = os.path.dirname(path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
            
            serialized = self._serialize_model(model)
            
            if not serialized:
                return False
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(serialized, f, indent=2, sort_keys=True)
            
            print(f"[ModelSaveLoadManager] Model saved to {path}")
            return True
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Save error: {e}")
            return False

    def load_model(self, path: str) -> Optional[Any]:
        """
        Load model from .ghostmodel.json file.
        
        Args:
            path: File path to load from
            
        Returns:
            Reconstructed model instance or None
        """
        try:
            if not os.path.exists(path):
                print(f"[ModelSaveLoadManager] File not found: {path}")
                return None
            
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            model = self._deserialize_model(data)
            
            if model:
                print(f"[ModelSaveLoadManager] Model loaded from {path}")
            
            return model
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Load error: {e}")
            return None

    def export_weights(self, model: Any, path: str) -> bool:
        """
        Export only model parameters to JSON file.
        
        Args:
            model: Model instance
            path: File path (will append .weights.json if needed)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not path.endswith(".weights.json"):
                path = path + ".weights.json"
            
            directory = os.path.dirname(path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
            
            serialized = self._serialize_model(model)
            
            if not serialized:
                return False
            
            weights = {
                "model_class": serialized["model_class"],
                "parameters": serialized["parameters"],
                "exported_at": datetime.utcnow().isoformat()
            }
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(weights, f, indent=2, sort_keys=True)
            
            print(f"[ModelSaveLoadManager] Weights exported to {path}")
            return True
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Export error: {e}")
            return False

    def import_weights(self, model: Any, path: str) -> bool:
        """
        Load parameters into existing model instance.
        
        Args:
            model: Existing model instance
            path: File path to load weights from
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not os.path.exists(path):
                print(f"[ModelSaveLoadManager] File not found: {path}")
                return False
            
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            model_class = model.__class__.__name__
            saved_class = data.get("model_class")
            
            if model_class != saved_class:
                print(f"[ModelSaveLoadManager] Model class mismatch: {model_class} vs {saved_class}")
                return False
            
            parameters = data.get("parameters", {})
            
            if model_class == "LSTMPredictor":
                model.input_size = parameters.get("input_size", model.input_size)
                model.hidden_size = parameters.get("hidden_size", model.hidden_size)
                model.num_layers = parameters.get("num_layers", model.num_layers)
            elif model_class == "GradientBoostPredictor":
                model.n_estimators = parameters.get("n_estimators", model.n_estimators)
                model.max_depth = parameters.get("max_depth", model.max_depth)
                model.learning_rate = parameters.get("learning_rate", model.learning_rate)
            elif model_class == "RandomForestRiskModel":
                model.n_estimators = parameters.get("n_estimators", model.n_estimators)
                model.max_depth = parameters.get("max_depth", model.max_depth)
            elif model_class == "LogisticRiskModel":
                model.regularization = parameters.get("regularization", model.regularization)
            
            print(f"[ModelSaveLoadManager] Weights imported from {path}")
            return True
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Import error: {e}")
            return False

    def list_models(self, directory: str) -> List[str]:
        """List all .ghostmodel.json files in directory."""
        try:
            if not os.path.exists(directory):
                return []
            models = []
            for filename in os.listdir(directory):
                if filename.endswith(".ghostmodel.json"):
                    models.append(os.path.join(directory, filename))
            return sorted(models)
        except Exception as e:
            print(f"[ModelSaveLoadManager] List error: {e}")
            return []

    def verify_model_file(self, path: str) -> bool:
        """
        Verify model file has expected structure.
        
        Args:
            path: File path to verify
            
        Returns:
            True if valid, False otherwise
        """
        try:
            if not os.path.exists(path):
                return False
            
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            required_fields = ["model_class", "parameters", "metadata", "timestamp"]
            
            for field in required_fields:
                if field not in data:
                    print(f"[ModelSaveLoadManager] Missing field: {field}")
                    return False
            
            model_class = data.get("model_class")
            if model_class not in self.supported_models:
                print(f"[ModelSaveLoadManager] Unsupported model class: {model_class}")
                return False
            
            if not isinstance(data.get("parameters"), dict):
                print(f"[ModelSaveLoadManager] Invalid parameters format")
                return False
            
            print(f"[ModelSaveLoadManager] Model file verified: {path}")
            return True
        
        except Exception as e:
            print(f"[ModelSaveLoadManager] Verification error: {e}")
            return False
