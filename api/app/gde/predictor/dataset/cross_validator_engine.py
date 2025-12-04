"""
CrossValidatorEngine - Pure Python stratified K-fold cross-validation.
No external ML libraries - only standard library (random, math, collections, typing).
"""

from typing import List, Tuple, Dict, Any, Optional
import random
import math
from collections import defaultdict, Counter


class CrossValidatorEngine:
    """Pure Python stratified K-fold cross-validation engine."""

    def __init__(self, seed: Optional[int] = None):
        """Initialize cross-validator with optional random seed."""
        self.seed = seed
        if seed is not None:
            random.seed(seed)

    def stratified_kfold(
        self, 
        X: List[List[float]], 
        y: List[int], 
        k: int = 5
    ) -> List[Tuple[List[List[float]], List[int], List[List[float]], List[int]]]:
        """Perform stratified K-fold cross-validation maintaining label distribution."""
        try:
            valid, reason = self.validate_inputs(X, y, k)
            if not valid:
                print(f"[CrossValidator] Validation failed: {reason}")
                return []

            indices = list(range(len(X)))
            if self.seed is not None:
                random.seed(self.seed)
            random.shuffle(indices)

            label_indices = defaultdict(list)
            for idx in indices:
                label_indices[y[idx]].append(idx)

            folds = [[] for _ in range(k)]
            
            for label, label_idx_list in label_indices.items():
                fold_sizes = [len(label_idx_list) // k] * k
                remainder = len(label_idx_list) % k
                for i in range(remainder):
                    fold_sizes[i] += 1

                start = 0
                for fold_num in range(k):
                    end = start + fold_sizes[fold_num]
                    folds[fold_num].extend(label_idx_list[start:end])
                    start = end

            result = []
            for test_fold_idx in range(k):
                test_indices = folds[test_fold_idx]
                train_indices = []
                for i in range(k):
                    if i != test_fold_idx:
                        train_indices.extend(folds[i])

                train_X = [X[i] for i in train_indices]
                train_y = [y[i] for i in train_indices]
                test_X = [X[i] for i in test_indices]
                test_y = [y[i] for i in test_indices]

                result.append((train_X, train_y, test_X, test_y))

            print(f"[CrossValidator] Created {k} stratified folds with {len(X)} samples")
            return result

        except Exception as e:
            print(f"[CrossValidator] Error in stratified_kfold: {e}")
            return []

    def evaluate_model(
        self, 
        model: Any, 
        folds: List[Tuple[List[List[float]], List[int], List[List[float]], List[int]]]
    ) -> Dict[str, Any]:
        """Evaluate model on all folds and compute metrics."""
        try:
            if not folds:
                print("[CrossValidator] No folds provided for evaluation")
                return {"error": "No folds provided"}

            fold_results = []
            all_accuracies = []
            all_precisions = []
            all_recalls = []
            all_f1s = []

            for fold_idx, (train_X, train_y, test_X, test_y) in enumerate(folds):
                try:
                    if hasattr(model, 'fit'):
                        model.fit(train_X, train_y)
                    
                    if hasattr(model, 'predict'):
                        predictions = model.predict(test_X)
                    else:
                        predictions = [0] * len(test_y)

                    accuracy = self.accuracy_score(test_y, predictions)
                    precision = self.precision_score(test_y, predictions)
                    recall = self.recall_score(test_y, predictions)
                    f1 = self.f1_score(test_y, predictions)

                    fold_result = {
                        "fold": fold_idx + 1,
                        "train_samples": len(train_y),
                        "test_samples": len(test_y),
                        "accuracy": accuracy,
                        "precision": precision,
                        "recall": recall,
                        "f1_score": f1
                    }
                    fold_results.append(fold_result)

                    all_accuracies.append(accuracy)
                    all_precisions.append(precision)
                    all_recalls.append(recall)
                    all_f1s.append(f1)

                    print(f"[CrossValidator] Fold {fold_idx + 1}: Accuracy={accuracy:.4f}, F1={f1:.4f}")

                except Exception as e:
                    print(f"[CrossValidator] Error evaluating fold {fold_idx + 1}: {e}")
                    continue

            if not fold_results:
                return {"error": "No folds successfully evaluated"}

            mean_accuracy = sum(all_accuracies) / len(all_accuracies) if all_accuracies else 0.0
            mean_precision = sum(all_precisions) / len(all_precisions) if all_precisions else 0.0
            mean_recall = sum(all_recalls) / len(all_recalls) if all_recalls else 0.0
            mean_f1 = sum(all_f1s) / len(all_f1s) if all_f1s else 0.0

            results = {
                "folds": fold_results,
                "mean_accuracy": mean_accuracy,
                "mean_precision": mean_precision,
                "mean_recall": mean_recall,
                "mean_f1": mean_f1,
                "std_accuracy": self._std_dev(all_accuracies),
                "std_precision": self._std_dev(all_precisions),
                "std_recall": self._std_dev(all_recalls),
                "std_f1": self._std_dev(all_f1s)
            }

            print(f"[CrossValidator] Mean Accuracy: {mean_accuracy:.4f} ± {results['std_accuracy']:.4f}")
            print(f"[CrossValidator] Mean F1: {mean_f1:.4f} ± {results['std_f1']:.4f}")

            return results

        except Exception as e:
            print(f"[CrossValidator] Error in evaluate_model: {e}")
            return {"error": str(e)}

    def accuracy_score(self, y_true: List[int], y_pred: List[int]) -> float:
        """Calculate accuracy score (correct predictions / total predictions)."""
        try:
            if not y_true or not y_pred or len(y_true) != len(y_pred):
                return 0.0

            correct = sum(1 for true, pred in zip(y_true, y_pred) if true == pred)
            total = len(y_true)

            return correct / total if total > 0 else 0.0

        except Exception as e:
            print(f"[CrossValidator] Error calculating accuracy: {e}")
            return 0.0

    def precision_score(self, y_true: List[int], y_pred: List[int]) -> float:
        """Calculate precision score (TP / (TP + FP))."""
        try:
            if not y_true or not y_pred or len(y_true) != len(y_pred):
                return 0.0

            true_positives = sum(1 for true, pred in zip(y_true, y_pred) if true == 1 and pred == 1)
            false_positives = sum(1 for true, pred in zip(y_true, y_pred) if true == 0 and pred == 1)

            denominator = true_positives + false_positives
            if denominator == 0:
                return 0.0

            return true_positives / denominator

        except Exception as e:
            print(f"[CrossValidator] Error calculating precision: {e}")
            return 0.0

    def recall_score(self, y_true: List[int], y_pred: List[int]) -> float:
        """Calculate recall score (TP / (TP + FN))."""
        try:
            if not y_true or not y_pred or len(y_true) != len(y_pred):
                return 0.0

            true_positives = sum(1 for true, pred in zip(y_true, y_pred) if true == 1 and pred == 1)
            false_negatives = sum(1 for true, pred in zip(y_true, y_pred) if true == 1 and pred == 0)

            denominator = true_positives + false_negatives
            if denominator == 0:
                return 0.0

            return true_positives / denominator

        except Exception as e:
            print(f"[CrossValidator] Error calculating recall: {e}")
            return 0.0

    def f1_score(self, y_true: List[int], y_pred: List[int]) -> float:
        """Calculate F1 score (harmonic mean of precision and recall)."""
        try:
            precision = self.precision_score(y_true, y_pred)
            recall = self.recall_score(y_true, y_pred)

            if precision + recall == 0:
                return 0.0

            return 2 * (precision * recall) / (precision + recall)

        except Exception as e:
            print(f"[CrossValidator] Error calculating F1 score: {e}")
            return 0.0

    def summary_report(self, results: Dict[str, Any]) -> str:
        """Generate formatted summary report of cross-validation results."""
        try:
            if "error" in results:
                return f"[CrossValidator] Error: {results['error']}"

            if "folds" not in results:
                return "[CrossValidator] No fold results available"

            lines = []
            lines.append("=" * 80)
            lines.append("CROSS-VALIDATION SUMMARY REPORT")
            lines.append("=" * 80)
            lines.append("")

            lines.append(f"Total Folds: {len(results['folds'])}")
            lines.append("")

            lines.append("Per-Fold Results:")
            lines.append("-" * 80)
            lines.append(f"{'Fold':<8} {'Train':<10} {'Test':<10} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1':<12}")
            lines.append("-" * 80)

            for fold in results["folds"]:
                lines.append(
                    f"{fold['fold']:<8} "
                    f"{fold['train_samples']:<10} "
                    f"{fold['test_samples']:<10} "
                    f"{fold['accuracy']:<12.4f} "
                    f"{fold['precision']:<12.4f} "
                    f"{fold['recall']:<12.4f} "
                    f"{fold['f1_score']:<12.4f}"
                )

            lines.append("-" * 80)
            lines.append("")

            lines.append("Average Metrics:")
            lines.append("-" * 80)
            lines.append(f"Mean Accuracy:  {results['mean_accuracy']:.4f} ± {results.get('std_accuracy', 0.0):.4f}")
            lines.append(f"Mean Precision: {results['mean_precision']:.4f} ± {results.get('std_precision', 0.0):.4f}")
            lines.append(f"Mean Recall:    {results['mean_recall']:.4f} ± {results.get('std_recall', 0.0):.4f}")
            lines.append(f"Mean F1 Score:  {results['mean_f1']:.4f} ± {results.get('std_f1', 0.0):.4f}")
            lines.append("=" * 80)

            return "\n".join(lines)

        except Exception as e:
            print(f"[CrossValidator] Error generating summary report: {e}")
            return f"[CrossValidator] Error generating report: {e}"

    def validate_inputs(self, X: List[List[float]], y: List[int], k: int) -> Tuple[bool, str]:
        """Validate inputs for cross-validation."""
        try:
            if not X or not y:
                return False, "X or y is empty"

            if len(X) != len(y):
                return False, f"X and y have different lengths: {len(X)} vs {len(y)}"

            if k < 2:
                return False, f"k must be at least 2, got {k}"

            if k > len(X):
                return False, f"k ({k}) cannot be greater than number of samples ({len(X)})"

            unique_labels = set(y)
            if len(unique_labels) < 2:
                return False, f"Need at least 2 classes, found {len(unique_labels)}"

            label_counts = Counter(y)
            min_samples_per_class = min(label_counts.values())
            if min_samples_per_class < k:
                return False, f"Smallest class has {min_samples_per_class} samples, need at least {k} for {k}-fold CV"

            return True, "Valid"

        except Exception as e:
            print(f"[CrossValidator] Error validating inputs: {e}")
            return False, f"Validation error: {e}"

    def _std_dev(self, values: List[float]) -> float:
        """Calculate standard deviation of a list of values."""
        try:
            if not values or len(values) < 2:
                return 0.0

            mean = sum(values) / len(values)
            variance = sum((x - mean) ** 2 for x in values) / len(values)
            return math.sqrt(variance)

        except Exception as e:
            print(f"[CrossValidator] Error calculating standard deviation: {e}")
            return 0.0

    def confusion_matrix(self, y_true: List[int], y_pred: List[int]) -> Dict[str, int]:
        """Calculate confusion matrix components."""
        try:
            if not y_true or not y_pred or len(y_true) != len(y_pred):
                return {"TP": 0, "TN": 0, "FP": 0, "FN": 0}

            tp = sum(1 for true, pred in zip(y_true, y_pred) if true == 1 and pred == 1)
            tn = sum(1 for true, pred in zip(y_true, y_pred) if true == 0 and pred == 0)
            fp = sum(1 for true, pred in zip(y_true, y_pred) if true == 0 and pred == 1)
            fn = sum(1 for true, pred in zip(y_true, y_pred) if true == 1 and pred == 0)

            return {
                "TP": tp,
                "TN": tn,
                "FP": fp,
                "FN": fn
            }

        except Exception as e:
            print(f"[CrossValidator] Error calculating confusion matrix: {e}")
            return {"TP": 0, "TN": 0, "FP": 0, "FN": 0}

    def cross_validate(
        self,
        model: Any,
        X: List[List[float]],
        y: List[int],
        k: int = 5
    ) -> Dict[str, Any]:
        """Complete cross-validation pipeline: create folds and evaluate."""
        try:
            print(f"[CrossValidator] Starting {k}-fold cross-validation with {len(X)} samples")

            folds = self.stratified_kfold(X, y, k)
            if not folds:
                return {"error": "Failed to create folds"}

            results = self.evaluate_model(model, folds)

            return results

        except Exception as e:
            print(f"[CrossValidator] Error in cross_validate: {e}")
            return {"error": str(e)}

    def get_best_fold(self, results: Dict[str, Any], metric: str = "f1_score") -> Optional[Dict[str, Any]]:
        """Get the fold with the best performance for a given metric."""
        try:
            if "folds" not in results or not results["folds"]:
                return None

            valid_metrics = ["accuracy", "precision", "recall", "f1_score"]
            if metric not in valid_metrics:
                print(f"[CrossValidator] Invalid metric '{metric}', using 'f1_score'")
                metric = "f1_score"

            best_fold = max(results["folds"], key=lambda x: x.get(metric, 0.0))
            return best_fold

        except Exception as e:
            print(f"[CrossValidator] Error getting best fold: {e}")
            return None

    def get_worst_fold(self, results: Dict[str, Any], metric: str = "f1_score") -> Optional[Dict[str, Any]]:
        """Get the fold with the worst performance for a given metric."""
        try:
            if "folds" not in results or not results["folds"]:
                return None

            valid_metrics = ["accuracy", "precision", "recall", "f1_score"]
            if metric not in valid_metrics:
                print(f"[CrossValidator] Invalid metric '{metric}', using 'f1_score'")
                metric = "f1_score"

            worst_fold = min(results["folds"], key=lambda x: x.get(metric, 0.0))
            return worst_fold

        except Exception as e:
            print(f"[CrossValidator] Error getting worst fold: {e}")
            return None
