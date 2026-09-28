import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Activity, Clock } from 'lucide-react';
import { AnalyzeResult, CompileResult, ExecuteResult } from '../types/compiler';

interface StatusPipelineProps {
  analysis: AnalyzeResult | null;
  compileRes: CompileResult | null;
  execRes: ExecuteResult | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  isCompiling: boolean;
  isExecuting: boolean;
}

export const StatusPipeline: React.FC<StatusPipelineProps> = ({
  analysis,
  compileRes,
  execRes,
  isGenerating,
  isAnalyzing,
  isCompiling,
  isExecuting,
}) => {
  const steps = [
    {
      name: '1. NL Input',
      status: 'success',
      detail: 'Requirement loaded'
    },
    {
      name: '2. AI Synthesize',
      status: isGenerating ? 'loading' : 'success',
      detail: isGenerating ? 'Generating...' : 'C Code Synthesized'
    },
    {
      name: '3. Lexical',
      status: isAnalyzing ? 'loading' : analysis ? 'success' : 'idle',
      detail: analysis ? `${analysis.tokens.length} Tokens` : 'Pending'
    },
    {
      name: '4. Syntax',
      status: isAnalyzing ? 'loading' : analysis ? (analysis.syntax.valid ? 'success' : 'error') : 'idle',
      detail: analysis ? (analysis.syntax.valid ? 'Syntax Valid' : `${analysis.syntax.errors.length} Syntax Error(s)`) : 'Pending'
    },
    {
      name: '5. Semantic',
      status: isAnalyzing ? 'loading' : analysis ? (analysis.semantic.valid ? 'success' : 'error') : 'idle',
      detail: analysis ? (analysis.semantic.valid ? 'Scope Valid' : `${analysis.semantic.errors.length} Scope Error(s)`) : 'Pending'
    },
    {
      name: '6. AST & Symbol',
      status: isAnalyzing ? 'loading' : analysis ? 'success' : 'idle',
      detail: analysis ? `${analysis.symbols.length} Symbols` : 'Pending'
    },
    {
      name: '7. TAC IR',
      status: isAnalyzing ? 'loading' : analysis ? 'success' : 'idle',
      detail: analysis ? `${analysis.ir.length} TAC Inst` : 'Pending'
    },
    {
      name: '8. GCC Compile',
      status: isCompiling ? 'loading' : compileRes ? (compileRes.success ? 'success' : 'error') : 'idle',
      detail: compileRes ? (compileRes.success ? `${compileRes.duration}s` : 'Failed') : 'Pending'
    },
    {
      name: '9. Sandbox Run',
      status: isExecuting ? 'loading' : execRes ? (execRes.success ? 'success' : 'error') : 'idle',
      detail: execRes ? (execRes.success ? `${execRes.execution_time}s` : 'Error') : 'Pending'
    }
  ];

  return (
    <div className="glass-panel rounded-xl p-3 border border-[#e8d8be] mb-4 overflow-x-auto bg-white shadow-sm">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {steps.map((step, idx) => {
          let bgClass = 'bg-[#faf6ee] border-[#e8d8be] text-[#3d2e5a]';
          let icon = <Clock className="w-3.5 h-3.5 text-[#8c7b9e]" />;

          if (step.status === 'loading') {
            bgClass = 'bg-amber-50 border-amber-400 text-amber-900 animate-pulse';
            icon = <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
          } else if (step.status === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950';
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 font-bold" />;
          } else if (step.status === 'error') {
            bgClass = 'bg-rose-50 border-rose-300 text-rose-950';
            icon = <XCircle className="w-3.5 h-3.5 text-rose-600 font-bold" />;
          }

          return (
            <React.Fragment key={idx}>
              <div className={`flex flex-col p-2 rounded-lg border flex-1 text-center font-mono transition-all ${bgClass}`}>
                <div className="flex items-center justify-center gap-1.5 font-bold text-[11px]">
                  {icon}
                  <span className="truncate">{step.name}</span>
                </div>
                <span className="text-[10px] text-[#423359] font-bold mt-0.5 truncate">{step.detail}</span>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
