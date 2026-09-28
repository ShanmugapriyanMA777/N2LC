import React from 'react';
import { Sparkles, Trash2, Code2, Lightbulb, ArrowRight } from 'lucide-react';

interface RequirementInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onClear: () => void;
}

export const RequirementInput: React.FC<RequirementInputProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  onClear,
}) => {
  const examplePrompts = [
    'Write a C program to calculate factorial of a number.',
    'Write a C program to find the largest of three numbers.',
    'Write a C program to check whether a number is prime.',
    'Write a C program to generate Fibonacci series.',
    'Write a C program to check whether a number is palindrome.',
    'Write a C program to reverse a number.',
    'Write a C program to sort an array in ascending order.',
    'Write a C program to search an element using linear search.',
    'Write a C program to search an element using binary search.',
    'Write a C program to add two matrices.',
  ];

  const maxLength = 500;

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col h-full border border-[#e8d8be] shadow-sm bg-white overflow-hidden justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebdcc5] shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-amber-600" />
          <h2 className="font-extrabold text-xs text-[#181028] tracking-wide font-mono">
            NATURAL LANGUAGE REQUIREMENT
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {prompt && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-[#6e5d8a] hover:text-rose-600 transition font-mono font-bold"
              title="Clear prompt"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          
          <button
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm font-mono ${
              isGenerating || !prompt.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-violet-700 hover:bg-violet-800 text-white'
            }`}
            title="Convert prompt to C code"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Converting...' : 'Convert'}</span>
          </button>
        </div>
      </div>

      {/* DROPDOWN BOX: Preloaded Prompts Selection */}
      <div className="mt-3 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1 shrink-0 font-mono">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Choose Prompt:</span>
          </label>
          <select
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-[#faf6ee] text-xs font-mono font-bold text-amber-950 border border-amber-300 rounded-lg px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:bg-amber-50 truncate"
            title="Select a preloaded prompt from the dropdown list"
          >
            <option value="" disabled>-- Select a Preloaded Prompt (1-10) --</option>
            {examplePrompts.map((example, idx) => (
              <option key={idx} value={example}>
                {idx + 1}. {example}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="mt-3 flex-1 flex flex-col min-h-0">
        <div className="relative flex-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
            placeholder="Describe the C program requirement in normal English...&#10;&#10;Example: Write a C program to find the largest of three numbers."
            className="w-full h-full bg-[#fdfbf7] border border-[#e8d8be] rounded-xl p-3 text-xs text-[#181028] placeholder-[#7d6c93] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono resize-none leading-relaxed shadow-inner font-semibold"
          />
          <span className="absolute bottom-2 right-2 text-[10px] text-[#7d6c93] font-mono font-bold bg-[#fdfbf7]/90 px-1 rounded">
            {prompt.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* Prominent Bottom LOAD / CONVERT Button */}
      <div className="mt-3 pt-3 border-t border-[#ebdcc5] shrink-0">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md ${
            isGenerating || !prompt.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 border border-amber-400 shadow-amber-900/10 active:scale-[0.99]'
          }`}
        >
          <Sparkles className={`w-4 h-4 text-violet-900 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>
            {isGenerating ? 'Synthesizing & Loading Code...' : '⚡ LOAD & CONVERT INTO C CODE'}
          </span>
          <ArrowRight className="w-4 h-4 text-violet-900" />
        </button>
      </div>
    </div>
  );
};
