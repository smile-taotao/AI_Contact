import React from 'react';
import { X, Clock, User, Headset, PlayCircle, Search, FileText, CheckSquare } from 'lucide-react';

interface EventLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockEvents = [
  {
    id: 1,
    time: '2026-05-07 15:30:05',
    type: 'customer_msg',
    title: '原会话消息（客户）',
    content: '你好，我的信用卡丢了，我要办理信用卡挂失',
    details: [
      { label: '情绪告警', text: '触发客户“某某”异常情绪；' },
      { label: '流程触发', text: '触发“信用卡挂失”流程导航；' },
      { label: '知识推荐', text: '触发推荐“信用卡挂失业务操作流程”知识' },
    ]
  },
  {
    id: 2,
    time: '2026-05-07 15:30:10',
    type: 'agent_msg',
    title: '原会话消息（坐席）',
    content: '先生，您先别着急',
    details: [
      { label: '情绪告警', text: '触发坐席“某某”情绪告警；' },
      { label: '违禁告警', text: '触发“某某”敏感词告警；' },
    ]
  },
  {
    id: 3,
    time: '2026-05-07 15:30:12',
    type: 'process',
    title: '“信用卡挂失”流程',
    text: '主动激活“信用卡挂失”流程，并进入开始节点'
  },
  {
    id: 4,
    time: '2026-05-07 15:30:15',
    type: 'process',
    title: '“信用卡挂失”流程',
    text: '自动触发进入“身份核身”节点'
  },
  {
    id: 5,
    time: '2026-05-07 15:30:30',
    type: 'process',
    title: '“信用卡挂失”流程',
    text: '自动触发进入“卡信息查询”节点'
  },
  {
    id: 6,
    time: '2026-05-07 15:30:45',
    type: 'process',
    title: '“信用卡挂失”流程',
    text: '手动触发进入“信用卡挂失”节点'
  },
  {
    id: 7,
    time: '2026-05-07 15:31:00',
    type: 'knowledge',
    title: '知识查询',
    text: '坐席主动查询“信用卡挂失注意事项”知识'
  },
  {
    id: 8,
    time: '2026-05-07 15:32:00',
    type: 'work_order',
    title: '智能填单',
    text: '坐席主动点击获取“信用卡服务”类型的推荐工单'
  },
  {
    id: 9,
    time: '2026-05-07 15:33:05',
    type: 'work_order_create',
    title: '智能工单',
    text: '坐席主动点击“创建工单”，获取信用卡服务类型的工单摘要'
  },
  {
    id: 10,
    time: '2026-05-07 15:35:10',
    type: 'call_summary',
    title: '智能话务小结',
    text: '坐席主动点击“智能在线小结”，获取话务小结内容'
  }
];

const EventLogPanel: React.FC<EventLogPanelProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-40" onClick={onClose}></div>
      )}

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[400px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 text-[15px] flex items-center">
            <Clock size={16} className="mr-2 text-blue-600" />
            事件记录
          </h2>
          <button className="text-slate-400 hover:text-slate-600 transition" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50 relative">
          <div className="absolute left-[33px] top-5 bottom-5 w-px bg-slate-200 z-0"></div>

          <div className="space-y-6 relative z-10">
            {mockEvents.map((event) => {
               const getIcon = () => {
                  switch(event.type) {
                     case 'customer_msg': return <User size={14} className="text-white" />;
                     case 'agent_msg': return <Headset size={14} className="text-white" />;
                     case 'process': return <PlayCircle size={14} className="text-white" />;
                     case 'knowledge': return <Search size={14} className="text-white" />;
                     case 'work_order': 
                     case 'work_order_create': return <FileText size={14} className="text-white" />;
                     case 'call_summary': return <CheckSquare size={14} className="text-white" />;
                     default: return <Clock size={14} className="text-white" />;
                  }
               };

               return (
                  <div key={event.id} className="flex relative">
                     <div className="mr-4 mt-1 shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm
                          ${event.type === 'customer_msg' ? 'bg-blue-500' :
                            event.type === 'agent_msg' ? 'bg-blue-600' :
                            event.type === 'process' ? 'bg-emerald-500' :
                            event.type === 'knowledge' ? 'bg-indigo-500' :
                            event.type === 'work_order' || event.type === 'work_order_create' ? 'bg-amber-500' :
                            'bg-violet-500'
                          }
                        `}>
                           {getIcon()}
                        </div>
                     </div>
                     <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm relative text-[13px] hover:border-blue-300 hover:shadow transition-all group">
                        <div className="absolute top-4 -left-[6px] w-3 h-3 bg-white border-l border-b border-slate-200 transform rotate-45 group-hover:border-blue-300 transition-colors"></div>
                        <div className="flex items-center text-[12px] text-slate-500 mb-2 font-medium relative z-10">
                          {event.time} <span className="mx-2 text-slate-300">|</span> <span className="text-slate-700 font-semibold">{event.title}</span>
                        </div>

                        {event.content && (
                          <div className="text-slate-800 bg-[#f4f6f8] px-3 py-2 rounded mb-2.5 relative z-10">
                            {event.content}
                          </div>
                        )}
                        
                        {event.text && (
                          <div className="text-slate-700 mt-1 relative z-10">{event.text}</div>
                        )}

                        {event.details && (
                           <div className="space-y-2 mt-2 relative z-10 pt-2 border-t border-slate-100">
                             {event.details.map((dt, i) => (
                                <div key={i} className="flex items-start">
                                  <span className={`shrink-0 mr-2 text-[11px] px-1.5 py-0.5 rounded leading-none mt-0.5
                                    ${dt.label.includes('告警') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}
                                  `}>{dt.label}</span>
                                  <span className="text-slate-600 leading-relaxed text-[12px]">{dt.text}</span>
                                </div>
                             ))}
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventLogPanel;
