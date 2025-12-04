from typing import Any, Dict

class GDEService:
    def process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "service": self.__class__.__name__,
            "status": "processed",
        }

    def validate(self, payload: Dict[str, Any]) -> bool:
        return isinstance(payload, dict)
