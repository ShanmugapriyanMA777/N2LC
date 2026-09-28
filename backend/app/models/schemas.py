from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    requirement: Optional[str] = None

    def get_prompt(self) -> str:
        return (self.prompt or self.requirement or "").strip()

class GenerateResponse(BaseModel):
    code: str
    explanation: str
    status: str

class TokenInfo(BaseModel):
    line: int
    column: int
    lexeme: str
    token_type: str
    value: str

class SyntaxErrorItem(BaseModel):
    line: int
    column: int
    message: str
    suggested_fix: Optional[str] = None

class SyntaxInfo(BaseModel):
    valid: bool
    errors: List[SyntaxErrorItem] = []
    warnings: List[str] = []

class SemanticErrorItem(BaseModel):
    line: int
    category: str
    message: str
    explanation: str
    suggested_fix: Optional[str] = None

class SemanticInfo(BaseModel):
    valid: bool
    errors: List[SemanticErrorItem] = []
    warnings: List[str] = []

class SymbolInfo(BaseModel):
    name: str
    type: str
    scope: str
    kind: str
    initial_value: Optional[str] = "-"
    array_size: Optional[str] = "-"

class IRInstruction(BaseModel):
    index: int
    op: str
    arg1: Optional[str] = ""
    arg2: Optional[str] = ""
    result: Optional[str] = ""
    statement: str

class OptimizationInfo(BaseModel):
    pass_name: str
    before: str
    after: str
    description: str

class AnalyzeRequest(BaseModel):
    code: str

class AnalyzeResponse(BaseModel):
    tokens: List[TokenInfo]
    syntax: SyntaxInfo
    semantic: SemanticInfo
    symbols: List[SymbolInfo]
    ast: Dict[str, Any]
    ir: List[IRInstruction]
    optimizations: List[OptimizationInfo]

class CompileRequest(BaseModel):
    code: str

class CompileResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    duration: float

class ExecuteRequest(BaseModel):
    code: str
    stdin: Optional[str] = ""
    input: Optional[str] = ""

    def get_stdin(self) -> str:
        return self.stdin if self.stdin else (self.input or "")

class ExecuteResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    execution_time: float
    exit_code: int

class FixRequest(BaseModel):
    code: str
    error: Optional[str] = ""
    compiler_error: Optional[str] = ""

    def get_error(self) -> str:
        return self.error or self.compiler_error or ""

class FixResponse(BaseModel):
    success: bool = True
    corrected_code: str
    explanation: str
    diff_summary: str = ""

class PipelineRequest(BaseModel):
    requirement: Optional[str] = None
    prompt: Optional[str] = None
    input: Optional[str] = ""
    stdin: Optional[str] = ""

    def get_prompt(self) -> str:
        return (self.requirement or self.prompt or "").strip()

    def get_stdin(self) -> str:
        return self.input if self.input else (self.stdin or "")

class PipelineResponse(BaseModel):
    requirement: str
    generated_code: str
    lexical_analysis: Dict[str, Any]
    syntax_analysis: Dict[str, Any]
    semantic_analysis: Dict[str, Any]
    symbol_table: List[Dict[str, Any]]
    compilation: Dict[str, Any]
    execution: Dict[str, Any]
    error_correction: Optional[Dict[str, Any]] = None
    summary: Dict[str, str]

class HealthResponse(BaseModel):
    ai_status: str
    gcc_status: str
    python_status: str
    backend_status: str
    version: str
