import React, { useState } from 'react';
import { ASTNode } from '../types/compiler';
import { GitCommit, ChevronRight, ChevronDown, Info } from 'lucide-react';

interface ASTViewerProps {
  ast: ASTNode | null;
}

export const ASTViewer: React.FC<ASTViewerProps> = ({ ast }) => {
  const [selectedNode, setSelectedNode] = useState<ASTNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ node_root: true });

  if (!ast) {
    return (
      <div className="flex items-center justify-center h-full text-[#6e5d8a] font-mono text-xs font-bold bg-white">
        No AST available. Run Compiler Analysis to generate Abstract Syntax Tree.
      </div>
    );
  }

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Program': return 'text-amber-900 bg-amber-100 border-amber-300';
      case 'FunctionDecl': return 'text-violet-900 bg-violet-100 border-violet-300';
      case 'VarDecl': return 'text-emerald-900 bg-emerald-100 border-emerald-300';
      case 'BinaryExpr': return 'text-orange-900 bg-orange-100 border-orange-300';
      case 'AssignmentExpr': return 'text-indigo-900 bg-indigo-100 border-indigo-300';
      case 'CallExpr': return 'text-amber-900 bg-yellow-100 border-yellow-300';
      case 'IfStmt':
      case 'WhileStmt':
      case 'ForStmt': return 'text-rose-900 bg-rose-100 border-rose-300';
      case 'ReturnStmt': return 'text-teal-900 bg-teal-100 border-teal-300';
      default: return 'text-[#181028] bg-slate-100 border-slate-300';
    }
  };

  const renderNode = (node: ASTNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] !== false;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="font-mono text-xs my-1">
        <div
          onClick={() => setSelectedNode(node)}
          className={`flex items-center gap-2 py-1 px-2.5 rounded-lg border cursor-pointer transition ${
            isSelected
              ? 'ring-2 ring-amber-500 shadow-sm bg-amber-50 border-amber-400 font-bold'
              : 'hover:bg-amber-50/60 border-[#e8d8be] bg-white'
          }`}
          style={{ marginLeft: `${depth * 18}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className="p-0.5 hover:bg-amber-100 rounded text-amber-700"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 inline-block text-center text-[#8c7b9e]">•</span>
          )}

          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getNodeColor(node.type)}`}>
            {node.type}
          </span>

          <span className="text-[#181028] font-bold">{node.label}</span>
          <span className="text-[10px] text-[#6e5d8a] font-semibold ml-auto">Line {node.line}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-[#ebdcc5] ml-4 pl-1">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-3 font-mono bg-white text-[#181028]">
      {/* Tree Panel */}
      <div className="md:col-span-2 flex flex-col h-full bg-[#fdfbf7] rounded-xl border border-[#e8d8be] p-3 overflow-auto shadow-inner">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ebdcc5]">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-xs text-[#181028] tracking-wide">ABSTRACT SYNTAX TREE (AST)</span>
          </div>
          <span className="text-[10px] text-[#6e5d8a] font-semibold">Click node for structural details</span>
        </div>
        <div className="flex-1 overflow-auto">{renderNode(ast)}</div>
      </div>

      {/* Node Detail Inspector Sidebar */}
      <div className="bg-[#faf6ee] rounded-xl border border-[#e8d8be] p-3.5 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-[#ebdcc5] text-amber-900 font-bold text-xs">
          <Info className="w-4 h-4 text-amber-600" />
          <span>AST NODE INSPECTOR</span>
        </div>

        {selectedNode ? (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#6e5d8a] text-[10px] block uppercase font-bold">Node ID</span>
              <span className="font-bold text-[#181028]">{selectedNode.id}</span>
            </div>
            <div>
              <span className="text-[#6e5d8a] text-[10px] block uppercase font-bold">Node Type</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getNodeColor(selectedNode.type)}`}>
                {selectedNode.type}
              </span>
            </div>
            <div>
              <span className="text-[#6e5d8a] text-[10px] block uppercase font-bold">Source Line</span>
              <span className="text-[#181028] font-semibold">Line {selectedNode.line}</span>
            </div>
            <div>
              <span className="text-[#6e5d8a] text-[10px] block uppercase font-bold">Node Label</span>
              <span className="text-amber-900 font-bold">{selectedNode.label}</span>
            </div>
            <div>
              <span className="text-[#6e5d8a] text-[10px] block uppercase font-bold">Extracted Attributes</span>
              <pre className="mt-1 p-2 bg-white rounded-lg text-[11px] text-amber-900 overflow-x-auto border border-[#e8d8be] font-bold shadow-inner">
                {JSON.stringify(selectedNode.details, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#6e5d8a] text-xs font-bold">
            Select any node in the AST tree to view structural attributes and child relations.
          </div>
        )}
      </div>
    </div>
  );
};
