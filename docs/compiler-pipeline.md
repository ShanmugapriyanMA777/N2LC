# Compiler Pipeline Specification

The compiler pipeline processes source code through 9 distinct phases:

1. **Natural Language Requirement**:
   Input string e.g. "Write a C program to find the largest of three numbers."

2. **Generative AI Code Synthesis**:
   Gemini API converts specification into valid C11 source code.

3. **Lexical Analysis (Tokenizer)**:
   Scans C code into tokens: `KEYWORD`, `IDENTIFIER`, `INT_CONST`, `FLOAT_CONST`, `STRING_LITERAL`, `OPERATOR`, `DELIMITER`, `PREPROCESSOR`.

4. **Syntax Analysis (Parser)**:
   Verifies grammar structure and delimiter matching.

5. **Semantic Analysis**:
   Verifies identifier scope declarations and return statement validity.

6. **Abstract Syntax Tree (AST)**:
   Builds hierarchical node graph representing program constructs.

7. **Symbol Table Construction**:
   Tracks symbol metadata (Name, Type, Scope, Kind, Initial Value, Array Spec).

8. **Intermediate Representation (Three-Address Code - TAC)**:
   Emits 3-address instructions using temporaries (`t1 = b * c`).

9. **GCC Compilation & Sandboxed Execution**:
   Runs GCC `-Wall -Wextra -std=c11` in an isolated temp directory or uses in-memory Python C Interpreter fallback.
