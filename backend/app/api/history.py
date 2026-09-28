from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.history_service import history_service

router = APIRouter()

@router.get("/history")
async def get_history() -> List[Dict[str, Any]]:
    return history_service.get_all()

@router.delete("/history")
async def clear_history() -> Dict[str, bool]:
    success = history_service.clear_all()
    return {"success": success}
