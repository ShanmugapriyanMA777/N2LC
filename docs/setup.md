# Setup Guide - NL2C Compiler

## Prerequisites
- Node.js v18+
- Python 3.10+
- GCC (MinGW-w64 on Windows or gcc on Linux). *Optional; system includes Python C Interpreter fallback.*

## Step-by-Step Installation (Windows PowerShell)

1. Clone or open project root:
   ```powershell
   cd "C:\Users\shaisty priya\.gemini\antigravity-ide\scratch\nl2c-compiler"
   ```

2. Setup Backend:
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

3. Setup Environment Variables:
   Create `.env` in project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

4. Start Backend Server:
   ```powershell
   python run.py
   ```
   Backend runs at: `http://localhost:8000`

5. Setup Frontend (in new terminal):
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`
