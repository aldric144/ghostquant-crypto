from fastapi import APIRouter
from app.models import HealthResponse
from app.services.coingecko_client import CoinGeckoClient

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}


@router.get("/health/coingecko")
async def coingecko_health():
    """
    Report CoinGecko provider configuration for diagnostics.
    Reflects the same env resolution the market client uses.
    Never exposes the API key or authorization headers.
    """
    return CoinGeckoClient().get_config_status()
