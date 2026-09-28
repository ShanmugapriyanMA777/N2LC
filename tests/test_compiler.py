from app.services.compiler_service import compiler_service

def test_full_pipeline_analysis():
    code = """#include <stdio.h>
    int main() {
        int a = 10;
        int b = 20;
        int sum = a + b;
        printf("Sum: %d\\n", sum);
        return 0;
    }"""

    res = compiler_service.analyze_c_code(code)
    assert len(res["tokens"]) > 0
    assert res["syntax"]["valid"] is True
    assert res["semantic"]["valid"] is True
    assert res["ast"]["type"] == "Program"
    assert len(res["symbols"]) >= 4
    assert len(res["ir"]) > 0

def test_c_execution():
    code = """#include <stdio.h>
    int main() {
        int a = 15;
        int b = 25;
        printf("Result: %d", a + b);
        return 0;
    }"""

    exec_res = compiler_service.execute_c_code(code)
    assert exec_res["success"] is True
    assert "Result: 40" in exec_res["stdout"]
