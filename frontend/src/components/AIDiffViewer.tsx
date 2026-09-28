import React from 'react';
import { Bot, Check, Sparkles, AlertCircle } from 'lucide-react';

interface AIDiffViewerProps {
  originalCode: string;
  correctedCode: string;
  explanation: string;
  diffSummary: string;
  onApplyFix: (code: string) => void;
  isFixing: boolean;
  onRequestFix: () => void;
  errorMessage: string;
}

export const AIDiffViewer: React.FC<AIDiffViewerProps> = ({
  originalCode,
  correctedCode,
  explanation,
  diffSummary,
  onApplyFix,
  isFixing,
  onRequestFix,
  errorMessage,
}) => {
  return (
    <div className="flex flex-col h-full font-mono text-xs p-4 overflow-auto space-y-4 bg-white text-[#181028]">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-50/80 via-[#faf6ee] to-violet-50/80 rounded-xl border border-[#e8d8be] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-violet-700 text-amber-200 shadow border border-amber-300 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-amber-900 uppercase tracking-wide">
              AI-ASSISTED COMPILER ERROR CORRECTION
            </h3>
            <p className="text-[11px] text-[#52416b] mt-0.5 font-medium">
              Generative AI analyzes the GCC or validation error and proposes corrected C source code.
            </p>
          </div>
        </div>

        <button
          onClick={onRequestFix}
          disabled={isFixing}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            isFixing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-violet-700 hover:bg-violet-800 text-white border border-violet-800 shadow-sm'
          }`}
        >
          <Sparkles className={`w-4 h-4 text-amber-300 ${isFixing ? 'animate-spin' : ''}`} />
          <span>{isFixing ? 'Analyzing Fix...' : 'Request AI Error Fix'}</span>
        </button>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Target Error Message:</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-rose-950 font-semibold">{errorMessage}</pre>
        </div>
      )}

      {/* AI Explanation & Change Summary */}
      {correctedCode && (
        <div className="p-3.5 bg-[#faf6ee] border border-[#e8d8be] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900">AI Fix Diagnosis</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
              {diffSummary || 'Correction Ready'}
            </span>
          </div>
          <p className="text-[#181028] leading-relaxed font-semibold">{explanation}</p>

          <div className="pt-2">
            <button
              onClick={() => onApplyFix(correctedCode)}
              className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 text-slate-950 border border-amber-500 shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Fix to Editor & Re-run Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Side-by-side Code Comparison */}
      {correctedCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Original Broken Code */}
          <div className="flex flex-col bg-rose-50/40 rounded-xl border border-rose-300 overflow-hidden">
            <div className="px-3 py-2 bg-rose-100/70 border-b border-rose-200 font-bold text-rose-900 text-[11px]">
              ORIGINAL CODE (WITH ERROR)
            </div>
            <pre className="p-3 flex-1 font-mono text-xs text-rose-950 overflow-auto whitespace-pre font-semibold">
              {originalCode}
            </pre>
          </div>

          {/* Corrected AI Code */}
          <div className="flex flex-col bg-emerald-50/40 rounded-xl border border-emerald-300 overflow-hidden">
            <div className="px-3 py-2 bg-emerald-100/70 border-b border-emerald-200 font-bold text-emerald-900 text-[11px]">
              AI-CORRECTED CODE
            </div>
            <pre className="p-3 flex-1 font-mono text-xs text-emerald-950 overflow-auto whitespace-pre font-bold">
              {correctedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
