import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Check, Download, Trash2, HelpCircle, CornerDownLeft, Sparkles, Cpu, Layers } from 'lucide-react';
import { AnalyzeResult, CompileResult, ExecuteResult } from '../types/compiler';
import { apiService } from '../services/api';

interface InteractiveTerminalProps {
  code: string;
  setCode: (code: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  analysis: AnalyzeResult | null;
  compileRes: CompileResult | null;
  execRes: ExecuteResult | null;
  stdin: string;
  setStdin: (val: string) => void;
  onCompileAndRun: () => Promise<void>;
  onAnalyze: (targetCode?: string) => Promise<void>;
  onFix: () => Promise<void>;
  onGenerate: () => Promise<void>;
  isCompiling: boolean;
  isExecuting: boolean;
  isGenerating: boolean;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'system';
  content: string;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  code,
  setCode,
  prompt,
  setPrompt,
  analysis,
  compileRes,
  execRes,
  stdin,
  setStdin,
  onCompileAndRun,
  onAnalyze,
  onFix,
  onGenerate,
  isCompiling,
  isExecuting,
  isGenerating
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      content: 'NL2C Interactive Compiler Shell v1.0.0 [x86_64 GCC Sandbox / AI Engine]'
    },
    {
      id: 'init-2',
      type: 'info',
      content: 'Type "help" for a list of commands, or "run" to compile and execute program.c.'
    }
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Sync execution outputs when execRes changes
  useEffect(() => {
    if (execRes) {
      if (execRes.stdout) {
        setLines(prev => [
          ...prev,
          { id: Math.random().toString(), type: 'success', content: `[STDOUT]\n${execRes.stdout}` }
        ]);
      }
      if (execRes.stderr) {
        setLines(prev => [
          ...prev,
          { id: Math.random().toString(), type: 'error', content: `[STDERR]\n${execRes.stderr}` }
        ]);
      }
    }
  }, [execRes]);

  const appendLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { id: Math.random().toString(), type, content }]);
  };

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add to history
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    // Echo input
    appendLine('input', `$ ${trimmed}`);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
        appendLine(
          'info',
          `Available CLI Commands:
  run [input]           - Compile & execute program.c (optional stdin args)
  gcc [options]         - Run GCC compiler pipeline check
  stdin <value>         - Set or display preloaded stdin input buffer
  generate <prompt>     - Generate C code using AI (e.g. generate fibonacci)
  fix                   - Run AI Error Correction on current compiler errors
  analyze               - Run 7-stage compiler lexical & semantic analyzer
  cat / code            - Print active C source code
  tokens                - Display lexical token stream count and types
  symbols               - Display active Symbol Table entries
  ast                   - Print AST summary
  ir / tac              - Print Three-Address Code (Intermediate Representation)
  health / status       - Inspect backend AI & GCC health status
  clear / cls           - Clear terminal screen
  echo <text>           - Echo text to console
  date                  - Display current system timestamp`
        );
        break;

      case 'run':
      case './program':
        if (args) {
          setStdin(args);
          appendLine('info', `Preloading stdin: "${args}"`);
        }
        appendLine('info', 'Compiling and executing program.c with GCC...');
        try {
          await onCompileAndRun();
        } catch (err: any) {
          appendLine('error', `Execution failed: ${err.message}`);
        }
        break;

      case 'gcc':
      case 'compile':
        appendLine('info', `Running: gcc ${args || '-Wall -Wextra -std=c11 program.c -o program'}`);
        try {
          const res = await apiService.compileCode(code);
          if (res.success) {
            appendLine('success', `GCC Build PASSED in ${res.duration}s. Binary executable created.`);
            if (res.stdout) appendLine('info', res.stdout);
          } else {
            appendLine('error', `GCC Build FAILED:\n${res.stderr || res.stdout}`);
          }
        } catch (err: any) {
          appendLine('error', `Compiler error: ${err.message}`);
        }
        break;

      case 'stdin':
        if (!args) {
          appendLine('info', `Current STDIN buffer: "${stdin}"`);
        } else {
          setStdin(args);
          appendLine('success', `Updated STDIN buffer to: "${args}"`);
        }
        break;

      case 'generate':
      case 'gen':
        if (!args) {
          appendLine('error', 'Usage: generate <requirement prompt> (e.g. generate bubble sort in C)');
        } else {
          setPrompt(args);
          appendLine('info', `Requesting AI synthesis for: "${args}"...`);
          try {
            const res = await apiService.generateCode(args);
            if (res.code) {
              setCode(res.code);
              appendLine('success', 'Generated new C source code successfully into editor!');
              await onAnalyze(res.code);
            } else {
              appendLine('error', 'AI returned empty code.');
            }
          } catch (err: any) {
            appendLine('error', `Generation error: ${err.message}`);
          }
        }
        break;

      case 'fix':
        appendLine('info', 'Invoking AI Debugger on compiler diagnostics...');
        try {
          await onFix();
          appendLine('success', 'AI error diagnosis applied.');
        } catch (err: any) {
          appendLine('error', `AI Fix error: ${err.message}`);
        }
        break;

      case 'analyze':
        appendLine('info', 'Running 7-stage compiler pipeline analysis...');
        try {
          const res = await apiService.analyzeCode(code);
          appendLine(
            res.syntax.valid && res.semantic.valid ? 'success' : 'error',
            `Analysis Complete:
  Tokens: ${res.tokens.length}
  Syntax: ${res.syntax.valid ? 'PASSED (Valid)' : `FAILED (${res.syntax.errors.length} errors)`}
  Semantic: ${res.semantic.valid ? 'PASSED (Valid)' : `FAILED (${res.semantic.errors.length} errors)`}
  Symbols: ${res.symbols.length} identifiers
  Three-Address Code: ${res.ir.length} instructions`
          );
        } catch (err: any) {
          appendLine('error', `Analysis error: ${err.message}`);
        }
        break;

      case 'cat':
      case 'code':
        appendLine('info', `--- program.c ---\n${code}\n-----------------`);
        break;

      case 'tokens':
        if (analysis?.tokens) {
          const summary = analysis.tokens
            .slice(0, 30)
            .map(t => `[${t.token_type}] "${t.value || t.lexeme}" (Line ${t.line})`)
            .join('\n');
          appendLine('info', `Token Stream (${analysis.tokens.length} total, displaying first 30):\n${summary}`);
        } else {
          appendLine('info', 'No tokens available. Run "analyze" first.');
        }
        break;

      case 'symbols':
        if (analysis?.symbols) {
          const symStr = analysis.symbols
            .map(s => `${s.name} (${s.kind}, ${s.type}) -> Scope: ${s.scope}`)
            .join('\n');
          appendLine('info', `Symbol Table (${analysis.symbols.length} entries):\n${symStr || '(empty)'}`);
        } else {
          appendLine('info', 'Symbol table empty. Run "analyze" first.');
        }
        break;

      case 'ir':
      case 'tac':
        if (analysis?.ir) {
          const irStr = analysis.ir.map(i => `[${i.index}] ${i.statement || (i.result ? `${i.result} = ${i.arg1 || ''} ${i.op} ${i.arg2 || ''}` : i.op)}`).join('\n');
          appendLine('info', `Three-Address Code (TAC):\n${irStr || '(No TAC instructions generated)'}`);
        } else {
          appendLine('info', 'No IR available. Run "analyze" first.');
        }
        break;

      case 'ast':
        if (analysis?.ast) {
          appendLine('info', `AST Root: ${analysis.ast.label || analysis.ast.type} (${analysis.ast.type})\nChildren: ${analysis.ast.children?.length || 0} nodes`);
        } else {
          appendLine('info', 'No AST available. Run "analyze" first.');
        }
        break;

      case 'health':
      case 'status':
        try {
          const h = await apiService.checkHealth();
          appendLine(
            'success',
            `System Health Status:
  AI Service: ${h.ai_status}
  GCC Compiler: ${h.gcc_status}
  Python Runtime: ${h.python_status}
  Backend Status: ${h.backend_status}
  Version: ${h.version}`
          );
        } catch (err: any) {
          appendLine('error', `Health check error: ${err.message}`);
        }
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        break;

      case 'echo':
        appendLine('output', args);
        break;

      case 'date':
        appendLine('info', new Date().toString());
        break;

      default:
        appendLine('error', `Command not recognized: "${cmd}". Type "help" to view all available commands.`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx]);
        } else {
          setHistoryIdx(-1);
          setInputVal('');
        }
      }
    }
  };

  const handleCopyAll = () => {
    const text = lines.map(l => l.content).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = lines.map(l => l.content).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nl2c_terminal_output_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#120f1d] text-[#e8e4f0] font-mono text-xs select-text">
      {/* Terminal Top Control Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1b172a] border-b border-[#2d2644] text-[11px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[#a49ab9] font-bold tracking-wider ml-2 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-amber-400" />
            NL2C CLI TERMINAL
          </span>
          <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
            Interactive
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleCommand('run')}
            disabled={isCompiling || isExecuting}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition shadow-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isCompiling || isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleCopyAll}
            title="Copy all terminal output"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2a2340] hover:bg-[#382f55] text-[#d6cfe6] border border-[#3e345c] text-[11px] font-semibold transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            title="Download terminal output as .txt"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2a2340] hover:bg-[#382f55] text-[#d6cfe6] border border-[#3e345c] text-[11px] font-semibold transition"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setLines([])}
            title="Clear terminal"
            className="p-1 rounded bg-[#2a2340] hover:bg-[#382f55] text-[#a49ab9] hover:text-white border border-[#3e345c] transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div
        className="flex-1 p-3.5 overflow-y-auto space-y-1.5 font-mono text-xs leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l) => {
          if (l.type === 'input') {
            return (
              <div key={l.id} className="text-amber-300 font-bold flex items-start gap-1">
                <span>{l.content}</span>
              </div>
            );
          }
          if (l.type === 'system') {
            return (
              <div key={l.id} className="text-violet-300 font-extrabold pb-0.5 border-b border-violet-900/40">
                {l.content}
              </div>
            );
          }
          if (l.type === 'success') {
            return (
              <div key={l.id} className="text-emerald-400 whitespace-pre-wrap font-semibold">
                {l.content}
              </div>
            );
          }
          if (l.type === 'error') {
            return (
              <div key={l.id} className="text-rose-400 whitespace-pre-wrap font-semibold">
                {l.content}
              </div>
            );
          }
          if (l.type === 'info') {
            return (
              <div key={l.id} className="text-[#a89cb9] whitespace-pre-wrap">
                {l.content}
              </div>
            );
          }
          return (
            <div key={l.id} className="text-slate-100 whitespace-pre-wrap">
              {l.content}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Interactive Command Input Line */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#171324] border-t border-[#2d2644]">
        <span className="text-emerald-400 font-bold select-none">nl2c@compiler:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. run, gcc, analyze, generate, help)..."
          className="flex-1 bg-transparent text-amber-200 placeholder-[#5f5478] focus:outline-none font-mono text-xs"
          autoFocus
        />
        <button
          onClick={() => {
            handleCommand(inputVal);
            setInputVal('');
          }}
          className="p-1 rounded bg-[#2a2340] hover:bg-amber-500 hover:text-black text-[#a49ab9] transition"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InteractiveTerminal;
