# System Architecture - NL2C Compiler

The Natural Language to C Code Compiler Using Generative AI (NL2C COMPILER) is structured as a decoupled, multi-tier architecture consisting of:

1. **Frontend IDE Layer**:
   - Built with React 18, TypeScript, Vite, Tailwind CSS, and Monaco Editor.
   - Provides live interactive inspectors for Tokens, AST Graphs, Symbol Tables, Semantic Reports, Three-Address Code, Optimizations, Terminal Console, and AI Error Fix side-by-side diff.

2. **Backend API Layer**:
   - Built with Python FastAPI, Uvicorn, and Pydantic.
   - Exposes RESTful endpoints for code generation (`/api/generate`), 6-phase compiler analysis (`/api/analyze`), GCC compilation (`/api/compile`), sandboxed execution (`/api/execute`), AI error correction (`/api/fix`), and system health (`/api/health`).

3. **Compiler Pipeline Engine**:
   - `CLexer`: Scans C source code and produces token stream with 8 token types.
   - `CParser`: Checks C11 grammar syntax and balance of braces/parentheses.
   - `ASTBuilder`: Builds hierarchical Abstract Syntax Tree.
   - `SymbolTableBuilder`: Tracks identifier metadata across global and function scopes.
   - `CSemanticAnalyzer`: Performs variable scope checks, undeclared identifier detection, and duplicate declaration checking.
   - `IRGenerator`: Emits Three-Address Code (TAC) statements with temporary variables (`t1`, `t2`) and label jumps.
   - `COptimizer`: Performs constant folding, constant propagation, and dead code detection.
   - `CInterpreter`: Fallback AST-based in-memory execution engine when native GCC is missing.

4. **Security & Sandboxing Layer**:
   - `SandboxedGCC`: Executes compiler binaries inside temporary isolated directories with strict execution timeouts (5s default) and stdin/stdout capture.
