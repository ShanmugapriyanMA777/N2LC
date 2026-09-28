from typing import Dict, Any
from app.compiler.lexer import CLexer
from app.compiler.parser import CParser
from app.compiler.ast_builder import ASTBuilder
from app.compiler.symbol_table import SymbolTableBuilder
from app.compiler.semantic_analyzer import CSemanticAnalyzer
from app.compiler.ir_generator import IRGenerator
from app.compiler.optimizer import COptimizer
from app.compiler.interpreter import CInterpreter
from app.security.sandbox import SandboxedGCC, check_gcc_available
from app.models.schemas import AnalyzeResponse

class CompilerService:
    def __init__(self):
        self.gcc_sandbox = SandboxedGCC()

    def analyze_c_code(self, code: str) -> Dict[str, Any]:
        """
        Executes all 6 analysis phases of the compiler pipeline on C source code:
        1. Lexical Analysis
        2. Syntax Parsing
        3. AST Generation
        4. Symbol Table Construction
        5. Semantic Analysis
        6. Intermediate Representation (Three-Address Code)
        7. Basic Optimization Analysis
        """
        # 1. Lexical Analysis
        lexer = CLexer(code)
        tokens = lexer.tokenize()
        token_dicts = [t.to_dict() for t in tokens]

        # 2. Syntax Parsing
        parser = CParser(tokens)
        syntax_res = parser.parse()

        # 3. AST Generation
        ast_builder = ASTBuilder(code, tokens)
        ast_dict = ast_builder.build_ast()

        # 4. Symbol Table Construction
        symbol_builder = SymbolTableBuilder(code, tokens)
        symbol_list = symbol_builder.build_symbol_table()

        # 5. Semantic Analysis
        semantic_analyzer = CSemanticAnalyzer(code, tokens, symbol_list)
        semantic_res = semantic_analyzer.analyze()

        # 6. Intermediate Representation
        ir_gen = IRGenerator(code)
        ir_list = ir_gen.generate_ir()

        # 7. Basic Optimization Pass
        optimizer = COptimizer(code)
        optimizations_list = optimizer.optimize()

        return {
            "tokens": token_dicts,
            "syntax": syntax_res,
            "semantic": semantic_res,
            "symbols": symbol_list,
            "ast": ast_dict,
            "ir": ir_list,
            "optimizations": optimizations_list
        }

    def compile_c_code(self, code: str) -> Dict[str, Any]:
        """
        Compiles C source code using GCC sandbox (or returns status).
        """
        gcc_ok, _ = check_gcc_available()
        if gcc_ok:
            return self.gcc_sandbox.compile_code(code)
        else:
            # Fallback syntax dry-run compilation using parser & lexer validation
            analysis = self.analyze_c_code(code)
            syntax_ok = analysis["syntax"]["valid"]
            semantic_ok = analysis["semantic"]["valid"]

            if syntax_ok and semantic_ok:
                return {
                    "success": True,
                    "stdout": "Pipeline Validation Passed (GCC unavailable; syntax and semantics verified).",
                    "stderr": "",
                    "duration": 0.005,
                    "binary_path": "in_memory_ast"
                }
            else:
                err_msgs = [e["message"] for e in analysis["syntax"]["errors"]] + [e["message"] for e in analysis["semantic"]["errors"]]
                return {
                    "success": False,
                    "stdout": "",
                    "stderr": "Compilation failed:\n" + "\n".join(err_msgs),
                    "duration": 0.001,
                    "binary_path": ""
                }

    def execute_c_code(self, code: str, stdin_data: str = "") -> Dict[str, Any]:
        """
        Executes C source code using GCC binary if available, or Python C Interpreter fallback.
        """
        gcc_ok, _ = check_gcc_available()
        if gcc_ok:
            return self.gcc_sandbox.execute_code(code, stdin_data)
        else:
            # Execute using in-memory C Interpreter
            interpreter = CInterpreter(code, stdin_data)
            success, stdout, stderr = interpreter.run()
            return {
                "success": success,
                "stdout": stdout,
                "stderr": stderr,
                "execution_time": 0.002,
                "exit_code": 0 if success else 1
            }

compiler_service = CompilerService()
