import React, { useState } from 'react';
import { RefreshCw, Search, Square, CheckSquare, MinusSquare } from 'lucide-react';

const SmartCallSummary: React.FC = () => {
  const [intelligentRecommend, setIntelligentRecommend] = useState(true);
  const [showReason, setShowReason] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar pb-20">
        {/* Smart Summary Box */}
        <div className="bg-white border border-slate-200 rounded shadow-sm">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-[#f8fafc]">
            <span className="font-bold text-slate-800 text-[13px]">智能摘要 (可配置)</span>
            <button className="text-blue-500 hover:bg-blue-50 p-1 rounded transition border border-blue-200 bg-blue-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="p-4">
            <div className="relative">
              <textarea 
                className="w-full h-24 border border-slate-200 rounded-lg p-3 text-[13px] text-slate-700 focus:outline-none focus:border-blue-400 placeholder:text-slate-400 resize-none"
                placeholder="请输入智能摘要.."
              ></textarea>
              <div className="absolute bottom-2 right-3 text-[11px] text-slate-400">
                0/200
              </div>
            </div>
          </div>
        </div>

        {/* Smart Wrap-up Labels Box */}
        <div className="bg-white border border-slate-200 rounded shadow-sm">
           <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-[#f8fafc]">
             <span className="font-bold text-slate-800 text-[13px]">智能小结</span>
             <div className="flex items-center text-[12px] text-slate-600 font-medium">
               <span className="mr-3">智能推荐</span>
               <button 
                 className={`w-[42px] h-[22px] rounded-full relative transition-colors ${intelligentRecommend ? 'bg-blue-600' : 'bg-slate-300'}`}
                 onClick={() => setIntelligentRecommend(!intelligentRecommend)}
               >
                 <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${intelligentRecommend ? 'left-[22px]' : 'left-[2px]'}`}></div>
               </button>
             </div>
           </div>

           <div className="p-4 space-y-4">
             {/* Search */}
             <div className="relative">
               <Search size={14} className="absolute left-3 top-[10px] text-slate-400" />
               <input 
                 type="text" 
                 placeholder="输入关键字进行过滤" 
                 className="w-full border border-slate-200 rounded-md pl-9 pr-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:border-blue-400"
               />
             </div>

             {/* Tree View (Simplified) */}
             <div className="border border-slate-200 rounded-md p-3 h-48 overflow-y-auto custom-scrollbar text-[13px] text-slate-700">
               <div className="flex items-center space-x-2 py-1">
                 <span className="w-4 flex justify-center text-slate-300 cursor-pointer text-[10px]">▼</span>
                 <div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div>
                 <span>信用卡</span>
               </div>
               <div className="pl-6 space-y-1">
                  <div className="flex items-center space-x-2 py-1">
                    <span className="w-4 flex justify-center text-slate-300 cursor-pointer text-[10px]">▼</span>
                     <div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div>
                    <span>操作类</span>
                  </div>
                  <div className="pl-6 space-y-1 mt-1 text-slate-600">
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>激活</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>挂失/补换卡</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>地址修改</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>手机号码修改</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>账单日修改</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>补寄电子账单</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>解锁/锁卡</span></div>
                     <div className="flex items-center space-x-2 py-1 hover:text-blue-600 cursor-pointer"><div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div> <span>销户/销卡</span></div>
                  </div>
               </div>
             </div>

             {/* Selected Tags */}
             <div className="border border-slate-200 rounded-md p-4 h-24 text-[13px] text-slate-700 bg-[#f8fafc]">
               <div className="text-slate-500 mb-2">已选标签</div>
               {/* tags go here */}
             </div>

             {/* Smart Recommendation Reason */}
             <div className="border border-slate-200 rounded-md p-4 min-h-[100px] text-[13px] text-slate-700 bg-[#f8fafc] relative">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-medium text-slate-500">智能推荐</span>
                 <div className="flex items-center text-[12px] text-slate-500">
                    <button 
                      className={`w-[34px] h-[18px] rounded-full relative mr-2 transition-colors ${showReason ? 'bg-blue-600' : 'bg-slate-300'}`}
                      onClick={() => setShowReason(!showReason)}
                    >
                      <div className={`w-[14px] h-[14px] rounded-full bg-white absolute top-[2px] transition-all ${showReason ? 'left-[18px]' : 'left-[2px]'}`}></div>
                    </button>
                    查看小结项推荐原因
                 </div>
               </div>
               
               <div className="flex items-center justify-center h-12 text-slate-400">
                 暂无数据
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Footer Buttons fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex space-x-3">
         <button className="bg-[#2e5ef4] text-white px-5 py-2 rounded text-[13px] hover:bg-blue-700 transition font-medium shadow-sm">
           发送至工作台
         </button>
         <button className="bg-[#2e5ef4] text-white px-5 py-2 rounded text-[13px] hover:bg-blue-700 transition flex items-center font-medium shadow-sm">
           <span className="italic font-extrabold text-[#facc15] mr-1.5 leading-none">AI</span> <span>智能在线小结</span>
         </button>
      </div>
    </div>
  );
};

export default SmartCallSummary;
