import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FlowNode, 
  BranchRule 
} from './types';
import CanvasNodeCard from './CanvasNodeCard';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Plus, 
  Grid, 
  Move,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

interface FlowCanvasProps {
  nodes: FlowNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onUpdateNodes: (nodes: FlowNode[]) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onAddStepNode: () => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNodes,
  onDeleteNode,
  onDuplicateNode,
  onAddStepNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom states
  const [scale, setScale] = useState<number>(0.95);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Start Pan
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    // Only left click on canvas background
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  // Node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onSelectNode(nodeId);
    setDraggingNodeId(nodeId);

    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    // Calculate mouse position relative to node coordinate in scaled space
    const mouseCanvasX = (e.clientX - panOffset.x) / scale;
    const mouseCanvasY = (e.clientY - panOffset.y) / scale;

    setDragOffset({
      x: mouseCanvasX - targetNode.x,
      y: mouseCanvasY - targetNode.y
    });
  };

  // Mouse Move on window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      } else if (draggingNodeId) {
        const mouseCanvasX = (e.clientX - panOffset.x) / scale;
        const mouseCanvasY = (e.clientY - panOffset.y) / scale;

        const newX = Math.round(mouseCanvasX - dragOffset.x);
        const newY = Math.round(mouseCanvasY - dragOffset.y);

        onUpdateNodes(
          nodes.map(n => n.id === draggingNodeId ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n)
        );
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, draggingNodeId, dragOffset, panOffset, scale, nodes, onUpdateNodes]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.4), 1.6);
    setScale(newScale);
  };

  // Auto layout nodes neatly
  const handleAutoLayout = () => {
    // Sort nodes roughly by stepNumber
    const sorted = [...nodes].sort((a, b) => a.stepNumber - b.stepNumber);
    
    // Group into columns based on flow progression
    const layoutNodes = sorted.map((node, index) => {
      let col = node.stepNumber - 1;
      let row = 0;
      
      // If branched nodes share same stepNumber (e.g. 3-A, 3-B, 3-C)
      const siblings = sorted.filter(n => n.stepNumber === node.stepNumber);
      if (siblings.length > 1) {
        row = siblings.indexOf(node);
      }

      return {
        ...node,
        x: 60 + col * 400,
        y: 120 + row * 240
      };
    });

    onUpdateNodes(layoutNodes);
    setPanOffset({ x: 50, y: 50 });
    setScale(0.9);
  };

  const handleResetView = () => {
    setScale(0.9);
    setPanOffset({ x: 60, y: 40 });
  };

  // Pre-calculate all connection lines
  interface ConnectionLine {
    id: string;
    sourceId: string;
    targetId: string;
    label?: string;
    isBranch: boolean;
    color: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  const connections: ConnectionLine[] = useMemo(() => {
    const list: ConnectionLine[] = [];
    const nodeMap = new Map<string, FlowNode>(nodes.map(n => [n.id, n]));

    const nodeWidth = 320;
    const portOffsetY = 56; // matches the top-14 anchor dot in CanvasNodeCard

    nodes.forEach(source => {
      // 1. If node has condition branches
      if (source.branches && source.branches.length > 0) {
        source.branches.forEach((branch, idx) => {
          const target = nodeMap.get(branch.targetNodeId);
          if (target) {
            const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706'];
            list.push({
              id: `conn-${source.id}-${branch.id}-${idx}`,
              sourceId: source.id,
              targetId: target.id,
              label: branch.name || branch.conditionLabel || branch.optionValue,
              isBranch: true,
              color: colors[idx % colors.length],
              x1: source.x + nodeWidth,
              y1: source.y + portOffsetY,
              x2: target.x,
              y2: target.y + portOffsetY
            });
          }
        });
      } else if (source.defaultNextNodeId) {
        // 2. Default sequential connection
        const target = nodeMap.get(source.defaultNextNodeId);
        if (target) {
          list.push({
            id: `conn-${source.id}-default`,
            sourceId: source.id,
            targetId: target.id,
            label: '确认流转',
            isBranch: false,
            color: '#3b82f6',
            x1: source.x + nodeWidth,
            y1: source.y + portOffsetY,
            x2: target.x,
            y2: target.y + portOffsetY
          });
        }
      }
    });

    return list;
  }, [nodes]);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleBackgroundMouseDown}
      onWheel={handleWheel}
      className="flex-1 h-full bg-[#f8fafc] relative overflow-hidden select-none cursor-default"
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, #cbd5e1 1.2px, transparent 0),
          linear-gradient(to right, #f1f5f9 1px, transparent 1px),
          linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px, 120px 120px, 120px 120px',
      }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-40 flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md">
        <button
          onClick={onAddStepNode}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>+ 步骤卡片</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={() => setScale(s => Math.min(s + 0.1, 1.5))}
          title="放大"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ZoomIn size={15} />
        </button>
        <span className="text-[11px] font-mono text-slate-500 w-10 text-center font-semibold">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.max(s - 0.1, 0.4))}
          title="缩小"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ZoomOut size={15} />
        </button>

        <button
          onClick={handleResetView}
          title="居中重置视口"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors ml-1"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={handleAutoLayout}
          title="自动规整排版"
          className="flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
        >
          <Compass size={14} />
          <span>规整画布</span>
        </button>
      </div>

      {/* Floating Canvas Legend */}
      <div className="absolute bottom-4 left-4 z-40 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-600 flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <span>条件分支流转</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span>直接流转</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <span>画布支持按住空白处平移与滚轮缩放</span>
        </div>
      </div>

      {/* Transformable Canvas Layer */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4000px',
          height: '3000px',
          pointerEvents: 'auto'
        }}
        onClick={() => onSelectNode('')}
      >
        {/* SVG Bezier Connection Lines Layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker
              id="arrow-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#7c3aed" />
            </marker>
            <marker
              id="arrow-green"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669" />
            </marker>
            <marker
              id="arrow-amber"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#d97706" />
            </marker>
          </defs>

          {connections.map((conn) => {
            const dx = Math.abs(conn.x2 - conn.x1) * 0.5;
            // Bezier control points
            const cp1x = conn.x1 + Math.max(dx, 80);
            const cp1y = conn.y1;
            const cp2x = conn.x2 - Math.max(dx, 80);
            const cp2y = conn.y2;
            const pathData = `M ${conn.x1} ${conn.y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${conn.x2} ${conn.y2}`;

            // Midpoint approximation for branch label
            const midX = (conn.x1 + conn.x2) / 2;
            const midY = (conn.y1 + conn.y2) / 2;

            const isHighlighted = selectedNodeId === conn.sourceId || selectedNodeId === conn.targetId;

            return (
              <g key={conn.id} className="transition-all duration-200">
                {/* Background glow path when highlighted */}
                {isHighlighted && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth="8"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                )}

                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={conn.isBranch ? 'none' : '6 4'}
                  markerEnd="url(#arrow-blue)"
                  className="transition-all"
                />

                {/* Condition Pill Tag on Curve */}
                {conn.label && (
                  <foreignObject
                    x={midX - 70}
                    y={midY - 14}
                    width={140}
                    height={32}
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex items-center justify-center">
                      <div 
                        className={`
                          px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs truncate max-w-[130px] border
                          ${conn.isBranch 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20' 
                            : 'bg-white text-slate-600 border-slate-300'}
                        `}
                        title={conn.label}
                      >
                        {conn.label}
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => (
          <CanvasNodeCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onMouseDownDrag={handleNodeMouseDown}
            allNodes={nodes}
          />
        ))}
      </div>
    </div>
  );
};

export default FlowCanvas;
