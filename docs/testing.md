# Automated Test Suite

The project includes unit and end-to-end integration tests located in `tests/`:

- `test_lexer.py`: Verifies tokenization of keywords, identifiers, constants, strings, operators, preprocessor directives.
- `test_parser.py`: Verifies grammar parsing for valid code and syntax error detection for unclosed braces/missing semicolons.
- `test_semantic.py`: Verifies undeclared variable checking and scope rules.
- `test_compiler.py`: Verifies full pipeline analysis, AST generation, symbol table construction, TAC IR generation, and C code execution.

To run the test suite:
```powershell
python -m pytest tests/
```
