import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const vivaModules = [
    {
      module: '1. Natural Language Processing & Generative AI',
      what: 'Converts English programming specifications into standard C source code.',
      why: 'Enables high-level human specification of intent and eliminates repetitive boilerplate coding.',
      input: 'Natural language prompt string (e.g. "Write a C program to find the largest of three numbers")',
      processing: 'AI prompt engineering with system instructions to return only valid C11 code, followed by backend markdown sanitization.',
      output: 'Pure C source code string containing main(), headers, and logic.'
    },
    {
      module: '2. Lexical Analyzer (Scanner / Tokenizer)',
      what: 'Breaks C source code characters into atomic tokens.',
      why: 'Eliminates whitespace, comments, and categorizes raw characters into structured tokens for the parser.',
      input: 'Raw C source code text string',
      processing: 'Regex and finite automaton scanning matching keywords, identifiers, constants, strings, operators, and delimiters.',
      output: 'Token Table (Line, Column, Lexeme, Token Type, Value).'
    },
    {
      module: '3. Syntax Analyzer (Parser)',
      what: 'Checks whether the token sequence conforms to C grammar rules.',
      why: 'Detects structural syntax errors like missing semicolons, unclosed braces {}, or invalid expressions.',
      input: 'Array of Token objects from Lexical Analyzer',
      processing: 'Recursive-descent grammar parsing and parenthesis/brace stack balance checking.',
      output: 'Syntax validation status (Valid/Invalid) and detailed error diagnostics with suggested fixes.'
    },
    {
      module: '4. Abstract Syntax Tree (AST) Generator',
      what: 'Creates a hierarchical tree representing the syntactic structure of the C code.',
      why: 'Abstracts away redundant punctuation (semicolons, braces) to capture core control flow and expression logic for semantics and IR.',
      input: 'Token stream and parsed statement nodes',
      processing: 'Tree construction building Program, FunctionDecl, VarDecl, BinaryExpr, AssignmentExpr, and CallExpr nodes.',
      output: 'Hierarchical JSON AST tree structure.'
    },
    {
      module: '5. Symbol Table Manager',
      what: 'Tracks identifier declarations across scopes.',
      why: 'Essential for checking variable types, scopes, initial values, and array sizes.',
      input: 'C source code and tokens',
      processing: 'Extracts variable and function declarations, associating scope names (global, main, loop) and data types.',
      output: 'Symbol Table array (Name, Type, Scope, Kind, Initial Value, Array Size).'
    },
    {
      module: '6. Semantic Analyzer',
      what: 'Validates type consistency and scope rules.',
      why: 'Catches errors that are syntactically valid but semantically meaningless (e.g. using undeclared variable x).',
      input: 'Symbol table and token stream',
      processing: 'Checks variable declaration before usage, duplicate declarations in the same scope, and return statement presence.',
      output: 'Semantic Report with error category, explanation, line number, and recommended fix.'
    },
    {
      module: '7. Intermediate Representation (Three-Address Code / TAC)',
      what: 'Translates high-level statements into 3-address instructions.',
      why: 'Decouples language parsing from machine architecture, making code optimization and assembly generation straightforward.',
      input: 'AST / parsed expressions',
      processing: 'Generates linear instructions with at most 3 operands using temporaries (t1, t2) and conditional jumps (if False goto L1).',
      output: 'Array of TAC Instruction objects.'
    },
    {
      module: '8. Compiler Optimizer',
      what: 'Performs compile-time code transformations.',
      why: 'Improves execution speed and reduces binary size without altering program behavior.',
      input: 'C source code and TAC statements',
      processing: 'Evaluates constant arithmetic (Constant Folding, e.g. 10 * 20 -> 200), eliminates identity operations (+ 0, * 1), and flags dead code after return.',
      output: 'Optimization Pass report with Before/After line comparisons.'
    },
    {
      module: '9. GCC Compiler & Sandbox Execution Engine',
      what: 'Compiles C code to native binary and runs it inside a secure sandbox environment.',
      why: 'Produces executable binary via GCC (-Wall -Wextra -std=c11) or provides fallback execution via in-memory Python C Interpreter.',
      input: 'C source code and user program input (stdin)',
      processing: 'Isolated temp directory creation, subprocess compilation, timeout enforcement (5s), and stdin redirection.',
      output: 'Stdout terminal output, stderr warnings, compilation duration, and exit code.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-mono text-[#181028]">
      {/* Page Header */}
      <div className="border-b border-[#ebdcc5] pb-4">
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-600" />
          <span className="bg-gradient-to-r from-violet-950 via-purple-900 to-amber-700 bg-clip-text text-transparent">
            COMPILER DESIGN VIVA DEFENSE & ACADEMIC CHEAT SHEET
          </span>
        </h1>
        <p className="text-xs text-[#52416b] font-sans mt-0.5 font-semibold">
          Step-by-step breakdown of What, Why, Input, Processing, and Output for every major compiler design component.
        </p>
      </div>

      {/* Viva Cards */}
      <div className="space-y-4">
        {vivaModules.map((item, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-2xl border border-[#e8d8be] space-y-3 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#ebdcc5] pb-2">
              <h3 className="font-bold text-sm text-amber-900">{item.module}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold">
                Module #{idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#e8d8be]">
                <span className="text-amber-800 font-bold block text-[10px] uppercase">WHAT IT DOES</span>
                <p className="text-[#181028] mt-1 font-sans font-semibold">{item.what}</p>
              </div>

              <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#e8d8be]">
                <span className="text-emerald-800 font-bold block text-[10px] uppercase">WHY IT IS NEEDED</span>
                <p className="text-[#181028] mt-1 font-sans font-semibold">{item.why}</p>
              </div>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#e8d8be] space-y-1.5 text-xs font-sans">
              <div><strong className="text-amber-800">INPUT:</strong> <span className="text-[#181028] font-mono font-bold">{item.input}</span></div>
              <div><strong className="text-violet-800">PROCESSING:</strong> <span className="text-[#2c1e45] font-semibold">{item.processing}</span></div>
              <div><strong className="text-emerald-800">OUTPUT:</strong> <span className="text-[#181028] font-mono font-bold">{item.output}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AboutPage;
