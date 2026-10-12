import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import SimulatorWorkbench from './components/SimulatorWorkbench';
import OnlineCustomerService from './components/OnlineCustomerService';
import ClientMobileApp from './components/ClientMobileApp';
import ProcessManagementWorkbench from './components/process_management/ProcessManagementWorkbench';
import { ViewState } from './types';
import { Headphones, Smartphone, PhoneCall, Workflow } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('ONLINE_SERVICE');

  const pageMeta: Record<ViewState, { title: string; category: string; icon: any }> = {
    ONLINE_SERVICE: {
      title: '智能在线客服',
      category: '智能在线工作台',
      icon: Headphones,
    },
    CLIENT_MOBILE_APP: {
      title: '客户端手机app',
      category: '智能在线工作台',
      icon: Smartphone,
    },
    SIMULATOR: {
      title: '智能呼入工作台',
      category: '智能呼入工作台',
      icon: PhoneCall,
    },
    PROCESS_MANAGEMENT: {
      title: '辅助流程管理',
      category: '辅助流程中台',
      icon: Workflow,
    },
  };

  const currentMeta = pageMeta[currentView] || pageMeta.ONLINE_SERVICE;

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />

        {/* Breadcrumb / Top Bar Area */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 text-[13px] text-slate-600 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">{currentMeta.category}</span>
            <span className="text-slate-400">/</span>
            <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
              <span>{currentMeta.title}</span>
            </span>
          </div>

          {/* Quick Tabs: Core Pages */}
          <div className="flex items-center space-x-2 text-[12px]">
            <span className="text-slate-400 mr-1 text-[11px]">快捷切换:</span>
            
            <button
              onClick={() => setCurrentView('ONLINE_SERVICE')}
              className={`flex items-center px-2.5 py-1 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'ONLINE_SERVICE'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'ONLINE_SERVICE' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>智能在线客服</span>
            </button>

            <button
              onClick={() => setCurrentView('CLIENT_MOBILE_APP')}
              className={`flex items-center px-2.5 py-1 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'CLIENT_MOBILE_APP'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'CLIENT_MOBILE_APP' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>客户端手机app</span>
            </button>

            <button
              onClick={() => setCurrentView('SIMULATOR')}
              className={`flex items-center px-2.5 py-1 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'SIMULATOR'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'SIMULATOR' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>智能呼入工作台</span>
            </button>

            <button
              onClick={() => setCurrentView('PROCESS_MANAGEMENT')}
              className={`flex items-center px-2.5 py-1 rounded transition-colors cursor-pointer border text-xs ${
                currentView === 'PROCESS_MANAGEMENT'
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentView === 'PROCESS_MANAGEMENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <span>辅助流程管理</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content - keep alive to preserve session and view states between agent and mobile client */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`h-full w-full ${currentView === 'ONLINE_SERVICE' ? 'flex flex-col' : 'hidden'}`}>
            <OnlineCustomerService onNavigateToMobile={() => setCurrentView('CLIENT_MOBILE_APP')} />
          </div>
          <div className={`h-full w-full ${currentView === 'CLIENT_MOBILE_APP' ? 'flex flex-col' : 'hidden'}`}>
            <ClientMobileApp onNavigateToAgent={() => setCurrentView('ONLINE_SERVICE')} />
          </div>
          <div className={`h-full w-full ${currentView === 'SIMULATOR' ? 'flex flex-col' : 'hidden'}`}>
            <SimulatorWorkbench />
          </div>
          <div className={`h-full w-full ${currentView === 'PROCESS_MANAGEMENT' ? 'flex flex-col' : 'hidden'}`}>
            <ProcessManagementWorkbench />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
