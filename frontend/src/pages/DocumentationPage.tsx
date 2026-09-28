import React from 'react';
import { BookOpen, Layers, GitCommit, Table, AlertTriangle, Binary, Zap, Cpu, Bot, CheckCircle2 } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const sections = [
    {
      title: '1. What is NL2C Compiler?',
      icon: BookOpen,
      content: `NL2C Compiler is an intelligent mini-project platform for Compiler Design. It takes natural-language programming requirements (e.g. "Write a C program to find the largest of three numbers") and converts them into standard C source code using Generative AI, then passes the generated program through a full 9-stage interactive compiler pipeline.`
    },
    {
      title: '2. How Natural Language to C Code Generation Works',
      icon: Bot,
      content: `The system uses Generative AI with strict prompt engineering rules. The AI model is instructed to act as a senior C compiler assistant, returning pure C source code adhering to C11 standard without markdown fence contamination. Clean C code is then extracted and passed directly to the local compiler pipeline.`
    },
    {
      title: '3. Lexical Analysis (Tokenizer)',
      icon: Layers,
      content: `The Lexical Analyzer (implemented in Python) scans raw C source code character-by-character and groups characters into meaningful atomic units called Tokens. Tokens belong to distinct categories: KEYWORD (int, if, return), IDENTIFIER (main, x, sum), INT_CONST / FLOAT_CONST (10, 3.14), STRING_LITERAL ("hello"), OPERATOR (+, ==, &&), DELIMITER ({, }, ;), and PREPROCESSOR directives (#include).`
    },
    {
      title: '4. Syntax Analysis & Parsing',
      icon: CheckCircle2,
      content: `The Syntax Analyzer verifies whether the token stream satisfies C language grammar rules. It validates statement terminations (semicolons ';'), checks bracket/parentheses matching balance ({}, ()), and ensures valid expression structures.`
    },
    {
      title: '5. Abstract Syntax Tree (AST)',
      icon: GitCommit,
      content: `An Abstract Syntax Tree is a hierarchical tree representation of the abstract syntactic structure of C code. Each node corresponds to a construct (FunctionDecl, VarDecl, BinaryExpr, AssignmentExpr, IfStmt, ReturnStmt).`
    },
    {
      title: '6. Symbol Table Construction',
      icon: Table,
      content: `The Symbol Table is a core compiler data structure that stores information about identifiers declared in the program. Each entry records the Identifier Name, Data Type (int, float), Scope (global, main), Kind (variable, function, parameter), Initial Value, and Array dimensions.`
    },
    {
      title: '7. Semantic Analysis',
      icon: AlertTriangle,
      content: `Semantic Analysis ensures that statements make logical sense within the scope rules of C. It checks for: 1) Undeclared variable usages, 2) Duplicate variable declarations in the same scope, 3) Return type compatibility in main.`
    },
    {
      title: '8. Intermediate Representation (Three-Address Code / TAC)',
      icon: Binary,
      content: `Three-Address Code (TAC) simplifies complex expressions into basic statements containing at most three operands and one operator (e.g. t1 = c * d; t2 = b + t1; a = t2). TAC bridges high-level source code and machine assembly generation.`
    },
    {
      title: '9. Compiler Optimization',
      icon: Zap,
      content: `Basic optimization passes evaluate arithmetic constants at compile-time (Constant Folding, e.g. 10 * 20 -> 200), simplify algebraic identities (x + 0 -> x), and identify unreachable dead code statements.`
    },
    {
      title: '10. GCC Compilation & Sandboxed Execution',
      icon: Cpu,
      content: `The backend invokes GCC using strict compilation flags (-Wall -Wextra -std=c11) inside an isolated temporary sandbox directory with process execution timeouts (5s max) and input redirection (stdin/stdout capture). If GCC is absent on host, an embedded Python C Interpreter provides execution fallback.`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 font-mono text-[#181028]">
      <div className="border-b border-[#ebdcc5] pb-4">
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <span className="bg-gradient-to-r from-violet-950 via-purple-900 to-amber-700 bg-clip-text text-transparent">
            NL2C COMPILER DESIGN DOCUMENTATION
          </span>
        </h1>
        <p className="text-xs text-[#52416b] font-sans mt-0.5 font-semibold">
          Comprehensive theoretical and technical reference guide covering compiler design principles and Generative AI integration.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-[#e8d8be] space-y-2 bg-white shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Icon className="w-4 h-4 text-amber-600" />
                <span>{sec.title}</span>
              </div>
              <p className="text-xs text-[#2c1e45] font-sans leading-relaxed font-medium">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DocumentationPage;
