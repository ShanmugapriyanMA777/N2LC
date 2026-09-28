from fastapi import APIRouter, HTTPException
from app.models.schemas import CompileRequest, CompileResponse
from app.services.compiler_service import compiler_service

router = APIRouter()

@router.post("/compile", response_model=CompileResponse)
async def compile_code(req: CompileRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="C Source Code cannot be empty.")

    res = compiler_service.compile_c_code(req.code)
    return CompileResponse(
        success=res["success"],
        stdout=res["stdout"],
        stderr=res["stderr"],
        duration=res["duration"]
    )
