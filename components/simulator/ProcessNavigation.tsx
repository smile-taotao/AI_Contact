import React from 'react';
import { Eye, ChevronDown, CheckCircle2, Search } from 'lucide-react';
import { Customer } from './CustomerListDrawer';

interface ProcessNavigationProps {
  isPristine?: boolean;
  customer?: Customer;
}

const ProcessNavigation: React.FC<ProcessNavigationProps> = ({ isPristine = true, customer }) => {
  return (
    <div className="flex flex-col h-full bg-[#f9fafb] relative overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center px-4 h-[46px] border-b border-slate-200 bg-white sticky top-0 z-10 w-full shrink-0">
        <h2 className="font-semibold text-slate-800 flex items-center text-[15px]">
          <span className="w-[3px] h-[14px] bg-blue-600 mr-2 rounded-full"></span>
          智能流程导航
        </h2>
        <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"><Eye size={18} /></button>
      </div>

      <div className="p-4 space-y-5">
        {/* Navigation Dropdown */}
        <div className="flex space-x-2">
          <button className="border border-slate-200 rounded px-4 py-1.5 text-[13px] bg-white text-slate-600 hover:bg-slate-50 shadow-sm shrink-0">
            返回
          </button>
          <div className="flex-1 relative">
            <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-[13px] bg-white text-slate-700 appearance-none focus:outline-none focus:border-blue-400 shadow-sm">
              <option>{isPristine ? '信用卡挂失0319' : '请选择流程'}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Extracted Entities */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] shadow-sm">
          <div className="flex items-center">
            <span className="text-slate-400 w-12 text-right mr-3 shrink-0">手机</span>
            {isPristine ? (
              <div className="flex-1 bg-blue-50/50 border border-blue-100 text-blue-600 h-7 rounded flex items-center justify-center font-medium">{customer?.phone || '057156686686'}</div>
            ) : (
              <div className="flex-1 bg-slate-50 border border-slate-200/60 h-7 rounded"></div>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 w-12 text-right mr-3 shrink-0">用户</span>
            {isPristine ? (
              <div className="flex-1 bg-blue-50/50 border border-blue-100 text-blue-600 h-7 rounded flex items-center justify-center font-medium">{customer?.name || '李先生'}</div>
            ) : (
              <div className="flex-1 bg-slate-50 border border-slate-200/60 h-7 rounded"></div>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 w-12 text-right mr-3 shrink-0">核身状态</span>
            <div className="flex-1 border border-slate-200 h-7 rounded px-2 flex justify-between items-center bg-slate-50">
              <span className="text-slate-400 text-xs">无</span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 w-12 text-right mr-3 shrink-0">卡信息确认</span>
            <div className="flex-1 border border-slate-200 h-7 rounded px-2 flex justify-between items-center bg-slate-50">
              <span className="text-slate-400 text-xs">无</span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 w-12 text-right mr-3 shrink-0">挂失结果</span>
            <div className="flex-1 border border-slate-200 h-7 rounded px-2 flex justify-between items-center bg-slate-50">
              <span className="text-slate-400 text-xs">无</span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
        </div>

        <div className="font-semibold text-slate-800 pb-3 border-b text-[15px]">
          流程时间线
        </div>

        {/* Timeline */}
        <div className="space-y-0 px-2 pb-6">
          {isPristine ? (
            <>
              {/* Step 1 */}
              <div className="flex relative">
                <div className="flex flex-col items-center mr-5 z-10 w-6">
                  <CheckCircle2 size={22} className="text-[#10b981] bg-white rounded-full" />
                </div>
                <div className="absolute left-[11px] top-5 bottom-[-20px] w-px bg-slate-200"></div>

                <div className="pb-6 w-full">
                  <div className="text-slate-700 font-medium text-[15px] pt-px">开始节点</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex relative">
                <div className="flex flex-col items-center mr-5 z-10 w-6 mt-1">
                  <div className="w-[20px] h-[20px] rounded-full border-[3px] border-blue-500 bg-white flex items-center justify-center p-[2px]">
                     <div className="w-[8px] h-[8px] rounded-full bg-blue-500"></div>
                  </div>
                </div>
                
                <div className="flex-1 pb-4 w-full">
                  <div className="text-slate-800 font-bold text-[15px]">信息确认</div>
                  <div className="text-[13px] text-slate-500 mt-1">信息确认</div>

                  {/* Tag Search */}
                  <div className="mt-3 flex items-center text-[13px] text-slate-600 bg-white border border-slate-200 rounded py-2 px-3 w-full shadow-sm">
                    <Search size={14} className="text-blue-500 mr-2 font-bold opacity-70" /> 
                    <span className="font-medium text-slate-700">挂失</span>
                  </div>

                  {/* Recommended Scripts */}
                  <div className="mt-6 space-y-3">
                    <div className="text-blue-600 font-semibold mb-3 text-[14px]">推荐话术</div>
                    
                    <div className="bg-[#f0f7ff] border border-blue-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                      <div className="text-[12px] text-slate-400 mb-1.5">客户提供身份信息前</div>
                      <div className="text-[13px] text-slate-800 leading-relaxed font-medium">
                        为了保障您的资金安全，我需要先核实您的身份。请问您办理信用卡时预留的姓名和身份证号是多少？
                      </div>
                    </div>

                    <div className="bg-[#f0f7ff] border border-blue-100 rounded-lg p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                      <div className="text-[12px] text-slate-400 mb-1.5">客户提供身份信息后</div>
                      <div className="text-[13px] text-slate-800 leading-relaxed font-medium">
                        现在正在为您进行身份核实，请稍后。
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button className="bg-blue-600 text-white text-[13px] px-6 py-2 rounded font-medium hover:bg-blue-700 transition shadow-sm">
                      上一步
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 text-sm py-10">
              请在左侧发起模拟对话，触发流程导航
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProcessNavigation;
