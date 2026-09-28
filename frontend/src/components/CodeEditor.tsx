import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Copy, Check, Download, RefreshCw, FileCode, Sparkles, ChevronDown, BookOpen } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onAnalyze: () => void;
  onCompile: () => void;
  onFixAI?: () => void;
  onResetCode?: () => void;
  onGenerateCode?: () => void;
  onSelectTemplate?: (code: string, prompt: string) => void;
  isGenerating?: boolean;
  isAnalyzing: boolean;
  isCompiling: boolean;
  isFixing?: boolean;
  hasErrors?: boolean;
}

export const SAMPLE_PROGRAMS = [
  {
    id: 'factorial',
    title: '1. Factorial of a Number',
    prompt: 'Write a C program to calculate factorial of a number.',
    code: `#include <stdio.h>

int main() {
    int n = 5;
    long long fact = 1;

    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }

    printf("Factorial of %d = %lld\\n", n, fact);
    return 0;
}`
  },
  {
    id: 'largest_three',
    title: '2. Largest of Three Numbers',
    prompt: 'Write a C program to find the largest of three numbers.',
    code: `#include <stdio.h>

int main(void) {
    int a = 10, b = 20, c = 15;
    int largest;

    printf("Numbers: %d, %d, %d\\n", a, b, c);

    if (a >= b && a >= c) {
        largest = a;
    } else if (b >= a && b >= c) {
        largest = b;
    } else {
        largest = c;
    }

    printf("Largest number is: %d\\n", largest);
    return 0;
}`
  },
  {
    id: 'prime',
    title: '3. Prime Number Check',
    prompt: 'Write a C program to check whether a number is prime.',
    code: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int n = 29;
    bool isPrime = true;

    if (n <= 1) {
        isPrime = false;
    } else {
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
    }

    if (isPrime)
        printf("%d is a Prime number\\n", n);
    else
        printf("%d is NOT a Prime number\\n", n);

    return 0;
}`
  },
  {
    id: 'fibonacci',
    title: '4. Fibonacci Series',
    prompt: 'Write a C program to generate Fibonacci series.',
    code: `#include <stdio.h>

int main() {
    int n = 10;
    long long t1 = 0, t2 = 1, nextTerm;

    printf("Fibonacci Series (%d terms): ", n);
    for (int i = 1; i <= n; ++i) {
        printf("%lld ", t1);
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    printf("\\n");
    return 0;
}`
  },
  {
    id: 'palindrome',
    title: '5. Palindrome Number Check',
    prompt: 'Write a C program to check whether a number is palindrome.',
    code: `#include <stdio.h>

int main() {
    int n = 12321, reversed = 0, remainder, original;
    original = n;

    while (n != 0) {
        remainder = n % 10;
        reversed = reversed * 10 + remainder;
        n /= 10;
    }

    if (original == reversed)
        printf("%d is a Palindrome\\n", original);
    else
        printf("%d is NOT a Palindrome\\n", original);

    return 0;
}`
  },
  {
    id: 'reverse',
    title: '6. Reverse a Number',
    prompt: 'Write a C program to reverse a number.',
    code: `#include <stdio.h>

int main() {
    int n = 987654, rev = 0, rem;
    int original = n;

    while (n != 0) {
        rem = n % 10;
        rev = rev * 10 + rem;
        n /= 10;
    }

    printf("Original: %d, Reversed: %d\\n", original, rev);
    return 0;
}`
  },
  {
    id: 'bubble_sort',
    title: '7. Array Sorting (Bubble Sort)',
    prompt: 'Write a C program to sort an array in ascending order.',
    code: `#include <stdio.h>

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    printf("Sorted array: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}`
  },
  {
    id: 'linear_search',
    title: '8. Linear Search',
    prompt: 'Write a C program to search an element using linear search.',
    code: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 80, 30, 60, 50, 110, 100, 130, 170};
    int n = sizeof(arr) / sizeof(arr[0]);
    int key = 110;
    int foundIndex = -1;

    for (int i = 0; i < n; i++) {
        if (arr[i] == key) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex != -1)
        printf("Element %d found at index %d\\n", key, foundIndex);
    else
        printf("Element %d not present in array\\n", key);

    return 0;
}`
  },
  {
    id: 'binary_search',
    title: '9. Binary Search',
    prompt: 'Write a C program to search an element using binary search.',
    code: `#include <stdio.h>

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int n = sizeof(arr) / sizeof(arr[0]);
    int key = 23;
    int low = 0, high = n - 1, mid, found = -1;

    while (low <= high) {
        mid = low + (high - low) / 2;
        if (arr[mid] == key) {
            found = mid;
            break;
        }
        if (arr[mid] < key)
            low = mid + 1;
        else
            high = mid - 1;
    }

    if (found != -1)
        printf("Binary Search: %d found at index %d\\n", key, found);
    else
        printf("Binary Search: %d not found\\n", key);

    return 0;
}`
  },
  {
    id: 'matrix_addition',
    title: '10. Matrix Addition',
    prompt: 'Write a C program to add two matrices.',
    code: `#include <stdio.h>

int main() {
    int r = 2, c = 3;
    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int b[2][3] = {{7, 8, 9}, {1, 2, 3}};
    int sum[2][3];

    for (int i = 0; i < r; ++i) {
        for (int j = 0; j < c; ++j) {
            sum[i][j] = a[i][j] + b[i][j];
        }
    }

    printf("Sum of matrices:\\n");
    for (int i = 0; i < r; ++i) {
        for (int j = 0; j < c; ++j) {
            printf("%d  ", sum[i][j]);
        }
        printf("\\n");
    }
    return 0;
}`
  }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  onAnalyze,
  onCompile,
  onFixAI,
  onResetCode,
  onGenerateCode,
  onSelectTemplate,
  isGenerating = false,
  isAnalyzing,
  isCompiling,
  isFixing = false,
  hasErrors = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('factorial');
  const [cStandard, setCStandard] = useState<string>('C11');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-csrc' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.c';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const prog = SAMPLE_PROGRAMS.find((p) => p.id === templateId);
    if (prog) {
      setCode(prog.code);
      if (onSelectTemplate) {
        onSelectTemplate(prog.code, prog.prompt);
      } else {
        onAnalyze();
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full border border-[#e8d8be] shadow-sm overflow-hidden bg-white">
      {/* Editor Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#faf6ee] border-b border-[#ebdcc5] gap-2">
        {/* Left Side: Program File, Template Dropdown & Standard Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-xs text-[#181028] font-mono tracking-wide">
              program.c
            </span>
          </div>

          {/* DROPDOWN BOX: Sample C Program Templates */}
          <div className="flex items-center gap-1">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-white text-xs font-mono font-bold text-amber-950 border border-amber-400/90 rounded-lg px-2.5 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:bg-amber-50 transition"
              title="Select a preloaded C program to load into the editor"
            >
              <option value="" disabled>-- Select Program Template --</option>
              {SAMPLE_PROGRAMS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.title}
                </option>
              ))}
            </select>
          </div>

          {/* DROPDOWN BOX: C Standard Selector */}
          <div className="flex items-center gap-1">
            <select
              value={cStandard}
              onChange={(e) => setCStandard(e.target.value)}
              className="text-[10px] px-2 py-1 rounded bg-amber-100/80 text-amber-900 font-mono font-bold border border-amber-300 focus:outline-none cursor-pointer hover:bg-amber-100 shadow-sm"
              title="Select C Language Standard"
            >
              <option value="C11">C11 Standard</option>
              <option value="C99">C99 Standard</option>
              <option value="C89">C89 / ANSI C</option>
              <option value="C17">C17 Standard</option>
              <option value="C23">C23 Standard</option>
            </select>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-[#3b2d54] hover:text-violet-950 transition border border-[#e8d8be] font-mono font-bold shadow-sm"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-[#3b2d54] hover:text-violet-950 transition border border-[#e8d8be] font-mono font-bold shadow-sm"
            title="Download program.c"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Download</span>
          </button>

          {onResetCode && (
            <button
              onClick={onResetCode}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-[#3b2d54] hover:text-violet-950 transition border border-[#e8d8be] font-mono font-bold shadow-sm"
              title="Reset code to starter template"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset</span>
            </button>
          )}

          {onFixAI && (
            <button
              onClick={onFixAI}
              disabled={isFixing || !code.trim()}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold transition border font-mono ${
                hasErrors
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-amber-300 shadow animate-pulse'
                  : 'bg-white hover:bg-amber-50 text-amber-800 border-[#e8d8be]'
              }`}
              title="Automatically fix and re-run compiler errors using Generative AI"
            >
              <RefreshCw className={`w-3 h-3 ${isFixing ? 'animate-spin' : ''}`} />
              <span>{isFixing ? 'Auto-Fixing & Applying...' : '⚡ Auto-Fix Errors'}</span>
            </button>
          )}

          {onGenerateCode && (
            <button
              onClick={onGenerateCode}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-bold transition font-mono ${
                isGenerating
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-sm'
              }`}
              title="Convert current requirement prompt into C code"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-700 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Converting...' : 'Load from Prompt'}</span>
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-bold transition font-mono ${
              isAnalyzing || !code.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-violet-700 hover:bg-violet-800 text-white border border-violet-600 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>

          <button
            onClick={onCompile}
            disabled={isCompiling || !code.trim()}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-1 rounded-lg font-bold transition font-mono ${
              isCompiling || !code.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 border border-amber-500 shadow-md font-extrabold'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isCompiling ? 'Compiling...' : 'Compile & Run'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full bg-white border-t border-[#ebdcc5]">
        <Editor
          height="100%"
          language="c"
          theme="vs"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};
