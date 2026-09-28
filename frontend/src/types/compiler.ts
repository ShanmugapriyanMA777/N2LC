export interface TokenInfo {
  line: number;
  column: number;
  lexeme: string;
  token_type: string;
  value: string;
}

export interface SyntaxErrorItem {
  line: number;
  column: number;
  message: string;
  suggested_fix?: string;
}

export interface SyntaxInfo {
  valid: boolean;
  errors: SyntaxErrorItem[];
  warnings: string[];
}

export interface SemanticErrorItem {
  line: number;
  category: string;
  message: string;
  explanation: string;
  suggested_fix?: string;
}

export interface SemanticInfo {
  valid: boolean;
  errors: SemanticErrorItem[];
  warnings: string[];
}

export interface SymbolInfo {
  name: string;
  type: string;
  scope: string;
  kind: string;
  initial_value?: string;
  array_size?: string;
}

export interface ASTNode {
  id: string;
  type: string;
  label: string;
  line: number;
  children: ASTNode[];
  details: Record<string, any>;
}

export interface IRInstruction {
  index: number;
  op: string;
  arg1?: string;
  arg2?: string;
  result?: string;
  statement: string;
}

export interface OptimizationInfo {
  pass_name: string;
  before: string;
  after: string;
  description: string;
}

export interface AnalyzeResult {
  tokens: TokenInfo[];
  syntax: SyntaxInfo;
  semantic: SemanticInfo;
  symbols: SymbolInfo[];
  ast: ASTNode;
  ir: IRInstruction[];
  optimizations: OptimizationInfo[];
}

export interface CompileResult {
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface ExecuteResult {
  success: boolean;
  stdout: string;
  stderr: string;
  execution_time: number;
  exit_code: number;
}

export interface HealthStatus {
  ai_status: string;
  gcc_status: string;
  python_status: string;
  backend_status: string;
  version: string;
}

export interface HistoryItem {
  id: number;
  prompt: string;
  code: string;
  timestamp: string;
  compilation_status: string;
  execution_result?: string;
}
