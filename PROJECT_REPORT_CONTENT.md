# PROJECT REPORT: NATURAL LANGUAGE TO C CODE COMPILER USING GENERATIVE AI

## 1. Introduction
The "Natural Language to C Code Compiler Using Generative AI" (NL2C COMPILER) is an advanced Compiler Design platform that bridges natural language processing (NLP) and classic compiler theory. It accepts high-level human requirements (e.g. "Write a C program to calculate factorial") and transforms them into standard C source code using Generative AI, then exposes an interactive, transparent 9-stage compiler design execution pipeline.

## 2. Problem Statement
Traditional compilers require developers to write syntactically pristine C source code manually. Beginners often struggle with syntax rules, scope errors, and missing semicolons. Conversely, generic LLM wrappers display generated code without explaining the underlying lexical, syntactic, semantic, and intermediate code transformations required to compile and execute the code safely.

## 3. Objectives
- Develop an intelligent web-based IDE combining Generative AI with a full compiler design pipeline.
- Implement lexical analysis, syntax parsing, AST construction, symbol table tracking, semantic validation, Three-Address Code (TAC) generation, and basic optimization passes.
- Provide automated AI error explanation and side-by-side code diff remediation for compiler failures.
- Ensure secure sandboxed execution using GCC or an in-memory C Interpreter fallback.

## 4. System Architecture
The application features a decoupled architecture:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Recharts.
- **Backend**: Python FastAPI, Pydantic, Uvicorn.
- **Compiler Components**: CLexer, CParser, ASTBuilder, SymbolTableBuilder, CSemanticAnalyzer, IRGenerator, COptimizer, CInterpreter, SandboxedGCC.
- **AI Service**: Google Gemini API integration with prompt sanitization.

## 5. Methodology
1. User enters natural language specification.
2. Generative AI synthesizes C source code (sanitized on backend).
3. Lexical analyzer converts source code into token stream.
4. Syntax analyzer validates grammar structure and delimiter balance.
5. AST generator constructs hierarchical node tree.
6. Symbol table tracks identifiers, data types, and scopes.
7. Semantic analyzer verifies variable declarations and scope rules.
8. IR generator produces Three-Address Code (TAC) instructions.
9. Optimizer applies constant folding and dead code elimination.
10. GCC compiles and runs binary in sandboxed temp directory (or Python C Interpreter).
11. If compilation errors occur, AI analyzes stderr and suggests side-by-side code corrections.

## 6. Algorithms
- **Lexical Scanning**: Deterministic Finite Automaton (DFA) matching for keywords, identifiers, constants, and operators.
- **Syntax Parsing**: Recursive-descent statement matching and stack-based brace balance verification.
- **AST Construction**: Context-free grammar node decomposition.
- **Three-Address Code (TAC)**: Linearization algorithm converting binary expressions into `t1 = b * c` form.
- **Constant Folding**: AST node evaluation replacing literal arithmetic expressions with computed values.

## 7. Software Requirements
- Operating System: Windows 10/11 or Linux
- Environment: Python 3.10+, Node.js v18+
- Tools: GCC (MinGW-w64), FastAPI, React, Monaco Editor
- API: Google Gemini API

## 8. Hardware Requirements
- Processor: Dual-Core 2.0 GHz or higher
- RAM: 4 GB minimum (8 GB recommended)
- Storage: 500 MB available space

## 9. Implementation
The project is modularized into `backend/` and `frontend/`. Core algorithms were validated using automated unit tests (`pytest`).

## 10. Results
The platform was tested against 10 standard C programming specifications (Largest of three numbers, Factorial, Prime check, Fibonacci series, Array sort, Student grade, Reverse number, Palindrome check, Matrix addition, String length). All 10 cases passed the complete 9-stage pipeline, generating correct tokens, AST trees, symbol tables, TAC statements, and accurate program execution output.

## 11. Advantages
- Visually demonstrates compiler design theory in a real-time web IDE.
- Provides immediate AI-driven error remediation and code diffs.
- Operates reliably even if GCC is missing using the embedded Python C Interpreter.

## 12. Applications
- Compiler Design academic laboratory project & viva defense tool.
- Automated C code synthesis & educational platform for computer science students.

## 13. Future Enhancements
- Support for target assembly code generation (x86_64 / RISC-V assembly).
- Integration of LLVM IR emission.

## 14. Conclusion
The NL2C COMPILER successfully demonstrates how modern Generative AI can be integrated with classical compiler design principles to build a transparent, robust, and educational compilation engine.

## 15. References
- Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). *Compilers: Principles, Techniques, and Tools* (2nd ed.). Addison-Wesley.
- Google DeepMind. (2024). *Gemini API Documentation*.
