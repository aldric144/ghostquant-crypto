"""
TrainingStage - Pure Python training stage for GhostTrainer™ pipeline.
Trains all 4 ML models with metadata tracking.
"""

from typing import Dict, Any, List
from datetime import datetime


class TrainingStage:
    """Training stage for GhostTrainer™ - trains all 4 ML models."""

    def __init__(self):
        """Initialize training stage with empty model storage."""
        self.trained_models: Dict[str, Any] = {}
        self.training_metadata: Dict[str, Any] = {
            "models_trained": [],
            "models_failed": [],
            "training_start": None,
            "training_end": None,
            "total_duration_seconds": 0.0,
            "dataset_size": 0,
            "feature_count": 0
        }

    def train_all_models(self, X_train: List[List[float]], y_train: List[int]) -> Dict[str, Any]:
        """Train all 4 ML models and store results with metadata."""
        try:
            print("[TrainingStage] Starting training pipeline for all 4 models")
            
            if not X_train or not y_train:
                print("[TrainingStage] Error: Empty training dataset")
                return {"error": "Empty training dataset"}

            if len(X_train) != len(y_train):
                print("[TrainingStage] Error: X_train and y_train length mismatch")
                return {"error": "X_train and y_train length mismatch"}

            self.training_metadata["training_start"] = datetime.utcnow().isoformat()
            self.training_metadata["dataset_size"] = len(X_train)
            self.training_metadata["feature_count"] = len(X_train[0]) if X_train else 0
            
            start_time = datetime.utcnow()

            model_configs = [
                ("LSTM", "LSTMPredictor", {"input_size": 30, "hidden_size": 64, "num_layers": 2}),
                ("GradientBoost", "GradientBoostPredictor", {"n_estimators": 100, "max_depth": 6, "learning_rate": 0.1}),
                ("RandomForest", "RandomForestRiskModel", {"n_estimators": 100, "max_depth": 10}),
                ("Logistic", "LogisticRiskModel", {"regularization": 1.0})
            ]

            for model_name, model_class_name, model_params in model_configs:
                try:
                    print(f"[TrainingStage] Training {model_name}...")
                    
                    model_start = datetime.utcnow()
                    
                    model = self._build_model(model_class_name, model_params)
                    if model is None:
                        print(f"[TrainingStage] Failed to build {model_name}")
                        self.training_metadata["models_failed"].append({
                            "model": model_name,
                            "reason": "Failed to instantiate model"
                        })
                        continue

                    if hasattr(model, 'train'):
                        model.train(X_train, y_train)
                    elif hasattr(model, 'fit'):
                        model.fit(X_train, y_train)
                    else:
                        print(f"[TrainingStage] {model_name} has no train() or fit() method")
                        self.training_metadata["models_failed"].append({
                            "model": model_name,
                            "reason": "No train() or fit() method"
                        })
                        continue

                    model_end = datetime.utcnow()
                    duration = (model_end - model_start).total_seconds()

                    self.trained_models[model_name] = model
                    
                    self.training_metadata["models_trained"].append({
                        "model": model_name,
                        "duration_seconds": duration,
                        "timestamp": model_end.isoformat()
                    })

                    print(f"[TrainingStage] {model_name} trained successfully in {duration:.2f}s")

                except Exception as e:
                    print(f"[TrainingStage] Error training {model_name}: {e}")
                    self.training_metadata["models_failed"].append({
                        "model": model_name,
                        "reason": str(e)
                    })
                    continue

            end_time = datetime.utcnow()
            total_duration = (end_time - start_time).total_seconds()

            self.training_metadata["training_end"] = end_time.isoformat()
            self.training_metadata["total_duration_seconds"] = total_duration

            print(f"[TrainingStage] Training complete: {len(self.trained_models)}/4 models trained in {total_duration:.2f}s")

            return {
                "success": True,
                "models_trained": len(self.trained_models),
                "models_failed": len(self.training_metadata["models_failed"]),
                "total_duration": total_duration
            }

        except Exception as e:
            print(f"[TrainingStage] Critical error in train_all_models: {e}")
            return {"error": str(e)}

    def get_models(self) -> Dict[str, Any]:
        """Return dictionary of trained models."""
        return self.trained_models

    def get_metadata(self) -> Dict[str, Any]:
        """Return training metadata."""
        return self.training_metadata

    def _build_model(self, model_class_name: str, params: Dict[str, Any]) -> Any:
        """Build model instance from class name and parameters."""
        try:
            if model_class_name == "LSTMPredictor":
                from app.gde.predictor.models import LSTMPredictor
                return LSTMPredictor(**params)
            elif model_class_name == "GradientBoostPredictor":
                from app.gde.predictor.models import GradientBoostPredictor
                return GradientBoostPredictor(**params)
            elif model_class_name == "RandomForestRiskModel":
                from app.gde.predictor.models import RandomForestRiskModel
                return RandomForestRiskModel(**params)
            elif model_class_name == "LogisticRiskModel":
                from app.gde.predictor.models import LogisticRiskModel
                return LogisticRiskModel(**params)
            else:
                print(f"[TrainingStage] Unknown model class: {model_class_name}")
                return None

        except Exception as e:
            print(f"[TrainingStage] Error building model {model_class_name}: {e}")
            return None

    def __repr__(self) -> str:
        """String representation for debugging."""
        models_count = len(self.trained_models)
        failed_count = len(self.training_metadata.get("models_failed", []))
        duration = self.training_metadata.get("total_duration_seconds", 0.0)
        
        return (
            f"TrainingStage("
            f"models_trained={models_count}, "
            f"models_failed={failed_count}, "
            f"duration={duration:.2f}s"
            f")"
        )
