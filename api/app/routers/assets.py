from fastapi import APIRouter, Depends
from typing import List
from app.models import Asset
from app.deps import get_database

router = APIRouter()

@router.get("/assets", response_model=List[Asset])
async def get_assets(db=Depends(get_database)):
    await db.execute("SELECT * FROM assets ORDER BY asset_id")
    rows = await db.fetchall()
    return rows
