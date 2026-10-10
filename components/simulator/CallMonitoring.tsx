import React, { useState, useRef, useEffect } from 'react';
import { User, Headset, MessageSquare, RotateCcw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
  intent?: string;
  emotion?: string;
  filtered?: boolean;
}

interface CallMonitoringProps {
  isPristine?: boolean;
  onReset?: () => void;
  isDisabled?: boolean;
}

const CallMonitoring: React.FC<CallMonitoringProps> = ({ isPristine = true, onReset, isDisabled = false }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>(isPristine ? [
    { id: '1', sender: 'agent', text: '嗯，您姓名和身份证号是多少？', timestamp: '2026-04-27 19:48:43', intent: '否认信息', emotion: '平和' },
    { id: '2', sender: 'customer', text: '姓名。', timestamp: '2026-04-27 19:48:43', emotion: '平和' },
    { id: '3', sender: 'agent', text: '姓名是李身份证号。', timestamp: '2026-04-27 19:48:44', intent: '否认信息', emotion: '平和' },
    { id: '4', sender: 'customer', text: '嗯。', timestamp: '2026-04-27 19:48:45', emotion: '平和', filtered: true },
    { id: '5', sender: 'agent', text: '嗯。', timestamp: '2026-04-27 19:48:47', intent: '否认信息', emotion: '平和' },
    { id: '6', sender: 'agent', text: '身份证号是 23456789。', timestamp: '2026-04-27 19:48:51', intent: '否认信息', emotion: '平和' },
  ] : []);

  const [customerInput, setCustomerInput] = useState('');
  const [agentInput, setAgentInput] = useState('');
  
  const [batchMode, setBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [parsedMessages, setParsedMessages] = useState<{sender: 'customer'|'agent', text: string}[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(-1);

  // Auto-scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (sender: 'customer' | 'agent') => {
    const text = sender === 'customer' ? customerInput : agentInput;
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date().toLocaleString(),
      intent: '未知意图',
      emotion: '平和',
      filtered: sender === 'customer' && text.length <= 2,
    };

    setMessages([...messages, newMessage]);
    if (sender === 'customer') setCustomerInput('');
    else setAgentInput('');
  };

  const handleParseBatch = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split('\n');
    const newMsgs: {sender: 'customer'|'agent', text: string}[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      let sender: 'customer' | 'agent' | null = null;
      let text = trimmed;
      
      if (trimmed.startsWith('客户：') || trimmed.startsWith('客户:')) {
          sender = 'customer';
          text = trimmed.substring(3).trim();
      } else if (trimmed.startsWith('坐席：') || trimmed.startsWith('坐席:')) {
          sender = 'agent';
          text = trimmed.substring(3).trim();
      }
      
      if (sender) {
         newMsgs.push({
           sender,
           text,
         });
      }
    });

    if (newMsgs.length > 0) {
       setParsedMessages(newMsgs);
       setCurrentBatchIndex(0);
    }
  };

  const handleSendNextBatchMsg = () => {
    if (currentBatchIndex >= 0 && currentBatchIndex < parsedMessages.length) {
       const msgToSubmit = parsedMessages[currentBatchIndex];
       
       const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: msgToSubmit.sender,
          text: msgToSubmit.text,
          timestamp: new Date().toLocaleString(),
          intent: '未知意图',
          emotion: '平和',
          filtered: msgToSubmit.sender === 'customer' && msgToSubmit.text.length <= 2,
       };

       setMessages([...messages, newMessage]);
       setCurrentBatchIndex(currentBatchIndex + 1);
    }
  };

  const batchQueueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (batchQueueRef.current && currentBatchIndex >= 0 && currentBatchIndex < parsedMessages.length) {
       const el = document.getElementById(`batch-msg-${currentBatchIndex}`);
       if (el) {
          batchQueueRef.current.scrollTo({
             top: el.offsetTop - 40,
             behavior: 'smooth'
          });
       }
    }
  }, [currentBatchIndex, parsedMessages.length]);

  const renderQueueItem = (msg: { sender: 'customer'|'agent'; text: string }, idx: number) => {
     let status = 'pending';
     if (idx < currentBatchIndex) status = 'sent';
     if (idx === currentBatchIndex) status = 'current';

     let opacityClass = 'opacity-100';
     if (status === 'sent') opacityClass = 'opacity-40';
     if (status === 'pending') {
        if (idx === currentBatchIndex + 1) opacityClass = 'opacity-80';
        else if (idx === currentBatchIndex + 2) opacityClass = 'opacity-60';
        else if (idx === currentBatchIndex + 3) opacityClass = 'opacity-40';
        else opacityClass = 'opacity-30';
     }
     
     return (
        <div key={idx} id={`batch-msg-${idx}`} className={`flex items-center px-4 py-2 transition-all duration-300 ${status === 'current' ? 'bg-white border border-blue-200 shadow-md z-10 scale-[1.02] rounded mx-2' : `mx-4 px-2 ${opacityClass} my-0.5`}`}>
           <span className={`w-12 text-[12px] font-medium shrink-0 ${status === 'current' ? (msg.sender === 'customer' ? 'text-blue-600' : 'text-emerald-600') : 'text-slate-500'}`}>
              {msg.sender === 'customer' ? '客户：' : '坐席：'}
           </span>
           <span className={`flex-1 break-all text-[13px] ${status === 'current' ? 'font-medium text-slate-800' : 'text-slate-500'} ${status === 'sent' ? 'line-through decoration-slate-300' : ''}`}>
              {msg.text}
           </span>
           {status === 'sent' && <span className="ml-2 text-[10px] text-emerald-500 shrink-0 border border-emerald-100 bg-emerald-50 px-1 py-0.5 rounded flex items-center">已发</span>}
           {status === 'current' && <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shrink-0 font-medium flex items-center">待发送</span>}
        </div>
     );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex justify-between items-center px-4 h-[46px] border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 flex items-center text-[15px]">
          <span className="w-[3px] h-[14px] bg-blue-600 mr-2 rounded-full"></span>
          通话监测
        </h2>
        <div className="text-blue-600 flex items-center font-medium text-[13px]">
          <span>通话中: 00:02:14</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 divide-x border-b border-slate-200 text-[11px] text-center text-slate-600 bg-slate-50/50">
        <div className="py-2.5 px-1 truncate">客户情绪触发次数: <span className="text-blue-600 font-medium">{isPristine ? 22 : 0}</span></div>
        <div className="py-2.5 px-1 truncate">坐席违禁内容告警次数: <span className="text-blue-600 font-medium">0</span></div>
        <div className="py-2.5 px-1 truncate">坐席服务告警次数: <span className="text-blue-600 font-medium">0</span></div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6"
      >
        {/* Load More... */}
        <div className="flex justify-center items-center text-[12px] text-slate-400 mb-6">
          <div className="h-px bg-slate-200 flex-1 mr-4"></div>
          <span className="cursor-pointer hover:text-blue-500">查看更多历史聊天记录</span>
          <div className="h-px bg-slate-200 flex-1 ml-4"></div>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col w-full">
            {/* Timestamp & Avatar row */}
            <div className={`flex items-start ${msg.sender === 'customer' ? 'flex-row' : 'flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${msg.sender === 'customer' ? 'border-blue-500 text-blue-500' : 'bg-blue-600 text-white border-blue-600'}`}>
                  {msg.sender === 'customer' ? <User size={18} strokeWidth={2.5} /> : <Headset size={18} />}
                </div>
              </div>

              {/* Message Content */}
              <div className={`flex flex-col max-w-[80%] ${msg.sender === 'customer' ? 'ml-3' : 'mr-3'} ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}>
                 <div className="text-[11px] text-slate-400 mb-1.5 font-medium tracking-wide">
                  {msg.timestamp}
                 </div>
                 
                 <div className="flex items-center">
                   <div className={`px-4 py-2.5 text-[13px] text-slate-800 rounded-lg inline-block ${msg.sender === 'customer' ? 'bg-[#f4f6f8]' : 'bg-[#f4f6f8]'}`}>
                     {msg.text}
                   </div>
                   {msg.filtered && msg.sender === 'customer' && (
                     <span className="ml-2 text-[11px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shrink-0 flex items-center">
                       已过滤
                     </span>
                   )}
                 </div>

                 {/* Meta Info Below Bubble */}
                 <div className="mt-2 text-[12px] text-slate-600 space-y-1">
                   {msg.intent && (
                     <div className="flex items-center">
                       <span className="w-[6px] h-[6px] rounded-full bg-slate-300 mr-2"></span>
                       识别意图：<span className="text-slate-800">{msg.intent}</span>
                     </div>
                   )}
                   {msg.emotion && (
                     <div className="flex items-center">
                       <span className="w-[6px] h-[6px] rounded-full bg-slate-300 mr-2"></span>
                       {msg.sender === 'customer' ? '客户情绪' : '坐席情绪'}：<span className="text-red-500 ml-1">{msg.emotion}</span>
                       {msg.sender === 'customer' && <MessageSquare size={10} className="text-blue-500 ml-1" />}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Inputs */}
      <div className="border-t p-3 bg-white space-y-3 border-slate-200 shadow-[0_-2px_6px_rgba(0,0,0,0.02)] relative">
        <div className="flex justify-between items-center text-xs px-1">
           <div className="flex items-center">
             <span className="text-slate-500 font-medium mr-6">消息模拟</span>
             {onReset && (
               <button 
                 className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition font-medium"
                 onClick={onReset}
                 title="重置测试会话"
               >
                 <RotateCcw size={12} className="mr-1" />
                 会话重置
               </button>
             )}
           </div>
           <button 
             className="text-blue-500 hover:text-blue-600 transition font-medium"
             onClick={() => setBatchMode(!batchMode)}
           >
             {batchMode ? '切换单条输入' : '切换批量输入'}
           </button>
        </div>
        
        {batchMode ? (
           currentBatchIndex >= 0 ? (
               <div className="flex flex-col space-y-2">
                 <div ref={batchQueueRef} className="relative h-[136px] bg-[#f8fafc] border border-slate-200 rounded overflow-y-auto custom-scrollbar flex flex-col py-2 shadow-inner snap-y">
                   {parsedMessages.map((msg, idx) => renderQueueItem(msg, idx))}
                   {currentBatchIndex >= parsedMessages.length && (
                      <div className="h-10 shrink-0 flex items-center justify-center text-[13px] text-slate-500 font-medium bg-slate-100 border border-slate-200 mx-2 mt-4 mb-2 rounded">全部发送完成</div>
                   )}
                 </div>
                 
                 <div className="flex justify-between items-center mt-2">
                    <button 
                      className="text-slate-500 hover:text-slate-700 text-[12px] px-2"
                      onClick={() => {
                         setParsedMessages([]);
                         setCurrentBatchIndex(-1);
                         setBatchText('');
                      }}
                    >重新解析 / 退出</button>
                    <button 
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-[13px] font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSendNextBatchMsg}
                      disabled={isDisabled || currentBatchIndex >= parsedMessages.length}
                    >发送此条 {currentBatchIndex < parsedMessages.length ? `(${currentBatchIndex + 1}/${parsedMessages.length})` : ''}</button>
                 </div>
               </div>
           ) : (
               <div className="flex flex-col space-y-2">
                  <textarea 
                    className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 bg-slate-50 resize-none h-[110px]"
                    placeholder="在此粘贴多行聊天记录...&#10;格式示例：&#10;客户：你好，我的信用卡丢了，我要办理信用卡挂失&#10;坐席：先生，您先别着急&#10;客户：待会卡里面的钱都被盗刷了"
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                  />
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-[13px] w-full font-medium shadow-sm disabled:opacity-50"
                    onClick={handleParseBatch}
                    disabled={!batchText.trim()}
                  >解析会话</button>
               </div>
           )
        ) : (
           <div className="space-y-2">
              <div className="flex text-sm">
                <input 
                  type="text" 
                  placeholder="模拟客户发言..." 
                  className="flex-1 border border-slate-200 rounded-l px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isDisabled && handleSend('customer')}
                  disabled={isDisabled}
                />
                <button 
                  className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition text-[13px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSend('customer')}
                  disabled={isDisabled}
                >客户发送</button>
              </div>
              <div className="flex text-sm">
                <input 
                  type="text" 
                  placeholder="模拟坐席发言..." 
                  className="flex-1 border border-slate-200 rounded-l px-3 py-1.5 focus:outline-none focus:border-blue-400 bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isDisabled && handleSend('agent')}
                  disabled={isDisabled}
                />
                <button 
                  className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 transition text-[13px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSend('agent')}
                  disabled={isDisabled}
                >坐席发送</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default CallMonitoring;
