import React from 'react';
import { CompileResult } from '../types/compiler';
import { CheckCircle2, XCircle, Terminal, Clock, ShieldCheck } from 'lucide-react';

interface CompilationViewerProps {
  compileRes: CompileResult | null;
  isCompiling: boolean;
}

export const CompilationViewer: React.FC<CompilationViewerProps> = ({ compileRes, isCompiling }) => {
  if (isCompiling) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#52416b] font-mono text-xs gap-3 font-bold bg-white">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[#181028]">Compiling C code with GCC compiler (-Wall -Wextra -std=c11)...</span>
      </div>
    );
  }

  if (!compileRes) {
    return (
      <div className="flex items-center justify-center h-full text-[#6e5d8a] font-mono text-xs font-bold bg-white">
        No compilation output available. Click "Compile & Run" to invoke the GCC compiler.
      </div>
    );
  }

  const isSuccess = compileRes.success;

  return (
    <div className="flex flex-col h-full font-mono text-xs p-4 overflow-auto space-y-4 bg-white text-[#181028]">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#52416b] font-bold">GCC COMPILATION</div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#181028]">
              Status: <span className={isSuccess ? 'text-emerald-700' : 'text-rose-700'}>{isSuccess ? 'PASSED (0 ERRORS)' : 'FAILED'}</span>
            </h3>
            <p className="text-[11px] text-[#423359] font-medium">
              {isSuccess
                ? `Compilation succeeded in ${compileRes.duration}s. Binary executable generated.`
                : 'GCC returned non-zero exit code. Compiler diagnostics captured below.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#faf6ee] border border-[#e8d8be] text-amber-900 font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{compileRes.duration}s</span>
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
            isSuccess ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-rose-100 border-rose-300 text-rose-900'
          }`}>
            {isSuccess ? 'GCC BUILD OK' : 'BUILD FAILED'}
          </span>
        </div>
      </div>

      {/* Compiler Command Card */}
      <div className="bg-[#faf6ee] p-3 rounded-xl border border-[#e8d8be] space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#52416b] font-bold">
          <span className="font-bold flex items-center gap-1.5 text-[#181028]">
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Compiler Command Line</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-300 font-bold">
            GCC C11 Mode
          </span>
        </div>
        <code className="block p-2 bg-white rounded-lg text-amber-900 text-[11px] overflow-x-auto select-all border border-[#e8d8be] font-bold">
          gcc -Wall -Wextra -std=c11 program.c -o program.exe
        </code>
      </div>

      {/* Compiler Output / Errors */}
      {compileRes.stderr && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
            <span>GCC stderr Diagnostics</span>
            <span className="text-[10px] text-[#52416b]">Raw Compiler Output</span>
          </div>
          <pre className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed select-all font-mono font-semibold">
            {compileRes.stderr}
          </pre>
        </div>
      )}

      {compileRes.stdout && (
        <div className="space-y-1.5">
          <div className="text-xs text-[#181028] font-bold">GCC stdout Messages</div>
          <pre className="p-3 bg-[#fcf9f2] border border-[#e8d8be] rounded-xl text-[#181028] text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono font-semibold">
            {compileRes.stdout}
          </pre>
        </div>
      )}

      {!compileRes.stderr && !compileRes.stdout && isSuccess && (
        <div className="p-4 bg-[#faf6ee] border border-[#e8d8be] rounded-xl text-center">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-[#181028] font-bold">Clean Compilation</p>
          <p className="text-[11px] text-[#52416b] mt-0.5 font-medium">Zero compiler warnings or errors reported by GCC.</p>
        </div>
      )}
    </div>
  );
};
