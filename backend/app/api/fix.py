from fastapi import APIRouter, HTTPException
from app.models.schemas import FixRequest, FixResponse
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/fix", response_model=FixResponse)
async def fix_code(req: FixRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Original C Code cannot be empty.")

    corrected_code, explanation, diff_summary = ai_service.fix_c_code(req.code, req.get_error())
    return FixResponse(
        corrected_code=corrected_code,
        explanation=explanation,
        diff_summary=diff_summary
    )

