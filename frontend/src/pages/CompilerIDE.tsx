import React, { useState, useEffect } from 'react';
import { RequirementInput } from '../components/RequirementInput';
import { CodeEditor } from '../components/CodeEditor';
import { RightPipelinePanel } from '../components/RightPipelinePanel';
import { TokenTable } from '../components/TokenTable';
import { SyntaxReport } from '../components/SyntaxReport';
import { SemanticReport } from '../components/SemanticReport';
import { SymbolTableViewer } from '../components/SymbolTableViewer';
import { CompilationViewer } from '../components/CompilationViewer';
import { OutputConsole } from '../components/OutputConsole';
import { InteractiveTerminal } from '../components/InteractiveTerminal';
import { AIDiffViewer } from '../components/AIDiffViewer';
import { LogsViewer, LogEntry } from '../components/LogsViewer';
import { ASTViewer } from '../components/ASTViewer';
import { IRViewer } from '../components/IRViewer';
import { OptimizationViewer } from '../components/OptimizationViewer';
import { apiService } from '../services/api';
import { AnalyzeResult, CompileResult, ExecuteResult } from '../types/compiler';
import {
  Layers,
  FileCheck2,
  AlertTriangle,
  Table,
  Cpu,
  Terminal,
  Bot,
  ListOrdered,
  GitCommit,
  Binary,
  Zap
} from 'lucide-react';

const DEFAULT_STARTER_CODE = `#include <stdio.h>

int main() {
    int n = 5;
    long long fact = 1;

    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }

    printf("Factorial of %d = %lld\\n", n, fact);
    return 0;
}`;

export const CompilerIDE: React.FC = () => {
  const [prompt, setPrompt] = useState('Write a C program to calculate factorial of a number.');
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [stdin, setStdin] = useState('5');
  const [activeBottomTab, setActiveBottomTab] = useState<string>('cli');

  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [compileRes, setCompileRes] = useState<CompileResult | null>(null);
  const [execRes, setExecRes] = useState<ExecuteResult | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // AI Fix state
  const [aiFixData, setAiFixData] = useState<{ corrected_code: string; explanation: string; diff_summary: string } | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'NL2C Compiler IDE initialized. System ready.'
    }
  ]);

  const addLog = (level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR', message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, level, message }]);
  };

  // Run initial analysis on mount
  useEffect(() => {
    handleAnalyze(DEFAULT_STARTER_CODE, true);
  }, []);

  // 1. Generate C Code via Generative AI
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    addLog('INFO', 'Request received');
    addLog('INFO', `Processing requirement: "${prompt.trim()}"`);
    addLog('INFO', 'Sending request to AI provider...');

    try {
      const res = await apiService.generateCode(prompt);
      if (res.code) {
        setCode(res.code);
        addLog('SUCCESS', 'C code generated successfully');
        // Automatically analyze the newly synthesized code
        handleAnalyze(res.code);
      } else {
        addLog('WARN', 'AI generation returned empty code');
      }
    } catch (err: any) {
      addLog('ERROR', `Code generation error: ${err.message}`);
      alert(`Code Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Analyze Compiler Pipeline (Lexical, Syntax, Semantic, Symbol Table, AST, TAC, Optimization)
  const handleAnalyze = async (targetCode?: string, isSilent = false) => {
    const codeToAnalyze = targetCode || code;
    if (!codeToAnalyze.trim()) return;
    setIsAnalyzing(true);

    if (!isSilent) {
      addLog('INFO', 'Lexical analysis started');
      addLog('INFO', 'Syntax analysis started');
      addLog('INFO', 'Semantic analysis started');
    }

    try {
      const res = await apiService.analyzeCode(codeToAnalyze);
      setAnalysis(res);

      if (!isSilent) {
        addLog(
          res.syntax.valid && res.semantic.valid ? 'SUCCESS' : 'WARN',
          `Analysis finished: ${res.tokens.length} tokens, Syntax: ${
            res.syntax.valid ? 'PASSED' : 'FAILED'
          }, Semantic: ${res.semantic.valid ? 'PASSED' : 'FAILED'}`
        );
      }
    } catch (err: any) {
      addLog('ERROR', `Analysis error: ${err.message}`);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Compile & Run with GCC
  const handleCompileAndRun = async () => {
    if (!code.trim()) return;
    setIsCompiling(true);
    setIsExecuting(true);
    setErrorMessage('');
    addLog('INFO', 'GCC compilation started: gcc -Wall -Wextra -std=c11 program.c -o program.exe');

    try {
      // Step A: Pipeline Analysis
      const anaRes = await apiService.analyzeCode(code);
      setAnalysis(anaRes);

      // Step B: GCC Compilation
      const compRes = await apiService.compileCode(code);
      setCompileRes(compRes);

      if (!compRes.success) {
        const errText = compRes.stderr || compRes.stdout || 'Compilation failed';
        setErrorMessage(errText);
        addLog('ERROR', `GCC compilation failed: ${errText.split('\n')[0]}`);
        addLog('INFO', 'AI Error Correction ready. Switch to AI Correction tab or click Fix Errors with AI.');
        setActiveBottomTab('compilation');
        setIsExecuting(false);
        return;
      }

      addLog('SUCCESS', `GCC compilation PASSED (${compRes.duration}s). Binary generated.`);
      addLog('INFO', `Execution started with stdin: "${stdin}"`);

      // Step C: Execution
      const runRes = await apiService.executeCode(code, stdin);
      setExecRes(runRes);

      if (runRes.success) {
        addLog('SUCCESS', `Execution completed with return code ${runRes.exit_code} (${runRes.execution_time}s)`);
        addLog('SUCCESS', 'Pipeline completed successfully');
        setActiveBottomTab('cli');
      } else {
        addLog('ERROR', `Runtime error / timeout: ${runRes.stderr}`);
        setActiveBottomTab('cli');
      }
    } catch (err: any) {
      addLog('ERROR', `Pipeline error: ${err.message}`);
      setErrorMessage(err.message);
      setActiveBottomTab('cli');
    } finally {
      setIsCompiling(false);
      setIsExecuting(false);
    }
  };

  // 4. Request AI Fix
  const handleRequestFix = async () => {
    if (!code.trim()) return;
    setIsFixing(true);
    const targetError =
      errorMessage ||
      (compileRes && !compileRes.success ? compileRes.stderr : '') ||
      (analysis && !analysis.syntax.valid ? analysis.syntax.errors[0]?.message : '') ||
      (analysis && !analysis.semantic.valid ? analysis.semantic.errors[0]?.message : 'Please check for syntax or semantic errors and correct them.');

    addLog('INFO', `Diagnosing code and requesting AI fix for: "${targetError.slice(0, 80)}..."`);

    try {
      const fixRes = await apiService.fixCode(code, targetError);
      setAiFixData(fixRes);
      addLog('SUCCESS', `AI generated fix: ${fixRes.diff_summary}`);

      if (fixRes.corrected_code && fixRes.corrected_code.trim()) {
        const newCode = fixRes.corrected_code;
        setCode(newCode);
        setErrorMessage('');
        addLog('SUCCESS', 'Automatically applied AI-corrected code to program.c!');
        addLog('INFO', 'Auto-triggering re-analysis and recompilation...');

        // Re-analyze
        setIsAnalyzing(true);
        const anaRes = await apiService.analyzeCode(newCode);
        setAnalysis(anaRes);
        setIsAnalyzing(false);

        // Re-compile
        setIsCompiling(true);
        setIsExecuting(true);
        const compRes = await apiService.compileCode(newCode);
        setCompileRes(compRes);
        setIsCompiling(false);

        if (compRes.success) {
          addLog('SUCCESS', `Recompilation PASSED in ${compRes.duration}s! Running corrected program...`);
          const runRes = await apiService.executeCode(newCode, stdin);
          setExecRes(runRes);
          setIsExecuting(false);
          addLog('SUCCESS', `Execution completed with exit code ${runRes.exit_code}`);
          setActiveBottomTab('cli');
        } else {
          setIsExecuting(false);
          addLog('WARN', 'Recompilation reported remaining compiler diagnostics.');
          setActiveBottomTab('compilation');
        }
      } else {
        addLog('WARN', 'AI did not return any modified code.');
        setActiveBottomTab('aifix');
      }
    } catch (err: any) {
      addLog('ERROR', `AI Fix error: ${err.message}`);
      alert(`AI Fix Error: ${err.message}`);
      setActiveBottomTab('aifix');
    } finally {
      setIsFixing(false);
      setIsCompiling(false);
      setIsExecuting(false);
      setIsAnalyzing(false);
    }
  };

  // 5. Apply AI Fix & Auto-Recompile
  const handleApplyFix = async (newCode: string) => {
    setCode(newCode);
    setAiFixData(null);
    setErrorMessage('');
    addLog('INFO', 'Corrected C code applied. Auto-triggering compiler re-analysis and recompilation...');

    // Re-analyze
    await handleAnalyze(newCode);

    // Re-compile
    setIsCompiling(true);
    try {
      const compRes = await apiService.compileCode(newCode);
      setCompileRes(compRes);
      if (compRes.success) {
        addLog('SUCCESS', 'Recompilation PASSED! Executing corrected program...');
        const runRes = await apiService.executeCode(newCode, stdin);
        setExecRes(runRes);
        setActiveBottomTab('cli');
      } else {
        addLog('WARN', 'Recompilation reported remaining compiler diagnostics.');
        setActiveBottomTab('compilation');
      }
    } catch (err: any) {
      addLog('ERROR', `Recompile error: ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // 6. Reset Code
  const handleResetCode = () => {
    setCode(DEFAULT_STARTER_CODE);
    setCompileRes(null);
    setExecRes(null);
    setErrorMessage('');
    addLog('INFO', 'Code editor reset to starter factorial template.');
    handleAnalyze(DEFAULT_STARTER_CODE);
  };

  const bottomTabs = [
    { id: 'cli', label: 'CLI Terminal', icon: Terminal, badge: 'Interactive' },
    { id: 'output', label: 'Program Output', icon: Terminal, badge: execRes?.success ? 'Success' : null },
    { id: 'tokens', label: 'Tokens', icon: Layers, count: analysis?.tokens.length },
    {
      id: 'syntax',
      label: 'Syntax',
      icon: FileCheck2,
      badge: analysis ? (analysis.syntax.valid ? 'Valid' : 'Errors') : null
    },
    {
      id: 'semantic',
      label: 'Semantic',
      icon: AlertTriangle,
      badge: analysis ? (analysis.semantic.valid ? 'Valid' : 'Errors') : null
    },
    { id: 'symbols', label: 'Symbol Table', icon: Table, count: analysis?.symbols.length },
    {
      id: 'compilation',
      label: 'Compilation',
      icon: Cpu,
      badge: compileRes ? (compileRes.success ? 'Build OK' : 'Failed') : null
    },
    {
      id: 'aifix',
      label: 'AI Correction',
      icon: Bot,
      badge: errorMessage || (compileRes && !compileRes.success) ? 'Fix Ready' : null
    },
    { id: 'logs', label: 'Logs', icon: ListOrdered, count: logs.length },
    { id: 'ast', label: 'AST Tree', icon: GitCommit },
    { id: 'ir', label: 'IR (TAC)', icon: Binary, count: analysis?.ir.length },
    { id: 'optimization', label: 'Optimization', icon: Zap, count: analysis?.optimizations.length }
  ];

  return (
    <div className="max-w-[1720px] mx-auto p-4 space-y-4 flex flex-col min-h-[calc(100vh-70px)]">
      {/* Main 3-Column IDE Layout: Left (Requirement), Center (Monaco Editor), Right (Pipeline Stages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[510px] lg:h-[510px]">
        {/* LEFT PANEL: Natural Language Requirement */}
        <div className="lg:col-span-4 h-full">
          <RequirementInput
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onClear={() => setPrompt('')}
          />
        </div>

        {/* CENTER PANEL: Monaco C Code Editor */}
        <div className="lg:col-span-5 h-full">
          <CodeEditor
            code={code}
            setCode={setCode}
            onAnalyze={() => handleAnalyze()}
            onCompile={handleCompileAndRun}
            onFixAI={handleRequestFix}
            onResetCode={handleResetCode}
            onGenerateCode={handleGenerate}
            onSelectTemplate={(newCode, newPrompt) => {
              setCode(newCode);
              setPrompt(newPrompt);
              handleAnalyze(newCode);
            }}
            isGenerating={isGenerating}
            isAnalyzing={isAnalyzing}
            isCompiling={isCompiling}
            isFixing={isFixing}
            hasErrors={Boolean(errorMessage || (compileRes && !compileRes.success))}
          />
        </div>

        {/* RIGHT PANEL: Compiler Pipeline Stages (01-07) */}
        <div className="lg:col-span-3 h-full">
          <RightPipelinePanel
            analysis={analysis}
            compileRes={compileRes}
            execRes={execRes}
            isGenerating={isGenerating}
            isAnalyzing={isAnalyzing}
            isCompiling={isCompiling}
            isExecuting={isExecuting}
            prompt={prompt}
            hasCode={Boolean(code.trim())}
          />
        </div>
      </div>

      {/* BOTTOM PANEL: Inspector & CLI Terminal Tabs */}
      <div className="glass-panel rounded-2xl border border-[#e8d8be] shadow-sm flex flex-col h-[420px] overflow-hidden bg-white">
        {/* Tab Headers */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#faf6ee] border-b border-[#ebdcc5] overflow-x-auto">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition shrink-0 ${
                  isActive
                    ? 'bg-white text-violet-950 border border-amber-400/90 shadow-sm ring-1 ring-amber-400/30'
                    : 'text-[#52416b] hover:text-violet-950 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-violet-700'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100/70 text-[10px] text-amber-900 font-extrabold border border-amber-300">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                      tab.badge === 'Interactive'
                        ? 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold'
                        : tab.badge === 'Valid' || tab.badge === 'Success' || tab.badge === 'Build OK'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-hidden bg-[#fdfbf7]">
          {activeBottomTab === 'cli' && (
            <InteractiveTerminal
              code={code}
              setCode={setCode}
              prompt={prompt}
              setPrompt={setPrompt}
              analysis={analysis}
              compileRes={compileRes}
              execRes={execRes}
              stdin={stdin}
              setStdin={setStdin}
              onCompileAndRun={handleCompileAndRun}
              onAnalyze={handleAnalyze}
              onFix={handleRequestFix}
              onGenerate={handleGenerate}
              isCompiling={isCompiling}
              isExecuting={isExecuting}
              isGenerating={isGenerating}
            />
          )}
          {activeBottomTab === 'output' && (
            <OutputConsole
              compileRes={compileRes}
              execRes={execRes}
              stdin={stdin}
              setStdin={setStdin}
              onExecute={handleCompileAndRun}
              isExecuting={isExecuting}
              onClearOutput={() => {
                setCompileRes(null);
                setExecRes(null);
              }}
            />
          )}
          {activeBottomTab === 'tokens' && <TokenTable tokens={analysis?.tokens || []} />}
          {activeBottomTab === 'syntax' && <SyntaxReport syntax={analysis?.syntax || null} />}
          {activeBottomTab === 'semantic' && (
            <SemanticReport syntax={analysis?.syntax || null} semantic={analysis?.semantic || null} />
          )}
          {activeBottomTab === 'symbols' && <SymbolTableViewer symbols={analysis?.symbols || []} />}
          {activeBottomTab === 'compilation' && (
            <CompilationViewer compileRes={compileRes} isCompiling={isCompiling} />
          )}
          {activeBottomTab === 'aifix' && (
            <AIDiffViewer
              originalCode={code}
              correctedCode={aiFixData?.corrected_code || ''}
              explanation={aiFixData?.explanation || ''}
              diffSummary={aiFixData?.diff_summary || ''}
              onApplyFix={handleApplyFix}
              isFixing={isFixing}
              onRequestFix={handleRequestFix}
              errorMessage={errorMessage}
            />
          )}
          {activeBottomTab === 'logs' && (
            <LogsViewer logs={logs} onClearLogs={() => setLogs([])} />
          )}
          {activeBottomTab === 'ast' && <ASTViewer ast={analysis?.ast || null} />}
          {activeBottomTab === 'ir' && <IRViewer ir={analysis?.ir || []} />}
          {activeBottomTab === 'optimization' && (
            <OptimizationViewer optimizations={analysis?.optimizations || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompilerIDE;
