import React from 'react';
import { SymbolInfo } from '../types/compiler';
import { Table } from 'lucide-react';

interface SymbolTableViewerProps {
  symbols: SymbolInfo[];
}

export const SymbolTableViewer: React.FC<SymbolTableViewerProps> = ({ symbols }) => {
  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 bg-white text-[#181028]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">SYMBOL TABLE</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300 shadow-sm">
            {symbols.length} Symbols Tracked
          </span>
        </div>
      </div>

      {symbols.length === 0 ? (
        <div className="text-center py-10 text-[#6e5d8a] font-bold">
          No symbols discovered. Run compiler analysis on C source code.
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ebdcc5] bg-[#fcf9f2] text-amber-900 text-[11px] uppercase font-extrabold tracking-wider">
                <th className="py-2.5 px-3">Identifier Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Scope</th>
                <th className="py-2.5 px-3">Kind</th>
                <th className="py-2.5 px-3">Initial Value</th>
                <th className="py-2.5 px-3">Array Spec</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcc5]/60">
              {symbols.map((sym, idx) => (
                <tr key={idx} className="hover:bg-amber-50/60 transition">
                  <td className="py-2 px-3 font-bold text-amber-800">{sym.name}</td>
                  <td className="py-2 px-3 text-[#181028] font-bold">{sym.type}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-900 border border-violet-300 text-[10px] font-bold">
                      {sym.scope}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      sym.kind === 'function'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : sym.kind === 'parameter'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {sym.kind}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#52416b] font-semibold">{sym.initial_value || '-'}</td>
                  <td className="py-2 px-3 text-[#52416b] font-semibold">{sym.array_size || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
