import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MoreHorizontal, 
  Smile, 
  Plus, 
  Mic, 
  Send, 
  CreditCard, 
  ShieldAlert, 
  FileText, 
  RefreshCw, 
  RotateCcw,
  CheckCircle2,
  CheckCheck, 
  Bot, 
  Headphones, 
  Wifi, 
  Battery, 
  Signal, 
  ChevronRight,
  ExternalLink,
  SplitSquareVertical,
  SlidersHorizontal,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { chatStore, ChatMessage } from '../services/chatStore';
import { InteractiveCardBubble } from './InteractiveCardBubble';

interface ClientMobileAppProps {
  onNavigateToAgent?: () => void;
}

export default function ClientMobileApp({ onNavigateToAgent }: ClientMobileAppProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatStore.getMessages());
  const [inputText, setInputText] = useState('');
  const [isTypingAgent, setIsTypingAgent] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'split'>('app');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = chatStore.subscribe(() => {
      setMessages(chatStore.getMessages());
    });
    return unsubscribe;
  }, []);

  const prevMessagesLengthRef = useRef(messages.length);

  // Auto scroll to bottom ONLY when new messages are added or agent is typing
  // Selecting options within existing cards updates metadata without increasing messages.length,
  // so the scroll position remains fixed and won't abruptly jump to the confirm button.
  useEffect(() => {
    if (chatScrollRef.current) {
      if (messages.length > prevMessagesLengthRef.current || isTypingAgent) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isTypingAgent]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Send customer message into shared store
    chatStore.sendMessage('customer', text.trim());
    setInputText('');

    // Optional AI / Agent simulated auto-response if question asks something specific and not already answered
    if (text.includes('挂失')) {
      simulateAgentReply('您好，如需办理银行卡紧急挂失，已为您开通绿色保护通道。请问是尾号多少的卡片需要挂失？');
    } else if (text.includes('催促') || text.includes('快点') || text.includes('在吗')) {
      simulateAgentReply('在的，正在为您核实反诈风控系统拦截状态，请稍候片刻。');
    }
  };

  const simulateAgentReply = (reply: string) => {
    setIsTypingAgent(true);
    setTimeout(() => {
      setIsTypingAgent(false);
      chatStore.sendMessage('agent', reply);
    }, 1800);
  };

  // Quick prompt questions that customers frequently ask
  const quickQuestions = [
    '卡不能用了，无法转账',
    '银行卡非柜面限额怎么解除？',
    '转账提示错误代码9901',
    '我的账户为什么被临时冻结？',
    '我要办理银行卡紧急挂失',
    '手机银行转账限额怎么提高？'
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100 font-sans select-none p-6">
      
      {/* Top Banner: Guidance & Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Headphones size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-800">客户端手机APP - 客户在线咨询模拟器</h2>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                双向长连接就绪
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              模拟手机银行客户通过 APP 发送消息与银行坐席沟通，所发送信息将实时双向同步至【智能在线客户】坐席工作台。
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => chatStore.loadSampleMessages()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
            title="恢复初始示例聊天记录"
          >
            <RotateCcw size={13} />
            <span>恢复示例数据</span>
          </button>
          <button
            onClick={() => onNavigateToAgent && onNavigateToAgent()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all shadow-blue-600/20 hover:shadow-md cursor-pointer"
          >
            <Headphones size={14} />
            <span>前往【智能在线客户】工作台查看回复</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        
        {/* Smartphone Device Mockup */}
        <div className="w-[390px] h-[720px] max-h-full bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative flex-shrink-0">
          
          {/* Phone Speaker & Dynamic Island */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2"></div>
            <div className="w-2 h-2 rounded-full bg-blue-900/60"></div>
          </div>

          {/* Phone Screen Canvas */}
          <div className="flex-1 bg-[#f5f6fa] rounded-[38px] overflow-hidden flex flex-col relative z-20">
            
            {/* 1. Mobile Status Bar */}
            <div className="h-10 bg-white flex items-center justify-between px-6 text-slate-800 text-[11px] font-semibold flex-shrink-0 pt-2 border-b border-slate-100">
              <span>10:10</span>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={14} className="fill-current" />
              </div>
            </div>

            {/* 2. Mobile App Header */}
            <div className="h-12 bg-white flex items-center justify-between px-3 border-b border-slate-200/80 flex-shrink-0 shadow-sm">
              <button className="p-1.5 text-slate-600 hover:text-slate-900">
                <ArrowLeft size={18} />
              </button>
              
              <div className="text-center">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center space-x-1">
                  <span>手机银行在线客服</span>
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center justify-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>工号 6028 为您服务</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-slate-600">
                <button className="p-1 hover:text-slate-900" title="客服热线">
                  <Phone size={16} />
                </button>
                <button className="p-1 hover:text-slate-900" title="更多">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* 3. Official Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-3.5 py-2 text-[11px] text-blue-900 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-1.5">
                <Bot size={14} className="text-blue-600" />
                <span>银行业务咨询专属通道 · 全程质检录音</span>
              </div>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono">
                web渠道
              </span>
            </div>

            {/* 4. Chat Messages Scroll Area */}
            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar text-xs"
            >
              {/* Timestamp separator */}
              <div className="text-center">
                <span className="bg-slate-200/70 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                  今日 10:08
                </span>
              </div>

              {/* Service Intro Card */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/70 text-slate-700 leading-relaxed text-[11px]">
                <div className="font-bold text-slate-800 flex items-center mb-1 text-xs">
                  <Headphones size={13} className="text-blue-600 mr-1" />
                  智能金融客服助手
                </div>
                尊敬的客户您好！已为您接入人工坐席【工号 6028】。当前会话已建立安全通道，您可以直接发送转账、账户解控或挂失等业务诉求。
              </div>

              {/* Dynamic Messages */}
              {messages.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div className="font-semibold text-slate-600 text-xs">当前会话已结束</div>
                  <div className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    所有聊天记录已清空。您可以点击下方快捷诉求或在输入框发送新消息重新咨询。
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';

                if (msg.recalled) {
                  return (
                    <div key={msg.id} className="text-center text-[10px] text-slate-400 my-1">
                      <span>坐席 6028 撤回了一条消息</span>
                    </div>
                  );
                }

                if (isCustomer) {
                  // Customer message bubble (Right side)
                  const isCheckFeedback = msg.content.startsWith('✔ 客户');
                  return (
                    <div key={msg.id} className="flex justify-end items-start space-x-1.5">
                      <div className="flex flex-col items-end max-w-[85%]">
                        {isCheckFeedback ? (
                          <div className="bg-white border border-slate-200 border-l-[3.5px] border-l-red-500 rounded-xl p-2.5 shadow-xs text-xs text-slate-800 leading-relaxed font-sans text-left w-full">
                            <div className="space-y-1">
                              {msg.content.split('\n').map((line, idx) => {
                                if (idx === 0) {
                                  return (
                                    <div key={idx} className="font-bold flex items-center space-x-1 mb-1 text-[11px]">
                                      <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                                      <span className="text-red-600 font-bold ml-1">{line.replace('✔', '').trim()}</span>
                                    </div>
                                  );
                                }
                                const colonIdx = line.indexOf('：');
                                if (colonIdx !== -1) {
                                  const k = line.slice(0, colonIdx);
                                  const v = line.slice(colonIdx + 1);
                                  return (
                                    <div key={idx} className="text-slate-700 text-[10px] flex">
                                      <span className="text-slate-500 flex-shrink-0">{k}：</span>
                                      <span className="font-medium text-slate-900">{v}</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={idx} className="text-slate-600 text-[10px]">
                                    {line}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-2xl rounded-tr-xs shadow-sm text-xs leading-relaxed break-words whitespace-pre-line bg-[#1890ff] text-white">
                            {msg.content}
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 mt-0.5 font-mono mr-1">
                          {msg.timeOnly || '10:09'}
                        </span>
                      </div>
                      {/* Customer Avatar */}
                      <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        我
                      </div>
                    </div>
                  );
                }

                // Agent message or card bubble (Left side)
                return (
                  <div key={msg.id} className="flex justify-start items-start space-x-1.5">
                    {/* Agent Avatar */}
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-xs">
                      客服
                    </div>
                    <div className="flex flex-col items-start max-w-[85%]">
                      {msg.type === 'card' ? (
                        <InteractiveCardBubble
                          cardType={msg.metadata?.cardType}
                          cardData={msg.metadata?.cardData}
                          messageId={msg.id}
                          isClientView={true}
                        />
                      ) : (
                        <div className="bg-white text-slate-800 border border-slate-200/80 p-2.5 rounded-2xl rounded-tl-xs shadow-xs text-xs leading-relaxed break-words whitespace-pre-line">
                          {msg.content}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 mt-0.5 font-mono ml-1">
                        {msg.timeOnly || '10:10'}
                      </span>
                    </div>
                  </div>
                );
              }))}

              {/* Typing indicator */}
              {isTypingAgent && (
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] pl-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                  <span className="text-slate-500">坐席正在输入中...</span>
                </div>
              )}
            </div>

            {/* 5. Customer Quick Suggestion Chips */}
            <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-200/60 overflow-x-auto whitespace-nowrap custom-scrollbar flex-shrink-0 flex space-x-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-[10px] text-slate-600 hover:text-blue-600 transition-colors shadow-xs flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 6. Customer Mobile Input Bar */}
            <div className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => handleSendMessage('【客户发送了语音录音 00:04"】')}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100"
                title="语音"
              >
                <Mic size={18} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="发送给坐席..."
                className="flex-1 bg-slate-100 text-xs px-3 py-2 rounded-full outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
              />

              <button 
                type="button" 
                onClick={() => setInputText(prev => prev + '🙏')}
                className="text-slate-500 hover:text-slate-800 p-1"
                title="表情"
              >
                <Smile size={18} />
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm flex-shrink-0"
                title="发送"
              >
                <Send size={14} className="-ml-0.5" />
              </button>
            </div>

            {/* Phone Home Indicator Bar */}
            <div className="h-4 bg-white flex items-center justify-center flex-shrink-0">
              <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
            </div>

          </div>
        </div>

        {/* Right Side Simulator Helper Tools */}
        <div className="w-72 ml-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <SlidersHorizontal size={16} className="text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">客户端模拟快捷操作</h3>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="text-xs text-slate-500 font-medium">常用客户诉求注入：</div>
              
              <button
                onClick={() => handleSendMessage('卡不能用了，无法转账')}
                className="w-full text-left p-2.5 text-xs bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-400 rounded-lg text-blue-900 transition-all font-semibold flex items-center justify-between"
              >
                <span>1. 卡不能用了，无法转账 (银行客户常见咨询)</span>
                <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">推荐</span>
              </button>

              <button
                onClick={() => handleSendMessage('系统提示：9901 柜面只收不付')}
                className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-all"
              >
                2. 补充错误代码 9901 柜面只收不付
              </button>

              <button
                onClick={() => handleSendMessage('我在手机银行刷脸可以自助解除吗？')}
                className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-all"
              >
                3. 询问人脸自助解控流程
              </button>

              <button
                onClick={() => handleSendMessage('如何提高手机银行单日转账限额？')}
                className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-all"
              >
                4. 询问转账限额调整途径
              </button>

              <button
                onClick={() => handleSendMessage('银行卡不小心丢失了怎么办理紧急挂失？')}
                className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-all"
              >
                5. 询问银行卡紧急挂失与补办
              </button>

              <button
                onClick={() => handleSendMessage('我想咨询一下银行理财产品，有什么稳健推荐？')}
                className="w-full text-left p-2.5 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-700 transition-all"
              >
                6. 客户咨询理财产品与合规推荐
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium mb-2">测试说明：</div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>点击上方任意快捷问题，可一键在手机端发送。</li>
                <li>切换到左侧菜单【智能在线客户】，坐席工作台将即时接收，并在右侧推荐对应指定话术。</li>
                <li><strong>最新问题</strong>展示在最前并标为“最新”，此前推荐的问题转为“历史”。</li>
                <li>展开顶部<strong>【推荐记录】</strong>下拉框，可随时定位查看所有历史与最新推荐内容。</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('确定加载示例会话数据吗？')) {
                chatStore.loadSampleMessages();
              }
            }}
            className="w-full py-2 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1.5 mt-4 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>载入示例四条聊天记录</span>
          </button>
        </div>

      </div>

    </div>
  );
}
