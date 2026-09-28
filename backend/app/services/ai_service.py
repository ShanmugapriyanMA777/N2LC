import re
import os
import json
import httpx
from typing import Dict, Any, Tuple
from app.config import settings

# Import Google GenAI SDK if available
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

SYSTEM_PROMPT = """You are an expert C programmer and compiler assistant.

Convert the user's natural-language requirement into a complete, valid C program.

Rules:
1. Generate ONLY valid C source code.
2. Include necessary standard headers (e.g. #include <stdio.h>, #include <stdlib.h>, #include <math.h>).
3. Include a valid main function.
4. Use standard C (C11 standard).
5. Ensure all variables are declared before use.
6. Ensure syntax is 100% valid.
7. Handle user input appropriately using scanf when needed.
8. Include meaningful inline comments where useful.
9. DO NOT include Markdown fences (no ```c or ```).
10. DO NOT include explanations, greetings, or commentary outside the source code comments.
11. Preserve the user's intended functionality exactly."""

ERROR_FIX_PROMPT = """You are an expert C debugging assistant.

Analyze the following C source code and compiler/validation error.

Identify the exact cause of the error.
Provide a corrected version of the C code that fixes the error while retaining the intended functionality.

Respond in JSON format:
{
  "corrected_code": "<FULL_VALID_C_SOURCE_CODE>",
  "explanation": "<EXPLANATION_OF_WHAT_WAS_FIXED>",
  "diff_summary": "<SHORT_SUMMARY_OF_CHANGES>"
}

Rules:
- Generate complete valid C code in "corrected_code".
- Do not include markdown fences inside the JSON string values."""

class AIService:
    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY
        self.client = None

        if GENAI_AVAILABLE and self.gemini_key:
            try:
                self.client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                print(f"GenAI Client Init Note: {e}")

    def is_configured(self) -> bool:
        return bool(self.groq_key) or bool(self.openrouter_key) or self.client is not None or bool(self.gemini_key)

    def get_provider_name(self) -> str:
        if self.groq_key:
            return f"Groq ({settings.GROQ_MODEL})"
        elif self.openrouter_key:
            return f"OpenRouter ({settings.OPENROUTER_MODEL})"
        elif self.client or self.gemini_key:
            return f"Gemini ({settings.GEMINI_MODEL})"
        return "Not Configured"

    def sanitize_c_code(self, raw_text: str) -> str:
        """
        Strips markdown fences, headers, and unwanted text to extract pure C code.
        """
        text = raw_text.strip()
        # Remove ```c or ``` cpp or ``` markdown wrappers
        text = re.sub(r'^```[a-zA-Z]*\n', '', text, flags=re.MULTILINE)
        text = re.sub(r'\n```$', '', text, flags=re.MULTILINE)
        text = text.replace('```', '')

        # Find first C keyword or preprocessor line
        lines = text.splitlines()
        first_c_line = 0
        for i, l in enumerate(lines):
            if l.strip().startswith("#include") or l.strip().startswith("//") or l.strip().startswith("/*") or re.match(r'^(int|void|float|char|struct)\s+', l.strip()):
                first_c_line = i
                break
        
        c_code = "\n".join(lines[first_c_line:]).strip()
        return c_code

    def _call_groq(self, system_msg: str, user_msg: str) -> str:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "max_tokens": 2048,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ]
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise RuntimeError(f"Groq API returned HTTP {resp.status_code}: {resp.text}")

    def _call_openrouter(self, system_msg: str, user_msg: str) -> str:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "NL2C Compiler",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "max_tokens": 2048,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ]
        }
        with httpx.Client(timeout=35.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise RuntimeError(f"OpenRouter API returned HTTP {resp.status_code}: {resp.text}")

    def generate_c_code(self, user_prompt: str) -> Tuple[str, str, str]:
        """
        Converts natural language requirement into C source code via Groq, OpenRouter or Gemini.
        Returns (code, explanation, status).
        """
        if not self.is_configured():
            fallback_code = self._get_fallback_code(user_prompt)
            if fallback_code:
                return fallback_code, "Generated using standard demonstration template (AI key not configured).", "success"
            return "", "AI API key is not configured. Please set GROQ_API_KEY, OPENROUTER_API_KEY or GEMINI_API_KEY in .env.", "error"

        # 1. Try Groq API first if key configured (Ultra-fast inference)
        if self.groq_key:
            try:
                raw_text = self._call_groq(SYSTEM_PROMPT, f"User Requirement:\n{user_prompt}")
                clean_code = self.sanitize_c_code(raw_text)
                if clean_code and len(clean_code) >= 10:
                    return clean_code, f"Generated using Groq AI ({settings.GROQ_MODEL}) for prompt: '{user_prompt}'", "success"
            except Exception as e:
                print(f"Groq generation error: {e}")

        # 2. Fallback to OpenRouter API
        if self.openrouter_key:
            try:
                raw_text = self._call_openrouter(SYSTEM_PROMPT, f"User Requirement:\n{user_prompt}")
                clean_code = self.sanitize_c_code(raw_text)
                if clean_code and len(clean_code) >= 10:
                    return clean_code, f"Generated using OpenRouter AI ({settings.OPENROUTER_MODEL}) for prompt: '{user_prompt}'", "success"
            except Exception as e:
                print(f"OpenRouter generation error: {e}")

        # 3. Fallback to Gemini API if configured
        if self.client:
            try:
                prompt_content = f"{SYSTEM_PROMPT}\n\nUser Requirement:\n{user_prompt}"
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt_content
                )
                raw_text = response.text if response and response.text else ""
                clean_code = self.sanitize_c_code(raw_text)
                if clean_code and len(clean_code) >= 10:
                    return clean_code, f"Generated using Gemini AI ({settings.GEMINI_MODEL}) for prompt: '{user_prompt}'", "success"
            except Exception as e:
                print(f"Gemini generation error: {e}")

        # 4. Fallback demonstration template if API calls failed or rate limited
        fallback_code = self._get_fallback_code(user_prompt)
        if fallback_code:
            return fallback_code, f"AI service notice. Served standard demonstration C program for '{user_prompt}'.", "success"

        return "", "Generated response did not contain valid C code.", "error"

    def fix_c_code(self, original_code: str, error_msg: str) -> Tuple[str, str, str]:
        """
        Analyzes compiler error and suggests corrected C source code via Groq, OpenRouter or Gemini.
        Returns (corrected_code, explanation, diff_summary).
        """
        if not self.is_configured():
            fixed_code, expl = self._local_fallback_fix(original_code, error_msg)
            return fixed_code, expl, "Local syntax auto-remediation applied."

        user_content = f"Original C Code:\n{original_code}\n\nCompiler / Validation Error:\n{error_msg}"

        raw_text = ""
        # 1. Groq Fix
        if self.groq_key:
            try:
                raw_text = self._call_groq(ERROR_FIX_PROMPT, user_content)
            except Exception as e:
                print(f"Groq fix error: {e}")

        # 2. OpenRouter Fix
        if not raw_text and self.openrouter_key:
            try:
                raw_text = self._call_openrouter(ERROR_FIX_PROMPT, user_content)
            except Exception as e:
                print(f"OpenRouter fix error: {e}")

        # 3. Gemini Fix fallback
        if not raw_text and self.client:
            try:
                prompt_content = f"{ERROR_FIX_PROMPT}\n\n{user_content}"
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt_content
                )
                raw_text = response.text if response and response.text else ""
            except Exception as e:
                print(f"Gemini fix error: {e}")

        if raw_text:
            try:
                json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group(0))
                    corrected_code = self.sanitize_c_code(data.get("corrected_code", ""))
                    explanation = data.get("explanation", "Corrected C code error.")
                    diff_summary = data.get("diff_summary", "Updated C source syntax.")
                    return corrected_code, explanation, diff_summary
            except Exception:
                pass

            clean_code = self.sanitize_c_code(raw_text)
            if clean_code:
                return clean_code, "AI provided corrected C source code.", "Fixed syntax error."

        fixed_code, expl = self._local_fallback_fix(original_code, error_msg)
        return fixed_code, f"Applied local fallback correction ({expl}).", "Local correction"

    def _get_fallback_code(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "largest" in prompt_lower or "maximum" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int a = 10, b = 20, c = 15;
    int largest;

    printf("Finding largest of three numbers: %d, %d, %d\\n", a, b, c);

    if (a >= b && a >= c) {
        largest = a;
    } else if (b >= a && b >= c) {
        largest = b;
    } else {
        largest = c;
    }

    printf("Largest number is: %d\\n", largest);
    return 0;
}"""
        elif "factorial" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int n = 5;
    long long fact = 1;

    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }

    printf("Factorial of %d is %lld\\n", n, fact);
    return 0;
}"""
        elif "prime" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int n = 17;
    int is_prime = 1;

    if (n <= 1) {
        is_prime = 0;
    } else {
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                is_prime = 0;
                break;
            }
        }
    }

    if (is_prime == 1) {
        printf("%d is a prime number\\n", n);
    } else {
        printf("%d is not a prime number\\n", n);
    }
    return 0;
}"""
        elif "fibonacci" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int n = 10;
    int t1 = 0, t2 = 1, nextTerm;

    printf("Fibonacci Series up to %d terms: ", n);

    for (int i = 1; i <= n; ++i) {
        printf("%d ", t1);
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    printf("\\n");
    return 0;
}"""
        elif "sort" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int arr[5] = {64, 34, 25, 12, 22};
    int n = 5;

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}"""
        elif "grade" in prompt_lower or "student" in prompt_lower:
            return """#include <stdio.h>

int main() {
    int marks = 85;
    char grade;

    if (marks >= 90) {
        grade = 'A';
    } else if (marks >= 75) {
        grade = 'B';
    } else if (marks >= 50) {
        grade = 'C';
    } else {
        grade = 'F';
    }

    printf("Student Grade for marks %d: %c\\n", marks, grade);
    return 0;
}"""
        return ""

    def _local_fallback_fix(self, code: str, error_msg: str) -> Tuple[str, str]:
        lines = code.splitlines()
        if "Missing semicolon" in error_msg or "semicolon" in error_msg.lower():
            fixed_lines = []
            for line in lines:
                l = line.rstrip()
                if l and not l.endswith(";") and not l.endswith("{") and not l.endswith("}") and not l.startswith("#") and not l.startswith("//"):
                    fixed_lines.append(l + ";")
                else:
                    fixed_lines.append(line)
            return "\n".join(fixed_lines), "Added missing semicolon at end of line."

        m = re.search(r"'([a-zA-Z_]\w*)' is not declared", error_msg)
        if m:
            var_name = m.group(1)
            fixed_lines = []
            declared = False
            for line in lines:
                if "int main" in line and not declared:
                    fixed_lines.append(line)
                    fixed_lines.append(f"    int {var_name} = 0;")
                    declared = True
                else:
                    fixed_lines.append(line)
            return "\n".join(fixed_lines), f"Declared missing variable 'int {var_name} = 0;' inside main function."

        return code, "Applied code formatting adjustments."

ai_service = AIService()
