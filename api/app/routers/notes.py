"""
Trader notes API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from app.utils.feature_flags import is_feature_enabled
from app.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notes", tags=["notes"])


class NoteCreate(BaseModel):
    """Request model for creating a note."""
    symbol: str
    note: str
    tags: Optional[List[str]] = None


class NoteUpdate(BaseModel):
    """Request model for updating a note."""
    note: str
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    """Response model for a note."""
    note_id: int
    user_id: str
    symbol: str
    note: str
    tags: List[str]
    created_at: str
    updated_at: str


def get_user_id(x_device_id: Optional[str] = Header(None)) -> str:
    """
    Get user ID from device ID header or generate a default.
    
    Args:
        x_device_id: Device ID from header
        
    Returns:
        User ID string
    """
    if x_device_id:
        return x_device_id
    return "default_user"


@router.post("", response_model=NoteResponse)
async def create_note(
    note_data: NoteCreate,
    x_device_id: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Create or update a note for a coin.
    
    Uses device ID from X-Device-Id header for user identification.
    If a note already exists for this user+symbol, it will be updated.
    
    Args:
        note_data: Note data (symbol, note, tags)
        x_device_id: Device ID from header
        
    Returns:
        Created/updated note
    """
    if not is_feature_enabled('notes'):
        raise HTTPException(status_code=501, detail="Trader notes feature is not enabled")
    
    user_id = get_user_id(x_device_id)
    
    try:
        async with get_db() as cur:
            await cur.execute(
                "SELECT note_id FROM trader_notes WHERE user_id = %s AND symbol = %s",
                (user_id, note_data.symbol.upper())
            )
            existing = await cur.fetchone()
            
            if existing:
                await cur.execute(
                    """
                    UPDATE trader_notes
                    SET note = %s, tags = %s, updated_at = NOW()
                    WHERE user_id = %s AND symbol = %s
                    RETURNING note_id, user_id, symbol, note, tags, created_at, updated_at
                    """,
                    (note_data.note, note_data.tags or [], user_id, note_data.symbol.upper())
                )
            else:
                await cur.execute(
                    """
                    INSERT INTO trader_notes (user_id, symbol, note, tags)
                    VALUES (%s, %s, %s, %s)
                    RETURNING note_id, user_id, symbol, note, tags, created_at, updated_at
                    """,
                    (user_id, note_data.symbol.upper(), note_data.note, note_data.tags or [])
                )
            
            row = await cur.fetchone()
            
            if not row:
                raise HTTPException(status_code=500, detail="Failed to create/update note")
            
            return {
                'note_id': row['note_id'],
                'user_id': row['user_id'],
                'symbol': row['symbol'],
                'note': row['note'],
                'tags': row['tags'] or [],
                'created_at': row['created_at'].isoformat(),
                'updated_at': row['updated_at'].isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error creating/updating note: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create/update note: {str(e)}")


@router.get("", response_model=List[NoteResponse])
async def get_notes(
    user: str = Query("me", description="User ID (use 'me' for current user)"),
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    x_device_id: Optional[str] = Header(None)
) -> List[Dict[str, Any]]:
    """
    Get notes for a user.
    
    Args:
        user: User ID or 'me' for current user
        symbol: Optional symbol filter
        x_device_id: Device ID from header
        
    Returns:
        List of notes
    """
    if not is_feature_enabled('notes'):
        raise HTTPException(status_code=501, detail="Trader notes feature is not enabled")
    
    if user == "me":
        user_id = get_user_id(x_device_id)
    else:
        user_id = user
    
    try:
        async with get_db() as cur:
            if symbol:
                await cur.execute(
                    """
                    SELECT note_id, user_id, symbol, note, tags, created_at, updated_at
                    FROM trader_notes
                    WHERE user_id = %s AND symbol = %s
                    ORDER BY updated_at DESC
                    """,
                    (user_id, symbol.upper())
                )
            else:
                await cur.execute(
                    """
                    SELECT note_id, user_id, symbol, note, tags, created_at, updated_at
                    FROM trader_notes
                    WHERE user_id = %s
                    ORDER BY updated_at DESC
                    """,
                    (user_id,)
                )
            
            rows = await cur.fetchall()
            
            return [
                {
                    'note_id': row['note_id'],
                    'user_id': row['user_id'],
                    'symbol': row['symbol'],
                    'note': row['note'],
                    'tags': row['tags'] or [],
                    'created_at': row['created_at'].isoformat(),
                    'updated_at': row['updated_at'].isoformat()
                }
                for row in rows
            ]
            
    except Exception as e:
        logger.error(f"Error fetching notes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")


@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    x_device_id: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Delete a note.
    
    Args:
        note_id: Note ID to delete
        x_device_id: Device ID from header
        
    Returns:
        Success message
    """
    if not is_feature_enabled('notes'):
        raise HTTPException(status_code=501, detail="Trader notes feature is not enabled")
    
    user_id = get_user_id(x_device_id)
    
    try:
        async with get_db() as cur:
            await cur.execute(
                "SELECT user_id FROM trader_notes WHERE note_id = %s",
                (note_id,)
            )
            row = await cur.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Note not found")
            
            if row['user_id'] != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this note")
            
            await cur.execute(
                "DELETE FROM trader_notes WHERE note_id = %s",
                (note_id,)
            )
            
            return {'success': True, 'message': 'Note deleted successfully'}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting note: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")
