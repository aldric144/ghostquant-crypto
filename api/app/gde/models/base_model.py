from typing import Any, Dict
from datetime import datetime

class GDEModel:
    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_type": self.__class__.__name__,
            "serialized_at": datetime.utcnow().isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls()
