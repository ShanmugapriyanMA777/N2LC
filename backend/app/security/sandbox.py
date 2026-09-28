import os
import sys
import shutil
import tempfile
import subprocess
import time
from typing import Tuple, Dict, Any
from app.config import settings

def find_gcc_path() -> str:
    """
    Locates GCC/Clang executable on Windows or Linux system.
    """
    # 1. Check system PATH
    gcc = shutil.which("gcc") or shutil.which("clang")
    if gcc:
        return gcc

    # 2. Check WinGet LLVM-MinGW installation
    local_app_data = os.getenv("LOCALAPPDATA", "")
    if local_app_data:
        winget_pkg_dir = os.path.join(local_app_data, "Microsoft", "WinGet", "Packages")
        if os.path.exists(winget_pkg_dir):
            for root, dirs, files in os.walk(winget_pkg_dir):
                if "gcc.exe" in files:
                    return os.path.join(root, "gcc.exe")
                if "clang.exe" in files and "bin" in root.lower():
                    return os.path.join(root, "clang.exe")

    # 3. Check common Windows MinGW / MSYS2 / LLVM paths
    windows_paths = [
        r"C:\msys64\ucrt64\bin\gcc.exe",
        r"C:\msys64\mingw64\bin\gcc.exe",
        r"C:\MinGW\bin\gcc.exe",
        r"C:\mingw64\bin\gcc.exe",
        r"C:\TDM-GCC-64\bin\gcc.exe",
        r"C:\Program Files\LLVM\bin\clang.exe",
        r"C:\Program Files\Git\usr\bin\gcc.exe"
    ]
    for path in windows_paths:
        if os.path.exists(path):
            return path

    return ""

def check_gcc_available() -> Tuple[bool, str]:
    gcc_path = find_gcc_path()
    if not gcc_path:
        return False, "GCC compiler was not found on this system. Please install GCC and ensure it is available in PATH."
    try:
        res = subprocess.run([gcc_path, "--version"], capture_output=True, text=True, timeout=3)
        if res.returncode == 0:
            version_line = res.stdout.splitlines()[0] if res.stdout else "GCC detected"
            return True, version_line
        return False, "GCC check failed."
    except Exception as e:
        return False, f"GCC check error: {str(e)}"

class SandboxedGCC:
    def __init__(self, timeout: int = None, max_output_size: int = None):
        self.timeout = timeout or settings.EXECUTION_TIMEOUT
        self.max_output_size = max_output_size or settings.MAX_OUTPUT_SIZE
        self.gcc_path = find_gcc_path()

    def compile_code(self, source_code: str) -> Dict[str, Any]:
        """
        Compiles C source code safely in a temporary directory.
        """
        # Re-check gcc_path if not found initially
        if not self.gcc_path:
            self.gcc_path = find_gcc_path()

        if not self.gcc_path:
            return {
                "success": False,
                "stdout": "",
                "stderr": "GCC compiler was not found on this system. Please install GCC and ensure it is available in PATH.",
                "duration": 0.0,
                "binary_path": ""
            }

        temp_dir = tempfile.mkdtemp(prefix="nl2c_compile_")
        c_file = os.path.join(temp_dir, "program.c")
        exe_file = os.path.join(temp_dir, "program.exe" if sys.platform == "win32" else "program")

        try:
            with open(c_file, "w", encoding="utf-8") as f:
                f.write(source_code)

            start_time = time.time()
            cmd = [self.gcc_path, "-Wall", "-Wextra", "-std=c11", c_file, "-o", exe_file]

            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            duration = time.time() - start_time

            success = proc.returncode == 0
            stdout = proc.stdout[:self.max_output_size]
            stderr = proc.stderr[:self.max_output_size]

            if not success:
                shutil.rmtree(temp_dir, ignore_errors=True)
                temp_dir = None

            return {
                "success": success,
                "stdout": stdout,
                "stderr": stderr,
                "duration": round(duration, 4),
                "binary_path": exe_file if success else "",
                "temp_dir": temp_dir
            }
        except subprocess.TimeoutExpired:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Compilation timed out after {self.timeout} seconds.",
                "duration": float(self.timeout),
                "binary_path": ""
            }
        except Exception as e:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Compilation failed: {str(e)}",
                "duration": 0.0,
                "binary_path": ""
            }


    def execute_code(self, source_code: str, stdin_data: str = "") -> Dict[str, Any]:
        """
        Compiles and executes C source code inside sandboxed environment.
        """
        comp_res = self.compile_code(source_code)
        if not comp_res["success"]:
            return {
                "success": False,
                "stdout": comp_res["stdout"],
                "stderr": comp_res["stderr"],
                "execution_time": comp_res["duration"],
                "exit_code": 1
            }

        exe_file = comp_res["binary_path"]
        temp_dir = comp_res.get("temp_dir")

        try:
            start_time = time.time()
            proc = subprocess.run(
                [exe_file],
                input=stdin_data,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            exec_duration = time.time() - start_time

            stdout = proc.stdout[:self.max_output_size]
            stderr = proc.stderr[:self.max_output_size]

            return {
                "success": proc.returncode == 0,
                "stdout": stdout,
                "stderr": stderr,
                "execution_time": round(exec_duration, 4),
                "exit_code": proc.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution timed out after {self.timeout} seconds.",
                "execution_time": float(self.timeout),
                "exit_code": 124
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Runtime Error: {str(e)}",
                "execution_time": 0.0,
                "exit_code": 1
            }
        finally:
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
