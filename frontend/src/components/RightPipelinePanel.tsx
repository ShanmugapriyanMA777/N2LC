import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, Cpu } from 'lucide-react';
import { AnalyzeResult, CompileResult, ExecuteResult } from '../types/compiler';

interface RightPipelinePanelProps {
  analysis: AnalyzeResult | null;
  compileRes: CompileResult | null;
  execRes: ExecuteResult | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  isCompiling: boolean;
  isExecuting: boolean;
  prompt: string;
  hasCode: boolean;
}

export const RightPipelinePanel: React.FC<RightPipelinePanelProps> = ({
  analysis,
  compileRes,
  execRes,
  isGenerating,
  isAnalyzing,
  isCompiling,
  isExecuting,
  prompt,
  hasCode,
}) => {
  // Determine status for each of the 7 stages
  const getStageStatus = (stageNum: number): { status: 'IDLE' | 'PROCESSING' | 'PASSED' | 'FAILED'; detail: string } => {
    switch (stageNum) {
      case 1: // 01 Input
        if (!prompt.trim()) return { status: 'IDLE', detail: 'Waiting for prompt' };
        return { status: 'PASSED', detail: 'Requirement ready' };

      case 2: // 02 AI Code Generation
        if (isGenerating) return { status: 'PROCESSING', detail: 'AI generating C code...' };
        if (hasCode) return { status: 'PASSED', detail: 'Clean C code synthesized' };
        return { status: 'IDLE', detail: 'Pending generation' };

      case 3: // 03 Lexical Analysis
        if (isAnalyzing) return { status: 'PROCESSING', detail: 'Scanning tokens...' };
        if (analysis) {
          return { status: 'PASSED', detail: `${analysis.tokens.length} tokens categorized` };
        }
        return { status: 'IDLE', detail: 'Pending analysis' };

      case 4: // 04 Syntax Analysis
        if (isAnalyzing) return { status: 'PROCESSING', detail: 'Validating grammar...' };
        if (analysis) {
          if (analysis.syntax.valid) {
            return { status: 'PASSED', detail: 'C11 grammar verified' };
          }
          return { status: 'FAILED', detail: `${analysis.syntax.errors.length} syntax error(s)` };
        }
        return { status: 'IDLE', detail: 'Pending analysis' };

      case 5: // 05 Semantic Analysis
        if (isAnalyzing) return { status: 'PROCESSING', detail: 'Checking scope & types...' };
        if (analysis) {
          if (!analysis.syntax.valid) {
            return { status: 'IDLE', detail: 'Blocked by syntax error' };
          }
          if (analysis.semantic.valid) {
            return { status: 'PASSED', detail: `${analysis.symbols.length} symbols resolved` };
          }
          return { status: 'FAILED', detail: `${analysis.semantic.errors.length} semantic error(s)` };
        }
        return { status: 'IDLE', detail: 'Pending analysis' };

      case 6: // 06 GCC Compilation
        if (isCompiling) return { status: 'PROCESSING', detail: 'Invoking GCC toolchain...' };
        if (compileRes) {
          if (compileRes.success) {
            return { status: 'PASSED', detail: `Compiled in ${compileRes.duration}s` };
          }
          return { status: 'FAILED', detail: 'Compilation failed' };
        }
        return { status: 'IDLE', detail: 'Pending compilation' };

      case 7: // 07 Execution
        if (isExecuting) return { status: 'PROCESSING', detail: 'Executing binary...' };
        if (execRes) {
          if (execRes.success) {
            return { status: 'PASSED', detail: `Exit 0 (${execRes.execution_time}s)` };
          }
          return { status: 'FAILED', detail: `Error exit ${execRes.exit_code}` };
        }
        return { status: 'IDLE', detail: 'Pending execution' };

      default:
        return { status: 'IDLE', detail: 'Pending' };
    }
  };

  const stages = [
    { num: '01', title: 'Input Requirement', stageNum: 1 },
    { num: '02', title: 'AI Code Generation', stageNum: 2 },
    { num: '03', title: 'Lexical Analysis', stageNum: 3 },
    { num: '04', title: 'Syntax Analysis', stageNum: 4 },
    { num: '05', title: 'Semantic Analysis', stageNum: 5 },
    { num: '06', title: 'GCC Compilation', stageNum: 6 },
    { num: '07', title: 'Execution', stageNum: 7 }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col h-full border border-[#e8d8be] shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="font-bold text-sm text-[#181028] tracking-wide font-mono">
              COMPILER PIPELINE
            </h2>
            <p className="text-[10px] text-[#6e5d8a] font-mono font-bold">Real-time Phase Execution</p>
          </div>
        </div>
      </div>

      {/* Pipeline Stages List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 font-mono">
        {stages.map((stage) => {
          const { status, detail } = getStageStatus(stage.stageNum);

          let badgeColor = 'bg-[#fcf9f2] text-[#3d2e5a] border-[#e8d8be]';
          let icon = <Clock className="w-3.5 h-3.5 text-[#8c7b9e]" />;

          if (status === 'PROCESSING') {
            badgeColor = 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm animate-pulse';
            icon = <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
          } else if (status === 'PASSED') {
            badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm';
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 font-bold" />;
          } else if (status === 'FAILED') {
            badgeColor = 'bg-rose-50 text-rose-900 border-rose-300 shadow-sm';
            icon = <XCircle className="w-3.5 h-3.5 text-rose-600 font-bold" />;
          }

          return (
            <div
              key={stage.num}
              className={`p-2.5 rounded-xl border transition flex items-center justify-between ${badgeColor}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-extrabold text-amber-700 shrink-0">{stage.num}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#181028] truncate">{stage.title}</div>
                  <div className="text-[10px] text-[#52416b] truncate font-semibold">{detail}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {icon}
                <span className="text-[10px] font-extrabold tracking-wider">{status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compiler Summary Box */}
      <div className="mt-3 pt-3 border-t border-[#ebdcc5]">
        <div className="bg-[#faf6ee] rounded-xl p-2.5 border border-[#e8d8be] font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between font-bold text-amber-800 pb-1 border-b border-[#ebdcc5] text-[10px]">
            <span>COMPILER SUMMARY</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-amber-900 border border-amber-300 font-bold">GCC + AI</span>
          </div>
          <div className="flex justify-between text-[#181028] font-semibold">
            <span className="text-[#52416b]">Lexical:</span>
            <span className={analysis ? 'text-emerald-700 font-bold' : 'text-[#8c7b9e]'}>
              {analysis ? '✓ PASSED' : 'IDLE'}
            </span>
          </div>
          <div className="flex justify-between text-[#181028] font-semibold">
            <span className="text-[#52416b]">Syntax:</span>
            <span className={analysis ? (analysis.syntax.valid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold') : 'text-[#8c7b9e]'}>
              {analysis ? (analysis.syntax.valid ? '✓ PASSED' : '✗ FAILED') : 'IDLE'}
            </span>
          </div>
          <div className="flex justify-between text-[#181028] font-semibold">
            <span className="text-[#52416b]">Semantic:</span>
            <span className={analysis ? (analysis.semantic.valid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold') : 'text-[#8c7b9e]'}>
              {analysis ? (analysis.semantic.valid ? '✓ PASSED' : '✗ FAILED') : 'IDLE'}
            </span>
          </div>
          <div className="flex justify-between text-[#181028] font-semibold">
            <span className="text-[#52416b]">GCC:</span>
            <span className={compileRes ? (compileRes.success ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold') : 'text-[#8c7b9e]'}>
              {compileRes ? (compileRes.success ? '✓ PASSED' : '✗ FAILED') : 'IDLE'}
            </span>
          </div>
          <div className="flex justify-between text-[#181028] font-semibold">
            <span className="text-[#52416b]">Execution:</span>
            <span className={execRes ? (execRes.success ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold') : 'text-[#8c7b9e]'}>
              {execRes ? (execRes.success ? '✓ PASSED' : '✗ FAILED') : 'IDLE'}
            </span>
          </div>
          {execRes?.stdout && (
            <div className="pt-1 mt-1 border-t border-[#ebdcc5] text-[10px] text-amber-800 font-bold truncate">
              Output: {execRes.stdout.trim().split('\n')[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
