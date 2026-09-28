from fastapi import APIRouter, HTTPException
from app.models.schemas import ExecuteRequest, ExecuteResponse
from app.services.compiler_service import compiler_service

router = APIRouter()

@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="C Source Code cannot be empty.")

    res = compiler_service.execute_c_code(req.code, req.get_stdin())
    return ExecuteResponse(
        success=res["success"],
        stdout=res["stdout"],
        stderr=res["stderr"],
        execution_time=res["execution_time"],
        exit_code=res["exit_code"]
    )

