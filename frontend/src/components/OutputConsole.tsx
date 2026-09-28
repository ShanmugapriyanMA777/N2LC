import React from 'react';
import { CompileResult, ExecuteResult } from '../types/compiler';
import { Terminal, Play, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface OutputConsoleProps {
  compileRes: CompileResult | null;
  execRes: ExecuteResult | null;
  stdin: string;
  setStdin: (val: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  onClearOutput: () => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  compileRes,
  execRes,
  stdin,
  setStdin,
  onExecute,
  isExecuting,
  onClearOutput,
}) => {
  return (
    <div className="flex flex-col h-full font-mono text-xs bg-white text-[#181028]">
      {/* Console Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#faf6ee] border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">PROGRAM INPUT & OUTPUT CONSOLE</span>
          {execRes && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              execRes.success ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}>
              Exit Code: {execRes.exit_code} ({execRes.execution_time}s)
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              isExecuting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold hover:from-amber-600 hover:to-yellow-600 border border-amber-500 shadow-sm'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Running...' : 'Run Program'}</span>
          </button>

          <button
            onClick={onClearOutput}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-[#3d2e5a] hover:text-amber-900 border border-[#e8d8be] font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#fdfbf7] overflow-hidden">
        {/* Left Input Pane: Program Stdin */}
        <div className="flex flex-col bg-white rounded-xl border border-[#e8d8be] p-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ebdcc5] text-amber-900 font-bold text-[11px]">
            <span>PROGRAM INPUT (STDIN)</span>
            <span className="text-[10px] text-[#6e5d8a] font-medium">Space / newline separated</span>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter values to pass to scanf...&#10;Example:&#10;10&#10;20&#10;15"
            className="w-full flex-1 bg-[#faf6ee] border border-[#e8d8be] rounded-lg p-2.5 text-xs text-[#181028] placeholder-[#7d6c93] font-mono resize-none focus:outline-none focus:border-amber-500 font-semibold"
          />
        </div>

        {/* Right Terminal Log Pane */}
        <div className="md:col-span-2 flex flex-col bg-white rounded-xl border border-[#e8d8be] p-3 font-mono text-xs overflow-auto shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ebdcc5] text-amber-900 font-bold text-[11px]">
            <span>TERMINAL OUTPUT</span>
            <span className="text-emerald-700 flex items-center gap-1 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active Terminal
            </span>
          </div>

          <div className="flex-1 overflow-auto space-y-2 text-[#181028]">
            <div className="text-violet-900 font-bold">$ gcc program.c -Wall -Wextra -std=c11 -o program</div>

            {compileRes && (
              <div className={`p-2 rounded border text-[11px] ${
                compileRes.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                {compileRes.success ? (
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Compilation successful in {compileRes.duration}s. Executable generated.</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-800">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>GCC Compilation Failed:</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-rose-900 text-[11px] font-semibold">{compileRes.stderr || compileRes.stdout}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="text-violet-900 font-bold">$ ./program</div>

            {stdin.trim() && (
              <div className="text-amber-800 font-mono text-[11px] font-bold">
                INPUT PRELOADED: <span className="text-[#181028]">{stdin}</span>
              </div>
            )}

            {execRes ? (
              <div className="mt-2 space-y-1">
                {execRes.stdout && (
                  <div>
                    <span className="text-amber-900 font-extrabold block text-[10px] tracking-wide">PROGRAM STDOUT:</span>
                    <pre className="p-3 bg-[#faf6ee] rounded-lg border border-[#e8d8be] text-[#181028] whitespace-pre-wrap font-mono font-bold leading-relaxed text-sm shadow-inner">
                      {execRes.stdout}
                    </pre>
                  </div>
                )}

                {execRes.stderr && (
                  <div>
                    <span className="text-rose-800 font-bold block text-[10px]">PROGRAM STDERR:</span>
                    <pre className="p-2 bg-rose-50 rounded-lg border border-rose-300 text-rose-900 whitespace-pre-wrap font-mono text-xs font-semibold">
                      {execRes.stderr}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[#6e5d8a] italic py-4 font-bold">
                Click [Run Program] or [Compile & Run] to execute and view stdout output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
