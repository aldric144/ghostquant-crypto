from typing import Dict, Any

class BaseNormalizer:
    """
    Base class for all normalization modules.
    GhostQuant uses standardized numerical scales so ML models
    receive consistent values regardless of origin.
    """

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, float]:
        """
        All normalizers must return a dictionary of floats.
        """
        raise NotImplementedError("normalize() must be implemented by subclass")

    def safe_float(self, value: Any, default: float = 0.0) -> float:
        """
        Convert values safely into floats.
        """
        try:
            return float(value)
        except:
            return default

    def scale(self, value: float, factor: float = 1.0) -> float:
        """
        Simple scaling helper.
        """
        return value * factor
