"""
PredictionBenchmarkSuite - Pure Python model benchmarking engine.
Compares all 4 ML models using stratified K-fold cross-validation.
"""

from typing import List, Dict, Any, Optional, Tuple
import json
import random
from datetime import datetime


class PredictionBenchmarkSuite:
    """Pure Python benchmarking suite for comparing ML models."""

    def __init__(self, seed: Optional[int] = None):
        """Initialize benchmark suite with optional random seed."""
        self.seed = seed
        if seed is not None:
            random.seed(seed)
        self.model_types = ["LSTM", "GradientBoost", "RandomForest", "Logistic"]

    def benchmark_all_models(
        self, 
        X: List[List[float]], 
        y: List[int], 
        k: int = 5
    ) -> Dict[str, Any]:
        """Run stratified K-fold cross-validation on all 4 ML models."""
        try:
            from app.gde.predictor.dataset.cross_validator_engine import CrossValidatorEngine
            
            valid, reason = self._validate_inputs(X, y)
            if not valid:
                print(f"[BenchmarkSuite] Validation failed: {reason}")
                return {"error": reason}

            print(f"[BenchmarkSuite] Starting benchmark of 4 models with {len(X)} samples, {k}-fold CV")

            validator = CrossValidatorEngine(seed=self.seed)
            results = {}

            for model_type in self.model_types:
                try:
                    print(f"[BenchmarkSuite] Benchmarking {model_type}...")
                    
                    model = self._build_model(model_type)
                    if model is None:
                        print(f"[BenchmarkSuite] Failed to build {model_type}")
                        continue

                    model_results = validator.cross_validate(model, X, y, k)
                    
                    if "error" not in model_results:
                        results[model_type] = model_results
                        print(f"[BenchmarkSuite] {model_type} complete: F1={model_results.get('mean_f1', 0.0):.4f}")
                    else:
                        print(f"[BenchmarkSuite] {model_type} failed: {model_results['error']}")

                except Exception as e:
                    print(f"[BenchmarkSuite] Error benchmarking {model_type}: {e}")
                    continue

            if not results:
                return {"error": "No models successfully benchmarked"}

            rankings = self.rank_models(results, metric="mean_f1")
            results["rankings"] = rankings
            results["benchmark_timestamp"] = datetime.utcnow().isoformat()
            results["total_samples"] = len(X)
            results["k_folds"] = k

            print(f"[BenchmarkSuite] Benchmark complete: {len(results) - 4} models evaluated")
            return results

        except Exception as e:
            print(f"[BenchmarkSuite] Error in benchmark_all_models: {e}")
            return {"error": str(e)}

    def rank_models(self, results: Dict[str, Any], metric: str = "mean_f1") -> List[Dict[str, Any]]:
        """Sort models by the selected metric and return ranking list."""
        try:
            valid_metrics = ["mean_accuracy", "mean_precision", "mean_recall", "mean_f1"]
            if metric not in valid_metrics:
                print(f"[BenchmarkSuite] Invalid metric '{metric}', using 'mean_f1'")
                metric = "mean_f1"

            rankings = []
            
            for model_type in self.model_types:
                if model_type in results and "error" not in results[model_type]:
                    model_result = results[model_type]
                    metric_value = model_result.get(metric, 0.0)
                    
                    rankings.append({
                        "model": model_type,
                        "metric": metric,
                        "value": self._clean_metric(metric_value),
                        "mean_accuracy": self._clean_metric(model_result.get("mean_accuracy", 0.0)),
                        "mean_precision": self._clean_metric(model_result.get("mean_precision", 0.0)),
                        "mean_recall": self._clean_metric(model_result.get("mean_recall", 0.0)),
                        "mean_f1": self._clean_metric(model_result.get("mean_f1", 0.0))
                    })

            rankings.sort(key=lambda x: x["value"], reverse=True)
            
            for rank, entry in enumerate(rankings, 1):
                entry["rank"] = rank

            print(f"[BenchmarkSuite] Ranked {len(rankings)} models by {metric}")
            return rankings

        except Exception as e:
            print(f"[BenchmarkSuite] Error ranking models: {e}")
            return []

    def summarize_results(self, results: Dict[str, Any]) -> str:
        """Produce a full plaintext report with metrics, rankings, and analysis."""
        try:
            if "error" in results:
                return f"[BenchmarkSuite] Error: {results['error']}"

            if "rankings" not in results:
                return "[BenchmarkSuite] No rankings available"

            lines = []
            lines.append("=" * 100)
            lines.append("PREDICTION BENCHMARK SUITE - COMPREHENSIVE RESULTS")
            lines.append("=" * 100)
            lines.append("")

            lines.append(f"Benchmark Timestamp: {results.get('benchmark_timestamp', 'N/A')}")
            lines.append(f"Total Samples: {results.get('total_samples', 'N/A')}")
            lines.append(f"K-Folds: {results.get('k_folds', 'N/A')}")
            lines.append(f"Models Evaluated: {len(results.get('rankings', []))}")
            lines.append("")

            lines.append("=" * 100)
            lines.append("MODEL RANKINGS (by Mean F1 Score)")
            lines.append("=" * 100)
            lines.append("")

            rankings = results.get("rankings", [])
            if rankings:
                lines.append(f"{'Rank':<8} {'Model':<20} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1 Score':<12}")
                lines.append("-" * 100)
                
                for entry in rankings:
                    lines.append(
                        f"{entry['rank']:<8} "
                        f"{entry['model']:<20} "
                        f"{entry['mean_accuracy']:<12.4f} "
                        f"{entry['mean_precision']:<12.4f} "
                        f"{entry['mean_recall']:<12.4f} "
                        f"{entry['mean_f1']:<12.4f}"
                    )
                lines.append("-" * 100)
                lines.append("")

                best_model = rankings[0]
                lines.append(f"🏆 WINNER: {best_model['model']} (F1={best_model['mean_f1']:.4f})")
                lines.append("")

            lines.append("=" * 100)
            lines.append("DETAILED MODEL PERFORMANCE")
            lines.append("=" * 100)
            lines.append("")

            for model_type in self.model_types:
                if model_type in results and "error" not in results[model_type]:
                    model_result = results[model_type]
                    
                    lines.append(f"--- {model_type} ---")
                    lines.append("")
                    
                    lines.append("Mean Metrics:")
                    lines.append(f"  Accuracy:  {model_result.get('mean_accuracy', 0.0):.4f} ± {model_result.get('std_accuracy', 0.0):.4f}")
                    lines.append(f"  Precision: {model_result.get('mean_precision', 0.0):.4f} ± {model_result.get('std_precision', 0.0):.4f}")
                    lines.append(f"  Recall:    {model_result.get('mean_recall', 0.0):.4f} ± {model_result.get('std_recall', 0.0):.4f}")
                    lines.append(f"  F1 Score:  {model_result.get('mean_f1', 0.0):.4f} ± {model_result.get('std_f1', 0.0):.4f}")
                    lines.append("")

                    if "folds" in model_result and model_result["folds"]:
                        folds = model_result["folds"]
                        
                        best_fold = max(folds, key=lambda x: x.get("f1_score", 0.0))
                        worst_fold = min(folds, key=lambda x: x.get("f1_score", 0.0))
                        
                        lines.append(f"Best Fold:  Fold {best_fold['fold']} (F1={best_fold['f1_score']:.4f})")
                        lines.append(f"Worst Fold: Fold {worst_fold['fold']} (F1={worst_fold['f1_score']:.4f})")
                        lines.append(f"Variance:   {best_fold['f1_score'] - worst_fold['f1_score']:.4f}")
                        lines.append("")

                    lines.append("")

            lines.append("=" * 100)
            lines.append("COMPARATIVE ANALYSIS")
            lines.append("=" * 100)
            lines.append("")

            if len(rankings) >= 2:
                best = rankings[0]
                second = rankings[1]
                
                lines.append(f"Performance Gap (1st vs 2nd):")
                lines.append(f"  {best['model']} vs {second['model']}")
                lines.append(f"  F1 Difference: {best['mean_f1'] - second['mean_f1']:.4f}")
                lines.append(f"  Relative Improvement: {((best['mean_f1'] - second['mean_f1']) / second['mean_f1'] * 100):.2f}%")
                lines.append("")

            if len(rankings) >= 1:
                best = rankings[0]
                worst = rankings[-1]
                
                lines.append(f"Performance Range (Best vs Worst):")
                lines.append(f"  Best:  {best['model']} (F1={best['mean_f1']:.4f})")
                lines.append(f"  Worst: {worst['model']} (F1={worst['mean_f1']:.4f})")
                lines.append(f"  Range: {best['mean_f1'] - worst['mean_f1']:.4f}")
                lines.append("")

            lines.append("=" * 100)
            lines.append("RECOMMENDATIONS")
            lines.append("=" * 100)
            lines.append("")

            if rankings:
                best = rankings[0]
                
                if best['mean_f1'] >= 0.90:
                    lines.append(f"✓ {best['model']} shows excellent performance (F1 >= 0.90)")
                    lines.append("  Recommendation: Deploy to production")
                elif best['mean_f1'] >= 0.80:
                    lines.append(f"✓ {best['model']} shows good performance (F1 >= 0.80)")
                    lines.append("  Recommendation: Consider deployment with monitoring")
                elif best['mean_f1'] >= 0.70:
                    lines.append(f"⚠ {best['model']} shows moderate performance (F1 >= 0.70)")
                    lines.append("  Recommendation: Improve features or hyperparameters")
                else:
                    lines.append(f"✗ {best['model']} shows poor performance (F1 < 0.70)")
                    lines.append("  Recommendation: Revisit data quality and feature engineering")
                
                lines.append("")

                if len(rankings) >= 2:
                    lines.append("Model Selection Guidance:")
                    for i, entry in enumerate(rankings[:3], 1):
                        if entry['mean_f1'] >= 0.80:
                            lines.append(f"  {i}. {entry['model']}: Strong candidate (F1={entry['mean_f1']:.4f})")
                        elif entry['mean_f1'] >= 0.70:
                            lines.append(f"  {i}. {entry['model']}: Acceptable candidate (F1={entry['mean_f1']:.4f})")
                        else:
                            lines.append(f"  {i}. {entry['model']}: Needs improvement (F1={entry['mean_f1']:.4f})")

            lines.append("")
            lines.append("=" * 100)

            return "\n".join(lines)

        except Exception as e:
            print(f"[BenchmarkSuite] Error generating summary: {e}")
            return f"[BenchmarkSuite] Error generating summary: {e}"

    def export_results_json(self, results: Dict[str, Any], path: str) -> bool:
        """Save benchmark results to JSON file."""
        try:
            import os
            
            directory = os.path.dirname(path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)

            if not path.endswith(".json"):
                path = f"{path}.json"

            with open(path, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, sort_keys=True)

            print(f"[BenchmarkSuite] Results exported to {path}")
            return True

        except Exception as e:
            print(f"[BenchmarkSuite] Error exporting results: {e}")
            return False

    def compare_two_models(
        self,
        modelA_type: str,
        modelB_type: str,
        X: List[List[float]],
        y: List[int],
        k: int = 5
    ) -> Dict[str, Any]:
        """Return side-by-side comparison of two models."""
        try:
            from app.gde.predictor.dataset.cross_validator_engine import CrossValidatorEngine

            valid, reason = self._validate_inputs(X, y)
            if not valid:
                print(f"[BenchmarkSuite] Validation failed: {reason}")
                return {"error": reason}

            print(f"[BenchmarkSuite] Comparing {modelA_type} vs {modelB_type}")

            validator = CrossValidatorEngine(seed=self.seed)

            modelA = self._build_model(modelA_type)
            modelB = self._build_model(modelB_type)

            if modelA is None or modelB is None:
                return {"error": "Failed to build one or both models"}

            resultsA = validator.cross_validate(modelA, X, y, k)
            resultsB = validator.cross_validate(modelB, X, y, k)

            if "error" in resultsA or "error" in resultsB:
                return {"error": "One or both models failed evaluation"}

            f1_A = resultsA.get("mean_f1", 0.0)
            f1_B = resultsB.get("mean_f1", 0.0)

            winner = modelA_type if f1_A > f1_B else modelB_type
            margin = abs(f1_A - f1_B)

            comparison = {
                "modelA": {
                    "type": modelA_type,
                    "results": resultsA
                },
                "modelB": {
                    "type": modelB_type,
                    "results": resultsB
                },
                "winner": winner,
                "margin": self._clean_metric(margin),
                "comparison_timestamp": datetime.utcnow().isoformat()
            }

            print(f"[BenchmarkSuite] Winner: {winner} (margin={margin:.4f})")
            return comparison

        except Exception as e:
            print(f"[BenchmarkSuite] Error comparing models: {e}")
            return {"error": str(e)}

    def _build_model(self, model_type: str) -> Optional[Any]:
        """Create model instance based on model type."""
        try:
            if model_type == "LSTM":
                from app.gde.predictor.models import LSTMPredictor
                return LSTMPredictor(input_size=30, hidden_size=64, num_layers=2)
            elif model_type == "GradientBoost":
                from app.gde.predictor.models import GradientBoostPredictor
                return GradientBoostPredictor(n_estimators=100, max_depth=6, learning_rate=0.1)
            elif model_type == "RandomForest":
                from app.gde.predictor.models import RandomForestRiskModel
                return RandomForestRiskModel(n_estimators=100, max_depth=10)
            elif model_type == "Logistic":
                from app.gde.predictor.models import LogisticRiskModel
                return LogisticRiskModel(regularization=1.0)
            else:
                print(f"[BenchmarkSuite] Unknown model type: {model_type}")
                return None

        except Exception as e:
            print(f"[BenchmarkSuite] Error building model {model_type}: {e}")
            return None

    def _validate_inputs(self, X: List[List[float]], y: List[int]) -> Tuple[bool, str]:
        """Ensure dataset is valid for benchmarking."""
        try:
            if not X or not y:
                return False, "X or y is empty"

            if len(X) != len(y):
                return False, f"X and y have different lengths: {len(X)} vs {len(y)}"

            if len(X) < 10:
                return False, f"Dataset too small: {len(X)} samples (need at least 10)"

            unique_labels = set(y)
            if len(unique_labels) < 2:
                return False, f"Need at least 2 classes, found {len(unique_labels)}"

            return True, "Valid"

        except Exception as e:
            print(f"[BenchmarkSuite] Error validating inputs: {e}")
            return False, f"Validation error: {e}"

    def _clean_metric(self, value: float) -> float:
        """Safe rounding of metric values."""
        try:
            if value is None:
                return 0.0
            return round(float(value), 6)
        except Exception:
            return 0.0

    def load_results_json(self, path: str) -> Dict[str, Any]:
        """Load benchmark results from JSON file."""
        try:
            import os
            
            if not os.path.exists(path):
                print(f"[BenchmarkSuite] File not found: {path}")
                return {"error": "File not found"}

            with open(path, "r", encoding="utf-8") as f:
                results = json.load(f)

            print(f"[BenchmarkSuite] Results loaded from {path}")
            return results

        except Exception as e:
            print(f"[BenchmarkSuite] Error loading results: {e}")
            return {"error": str(e)}

    def compare_benchmark_runs(
        self,
        results1: Dict[str, Any],
        results2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compare two benchmark runs to track model improvements."""
        try:
            if "error" in results1 or "error" in results2:
                return {"error": "One or both benchmark runs have errors"}

            comparison = {
                "run1_timestamp": results1.get("benchmark_timestamp", "N/A"),
                "run2_timestamp": results2.get("benchmark_timestamp", "N/A"),
                "improvements": [],
                "regressions": []
            }

            for model_type in self.model_types:
                if model_type in results1 and model_type in results2:
                    f1_old = results1[model_type].get("mean_f1", 0.0)
                    f1_new = results2[model_type].get("mean_f1", 0.0)
                    delta = f1_new - f1_old

                    entry = {
                        "model": model_type,
                        "old_f1": self._clean_metric(f1_old),
                        "new_f1": self._clean_metric(f1_new),
                        "delta": self._clean_metric(delta),
                        "percent_change": self._clean_metric((delta / f1_old * 100) if f1_old > 0 else 0.0)
                    }

                    if delta > 0:
                        comparison["improvements"].append(entry)
                    elif delta < 0:
                        comparison["regressions"].append(entry)

            comparison["improvements"].sort(key=lambda x: x["delta"], reverse=True)
            comparison["regressions"].sort(key=lambda x: x["delta"])

            print(f"[BenchmarkSuite] Comparison complete: {len(comparison['improvements'])} improvements, {len(comparison['regressions'])} regressions")
            return comparison

        except Exception as e:
            print(f"[BenchmarkSuite] Error comparing benchmark runs: {e}")
            return {"error": str(e)}
