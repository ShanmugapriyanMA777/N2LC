# Security & Sandboxing Architecture

## Security Guarantee
User-submitted C source code is untrusted arbitrary code. To prevent security vulnerabilities or host system damage:

1. **Temporary Directory Isolation**:
   Every compilation and execution takes place in a clean, ephemeral temporary directory created using `tempfile.mkdtemp()`.
2. **Execution Timeout**:
   Executions enforce a strict timeout (default 5 seconds). Subprocesses exceeding this timeout are forcibly terminated using process tree signals (`subprocess.TimeoutExpired`).
3. **API Key Isolation**:
   `GEMINI_API_KEY` is loaded strictly on the backend and is NEVER sent or exposed to the client-side React frontend.
4. **Buffer Size Capping**:
   `stdout` and `stderr` output buffers are capped at 64KB (`MAX_OUTPUT_SIZE`) to prevent memory exhaustion or infinite print loop attacks.
5. **No Shell Execution**:
   GCC compilation uses array-based subprocess invocation (`subprocess.run(["gcc", ...])`) avoiding `shell=True` to prevent command injection vulnerabilities.
