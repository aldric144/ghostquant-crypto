from typing import Dict, List, Optional, Any
import csv
import json
import os
from datetime import datetime

from .features.predict_feature_builder import PredictFeatureBuilder


class DatasetBuilder:
    """
    Builds ML-ready datasets for GhostPredictor.
    Converts raw event/entity/token/chain payloads
    into unified feature vectors + labels.
    """

    def __init__(self):
        self.rows: List[Dict[str, float]] = []
        self.labels: List[int] = []
        self.feature_builder = PredictFeatureBuilder()

    def add_datapoint(
        self,
        event: Dict[str, Any],
        entity: Optional[Dict[str, Any]],
        chain: Optional[Dict[str, Any]],
        token: Optional[Dict[str, Any]],
    ):
        """Convert raw payloads → ML features + label."""
        try:
            features = self.feature_builder.build(
                event_payload=event,
                entity_payload=entity or {},
                chain_payload=chain or {},
                token_payload=token or {},
            )

            risk_score = float(event.get("value", 0)) / 1_000_000
            risk_score = min(max(risk_score, 0), 1)
            label = 1 if risk_score >= 0.7 else 0

            features["label"] = label

            self.rows.append(features)
            self.labels.append(label)

        except Exception as e:
            print("DatasetBuilder error:", e)

    def save_csv(self, path="data/training/dataset.csv"):
        os.makedirs(os.path.dirname(path), exist_ok=True)

        if not self.rows:
            return False

        fieldnames = list(self.rows[0].keys())

        with open(path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.rows)

        return True

    def save_jsonl(self, path="data/training/dataset.jsonl"):
        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w") as f:
            for row in self.rows:
                f.write(json.dumps(row) + "\n")

        return True

    def save_parquet(self, path="data/training/dataset.parquet"):
        """
        Placeholder — no parquet library used.
        Saves JSONL and marks as 'parquet simulated'.
        """
        self.save_jsonl(path.replace(".parquet", ".jsonl"))
        return True
