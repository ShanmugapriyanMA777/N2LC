import re
from typing import Dict, Any, List
from app.compiler.lexer import Token, CLexer

class ASTBuilder:
    def __init__(self, code: str, tokens: List[Token]):
        self.code = code
        self.tokens = tokens

    def build_ast(self) -> Dict[str, Any]:
        """
        Builds a hierarchical AST dictionary from C source code tokens.
        """
        root = {
            "id": "node_root",
            "type": "Program",
            "label": "Program (Translation Unit)",
            "line": 1,
            "children": [],
            "details": {"source": "C Source File"}
        }

        # Extract functions, declarations, and statements using clean regex & token parsing
        lines = [line.strip() for line in self.code.splitlines() if line.strip()]

        current_fn = None
        current_block = None

        node_id_counter = 1

        def next_id():
            nonlocal node_id_counter
            nid = f"node_{node_id_counter}"
            node_id_counter += 1
            return nid

        for line_num, line in enumerate(lines, 1):
            if line.startswith("#include") or line.startswith("#define"):
                root["children"].append({
                    "id": next_id(),
                    "type": "PreprocessorDirective",
                    "label": f"Preprocessor: {line}",
                    "line": line_num,
                    "children": [],
                    "details": {"directive": line}
                })
                continue

            # Match function header e.g. int main() {
            fn_match = re.match(r'^(int|float|double|char|void)\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*\{?', line)
            if fn_match:
                ret_type, fn_name, params = fn_match.groups()
                fn_node = {
                    "id": next_id(),
                    "type": "FunctionDecl",
                    "label": f"Function: {ret_type} {fn_name}({params})",
                    "line": line_num,
                    "children": [],
                    "details": {
                        "name": fn_name,
                        "return_type": ret_type,
                        "parameters": params.strip()
                    }
                }

                # Parameter nodes
                if params.strip() and params.strip() != "void":
                    param_parts = params.split(',')
                    for p in param_parts:
                        fn_node["children"].append({
                            "id": next_id(),
                            "type": "Parameter",
                            "label": f"Param: {p.strip()}",
                            "line": line_num,
                            "children": [],
                            "details": {"spec": p.strip()}
                        })

                root["children"].append(fn_node)
                current_fn = fn_node
                continue

            # Match variable declaration: int x = 10; or float a, b;
            var_match = re.match(r'^(int|float|double|char)\s+([^;]+);', line)
            if var_match:
                var_type, decls = var_match.groups()
                decl_items = decls.split(',')
                for item in decl_items:
                    item = item.strip()
                    if '=' in item:
                        name, val = item.split('=', 1)
                        name, val = name.strip(), val.strip()

                        # Check if expression
                        expr_node = self._build_expr_ast(val, next_id, line_num)

                        decl_node = {
                            "id": next_id(),
                            "type": "VarDecl",
                            "label": f"VarDecl: {var_type} {name} = {val}",
                            "line": line_num,
                            "children": [expr_node],
                            "details": {"type": var_type, "identifier": name, "init_val": val}
                        }
                    else:
                        decl_node = {
                            "id": next_id(),
                            "type": "VarDecl",
                            "label": f"VarDecl: {var_type} {item}",
                            "line": line_num,
                            "children": [],
                            "details": {"type": var_type, "identifier": item}
                        }

                    target = current_fn["children"] if current_fn else root["children"]
                    target.append(decl_node)
                continue

            # Match Control Flow: if (cond)
            if_match = re.match(r'^if\s*\((.*?)\)', line)
            if if_match:
                cond = if_match.group(1)
                cond_node = self._build_expr_ast(cond, next_id, line_num)
                if_node = {
                    "id": next_id(),
                    "type": "IfStmt",
                    "label": f"If Condition: ({cond})",
                    "line": line_num,
                    "children": [cond_node],
                    "details": {"condition": cond}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(if_node)
                continue

            # Match while loop
            while_match = re.match(r'^while\s*\((.*?)\)', line)
            if while_match:
                cond = while_match.group(1)
                cond_node = self._build_expr_ast(cond, next_id, line_num)
                while_node = {
                    "id": next_id(),
                    "type": "WhileStmt",
                    "label": f"While Loop: ({cond})",
                    "line": line_num,
                    "children": [cond_node],
                    "details": {"condition": cond}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(while_node)
                continue

            # Match for loop
            for_match = re.match(r'^for\s*\((.*?);(.*?);(.*?)\)', line)
            if for_match:
                init, cond, step = for_match.groups()
                for_node = {
                    "id": next_id(),
                    "type": "ForStmt",
                    "label": f"For Loop: ({init}; {cond}; {step})",
                    "line": line_num,
                    "children": [
                        {"id": next_id(), "type": "Init", "label": f"Init: {init}", "line": line_num, "children": [], "details": {}},
                        {"id": next_id(), "type": "Cond", "label": f"Cond: {cond}", "line": line_num, "children": [], "details": {}},
                        {"id": next_id(), "type": "Step", "label": f"Step: {step}", "line": line_num, "children": [], "details": {}}
                    ],
                    "details": {"init": init, "condition": cond, "step": step}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(for_node)
                continue

            # Match printf / scanf / function calls
            call_match = re.match(r'^([a-zA-Z_]\w*)\s*\((.*?)\)\s*;', line)
            if call_match:
                fn_call_name, args = call_match.groups()
                call_node = {
                    "id": next_id(),
                    "type": "CallExpr",
                    "label": f"Call: {fn_call_name}({args})",
                    "line": line_num,
                    "children": [],
                    "details": {"function": fn_call_name, "arguments": args}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(call_node)
                continue

            # Match Assignment: a = b + c;
            assign_match = re.match(r'^([a-zA-Z_]\w*)\s*=\s*(.*?);', line)
            if assign_match:
                lhs, rhs = assign_match.groups()
                rhs_node = self._build_expr_ast(rhs, next_id, line_num)
                assign_node = {
                    "id": next_id(),
                    "type": "AssignmentExpr",
                    "label": f"Assign: {lhs} = {rhs}",
                    "line": line_num,
                    "children": [
                        {"id": next_id(), "type": "LHS", "label": f"LHS: {lhs}", "line": line_num, "children": [], "details": {}},
                        rhs_node
                    ],
                    "details": {"target": lhs, "value": rhs}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(assign_node)
                continue

            # Return statement
            ret_match = re.match(r'^return\s*(.*?);', line)
            if ret_match:
                ret_val = ret_match.group(1).strip()
                ret_node = {
                    "id": next_id(),
                    "type": "ReturnStmt",
                    "label": f"Return: {ret_val}",
                    "line": line_num,
                    "children": [],
                    "details": {"return_value": ret_val}
                }
                target = current_fn["children"] if current_fn else root["children"]
                target.append(ret_node)
                continue

        return root

    def _build_expr_ast(self, expr_str: str, next_id_fn, line: int) -> Dict[str, Any]:
        """
        Sub-parser for binary/unary expression nodes inside AST.
        """
        expr_str = expr_str.strip()
        ops = ['==', '!=', '<=', '>=', '&&', '||', '+', '-', '*', '/', '%']
        matched_op = None

        for op in ['==', '!=', '<=', '>=', '&&', '||', '+', '-', '*', '/', '%']:
            if op in expr_str:
                matched_op = op
                break

        if matched_op:
            parts = expr_str.split(matched_op, 1)
            left = parts[0].strip()
            right = parts[1].strip()
            return {
                "id": next_id_fn(),
                "type": "BinaryExpr",
                "label": f"BinaryExpr: ({matched_op})",
                "line": line,
                "children": [
                    self._build_expr_ast(left, next_id_fn, line),
                    self._build_expr_ast(right, next_id_fn, line)
                ],
                "details": {"operator": matched_op}
            }

        # Terminal identifier or literal
        if expr_str.isdigit():
            return {
                "id": next_id_fn(),
                "type": "IntLiteral",
                "label": f"Int: {expr_str}",
                "line": line,
                "children": [],
                "details": {"val": int(expr_str)}
            }
        elif re.match(r'^\d+\.\d+$', expr_str):
            return {
                "id": next_id_fn(),
                "type": "FloatLiteral",
                "label": f"Float: {expr_str}",
                "line": line,
                "children": [],
                "details": {"val": float(expr_str)}
            }
        else:
            return {
                "id": next_id_fn(),
                "type": "Identifier",
                "label": f"Id: {expr_str}",
                "line": line,
                "children": [],
                "details": {"name": expr_str}
            }
