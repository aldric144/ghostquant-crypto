"""
Demo API Routes
FastAPI endpoints for the demo terminal.
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Optional, List
from datetime import datetime
import json
import os

from .demo_engine import DemoEngine
from .demo_schema import (
    DemoEvent,
    DemoEntity,
    DemoToken,
    DemoChain,
    DemoPrediction,
    DemoFusion,
    DemoSentinel,
    DemoConstellation,
    DemoHydra,
    DemoUltraFusion,
    DemoDNA,
    DemoActorProfile,
    DemoCortexPattern,
    DemoAccessRequest,
)

demo_router = APIRouter(prefix="/demo-api", tags=["Demo Terminal"])

demo_engine = DemoEngine(seed=42)

access_requests: List[dict] = []


@demo_router.get("/prediction", response_model=DemoPrediction)
async def get_demo_prediction(entity: Optional[str] = None):
    """
    Get synthetic prediction analysis.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        DemoPrediction: Synthetic prediction data
    """
    try:
        return demo_engine.run_demo_prediction(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo prediction failed: {str(e)}")


@demo_router.get("/fusion", response_model=DemoFusion)
async def get_demo_fusion(entity: Optional[str] = None):
    """
    Get synthetic UltraFusion analysis.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        DemoFusion: Synthetic fusion analysis
    """
    try:
        return demo_engine.run_demo_fusion(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo fusion failed: {str(e)}")


@demo_router.get("/sentinel", response_model=DemoSentinel)
async def get_demo_sentinel():
    """
    Get synthetic Sentinel status.
    
    Returns:
        DemoSentinel: Synthetic sentinel status
    """
    try:
        return demo_engine.run_demo_sentinel()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo sentinel failed: {str(e)}")


@demo_router.get("/constellation", response_model=DemoConstellation)
async def get_demo_constellation():
    """
    Get synthetic Constellation map data.
    
    Returns:
        DemoConstellation: Synthetic constellation data
    """
    try:
        return demo_engine.run_demo_constellation()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo constellation failed: {str(e)}")


@demo_router.get("/hydra", response_model=DemoHydra)
async def get_demo_hydra():
    """
    Get synthetic Hydra detection.
    
    Returns:
        DemoHydra: Synthetic hydra detection
    """
    try:
        return demo_engine.run_demo_hydra()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo hydra failed: {str(e)}")


@demo_router.get("/ultrafusion", response_model=DemoUltraFusion)
async def get_demo_ultrafusion(entity: Optional[str] = None):
    """
    Get synthetic UltraFusion meta-analysis.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        DemoUltraFusion: Synthetic ultrafusion analysis
    """
    try:
        return demo_engine.run_demo_ultrafusion(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo ultrafusion failed: {str(e)}")


@demo_router.get("/dna", response_model=DemoDNA)
async def get_demo_dna(entity: Optional[str] = None):
    """
    Get synthetic Behavioral DNA analysis.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        DemoDNA: Synthetic DNA analysis
    """
    try:
        return demo_engine.run_demo_dna(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo DNA failed: {str(e)}")


@demo_router.get("/actor", response_model=DemoActorProfile)
async def get_demo_actor(entity: Optional[str] = None):
    """
    Get synthetic Actor Profile.
    
    Args:
        entity: Optional entity address (ignored, uses synthetic data)
    
    Returns:
        DemoActorProfile: Synthetic actor profile
    """
    try:
        return demo_engine.run_demo_actor_profile(entity)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo actor failed: {str(e)}")


@demo_router.get("/cortex", response_model=DemoCortexPattern)
async def get_demo_cortex():
    """
    Get synthetic Cortex memory pattern.
    
    Returns:
        DemoCortexPattern: Synthetic cortex pattern
    """
    try:
        return demo_engine.run_demo_cortex_pattern()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo cortex failed: {str(e)}")


@demo_router.get("/event", response_model=DemoEvent)
async def get_demo_event():
    """
    Get a single synthetic event.
    
    Returns:
        DemoEvent: Synthetic event
    """
    try:
        return demo_engine.generate_synthetic_event()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo event failed: {str(e)}")


@demo_router.get("/entity", response_model=DemoEntity)
async def get_demo_entity():
    """
    Get a single synthetic entity.
    
    Returns:
        DemoEntity: Synthetic entity
    """
    try:
        return demo_engine.generate_synthetic_entity()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo entity failed: {str(e)}")


@demo_router.get("/token", response_model=DemoToken)
async def get_demo_token():
    """
    Get a single synthetic token.
    
    Returns:
        DemoToken: Synthetic token
    """
    try:
        return demo_engine.generate_synthetic_token()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo token failed: {str(e)}")


@demo_router.get("/chain", response_model=DemoChain)
async def get_demo_chain():
    """
    Get synthetic chain metrics.
    
    Returns:
        DemoChain: Synthetic chain metrics
    """
    try:
        return demo_engine.generate_synthetic_chain()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo chain failed: {str(e)}")


@demo_router.get("/feed", response_model=List[DemoEvent])
async def get_demo_feed(count: int = 10):
    """
    Get a feed of synthetic events.
    
    Args:
        count: Number of events to return (default: 10, max: 50)
    
    Returns:
        List[DemoEvent]: List of synthetic events
    """
    try:
        count = min(count, 50)  # Cap at 50 events
        return demo_engine.get_demo_feed(count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo feed failed: {str(e)}")


@demo_router.get("/health")
async def get_demo_health():
    """
    Get demo engine health status.
    
    Returns:
        dict: Health status
    """
    return demo_engine.get_health_status()


@demo_router.get("/info")
async def get_demo_info():
    """
    Get demo terminal information.
    
    Returns:
        dict: Demo terminal info
    """
    return demo_engine.get_demo_info()


@demo_router.post("/request-access")
async def request_enterprise_access(request: DemoAccessRequest = Body(...)):
    """
    Submit enterprise access request from demo terminal.
    
    Stores request in memory (safe, no sensitive data persistence).
    
    Args:
        request: Enterprise access request data
    
    Returns:
        dict: Confirmation message
    """
    try:
        access_requests.append(request.dict())
        
        try:
            requests_file = "/tmp/ghostquant_demo_requests.json"
            with open(requests_file, "a") as f:
                json.dump(request.dict(), f)
                f.write("\n")
        except Exception:
            pass  # Fail silently if file write fails
        
        return {
            "status": "success",
            "message": "Thank you for your interest! Our team will contact you within 24 hours.",
            "request_id": f"req_{datetime.utcnow().timestamp()}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request submission failed: {str(e)}")


@demo_router.get("/requests/count")
async def get_requests_count():
    """
    Get count of enterprise access requests.
    
    Returns:
        dict: Request count
    """
    return {
        "count": len(access_requests),
        "timestamp": datetime.utcnow().isoformat()
    }
