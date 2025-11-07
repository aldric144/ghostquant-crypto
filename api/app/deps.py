from app.db import get_db

async def get_database():
    async with get_db() as db:
        yield db
