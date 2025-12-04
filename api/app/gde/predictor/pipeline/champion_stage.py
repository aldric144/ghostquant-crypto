"""
ChampionStage - Champion model selection for GhostTrainer™ pipeline.
Selects the best model from benchmark rankings.
"""

from typing import Dict, Any, Optional
from datetime import datetime


class ChampionStage:
    """Champion model selection stage for GhostTrainer™ pipeline."""

    def __init__(self):
        """Initialize champion stage with empty storage."""
        self.champion: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self.version_counter: int = 0

    def select_champion(
        self,
        trained_models: Dict[str, Any],
        benchmark_rankings: list
    ) -> Dict[str, Any]:
        """Select the champion model from benchmark rankings."""
        try:
            print("[ChampionStage] Selecting champion model...")

            if not benchmark_rankings:
                print("[ChampionStage] Error: No benchmark rankings provided")
                return {"error": "No benchmark rankings provided"}

            if not trained_models:
                print("[ChampionStage] Error: No trained models provided")
                return {"error": "No trained models provided"}

            top_ranking = benchmark_rankings[0]
            champion_name = top_ranking.get("model")

            if champion_name not in trained_models:
                print(f"[ChampionStage] Error: Champion model '{champion_name}' not found in trained models")
                return {"error": f"Champion model '{champion_name}' not found"}

            self.version_counter += 1

            champion_model = trained_models[champion_name]
            timestamp = datetime.utcnow().isoformat()

            self.champion = {
                "model_name": champion_name,
                "model_object": champion_model,
                "version": self.version_counter,
                "timestamp": timestamp,
                "ranking_info": top_ranking
            }

            self.metadata = {
                "model_name": champion_name,
                "version": self.version_counter,
                "selected_at": timestamp,
                "mean_f1": top_ranking.get("mean_f1", 0.0),
                "mean_accuracy": top_ranking.get("mean_accuracy", 0.0),
                "mean_precision": top_ranking.get("mean_precision", 0.0),
                "mean_recall": top_ranking.get("mean_recall", 0.0),
                "rank": top_ranking.get("rank", 1)
            }

            print(f"[ChampionStage] Champion selected: {champion_name} v{self.version_counter} (F1={top_ranking.get('mean_f1', 0.0):.4f})")

            return {
                "success": True,
                "champion": self.champion,
                "metadata": self.metadata
            }

        except Exception as e:
            print(f"[ChampionStage] Error selecting champion: {e}")
            return {"error": str(e)}

    def get_champion(self) -> Dict[str, Any]:
        """Return champion information."""
        try:
            if not self.champion:
                return {"error": "No champion selected yet"}

            return {
                "model_name": self.champion.get("model_name"),
                "model_object": self.champion.get("model_object"),
                "version": self.champion.get("version"),
                "timestamp": self.champion.get("timestamp")
            }

        except Exception as e:
            print(f"[ChampionStage] Error getting champion: {e}")
            return {"error": str(e)}

    def get_metadata(self) -> Dict[str, Any]:
        """Return champion metadata."""
        try:
            if not self.metadata:
                return {"error": "No metadata available"}

            return self.metadata

        except Exception as e:
            print(f"[ChampionStage] Error getting metadata: {e}")
            return {"error": str(e)}

    def __repr__(self) -> str:
        """String representation for debugging."""
        if self.champion:
            model_name = self.champion.get("model_name", "Unknown")
            version = self.champion.get("version", 0)
            return f"<ChampionStage model={model_name} version={version}>"
        else:
            return "<ChampionStage model=None version=0>"
