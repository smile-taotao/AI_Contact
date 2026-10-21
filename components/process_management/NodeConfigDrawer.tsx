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
  ButtonComponentConfig,
  WealthTierConfig,
  DEFAULT_WEALTH_TIER_CONFIGS,
  ensureTierComponents,
  syncTierFromComponents
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
  FileText,
  Tag,
  ShieldAlert,
  RotateCcw,
  CheckCircle2
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
  const [activeTab, setActiveTab] = useState<'COMPONENTS' | 'TIERS' | 'BRANCHES' | 'PREVIEW'>('COMPONENTS');
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  const [newTierNameInput, setNewTierNameInput] = useState<string>('');
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'AGENT' | 'CLIENT'>('AGENT');
  // Interactive preview state for progressive cascade testing
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

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

  // Universal Card Option (分级选卡) Handlers
  const handleEnableTiers = () => {
    const presetCopy = JSON.parse(JSON.stringify(DEFAULT_WEALTH_TIER_CONFIGS));
    onUpdateNode({
      ...node,
      tierCardConfigs: presetCopy
    });
    setSelectedTierIndex(0);
  };

  const handleUpdateTier = (index: number, updated: WealthTierConfig) => {
    const list = [...(node.tierCardConfigs || [])];
    list[index] = updated;
    onUpdateNode({
      ...node,
      tierCardConfigs: list
    });
  };

  const handleUpdateTierComponents = (tierIndex: number, nextComponents: FlowCardComponent[]) => {
    const list = [...(node.tierCardConfigs || [])];
    const targetTier = list[tierIndex];
    if (!targetTier) return;
    list[tierIndex] = syncTierFromComponents(targetTier, nextComponents);
    onUpdateNode({
      ...node,
      tierCardConfigs: list
    });
  };

  const handleCreateCardOption = (customName?: string) => {
    const list = [...(node.tierCardConfigs || [])];
    const newIdx = list.length + 1;
    const rawName = (customName !== undefined ? customName : newTierNameInput).trim();
    const optionName = rawName || (newIdx === 1 ? 'C1谨慎型' : `C${newIdx} 卡片选项`);
    const prefixMatch = optionName.match(/^[A-Za-z0-9]+/);
    const optionCode = prefixMatch ? prefixMatch[0].toUpperCase() : `OPT${newIdx}`;

    const initialSpeech = createDefaultComponent('SPEECH') as SpeechComponentConfig;
    initialSpeech.title = `推荐话术 (${optionName})`;
    initialSpeech.speechText = `您好，为您推荐【${optionName}】专属方案，以下是详细内容说明：`;

    const initialGuide = createDefaultComponent('GUIDE') as GuideComponentConfig;
    initialGuide.title = `${optionName} · 方案详情卡`;
    initialGuide.channelName = optionName;
    initialGuide.sections = [
      {
        id: `sec-${Date.now()}-1`,
        title: '核心要素说明',
        content: `在此配置【${optionName}】的核心产品要素、办理说明或规则指引`
      },
      {
        id: `sec-${Date.now()}-2`,
        title: '适用对象与特点',
        content: '在此输入该卡片选项的适用条件、优势特点或周期说明'
      }
    ];

    const newTier: WealthTierConfig = syncTierFromComponents(
      {
        tierId: optionCode,
        tierName: optionName,
        riskLevel: `选项 ${newIdx}`,
        productName: optionName,
        benchmark: '自定义要素',
        duration: '灵活配置',
        minAmount: '',
        underlyingAssets: `在此配置【${optionName}】的核心要素说明`,
        yieldStructure: '支持自由添加不同卡片组件',
        worstCaseNotice: '请根据业务合规要求补充风险提示或注意事项。',
        speechTemplate: initialSpeech.speechText
      },
      [initialSpeech, initialGuide]
    );

    const updated = [...list, newTier];
    onUpdateNode({ ...node, tierCardConfigs: updated });
    setSelectedTierIndex(updated.length - 1);
    setNewTierNameInput('');
    setExpandedCompId(initialSpeech.id);
  };

  const handleDuplicateTier = (index: number) => {
    const list = [...(node.tierCardConfigs || [])];
    const source = list[index];
    if (!source) return;
    const clonedComps: FlowCardComponent[] = JSON.parse(
      JSON.stringify(ensureTierComponents(source))
    ).map((c: FlowCardComponent, i: number) => ({
      ...c,
      id: `comp-${Date.now()}-${i}`
    }));
    const copyTier: WealthTierConfig = {
      ...JSON.parse(JSON.stringify(source)),
      tierId: `${source.tierId}_COPY`,
      tierName: `${source.tierName} (副本)`,
      components: clonedComps
    };
    const updated = [...list];
    updated.splice(index + 1, 0, copyTier);
    onUpdateNode({ ...node, tierCardConfigs: updated });
    setSelectedTierIndex(index + 1);
  };

  const handleDeleteTier = (index: number) => {
    const list = [...(node.tierCardConfigs || [])];
    list.splice(index, 1);
    onUpdateNode({
      ...node,
      tierCardConfigs: list.length > 0 ? list : undefined
    });
    setSelectedTierIndex(Math.max(0, Math.min(index, list.length - 1)));
  };

  const handleResetTiers = () => {
    onUpdateNode({
      ...node,
      tierCardConfigs: JSON.parse(JSON.stringify(DEFAULT_WEALTH_TIER_CONFIGS))
    });
    setSelectedTierIndex(0);
  };

  // Universal Component List & Palette Renderer (works for both Node base components and any Card Option's components)
  const renderComponentListAndBuilder = (
    compList: FlowCardComponent[],
    onUpdateCompList: (nextList: FlowCardComponent[]) => void,
    contextLabel: string
  ) => {
    const updateOne = (compIdx: number, updatedComp: FlowCardComponent) => {
      const next = [...compList];
      next[compIdx] = updatedComp;
      onUpdateCompList(next);
    };

    const addOne = (type: CardComponentType) => {
      const newComp = createDefaultComponent(type);
      const next = [...compList, newComp];
      onUpdateCompList(next);
      setExpandedCompId(newComp.id);
    };

    const deleteOne = (compIdx: number) => {
      const next = compList.filter((_, idx) => idx !== compIdx);
      onUpdateCompList(next);
    };

    const moveOne = (compIdx: number, direction: 'UP' | 'DOWN') => {
      if ((direction === 'UP' && compIdx === 0) || (direction === 'DOWN' && compIdx === compList.length - 1)) {
        return;
      }
      const targetIdx = direction === 'UP' ? compIdx - 1 : compIdx + 1;
      const next = [...compList];
      const temp = next[compIdx];
      next[compIdx] = next[targetIdx];
      next[targetIdx] = temp;
      onUpdateCompList(next);
    };

    const addGuideSec = (compIdx: number, guideComp: GuideComponentConfig) => {
      const curSections = getGuideSections(guideComp);
      const newSec: GuideSection = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: '新增指引项 (如: 温馨提示 / 办理渠道)',
        content: '请在此输入具体内容、步骤或补充说明...'
      };
      updateOne(compIdx, {
        ...guideComp,
        sections: [...curSections, newSec]
      });
    };

    const updateGuideSec = (
      compIdx: number,
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
      updateOne(compIdx, {
        ...guideComp,
        sections: curSections
      });
    };

    const deleteGuideSec = (compIdx: number, guideComp: GuideComponentConfig, secIndex: number) => {
      const curSections = getGuideSections(guideComp);
      if (curSections.length <= 1) return;
      const updatedSections = curSections.filter((_, i) => i !== secIndex);
      updateOne(compIdx, {
        ...guideComp,
        sections: updatedSections
      });
    };

    return (
      <div className="space-y-3">
        {/* Components Ordered List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">
              {contextLabel} 组件清单 ({compList.length})
            </span>
            <span className="text-[10px] text-slate-400">点击展开编辑 · 上下调整顺序</span>
          </div>

          {compList.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 text-center text-xs text-slate-400">
              暂未添加组件，请点击下方组件库按钮自由添加组件
            </div>
          ) : (
            compList.map((comp, idx) => {
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
                      <span className="text-[10px] text-slate-400 font-mono">
                        · {comp.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => moveOne(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="上移"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOne(idx, 'DOWN')}
                        disabled={idx === compList.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="下移"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteOne(idx)}
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
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">组件标题</label>
                        <input
                          type="text"
                          value={comp.title || ''}
                          onChange={(e) => updateOne(idx, { ...comp, title: e.target.value })}
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
                              onChange={(e) => updateOne(idx, { ...(comp as SpeechComponentConfig), speechText: e.target.value })}
                              className="w-full border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 leading-relaxed font-sans"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">语速/播报提示</label>
                            <input
                              type="text"
                              value={(comp as SpeechComponentConfig).suggestSpeed || ''}
                              onChange={(e) => updateOne(idx, { ...(comp as SpeechComponentConfig), suggestSpeed: e.target.value })}
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
                              onChange={(e) => updateOne(idx, { ...(comp as NoticeComponentConfig), noticeType: e.target.value as any })}
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
                              onChange={(e) => updateOne(idx, { ...(comp as NoticeComponentConfig), noticeText: e.target.value })}
                              className="w-full border border-slate-200 rounded p-2 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. RADIO */}
                      {comp.type === 'RADIO' && (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">变量字段名 (FieldName)</label>
                            <input
                              type="text"
                              value={(comp as RadioComponentConfig).fieldName}
                              onChange={(e) => updateOne(idx, { ...(comp as RadioComponentConfig), fieldName: e.target.value })}
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
                                updateOne(idx, {
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
                                      updateOne(idx, { ...radioComp, options: newOpts });
                                    }}
                                    className="flex-1 border border-slate-200 rounded px-2 py-1 bg-white text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const radioComp = comp as RadioComponentConfig;
                                      if (radioComp.options.length <= 1) return;
                                      const newOpts = radioComp.options.filter((_, i) => i !== optIdx);
                                      updateOne(idx, { ...radioComp, options: newOpts });
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
                                    updateOne(idx, { ...radioComp, options: newOpts });
                                  }}
                                  className="w-full border border-slate-200 rounded px-2 py-1 bg-white text-[11px] text-slate-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. CHECKBOX */}
                      {comp.type === 'CHECKBOX' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-700">多选选项列表</label>
                            <button
                              type="button"
                              onClick={() => {
                                const chkComp = comp as CheckboxComponentConfig;
                                const newOpt = {
                                  id: `chk-${Date.now()}-${chkComp.options.length + 1}`,
                                  label: `多选项 ${chkComp.options.length + 1}`,
                                  value: `多选项 ${chkComp.options.length + 1}`
                                };
                                updateOne(idx, {
                                  ...chkComp,
                                  options: [...chkComp.options, newOpt]
                                });
                              }}
                              className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center space-x-0.5 cursor-pointer"
                            >
                              <Plus size={11} />
                              <span>添加多选项</span>
                            </button>
                          </div>
                          {(comp as CheckboxComponentConfig).options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const chkComp = comp as CheckboxComponentConfig;
                                  const newOpts = [...chkComp.options];
                                  newOpts[optIdx] = { ...opt, label: e.target.value, value: e.target.value };
                                  updateOne(idx, { ...chkComp, options: newOpts });
                                }}
                                className="flex-1 border border-slate-200 rounded px-2 py-1 bg-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const chkComp = comp as CheckboxComponentConfig;
                                  const newOpts = chkComp.options.filter((_, i) => i !== optIdx);
                                  updateOne(idx, { ...chkComp, options: newOpts });
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
                              onChange={(e) => updateOne(idx, { ...(comp as CheckboxComponentConfig), allowOther: e.target.checked })}
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
                              onChange={(e) => updateOne(idx, { ...(comp as InputComponentConfig), fieldName: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">输入框占位提示语</label>
                            <input
                              type="text"
                              value={(comp as InputComponentConfig).placeholder}
                              onChange={(e) => updateOne(idx, { ...(comp as InputComponentConfig), placeholder: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* 6. GUIDE */}
                      {comp.type === 'GUIDE' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">卡片副标题 / 渠道或方案名称</label>
                            <input
                              type="text"
                              value={(comp as GuideComponentConfig).channelName}
                              onChange={(e) => updateOne(idx, { ...(comp as GuideComponentConfig), channelName: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-purple-900 flex items-center space-x-1">
                                <BookOpen size={13} className="text-purple-600" />
                                <span>指引内容项（标题+内容组合）</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => addGuideSec(idx, comp as GuideComponentConfig)}
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
                                        placeholder="指引项标题"
                                        onChange={(e) => updateGuideSec(idx, comp as GuideComponentConfig, secIdx, 'title', e.target.value)}
                                        className="w-full text-xs font-semibold text-slate-800 bg-white border border-purple-200 rounded px-2 py-1 focus:border-purple-500 outline-none"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => deleteGuideSec(idx, comp as GuideComponentConfig, secIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="删除该组合"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>

                                  <div>
                                    <textarea
                                      rows={2}
                                      value={sec.content}
                                      placeholder="输入具体内容或说明..."
                                      onChange={(e) => updateGuideSec(idx, comp as GuideComponentConfig, secIdx, 'content', e.target.value)}
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
                          <div>
                            <label className="text-[10px] text-slate-500 font-medium block mb-1">按钮显示文案</label>
                            <input
                              type="text"
                              value={(comp as ButtonComponentConfig).buttonText}
                              onChange={(e) => updateOne(idx, { ...(comp as ButtonComponentConfig), buttonText: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-blue-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Component Quick Actions */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] font-bold text-slate-700 block">
            + 添加不同组件到 {contextLabel}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => addOne('SPEECH')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer text-left font-medium"
            >
              <MessageSquareText size={12} />
              <span>推荐话术</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('NOTICE')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer text-left font-medium"
            >
              <AlertTriangle size={12} />
              <span>提示警示栏</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('RADIO')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer text-left font-medium"
            >
              <CircleDot size={12} />
              <span>单选选项组</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('CHECKBOX')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer text-left font-medium"
            >
              <CheckSquare size={12} />
              <span>多选选项组</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('INPUT')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer text-left font-medium"
            >
              <TextCursorInput size={12} />
              <span>文本输入框</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('GUIDE')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer text-left font-medium"
            >
              <BookOpen size={12} />
              <span>通用指引卡</span>
            </button>
            <button
              type="button"
              onClick={() => addOne('BUTTON')}
              className="col-span-2 flex items-center justify-center space-x-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer text-center font-semibold"
            >
              <SendHorizontal size={12} />
              <span>操作/提交按钮</span>
            </button>
          </div>
        </div>
      </div>
    );
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
          className={`flex-1 py-2.5 px-1.5 flex items-center justify-center space-x-1 border-b-2 transition-colors cursor-pointer text-[11px] ${
            activeTab === 'COMPONENTS'
              ? 'border-blue-600 text-blue-600 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={12} />
          <span>卡片组件 ({node.components.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TIERS')}
          className={`flex-1 py-2.5 px-1.5 flex items-center justify-center space-x-1 border-b-2 transition-colors cursor-pointer text-[11px] ${
            activeTab === 'TIERS'
              ? 'border-blue-600 text-blue-600 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          title="配置坐席不同选择（C1~C5等）卡片与独立话术"
        >
          <Tag size={12} className={node.tierCardConfigs && node.tierCardConfigs.length > 0 ? "text-blue-600" : ""} />
          <span>分级选卡 ({node.tierCardConfigs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex-1 py-2.5 px-1.5 flex items-center justify-center space-x-1 border-b-2 transition-colors cursor-pointer text-[11px] ${
            activeTab === 'BRANCHES'
              ? 'border-blue-600 text-blue-600 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch size={12} />
          <span>分支规则 ({node.branches?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('PREVIEW')}
          className={`flex-1 py-2.5 px-1.5 flex items-center justify-center space-x-1 border-b-2 transition-colors cursor-pointer text-[11px] ${
            activeTab === 'PREVIEW'
              ? 'border-blue-600 text-blue-600 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye size={12} />
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
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div>
                <span className="text-[11px] text-slate-700 font-semibold block">是否需客户在APP端互动确认</span>
                <span className="text-[10px] text-slate-400">关闭则为纯告知型卡片，无需客户反馈</span>
              </div>
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

            {/* Progressive Cascade Interaction Mode (当需客户确认且存在多个交互问题时) */}
            {node.requiresClientConfirm && (
              <div className="pt-2 space-y-2 border-t border-slate-100 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-blue-900 font-semibold flex items-center space-x-1">
                      <span>客户端问题交互模式</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      多问题时的展示策略
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onUpdateNode({ 
                        ...node, 
                        progressiveQuestionFlow: true,
                        showConfirmOnLastQuestionOnly: true 
                      })}
                      className={`px-2 py-1 text-[10px] rounded-md font-medium transition-colors cursor-pointer ${
                        node.progressiveQuestionFlow !== false
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      渐进式逐级确认
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateNode({ 
                        ...node, 
                        progressiveQuestionFlow: false 
                      })}
                      className={`px-2 py-1 text-[10px] rounded-md font-medium transition-colors cursor-pointer ${
                        node.progressiveQuestionFlow === false
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      一次性平铺展示
                    </button>
                  </div>
                </div>

                {node.progressiveQuestionFlow !== false && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-[10px] text-blue-900">
                    <div className="flex items-start space-x-1.5">
                      <Info size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="leading-relaxed">
                        <strong>渐进式交互逻辑已激活：</strong>客户端初始仅展示首个待确认问题；客户选择上一题后自动平滑展开下一题；流转至最后一个待确认问题时自动展示确认提交按钮。
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-blue-200/50 flex items-center justify-between">
                      <span className="text-[10px] text-blue-800 font-medium">确认按钮仅在最后一个问题时展示</span>
                      <input
                        type="checkbox"
                        checked={node.showConfirmOnLastQuestionOnly !== false}
                        onChange={(e) => onUpdateNode({ ...node, showConfirmOnLastQuestionOnly: e.target.checked })}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 通用分级选卡快捷入口（支持在任意步骤节点创建多个卡片选项并为每个卡片选项添加不同组件） */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Tag size={13} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  分级选卡 / 多卡片选项 ({node.tierCardConfigs?.length || 0})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('TIERS')}
                className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                {node.tierCardConfigs && node.tierCardConfigs.length > 0 ? '管理卡片选项与组件 →' : '+ 创建卡片选项'}
              </button>
            </div>
            {node.tierCardConfigs && node.tierCardConfigs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {node.tierCardConfigs.map((t, idx) => (
                  <button
                    key={t.tierId || idx}
                    type="button"
                    onClick={() => {
                      setSelectedTierIndex(idx);
                      setActiveTab('TIERS');
                    }}
                    className="px-2 py-1 rounded-md bg-white border border-blue-200 hover:border-blue-400 text-[11px] text-slate-700 font-medium cursor-pointer transition-colors"
                  >
                    {t.tierName} · {ensureTierComponents(t).length}个组件
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10.5px] text-slate-500">
                支持为当前节点创建多个不同的卡片选项（如“C1谨慎型”等），并在每个卡片选项上自由增加不同组件。
              </p>
            )}
          </div>

          {/* 节点默认卡片组件列表与添加器 */}
          {renderComponentListAndBuilder(
            node.components,
            (nextComps) => onUpdateNode({ ...node, components: nextComps }),
            '当前节点默认卡片'
          )}
        </div>
      )}

      {/* Tab 2: Universal Multi-Option Card Builder (通用分级选卡：创建不同卡片选项、改名、删除、并在每个卡片选项上自由增加不同组件) */}
      {activeTab === 'TIERS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/40">
          {/* Header & Create New Card Option */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag size={15} className="text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">分级选卡配置（通用多卡片选项）</h4>
              </div>
              <span className="text-[11px] text-slate-500">
                已创建 {node.tierCardConfigs?.length || 0} 个卡片选项
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              点击创建即可在当前步骤节点下新增不同的卡片选项（例如创建名为“C1谨慎型”的卡片），每个卡片选项均可自由增加、排序或删除不同的组件，支持重命名与删除卡片选项。
            </p>

            {/* Create Option Input & Button */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newTierNameInput}
                onChange={(e) => setNewTierNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCardOption();
                  }
                }}
                placeholder="输入卡片选项名称，例如：C1谨慎型"
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800"
              />
              <button
                type="button"
                onClick={() => handleCreateCardOption()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors flex items-center space-x-1 flex-shrink-0"
              >
                <Plus size={13} />
                <span>创建卡片选项</span>
              </button>
            </div>
          </div>

          {(!node.tierCardConfigs || node.tierCardConfigs.length === 0) ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Tag size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">当前节点暂未创建卡片选项</h5>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCreateCardOption()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors inline-flex items-center space-x-1.5"
                >
                  <Plus size={13} />
                  <span>创建卡片选项</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card Option Selector Tabs */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    已创建的卡片选项 ({node.tierCardConfigs.length})：
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCreateCardOption()}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 cursor-pointer font-semibold"
                  >
                    <Plus size={12} />
                    <span>新增卡片选项</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {node.tierCardConfigs.map((tier, idx) => {
                    const isSelected = selectedTierIndex === idx;
                    const compCount = ensureTierComponents(tier).length;
                    return (
                      <button
                        key={`${tier.tierId}-${idx}`}
                        type="button"
                        onClick={() => setSelectedTierIndex(idx)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate max-w-[120px]">{tier.tierName}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          ({compCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Card Option Editor: Name Editing, Deletion & Free Component Builder */}
              {(() => {
                const safeIdx = Math.min(selectedTierIndex, node.tierCardConfigs.length - 1);
                const currentTier = node.tierCardConfigs[safeIdx];
                if (!currentTier) return null;
                const currentTierComponents = ensureTierComponents(currentTier);

                const updateCurrentMeta = (patch: Partial<WealthTierConfig>) => {
                  handleUpdateTier(safeIdx, {
                    ...currentTier,
                    ...patch
                  });
                };

                return (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    {/* Card Option Meta: Edit Option Name, Code, Duplicate & Delete */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            当前卡片选项：{currentTier.tierName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            · {currentTierComponents.length} 个组件
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDuplicateTier(safeIdx)}
                            className="px-2 py-1 rounded text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer transition-colors"
                            title="复制当前卡片选项"
                          >
                            <Copy size={12} />
                            <span>复制</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(safeIdx)}
                            className="px-2 py-1 rounded text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center space-x-1 cursor-pointer transition-colors"
                            title="删除当前卡片选项"
                          >
                            <Trash2 size={12} />
                            <span>删除该选项</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-500 font-medium block mb-1">
                            卡片选项名称（可随时修改）
                          </label>
                          <input
                            type="text"
                            value={currentTier.tierName}
                            placeholder="例如：C1谨慎型"
                            onChange={(e) => updateCurrentMeta({ tierName: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium block mb-1">
                            选项标识/简称
                          </label>
                          <input
                            type="text"
                            value={currentTier.tierId}
                            placeholder="如：C1"
                            onChange={(e) => updateCurrentMeta({ tierId: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Free Component List & Component Builder for this Card Option */}
                    {renderComponentListAndBuilder(
                      currentTierComponents,
                      (nextComps) => handleUpdateTierComponents(safeIdx, nextComps),
                      `卡片选项「${currentTier.tierName}」`
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Tab 3: Branches Management (Requirement 3: Unified Branch Flow Rules) */}
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
      {activeTab === 'PREVIEW' && (() => {
        const questionComponents = node.components.filter(
          c => c.type === 'RADIO' || c.type === 'CHECKBOX' || c.type === 'INPUT'
        );
        const isProgressive = node.progressiveQuestionFlow !== false && questionComponents.length > 1;

        // Check whether a question component is currently visible in progressive mode
        const isCompVisibleInClient = (comp: FlowCardComponent): boolean => {
          if (!isProgressive) return true;
          if (comp.type !== 'RADIO' && comp.type !== 'CHECKBOX' && comp.type !== 'INPUT' && comp.type !== 'BUTTON') {
            return true;
          }

          if (comp.type === 'BUTTON') {
            const lastQuestion = questionComponents[questionComponents.length - 1];
            if (!lastQuestion) return true;
            // Button is shown if the last question is visible
            return isCompVisibleInClient(lastQuestion);
          }

          const qIdx = questionComponents.findIndex(q => q.id === comp.id);
          if (qIdx <= 0) return true; // First question is always visible

          // If custom dependsOnField specified
          if (comp.dependsOnField) {
            return !!previewAnswers[comp.dependsOnField];
          }

          // Otherwise depends on previous question having answer
          const prevQ = questionComponents[qIdx - 1];
          const prevField = (prevQ as any)?.fieldName;
          return !!previewAnswers[prevField];
        };

        const lastQuestionVisible = questionComponents.length > 0 && isCompVisibleInClient(questionComponents[questionComponents.length - 1]);

        return (
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

            {/* Progressive Mode Notice Banner */}
            {isProgressive && previewMode === 'CLIENT' && (
              <div className="w-full bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-blue-900 shadow-2xs">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>渐进式逐级确认演练：点击选项可自动展开后续问题</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewAnswers({})}
                  className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 text-[10px] cursor-pointer transition-colors"
                >
                  重置演练
                </button>
              </div>
            )}

            {/* Card Option Switcher in Preview if node has tierCardConfigs */}
            {node.tierCardConfigs && node.tierCardConfigs.length > 0 && (
              <div className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span className="flex items-center space-x-1">
                    <Tag size={12} className="text-blue-600" />
                    <span>切换预览卡片选项：</span>
                  </span>
                  <span className="text-blue-700 font-semibold text-[11px]">
                    {node.tierCardConfigs[Math.min(selectedTierIndex, node.tierCardConfigs.length - 1)]?.tierName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {node.tierCardConfigs.map((t, idx) => (
                    <button
                      key={`${t.tierId}-${idx}`}
                      type="button"
                      onClick={() => setSelectedTierIndex(idx)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium cursor-pointer transition-colors ${
                        selectedTierIndex === idx
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.tierName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Container */}
            <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>
                    {node.tierCardConfigs && node.tierCardConfigs.length > 0
                      ? `${node.shortTitle || node.title} · ${node.tierCardConfigs[Math.min(selectedTierIndex, node.tierCardConfigs.length - 1)]?.tierName}`
                      : node.title}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {node.categoryTag || '流程卡片'}
                </span>
              </div>

              {/* Render Components of either selected Card Option or Node default components */}
              {(node.tierCardConfigs && node.tierCardConfigs.length > 0
                ? ensureTierComponents(node.tierCardConfigs[Math.min(selectedTierIndex, node.tierCardConfigs.length - 1)])
                : node.components
              ).map((comp: FlowCardComponent) => {
                const isQuestion = comp.type === 'RADIO' || comp.type === 'CHECKBOX' || comp.type === 'INPUT';
                const isVisible = previewMode === 'CLIENT' ? isCompVisibleInClient(comp) : true;

                // 坐席端辅助展示模式下：始终平铺展示所有问题与交互项
                if (!isVisible) {
                  return null;
                }

                return (
                  <div key={comp.id} className="animate-in fade-in slide-in-from-top-1 duration-150">
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
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{comp.title || '单项选择'}:</span>
                          {previewAnswers[(comp as RadioComponentConfig).fieldName] && (
                            <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
                          )}
                        </label>
                        <div className="space-y-1.5">
                          {(comp as RadioComponentConfig).options.map((opt) => {
                            const isChecked = previewAnswers[(comp as RadioComponentConfig).fieldName] === opt.value;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => {
                                  if (previewMode === 'CLIENT') {
                                    setPreviewAnswers(prev => ({
                                      ...prev,
                                      [(comp as RadioComponentConfig).fieldName]: opt.value
                                    }));
                                  }
                                }}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                  previewMode === 'CLIENT' ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isChecked
                                    ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-medium ring-1 ring-blue-300'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div>{opt.label}</div>
                                  {opt.desc && <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>}
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                                }`}>
                                  {isChecked && <Check size={10} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {comp.type === 'CHECKBOX' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{comp.title || '多项选择'}:</span>
                          {((previewAnswers[(comp as CheckboxComponentConfig).fieldName] || []).length > 0) && (
                            <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
                          )}
                        </label>
                        <div className="space-y-1">
                          {(comp as CheckboxComponentConfig).options.map((opt) => {
                            const curArr: string[] = previewAnswers[(comp as CheckboxComponentConfig).fieldName] || [];
                            const isChecked = curArr.includes(opt.value);
                            return (
                              <div
                                key={opt.id}
                                onClick={() => {
                                  if (previewMode === 'CLIENT') {
                                    const next = isChecked ? curArr.filter(v => v !== opt.value) : [...curArr, opt.value];
                                    setPreviewAnswers(prev => ({
                                      ...prev,
                                      [(comp as CheckboxComponentConfig).fieldName]: next
                                    }));
                                  }
                                }}
                                className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                                  previewMode === 'CLIENT' ? 'cursor-pointer' : 'cursor-default'
                                } ${
                                  isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium' : 'bg-slate-50/50 border-slate-200'
                                }`}
                              >
                                <span>{opt.label}</span>
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                }`}>
                                  {isChecked && <Check size={10} />}
                                </div>
                              </div>
                            );
                          })}
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
                          value={previewAnswers[(comp as InputComponentConfig).fieldName] || ''}
                          onChange={(e) => {
                            if (previewMode === 'CLIENT') {
                              setPreviewAnswers(prev => ({
                                ...prev,
                                [(comp as InputComponentConfig).fieldName]: e.target.value
                              }));
                            }
                          }}
                          placeholder={(comp as InputComponentConfig).placeholder}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white text-slate-800"
                        />
                      </div>
                    )}

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
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm text-center cursor-pointer transition-colors"
                        >
                          {(comp as ButtonComponentConfig).buttonText || '确认提交'}
                        </button>
                        {isProgressive && previewMode === 'CLIENT' && (
                          <div className="text-[10px] text-slate-400 text-center mt-1">
                            ✔ 当前为最后一个需要确认的问题，已自动呈现确认按钮
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default NodeConfigDrawer;
