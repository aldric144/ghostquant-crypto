from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import Asset, AssetCreate
from app.deps import get_database
import asyncpg

router = APIRouter()

@router.get("/assets", response_model=List[Asset])
async def get_assets(db=Depends(get_database)):
    await db.execute("SELECT * FROM assets ORDER BY asset_id")
    rows = await db.fetchall()
    return rows

@router.post("/assets", response_model=Asset, status_code=201)
async def create_asset(asset: AssetCreate, db=Depends(get_database)):
    """Create a new asset."""
    try:
        await db.execute(
            """
            INSERT INTO assets (symbol, chain, address, sector, risk_tags)
            VALUES ($1, $2, $3, $4, $5)
            """,
            (asset.symbol, asset.chain, asset.address, asset.sector, asset.risk_tags or [])
        )
        
        await db.execute(
            "SELECT * FROM assets WHERE symbol = $1",
            (asset.symbol,)
        )
        row = await db.fetchone()
        return row
        
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(
            status_code=409,
            detail=f"Asset with symbol '{asset.symbol}' already exists"
        )
