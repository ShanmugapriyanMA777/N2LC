import re
from typing import List, Dict, Any

class COptimizer:
    def __init__(self, code: str):
        self.code = code
        self.optimizations: List[Dict[str, Any]] = []

    def optimize(self) -> List[Dict[str, Any]]:
        self.optimizations = []
        lines = self.code.splitlines()

        for line_idx, line in enumerate(lines, 1):
            line_str = line.strip()

            # 1. Constant Folding check: e.g. int x = 10 * 20;
            const_fold_match = re.search(r'=\s*(\d+)\s*([\+\-\*\/])\s*(\d+)\s*;', line_str)
            if const_fold_match:
                n1, op, n2 = const_fold_match.groups()
                n1_val, n2_val = int(n1), int(n2)
                res = None
                if op == '+': res = n1_val + n2_val
                elif op == '-': res = n1_val - n2_val
                elif op == '*': res = n1_val * n2_val
                elif op == '/' and n2_val != 0: res = n1_val // n2_val

                if res is not None:
                    before_expr = f"{n1} {op} {n2}"
                    after_expr = str(res)
                    self.optimizations.append({
                        "pass_name": "Constant Folding",
                        "before": line_str,
                        "after": line_str.replace(before_expr, after_expr),
                        "description": f"Evaluated arithmetic constant expression '{before_expr}' to '{after_expr}' at compile time."
                    })

            # 2. Algebraic Simplification: e.g. x + 0 or x * 1 or x * 0
            if " + 0" in line_str or " - 0" in line_str:
                self.optimizations.append({
                    "pass_name": "Algebraic Simplification",
                    "before": line_str,
                    "after": line_str.replace(" + 0", "").replace(" - 0", ""),
                    "description": "Eliminated identity addition/subtraction by zero."
                })
            elif " * 1" in line_str:
                self.optimizations.append({
                    "pass_name": "Algebraic Simplification",
                    "before": line_str,
                    "after": line_str.replace(" * 1", ""),
                    "description": "Eliminated identity multiplication by one."
                })
            elif " * 0" in line_str:
                self.optimizations.append({
                    "pass_name": "Algebraic Simplification",
                    "before": line_str,
                    "after": re.sub(r'=\s*[^;]+\*\s*0\s*;', '= 0;', line_str),
                    "description": "Simplified multiplication by zero to constant 0."
                })

        # 3. Dead Code Detection after return
        found_return = False
        for line in lines:
            if found_return and line.strip() and not line.strip().startswith("}"):
                self.optimizations.append({
                    "pass_name": "Dead Code Elimination",
                    "before": line.strip(),
                    "after": "// [Removed Dead Code]",
                    "description": "Unreachable statement detected after return statement."
                })
                break
            if "return " in line:
                found_return = True

        return self.optimizations
