import React from 'react';
import { 
  Headphones,
  Smartphone,
  PhoneCall,
  Workflow
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  view: ViewState;
  badge?: string;
  description?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuStructure: MenuItem[] = [
    { 
      id: 'online_service', 
      label: '智能在线客服', 
      icon: Headphones, 
      view: 'ONLINE_SERVICE',
      badge: '服务中',
      description: '在线坐席多媒体会话'
    },
    { 
      id: 'client_mobile_app', 
      label: '客户端手机app', 
      icon: Smartphone, 
      view: 'CLIENT_MOBILE_APP',
      badge: '模拟端',
      description: '手机银行APP实时联动'
    },
    { 
      id: 'workbench', 
      label: '智能呼入工作台', 
      icon: PhoneCall, 
      view: 'SIMULATOR',
      badge: '语音席',
      description: '全流程呼叫与话术辅助'
    },
    { 
      id: 'process_management', 
      label: '辅助流程管理', 
      icon: Workflow, 
      view: 'PROCESS_MANAGEMENT',
      badge: '配置',
      description: '可视化流转与卡片编排'
    },
  ];

  return (
    <div className="w-64 bg-[#0f172a] h-full flex flex-col flex-shrink-0 text-slate-300 shadow-xl border-r border-slate-800 select-none">
      {/* Top Logo Area */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800/80 bg-[#0f172a] sticky top-0 z-10">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-2.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs">
          AI
        </div>
        <div>
          <span className="font-bold text-slate-100 tracking-wide text-sm block leading-tight">智能客服系统</span>
          <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">多渠道智能协同平台</span>
        </div>
      </div>

      {/* Menu Header */}
      <div className="px-4 pt-4 pb-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
        核心工作台
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-3 py-1 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuStructure.map((item) => {
          const isActive = item.view === currentView;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.view)}
              className={`
                w-full text-left rounded-xl transition-all duration-150 p-2.5 flex items-center group cursor-pointer border
                ${isActive 
                  ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-sm shadow-blue-900/20' 
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 hover:border-slate-800'}
              `}
            >
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/80'}
              `}>
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] truncate ${isActive ? 'font-semibold text-blue-100' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`
                      text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ml-1.5
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 group-hover:text-slate-300">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Version & Info */}
      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-800 text-center bg-[#0b1120]">
        <div className="flex items-center justify-center space-x-1.5 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>服务引擎运行中 · v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
