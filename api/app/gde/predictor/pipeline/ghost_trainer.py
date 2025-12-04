"""
GhostTrainer - Complete end-to-end training pipeline controller.
Orchestrates all 4 stages: Training, Benchmarking, Champion Selection, and Saving.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class GhostTrainer:
    """Complete automated training pipeline for GhostPredictor™."""

    def __init__(
        self,
        seed: int = 42,
        models_dir: str = "models",
        registry_path: str = "model_registry.json"
    ):
        """Initialize GhostTrainer with all pipeline stages."""
        try:
            print("[GhostTrainer] Initializing complete training pipeline...")

            self.seed = seed
            self.models_dir = models_dir
            self.registry_path = registry_path
            self.metadata: Dict[str, Any] = {}
            self.champion_name: Optional[str] = None

            from app.gde.predictor.pipeline.training_stage import TrainingStage
            from app.gde.predictor.pipeline.benchmark_stage import BenchmarkStage
            from app.gde.predictor.pipeline.champion_stage import ChampionStage
            from app.gde.predictor.pipeline.save_stage import SaveStage

            self.training_stage = TrainingStage()
            self.benchmark_stage = None
            self.champion_stage = ChampionStage()
            self.save_stage = SaveStage(save_dir=models_dir, registry_path=registry_path)

            print(f"[GhostTrainer] Initialized with seed={seed}, models_dir='{models_dir}'")

        except Exception as e:
            print(f"[GhostTrainer] Error during initialization: {e}")
            raise

    def run(
        self,
        raw_dataset: List[Dict[str, Any]],
        split_method: str = "time",
        test_ratio: float = 0.2,
        k_folds: int = 5,
        balance_mode: str = "undersample"
    ) -> Dict[str, Any]:
        """Run complete end-to-end training pipeline."""
        try:
            print("[GhostTrainer] ========================================")
            print("[GhostTrainer] Starting GhostTrainer™ Pipeline")
            print("[GhostTrainer] ========================================")

            pipeline_start = datetime.utcnow()

            print("[GhostTrainer] STEP A: Building dataset...")

            from app.gde.predictor.model_dataset_controller import ModelDatasetController
            from app.gde.predictor.synthetic_data_generator import SyntheticDataGenerator

            controller = ModelDatasetController()

            if not raw_dataset:
                print("[GhostTrainer] No dataset provided, generating synthetic data...")
                generator = SyntheticDataGenerator(seed=self.seed)
                raw_dataset = generator.generate_dataset(n=5000)

            dataset_result = controller.construct_dataset(raw_dataset)
            if "error" in dataset_result:
                return {"error": f"Dataset construction failed: {dataset_result['error']}"}

            X = dataset_result["X"]
            y = dataset_result["y"]

            print(f"[GhostTrainer] Dataset constructed: {len(X)} samples, {len(X[0]) if X else 0} features")

            health_report = controller.generate_health_report(X, y)
            print(f"[GhostTrainer] Health: {health_report.get('class_balance', 'N/A')}")

            X_bal, y_bal = controller.balance_dataset(X, y, mode=balance_mode)
            print(f"[GhostTrainer] Balanced dataset: {len(X_bal)} samples")

            X_train, y_train, X_test, y_test, split_meta = controller.split(
                X_bal, y_bal,
                method=split_method,
                test_ratio=test_ratio
            )

            print(f"[GhostTrainer] Split: {len(X_train)} train, {len(X_test)} test")

            dataset_metadata = {
                "total_samples": len(X),
                "balanced_samples": len(X_bal),
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "feature_count": len(X[0]) if X else 0,
                "split_method": split_method,
                "balance_mode": balance_mode,
                "health_report": health_report
            }

            print("[GhostTrainer] STEP B: Training all models...")

            train_start = datetime.utcnow()
            train_result = self.training_stage.train_all_models(X_train, y_train)
            train_end = datetime.utcnow()

            if "error" in train_result:
                return {"error": f"Training failed: {train_result['error']}"}

            trained_models = self.training_stage.get_models()
            training_metadata = self.training_stage.get_metadata()

            print(f"[GhostTrainer] Training complete: {len(trained_models)}/4 models in {(train_end - train_start).total_seconds():.2f}s")

            print("[GhostTrainer] STEP C: Benchmarking models...")

            from app.gde.predictor.dataset.benchmark_suite import PredictionBenchmarkSuite

            benchmark_suite = PredictionBenchmarkSuite(seed=self.seed)
            self.benchmark_stage = BenchmarkStage(benchmark_suite)

            bench_start = datetime.utcnow()
            bench_result = self.benchmark_stage.run(
                trained_models=trained_models,
                X_train=X_train,
                y_train=y_train,
                X_test=X_test,
                y_test=y_test,
                k_folds=k_folds
            )
            bench_end = datetime.utcnow()

            if not bench_result.get("success"):
                return {"error": f"Benchmarking failed: {bench_result.get('error', 'Unknown error')}"}

            rankings = bench_result["rankings"]
            benchmark_metadata = self.benchmark_stage.get_metadata()

            print(f"[GhostTrainer] Benchmarking complete in {(bench_end - bench_start).total_seconds():.2f}s")
            if rankings:
                print(f"[GhostTrainer] Top model: {rankings[0]['model']} (F1={rankings[0]['mean_f1']:.4f})")

            print("[GhostTrainer] STEP D: Selecting champion...")

            champ_result = self.champion_stage.select_champion(trained_models, rankings)

            if not champ_result.get("success"):
                return {"error": f"Champion selection failed: {champ_result.get('error', 'Unknown error')}"}

            champion = self.champion_stage.get_champion()
            champion_metadata = self.champion_stage.get_metadata()

            self.champion_name = f"{champion['model_name']}_v{champion['version']}"

            print(f"[GhostTrainer] Champion selected: {self.champion_name}")

            print("[GhostTrainer] STEP E: Saving champion...")

            save_result = self.save_stage.save_champion(champion)

            if not save_result.get("success"):
                return {"error": f"Save failed: {save_result.get('error', 'Unknown error')}"}

            save_metadata = self.save_stage.get_metadata()

            print(f"[GhostTrainer] Champion saved: {save_result['file_path']}")

            pipeline_end = datetime.utcnow()
            total_duration = (pipeline_end - pipeline_start).total_seconds()

            print("[GhostTrainer] ========================================")
            print(f"[GhostTrainer] Pipeline Complete in {total_duration:.2f}s")
            print("[GhostTrainer] ========================================")

            self.metadata = {
                "pipeline_start": pipeline_start.isoformat(),
                "pipeline_end": pipeline_end.isoformat(),
                "total_duration_seconds": total_duration,
                "dataset": dataset_metadata,
                "training": training_metadata,
                "benchmark": benchmark_metadata,
                "champion": champion_metadata,
                "save": save_metadata
            }

            return {
                "success": True,
                "summary": {
                    "training": {
                        "models_trained": len(trained_models),
                        "duration_seconds": training_metadata.get("total_duration_seconds", 0.0)
                    },
                    "benchmark": {
                        "top_model": rankings[0]["model"] if rankings else None,
                        "top_f1": rankings[0]["mean_f1"] if rankings else 0.0,
                        "k_folds": k_folds
                    },
                    "champion": {
                        "model_name": champion["model_name"],
                        "version": champion["version"],
                        "f1_score": champion_metadata.get("mean_f1", 0.0),
                        "accuracy": champion_metadata.get("mean_accuracy", 0.0)
                    },
                    "saved_as": save_result["file_path"],
                    "registry_version": save_result.get("registry_version"),
                    "timestamp": pipeline_end.isoformat(),
                    "total_duration_seconds": total_duration
                },
                "metadata": self.metadata
            }

        except Exception as e:
            print(f"[GhostTrainer] Critical error in pipeline: {e}")
            return {"error": str(e)}

    def get_metadata(self) -> Dict[str, Any]:
        """Return complete pipeline metadata."""
        try:
            if not self.metadata:
                return {"error": "No metadata available - pipeline not run yet"}

            return self.metadata

        except Exception as e:
            print(f"[GhostTrainer] Error getting metadata: {e}")
            return {"error": str(e)}

    def __repr__(self) -> str:
        """String representation for debugging."""
        if self.champion_name:
            return f"<GhostTrainer champion='{self.champion_name}'>"
        else:
            return "<GhostTrainer champion=None>"
