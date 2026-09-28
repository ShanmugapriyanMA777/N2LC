from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.ai_service import ai_service
from app.services.history_service import history_service

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_code(req: GenerateRequest):
    prompt_text = req.get_prompt()
    if not prompt_text:
        raise HTTPException(status_code=400, detail="Prompt requirement cannot be empty.")

    code, explanation, status = ai_service.generate_c_code(prompt_text)
    
    if status == "success" and code:
        history_service.add_entry(prompt=prompt_text, code=code, status="generated")

    return GenerateResponse(
        code=code,
        explanation=explanation,
        status=status
    )

