import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { HistoryItem } from '../types/compiler';
import { History as HistoryIcon, Search, Trash2, ArrowUpRight, Clock } from 'lucide-react';

interface HistoryPageProps {
  onLoadCode: (code: string, prompt: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onLoadCode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const fetchHistory = async () => {
    const data = await apiService.getHistory();
    setHistory(data);
    if (data.length > 0 && !selectedItem) {
      setSelectedItem(data[0]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (confirm('Clear all local compilation history?')) {
      await apiService.clearHistory();
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const filtered = history.filter(item =>
    item.prompt.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 font-mono text-[#181028]">
      <div className="flex items-center justify-between border-b border-[#ebdcc5] pb-3">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-amber-600" />
          <h1 className="text-lg font-bold text-[#181028] tracking-wide">COMPILATION & GENERATION HISTORY</h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold hover:bg-rose-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Left History List */}
        <div className="glass-panel p-3 rounded-xl border border-[#e8d8be] flex flex-col h-full bg-white shadow-sm">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7d6c93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#fdfbf7] border border-[#e8d8be] rounded-lg text-xs text-[#181028] placeholder-[#7d6c93] focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-[#6e5d8a] text-xs font-bold">
                No history records found.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedItem?.id === item.id
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm font-bold'
                      : 'bg-[#faf6ee] border-[#ebdcc5] text-[#2c1e45] hover:bg-amber-50/50'
                  }`}
                >
                  <p className="font-bold text-xs line-clamp-2 text-[#181028]">{item.prompt}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-[#52416b] font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {item.timestamp}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-white border border-[#e8d8be] text-emerald-800 font-bold">
                      {item.compilation_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Code Preview & Action */}
        <div className="md:col-span-2 glass-panel p-4 rounded-xl border border-[#e8d8be] flex flex-col h-full bg-white shadow-sm">
          {selectedItem ? (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc5]">
                <div>
                  <h3 className="font-bold text-sm text-[#181028]">{selectedItem.prompt}</h3>
                  <span className="text-[10px] text-[#52416b] font-semibold">Recorded: {selectedItem.timestamp}</span>
                </div>

                <button
                  onClick={() => onLoadCode(selectedItem.code, selectedItem.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-700 via-purple-700 to-amber-600 hover:from-violet-800 text-white text-xs font-bold border border-amber-300 shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Load into IDE</span>
                </button>
              </div>

              <div className="flex-1 bg-[#fdfbf7] rounded-lg p-3 overflow-auto border border-[#e8d8be] shadow-inner">
                <pre className="font-mono text-xs text-[#181028] whitespace-pre font-semibold">
                  {selectedItem.code}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#6e5d8a] text-xs font-bold">
              Select a history item from the left pane to view saved code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
