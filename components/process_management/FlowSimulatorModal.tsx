import React, { useState } from 'react';
import { 
  ProcessDefinition, 
  FlowNode, 
  RadioComponentConfig, 
  CheckboxComponentConfig, 
  InputComponentConfig, 
  GuideComponentConfig, 
  ButtonComponentConfig, 
  NoticeComponentConfig, 
  SpeechComponentConfig 
} from './types';
import { 
  X, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  GitBranch, 
  Smartphone, 
  Headphones, 
  Sparkles, 
  Check, 
  Info, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface FlowSimulatorModalProps {
  process: ProcessDefinition;
  isOpen: boolean;
  onClose: () => void;
  onHighlightNodeInCanvas?: (nodeId: string) => void;
}

export const FlowSimulatorModal: React.FC<FlowSimulatorModalProps> = ({
  process,
  isOpen,
  onClose,
  onHighlightNodeInCanvas
}) => {
  // Current active node in the simulation
  const [currentNodeId, setCurrentNodeId] = useState<string>(process.startNodeId || process.nodes[0]?.id || '');
  // History trail of visited nodes
  const [historyTrail, setHistoryTrail] = useState<string[]>([process.startNodeId || process.nodes[0]?.id || '']);
  // Form values in current card
  const [formState, setFormState] = useState<Record<string, any>>({});
  // Execution logs
  const [logs, setLogs] = useState<string[]>([
    `[流程启动] 进入流程入口节点: ${process.nodes.find(n => n.id === (process.startNodeId || process.nodes[0]?.id))?.title || '开始'}`
  ]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentNode = process.nodes.find(n => n.id === currentNodeId);

  const handleRestart = () => {
    const startId = process.startNodeId || process.nodes[0]?.id || '';
    setCurrentNodeId(startId);
    setHistoryTrail([startId]);
    setFormState({});
    setIsCompleted(false);
    setLogs([`[流程重置] 重新进入起点: ${process.nodes.find(n => n.id === startId)?.title || '开始'}`]);
    if (onHighlightNodeInCanvas) onHighlightNodeInCanvas(startId);
  };

  const handleSelectRadio = (fieldName: string, value: string, optionLabel: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: value,
      [`${fieldName}_label`]: optionLabel
    }));
  };

  const handleToggleCheckbox = (fieldName: string, value: string) => {
    setFormState(prev => {
      const currentArr: string[] = prev[fieldName] || [];
      const updated = currentArr.includes(value)
        ? currentArr.filter(v => v !== value)
        : [...currentArr, value];
      return { ...prev, [fieldName]: updated };
    });
  };

  // Submit and evaluate next step based on branching rules
  const handleProceedNext = () => {
    if (!currentNode) return;

    let targetNodeId: string | undefined = undefined;
    let branchReason = '默认/无条件流转';

    // 1. Evaluate combinational branch rules in currentNode.branches (Requirement 3)
    if (currentNode.branches && currentNode.branches.length > 0) {
      for (const rule of currentNode.branches) {
        // If modern combinational rule with conditions
        if (rule.conditions && rule.conditions.length > 0) {
          const results = rule.conditions.map(cond => {
            const actualVal = formState[cond.fieldName || ''] || '';
            switch (cond.operator) {
              case 'EQUALS':
                return actualVal === cond.value;
              case 'NOT_EQUALS':
                return actualVal !== cond.value;
              case 'CONTAINS':
                return String(actualVal).includes(cond.value);
              case 'NOT_CONTAINS':
                return !String(actualVal).includes(cond.value);
              case 'IS_NOT_EMPTY':
                return String(actualVal).trim().length > 0;
              case 'IS_EMPTY':
                return String(actualVal).trim().length === 0;
              default:
                return actualVal === cond.value;
            }
          });

          const isMatched = rule.logicalOperator === 'OR' 
            ? results.some(Boolean)
            : results.every(Boolean);

          if (isMatched && rule.targetNodeId) {
            targetNodeId = rule.targetNodeId;
            branchReason = `命中组合流转规则【${rule.name || rule.conditionLabel || '条件分支'}】(${rule.logicalOperator === 'OR' ? '满足其一' : '全部满足'})`;
            break;
          }
        } 
        // Backward compatibility: single optionValue match
        else if (rule.optionValue) {
          const radioComp = currentNode.components.find(c => c.type === 'RADIO') as RadioComponentConfig | undefined;
          const selectedVal = radioComp ? (formState[radioComp.fieldName] || radioComp.defaultValue) : '';
          if (selectedVal === rule.optionValue || String(selectedVal).includes(rule.optionValue)) {
            targetNodeId = rule.targetNodeId;
            branchReason = `命中分支规则: 客户选择了【${rule.conditionLabel || rule.optionValue}】`;
            break;
          }
        }
      }
    }

    // 2. Fallback to defaultNextNodeId
    if (!targetNodeId) {
      targetNodeId = currentNode.defaultNextNodeId;
    }

    // 3. If there is a target node, transition
    if (targetNodeId && targetNodeId !== currentNode.id) {
      const nextNode = process.nodes.find(n => n.id === targetNodeId);
      const nextNodeName = nextNode ? `${nextNode.nodeCode} ${nextNode.shortTitle}` : targetNodeId;

      setLogs(prev => [
        `[分支流转] ${branchReason} ➜ 跳转至节点 [${nextNodeName}]`,
        ...prev
      ]);

      setCurrentNodeId(targetNodeId);
      setHistoryTrail(prev => [...prev, targetNodeId!]);
      if (onHighlightNodeInCanvas) onHighlightNodeInCanvas(targetNodeId);
    } else {
      // Reached flow end
      setIsCompleted(true);
      setLogs(prev => [
        `[流程结束] 全流程顺利办结！`,
        ...prev
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs select-none p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[650px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white shadow-xs">
              <Play size={16} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-wide">流程演练与分支流转模拟测试</h3>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                  {process.name} · {process.version}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 opacity-90 mt-0.5">
                模拟坐席与客户互动，验证不同选项分支是否正确流转至目标节点卡片
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRestart}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>重新开始</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Trail Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center overflow-x-auto custom-scrollbar space-x-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px] flex-shrink-0">流转足迹:</span>
          {historyTrail.map((nodeId, idx) => {
            const node = process.nodes.find(n => n.id === nodeId);
            const isCurrent = nodeId === currentNodeId && !isCompleted;
            return (
              <React.Fragment key={`${nodeId}-${idx}`}>
                <div 
                  onClick={() => {
                    setCurrentNodeId(nodeId);
                    if (onHighlightNodeInCanvas) onHighlightNodeInCanvas(nodeId);
                  }}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex-shrink-0 border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-mono font-bold">#{node?.nodeCode}</span>
                  <span>{node?.shortTitle || node?.title}</span>
                </div>
                {idx < historyTrail.length - 1 && (
                  <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
          {isCompleted && (
            <>
              <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
              <div className="bg-emerald-600 text-white px-2 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 flex-shrink-0">
                <CheckCircle2 size={12} />
                <span>流程顺利办结</span>
              </div>
            </>
          )}
        </div>

        {/* Content Body: Two Columns */}
        <div className="flex-1 flex min-h-0 bg-slate-100/70">
          {/* Left Column: Interactive Card */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col items-center">
            {isCompleted ? (
              <div className="w-full max-w-lg bg-white rounded-2xl border border-emerald-200 shadow-md p-8 text-center space-y-4 my-auto">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">全流程模拟演练已圆满结束</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    所有步骤卡片要素、条件分支流转及安全须知均已正确执行，可在实际业务中正式发布使用。
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleRestart}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    再演练一次其他分支
                  </button>
                </div>
              </div>
            ) : currentNode ? (
              <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden space-y-3.5 p-4 transition-all">
                {/* Card Title */}
                <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-900">{currentNode.title}</span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                    步骤 {currentNode.nodeCode}
                  </span>
                </div>

                {/* Render All Components in Current Node */}
                {currentNode.components.map((comp) => (
                  <div key={comp.id} className="space-y-2">
                    {/* Speech */}
                    {comp.type === 'SPEECH' && (
                      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
                          <span className="flex items-center space-x-1">
                            <Headphones size={12} />
                            <span>推荐话术 (坐席可直接播报或发送):</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {(comp as SpeechComponentConfig).speechText}
                        </p>
                      </div>
                    )}

                    {/* Notice */}
                    {comp.type === 'NOTICE' && (
                      <div className={`p-2.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2 ${
                        (comp as NoticeComponentConfig).noticeType === 'warning'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : (comp as NoticeComponentConfig).noticeType === 'success'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-blue-50 text-blue-900 border-blue-200'
                      }`}>
                        <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
                        <div>{(comp as NoticeComponentConfig).noticeText}</div>
                      </div>
                    )}

                    {/* Radio Select (Interactive in simulator!) */}
                    {comp.type === 'RADIO' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>{comp.title || '请选择'}:</span>
                          <span className="text-[10px] text-blue-600 font-normal">点击切换不同选项测试分支</span>
                        </label>
                        <div className="space-y-1.5">
                          {(comp as RadioComponentConfig).options.map((opt) => {
                            const selectedValue = formState[(comp as RadioComponentConfig).fieldName] || (comp as RadioComponentConfig).defaultValue;
                            const isChecked = selectedValue === opt.value;

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleSelectRadio((comp as RadioComponentConfig).fieldName, opt.value, opt.label)}
                                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-blue-50/90 border-blue-500 text-blue-900 font-medium shadow-2xs ring-1 ring-blue-500/30'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div>{opt.label}</div>
                                  {opt.desc && (
                                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</div>
                                  )}
                                  {opt.targetNodeId && (
                                    <div className="text-[9px] text-blue-600 mt-1 font-semibold flex items-center space-x-1">
                                      <GitBranch size={10} />
                                      <span>流转分支: ➜ 节点 {opt.targetNodeId}</span>
                                    </div>
                                  )}
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isChecked && <Check size={10} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Checkbox Multi */}
                    {comp.type === 'CHECKBOX' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 block">
                          {comp.title || '多项选择'}:
                        </label>
                        <div className="space-y-1">
                          {(comp as CheckboxComponentConfig).options.map((opt) => {
                            const currentArr: string[] = formState[(comp as CheckboxComponentConfig).fieldName] || [];
                            const isChecked = currentArr.includes(opt.value);

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleToggleCheckbox((comp as CheckboxComponentConfig).fieldName, opt.value)}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                  isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-200'
                                }`}
                              >
                                <span>{opt.label}</span>
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isChecked && <Check size={10} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    {comp.type === 'INPUT' && (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          {(comp as InputComponentConfig).label}
                        </label>
                        <input
                          type="text"
                          value={formState[(comp as InputComponentConfig).fieldName] || ''}
                          onChange={(e) => setFormState(prev => ({ ...prev, [(comp as InputComponentConfig).fieldName]: e.target.value }))}
                          placeholder={(comp as InputComponentConfig).placeholder}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    )}

                    {/* Guide */}
                    {comp.type === 'GUIDE' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 text-xs">
                        <div className="font-bold text-slate-800 pb-1 border-b border-slate-200/60">
                          渠道：{(comp as GuideComponentConfig).channelName}
                        </div>
                        {/* Universal sections */}
                        {(comp as GuideComponentConfig).sections && (comp as GuideComponentConfig).sections!.length > 0 ? (
                          (comp as GuideComponentConfig).sections!.map((sec, idx) => (
                            <div key={sec.id || idx} className="space-y-0.5">
                              <span className="text-[11px] font-bold text-purple-900 block">● {sec.title}</span>
                              <div className="text-[11px] text-slate-600 pl-2 border-l-2 border-purple-400 whitespace-pre-wrap leading-relaxed">
                                {sec.content}
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            {(comp as GuideComponentConfig).pathSteps && (comp as GuideComponentConfig).pathSteps!.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-slate-600">操作指引：</span>
                                {(comp as GuideComponentConfig).pathSteps!.map((s, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-600 pl-2 border-l-2 border-blue-500">
                                    {s}
                                  </div>
                                ))}
                              </div>
                            )}
                            {(comp as GuideComponentConfig).notices && (comp as GuideComponentConfig).notices!.length > 0 && (
                              <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 space-y-0.5">
                                <span className="font-bold">注意事项：</span>
                                {(comp as GuideComponentConfig).notices!.map((n, i) => (
                                  <div key={i}>• {n}</div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {comp.type === 'BUTTON' && (
                      <button
                        onClick={handleProceedNext}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Send size={13} />
                        <span>{(comp as ButtonComponentConfig).buttonText || '确认并推进至下一步'}</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* Fallback button if node doesn't have button component */}
                {!currentNode.components.some(c => c.type === 'BUTTON') && (
                  <button
                    onClick={handleProceedNext}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md text-center cursor-pointer"
                  >
                    确认提交并推进至下一步
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Right Column: Execution Log & Branch Inspector */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col p-4 select-none">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
              <Sparkles size={15} className="text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">流转决策与日志监控</h4>
            </div>

            {/* Current Node Diagnostics */}
            {currentNode && (
              <div className="my-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>当前处于节点:</span>
                  <span className="font-mono text-[11px] bg-blue-600 text-white px-1.5 rounded">
                    {currentNode.nodeCode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {currentNode.title}
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-blue-100">
                  包含条件分支: <span className="font-bold text-blue-700">{currentNode.branches?.length || 0}</span> 条
                </div>
              </div>
            )}

            {/* Log Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar text-[11px]">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                流转执行记录
              </div>
              {logs.map((log, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[10px] leading-relaxed"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowSimulatorModal;
