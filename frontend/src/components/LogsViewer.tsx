import React, { useState } from 'react';
import { Terminal, Copy, Check, Trash2 } from 'lucide-react';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

interface LogsViewerProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ logs, onClearLogs }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs p-4 overflow-hidden space-y-3 bg-white text-[#181028]">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc5]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-[#181028] tracking-wide">Backend Pipeline Log Stream</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            {logs.length} events logged
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-[#faf6ee] hover:bg-amber-100 text-[#3b2d54] hover:text-amber-900 border border-[#e8d8be] transition font-bold"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-600" />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-[#faf6ee] hover:bg-rose-50 text-[#3b2d54] hover:text-rose-700 border border-[#e8d8be] transition font-bold"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Log Console Body */}
      <div className="flex-1 bg-[#fdfbf7] rounded-xl p-3 border border-[#e8d8be] overflow-y-auto space-y-1.5 leading-relaxed font-mono shadow-inner">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#6e5d8a] font-bold">
            No pipeline activity yet. Run "Generate C Code" or "Compile & Run" to view real-time log traces.
          </div>
        ) : (
          logs.map((log, idx) => {
            let levelColor = 'text-violet-800';
            if (log.level === 'SUCCESS') levelColor = 'text-emerald-700';
            if (log.level === 'WARN') levelColor = 'text-amber-700';
            if (log.level === 'ERROR') levelColor = 'text-rose-700';

            return (
              <div key={idx} className="flex items-start gap-2 hover:bg-amber-50/60 p-1 rounded">
                <span className="text-[#8c7b9e] select-none text-[10px] font-bold">{log.timestamp}</span>
                <span className={`font-extrabold shrink-0 text-[11px] ${levelColor}`}>
                  [{log.level}]
                </span>
                <span className="text-[#181028] flex-1 font-semibold">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
