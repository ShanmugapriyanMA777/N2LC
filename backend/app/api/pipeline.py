import logging
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.models.schemas import PipelineRequest, PipelineResponse
from app.services.ai_service import ai_service
from app.services.compiler_service import compiler_service
from app.services.history_service import history_service

logger = logging.getLogger("nl2c.pipeline")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

router = APIRouter()

@router.post("/pipeline", response_model=PipelineResponse)
async def run_pipeline(req: PipelineRequest):
    prompt_text = req.get_prompt()
    stdin_input = req.get_stdin()

    if not prompt_text:
        raise HTTPException(status_code=400, detail="Requirement prompt cannot be empty.")

    logger.info("[INFO] Request received")
    logger.info("[INFO] Processing requirement")

    # Step 1: AI Code Generation
    logger.info("[INFO] Sending request to Gemini")
    gen_code, gen_expl, gen_status = ai_service.generate_c_code(prompt_text)
    if not gen_code or gen_status != "success":
        raise HTTPException(status_code=500, detail=f"Failed to generate C code: {gen_expl}")

    logger.info("[INFO] C code generated")
    history_service.add_entry(prompt=prompt_text, code=gen_code, status="generated")

    # Step 2: Lexical, Syntax, Semantic Analysis
    logger.info("[INFO] Lexical analysis started")
    logger.info("[INFO] Syntax analysis started")
    logger.info("[INFO] Semantic analysis started")
    analysis = compiler_service.analyze_c_code(gen_code)

    # Step 3: GCC Compilation
    logger.info("[INFO] GCC compilation started")
    comp_res = compiler_service.compile_c_code(gen_code)

    error_correction_data = None
    exec_res = {"success": False, "stdout": "", "stderr": "", "execution_time": 0.0, "exit_code": 1}

    # If Compilation Failed, trigger AI error correction pipeline
    if not comp_res["success"]:
        logger.info("[INFO] Compilation failed. Initiating AI error correction...")
        err_msg = comp_res.get("stderr") or comp_res.get("stdout") or "Compilation failed."
        corrected_code, fix_expl, diff_sum = ai_service.fix_c_code(gen_code, err_msg)

        if corrected_code and corrected_code != gen_code:
            logger.info("[INFO] Corrected code received. Re-analyzing and recompiling...")
            re_analysis = compiler_service.analyze_c_code(corrected_code)
            re_comp_res = compiler_service.compile_c_code(corrected_code)

            if re_comp_res["success"]:
                logger.info("[INFO] Recompilation PASSED. Executing corrected binary...")
                re_exec_res = compiler_service.execute_c_code(corrected_code, stdin_input)
                error_correction_data = {
                    "original_code": gen_code,
                    "compiler_error": err_msg,
                    "corrected_code": corrected_code,
                    "explanation": fix_expl,
                    "diff_summary": diff_sum,
                    "recompiled_success": True,
                    "recompile_output": re_comp_res.get("stdout", "")
                }
                # Update pipeline references with corrected code result
                gen_code = corrected_code
                analysis = re_analysis
                comp_res = re_comp_res
                exec_res = re_exec_res
            else:
                error_correction_data = {
                    "original_code": gen_code,
                    "compiler_error": err_msg,
                    "corrected_code": corrected_code,
                    "explanation": fix_expl,
                    "diff_summary": diff_sum,
                    "recompiled_success": False,
                    "recompile_output": re_comp_res.get("stderr", "")
                }
    else:
        # Step 4: Program Execution
        logger.info("[INFO] Execution started")
        exec_res = compiler_service.execute_c_code(gen_code, stdin_input)

    logger.info("[INFO] Pipeline completed")

    # Build Summary
    summary = {
        "Natural Language": prompt_text,
        "Generated Code": "✓ PASSED" if gen_code else "✗ FAILED",
        "Lexical Analysis": "✓ PASSED" if len(analysis.get("tokens", [])) > 0 else "✗ FAILED",
        "Syntax Analysis": "✓ PASSED" if analysis.get("syntax", {}).get("valid", False) else "✗ FAILED",
        "Semantic Analysis": "✓ PASSED" if analysis.get("semantic", {}).get("valid", False) else "✗ FAILED",
        "GCC Compilation": "✓ PASSED" if comp_res.get("success", False) else "✗ FAILED",
        "Execution": "✓ PASSED" if exec_res.get("success", False) else "✗ FAILED",
        "Output": exec_res.get("stdout", "").strip() or exec_res.get("stderr", "").strip() or "No output."
    }

    return PipelineResponse(
        requirement=prompt_text,
        generated_code=gen_code,
        lexical_analysis={"tokens": analysis.get("tokens", []), "total": len(analysis.get("tokens", []))},
        syntax_analysis=analysis.get("syntax", {}),
        semantic_analysis=analysis.get("semantic", {}),
        symbol_table=analysis.get("symbols", []),
        compilation=comp_res,
        execution=exec_res,
        error_correction=error_correction_data,
        summary=summary
    )
