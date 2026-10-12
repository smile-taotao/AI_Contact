import React, { useState, useMemo } from 'react';
import { ProcessDefinition } from './types';
import { 
  Search, 
  Plus, 
  GitBranch, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Copy, 
  Layers, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  FolderOpen,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ProcessListViewProps {
  processes: ProcessDefinition[];
  onSelectProcess: (processId: string) => void;
  onCreateNewProcess: () => void;
  onDuplicateProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
  onResetToPresets: () => void;
}

export const ProcessListView: React.FC<ProcessListViewProps> = ({
  processes,
  onSelectProcess,
  onCreateNewProcess,
  onDuplicateProcess,
  onDeleteProcess,
  onResetToPresets
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6; // 6 cards per page

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    processes.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [processes]);

  // Filtered processes
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchSearch = 
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.shortName?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [processes, searchTerm, selectedCategory, selectedStatus]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredProcesses.length / pageSize));

  // Current page items
  const paginatedProcesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProcesses.slice(start, start + pageSize);
  }, [filteredProcesses, currentPage, pageSize]);

  // When filters change, reset to page 1
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 h-full bg-[#f8fafc] overflow-y-auto flex flex-col custom-scrollbar">
      {/* Top Banner / Breadcrumb & Statistics Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold tracking-wide uppercase">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>智能辅助工作台 / 流程配置引擎</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2.5">
              <span>辅助流程管理</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                共 {processes.length} 个业务流程
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              统一维护坐席辅助的所有业务引导流程（如银行卡挂失、非柜面限制等）。点击具体流程卡片即可进入可视化拖拉拽画布，对步骤节点、卡片多要素组件及分支流转规则进行自由编排。
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={onResetToPresets}
              title="重置恢复官方标准流程"
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>恢复预置流程</span>
            </button>
            <button
              onClick={onCreateNewProcess}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm shadow-blue-500/25 flex items-center space-x-2 cursor-pointer"
            >
              <Plus size={15} />
              <span>新建辅助流程</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-8 py-6 flex flex-col space-y-6">
        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索流程名称、简称、描述或触发关键词..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Category Tabs */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Filter size={13} className="text-slate-400" />
              <span>分类:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="ALL">全部分类 ({processes.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <span>状态:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="ALL">全部状态</option>
              <option value="PUBLISHED">已发布 / 生效中</option>
              <option value="DRAFT">草稿 / 编辑中</option>
            </select>
          </div>
        </div>

        {/* Process Cards Grid */}
        {paginatedProcesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProcesses.map((proc) => {
              const nodeCount = proc.nodes?.length || 0;
              // calculate total branches
              const branchCount = proc.nodes?.reduce((acc, n) => acc + (n.branches?.length || 0), 0) || 0;
              // calculate interactive components count
              const interactiveCount = proc.nodes?.filter(n => n.requiresClientConfirm).length || 0;

              return (
                <div
                  key={proc.id}
                  onClick={() => onSelectProcess(proc.id)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/8 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
                >
                  {/* Card Top Header */}
                  <div className="p-5 pb-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                          <GitBranch size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {proc.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {proc.shortName || proc.name} · {proc.category}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                        proc.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}>
                        {proc.status === 'PUBLISHED' ? '已发布' : '草稿'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {proc.description || '暂无流程描述，点击进入画布完善此辅助业务流程配置。'}
                    </p>

                    {/* Trigger Keywords */}
                    {proc.keywords && proc.keywords.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center space-x-1">
                          <Sparkles size={11} className="text-blue-500" />
                          <span>意图触发词:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {proc.keywords.slice(0, 4).map((kw, i) => (
                            <span 
                              key={i}
                              className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded"
                            >
                              {kw}
                            </span>
                          ))}
                          {proc.keywords.length > 4 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">
                              +{proc.keywords.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{nodeCount}</div>
                        <div className="text-[10px] text-slate-400 font-medium">步骤节点</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-600">{branchCount}</div>
                        <div className="text-[10px] text-slate-400 font-medium">分支流转</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{interactiveCount}</div>
                        <div className="text-[10px] text-slate-400 font-medium">客户交互</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                      <Clock size={12} />
                      <span>{proc.updatedAt || '刚刚'}</span>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDuplicateProcess(proc.id)}
                        title="复制该流程"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteProcess(proc.id)}
                        title="删除该流程"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        onClick={() => onSelectProcess(proc.id)}
                        className="ml-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <span>编辑配置</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <FolderOpen size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-700">未找到匹配的辅助流程</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              暂无匹配「{searchTerm}」的流程，您可以调整搜索关键字、筛选条件，或直接创建新流程。
            </p>
            <button
              onClick={onCreateNewProcess}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
            >
              新建流程
            </button>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredProcesses.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 shadow-2xs">
            <div>
              显示第 <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> 至{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, filteredProcesses.length)}
              </span>{' '}
              项，共 <span className="font-semibold text-slate-800">{filteredProcesses.length}</span> 项流程
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="上一页"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="下一页"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessListView;
