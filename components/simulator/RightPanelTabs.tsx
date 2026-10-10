import React, { useState } from 'react';
import SmartWorkOrder from './SmartWorkOrder';
import SmartCallSummary from './SmartCallSummary';

type TabKey = 'work_order' | 'call_summary' | 'customer_profile' | 'history' | 'sms';

interface RightPanelTabsProps {
  isPristine?: boolean;
}

const RightPanelTabs: React.FC<RightPanelTabsProps> = ({ isPristine = true }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('work_order');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'work_order', label: '智能填单' },
    { key: 'call_summary', label: '智能话务小结' },
    { key: 'history', label: '历史工单' },
    { key: 'sms', label: '发送短信' },
    { key: 'customer_profile', label: '客户画像' },
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Scrollable Tabs Header items */}
      <div className="flex border-b items-center text-[13px] text-slate-600 sticky top-0 bg-white z-10 w-full shrink-0 justify-around px-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-2 py-3 transition-colors relative ${
              activeTab === tab.key 
                ? 'text-blue-600 font-bold' 
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-blue-600 rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-slate-50 relative">
        {activeTab === 'work_order' && <SmartWorkOrder />}
        {activeTab === 'call_summary' && <SmartCallSummary />}
        {['customer_profile', 'history', 'sms'].includes(activeTab) && (
          <div className="p-10 text-center text-slate-500 text-sm">该模块正在建设中...</div>
        )}
      </div>
    </div>
  );
};

export default RightPanelTabs;
