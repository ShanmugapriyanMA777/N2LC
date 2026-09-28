import sys
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.ai_service import ai_service
from app.security.sandbox import check_gcc_available

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def check_health():
    ai_provider = ai_service.get_provider_name()
    ai_status = f"Connected ({ai_provider})" if ai_service.is_configured() else "Not Configured"
    gcc_ok, gcc_info = check_gcc_available()
    gcc_status = f"Available ({gcc_info})" if gcc_ok else "Missing"
    py_version = f"Available (Python {sys.version.split()[0]})"

    return HealthResponse(
        ai_status=ai_status,
        gcc_status=gcc_status,
        python_status=py_version,
        backend_status="Running",
        version="1.0.0"
    )
