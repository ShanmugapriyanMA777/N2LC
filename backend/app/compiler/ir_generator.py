import re
from typing import List, Dict, Any

class TACInstruction:
    def __init__(self, index: int, op: str, arg1: str = "", arg2: str = "", result: str = "", statement: str = ""):
        self.index = index
        self.op = op
        self.arg1 = arg1
        self.arg2 = arg2
        self.result = result
        self.statement = statement or f"{result} = {arg1} {op} {arg2}".strip()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "op": self.op,
            "arg1": self.arg1,
            "arg2": self.arg2,
            "result": self.result,
            "statement": self.statement
        }

class IRGenerator:
    def __init__(self, code: str):
        self.code = code
        self.instructions: List[TACInstruction] = []
        self.temp_counter = 1
        self.label_counter = 1

    def new_temp(self) -> str:
        t = f"t{self.temp_counter}"
        self.temp_counter += 1
        return t

    def new_label(self) -> str:
        l = f"L{self.label_counter}"
        self.label_counter += 1
        return l

    def generate_ir(self) -> List[Dict[str, Any]]:
        self.instructions = []
        self.temp_counter = 1
        self.label_counter = 1

        lines = [line.strip() for line in self.code.splitlines() if line.strip()]

        inst_idx = 1

        for line in lines:
            if line.startswith("#") or line.startswith("//"):
                continue

            # Function entry
            fn_match = re.match(r'^(int|float|double|char|void)\s+([a-zA-Z_]\w*)\s*\(', line)
            if fn_match:
                fn_name = fn_match.group(2)
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="func_begin", result=fn_name, statement=f"FUNCTION {fn_name}:"
                ))
                inst_idx += 1
                continue

            # Variable declaration with assignment: int a = b + c * d;
            decl_assign = re.match(r'^(int|float|double|char)?\s*([a-zA-Z_]\w*)\s*=\s*(.*?);', line)
            if decl_assign:
                _, target, expr = decl_assign.groups()
                inst_idx = self._parse_expr_to_tac(expr.strip(), target.strip(), inst_idx)
                continue

            # If condition: if (a > b)
            if_match = re.match(r'^if\s*\((.*?)\)', line)
            if if_match:
                cond = if_match.group(1).strip()
                label_false = self.new_label()
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="iffalse", arg1=cond, result=label_false, statement=f"if False ({cond}) goto {label_false}"
                ))
                inst_idx += 1
                continue

            # While loop: while (i < n)
            while_match = re.match(r'^while\s*\((.*?)\)', line)
            if while_match:
                cond = while_match.group(1).strip()
                label_start = self.new_label()
                label_end = self.new_label()
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="label", result=label_start, statement=f"LABEL {label_start}:"
                ))
                inst_idx += 1
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="iffalse", arg1=cond, result=label_end, statement=f"if False ({cond}) goto {label_end}"
                ))
                inst_idx += 1
                continue

            # Printf / Scanf call
            call_match = re.match(r'^(printf|scanf)\s*\((.*?)\)\s*;', line)
            if call_match:
                fn_call, args = call_match.groups()
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="param", arg1=args, statement=f"param {args}"
                ))
                inst_idx += 1
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="call", arg1=fn_call, statement=f"call {fn_call}"
                ))
                inst_idx += 1
                continue

            # Return statement
            ret_match = re.match(r'^return\s*(.*?);', line)
            if ret_match:
                ret_val = ret_match.group(1).strip()
                self.instructions.append(TACInstruction(
                    index=inst_idx, op="return", arg1=ret_val, statement=f"return {ret_val}"
                ))
                inst_idx += 1
                continue

        return [i.to_dict() for i in self.instructions]

    def _parse_expr_to_tac(self, expr: str, target: str, start_idx: int) -> int:
        """
        Decomposes complex arithmetic into TAC instructions with temporaries.
        e.g. b + c * d -> t1 = c * d; t2 = b + t1; target = t2
        """
        curr_idx = start_idx

        # Check binary expression with operator precedence (* / % before + -)
        ops_high = ['*', '/', '%']
        ops_low = ['+', '-']

        # Simple check for dual binary operation like a + b * c
        tokens = re.split(r'(\+|\-|\*|\/|\%)', expr)
        tokens = [t.strip() for t in tokens if t.strip()]

        if len(tokens) == 5: # e.g. ["b", "+", "c", "*", "d"]
            t1 = self.new_temp()
            self.instructions.append(TACInstruction(
                index=curr_idx, op=tokens[3], arg1=tokens[2], arg2=tokens[4], result=t1,
                statement=f"{t1} = {tokens[2]} {tokens[3]} {tokens[4]}"
            ))
            curr_idx += 1
            self.instructions.append(TACInstruction(
                index=curr_idx, op=tokens[1], arg1=tokens[0], arg2=t1, result=target,
                statement=f"{target} = {tokens[0]} {tokens[1]} {t1}"
            ))
            curr_idx += 1
        elif len(tokens) == 3: # e.g. ["a", "+", "b"]
            self.instructions.append(TACInstruction(
                index=curr_idx, op=tokens[1], arg1=tokens[0], arg2=tokens[2], result=target,
                statement=f"{target} = {tokens[0]} {tokens[1]} {tokens[2]}"
            ))
            curr_idx += 1
        else: # Simple assignment target = expr
            self.instructions.append(TACInstruction(
                index=curr_idx, op="assign", arg1=expr, result=target,
                statement=f"{target} = {expr}"
            ))
            curr_idx += 1

        return curr_idx
