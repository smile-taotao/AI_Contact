import React, { useState } from 'react';
import { 
  Headphones,
  Smartphone,
  PhoneCall,
  Workflow,
  Mic,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  view: ViewState;
  badge?: string;
  description?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isCollapsed: controlledCollapsed,
  onToggleCollapse 
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  };

  const menuStructure: MenuItem[] = [
    { 
      id: 'voice_workbench', 
      label: '智能语音工作台', 
      icon: Mic, 
      view: 'VOICE_WORKBENCH',
      badge: '呼入席',
      description: '全流程呼叫与智能辅助'
    },
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
      description: '流程仿真与话术演练'
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
    <div 
      className={`
        bg-[#0f172a] h-full flex flex-col flex-shrink-0 text-slate-300 shadow-xl border-r border-slate-800 select-none transition-all duration-200 z-30
        ${isCollapsed ? 'w-14' : 'w-64'}
      `}
    >
      {/* Top Logo / Toggle Area */}
      <div className={`h-12 flex items-center border-b border-slate-800/80 bg-[#0f172a] sticky top-0 z-10 ${isCollapsed ? 'justify-center px-1' : 'justify-between px-3'}`}>
        {!isCollapsed ? (
          <div className="flex items-center min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-2 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              AI
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-100 tracking-wide text-xs block leading-tight truncate">智能客服系统</span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">多渠道智能协同平台</span>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xs">
            AI
          </div>
        )}

        <button
          onClick={handleToggle}
          title={isCollapsed ? "展开菜单" : "收起菜单"}
          className={`
            p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer
            ${isCollapsed ? 'mt-0' : 'ml-1'}
          `}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Menu Header (only when expanded) */}
      {!isCollapsed && (
        <div className="px-3.5 pt-3 pb-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>工作台菜单</span>
          <span className="text-[10px] text-slate-500 font-normal">支持折叠</span>
        </div>
      )}

      {/* Menu Items */}
      <div className={`flex-1 ${isCollapsed ? 'px-1.5' : 'px-2.5'} py-2 space-y-1.5 overflow-y-auto custom-scrollbar`}>
        {menuStructure.map((item) => {
          const isActive = item.view === currentView;
          const Icon = item.icon;

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.view)}
                title={`${item.label}${item.description ? ` (${item.description})` : ''}`}
                className={`
                  w-full h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer relative group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}
                `}
              >
                <Icon size={18} />
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-slate-900"></span>
                )}
                {/* Floating tooltip on hover when collapsed */}
                <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-slate-700 pointer-events-none">
                  {item.label}
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.view)}
              className={`
                w-full text-left rounded-xl transition-all duration-150 p-2 flex items-center group cursor-pointer border
                ${isActive 
                  ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-sm shadow-blue-900/20' 
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 hover:border-slate-800'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 flex-shrink-0 transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/80'}
              `}>
                <Icon size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[12.5px] truncate ${isActive ? 'font-semibold text-blue-100' : 'font-medium'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`
                      text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-medium ml-1.5
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[10.5px] text-slate-400 truncate mt-0.5 group-hover:text-slate-300">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Version & Info */}
      <div className={`p-2.5 text-[11px] text-slate-400 border-t border-slate-800 text-center bg-[#0b1120] ${isCollapsed ? 'px-1' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-center space-x-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10.5px]">语音服务引擎 · 就绪</span>
          </div>
        ) : (
          <div className="flex justify-center" title="语音服务引擎 · 就绪">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
