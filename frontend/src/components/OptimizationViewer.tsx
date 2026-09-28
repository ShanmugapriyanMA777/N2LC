import React from 'react';
import { OptimizationInfo } from '../types/compiler';
import { Zap, CheckCircle2 } from 'lucide-react';

interface OptimizationViewerProps {
  optimizations: OptimizationInfo[];
}

export const OptimizationViewer: React.FC<OptimizationViewerProps> = ({ optimizations }) => {
  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 overflow-auto space-y-3 bg-white text-[#181028]">
      <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">COMPILER OPTIMIZATION PASSES</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300 shadow-sm">
            {optimizations.length} Transformations Detected
          </span>
        </div>
      </div>

      {optimizations.length === 0 ? (
        <div className="p-6 bg-[#faf6ee] rounded-xl border border-[#e8d8be] text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-[#181028]">No redundant arithmetic or dead code detected.</p>
          <p className="text-[11px] text-[#52416b] font-medium">
            Source code is already concise. Example optimization triggers include constant arithmetic (e.g. 10 * 20) or x + 0.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimizations.map((opt, idx) => (
            <div key={idx} className="p-3.5 bg-[#faf6ee] border border-amber-300 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                  {opt.pass_name}
                </span>
                <span className="text-[10px] text-[#52416b] font-bold">Compile-time Pass #{idx + 1}</span>
              </div>
              <p className="text-[#181028] text-[11px] font-semibold">{opt.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-[#e8d8be] shadow-inner">
                  <span className="text-rose-800 font-bold block text-[10px] uppercase">Original Code:</span>
                  <code className="text-[#181028] font-bold">{opt.before}</code>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-300 shadow-inner">
                  <span className="text-emerald-800 font-bold block text-[10px] uppercase">Optimized Code:</span>
                  <code className="text-emerald-900 font-bold">{opt.after}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
