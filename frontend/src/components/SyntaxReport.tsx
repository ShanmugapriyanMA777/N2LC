import React from 'react';
import { SyntaxInfo } from '../types/compiler';
import { CheckCircle2, XCircle, Lightbulb, ShieldCheck, AlertCircle } from 'lucide-react';

interface SyntaxReportProps {
  syntax: SyntaxInfo | null;
}

export const SyntaxReport: React.FC<SyntaxReportProps> = ({ syntax }) => {
  if (!syntax) {
    return (
      <div className="flex items-center justify-center h-full text-[#6e5d8a] font-mono text-xs font-bold bg-white">
        No syntax analysis data. Click "Analyze" or "Compile & Run" to perform syntax parsing.
      </div>
    );
  }

  const isValid = syntax.valid;
  const errors = syntax.errors || [];

  return (
    <div className="flex flex-col h-full font-mono text-xs p-4 overflow-auto space-y-4 bg-white text-[#181028]">
      {/* Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
          isValid
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#52416b] font-bold">SYNTAX ANALYSIS</div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-[#181028]">
              Status: <span className={isValid ? 'text-emerald-700' : 'text-rose-700'}>{isValid ? 'PASSED' : 'FAILED'}</span>
            </h3>
            <p className="text-[11px] text-[#423359] font-medium">
              {isValid
                ? 'All C11 grammar syntax rules, delimiter balances, and statements are valid.'
                : `${errors.length} syntax error(s) detected during recursive syntax verification.`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
            isValid ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-rose-100 border-rose-300 text-rose-900'
          }`}>
            {isValid ? 'VALID C GRAMMAR' : 'SYNTAX ERROR'}
          </span>
        </div>
      </div>

      {/* Rules Checked Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-[#faf6ee] border border-[#e8d8be] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[#181028]">Semicolon Check</div>
            <div className="text-[10px] text-[#52416b] font-medium">Statement termination</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#faf6ee] border border-[#e8d8be] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[#181028]">Brace Matching</div>
            <div className="text-[10px] text-[#52416b] font-medium">{'{ }'} block balance</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#faf6ee] border border-[#e8d8be] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[#181028]">Parentheses</div>
            <div className="text-[10px] text-[#52416b] font-medium">( ) expression balance</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#faf6ee] border border-[#e8d8be] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[#181028]">Brackets</div>
            <div className="text-[10px] text-[#52416b] font-medium">[ ] array indexing</div>
          </div>
        </div>
      </div>

      {/* Errors list */}
      {errors.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-rose-800 flex items-center gap-1.5 uppercase">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Syntax Errors ({errors.length})</span>
          </h4>
          {errors.map((err, idx) => (
            <div key={idx} className="p-3 bg-rose-50/60 border border-rose-300 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>Line {err.line}, Column {err.column}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold border border-rose-300">Parser Error</span>
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
      ) : (
        <div className="p-4 bg-[#faf6ee] border border-[#e8d8be] rounded-xl text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-[#181028] font-bold">Grammar Validation Passed</p>
          <p className="text-[11px] text-[#52416b] mt-0.5 font-medium">No syntax errors, missing semicolons, or unmatched delimiters found.</p>
        </div>
      )}
    </div>
  );
};
