# API Reference Specification

## Endpoints

### 1. POST /api/generate
- **Input**: `{ "prompt": "Write a C program to calculate factorial" }`
- **Output**: `{ "code": "...", "explanation": "...", "status": "success" }`

### 2. POST /api/analyze
- **Input**: `{ "code": "#include <stdio.h>\nint main() { return 0; }" }`
- **Output**: `{ "tokens": [...], "syntax": {...}, "semantic": {...}, "symbols": [...], "ast": {...}, "ir": [...] }`

### 3. POST /api/compile
- **Input**: `{ "code": "..." }`
- **Output**: `{ "success": true, "stdout": "", "stderr": "", "duration": 0.02 }`

### 4. POST /api/execute
- **Input**: `{ "code": "...", "stdin": "10 20" }`
- **Output**: `{ "success": true, "stdout": "...", "stderr": "", "execution_time": 0.01, "exit_code": 0 }`

### 5. POST /api/fix
- **Input**: `{ "code": "...", "error": "Missing semicolon" }`
- **Output**: `{ "corrected_code": "...", "explanation": "...", "diff_summary": "..." }`

### 6. GET /api/health
- **Output**: `{ "ai_status": "Connected", "gcc_status": "Available", "python_status": "Available", "backend_status": "Running", "version": "1.0.0" }`
