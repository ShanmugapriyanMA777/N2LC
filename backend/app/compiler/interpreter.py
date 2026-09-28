import re
from typing import Dict, Any, List, Tuple

class CInterpreter:
    def __init__(self, code: str, stdin_input: str = ""):
        self.code = code
        self.stdin_input = stdin_input
        self.input_tokens = [tok for tok in re.split(r'\s+', stdin_input.strip()) if tok]
        self.input_idx = 0
        self.output_buffer: List[str] = []
        self.variables: Dict[str, Any] = {}

    def run(self) -> Tuple[bool, str, str]:
        """
        Executes C source code in memory and returns (success, stdout, stderr).
        """
        self.output_buffer = []
        self.variables = {}
        self.input_idx = 0

        lines = [line.strip() for line in self.code.splitlines() if line.strip()]

        try:
            i = 0
            while i < len(lines):
                line = lines[i]

                if line.startswith("#") or line.startswith("//") or line == "{" or line == "}":
                    i += 1
                    continue

                if line.startswith("int main") or line.startswith("void main"):
                    i += 1
                    continue

                # Handle scanf("%d %d", &a, &b);
                if line.startswith("scanf"):
                    vars_match = re.findall(r'&\s*([a-zA-Z_]\w*)', line)
                    for var_name in vars_match:
                        if self.input_idx < len(self.input_tokens):
                            val_str = self.input_tokens[self.input_idx]
                            self.input_idx += 1
                            # Infer integer or float
                            if '.' in val_str:
                                self.variables[var_name] = float(val_str)
                            else:
                                self.variables[var_name] = int(val_str)
                        else:
                            self.variables[var_name] = 0
                    i += 1
                    continue

                # Handle variable declaration: int a = 10, b = 20, c;
                var_decl_match = re.match(r'^(int|float|double|char)\s+([^;]+);', line)
                if var_decl_match:
                    var_type, decls = var_decl_match.groups()
                    items = decls.split(',')
                    for item in items:
                        item = item.strip()
                        if '=' in item:
                            vname, expr = item.split('=', 1)
                            vname = vname.strip()
                            self.variables[vname] = self._eval_expr(expr.strip())
                        else:
                            vname = item.strip()
                            if var_type in ['int', 'float', 'double']:
                                self.variables[vname] = 0
                            else:
                                self.variables[vname] = ''
                    i += 1
                    continue

                # Handle assignment: a = b + c;
                assign_match = re.match(r'^([a-zA-Z_]\w*)\s*=\s*(.*?);', line)
                if assign_match:
                    target, expr = assign_match.groups()
                    self.variables[target] = self._eval_expr(expr.strip())
                    i += 1
                    continue

                # Handle printf: printf("Factorial: %d\n", fact);
                if line.startswith("printf"):
                    call_content = re.search(r'printf\s*\((.*)\)\s*;', line)
                    if call_content:
                        args_str = call_content.group(1).strip()
                        parts = self._split_printf_args(args_str)
                        fmt_str = parts[0].strip('"\'')
                        
                        # Replace \n with actual newline
                        fmt_str = fmt_str.replace('\\n', '\n')

                        # Substitute format specifiers %d, %f, %s
                        var_evals = [self._eval_expr(p) for p in parts[1:]]
                        
                        # Format output
                        formatted = fmt_str
                        for val in var_evals:
                            if '%d' in formatted:
                                formatted = formatted.replace('%d', str(int(val)), 1)
                            elif '%f' in formatted or '%.2f' in formatted:
                                formatted = formatted.replace('%.2f', f"{val:.2f}", 1).replace('%f', f"{val:.4f}", 1)
                            elif '%s' in formatted:
                                formatted = formatted.replace('%s', str(val), 1)

                        self.output_buffer.append(formatted)
                    i += 1
                    continue

                # Handle Return
                if line.startswith("return"):
                    break

                i += 1

            return True, "".join(self.output_buffer), ""

        except Exception as e:
            return False, "".join(self.output_buffer), f"Execution Error: {str(e)}"

    def _eval_expr(self, expr_str: str) -> Any:
        expr_str = expr_str.strip().rstrip(';')
        if not expr_str:
            return 0

        # Replace declared variable names with their current values
        tokens = re.findall(r'\b[a-zA-Z_]\w*\b|\d+\.\d+|\d+|[\+\-\*\/\%\(\)]', expr_str)
        eval_parts = []

        for tok in tokens:
            if tok in self.variables:
                eval_parts.append(str(self.variables[tok]))
            elif tok in ["+", "-", "*", "/", "%", "(", ")"] or tok.isdigit() or re.match(r'^\d+\.\d+$', tok):
                eval_parts.append(tok)
            else:
                eval_parts.append("0")

        eval_str = " ".join(eval_parts)
        try:
            return eval(eval_str)
        except Exception:
            return 0

    def _split_printf_args(self, args_str: str) -> List[str]:
        parts = []
        in_string = False
        current = []
        for char in args_str:
            if char == '"':
                in_string = not in_string
                current.append(char)
            elif char == ',' and not in_string:
                parts.append("".join(current).strip())
                current = []
            else:
                current.append(char)
        if current:
            parts.append("".join(current).strip())
        return parts
