from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.compiler_service import compiler_service

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_code(req: AnalyzeRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="C Source Code cannot be empty for analysis.")

    res = compiler_service.analyze_c_code(req.code)
    return AnalyzeResponse(
        tokens=res["tokens"],
        syntax=res["syntax"],
        semantic=res["semantic"],
        symbols=res["symbols"],
        ast=res["ast"],
        ir=res["ir"],
        optimizations=res["optimizations"]
    )
