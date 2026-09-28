import re
from typing import List, Dict, Any, Optional
from app.compiler.lexer import Token

class SymbolEntry:
    def __init__(self, name: str, data_type: str, scope: str, kind: str, initial_value: str = "-", array_size: str = "-"):
        self.name = name
        self.type = data_type
        self.scope = scope
        self.kind = kind
        self.initial_value = initial_value
        self.array_size = array_size

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "type": self.type,
            "scope": self.scope,
            "kind": self.kind,
            "initial_value": self.initial_value,
            "array_size": self.array_size
        }

C_TYPE_REGEX = r'(?:(?:const|static|volatile|unsigned|signed|short|long)\s+)*(?:int|float|double|char|void|long\s+long|long|short|unsigned|signed|size_t|bool)(?:\s*\*+)?'

class SymbolTableBuilder:
    def __init__(self, code: str, tokens: List[Token]):
        self.code = code
        self.tokens = tokens
        self.symbols: List[SymbolEntry] = []

    def build_symbol_table(self) -> List[Dict[str, Any]]:
        self.symbols = []
        clean_code = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), self.code, flags=re.DOTALL)
        lines = clean_code.splitlines()

        current_scope = "global"

        for line in lines:
            line_str = line.strip()
            if not line_str or line_str.startswith("#") or line_str.startswith("//"):
                continue

            # Scope entry (Function header)
            fn_match = re.match(r'^(' + C_TYPE_REGEX + r')\s+([a-zA-Z_]\w*)\s*\((.*?)\)', line_str)
            if fn_match and not line_str.rstrip().endswith(";"):
                ret_type, fn_name, params_str = fn_match.groups()
                ret_type = ret_type.strip()
                # Add function to symbol table
                if not any(s.name == fn_name and s.scope == "global" for s in self.symbols):
                    self.symbols.append(SymbolEntry(fn_name, ret_type, "global", "function", "-", "-"))
                current_scope = fn_name

                # Add parameters
                if params_str.strip() and params_str.strip() != "void":
                    param_list = params_str.split(',')
                    for p in param_list:
                        p = p.strip()
                        pm = re.match(r'^(' + C_TYPE_REGEX + r')\s*([a-zA-Z_]\w*)$', p)
                        if pm:
                            p_type, p_name = pm.groups()
                            if not any(s.name == p_name and s.scope == fn_name for s in self.symbols):
                                self.symbols.append(SymbolEntry(p_name, p_type.strip(), fn_name, "parameter", "-", "-"))
                continue

            # Check for-loop declarations: for (int i = 0; ...)
            for_match = re.search(r'for\s*\(\s*(' + C_TYPE_REGEX + r')\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);', line_str)
            if for_match:
                f_type, f_name, f_val = for_match.groups()
                if not any(s.name == f_name and s.scope == current_scope for s in self.symbols):
                    self.symbols.append(SymbolEntry(f_name, f_type.strip(), current_scope, "variable", f_val.strip(), "-"))

            # Check array declarations: int arr[10];
            arr_match = re.match(r'^(' + C_TYPE_REGEX + r')\s+([a-zA-Z_]\w*)\[([^\]]*)\]\s*;', line_str)
            if arr_match:
                var_type, var_name, arr_sz = arr_match.groups()
                if not any(s.name == var_name and s.scope == current_scope for s in self.symbols):
                    self.symbols.append(SymbolEntry(var_name, var_type.strip(), current_scope, "variable", "-", f"[{arr_sz}]"))
                continue

            # Check normal variable declarations: int x = 10, y; or long long fact = 1;
            decl_match = re.match(r'^(' + C_TYPE_REGEX + r')\s+([^;]+);', line_str)
            if decl_match and not line_str.startswith("return") and not line_str.startswith("typedef"):
                var_type, decls = decl_match.groups()
                var_type = var_type.strip()
                items = decls.split(',')
                for item in items:
                    item = item.strip()
                    init_val = "-"
                    arr_sz = "-"
                    if '=' in item:
                        var_name, init_val = item.split('=', 1)
                        var_name = var_name.strip()
                        init_val = init_val.strip()
                    else:
                        var_name = item.strip()

                    # Clean variable name if pointer asterisk was attached: *ptr
                    var_name = var_name.lstrip('*').strip()

                    if var_name and re.match(r'^[a-zA-Z_]\w*$', var_name):
                        if not any(s.name == var_name and s.scope == current_scope for s in self.symbols):
                            self.symbols.append(SymbolEntry(var_name, var_type, current_scope, "variable", init_val, arr_sz))

        return [s.to_dict() for s in self.symbols]

