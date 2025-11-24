
from typing import Dict, Any, List
from datetime import datetime

class BenchmarkStage:
    """
    BenchmarkStage
    ----------------------
    Runs cross-model benchmarking using PredictionBenchmarkSuite.

    Input:
        - trained_models: dict of model_name → model_instance
        - X_train, y_train: training subset
        - X_test,  y_test:  testing subset

    Output:
        - benchmark_results: dict with metrics for each model
        - rankings: ordered list of models (best → worst)
        - metadata: benchmarking metadata
    """

    def __init__(self, benchmark_suite):
        self.benchmark_suite = benchmark_suite
        self.results: Dict[str, Any] = {}
        self.rankings: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}

    def run(self, trained_models, X_train, y_train, X_test, y_test, k_folds=5):
        start = datetime.utcnow()
        print("[BenchmarkStage] Starting benchmarking...")

        try:
            X = X_train + X_test
            y = y_train + y_test

            benchmark_results = self.benchmark_suite.benchmark_all_models(
                X=X,
                y=y,
                k=k_folds
            )

            rankings = benchmark_results.get("rankings", [])

            self.results = benchmark_results
            self.rankings = rankings

            self.metadata = {
                "timestamp": datetime.utcnow().isoformat(),
                "models_evaluated": list(trained_models.keys()),
                "total_models": len(trained_models),
                "k_folds": k_folds,
                "duration_seconds": (datetime.utcnow() - start).total_seconds(),
                "top_model": rankings[0]["model"] if len(rankings) > 0 else None,
            }

            print("[BenchmarkStage] Benchmarking complete.")
            return {
                "success": True,
                "results": self.results,
                "rankings": self.rankings,
                "metadata": self.metadata
            }

        except Exception as e:
            print("[BenchmarkStage] ERROR:", str(e))
            return {
                "success": False,
                "error": str(e),
                "results": {},
                "rankings": [],
                "metadata": {}
            }

    def get_results(self):
        return self.results

    def get_rankings(self):
        return self.rankings

    def get_metadata(self):
        return self.metadata

    def __repr__(self):
        return f"<BenchmarkStage models={len(self.results)}>"
