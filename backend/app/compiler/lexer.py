import re
from typing import List, Dict, Any

KEYWORDS = {
    "int", "float", "double", "char", "void", "if", "else", "for", "while",
    "do", "return", "switch", "case", "break", "continue", "struct", "typedef",
    "const", "static", "sizeof", "long", "short", "unsigned", "signed", "default"
}

OPERATORS = [
    "++", "--", "==", "!=", "<=", ">=", "&&", "||", "+=", "-=", "*=", "/=", "%=", "->",
    "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|", "^", "~", "."
]

DELIMITERS = {"(", ")", "{", "}", "[", "]", ";", ",", ":", "?"}

class Token:
    def __init__(self, line: int, column: int, lexeme: str, token_type: str, value: str):
        self.line = line
        self.column = column
        self.lexeme = lexeme
        self.token_type = token_type
        self.value = value

    def to_dict(self) -> Dict[str, Any]:
        return {
            "line": self.line,
            "column": self.column,
            "lexeme": self.lexeme,
            "token_type": self.token_type,
            "value": self.value
        }

class CLexer:
    def __init__(self, code: str):
        self.code = code
        self.length = len(code)
        self.pos = 0
        self.line = 1
        self.col = 1
        self.tokens: List[Token] = []

    def tokenize(self) -> List[Token]:
        self.pos = 0
        self.line = 1
        self.col = 1
        self.tokens = []

        while self.pos < self.length:
            char = self.code[self.pos]

            # Whitespace handling
            if char == '\n':
                self.line += 1
                self.col = 1
                self.pos += 1
                continue
            elif char.isspace():
                self.col += 1
                self.pos += 1
                continue

            # Skip comments
            if char == '/' and self.pos + 1 < self.length:
                next_char = self.code[self.pos + 1]
                if next_char == '/':
                    # Single-line comment
                    while self.pos < self.length and self.code[self.pos] != '\n':
                        self.pos += 1
                    continue
                elif next_char == '*':
                    # Multi-line comment
                    self.pos += 2
                    self.col += 2
                    while self.pos + 1 < self.length and not (self.code[self.pos] == '*' and self.code[self.pos+1] == '/'):
                        if self.code[self.pos] == '\n':
                            self.line += 1
                            self.col = 1
                        else:
                            self.col += 1
                        self.pos += 1
                    self.pos += 2
                    self.col += 2
                    continue

            # Preprocessor directives (#include, #define)
            if char == '#':
                start_col = self.col
                start_pos = self.pos
                while self.pos < self.length and self.code[self.pos] != '\n':
                    self.pos += 1
                lexeme = self.code[start_pos:self.pos]
                self.tokens.append(Token(self.line, start_col, lexeme, "PREPROCESSOR", lexeme))
                self.col += len(lexeme)
                continue

            # String literals
            if char == '"':
                start_col = self.col
                start_pos = self.pos
                self.pos += 1
                self.col += 1
                string_val = []
                escaped = False
                while self.pos < self.length:
                    c = self.code[self.pos]
                    if escaped:
                        string_val.append(c)
                        escaped = False
                    elif c == '\\':
                        escaped = True
                    elif c == '"':
                        self.pos += 1
                        self.col += 1
                        break
                    else:
                        string_val.append(c)
                    self.pos += 1
                    self.col += 1
                lexeme = self.code[start_pos:self.pos]
                val = "".join(string_val)
                self.tokens.append(Token(self.line, start_col, lexeme, "STRING_LITERAL", val))
                continue

            # Character constants
            if char == "'":
                start_col = self.col
                start_pos = self.pos
                self.pos += 1
                self.col += 1
                char_val = ""
                if self.pos < self.length and self.code[self.pos] == '\\':
                    self.pos += 2
                    self.col += 2
                elif self.pos < self.length:
                    self.pos += 1
                    self.col += 1
                if self.pos < self.length and self.code[self.pos] == "'":
                    self.pos += 1
                    self.col += 1
                lexeme = self.code[start_pos:self.pos]
                self.tokens.append(Token(self.line, start_col, lexeme, "CHAR_CONST", lexeme))
                continue

            # Numbers (integers or floats)
            if char.isdigit() or (char == '.' and self.pos + 1 < self.length and self.code[self.pos + 1].isdigit()):
                start_col = self.col
                start_pos = self.pos
                is_float = False
                while self.pos < self.length and (self.code[self.pos].isdigit() or self.code[self.pos] == '.'):
                    if self.code[self.pos] == '.':
                        is_float = True
                    self.pos += 1
                    self.col += 1
                lexeme = self.code[start_pos:self.pos]
                token_type = "FLOAT_CONST" if is_float else "INT_CONST"
                self.tokens.append(Token(self.line, start_col, lexeme, token_type, lexeme))
                continue

            # Identifiers and Keywords
            if char.isalpha() or char == '_':
                start_col = self.col
                start_pos = self.pos
                while self.pos < self.length and (self.code[self.pos].isalnum() or self.code[self.pos] == '_'):
                    self.pos += 1
                    self.col += 1
                lexeme = self.code[start_pos:self.pos]
                token_type = "KEYWORD" if lexeme in KEYWORDS else "IDENTIFIER"
                self.tokens.append(Token(self.line, start_col, lexeme, token_type, lexeme))
                continue

            # Multi-char operators
            matched_op = None
            for op in OPERATORS:
                if self.code.startswith(op, self.pos):
                    matched_op = op
                    break
            if matched_op:
                self.tokens.append(Token(self.line, self.col, matched_op, "OPERATOR", matched_op))
                self.pos += len(matched_op)
                self.col += len(matched_op)
                continue

            # Delimiters
            if char in DELIMITERS:
                self.tokens.append(Token(self.line, self.col, char, "DELIMITER", char))
                self.pos += 1
                self.col += 1
                continue

            # Unknown/Other
            self.tokens.append(Token(self.line, self.col, char, "UNKNOWN", char))
            self.pos += 1
            self.col += 1

        return self.tokens
