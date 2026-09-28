from app.compiler.lexer import CLexer
from app.compiler.parser import CParser

def test_parser_valid_code():
    code = "int main() { int x = 10; return 0; }"
    lexer = CLexer(code)
    tokens = lexer.tokenize()
    parser = CParser(tokens)
    res = parser.parse()
    assert res["valid"] is True
    assert len(res["errors"]) == 0

def test_parser_unmatched_brace():
    code = "int main() { int x = 10;"
    lexer = CLexer(code)
    tokens = lexer.tokenize()
    parser = CParser(tokens)
    res = parser.parse()
    assert res["valid"] is False
    assert len(res["errors"]) > 0
    assert "Unclosed" in res["errors"][0]["message"] or "brace" in res["errors"][0]["message"]
