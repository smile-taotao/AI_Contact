import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  Send, 
  Mic, 
  Smile, 
  RotateCcw, 
  Trash2,
  Phone, 
  MoreHorizontal, 
  ArrowLeft,
  Wifi, 
  Battery, 
  Signal, 
  CheckCircle2, 
  Bot, 
  Headphones,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  GripHorizontal
} from 'lucide-react';
import { chatStore, ChatMessage } from '../services/chatStore';
import { InteractiveCardBubble } from './InteractiveCardBubble';

interface ClientMobileFloatingSimulatorProps {
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export default function ClientMobileFloatingSimulator({ 
  onClose,
  onToast 
}: ClientMobileFloatingSimulatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatStore.getMessages());
  const [inputText, setInputText] = useState('');
  const [isTypingAgent, setIsTypingAgent] = useState(false);
  const [showQuickInject, setShowQuickInject] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Position & Dragging State (支持随意拖动位置)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 260, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 260,
    posY: 16
  });

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = chatStore.subscribe(() => {
      setMessages(chatStore.getMessages());
    });
    return unsubscribe;
  }, []);

  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      if (messages.length > prevMessagesLengthRef.current || isTypingAgent) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isTypingAgent]);

  // Dragging event listeners for mouse
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = dragStartRef.current.posX + dx;
      const newY = dragStartRef.current.posY + dy;

      // Constrain within visible viewport boundaries
      const boundedX = Math.max(10, Math.min(window.innerWidth - 390, newX));
      const boundedY = Math.max(10, Math.min(window.innerHeight - 150, newY));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Dragging event listeners for touch devices
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;
      const newX = dragStartRef.current.posX + dx;
      const newY = dragStartRef.current.posY + dy;

      const boundedX = Math.max(10, Math.min(window.innerWidth - 390, newX));
      const boundedY = Math.max(10, Math.min(window.innerHeight - 150, newY));

      setPosition({ x: boundedX, y: boundedY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    // Prevent dragging when clicking interactive buttons or inputs
    if ((e.target as HTMLElement).closest('button, input, textarea')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleTouchStartHeader = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) {
      return;
    }
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    chatStore.sendMessage('customer', text);
    setInputText('');

    if (onToast) {
      onToast(`📱 客户端已发送消息：“${text.length > 12 ? text.slice(0, 12) + '...' : text}”`);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick customer questions
  const quickQuestions = [
    '银行卡不小心丢了',
    '了解理财产品',
    '卡不能用了，无法转账'
  ];

  return (
    <div 
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 w-[380px] max-w-[calc(100vw-40px)] h-[730px] max-h-[calc(100vh-32px)] flex flex-col bg-[#002f6c] text-white rounded-2xl shadow-2xl shadow-blue-950/45 border-2 border-[#1890ff]/60 overflow-hidden select-none transition-shadow ${
        isDragging ? 'shadow-blue-500/30 ring-2 ring-blue-400 cursor-grabbing' : ''
      }`}
    >
      
      {/* 1. Floating Simulator Header (偏蓝色系，与整体页面风格保持一致) */}
      <div 
        onMouseDown={handleMouseDownHeader}
        onTouchStart={handleTouchStartHeader}
        className="h-11 bg-gradient-to-r from-[#0052cc] via-[#006fe6] to-[#1890ff] border-b border-blue-400/40 px-3 flex items-center justify-between flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
        title="按住顶栏可随意拖拉窗口位置"
      >
        <div className="flex items-center space-x-2">
          {/* Drag Handle Grip Icon */}
          <div className="text-blue-100/75 hover:text-white cursor-grab p-0.5">
            <GripHorizontal size={15} />
          </div>

          <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center shadow-xs border border-white/25">
            <Smartphone size={14} />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-white tracking-wide">客户端手机app</span>
            <span className="text-[10px] bg-white/20 text-blue-50 border border-white/30 px-1.5 py-0.2 rounded font-medium">
              客户模拟
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Real-time status */}
          <div className="flex items-center space-x-1 text-[10px] bg-[#003873]/60 text-emerald-300 font-medium px-1.5 py-0.5 rounded-full border border-blue-300/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>双向同步</span>
          </div>

          {/* Quick presets toggle */}
          <button
            type="button"
            onClick={() => setShowQuickInject(prev => !prev)}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              showQuickInject 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-white/85 hover:text-white hover:bg-white/15'
            }`}
            title="快捷业务诉求注入面板"
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-white/85 hover:text-white hover:bg-red-500/80 transition-colors cursor-pointer"
            title="关闭悬浮手机"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Quick Inject Preset Drawer (Collapsible) - 协调深蓝风格 */}
      {showQuickInject && (
        <div className="bg-gradient-to-b from-[#004e9a] to-[#003873] border-b border-blue-400/30 p-2.5 text-xs text-blue-50 space-y-1.5 flex-shrink-0 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-[11px] text-blue-200 font-medium mb-1">
            <span>⚡ 快速注入客户常见业务诉求：</span>
            <button
              onClick={() => setShowQuickInject(false)}
              className="text-blue-200 hover:text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10"
            >
              收起
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto custom-scrollbar pr-0.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleSendMessage(q);
                  setShowQuickInject(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded bg-blue-900/60 hover:bg-[#1890ff] text-[11px] text-blue-100 hover:text-white transition-colors truncate flex items-center justify-between group cursor-pointer border border-blue-400/20"
              >
                <span className="truncate">{idx + 1}. {q}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Phone Screen Body (Realistic Mobile Mockup) */}
      <div className="flex-1 bg-[#f5f6fa] text-slate-800 flex flex-col overflow-hidden relative">

        {/* Mobile Status Bar */}
        <div className="h-7 bg-white flex items-center justify-between px-3 text-slate-700 text-[10px] font-semibold flex-shrink-0 border-b border-slate-100">
          <span>10:10</span>
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Signal size={10} />
            <Wifi size={10} />
            <Battery size={12} className="fill-current text-slate-700" />
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="h-10 bg-white flex items-center justify-between px-3 border-b border-slate-200/80 flex-shrink-0 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <button type="button" className="p-1 text-slate-500 hover:text-slate-800" title="返回">
              <ArrowLeft size={14} />
            </button>
            <div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">手机银行在线客服</div>
              <div className="text-[9px] text-emerald-600 flex items-center leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                <span>工号 6028 在线</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-slate-500">
            <button type="button" className="p-1 hover:text-slate-800" title="客服电话">
              <Phone size={13} />
            </button>
            <button type="button" className="p-1 hover:text-slate-800" title="更多">
              <MoreHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* Service channel banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-2.5 py-1 text-[10px] text-blue-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-1 truncate">
            <Bot size={12} className="text-blue-600 flex-shrink-0" />
            <span className="truncate">客户专属咨询通道 · 全程加密安全质检</span>
          </div>
          <span className="text-[9px] bg-blue-600 text-white px-1 py-0.2 rounded font-mono flex-shrink-0">
            APP模拟
          </span>
        </div>

        {/* Phone Chat Messages Scroll Area */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar text-xs"
        >
          {/* Welcome service intro card */}
          <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-slate-200/70 text-slate-700 leading-relaxed text-[11px]">
            <div className="font-bold text-slate-800 flex items-center mb-0.5 text-xs">
              <Headphones size={12} className="text-blue-600 mr-1" />
              智能金融客服助手
            </div>
            尊敬的客户您好！已为您接入人工坐席【工号 6028】。您可以直接在下方输入诉求或点击快捷问题咨询。
          </div>

          {/* Dynamic Messages */}
          {messages.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs select-none">
              <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-300 mb-2 shadow-2xs">
                <Smartphone size={18} className="text-blue-400" />
              </div>
              <div className="font-semibold text-slate-600 text-xs">暂无聊天记录</div>
              <div className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                可点击下方快捷诉求或在输入框发送业务咨询，消息将实时同步至坐席端。
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
                        <div className="bg-white border border-slate-200 border-l-[3.5px] border-l-red-500 rounded-xl p-2 shadow-2xs text-xs text-slate-800 leading-relaxed font-sans text-left w-full">
                          <div className="space-y-0.5">
                            {msg.content.split('\n').map((line, idx) => {
                              if (idx === 0) {
                                return (
                                  <div key={idx} className="font-bold flex items-center space-x-1 mb-0.5 text-[10px]">
                                    <span className="w-3 h-3 rounded-xs bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
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
                        <div className="p-2 rounded-xl rounded-tr-xs shadow-2xs text-[11px] leading-relaxed break-words whitespace-pre-line bg-[#1890ff] text-white">
                          {msg.content}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 mt-0.5 font-mono mr-1">
                        {msg.timeOnly || '10:09'}
                      </span>
                    </div>
                    {/* Customer Avatar */}
                    <div className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      我
                    </div>
                  </div>
                );
              }

              // Agent message or card bubble (Left side)
              return (
                <div key={msg.id} className="flex justify-start items-start space-x-1.5">
                  {/* Agent Avatar */}
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 shadow-2xs">
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
                      <div className="bg-white text-slate-800 border border-slate-200/80 p-2 rounded-xl rounded-tl-xs shadow-2xs text-[11px] leading-relaxed break-words whitespace-pre-line">
                        {msg.content}
                      </div>
                    )}
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono ml-1">
                      {msg.timeOnly || '10:10'}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isTypingAgent && (
            <div className="flex items-center space-x-1 text-slate-400 text-[10px] pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
              <span className="text-slate-500">坐席正在回复...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips (Horizontal scroll) */}
        <div className="px-2 py-1.5 bg-slate-50 border-t border-slate-200/70 overflow-x-auto whitespace-nowrap custom-scrollbar flex-shrink-0 flex space-x-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full text-[10px] text-slate-600 hover:text-blue-600 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Customer Mobile Input Bar */}
        <div className="p-2 bg-white border-t border-slate-200 flex items-center space-x-1.5 flex-shrink-0">
          <button 
            type="button" 
            onClick={() => handleSendMessage('【客户发送了语音录音 00:03"】')}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="语音"
          >
            <Mic size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="模拟客户发送消息..."
            className="flex-1 bg-slate-100 text-[11px] px-2.5 py-1.5 rounded-full outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
          />

          <button 
            type="button" 
            onClick={() => setInputText(prev => prev + '🙏')}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            title="表情"
          >
            <Smile size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-xs flex-shrink-0 cursor-pointer"
            title="发送"
          >
            <Send size={12} className="-ml-0.5" />
          </button>
        </div>

        {/* Phone Home Bar */}
        <div className="h-3 bg-white flex items-center justify-center flex-shrink-0">
          <div className="w-20 h-1 bg-slate-300 rounded-full"></div>
        </div>

      </div>

      {/* 3. Bottom Simulator Utility Footer (偏蓝色系，与整体页面风格保持一致) */}
      <div className="h-9 bg-gradient-to-r from-[#003873] via-[#004e9a] to-[#005bb5] border-t border-blue-400/30 px-3 flex items-center justify-between text-[11px] text-blue-100 flex-shrink-0">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="text-[10px] text-blue-100 truncate">
            工号 6028 在线双向通道
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                chatStore.loadSampleMessages();
                if (onToast) onToast('✓ 已加载示例会话数据');
              }}
              className="text-white hover:bg-white/15 px-1.5 py-0.5 rounded text-[10px] border border-blue-300/40 flex items-center space-x-1 cursor-pointer transition-colors"
              title="载入示例数据用于测试"
            >
              <Sparkles size={11} className="text-blue-200" />
              <span>载入示例</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                chatStore.clearMessages();
                if (onToast) onToast('✓ 聊天内容已清空');
              }}
              className="text-blue-200 hover:text-red-200 hover:bg-red-500/20 px-1.5 py-0.5 rounded text-[10px] border border-blue-400/30 flex items-center space-x-1 cursor-pointer transition-colors"
              title="清空当前聊天记录"
            >
              <Trash2 size={11} />
              <span>清空</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
