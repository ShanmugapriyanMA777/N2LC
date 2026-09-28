# NATURAL LANGUAGE TO C CODE COMPILER USING GENERATIVE AI (NL2C COMPILER)

An intelligent 9-stage web application and Compiler Design mini-project platform that converts natural language requirements into standard C code, running it through a full interactive compiler pipeline (Lexical Analysis, Syntax Parsing, AST Generation, Symbol Table construction, Semantic Analysis, Three-Address Code IR, Optimization, and GCC Sandbox Execution), backed by Generative AI for code synthesis and compiler error auto-remediation.

---

## 🌟 Key Features

1. **Natural Language to C Code Generation**: Uses Generative AI (Google Gemini API) with backend sanitization to generate pure C11 source code.
2. **Lexical Analysis (Tokenizer)**: Displays line, column, lexeme, token type (`KEYWORD`, `IDENTIFIER`, `INT_CONST`, `FLOAT_CONST`, `STRING_LITERAL`, `OPERATOR`, `DELIMITER`, `PREPROCESSOR`), and parsed values.
3. **Syntax Analysis**: Validates statement terminations (`;`), brace/parentheses balance, and reports errors with line/column and suggested fixes.
4. **Interactive AST Viewer**: Hierarchical tree visualization of Abstract Syntax Tree nodes with collapsible branches and node detail inspector.
5. **Symbol Table Inspector**: Scope-aware symbol tracking recording identifier names, types, scopes, kinds, initial values, and array dimensions.
6. **Semantic Analysis Report**: Checks for undeclared variables, duplicate scope declarations, and return statement validity.
7. **Intermediate Representation (IR / TAC)**: Generates Three-Address Code (TAC) statements with temporary variables (`t1`, `t2`) and conditional jumps.
8. **Compiler Optimization Passes**: Demonstrates Constant Folding, Constant Propagation, Algebraic Simplification, and Dead Code Elimination.
9. **GCC Sandboxed Execution**: Secure subprocess execution (`-Wall -Wextra -std=c11`) with execution timeout (5s), stdin redirection, and stdout terminal capture.
10. **Embedded C Interpreter Fallback**: Provides in-memory execution so the full compiler pipeline works seamlessly even if GCC is absent on the host.
11. **AI Error Fix & Code Diff**: Analyzes compiler error logs and presents a side-by-side diff (Original vs Corrected) with a 1-click **Apply Fix** button.
12. **Analysis Metrics Dashboard**: Real-time quantitative telemetry and charts for token distribution and stage execution latencies.
13. **Viva Defense Cheat Sheet**: Academic reference explaining What, Why, Input, Processing, and Output for every compiler module.

---

## 🏗 Project Architecture

```
nl2c-compiler/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entry point
│   │   ├── config.py              # Environment variables config
│   │   ├── api/                   # REST API Routers
│   │   ├── compiler/              # Lexer, Parser, AST, Symbol, Semantic, IR, Optimizer, Interpreter
│   │   ├── services/              # AI, Compiler & History Services
│   │   ├── models/                # Pydantic Schemas
│   │   └── security/              # Sandboxed GCC execution
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Input, Monaco Editor, Tokens, AST, Symbol, TAC, Console, Diff
│   │   ├── pages/                 # CompilerIDE, AnalysisDashboard, HistoryPage, DocumentationPage, AboutPage
│   │   ├── services/              # API Client
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── tests/                         # Automated Pytest suite
├── docs/                          # Architecture, Pipeline, API, Setup, Security & Testing docs
├── PROJECT_REPORT_CONTENT.md       # Academic Project Report
├── .env.example                   # Environment variables template
├── docker-compose.yml             # Docker Compose orchestration
└── README.md
```

---

## 🚀 Local Development Setup

### System Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10.0 or higher
- **GCC Compiler**: MinGW-w64 (Windows) or `gcc` (Linux). *(Optional; Python C Interpreter fallback is included).*

### Quick Start Instructions (Windows PowerShell)

#### 1. Backend Setup
```powershell
# Navigate to backend folder
cd "C:\Users\shaisty priya\.gemini\antigravity-ide\scratch\nl2c-compiler\backend"

# Install Python dependencies
pip install -r requirements.txt

# Create .env file in project root
Copy-Item ..\.env.example ..\.env

# Start Backend Server
python run.py
```
*Backend will run at: `http://localhost:8000`*

#### 2. Frontend Setup (in a new PowerShell window)
```powershell
# Navigate to frontend folder
cd "C:\Users\shaisty priya\.gemini\antigravity-ide\scratch\nl2c-compiler\frontend"

# Install npm dependencies
npm install

# Start Vite React development server
npm run dev
```
*Frontend IDE will run at: `http://localhost:3000`*

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Google Gemini API Key (Required for AI generation & error correction)
GEMINI_API_KEY=your_gemini_api_key_here

# Gemini Model Selection
GEMINI_MODEL=gemini-2.5-flash

# Backend & Execution Settings
BACKEND_URL=http://localhost:8000
EXECUTION_TIMEOUT=5
MAX_OUTPUT_SIZE=65536
```

---

## 🧪 Running Automated Tests

Run the backend pytest suite to verify all compiler modules:
```powershell
cd "C:\Users\shaisty priya\.gemini\antigravity-ide\scratch\nl2c-compiler"
python -m pytest tests/
```

---

## 🐳 Docker Deployment (Optional)

To run the full stack inside containers:
```bash
docker-compose up --build
```

---

## 📜 License
Academic Mini-Project for Compiler Design.
