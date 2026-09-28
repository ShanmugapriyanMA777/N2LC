import pytest
from app.services.compiler_service import compiler_service
from app.services.ai_service import ai_service
from app.security.sandbox import SandboxedGCC

def test_factorial_execution():
    code = """#include <stdio.h>
int main() {
    int n = 5;
    long long fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial = %lld\\n", fact);
    return 0;
}"""
    # 1. Lexical
    analysis = compiler_service.analyze_c_code(code)
    assert len(analysis["tokens"]) > 10
    # 2. Syntax
    assert analysis["syntax"]["valid"] is True
    # 3. Semantic
    assert analysis["semantic"]["valid"] is True
    # 4. Symbol table
    assert any(s["name"] == "fact" for s in analysis["symbols"])
    # 5. Compile & Execute
    res = compiler_service.execute_c_code(code)
    assert res["success"] is True
    assert "Factorial = 120" in res["stdout"]

def test_largest_of_three():
    code = """#include <stdio.h>
int main() {
    int a = 10, b = 25, c = 17;
    int largest;
    if (a >= b && a >= c) largest = a;
    else if (b >= a && b >= c) largest = b;
    else largest = c;
    printf("Largest = %d\\n", largest);
    return 0;
}"""
    res = compiler_service.execute_c_code(code)
    assert res["success"] is True
    assert "Largest = 25" in res["stdout"]

def test_prime_check():
    code = """#include <stdio.h>
int main() {
    int n = 7;
    int is_prime = 1;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) { is_prime = 0; break; }
    }
    if (is_prime) printf("Prime\\n");
    else printf("Not Prime\\n");
    return 0;
}"""
    res = compiler_service.execute_c_code(code)
    assert res["success"] is True
    assert "Prime" in res["stdout"]

def test_syntax_error_detection():
    # Missing semicolon
    broken_code = """#include <stdio.h>
int main() {
    int n = 5
    printf("%d", n);
    return 0;
}"""
    analysis = compiler_service.analyze_c_code(broken_code)
    assert analysis["syntax"]["valid"] is False
    assert len(analysis["syntax"]["errors"]) > 0

    comp = compiler_service.compile_c_code(broken_code)
    assert comp["success"] is False
    assert "error" in comp["stderr"].lower() or "error" in comp["stdout"].lower()

def test_semantic_error_undeclared_variable():
    code = """#include <stdio.h>
int main() {
    x = 10;
    return 0;
}"""
    analysis = compiler_service.analyze_c_code(code)
    assert analysis["semantic"]["valid"] is False
    assert any("not declared" in err["message"] for err in analysis["semantic"]["errors"])

def test_execution_timeout():
    # Program with infinite loop
    loop_code = """#include <stdio.h>
int main() {
    while(1) {
    }
    return 0;
}"""
    # Use sandbox with 2 second timeout
    sandbox = SandboxedGCC(timeout=2)
    res = sandbox.execute_code(loop_code)
    assert res["success"] is False
    assert "timed out" in res["stderr"].lower()

def test_ai_error_correction_flow():
    broken_code = """#include <stdio.h>
int main() {
    int n = 5
    printf("%d\\n", n);
    return 0;
}"""
    comp = compiler_service.compile_c_code(broken_code)
    assert comp["success"] is False

    err_msg = comp["stderr"] or comp["stdout"]
    fixed_code, expl, diff = ai_service.fix_c_code(broken_code, err_msg)
    assert fixed_code != ""
    assert ";" in fixed_code

    # Re-compile corrected code
    recomp = compiler_service.compile_c_code(fixed_code)
    assert recomp["success"] is True
