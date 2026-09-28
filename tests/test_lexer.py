from app.compiler.lexer import CLexer

def test_lexer_tokens():
    code = """
    #include <stdio.h>
    int main() {
        int x = 10;
        printf("%d\\n", x);
        return 0;
    }
    """
    lexer = CLexer(code)
    tokens = lexer.tokenize()
    
    types = [t.token_type for t in tokens]
    lexemes = [t.lexeme for t in tokens]

    assert "PREPROCESSOR" in types
    assert "KEYWORD" in types
    assert "IDENTIFIER" in types
    assert "INT_CONST" in types
    assert "int" in lexemes
    assert "main" in lexemes
    assert "x" in lexemes
