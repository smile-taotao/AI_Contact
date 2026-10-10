import React, { useState } from 'react';
import { ChevronDown, Bot, ThumbsUp, ThumbsDown, Copy, BookOpen } from 'lucide-react';

interface KnowledgeRecommendationProps {
  isPristine?: boolean;
}

const KnowledgeRecommendation: React.FC<KnowledgeRecommendationProps> = ({ isPristine = true }) => {
  const [subTab, setSubTab] = useState('auto');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <h2 className="font-semibold text-slate-800 text-[15px] flex items-center">
          <BookOpen size={18} className="mr-2 text-blue-600" />
          知识推荐
        </h2>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b text-sm bg-white pt-2 px-4 shrink-0">
        <button 
          className={`flex-1 py-2 border-b-[3px] text-center text-[13px] transition ${subTab === 'auto' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-600 hover:text-blue-500'}`}
          onClick={() => setSubTab('auto')}
        >自动推荐(快速)</button>
        <button 
           className={`flex-1 py-2 border-b-[3px] text-center text-[13px] transition ${subTab === 'manual' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-600 hover:text-blue-500'}`}
           onClick={() => setSubTab('manual')}
        >手动查询</button>
        <button 
           className={`flex-1 py-2 border-b-[3px] text-center text-[13px] transition ${subTab === 'expert' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-slate-600 hover:text-blue-500'}`}
           onClick={() => setSubTab('expert')}
        >推荐回答(专家)</button>
      </div>

      <div className="p-4 space-y-4">
         {/* Dropdown */}
         <div className="flex justify-between items-center text-blue-500 text-[13px] border-b border-blue-200 pb-2 cursor-pointer font-medium">
            <span>历史推荐记录</span>
            <ChevronDown size={16} />
         </div>

         {isPristine ? (
           <>
             {/* Answer Card */}
             <div className="bg-white border border-slate-200 rounded p-4 space-y-2 relative shadow-sm">
                <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-slate-800">好的</span>
                    <div className="flex items-center text-slate-400 text-[11px]">
                        <span className="mr-3">3737ms</span>
                        <span className="flex items-center text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded shadow-sm">
                          <Bot size={13} className="mr-1" /> AI回答
                        </span>
                    </div>
                </div>
                <div className="text-[12px] text-slate-400 mt-2">
                    匹配会话：“ <span className="text-slate-700">好的。</span> ”
                </div>
             </div>

             {/* TOP 1 */}
             <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="flex justify-between items-center text-[13px] p-3 border-b border-slate-200 bg-[#f8fafc]">
                   <span className="font-bold text-slate-800">TOP1：八、业务风险防控要点</span>
                   <div className="flex items-center text-[11px] text-blue-600">
                      <div className="w-[5px] h-[5px] rounded-full bg-blue-500 mr-1.5"></div>
                      匹配度：35%
                   </div>
                </div>
                <div className="p-4 space-y-3">
                   <span className="text-[11px] border border-slate-200 rounded px-2 py-1 flex w-fit text-slate-500 bg-white">知识库</span>
                   
                   <div className="h-28 border border-slate-100 bg-[#f8fafc] rounded flex items-center justify-center text-slate-400 text-[12px]"></div>

                   <div className="text-center text-[12px] text-blue-500 cursor-pointer pt-1 flex items-center justify-center hover:text-blue-600">展开 <ChevronDown size={14} className="ml-1"/></div>
                   
                   <div className="text-[11px] text-slate-400 flex flex-wrap gap-1 leading-relaxed mt-2">
                     来源：<span className="text-blue-600 cursor-pointer hover:underline mx-1">信用卡挂失业务操作流程知识库文档 (格式调整版1) .docx</span> 第...
                   </div>

                   <div className="flex justify-end gap-5 text-slate-400 pt-3 border-t border-slate-100 mt-4">
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><ThumbsUp size={14} className="mr-1.5"/> 点赞</button>
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><ThumbsDown size={14} className="mr-1.5"/> 点踩</button>
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><Copy size={14} className="mr-1.5"/> 复制</button>
                   </div>
                </div>
             </div>

             {/* TOP 2 */}
             <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="flex justify-between items-center text-[13px] p-3 border-b border-slate-200 bg-[#f8fafc]">
                   <span className="font-bold text-slate-800">TOP2：(三) 业务处理核心目标</span>
                   <div className="flex items-center text-[11px] text-blue-600">
                      <div className="w-[5px] h-[5px] rounded-full bg-blue-500 mr-1.5"></div>
                      匹配度：34%
                   </div>
                </div>
                <div className="p-4 space-y-3">
                   <span className="text-[11px] border border-slate-200 rounded px-2 py-1 flex w-fit text-slate-500 bg-white">知识库</span>
                   
                   <div className="h-28 border border-slate-100 bg-[#f8fafc] rounded flex items-center justify-center text-slate-400 text-[12px]"></div>

                   <div className="text-center text-[12px] text-blue-500 cursor-pointer pt-1 flex items-center justify-center hover:text-blue-600">展开 <ChevronDown size={14} className="ml-1"/></div>
                   
                   <div className="text-[11px] text-slate-400 flex flex-wrap gap-1 leading-relaxed mt-2">
                     来源：<span className="text-blue-600 cursor-pointer hover:underline mx-1">信用卡账户安全-盗刷业务.docx</span> 第1页
                   </div>

                   <div className="flex justify-end gap-5 text-slate-400 pt-3 border-t border-slate-100 mt-4">
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><ThumbsUp size={14} className="mr-1.5"/> 点赞</button>
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><ThumbsDown size={14} className="mr-1.5"/> 点踩</button>
                      <button className="flex items-center text-[12px] hover:text-blue-600 transition"><Copy size={14} className="mr-1.5"/> 复制</button>
                   </div>
                </div>
             </div>
           </>
         ) : (
           <div className="text-center text-slate-400 text-sm py-10">
             暂无推荐内容
           </div>
         )}
      </div>
    </div>
  );
};
export default KnowledgeRecommendation;
