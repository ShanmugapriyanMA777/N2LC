import React, { useState } from 'react';
import { TokenInfo } from '../types/compiler';
import { Search, Layers } from 'lucide-react';

interface TokenTableProps {
  tokens: TokenInfo[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredTokens = tokens.filter(t => {
    const matchesSearch = t.lexeme.toLowerCase().includes(filter.toLowerCase()) ||
                          t.token_type.toLowerCase().includes(filter.toLowerCase()) ||
                          t.value.toLowerCase().includes(filter.toLowerCase());
    const matchesType = selectedType === 'ALL' || t.token_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-violet-100 text-violet-900 border-violet-300 font-bold';
      case 'IDENTIFIER':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'INT_CONST':
      case 'FLOAT_CONST':
        return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
      case 'STRING_LITERAL':
      case 'CHAR_CONST':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'OPERATOR':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'DELIMITER':
        return 'bg-slate-100 text-slate-900 border-slate-300 font-bold';
      case 'PREPROCESSOR':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-300 font-bold';
    }
  };

  const tokenTypes = ['ALL', 'KEYWORD', 'IDENTIFIER', 'INT_CONST', 'FLOAT_CONST', 'STRING_LITERAL', 'OPERATOR', 'DELIMITER', 'PREPROCESSOR'];

  return (
    <div className="flex flex-col h-full font-mono text-xs bg-white text-[#181028]">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#faf6ee] border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">TOKEN TABLE</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-300 shadow-sm">
            {tokens.length} Total Tokens
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tokenTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                selectedType === type
                  ? 'bg-violet-700 text-white border-violet-800 shadow-sm'
                  : 'bg-white text-[#3d2e5a] border-[#e8d8be] hover:bg-amber-50 hover:text-amber-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#7d6c93]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search lexeme or type..."
            className="pl-8 pr-3 py-1 bg-white border border-[#e8d8be] rounded-lg text-xs text-[#181028] placeholder-[#7d6c93] focus:outline-none focus:border-amber-500 w-44 font-semibold shadow-inner"
          />
        </div>
      </div>

      {/* Token Table */}
      <div className="flex-1 overflow-auto p-3">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-10 text-[#6e5d8a] font-bold">
            No tokens matching filter criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ebdcc5] bg-[#fcf9f2] text-amber-900 text-[11px] uppercase font-extrabold tracking-wider">
                <th className="py-2.5 px-3"># Line</th>
                <th className="py-2.5 px-3">Col</th>
                <th className="py-2.5 px-3">Lexeme</th>
                <th className="py-2.5 px-3">Token Type</th>
                <th className="py-2.5 px-3">Parsed Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdcc5]/60">
              {filteredTokens.map((t, idx) => (
                <tr key={idx} className="hover:bg-amber-50/60 transition">
                  <td className="py-1.5 px-3 text-[#52416b] font-semibold">{t.line}</td>
                  <td className="py-1.5 px-3 text-[#7d6c93] font-semibold">{t.column}</td>
                  <td className="py-1.5 px-3 font-bold text-[#181028]">{t.lexeme}</td>
                  <td className="py-1.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${getTypeBadgeClass(t.token_type)}`}>
                      {t.token_type}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-[#3b2d54] text-[11px] font-semibold">{t.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
