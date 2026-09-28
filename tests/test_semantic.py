from app.compiler.lexer import CLexer
from app.compiler.symbol_table import SymbolTableBuilder
from app.compiler.semantic_analyzer import CSemanticAnalyzer

def test_semantic_undeclared_variable():
    code = """
    int main() {
        int x = 10;
        printf("%d", y);
        return 0;
    }
    """
    lexer = CLexer(code)
    tokens = lexer.tokenize()
    symbols = SymbolTableBuilder(code, tokens).build_symbol_table()
    analyzer = CSemanticAnalyzer(code, tokens, symbols)
    res = analyzer.analyze()
    assert res["valid"] is False
    assert any("y" in err["message"] for err in res["errors"])
