import React from 'react';
import { 
  FlowNode, 
  FlowCardComponent,
  BranchRule 
} from './types';
import { 
  MessageSquareText, 
  AlertTriangle, 
  CircleDot, 
  CheckSquare, 
  TextCursorInput, 
  BookOpen, 
  SendHorizontal,
  GitBranch,
  ArrowRight,
  Trash2,
  Copy,
  CheckCircle2,
  HelpCircle,
  Move
} from 'lucide-react';

interface CanvasNodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMouseDownDrag: (e: React.MouseEvent, nodeId: string) => void;
  allNodes: FlowNode[];
}

export const CanvasNodeCard: React.FC<CanvasNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDeleteNode,
  onDuplicateNode,
  onMouseDownDrag,
  allNodes
}) => {
  // Helper to find target node code/title
  const getTargetNodeDisplay = (targetId: string) => {
    const target = allNodes.find(n => n.id === targetId);
    return target ? `${target.nodeCode} ${target.shortTitle}` : targetId;
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'SPEECH': return <MessageSquareText size={12} className="text-blue-500" />;
      case 'NOTICE': return <AlertTriangle size={12} className="text-amber-500" />;
      case 'RADIO': return <CircleDot size={12} className="text-indigo-500" />;
      case 'CHECKBOX': return <CheckSquare size={12} className="text-emerald-500" />;
      case 'INPUT': return <TextCursorInput size={12} className="text-cyan-500" />;
      case 'GUIDE': return <BookOpen size={12} className="text-purple-500" />;
      case 'BUTTON': return <SendHorizontal size={12} className="text-sky-500" />;
      default: return null;
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        position: 'absolute',
        width: 320,
        zIndex: isSelected ? 30 : 10
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`
        rounded-2xl transition-shadow duration-150 select-none bg-white border cursor-pointer
        ${isSelected 
          ? 'ring-4 ring-blue-500/25 border-blue-500 shadow-xl shadow-blue-500/15' 
          : 'border-slate-300/80 shadow-md hover:shadow-lg hover:border-blue-300'}
      `}
    >
      {/* Left Input Port / Anchor */}
      <div 
        className="absolute -left-2.5 top-14 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm z-20"
        title="输入连接点"
      >
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      </div>

      {/* Right Output Port / Anchor */}
      <div 
        className="absolute -right-2.5 top-14 w-5 h-5 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm z-20"
        title="输出连接点"
      >
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
      </div>

      {/* Card Header (Drag Handle) */}
      <div 
        onMouseDown={(e) => onMouseDownDrag(e, node.id)}
        className={`
          px-3.5 py-2.5 rounded-t-2xl flex items-center justify-between border-b cursor-grab active:cursor-grabbing
          ${isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-800 text-slate-100 border-slate-700'}
        `}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`
            px-2 py-0.5 rounded text-[11px] font-mono font-bold
            ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/30 text-blue-300 border border-blue-400/30'}
          `}>
            {node.nodeCode}
          </div>

          <div className="truncate font-semibold text-[13px]" title={node.title}>
            {node.shortTitle || node.title}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDuplicateNode(node.id)}
            title="复制节点"
            className="p-1 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteNode(node.id)}
            title="删除节点"
            className="p-1 rounded hover:bg-rose-500 text-slate-300 hover:text-white transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <div className="p-1 text-slate-400 cursor-grab active:cursor-grabbing">
            <Move size={13} />
          </div>
        </div>
      </div>

      {/* Node Meta Subbar */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium truncate max-w-[170px]">
          {node.categoryTag || '流程节点'}
        </span>
        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
          node.requiresClientConfirm
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {node.requiresClientConfirm ? '需客户端确认' : '告知型卡片'}
        </span>
      </div>

      {/* Component Stack Preview */}
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto custom-scrollbar bg-slate-50/50">
        {node.components.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
            暂无卡片组件，点击左侧物料库添加
          </div>
        ) : (
          node.components.map((comp, idx) => (
            <div 
              key={comp.id || idx}
              className="bg-white border border-slate-200 rounded-lg p-2 text-[11px] shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                  {getComponentIcon(comp.type)}
                  <span className="truncate max-w-[180px]">{comp.title || comp.type}</span>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.2 rounded font-mono">
                  #{idx + 1}
                </span>
              </div>

              {/* Component specific miniature preview */}
              {comp.type === 'SPEECH' && (
                <p className="text-[10px] text-slate-500 line-clamp-2 bg-blue-50/50 p-1 rounded border border-blue-100/50">
                  {comp.speechText}
                </p>
              )}

              {comp.type === 'NOTICE' && (
                <div className="text-[10px] text-amber-700 bg-amber-50/80 p-1 rounded border border-amber-200/60 truncate">
                  {comp.noticeText}
                </div>
              )}

              {comp.type === 'RADIO' && (
                <div className="space-y-1 mt-1">
                  {comp.options.slice(0, 3).map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                      <span className="truncate max-w-[150px]">● {opt.label}</span>
                      {opt.targetNodeId && (
                        <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1 rounded flex items-center space-x-0.5">
                          <span>➜</span>
                          <span className="truncate max-w-[60px]">{getTargetNodeDisplay(opt.targetNodeId)}</span>
                        </span>
                      )}
                    </div>
                  ))}
                  {comp.options.length > 3 && (
                    <div className="text-[9px] text-slate-400 text-center">+{comp.options.length - 3} 个选项</div>
                  )}
                </div>
              )}

              {comp.type === 'CHECKBOX' && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {comp.options.map(opt => (
                    <span key={opt.id} className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded truncate max-w-[90px]">
                      ☑ {opt.label}
                    </span>
                  ))}
                </div>
              )}

              {comp.type === 'INPUT' && (
                <div className="text-[10px] text-slate-400 bg-slate-50 border border-dashed border-slate-200 px-2 py-1 rounded truncate">
                  {comp.placeholder || '客户输入框'}
                </div>
              )}

              {comp.type === 'GUIDE' && (
                <div className="text-[10px] text-purple-700 bg-purple-50/60 p-1.5 rounded border border-purple-100">
                  <div className="font-semibold truncate">渠道: {(comp as any).channelName}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {(comp as any).sections && (comp as any).sections.length > 0 
                      ? `${(comp as any).sections.length} 组指引说明` 
                      : `${(comp as any).pathSteps?.length || 0} 项步骤 · ${(comp as any).materials?.length || 0} 项材料`}
                  </div>
                </div>
              )}

              {comp.type === 'BUTTON' && (
                <div className="text-center py-1 bg-blue-50 text-blue-600 font-semibold rounded text-[10px] border border-blue-200">
                  {comp.buttonText}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Card Footer: Outgoing Branch Summary */}
      <div className="px-3 py-2 bg-white rounded-b-2xl border-t border-slate-200 text-[10px]">
        {node.branches && node.branches.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-slate-500 font-semibold">
              <GitBranch size={11} className="text-blue-500" />
              <span>条件分支 ({node.branches.length}条):</span>
            </div>
            {node.branches.map((b) => (
              <div 
                key={b.id} 
                className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 px-2 py-0.5 rounded text-blue-800"
              >
                <span className="truncate max-w-[130px]" title={b.name || b.conditionLabel || b.optionValue}>
                  {b.name || b.conditionLabel || b.optionValue || '组合流转条件'}
                </span>
                <span className="flex items-center space-x-1 font-semibold text-blue-600">
                  <ArrowRight size={10} />
                  <span className="truncate max-w-[90px]">{getTargetNodeDisplay(b.targetNodeId)}</span>
                </span>
              </div>
            ))}
          </div>
        ) : node.defaultNextNodeId ? (
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium">无条件流转:</span>
            <span className="flex items-center space-x-1 text-blue-600 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              <ArrowRight size={10} />
              <span className="truncate max-w-[120px]">{getTargetNodeDisplay(node.defaultNextNodeId)}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span className="flex items-center space-x-1">
              <CheckCircle2 size={11} />
              <span>流程终点 (办结)</span>
            </span>
            <span className="text-slate-400 text-[9px]">流程结束</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasNodeCard;
