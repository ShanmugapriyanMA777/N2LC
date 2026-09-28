import React from 'react';
import { SyntaxInfo, SemanticInfo } from '../types/compiler';
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface SemanticReportProps {
  syntax: SyntaxInfo | null;
  semantic: SemanticInfo | null;
  onApplyFix?: (fixedCode: string) => void;
}

export const SemanticReport: React.FC<SemanticReportProps> = ({ syntax, semantic }) => {
  if (!syntax && !semantic) {
    return (
      <div className="flex items-center justify-center h-full text-[#6e5d8a] font-mono text-xs font-bold bg-white">
        No analysis data available. Run Compiler Analysis to validate syntax and semantic rules.
      </div>
    );
  }

  const syntaxValid = syntax?.valid ?? true;
  const semanticValid = semantic?.valid ?? true;
  const isAllValid = syntaxValid && semanticValid;

  const syntaxErrors = syntax?.errors || [];
  const semanticErrors = semantic?.errors || [];

  return (
    <div className="flex flex-col h-full font-mono text-xs p-4 overflow-auto space-y-4 bg-white text-[#181028]">
      {/* Overall Status Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
        isAllValid
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-rose-50 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          {isAllValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#181028]">
              {isAllValid ? 'SYNTAX & SEMANTIC ANALYSIS PASSED' : 'COMPILER VALIDATION ISSUES DETECTED'}
            </h3>
            <p className="text-[11px] text-[#423359] font-medium">
              {isAllValid
                ? 'All C11 grammar syntax and scope declaration rules are fully satisfied.'
                : `${syntaxErrors.length} Syntax Error(s), ${semanticErrors.length} Semantic Error(s) found.`}
            </p>
          </div>
        </div>
      </div>

      {/* Syntax Errors Section */}
      {syntaxErrors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-rose-800 flex items-center gap-1.5 uppercase">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Syntax Parser Errors ({syntaxErrors.length})</span>
          </h4>
          {syntaxErrors.map((err, idx) => (
            <div key={idx} className="p-3 bg-rose-50/60 border border-rose-300 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>Line {err.line}, Column {err.column}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">Syntax Error</span>
              </div>
              <p className="text-[#181028] font-bold">{err.message}</p>
              {err.suggested_fix && (
                <div className="mt-2 p-2 bg-white rounded-lg text-amber-900 text-[11px] flex items-center gap-2 border border-amber-300 font-semibold shadow-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Suggested Fix:</strong> {err.suggested_fix}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Semantic Errors Section */}
      {semanticErrors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5 uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Semantic & Scope Errors ({semanticErrors.length})</span>
          </h4>
          {semanticErrors.map((err, idx) => (
            <div key={idx} className="p-3 bg-amber-50/60 border border-amber-300 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-amber-950 font-bold">
                <span>Line {err.line} &bull; {err.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">Scope Error</span>
              </div>
              <p className="text-[#181028] font-bold">{err.message}</p>
              <p className="text-[#52416b] text-[11px] font-medium">{err.explanation}</p>
              {err.suggested_fix && (
                <div className="mt-2 p-2 bg-white rounded-lg text-amber-900 text-[11px] flex items-center gap-2 border border-amber-300 font-semibold shadow-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Fix Suggestion:</strong> {err.suggested_fix}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compiler Warnings */}
      {((syntax?.warnings && syntax.warnings.length > 0) || (semantic?.warnings && semantic.warnings.length > 0)) && (
        <div className="p-3 bg-[#faf6ee] border border-[#e8d8be] rounded-xl space-y-1">
          <span className="font-bold text-amber-900">Compiler Warnings</span>
          <ul className="list-disc list-inside text-[#3d2e5a] text-[11px] font-medium">
            {syntax?.warnings?.map((w, idx) => <li key={`sw_${idx}`}>{w}</li>)}
            {semantic?.warnings?.map((w, idx) => <li key={`semw_${idx}`}>{w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
