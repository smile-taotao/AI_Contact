import React, { useState } from 'react';
import { 
  ProcessDefinition, 
  FlowNode, 
  CardComponentType 
} from './types';
import { PRESET_PROCESSES } from './defaultProcesses';
import CardComponentLibrary, { createDefaultComponent } from './CardComponentLibrary';
import FlowCanvas from './FlowCanvas';
import NodeConfigDrawer from './NodeConfigDrawer';
import FlowSimulatorModal from './FlowSimulatorModal';
import ProcessListView from './ProcessListView';
import { 
  Workflow, 
  Play, 
  Save, 
  RotateCcw, 
  Download, 
  Plus, 
  CheckCircle2, 
  FileEdit, 
  ChevronDown, 
  ArrowLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';

export const ProcessManagementWorkbench: React.FC = () => {
  // Saved processes with localStorage persistence
  const [processes, setProcesses] = useState<ProcessDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('BANK_ASSISTANT_PROCESSES_V1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved processes from localStorage', e);
    }
    return PRESET_PROCESSES;
  });

  // Current view mode: 'LIST' (Process list view - Requirement 1) | 'CONFIG' (Visual canvas editor)
  const [currentViewMode, setCurrentViewMode] = useState<'LIST' | 'CONFIG'>('LIST');

  // Current active process ID being edited
  const [activeProcessId, setActiveProcessId] = useState<string>('proc-card-loss');

  // Currently selected node on the canvas
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Simulator modal visibility
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Metadata editor modal visibility
  const [isMetaModalOpen, setIsMetaModalOpen] = useState<boolean>(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentProcess = processes.find(p => p.id === activeProcessId) || processes[0];

  // Save to localStorage
  const handleSaveProcess = () => {
    try {
      localStorage.setItem('BANK_ASSISTANT_PROCESSES_V1', JSON.stringify(processes));
      showToast(`已成功保存流程「${currentProcess.name}」配置！`);
    } catch (e) {
      showToast('保存失败，请检查浏览器存储配额');
    }
  };

  // Reset to default presets
  const handleResetToPresets = () => {
    if (window.confirm(`确定要将所有辅助流程重置回系统官方预置配置吗？当前未保存的自定义修改将丢失。`)) {
      setProcesses(PRESET_PROCESSES);
      localStorage.removeItem('BANK_ASSISTANT_PROCESSES_V1');
      showToast('已重置回系统官方预置流程');
    }
  };

  // Publish process
  const handlePublishProcess = () => {
    setProcesses(prev => prev.map(p => {
      if (p.id === activeProcessId) {
        return {
          ...p,
          status: 'PUBLISHED',
          updatedAt: new Date().toLocaleString('zh-CN', { hour12: false })
        };
      }
      return p;
    }));
    try {
      const updated = processes.map(p => p.id === activeProcessId ? {
        ...p,
        status: 'PUBLISHED' as const,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false })
      } : p);
      localStorage.setItem('BANK_ASSISTANT_PROCESSES_V1', JSON.stringify(updated));
    } catch (e) {}
    showToast(`流程「${currentProcess.name}」已成功发布至坐席在线辅助系统！`);
  };

  // Update nodes of current process
  const handleUpdateNodes = (newNodes: FlowNode[]) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === activeProcessId) {
        return {
          ...p,
          nodes: newNodes,
          updatedAt: new Date().toLocaleTimeString('zh-CN')
        };
      }
      return p;
    }));
  };

  // Update a single node
  const handleUpdateSingleNode = (updatedNode: FlowNode) => {
    handleUpdateNodes(
      currentProcess.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    );
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (currentProcess.nodes.length <= 1) {
      showToast('流程至少需要保留一个步骤节点');
      return;
    }
    const filtered = currentProcess.nodes.filter(n => n.id !== nodeId);
    // Also remove any branch pointing to this deleted node
    const cleaned = filtered.map(n => ({
      ...n,
      defaultNextNodeId: n.defaultNextNodeId === nodeId ? undefined : n.defaultNextNodeId,
      branches: n.branches?.filter(b => b.targetNodeId !== nodeId)
    }));
    handleUpdateNodes(cleaned);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(cleaned[0]?.id || null);
    }
    showToast('已删除该步骤节点');
  };

  // Duplicate node
  const handleDuplicateNode = (nodeId: string) => {
    const srcNode = currentProcess.nodes.find(n => n.id === nodeId);
    if (!srcNode) return;
    const newId = `node-${Date.now()}`;
    const newNode: FlowNode = {
      ...srcNode,
      id: newId,
      nodeCode: `${srcNode.nodeCode}-副本`,
      title: `${srcNode.title} (副本)`,
      shortTitle: `${srcNode.shortTitle} 副本`,
      x: srcNode.x + 40,
      y: srcNode.y + 60,
      components: srcNode.components.map(c => ({
        ...c,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      }))
    };
    handleUpdateNodes([...currentProcess.nodes, newNode]);
    setSelectedNodeId(newId);
    showToast('已复制新步骤节点');
  };

  // Add new step node
  const handleAddStepNode = () => {
    const nextStepNum = currentProcess.nodes.length + 1;
    const newId = `node-${Date.now()}`;
    // Position node to the right of the rightmost node
    const maxRight = Math.max(...currentProcess.nodes.map(n => n.x), 100);

    const newNode: FlowNode = {
      id: newId,
      stepNumber: nextStepNum,
      nodeCode: `0${nextStepNum}`,
      title: `步骤 ${nextStepNum}: 新建业务步骤节点`,
      shortTitle: `步骤 ${nextStepNum}`,
      categoryTag: '业务指引',
      x: maxRight + 360,
      y: 180,
      requiresClientConfirm: true,
      components: [
        createDefaultComponent('SPEECH'),
        createDefaultComponent('NOTICE'),
        createDefaultComponent('RADIO'),
        createDefaultComponent('BUTTON')
      ]
    };

    handleUpdateNodes([...currentProcess.nodes, newNode]);
    setSelectedNodeId(newId);
    showToast(`已新增步骤节点: 步骤 ${nextStepNum}`);
  };

  // Add component to currently selected node from library
  const handleAddComponentToSelectedNode = (type: CardComponentType) => {
    if (!selectedNodeId) {
      showToast('请先在画布中点击选中一个步骤节点');
      return;
    }
    const targetNode = currentProcess.nodes.find(n => n.id === selectedNodeId);
    if (!targetNode) return;

    const newComp = createDefaultComponent(type);
    const updated: FlowNode = {
      ...targetNode,
      components: [...targetNode.components, newComp]
    };
    handleUpdateSingleNode(updated);
    showToast(`已添加组件「${newComp.type}」至当前步骤卡片`);
  };

  // Enter process config page (Requirement 1)
  const handleSelectProcessToConfig = (procId: string) => {
    setActiveProcessId(procId);
    const targetP = processes.find(p => p.id === procId);
    if (targetP && targetP.nodes.length > 0) {
      setSelectedNodeId(targetP.nodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
    setCurrentViewMode('CONFIG');
  };

  // Create new blank process
  const handleCreateNewProcess = () => {
    const newId = `proc-${Date.now()}`;
    const firstNodeId = `node-${Date.now()}-1`;
    const newProcess: ProcessDefinition = {
      id: newId,
      name: '新建客服引导辅助流程',
      shortName: '新业务流程',
      category: '借记卡与账户业务',
      keywords: ['新业务', '咨询'],
      description: '自定义新建的坐席智能引导辅助流程',
      version: 'v1.0',
      status: 'DRAFT',
      updatedAt: '刚刚',
      startNodeId: firstNodeId,
      nodes: [
        {
          id: firstNodeId,
          stepNumber: 1,
          nodeCode: '01',
          title: '步骤 1: 业务意图确认与首问引导',
          shortTitle: '首问引导',
          categoryTag: '信息收集',
          x: 100,
          y: 160,
          requiresClientConfirm: true,
          components: [
            createDefaultComponent('SPEECH'),
            createDefaultComponent('RADIO'),
            createDefaultComponent('BUTTON')
          ]
        }
      ]
    };

    const updated = [newProcess, ...processes];
    setProcesses(updated);
    try {
      localStorage.setItem('BANK_ASSISTANT_PROCESSES_V1', JSON.stringify(updated));
    } catch (e) {}

    setActiveProcessId(newId);
    setSelectedNodeId(firstNodeId);
    setCurrentViewMode('CONFIG');
    showToast('已新建流程并进入画布配置');
  };

  // Duplicate an entire process
  const handleDuplicateProcess = (processId: string) => {
    const srcProc = processes.find(p => p.id === processId);
    if (!srcProc) return;

    const newId = `proc-${Date.now()}`;
    const duplicatedProc: ProcessDefinition = {
      ...srcProc,
      id: newId,
      name: `${srcProc.name} (副本)`,
      shortName: `${srcProc.shortName} 副本`,
      status: 'DRAFT',
      updatedAt: '刚刚',
      nodes: srcProc.nodes.map(n => ({
        ...n,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        components: n.components.map(c => ({
          ...c,
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
        }))
      }))
    };

    const updated = [duplicatedProc, ...processes];
    setProcesses(updated);
    try {
      localStorage.setItem('BANK_ASSISTANT_PROCESSES_V1', JSON.stringify(updated));
    } catch (e) {}
    showToast(`已成功复制流程「${srcProc.name}」`);
  };

  // Delete an entire process
  const handleDeleteProcess = (processId: string) => {
    if (processes.length <= 1) {
      showToast('系统至少需保留一个辅助业务流程');
      return;
    }
    const target = processes.find(p => p.id === processId);
    if (window.confirm(`确定要彻底删除流程「${target?.name || processId}」吗？删除后将不可恢复。`)) {
      const filtered = processes.filter(p => p.id !== processId);
      setProcesses(filtered);
      try {
        localStorage.setItem('BANK_ASSISTANT_PROCESSES_V1', JSON.stringify(filtered));
      } catch (e) {}
      if (activeProcessId === processId) {
        setActiveProcessId(filtered[0]?.id || '');
      }
      showToast(`已删除流程「${target?.name || ''}」`);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(currentProcess, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProcess.id}_flow_config.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('已导出流程配置 JSON 文件');
  };

  const selectedNode = currentProcess?.nodes?.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 select-none overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: Process List View (Requirement 1: 首次展示所有流程列表，卡片列表，支持新建、查询、编辑、删除、分页) */}
      {currentViewMode === 'LIST' ? (
        <ProcessListView
          processes={processes}
          onSelectProcess={handleSelectProcessToConfig}
          onCreateNewProcess={handleCreateNewProcess}
          onDuplicateProcess={handleDuplicateProcess}
          onDeleteProcess={handleDeleteProcess}
          onResetToPresets={handleResetToPresets}
        />
      ) : (
        /* VIEW 2: Process Canvas Visual Editor (点击流程后进入流程配置页面) */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Header Bar for Configuration Page */}
          <div className="h-14 bg-[#0a192f] border-b border-slate-800 text-white flex items-center justify-between px-5 flex-shrink-0 z-20">
            {/* Left: Back to List & Process Switcher */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentViewMode('LIST')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <ArrowLeft size={14} />
                <span>返回流程列表</span>
              </button>

              <div className="h-6 w-px bg-slate-800 mx-1"></div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Workflow size={18} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{currentProcess.name}</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                      画布配置
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {currentProcess.category} · {currentProcess.nodes.length} 个步骤节点
                  </span>
                </div>
              </div>

              {/* Fast Process Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activeProcessId}
                  onChange={(e) => {
                    setActiveProcessId(e.target.value);
                    const p = processes.find(proc => proc.id === e.target.value);
                    if (p && p.nodes.length > 0) {
                      setSelectedNodeId(p.nodes[0].id);
                    }
                  }}
                  className="bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {processes.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      切换流程: {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setIsMetaModalOpen(true)}
                title="配置流程基本信息与意图关键词"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center space-x-1"
              >
                <FileEdit size={13} />
                <span>属性配置</span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-2.5">
              {/* Simulate Runner */}
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Play size={13} className="fill-white" />
                <span>全流程模拟演练</span>
              </button>

              {/* Save Draft */}
              <button
                onClick={handleSaveProcess}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
              >
                <Save size={13} />
                <span>保存配置</span>
              </button>

              {/* Export JSON */}
              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
                title="导出 JSON 规则配置"
              >
                <Download size={13} />
              </button>

              {/* Publish */}
              <button
                onClick={handlePublishProcess}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>发布上线生效</span>
              </button>
            </div>
          </div>

          {/* Process Meta Banner */}
          <div className="bg-white border-b border-slate-200 px-5 py-2 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">流程全称:</span>
                <span className="font-bold text-slate-900">{currentProcess.name}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">意图触发词:</span>
                <div className="flex items-center space-x-1">
                  {currentProcess.keywords?.slice(0, 4).map((kw, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
                      {kw}
                    </span>
                  ))}
                  {(currentProcess.keywords?.length || 0) > 4 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      +{currentProcess.keywords.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">发布状态:</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold flex items-center space-x-1 ${
                  currentProcess.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentProcess.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span>{currentProcess.status === 'PUBLISHED' ? '已发布生效' : '草稿编辑中'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span>节点数量: <strong className="text-slate-700 font-mono">{currentProcess.nodes.length}</strong> 步</span>
              <span>最近保存: {currentProcess.updatedAt}</span>
            </div>
          </div>

          {/* Main 3-Column Studio Layout */}
          <div className="flex-1 flex min-h-0 relative">
            {/* Left: Card Components Material Library */}
            <CardComponentLibrary
              onAddComponent={handleAddComponentToSelectedNode}
              onAddStepNode={handleAddStepNode}
            />

            {/* Center: Full Visual Flowchart Canvas */}
            <FlowCanvas
              nodes={currentProcess.nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId || null)}
              onUpdateNodes={handleUpdateNodes}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onAddStepNode={handleAddStepNode}
            />

            {/* Right: Selected Node Config Drawer & WYSIWYG Stacker */}
            <NodeConfigDrawer
              node={selectedNode}
              allNodes={currentProcess.nodes}
              isOpen={Boolean(selectedNode)}
              onUpdateNode={handleUpdateSingleNode}
              onClose={() => setSelectedNodeId(null)}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
            />
          </div>

          {/* Simulator Modal */}
          <FlowSimulatorModal
            process={currentProcess}
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
            onHighlightNodeInCanvas={(nodeId) => setSelectedNodeId(nodeId)}
          />

          {/* Process Meta Edit Modal */}
          {isMetaModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs select-none p-4">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">配置辅助流程基础属性</h3>
                  <button
                    onClick={() => setIsMetaModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">流程全称</label>
                    <input
                      type="text"
                      value={currentProcess.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProcesses(prev => prev.map(p => p.id === activeProcessId ? { ...p, name: val } : p));
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">简称 (坐席端标签)</label>
                    <input
                      type="text"
                      value={currentProcess.shortName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProcesses(prev => prev.map(p => p.id === activeProcessId ? { ...p, shortName: val } : p));
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">业务所属分类</label>
                    <input
                      type="text"
                      value={currentProcess.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProcesses(prev => prev.map(p => p.id === activeProcessId ? { ...p, category: val } : p));
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">触发意图关键词 (逗号分隔)</label>
                    <input
                      type="text"
                      value={currentProcess.keywords.join(', ')}
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setProcesses(prev => prev.map(p => p.id === activeProcessId ? { ...p, keywords: val } : p));
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">流程目标与说明</label>
                    <textarea
                      rows={3}
                      value={currentProcess.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProcesses(prev => prev.map(p => p.id === activeProcessId ? { ...p, description: val } : p));
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsMetaModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    完成
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessManagementWorkbench;
