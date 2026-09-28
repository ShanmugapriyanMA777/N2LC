import React from 'react';
import { IRInstruction } from '../types/compiler';
import { Binary } from 'lucide-react';

interface IRViewerProps {
  ir: IRInstruction[];
}

export const IRViewer: React.FC<IRViewerProps> = ({ ir }) => {
  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 bg-white text-[#181028]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">INTERMEDIATE CODE (THREE-ADDRESS CODE / TAC)</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300 shadow-sm">
            {ir.length} TAC Statements
          </span>
        </div>
      </div>

      {ir.length === 0 ? (
        <div className="text-center py-10 text-[#6e5d8a] font-bold">
          No IR generated. Run Compiler Analysis to generate Three-Address Code.
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ebdcc5] bg-[#fcf9f2] text-amber-900 text-[11px] uppercase font-extrabold tracking-wider">
                <th className="py-2.5 px-3">Inst #</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Arg 1</th>
                <th className="py-2.5 px-3">Arg 2</th>
                <th className="py-2.5 px-3">Result / Target</th>
                <th className="py-2.5 px-3 font-mono">3-Address TAC Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcc5]/60">
              {ir.map((inst, idx) => {
                const isLabel = inst.op === 'label' || inst.op === 'func_begin';
                return (
                  <tr key={idx} className={`hover:bg-amber-50/60 transition ${isLabel ? 'bg-amber-50/80 font-bold' : ''}`}>
                    <td className="py-2 px-3 text-[#6e5d8a] font-semibold">({inst.index})</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-900 border border-violet-300 font-bold text-[10px]">
                        {inst.op}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#181028] font-semibold">{inst.arg1 || '-'}</td>
                    <td className="py-2 px-3 text-[#181028] font-semibold">{inst.arg2 || '-'}</td>
                    <td className="py-2 px-3 text-amber-800 font-bold">{inst.result || '-'}</td>
                    <td className="py-2 px-3 text-violet-900 font-mono font-extrabold">{inst.statement}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
