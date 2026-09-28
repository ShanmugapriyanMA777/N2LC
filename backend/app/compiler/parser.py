from typing import List, Dict, Any, Optional
from app.compiler.lexer import Token

class SyntaxErrorDetail:
    def __init__(self, line: int, column: int, message: str, suggested_fix: Optional[str] = None):
        self.line = line
        self.column = column
        self.message = message
        self.suggested_fix = suggested_fix

    def to_dict(self) -> Dict[str, Any]:
        return {
            "line": self.line,
            "column": self.column,
            "message": self.message,
            "suggested_fix": self.suggested_fix
        }

class CParser:
    def __init__(self, tokens: List[Token]):
        # Filter out preprocessor tokens for syntax parsing (or keep track of them)
        self.all_tokens = tokens
        self.tokens = [t for t in tokens if t.token_type != "PREPROCESSOR"]
        self.pos = 0
        self.errors: List[SyntaxErrorDetail] = []
        self.warnings: List[str] = []

    def current_token(self) -> Optional[Token]:
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def peek_token(self, offset: int = 1) -> Optional[Token]:
        idx = self.pos + offset
        if 0 <= idx < len(self.tokens):
            return self.tokens[idx]
        return None

    def match(self, expected_type: Optional[str] = None, expected_value: Optional[str] = None) -> Optional[Token]:
        tok = self.current_token()
        if not tok:
            return None
        if expected_type and tok.token_type != expected_type:
            return None
        if expected_value and tok.value != expected_value:
            return None
        self.pos += 1
        return tok

    def parse(self) -> Dict[str, Any]:
        self.errors = []
        self.warnings = []
        self.pos = 0

        # Check matched delimiters overall
        brace_stack = []
        paren_stack = []
        bracket_stack = []

        for tok in self.tokens:
            if tok.value == '{':
                brace_stack.append(tok)
            elif tok.value == '}':
                if brace_stack:
                    brace_stack.pop()
                else:
                    self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unmatched closing brace '}'", "Remove extra closing brace or check block balance."))
            elif tok.value == '(':
                paren_stack.append(tok)
            elif tok.value == ')':
                if paren_stack:
                    paren_stack.pop()
                else:
                    self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unmatched closing parenthesis ')'", "Remove extra closing parenthesis."))
            elif tok.value == '[':
                bracket_stack.append(tok)
            elif tok.value == ']':
                if bracket_stack:
                    bracket_stack.pop()
                else:
                    self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unmatched closing bracket ']'", "Remove extra closing bracket."))

        for tok in brace_stack:
            self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unclosed opening brace '{'", "Add missing closing brace '}' at end of block."))
        for tok in paren_stack:
            self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unclosed opening parenthesis '('", "Add missing closing parenthesis ')'."))
        for tok in bracket_stack:
            self.errors.append(SyntaxErrorDetail(tok.line, tok.column, "Unclosed opening bracket '['", "Add missing closing bracket ']'."))

        # Statement-by-statement checks for semicolons and declaration rules
        i = 0
        while i < len(self.tokens):
            tok = self.tokens[i]

            # Check variable or statement termination
            if tok.token_type in ["IDENTIFIER", "KEYWORD", "INT_CONST", "FLOAT_CONST"]:
                # If we encounter a statement starting with a variable assignment or declaration or function call
                # look ahead for semicolon before next line or keyword
                if tok.value in ["int", "float", "double", "char", "void", "return"] or tok.token_type == "IDENTIFIER":
                    # Look ahead to see if it's not a function header or block start '{'
                    has_brace = False
                    has_semicolon = False
                    j = i
                    line_no = tok.line
                    while j < len(self.tokens) and self.tokens[j].line == line_no:
                        if self.tokens[j].value == '{':
                            has_brace = True
                            break
                        if self.tokens[j].value == ';':
                            has_semicolon = True
                            break
                        j += 1
                    
                    # If statement ends on line and lacks semicolon or brace, check if next line starts a new statement
                    if not has_brace and not has_semicolon and j < len(self.tokens):
                        next_tok = self.tokens[j]
                        if next_tok.line > line_no and next_tok.value not in [",", "=", "+", "-", "*", "/", ")"]:
                            # Likely missing semicolon
                            self.errors.append(SyntaxErrorDetail(line_no, tok.column, f"Missing semicolon ';' after statement starting with '{tok.value}'", f"Add ';' at the end of line {line_no}."))

            i += 1

        is_valid = len(self.errors) == 0
        return {
            "valid": is_valid,
            "errors": [e.to_dict() for e in self.errors],
            "warnings": self.warnings
        }
