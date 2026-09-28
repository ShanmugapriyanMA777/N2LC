import re
from typing import List, Dict, Any, Optional
from app.compiler.lexer import Token
from app.compiler.symbol_table import SymbolEntry, SymbolTableBuilder

class SemanticErrorDetail:
    def __init__(self, line: int, category: str, message: str, explanation: str, suggested_fix: Optional[str] = None):
        self.line = line
        self.category = category
        self.message = message
        self.explanation = explanation
        self.suggested_fix = suggested_fix

    def to_dict(self) -> Dict[str, Any]:
        return {
            "line": self.line,
            "category": self.category,
            "message": self.message,
            "explanation": self.explanation,
            "suggested_fix": self.suggested_fix
        }

class CSemanticAnalyzer:
    def __init__(self, code: str, tokens: List[Token], symbols: List[Dict[str, Any]]):
        self.code = code
        self.tokens = tokens
        self.symbols = symbols
        self.errors: List[SemanticErrorDetail] = []
        self.warnings: List[str] = []

    def analyze(self) -> Dict[str, Any]:
        self.errors = []
        self.warnings = []

        declared_vars = set()
        symbol_map = {}

        # Load declared symbols
        for sym in self.symbols:
            key = f"{sym['scope']}:{sym['name']}"
            if key in symbol_map and sym['kind'] == 'variable':
                self.errors.append(SemanticErrorDetail(
                    line=1,
                    category="Redeclaration Error",
                    message=f"Redeclaration of variable '{sym['name']}' in scope '{sym['scope']}'",
                    explanation=f"Variable '{sym['name']}' has already been declared in this scope.",
                    suggested_fix=f"Remove the second declaration of '{sym['name']}' or use a unique variable name."
                ))
            symbol_map[key] = sym
            declared_vars.add(sym['name'])

        # Standard built-in identifiers & functions
        builtins = {
            "printf", "scanf", "main", "NULL", "sizeof", "getchar", "putchar", "puts", "gets",
            "exit", "strlen", "strcmp", "strcpy", "strcat", "strncpy", "pow", "sqrt", "abs",
            "floor", "ceil", "INT_MAX", "INT_MIN", "fprintf", "sprintf", "snprintf", "fscanf", "sscanf",
            "stderr", "stdout", "stdin", "EXIT_SUCCESS", "EXIT_FAILURE", "malloc", "free", "calloc", "realloc",
            "isalpha", "isdigit", "isalnum", "tolower", "toupper", "rand", "srand", "time"
        }
        declared_vars.update(builtins)

        c_keywords = {
            "int", "float", "double", "char", "void", "long", "short", "unsigned", "signed",
            "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue",
            "return", "struct", "union", "enum", "typedef", "const", "static", "volatile", "sizeof",
            "include", "define", "stdio", "stdlib", "string", "math", "h", "bool", "true", "false", "size_t"
        }

        # Strip multi-line comments /* ... */ while preserving newline count for accurate line reporting
        clean_code = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), self.code, flags=re.DOTALL)

        # Scan code lines for undeclared variable references
        lines = clean_code.splitlines()
        for line_idx, line in enumerate(lines, 1):
            line_str = line.strip()
            if not line_str or line_str.startswith("#") or line_str.startswith("//"):
                continue

            # Strip inline comments //...
            line_clean = re.sub(r'//.*$', '', line_str)

            # Strip string literals "..." so words inside strings aren't treated as C identifiers
            line_clean = re.sub(r'"([^"\\]|\\.)*"', '""', line_clean)
            line_clean = re.sub(r"'([^'\\]|\\.)*'", "''", line_clean)


            # Find all potential identifiers on this line
            identifiers = re.findall(r'\b[a-zA-Z_]\w*\b', line_clean)
            for id_name in identifiers:
                if id_name in c_keywords:
                    continue


                # Is it declared?
                if id_name not in declared_vars and not id_name.isdigit():
                    self.errors.append(SemanticErrorDetail(
                        line=line_idx,
                        category="Undeclared Identifier",
                        message=f"'{id_name}' is not declared in this scope.",
                        explanation=f"The identifier '{id_name}' is used without prior declaration.",
                        suggested_fix=f"Declare variable 'int {id_name};' before using it on line {line_idx}."
                    ))

        # Return statement check for non-void functions
        if "main" in [s['name'] for s in self.symbols if s['kind'] == 'function']:
            if "return" not in self.code and "int main" in self.code:
                self.warnings.append("Function 'main' does not explicitly contain a 'return' statement.")

        is_valid = len(self.errors) == 0
        return {
            "valid": is_valid,
            "errors": [e.to_dict() for e in self.errors],
            "warnings": self.warnings
        }
