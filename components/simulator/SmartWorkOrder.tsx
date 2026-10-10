import React from 'react';
import { ChevronDown, Bot } from 'lucide-react';

const SmartWorkOrder: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white p-5">
      {/* Top action row */}
      <div className="flex space-x-3 mb-6">
        <div className="w-[180px] relative">
          <select className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white text-slate-400 appearance-none focus:outline-none focus:border-blue-400 shadow-sm">
            <option>请选择</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-[11px] text-slate-400 pointer-events-none" />
        </div>
        
        <button className="bg-[#2e5ef4] text-white px-5 py-2.5 rounded text-[13px] hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
          <span className="italic font-extrabold text-[#facc15] mr-1.5">AI</span> 一键摘要
        </button>
        
        <button className="bg-[#2e5ef4] text-white px-5 py-2.5 rounded text-[13px] hover:bg-blue-700 transition shadow-sm font-medium">
          获取推荐工单
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <label className="text-slate-800 font-medium mb-3 text-[15px]">工单摘要</label>
        <div className="relative flex-1 mb-4 h-[300px]">
           <textarea 
             className="absolute inset-0 w-full h-full border border-slate-200 rounded p-4 text-[13px] text-slate-700 focus:outline-none focus:border-blue-400 resize-none shadow-sm placeholder:text-slate-300"
             placeholder="工单摘要内容"
           ></textarea>
        </div>
        
        <div className="flex justify-end shrink-0 mt-2">
          <button className="bg-[#8baef8] text-white px-8 py-2.5 rounded text-[14px] hover:bg-blue-400 transition font-medium">
            创建工单
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartWorkOrder;
