import React, { useState } from 'react';
import { 
  FlowNode, 
  FlowCardComponent,
  BranchRule,
  ConditionItem,
  CardComponentType,
  RadioComponentConfig,
  NoticeComponentConfig,
  SpeechComponentConfig,
  CheckboxComponentConfig,
  InputComponentConfig,
  GuideComponentConfig,
  GuideSection,
  ButtonComponentConfig
} from './types';
import { createDefaultComponent } from './CardComponentLibrary';
import { 
  X, 
  Layers, 
  GitBranch, 
  Eye, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Smartphone, 
  Headphones, 
  Check, 
  Info,
  HelpCircle,
  MessageSquareText,
  AlertTriangle,
  CircleDot,
  CheckSquare,
  TextCursorInput,
  BookOpen,
  SendHorizontal,
  Split,
  PlusCircle,
  Equal,
  AlignLeft,
  FileText
} from 'lucide-react';

interface NodeConfigDrawerProps {
  node: FlowNode | null;
  allNodes: FlowNode[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (updatedNode: FlowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  allNodes,
  isOpen,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onSelectNode
}) => {
  const [activeTab, setActiveTab] = useState<'COMPONENTS' | 'BRANCHES' | 'PREVIEW'>('COMPONENTS');
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'AGENT' | 'CLIENT'>('AGENT');

  if (!isOpen || !node) return null;

  // Other nodes excluding current one (for target selecting)
  const candidateTargetNodes = allNodes.filter(n => n.id !== node.id);

  // Helper: extract all input / selectable components from current node for rule builder
  const interactiveComponents = node.components.filter(
    c => c.type === 'RADIO' || c.type === 'CHECKBOX' || c.type === 'INPUT'
  );

  // Helper to get normalized guide sections
  const getGuideSections = (comp: GuideComponentConfig): GuideSection[] => {
    if (comp.sections && comp.sections.length > 0) {
      return comp.sections;
    }
    // Backward compatible migration
    const initialSections: GuideSection[] = [];
    if (comp.pathSteps && comp.pathSteps.length > 0) {
      initialSections.push({
        id: `sec-${Date.now()}-path`,
        title: '办理操作路径',
        content: comp.pathSteps.join('\n')
      });
    }
    if (comp.materials && comp.materials.length > 0) {
      initialSections.push({
        id: `sec-${Date.now()}-mat`,
        title: '所需证件材料',
        content: comp.materials.join('\n')
      });
    }
    if (comp.duration) {
      initialSections.push({
        id: `sec-${Date.now()}-dur`,
        title: '办理时效与耗时',
        content: comp.duration
      });
    }
    if (comp.notices && comp.notices.length > 0) {
      initialSections.push({
        id: `sec-${Date.now()}-not`,
        title: '关键注意事项',
        content: comp.notices.join('\n')
      });
    }
    if (initialSections.length === 0) {
      initialSections.push({
        id: `sec-${Date.now()}-def`,
        title: '办理路径与说明',
        content: '第一步：登录对应业务渠道\n第二步：完成身份核验与信息确认'
      });
    }
    return initialSections;
  };

  // Component manipulations
  const handleUpdateComponent = (compIndex: number, updatedComp: FlowCardComponent) => {
    const newComponents = [...node.components];
    newComponents[compIndex] = updatedComp;
    onUpdateNode({
      ...node,
      components: newComponents
    });
  };

  const handleAddComponent = (type: CardComponentType) => {
    const newComp = createDefaultComponent(type);
    const updated = {
      ...node,
      components: [...node.components, newComp]
    };
    onUpdateNode(updated);
    setExpandedCompId(newComp.id);
  };

  const handleDeleteComponent = (compIndex: number) => {
    const targetComp = node.components[compIndex];
    const newComponents = node.components.filter((_, idx) => idx !== compIndex);
    // Also remove any conditions referencing this component
    const updatedBranches = node.branches?.map(b => ({
      ...b,
      conditions: b.conditions?.filter(c => c.componentId !== targetComp.id) || []
    })).filter(b => (b.conditions && b.conditions.length > 0) || b.optionValue);

    onUpdateNode({
      ...node,
      components: newComponents,
      branches: updatedBranches
    });
  };

  const handleMoveComponent = (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === node.components.length - 1)) {
      return;
    }
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const newComponents = [...node.components];
    const temp = newComponents[index];
    newComponents[index] = newComponents[targetIndex];
    newComponents[targetIndex] = temp;
    onUpdateNode({
      ...node,
      components: newComponents
    });
  };

  // Guide Section manipulations (Requirement 2)
  const handleAddGuideSection = (compIndex: number, guideComp: GuideComponentConfig) => {
    const curSections = getGuideSections(guideComp);
    const newSec: GuideSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: '新增指引项 (如: 温馨提示 / 办理渠道)',
      content: '请在此输入具体办理指引内容、步骤或补充说明...'
    };
    const updatedGuide: GuideComponentConfig = {
      ...guideComp,
      sections: [...curSections, newSec]
    };
    handleUpdateComponent(compIndex, updatedGuide);
  };

  const handleUpdateGuideSection = (
    compIndex: number, 
    guideComp: GuideComponentConfig, 
    secIndex: number, 
    field: 'title' | 'content', 
    val: string
  ) => {
    const curSections = [...getGuideSections(guideComp)];
    curSections[secIndex] = {
      ...curSections[secIndex],
      [field]: val
    };
    handleUpdateComponent(compIndex, {
      ...guideComp,
      sections: curSections
    });
  };

  const handleDeleteGuideSection = (compIndex: number, guideComp: GuideComponentConfig, secIndex: number) => {
    const curSections = getGuideSections(guideComp);
    if (curSections.length <= 1) {
      alert('详细指引卡至少需保留一个标题+内容组合');
      return;
    }
    const updatedSections = curSections.filter((_, i) => i !== secIndex);
    handleUpdateComponent(compIndex, {
      ...guideComp,
      sections: updatedSections
    });
  };

  // Branch Rule Builder manipulations (Requirement 3: unified in Branch Rule area, supports AND/OR, multi-condition, radio & inputs)
  const handleAddBranchRule = () => {
    const defaultComp = interactiveComponents[0];
    const initialCondition: ConditionItem = {
      id: `cond-${Date.now()}-1`,
      componentId: defaultComp?.id || '',
      fieldName: (defaultComp as any)?.fieldName || 'selection',
      operator: 'EQUALS',
      value: (defaultComp as any)?.options?.[0]?.value || ''
    };

    const newRule: BranchRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `分支流转规则 ${(node.branches?.length || 0) + 1}`,
      logicalOperator: 'AND',
      conditions: defaultComp ? [initialCondition] : [],
      targetNodeId: candidateTargetNodes[0]?.id || '',
      desc: '符合该组合规则时自动流转至指定节点'
    };

    onUpdateNode({
      ...node,
      branches: [...(node.branches || []), newRule]
    });
  };

  const handleUpdateBranchRule = (ruleIndex: number, updatedRule: BranchRule) => {
    const newBranches = [...(node.branches || [])];
    newBranches[ruleIndex] = updatedRule;
    onUpdateNode({
      ...node,
      branches: newBranches
    });
  };

  const handleDeleteBranchRule = (ruleIndex: number) => {
    const newBranches = (node.branches || []).filter((_, i) => i !== ruleIndex);
    onUpdateNode({
      ...node,
      branches: newBranches
    });
  };

  const handleAddConditionToRule = (ruleIndex: number) => {
    const targetRule = (node.branches || [])[ruleIndex];
    if (!targetRule) return;

    const defaultComp = interactiveComponents[0];
    const newCond: ConditionItem = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      componentId: defaultComp?.id || '',
      fieldName: (defaultComp as any)?.fieldName || '',
      operator: 'EQUALS',
      value: (defaultComp as any)?.options?.[0]?.value || ''
    };

    handleUpdateBranchRule(ruleIndex, {
      ...targetRule,
      conditions: [...(targetRule.conditions || []), newCond]
    });
  };

  const handleUpdateConditionInRule = (
    ruleIndex: number, 
    condIndex: number, 
    updatedCond: Partial<ConditionItem>
  ) => {
    const targetRule = (node.branches || [])[ruleIndex];
    if (!targetRule) return;

    const newConditions = [...(targetRule.conditions || [])];
    newConditions[condIndex] = {
      ...newConditions[condIndex],
      ...updatedCond
    };

    handleUpdateBranchRule(ruleIndex, {
      ...targetRule,
      conditions: newConditions
    });
  };

  const handleDeleteConditionFromRule = (ruleIndex: number, condIndex: number) => {
    const targetRule = (node.branches || [])[ruleIndex];
    if (!targetRule) return;

    const newConditions = (targetRule.conditions || []).filter((_, i) => i !== condIndex);
    handleUpdateBranchRule(ruleIndex, {
      ...targetRule,
      conditions: newConditions
    });
  };

  return (
    <div className="w-[430px] flex-shrink-0 bg-white border-l border-slate-200/90 h-full flex flex-col shadow-xl z-30 select-none animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
            {node.nodeCode}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-xs truncate" title={node.title}>
              {node.shortTitle || node.title}
            </h3>
            <span className="text-[10px] text-slate-400 block truncate">
              {node.categoryTag || '流程节点配置'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => onDuplicateNode(node.id)}
            title="复制节点"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteNode(node.id)}
            title="删除节点"
            className="p-1.5 rounded hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 text-xs font-semibold px-2">
        <button
          onClick={() => setActiveTab('COMPONENTS')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'COMPONENTS'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={13} />
          <span>卡片组件 ({node.components.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'BRANCHES'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch size={13} />
          <span>分支流转规则 ({node.branches?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PREVIEW'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye size={13} />
          <span>卡片预览</span>
        </button>
      </div>

      {/* Tab 1: Components Stacker & Configuration */}
      {activeTab === 'COMPONENTS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/40">
          {/* Node Meta Basics */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              步骤节点基础属性
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">阶段编号</label>
                <input
                  type="text"
                  value={node.nodeCode}
                  onChange={(e) => onUpdateNode({ ...node, nodeCode: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">阶段标签/分类</label>
                <input
                  type="text"
                  value={node.categoryTag || ''}
                  onChange={(e) => onUpdateNode({ ...node, categoryTag: e.target.value })}
                  placeholder="如: 条件分支 / 线上通道"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-medium block mb-1">完整步骤名称</label>
              <input
                type="text"
                value={node.title}
                onChange={(e) => onUpdateNode({ ...node, title: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-medium block mb-1">短标题 (坐席端导航)</label>
              <input
                type="text"
                value={node.shortTitle}
                onChange={(e) => onUpdateNode({ ...node, shortTitle: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* Interaction mode toggle */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-600 font-medium">是否需客户在APP端互动确认</span>
              <button
                type="button"
                onClick={() => onUpdateNode({ ...node, requiresClientConfirm: !node.requiresClientConfirm })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  node.requiresClientConfirm ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    node.requiresClientConfirm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Components Ordered List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                当前卡片组件清单 ({node.components.length})
              </span>
              <span className="text-[10px] text-slate-400">上下调整顺序 / 编辑属性</span>
            </div>

            {node.components.map((comp, idx) => {
              const isExpanded = expandedCompId === comp.id;

              return (
                <div
                  key={comp.id || idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-shadow hover:border-blue-300"
                >
                  {/* Item Header */}
                  <div
                    onClick={() => setExpandedCompId(isExpanded ? null : comp.id)}
                    className="p-2.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer border-b border-slate-200/60"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {comp.title || comp.type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono">
                        {comp.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleMoveComponent(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="上移"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveComponent(idx, 'DOWN')}
                        disabled={idx === node.components.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="下移"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComponent(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="删除该组件"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Component Settings */}
                  {isExpanded && (
                    <div className="p-3 bg-white space-y-3 text-xs border-t border-slate-100">
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">组件标题 (卡片标题)</label>
                        <input
                          type="text"
                          value={comp.title || ''}
                          onChange={(e) => handleUpdateComponent(idx, { ...comp, title: e.target.value })}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* 1. SPEECH */}
                      {comp.type === 'SPEECH' && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">推荐话术正文</label>
                            <textarea
                              rows={4}
                              value={(comp as SpeechComponentConfig).speechText}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as SpeechComponentConfig), speechText: e.target.value })}
                              className="w-full border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 leading-relaxed font-sans"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">语速/播报提示</label>
                            <input
                              type="text"
                              value={(comp as SpeechComponentConfig).suggestSpeed || ''}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as SpeechComponentConfig), suggestSpeed: e.target.value })}
                              placeholder="如: 语速平缓温和 / 适中"
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. NOTICE */}
                      {comp.type === 'NOTICE' && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">提示类型风格</label>
                            <select
                              value={(comp as NoticeComponentConfig).noticeType}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as NoticeComponentConfig), noticeType: e.target.value as any })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                            >
                              <option value="info">信息提示 (蓝底)</option>
                              <option value="warning">警示高亮 (黄底)</option>
                              <option value="success">成功/办结提示 (绿底)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">提示文本内容</label>
                            <textarea
                              rows={3}
                              value={(comp as NoticeComponentConfig).noticeText}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as NoticeComponentConfig), noticeText: e.target.value })}
                              className="w-full border border-slate-200 rounded p-2 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. RADIO (Requirement 3: 流转条件不要设置在选项后面，统一放置在分支流转规则区域) */}
                      {comp.type === 'RADIO' && (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">变量字段名 (FieldName)</label>
                            <input
                              type="text"
                              value={(comp as RadioComponentConfig).fieldName}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as RadioComponentConfig), fieldName: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-700">单选项列表</label>
                            <button
                              type="button"
                              onClick={() => {
                                const radioComp = comp as RadioComponentConfig;
                                const newOpt = {
                                  id: `opt-${Date.now()}-${radioComp.options.length + 1}`,
                                  label: `新选项 ${radioComp.options.length + 1}`,
                                  value: `新选项 ${radioComp.options.length + 1}`,
                                  desc: ''
                                };
                                handleUpdateComponent(idx, {
                                  ...radioComp,
                                  options: [...radioComp.options, newOpt]
                                });
                              }}
                              className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center space-x-0.5 cursor-pointer"
                            >
                              <Plus size={11} />
                              <span>添加选项</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(comp as RadioComponentConfig).options.map((opt, optIdx) => (
                              <div key={opt.id} className="p-2 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] text-slate-400 font-mono">#{optIdx + 1}</span>
                                  <input
                                    type="text"
                                    value={opt.label}
                                    placeholder="选项展示文本"
                                    onChange={(e) => {
                                      const radioComp = comp as RadioComponentConfig;
                                      const newOpts = [...radioComp.options];
                                      newOpts[optIdx] = { ...opt, label: e.target.value, value: e.target.value };
                                      handleUpdateComponent(idx, { ...radioComp, options: newOpts });
                                    }}
                                    className="flex-1 border border-slate-200 rounded px-2 py-1 bg-white text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const radioComp = comp as RadioComponentConfig;
                                      if (radioComp.options.length <= 1) return;
                                      const newOpts = radioComp.options.filter((_, i) => i !== optIdx);
                                      handleUpdateComponent(idx, { ...radioComp, options: newOpts });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 p-1"
                                    title="删除选项"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={opt.desc || ''}
                                  placeholder="选项副标题或补充说明（可选）"
                                  onChange={(e) => {
                                    const radioComp = comp as RadioComponentConfig;
                                    const newOpts = [...radioComp.options];
                                    newOpts[optIdx] = { ...opt, desc: e.target.value };
                                    handleUpdateComponent(idx, { ...radioComp, options: newOpts });
                                  }}
                                  className="w-full border border-slate-200 rounded px-2 py-1 bg-white text-[11px] text-slate-500"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-[10px] text-blue-700 flex items-start space-x-1.5">
                            <Info size={13} className="flex-shrink-0 mt-0.5 text-blue-600" />
                            <span>
                              流转规则已统一移至上方「分支流转规则」区域集中配置，可基于本单选选项与多条件组合设定流转目标。
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4. CHECKBOX */}
                      {comp.type === 'CHECKBOX' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-700 block">多选选项列表</label>
                          {(comp as CheckboxComponentConfig).options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const chkComp = comp as CheckboxComponentConfig;
                                  const newOpts = [...chkComp.options];
                                  newOpts[optIdx] = { ...opt, label: e.target.value, value: e.target.value };
                                  handleUpdateComponent(idx, { ...chkComp, options: newOpts });
                                }}
                                className="flex-1 border border-slate-200 rounded px-2 py-1 bg-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const chkComp = comp as CheckboxComponentConfig;
                                  const newOpts = chkComp.options.filter((_, i) => i !== optIdx);
                                  handleUpdateComponent(idx, { ...chkComp, options: newOpts });
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500">允许客户自定义“其他”填写项</span>
                            <input
                              type="checkbox"
                              checked={(comp as CheckboxComponentConfig).allowOther}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as CheckboxComponentConfig), allowOther: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                          </div>
                        </div>
                      )}

                      {/* 5. INPUT */}
                      {comp.type === 'INPUT' && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">字段名称 (FieldName)</label>
                            <input
                              type="text"
                              value={(comp as InputComponentConfig).fieldName}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as InputComponentConfig), fieldName: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">输入框占位提示语</label>
                            <input
                              type="text"
                              value={(comp as InputComponentConfig).placeholder}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as InputComponentConfig), placeholder: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* 6. GUIDE (Requirement 2: 通用标题+内容组合，支持添加/编辑/删除) */}
                      {comp.type === 'GUIDE' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">办理渠道/模式名称</label>
                            <input
                              type="text"
                              value={(comp as GuideComponentConfig).channelName}
                              onChange={(e) => handleUpdateComponent(idx, { ...(comp as GuideComponentConfig), channelName: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                            />
                          </div>

                          {/* Universal Title + Content Sections */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-purple-900 flex items-center space-x-1">
                                <BookOpen size={13} className="text-purple-600" />
                                <span>指引内容项（标题+内容组合）</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddGuideSection(idx, comp as GuideComponentConfig)}
                                className="px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[10px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <Plus size={11} />
                                <span>添加新组合</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {getGuideSections(comp as GuideComponentConfig).map((sec, secIdx) => (
                                <div 
                                  key={sec.id || secIdx} 
                                  className="p-2.5 rounded-xl border border-purple-200/80 bg-purple-50/30 space-y-2 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-1.5 flex-1">
                                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                                        {secIdx + 1}
                                      </span>
                                      <input
                                        type="text"
                                        value={sec.title}
                                        placeholder="指引项标题 (如: 办理路径 / 所需材料)"
                                        onChange={(e) => handleUpdateGuideSection(idx, comp as GuideComponentConfig, secIdx, 'title', e.target.value)}
                                        className="w-full text-xs font-semibold text-slate-800 bg-white border border-purple-200 rounded px-2 py-1 focus:border-purple-500 outline-none"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGuideSection(idx, comp as GuideComponentConfig, secIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="删除该组合"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>

                                  <div>
                                    <textarea
                                      rows={3}
                                      value={sec.content}
                                      placeholder="输入具体指引内容、操作步骤或说明清单..."
                                      onChange={(e) => handleUpdateGuideSection(idx, comp as GuideComponentConfig, secIdx, 'content', e.target.value)}
                                      className="w-full text-xs text-slate-700 bg-white border border-purple-200 rounded p-2 focus:border-purple-500 outline-none leading-relaxed"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 7. BUTTON */}
                      {comp.type === 'BUTTON' && (
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 font-medium block mb-1">按钮显示文案</label>
                          <input
                            type="text"
                            value={(comp as ButtonComponentConfig).buttonText}
                            onChange={(e) => handleUpdateComponent(idx, { ...(comp as ButtonComponentConfig), buttonText: e.target.value })}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-blue-600"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Component Quick Actions */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
              + 添加卡片组件到当前节点
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddComponent('SPEECH')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer text-left font-medium"
              >
                <MessageSquareText size={12} />
                <span>推荐话术</span>
              </button>
              <button
                onClick={() => handleAddComponent('NOTICE')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer text-left font-medium"
              >
                <AlertTriangle size={12} />
                <span>提示警示栏</span>
              </button>
              <button
                onClick={() => handleAddComponent('RADIO')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer text-left font-medium"
              >
                <CircleDot size={12} />
                <span>单选选项组</span>
              </button>
              <button
                onClick={() => handleAddComponent('CHECKBOX')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer text-left font-medium"
              >
                <CheckSquare size={12} />
                <span>多选选项组</span>
              </button>
              <button
                onClick={() => handleAddComponent('INPUT')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer text-left font-medium"
              >
                <TextCursorInput size={12} />
                <span>文本输入框</span>
              </button>
              <button
                onClick={() => handleAddComponent('GUIDE')}
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer text-left font-medium"
              >
                <BookOpen size={12} />
                <span>通用指引卡</span>
              </button>
              <button
                onClick={() => handleAddComponent('BUTTON')}
                className="col-span-2 flex items-center justify-center space-x-1.5 px-2 py-1.5 text-[11px] rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer text-center font-semibold"
              >
                <SendHorizontal size={12} />
                <span>操作/提交按钮</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Branches Management (Requirement 3: Unified Branch Flow Rules) */}
      {activeTab === 'BRANCHES' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/40">
          {/* Header Explanation */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <GitBranch size={16} className="text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">分支流转规则配置区</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              流转条件统一在此管理。支持无条件流转至下个步骤，或根据当前卡片选项（单选/多选）及输入框内容组合成多条件规则（支持「且/或」关系），符合规则的自动流转至指定目标步骤。
            </p>
          </div>

          {/* 1. Default / Unconditional Next Node */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>默认 / 无条件流转至下一步</span>
              </label>
              <span className="text-[10px] text-slate-400">兜底流转</span>
            </div>
            <p className="text-[10px] text-slate-400">
              当未匹配任何条件分支，或步骤为直接办理确认时，默认流转至的目标节点。
            </p>
            <select
              value={node.defaultNextNodeId || ''}
              onChange={(e) => onUpdateNode({ ...node, defaultNextNodeId: e.target.value || undefined })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:border-blue-500 font-medium text-slate-800"
            >
              <option value="">-- 无下一节点 (本步骤即为流程终点) --</option>
              {candidateTargetNodes.map(tNode => (
                <option key={tNode.id} value={tNode.id}>
                  {tNode.nodeCode} {tNode.shortTitle || tNode.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Active Combinational Branch Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                组合条件流转规则 ({node.branches?.length || 0}条)
              </div>
              <button
                type="button"
                onClick={handleAddBranchRule}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus size={12} />
                <span>新建流转规则</span>
              </button>
            </div>

            {node.branches && node.branches.length > 0 ? (
              node.branches.map((rule, rIdx) => {
                const targetNode = allNodes.find(n => n.id === rule.targetNodeId);
                // Ensure conditions exist
                const conditions = rule.conditions || [];

                return (
                  <div 
                    key={rule.id || rIdx} 
                    className="p-3 bg-white border border-blue-200 rounded-xl shadow-2xs space-y-3"
                  >
                    {/* Rule Top Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                          {rIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={rule.name || rule.conditionLabel || `规则 ${rIdx + 1}`}
                          onChange={(e) => handleUpdateBranchRule(rIdx, { ...rule, name: e.target.value })}
                          className="text-xs font-bold text-slate-800 border border-slate-200 rounded px-2 py-0.5 bg-slate-50 focus:bg-white flex-1 outline-none"
                        />
                      </div>

                      {/* Logical Operator AND / OR */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleUpdateBranchRule(rIdx, { ...rule, logicalOperator: 'AND' })}
                          className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            rule.logicalOperator !== 'OR'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          且 (AND)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBranchRule(rIdx, { ...rule, logicalOperator: 'OR' })}
                          className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            rule.logicalOperator === 'OR'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          或 (OR)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBranchRule(rIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="删除该规则"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Conditions List */}
                    <div className="space-y-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                        <span>
                          触发判定条件 (满足{rule.logicalOperator === 'OR' ? '任一' : '全部'}条件):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddConditionToRule(rIdx)}
                          className="text-blue-600 hover:underline flex items-center space-x-0.5 cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>添加判定项</span>
                        </button>
                      </div>

                      {conditions.length === 0 ? (
                        <div className="text-[10px] text-slate-400 text-center py-2 border border-dashed border-slate-200 rounded">
                          {rule.optionValue ? (
                            <span>兼容旧单选规则: 选中 [{rule.optionValue}]</span>
                          ) : (
                            <span>暂未添加具体判定项，点击上方添加</span>
                          )}
                        </div>
                      ) : (
                        conditions.map((cond, cIdx) => {
                          const matchedComp = node.components.find(c => c.id === cond.componentId) || interactiveComponents[0];

                          return (
                            <div key={cond.id || cIdx} className="space-y-1 bg-white p-2 rounded border border-slate-200 text-[11px]">
                              <div className="flex items-center justify-between gap-1.5">
                                {/* Component Selector */}
                                <select
                                  value={cond.componentId}
                                  onChange={(e) => {
                                    const selectedC = node.components.find(c => c.id === e.target.value);
                                    let newVal = '';
                                    if (selectedC?.type === 'RADIO') {
                                      newVal = (selectedC as RadioComponentConfig).options[0]?.value || '';
                                    }
                                    handleUpdateConditionInRule(rIdx, cIdx, {
                                      componentId: e.target.value,
                                      fieldName: (selectedC as any)?.fieldName || '',
                                      value: newVal
                                    });
                                  }}
                                  className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 flex-1 max-w-[120px] truncate"
                                >
                                  {interactiveComponents.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.title || c.type} ({c.type})
                                    </option>
                                  ))}
                                </select>

                                {/* Operator Selector */}
                                <select
                                  value={cond.operator}
                                  onChange={(e) => handleUpdateConditionInRule(rIdx, cIdx, { operator: e.target.value as any })}
                                  className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50"
                                >
                                  <option value="EQUALS">等于 (=)</option>
                                  <option value="CONTAINS">包含</option>
                                  <option value="NOT_EQUALS">不等于 (≠)</option>
                                  <option value="IS_NOT_EMPTY">输入不为空</option>
                                  <option value="IS_EMPTY">为空</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteConditionFromRule(rIdx, cIdx)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5"
                                  title="移除条件"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                              {/* Value Input or Select */}
                              {cond.operator !== 'IS_NOT_EMPTY' && cond.operator !== 'IS_EMPTY' && (
                                <div>
                                  {matchedComp?.type === 'RADIO' ? (
                                    <select
                                      value={cond.value}
                                      onChange={(e) => handleUpdateConditionInRule(rIdx, cIdx, { value: e.target.value })}
                                      className="w-full text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-white font-medium text-blue-900"
                                    >
                                      {(matchedComp as RadioComponentConfig).options.map(opt => (
                                        <option key={opt.id} value={opt.value}>
                                          单选项: {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : matchedComp?.type === 'CHECKBOX' ? (
                                    <select
                                      value={cond.value}
                                      onChange={(e) => handleUpdateConditionInRule(rIdx, cIdx, { value: e.target.value })}
                                      className="w-full text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-white font-medium text-emerald-900"
                                    >
                                      {(matchedComp as CheckboxComponentConfig).options.map(opt => (
                                        <option key={opt.id} value={opt.value}>
                                          多选项包含: {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={cond.value}
                                      placeholder="判定客户输入框包含的文本或关键词..."
                                      onChange={(e) => handleUpdateConditionInRule(rIdx, cIdx, { value: e.target.value })}
                                      className="w-full text-[10px] border border-slate-200 rounded px-2 py-1 bg-white"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Target Node Selector */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-blue-800 flex-shrink-0">
                        满足规则流转至:
                      </span>
                      <select
                        value={rule.targetNodeId}
                        onChange={(e) => handleUpdateBranchRule(rIdx, { ...rule, targetNodeId: e.target.value })}
                        className="flex-1 text-xs font-semibold border border-blue-300 rounded px-2 py-1 bg-blue-50/50 text-blue-900 outline-none"
                      >
                        <option value="">-- 选择目标流转节点 --</option>
                        {candidateTargetNodes.map(tNode => (
                          <option key={tNode.id} value={tNode.id}>
                            {tNode.nodeCode} {tNode.shortTitle || tNode.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
                当前节点暂未配置组合流转规则。若需根据单选、多选或客户输入内容分流，请点击上方「新建流转规则」。
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: WYSIWYG Real Preview */}
      {activeTab === 'PREVIEW' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-100 flex flex-col items-center">
          {/* Mode Switcher */}
          <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200 flex items-center space-x-1 w-full max-w-xs">
            <button
              onClick={() => setPreviewMode('AGENT')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                previewMode === 'AGENT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Headphones size={13} />
              <span>坐席端辅助展示</span>
            </button>
            <button
              onClick={() => setPreviewMode('CLIENT')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                previewMode === 'CLIENT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone size={13} />
              <span>客户端手机卡片</span>
            </button>
          </div>

          {/* Preview Container */}
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>{node.title}</span>
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {node.categoryTag || '流程卡片'}
              </span>
            </div>

            {/* Render Components in exact fidelity */}
            {node.components.map((comp) => (
              <div key={comp.id}>
                {comp.type === 'SPEECH' && previewMode === 'AGENT' && (
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
                      <span>💡 推荐服务话术:</span>
                      <span className="text-blue-500 font-normal">支持一键采纳</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {(comp as SpeechComponentConfig).speechText}
                    </p>
                  </div>
                )}

                {comp.type === 'NOTICE' && (
                  <div className={`p-2.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2 ${
                    (comp as NoticeComponentConfig).noticeType === 'warning'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : (comp as NoticeComponentConfig).noticeType === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}>
                    <Info size={14} className="flex-shrink-0 mt-0.5" />
                    <div>{(comp as NoticeComponentConfig).noticeText}</div>
                  </div>
                )}

                {comp.type === 'RADIO' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      {comp.title || '单项选择'}:
                    </label>
                    <div className="space-y-1.5">
                      {(comp as RadioComponentConfig).options.map((opt, i) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            i === 0
                              ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div>{opt.label}</div>
                            {opt.desc && <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>}
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            i === 0 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}>
                            {i === 0 && <Check size={10} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comp.type === 'CHECKBOX' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      {comp.title || '多项选择'}:
                    </label>
                    <div className="space-y-1">
                      {(comp as CheckboxComponentConfig).options.map((opt, i) => (
                        <div
                          key={opt.id}
                          className="p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs bg-slate-50/50"
                        >
                          <span>{opt.label}</span>
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            i === 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {i === 0 && <Check size={10} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comp.type === 'INPUT' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {comp.title || (comp as InputComponentConfig).label || '输入信息'}:
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={(comp as InputComponentConfig).placeholder}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-400"
                    />
                  </div>
                )}

                {/* Requirement 2: Universal Guide Section rendering */}
                {comp.type === 'GUIDE' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 text-xs">
                    <div className="font-bold text-slate-800 flex items-center space-x-1.5 pb-1 border-b border-slate-200/60">
                      <BookOpen size={13} className="text-purple-600" />
                      <span>渠道：{(comp as GuideComponentConfig).channelName}</span>
                    </div>

                    <div className="space-y-2">
                      {getGuideSections(comp as GuideComponentConfig).map((sec, idx) => (
                        <div key={sec.id || idx} className="space-y-1">
                          <span className="text-[11px] font-bold text-purple-900 block">
                            ● {sec.title}
                          </span>
                          <div className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed pl-2.5 border-l-2 border-purple-300 bg-white/70 p-1.5 rounded-r">
                            {sec.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comp.type === 'BUTTON' && (
                  <button
                    disabled
                    className="w-full py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm text-center opacity-90 cursor-default"
                  >
                    {(comp as ButtonComponentConfig).buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeConfigDrawer;
