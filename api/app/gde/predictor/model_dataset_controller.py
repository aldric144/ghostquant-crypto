"""
ModelDatasetController - Master orchestrator for ML dataset preparation.
Integrates feature building, validation, splitting, and health reporting.
Pure Python implementation with no external dependencies.
"""

from typing import Dict, List, Tuple, Any, Optional
import random
from datetime import datetime

from .features.predict_feature_builder import PredictFeatureBuilder
from .train_test_split import TrainTestSplitGenerator


class ModelDatasetController:
    """Master controller for ML dataset preparation."""

    def __init__(self, label_key: str = "label", timestamp_key: str = "timestamp"):
        """Initialize the dataset controller."""
        self.label_key = label_key
        self.timestamp_key = timestamp_key
        self.feature_builder = PredictFeatureBuilder()
        self.splitter = TrainTestSplitGenerator()

    def validate_row(self, row: Any) -> Tuple[bool, str]:
        """Validate a single data row. Returns (valid: bool, reason: str)."""
        try:
            if not isinstance(row, dict):
                return False, "Row is not a dictionary"
            if self.label_key not in row:
                return False, f"Missing label key: {self.label_key}"
            if self.timestamp_key not in row:
                return True, "Valid (no timestamp)"
            return True, "Valid"
        except Exception as e:
            return False, f"Validation error: {str(e)}"

    def extract_label(self, row: Dict[str, Any]) -> int:
        """Extract and normalize label to 0 or 1. Extremely defensive - never crashes."""
        try:
            label = row.get(self.label_key)
            if label is None:
                return 0
            if isinstance(label, (int, float)):
                return 1 if label >= 0.5 else 0
            if isinstance(label, str):
                label_lower = label.lower().strip()
                if label_lower in ["positive", "1", "true", "yes", "high", "manipulation", "risk"]:
                    return 1
                if label_lower in ["negative", "0", "false", "no", "low", "safe", "normal"]:
                    return 0
            if isinstance(label, bool):
                return 1 if label else 0
            return 0
        except Exception:
            return 0

    def build_feature_vector(self, row: Dict[str, Any]) -> Optional[Tuple[Dict[str, float], int]]:
        """Build feature vector from raw data row. Returns (features_dict, label) or None."""
        try:
            event_payload = row.get("event", {})
            entity_payload = row.get("entity", {})
            chain_payload = row.get("chain", {})
            token_payload = row.get("token", {})
            features = self.feature_builder.build(
                event_payload=event_payload,
                entity_payload=entity_payload,
                chain_payload=chain_payload,
                token_payload=token_payload
            )
            label = self.extract_label(row)
            return (features, label)
        except Exception as e:
            print(f"[DatasetController] WARNING: Feature extraction failed: {e}")
            return None

    def construct_dataset(self, raw_dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Construct ML-ready dataset from raw data. Returns dict with X, y, and metadata."""
        X = []
        y = []
        processed_count = 0
        skipped_count = 0
        missing_label_count = 0
        invalid_rows = 0
        successful_rows = 0
        
        print(f"[DatasetController] Processing {len(raw_dataset)} rows...")
        
        for idx, row in enumerate(raw_dataset):
            processed_count += 1
            valid, reason = self.validate_row(row)
            if not valid:
                if "Missing label" in reason:
                    missing_label_count += 1
                else:
                    invalid_rows += 1
                skipped_count += 1
                continue
            result = self.build_feature_vector(row)
            if result is None:
                skipped_count += 1
                invalid_rows += 1
                continue
            features, label = result
            X.append(features)
            y.append(label)
            successful_rows += 1
        
        metadata = {
            "processed_count": processed_count,
            "successful_rows": successful_rows,
            "skipped_count": skipped_count,
            "missing_label_count": missing_label_count,
            "invalid_rows": invalid_rows,
            "success_rate": successful_rows / processed_count if processed_count > 0 else 0.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        print(f"[DatasetController] Complete: {successful_rows} successful, {skipped_count} skipped")
        return {"X": X, "y": y, "metadata": metadata}

    def generate_health_report(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate dataset health report with warnings and recommendations."""
        try:
            warnings = []
            recommendations = []
            success_rate = metadata.get("success_rate", 0.0)
            if success_rate < 0.5:
                warnings.append(f"Low success rate: {success_rate:.1%}")
                recommendations.append("Review data quality and validation rules")
            missing_labels = metadata.get("missing_label_count", 0)
            if missing_labels > 0:
                warnings.append(f"{missing_labels} rows missing labels")
                recommendations.append("Ensure all data has proper labels")
            invalid_rows = metadata.get("invalid_rows", 0)
            if invalid_rows > 0:
                warnings.append(f"{invalid_rows} invalid rows")
                recommendations.append("Check data format and structure")
            return {
                "label_distribution": "See y array for distribution",
                "warnings": warnings,
                "recommendations": recommendations,
                "metadata": metadata
            }
        except Exception as e:
            print(f"[DatasetController] WARNING: Health report generation failed: {e}")
            return {
                "label_distribution": {},
                "warnings": ["Health report generation failed"],
                "recommendations": []
            }

    def balance_dataset(self, X: List[Dict[str, float]], y: List[int], mode: str = "undersample") -> Tuple[List[Dict[str, float]], List[int]]:
        """Balance dataset by class. Modes: undersample, oversample, noop."""
        try:
            if mode == "noop":
                return X, y
            positives = [(X[i], y[i]) for i in range(len(y)) if y[i] == 1]
            negatives = [(X[i], y[i]) for i in range(len(y)) if y[i] == 0]
            pos_count = len(positives)
            neg_count = len(negatives)
            print(f"[DatasetController] Class distribution: {pos_count} positive, {neg_count} negative")
            
            if mode == "undersample":
                target_count = min(pos_count, neg_count)
                random.shuffle(positives)
                random.shuffle(negatives)
                positives = positives[:target_count]
                negatives = negatives[:target_count]
            elif mode == "oversample":
                target_count = max(pos_count, neg_count)
                while len(positives) < target_count:
                    positives.append(random.choice(positives))
                while len(negatives) < target_count:
                    negatives.append(random.choice(negatives))
            
            combined = positives + negatives
            random.shuffle(combined)
            X_balanced = [item[0] for item in combined]
            y_balanced = [item[1] for item in combined]
            print(f"[DatasetController] Balanced to {len(X_balanced)} samples")
            return X_balanced, y_balanced
        except Exception as e:
            print(f"[DatasetController] WARNING: Balancing failed: {e}")
            return X, y

    def split(
        self, 
        X: List[Dict[str, float]], 
        y: List[int], 
        method: str = "time", 
        test_ratio: float = 0.2
    ) -> Tuple[List[Dict[str, float]], List[int], List[Dict[str, float]], List[int], Dict[str, Any]]:
        """Split dataset into train/test. Methods: random, time, balanced."""
        try:
            dataset = []
            for i in range(len(X)):
                row = X[i].copy()
                row["label"] = y[i]
                dataset.append(row)
            
            if method == "random":
                result = self.splitter.random_split(dataset, test_ratio)
            elif method == "time":
                result = self.splitter.time_based_split(dataset, self.timestamp_key, test_ratio)
            elif method == "balanced":
                result = self.splitter.balanced_split(dataset, "label", test_ratio)
            else:
                print(f"[DatasetController] WARNING: Unknown split method '{method}', using random")
                result = self.splitter.random_split(dataset, test_ratio)
            
            train_data = result["train"]
            test_data = result["test"]
            X_train = [{k: v for k, v in row.items() if k != "label"} for row in train_data]
            y_train = [row["label"] for row in train_data]
            X_test = [{k: v for k, v in row.items() if k != "label"} for row in test_data]
            y_test = [row["label"] for row in test_data]
            split_summary = self.splitter.summary(train_data, test_data)
            print(f"[DatasetController] Split complete: {len(X_train)} train, {len(X_test)} test")
            return X_train, y_train, X_test, y_test, split_summary
        except Exception as e:
            print(f"[DatasetController] WARNING: Split failed: {e}")
            return [], [], [], [], {}
