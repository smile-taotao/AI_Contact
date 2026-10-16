import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Headphones, 
  Mic, 
  Minus, 
  GripVertical, 
  BookOpen, 
  ArrowUpRight, 
  RefreshCw, 
  Sparkles,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  ChevronDown,
  ChevronRight,
  X,
  Flame,
  History,
  ClipboardCheck,
  NotebookPen,
  Volume2
} from 'lucide-react';

interface AsrMessage {
  id: string;
  sender: 'client' | 'agent';
  text: string;
  time: string;
}

interface KnowledgeItem {
  id: string;
  title: string;
  speech: string;
  category: string;
  matchScore?: string;
  views: number;
}

export const SmartVoiceAssistantModal: React.FC = () => {
  // 1. Call State: 通话中 (in-call) vs 非通话 (off-call)
  const [isCallActive, setIsCallActive] = useState<boolean>(true);

  // 2. Modal open/collapsed state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 3. Floating Action Button (FAB) position (pixels from top-left)
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const isDraggingFabRef = useRef<boolean>(false);
  const fabDragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // 4. Assistant Modal Position (pixels from top-left)
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingModalRef = useRef<boolean>(false);
  const modalDragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // 5. ASR Conversation Messages
  const [asrMessages] = useState<AsrMessage[]>([
    { id: '1', sender: 'client', text: '您好', time: '14:20:05' },
    { id: '2', sender: 'agent', text: '您好，很高兴为您服务，请问有什么可以帮您？', time: '14:20:08' },
    { id: '3', sender: 'client', text: '咨询信用卡还款问题', time: '14:20:16' },
    { id: '4', sender: 'agent', text: '请问是还款的哪方面问题呢？比如还款日、到账时效还是还款限额？', time: '14:20:22' },
    { id: '5', sender: 'client', text: '转账限额', time: '14:20:30' },
    { id: '6', sender: 'agent', text: '请问是他行卡还款限额，还是本行储蓄卡还款限额呀？', time: '14:20:38' },
    { id: '7', sender: 'client', text: '他行卡还款限额，手机银行转账提示超限了', time: '14:20:46' },
    { id: '8', sender: 'agent', text: '好的张先生，他行卡转入我行信用卡受转出银行单笔/单日限额及银联清算通道规则约束，我马上为您查询具体标准。', time: '14:20:54' },
  ]);

  const asrEndRef = useRef<HTMLDivElement>(null);

  // 6. Pre-call summary (前情摘要)
  const preCallSummary = `该客户在近一个月内语音进线3笔，视频进线1笔，热线进线2笔，下发1笔咨询工单，0笔投诉工单。查询当日手机银行、2笔交易异常记录。结合数据分析，当前可能咨询信用卡跨行还款限额及免息期相关问题。【AI提示：请核实客户身份及卡号有效性】`;

  // 7. Knowledge Recommendations (知识推荐) - 点击按钮直接推荐5条相关知识，直观看到5条标题，点击展开显示推荐话术且5条标题不隐藏
  const [isRefreshingKnowledge, setIsRefreshingKnowledge] = useState(false);
  const [recommendationBatch, setRecommendationBatch] = useState<number>(0);
  const [copiedSpeechId, setCopiedSpeechId] = useState<string | null>(null);

  const knowledgePools: KnowledgeItem[][] = [
    // 推荐批次 1 (还款与限额规则)
    [
      {
        id: 'k1',
        title: '信用卡跨行还款限额与到账时效规定',
        category: '还款业务 / 限额规则',
        matchScore: '99%',
        views: 1240,
        speech: '张先生，他行借记卡转入我行信用卡，单笔限额一般为5万元，单日累计最高20万元；银联系统实时到账，夜间大额可能顺延至次日早上6点前入账。'
      },
      {
        id: 'k2',
        title: '信用卡账单分期申请条件及当期利息优惠',
        category: '分期业务 / 优惠政策',
        matchScore: '96%',
        views: 980,
        speech: '您当前信用卡处于正常还款期，可办理3期、6期分期，目前享有分期手续费5折优惠券，折算后单期费率仅0.32%。'
      },
      {
        id: 'k3',
        title: '跨行还款扣款成功但未入账处理指引',
        category: '异常处理 / 资金核对',
        matchScore: '94%',
        views: 750,
        speech: '若您他行卡已扣款但信用卡未显示入账，通常是由于跨行清算在途，银联对账完成后会补入或原路退回，请您保留转账凭证。'
      },
      {
        id: 'k4',
        title: '手机银行快捷自动还款签约流程',
        category: '自助渠道 / 签约指南',
        matchScore: '91%',
        views: 620,
        speech: '建议您在手机银行APP签约自动还款服务，可支持绑定本行及主流他行借记卡，在到期还款日自动全额划扣，避免逾期风险。'
      },
      {
        id: 'k5',
        title: '临时额度到期还款规则及清偿说明',
        category: '额度管理 / 临时额度',
        matchScore: '89%',
        views: 510,
        speech: '若您本期使用了临时额度，请注意临时额度不享受循环信用，到期后将全额计入当期最低还款额中，需按期全额结清。'
      }
    ],
    // 推荐批次 2 (转账安全与账户分类)
    [
      {
        id: 'k6',
        title: '手机银行大额转账人脸识别认证指引',
        category: '安全认证 / 手机银行',
        matchScore: '98%',
        views: 1420,
        speech: '若您在手机银行转账单笔超过5万元，系统会触发人脸识别辅助核验，请保持光线充足正对摄像头，核验通过后即可顺利提交。'
      },
      {
        id: 'k7',
        title: '借记卡一二类账户限额及升降级办理流程',
        category: '账户分类 / 限额调整',
        matchScore: '95%',
        views: 1110,
        speech: '二类借记卡日累计出入金限额为1万元、年累计20万元；如需提升额度，可在手机银行或携带身份证至就近网点升级为一类实体卡。'
      },
      {
        id: 'k8',
        title: '信用卡溢缴款取出免手续费规则与时效',
        category: '资金划转 / 溢缴款项',
        matchScore: '93%',
        views: 890,
        speech: '您多存入信用卡的资金属于溢缴款，通过我行手机银行APP转出至本人本行借记卡享受免收手续费优惠，系统实时到账。'
      },
      {
        id: 'k9',
        title: '电话银行密码重置与身份二次核验规范',
        category: '密码管理 / 安全核身',
        matchScore: '90%',
        views: 780,
        speech: '电话银行密码遗忘时，可通过向您预留手机发送一次性动态校验码并在IVR键盘输入新密码完成重置。'
      },
      {
        id: 'k10',
        title: '信用卡消费积分兑换年费与礼品操作指引',
        category: '积分权益 / 年费抵扣',
        matchScore: '87%',
        views: 660,
        speech: '您的信用卡累计消费积分可在手机银行“积分专区”直接抵扣次年年费，或兑换京东E卡、话费充值券等丰富专属礼遇。'
      }
    ]
  ];

  const currentKnowledgeList = knowledgePools[recommendationBatch % knowledgePools.length];

  // Selected knowledge for modal preview
  const [activeKnowledgeModal, setActiveKnowledgeModal] = useState<KnowledgeItem | null>(null);

  // Single active expanded knowledge id: 1st card expanded by default, clicking another switches it while keeping all 5 titles displayed
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string>('k1');

  // 8. Work Order Summary (工单总结)
  const [workOrderSummary, setWorkOrderSummary] = useState<string>(
    `【客户诉求】客户张三致电咨询信用卡他行借记卡还款单笔限额与到账时效问题。\n【核身情况】通过电话服务密码与动态短信校验，身份核验通过。\n【答复口径】告知他行卡转账还款单笔限额5万元、单日累计20万元，通常即时到账；若超限可通过我行APP快捷还款。\n【处理结果】客户对限额说明与建议表示认可，无其他疑问，工单已办结。`
  );
  const [isGeneratingWorkOrder, setIsGeneratingWorkOrder] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  // 9. Agent Scratchpad / Notes (坐席记录)
  const [agentNotes, setAgentNotes] = useState<string>('客户咨询还款限额，已建议绑定本行一类卡开通自动扣款，客户表示稍后尝试。');
  const [copyNotesSuccess, setCopyNotesSuccess] = useState(false);

  // Initialize & adapt FAB & Modal positions on mount and screen resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const modalW = Math.min(980, Math.max(760, Math.floor(screenW * 0.58)));
      const modalH = Math.min(880, Math.max(640, Math.floor(screenH * 0.86)));

      setFabPos(prev => {
        if (!prev) return { x: screenW - 75, y: Math.max(100, Math.floor(screenH * 0.45)) };
        return {
          x: Math.min(screenW - 65, Math.max(10, prev.x)),
          y: Math.min(screenH - 65, Math.max(50, prev.y))
        };
      });

      setModalPos(prev => {
        if (!prev) {
          return {
            x: Math.max(10, screenW - modalW - 20),
            y: Math.max(20, Math.floor((screenH - modalH) / 2))
          };
        }
        return {
          x: Math.max(10, Math.min(screenW - modalW - 10, prev.x)),
          y: Math.max(20, Math.min(screenH - modalH - 10, prev.y))
        };
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom when new ASR arrives
  useEffect(() => {
    if (isOpen) {
      asrEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [asrMessages, isOpen]);

  // Handle FAB Dragging
  const handleFabMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingFabRef.current = false;
    fabDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: fabPos ? fabPos.x : window.innerWidth - 75,
      initialY: fabPos ? fabPos.y : window.innerHeight * 0.45
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - fabDragStartRef.current.startX;
      const dy = moveEvent.clientY - fabDragStartRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        isDraggingFabRef.current = true;
      }
      const newX = Math.max(10, Math.min(window.innerWidth - 65, fabDragStartRef.current.initialX + dx));
      const newY = Math.max(50, Math.min(window.innerHeight - 65, fabDragStartRef.current.initialY + dy));
      setFabPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleFabClick = () => {
    // If was dragging, do not trigger click
    if (isDraggingFabRef.current) return;
    setIsOpen(prev => !prev);
  };

  // Handle Modal Dragging via Header
  const handleModalHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    isDraggingModalRef.current = true;
    modalDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: modalPos ? modalPos.x : 200,
      initialY: modalPos ? modalPos.y : 100
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingModalRef.current) return;
      const dx = moveEvent.clientX - modalDragStartRef.current.startX;
      const dy = moveEvent.clientY - modalDragStartRef.current.startY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const modalW = Math.min(980, Math.max(780, Math.floor(screenW * 0.58)));
      const modalH = Math.min(880, Math.max(680, Math.floor(screenH * 0.86)));

      const newX = Math.max(10, Math.min(screenW - modalW - 10, modalDragStartRef.current.initialX + dx));
      const newY = Math.max(20, Math.min(screenH - modalH - 10, modalDragStartRef.current.initialY + dy));
      setModalPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingModalRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Trigger Knowledge Recommendation - 点击按钮直接推荐5条高匹配相关知识
  const handleRefreshKnowledge = () => {
    setIsRefreshingKnowledge(true);
    setTimeout(() => {
      setRecommendationBatch(prev => {
        const nextBatch = prev + 1;
        const nextList = knowledgePools[nextBatch % knowledgePools.length];
        setSelectedKnowledgeId(nextList[0].id);
        return nextBatch;
      });
      setIsRefreshingKnowledge(false);
    }, 300);
  };

  // Trigger Work Order Summary Generation
  const handleGenerateWorkOrder = () => {
    setIsGeneratingWorkOrder(true);
    setTimeout(() => {
      const summary = `【客户诉求】客户张三咨询信用卡还款限额及他行借记卡转账规则。\n【身份核验】已通过双重认证，客户等级为白金卡星级用户。\n【答复口径】解答单笔限额5万元，单日限额20万元，并推荐绑定手机银行自动还款。\n【处理结果】客户完全理解并满意，通话正常结束，建议后续推送自动还款开通短信。`;
      setWorkOrderSummary(summary);
      setIsGeneratingWorkOrder(false);
    }, 500);
  };

  // Copy agent notes to clipboard
  const handleCopyAgentNotes = () => {
    if (!agentNotes) return;
    navigator.clipboard.writeText(agentNotes);
    setCopyNotesSuccess(true);
    setTimeout(() => setCopyNotesSuccess(false), 1800);
  };

  return (
    <>
      {/* =========================================================================
          1. 智能助手悬浮圆形图标: 只保留图标，删除图标下方的文字
          - 位置：默认位于右侧中间区域，支持拖拉，支持点击展开/收起
          - 通话中与非通话状态颜色不同 (通话中: 绿色; 非通话: 蓝色)
         ========================================================================= */}
      <div
        ref={fabRef}
        onMouseDown={handleFabMouseDown}
        onClick={handleFabClick}
        style={{
          left: fabPos ? `${fabPos.x}px` : undefined,
          top: fabPos ? `${fabPos.y}px` : undefined,
          right: fabPos ? undefined : '24px'
        }}
        title={`智能助手 (${isCallActive ? '通话中' : '非通话状态'}，按住可拖动，点击${isOpen ? '收起' : '展开'})`}
        className={`
          fixed z-50 select-none cursor-grab active:cursor-grabbing transition-transform active:scale-95
          flex items-center justify-center
          ${isCallActive 
            ? 'w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/35 ring-4 ring-emerald-300/40 animate-pulse-gentle' 
            : 'w-12 h-12 rounded-full bg-gradient-to-tr from-[#1677ff] to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/60 hover:shadow-xl'}
        `}
      >
        <div className="relative flex items-center justify-center">
          {isCallActive ? (
            <>
              <Headphones size={22} className="stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border-2 border-white"></span>
              </span>
            </>
          ) : (
            <Bot size={22} className="stroke-[2]" />
          )}
        </div>
      </div>

      {/* =========================================================================
          2. 智能助手悬浮展开页面:
          - 顶栏区域尽可能小，偏淡蓝色系风格
          - 标题改为“智能助手”，右上角删除“x”，只保留“-”收起
          - 删除最下方底栏区域
         ========================================================================= */}
      {isOpen && (
        <div
          style={{
            left: modalPos ? `${modalPos.x}px` : undefined,
            top: modalPos ? `${modalPos.y}px` : undefined,
            right: modalPos ? undefined : '20px'
          }}
          className="fixed z-50 w-[60vw] min-w-[800px] max-w-[1000px] h-[88vh] min-h-[700px] max-h-[890px] bg-white rounded-lg shadow-2xl border border-blue-200/90 flex flex-col overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* ----- 极简淡蓝顶栏 (尽可能小，偏淡蓝色系) ----- */}
          <div
            onMouseDown={handleModalHeaderMouseDown}
            className="h-8 bg-gradient-to-r from-[#eef6ff] via-[#e8f3ff] to-[#e0efff] text-slate-800 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-blue-200/80 flex-shrink-0"
          >
            {/* Title & Drag Handle */}
            <div className="flex items-center space-x-1.5">
              <GripVertical size={14} className="text-blue-400" />
              <Bot size={14} className="text-[#1677ff]" />
              <span className="font-bold text-[12.5px] tracking-wide text-slate-800">智能助手</span>
              
              {/* Call Status Switcher Badge */}
              <button
                onClick={() => setIsCallActive(prev => !prev)}
                title="点击切换通话中与非通话状态"
                className={`ml-2 px-2 py-0.2 rounded-full text-[10px] font-medium flex items-center space-x-1 transition-all cursor-pointer border ${
                  isCallActive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isCallActive ? '通话中' : '非通话'}</span>
              </button>
            </div>

            {/* Header Right Window Controls: 只保留“-”，点击“-”收起 */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(false)}
                title="收起"
                className="w-6 h-6 rounded hover:bg-blue-200/70 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Minus size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* ----- 页面主体: 左右双栏 ----- */}
          <div className="flex-1 flex overflow-hidden min-h-0 bg-[#f8fafc]">
            
            {/* =========================================================================
                左侧: 语音转写区域
                - 将“ASR实时语音转写”改为“语音转写”
                - 删除模拟进行按钮
                - 删除下方的输入框区域
               ========================================================================= */}
            <div className="w-[38%] flex flex-col border-r border-slate-200 bg-white min-h-0">
              
              {/* Sub-header: 语音转写 */}
              <div className="h-7 bg-slate-50 border-b border-slate-200 px-3 flex items-center text-xs flex-shrink-0">
                <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-[11.5px]">
                  <Mic size={13} className={isCallActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
                  <span>语音转写</span>
                </div>
              </div>

              {/* Transcription Dialogue Stream (full height, no bottom input box) */}
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2.5 min-h-0 text-xs">
                {asrMessages.map((msg) => {
                  const isClient = msg.sender === 'client';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}
                    >
                      {/* Sender tag & time */}
                      <div className="flex items-center space-x-1 mb-1 text-[10px] text-slate-400 px-0.5">
                        <span className={`font-medium ${isClient ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {isClient ? '客:' : '坐席:'}
                        </span>
                        <span className="font-mono">{msg.time}</span>
                      </div>

                      {/* Bubble */}
                      <div 
                        className={`
                          max-w-[88%] rounded-lg px-2.5 py-1.5 text-[11.5px] leading-relaxed shadow-2xs
                          ${isClient 
                            ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200' 
                            : 'bg-[#1677ff] text-white rounded-tr-none shadow-blue-500/10'}
                        `}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={asrEndRef} />
              </div>

            </div>

            {/* =========================================================================
                右侧: 四个模块 (自适应纵向弹性填充，消除留白)
                1. 前情摘要 (前置摘要，自然高度)
                2. 知识推荐 (弹性填充 flex-[1.2]，卡片列表自适应)
                3. 工单总结 (弹性填充 flex-1，文本域自适应拉伸)
                4. 坐席记录 (弹性填充 flex-[0.9]，文本域自适应拉伸)
               ========================================================================= */}
            <div className="flex-1 flex flex-col p-2.5 gap-2 overflow-y-auto custom-scrollbar min-h-0 bg-[#f1f5f9]">
              
              {/* ---------------- 模块 1: 前情摘要 (自然内容高度) ---------------- */}
              <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex-shrink-0">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-1">
                  <div className="flex items-center space-x-1.5">
                    <History size={14} className="text-blue-600 stroke-[2.3]" />
                    <span className="font-bold text-slate-800 text-[11.5px]">前情摘要</span>
                  </div>
                  {/* 响应时间 */}
                  <span className="text-[10px] text-slate-500 font-sans">响应时间: 0.8s</span>
                </div>
                
                <div className="text-[11px] leading-relaxed text-slate-700 bg-blue-50/40 p-2 rounded border border-blue-100/60 font-sans">
                  {preCallSummary}
                </div>
              </div>

              {/* ---------------- 模块 2: 知识推荐 (直接分为左右两区域: 左侧5条推荐知识+跳转知识库按钮, 右侧展示对应推荐话术) ---------------- */}
              {(() => {
                const selectedKnowledge = currentKnowledgeList.find(k => k.id === selectedKnowledgeId) || currentKnowledgeList[0];
                return (
                  <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex-[1.7] min-h-[220px] flex flex-col">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-1 flex-shrink-0">
                      <div className="flex items-center space-x-1.5">
                        <Flame size={14} className="text-amber-500 fill-amber-500 stroke-[1.5]" />
                        <span className="font-bold text-slate-800 text-[11.5px]">知识推荐</span>
                      </div>

                      {/* 知识推荐按钮 - 点击后直接推荐五条相关知识 */}
                      <button
                        onClick={handleRefreshKnowledge}
                        disabled={isRefreshingKnowledge}
                        className="h-5 px-2.5 rounded bg-[#1677ff] hover:bg-blue-600 active:scale-95 text-white text-[10px] font-medium flex items-center space-x-1 shadow-2xs cursor-pointer transition-all"
                        title="点击直接推荐5条相关知识"
                      >
                        <RefreshCw size={10} className={isRefreshingKnowledge ? 'animate-spin' : ''} />
                        <span>知识推荐</span>
                      </button>
                    </div>

                    {/* 左右分栏主体区域 */}
                    <div className="flex-1 flex gap-2 min-h-0 pt-0.5">
                      
                      {/* 左侧区域: 展示五条推荐知识以及跳转知识库的按钮 */}
                      <div className="w-[52%] flex flex-col justify-between space-y-1 pr-1 border-r border-slate-100 min-h-0">
                        {currentKnowledgeList.map((item, idx) => {
                          const isSelected = selectedKnowledge?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedKnowledgeId(item.id)}
                              className={`
                                px-2 py-1.5 rounded border transition-all cursor-pointer flex items-center justify-between group
                                ${isSelected 
                                  ? 'border-blue-400 bg-blue-50/70 text-blue-800 shadow-2xs ring-1 ring-blue-300/40' 
                                  : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700'}
                              `}
                              title={`点击在右侧查看“${item.title}”推荐话术`}
                            >
                              <div className="flex items-center space-x-1.5 min-w-0 flex-1 pr-1">
                                <span className={`w-3.5 h-3.5 rounded text-[9.5px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className={`font-medium text-[11px] truncate ${
                                  isSelected ? 'font-bold text-blue-700' : 'text-slate-800 group-hover:text-blue-600'
                                }`}>
                                  {item.title}
                                </span>
                              </div>

                              {/* 跳转知识库按钮 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveKnowledgeModal(item);
                                }}
                                title="打开知识库详情"
                                className="text-[10px] text-[#1677ff] hover:text-blue-800 hover:underline flex items-center space-x-0.5 flex-shrink-0 ml-1 cursor-pointer font-medium px-1 py-0.5 rounded hover:bg-blue-100/60 transition-colors"
                              >
                                <span>跳转</span>
                                <ArrowUpRight size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* 右侧区域: 增加简洁小标题“推荐话术”，话术贴顶展示，上下不居中 */}
                      <div className="w-[48%] bg-[#f8fafc] border border-slate-200 rounded p-2 flex flex-col min-h-0">
                        {/* 简洁小标题: 推荐话术 */}
                        <div className="text-[11px] font-bold text-slate-700 pb-1 mb-1 border-b border-slate-200/70 flex items-center space-x-1 flex-shrink-0">
                          <span className="w-1 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                          <span>推荐话术</span>
                        </div>

                        {/* 话术内容: 贴着顶部展示 (上下不居中) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white rounded border border-slate-200/80 text-[11px] leading-relaxed text-slate-700 font-sans shadow-2xs flex flex-col justify-start">
                          <p className="w-full text-slate-800 leading-normal">{selectedKnowledge ? selectedKnowledge.speech : '暂无对应话术'}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* ---------------- 模块 3: 工单总结 (自适应高度 flex-1) ---------------- */}
              <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex-1 min-h-[120px] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-1 flex-shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <ClipboardCheck size={14} className="text-emerald-600 stroke-[2.3]" />
                    <span className="font-bold text-slate-800 text-[11.5px]">工单总结</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* 工单辅助按钮 */}
                    <button
                      onClick={handleGenerateWorkOrder}
                      disabled={isGeneratingWorkOrder}
                      className="h-5 px-2 rounded bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-300 text-[10px] font-medium flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Sparkles size={10} className={`text-amber-500 ${isGeneratingWorkOrder ? 'animate-spin' : ''}`} />
                      <span>工单辅助</span>
                    </button>

                    {/* 转预填单按钮 */}
                    <button
                      onClick={() => setShowPreOrderModal(true)}
                      className="h-5 px-2 rounded bg-[#1677ff] hover:bg-blue-600 text-white text-[10px] font-medium flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
                    >
                      <FileText size={10} />
                      <span>转预填单</span>
                    </button>
                  </div>
                </div>

                {/* Editable Work Order Summary Area - 自适应伸缩 */}
                <div className="flex-1 min-h-0 flex flex-col relative mt-0.5">
                  <textarea
                    value={workOrderSummary}
                    onChange={(e) => setWorkOrderSummary(e.target.value)}
                    className="w-full flex-1 min-h-[50px] p-2 bg-slate-50 border border-slate-200 rounded text-[11px] leading-relaxed text-slate-800 outline-none focus:bg-white focus:border-blue-400 transition-colors custom-scrollbar font-sans resize-none"
                    placeholder="点击“工单辅助”结合会话自动生成工单摘要，支持直接在此编辑修改..."
                  />
                  <div className="flex items-center justify-between text-[9.5px] text-slate-400 mt-0.5 px-0.5 flex-shrink-0">
                    <span className="flex items-center space-x-0.5">
                      <Edit3 size={9} />
                      <span>可编辑</span>
                    </span>
                    <span>{workOrderSummary.length} 字符</span>
                  </div>
                </div>
              </div>

              {/* ---------------- 模块 4: 坐席记录 (自适应高度 flex-[0.85]) ---------------- */}
              <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex-[0.85] min-h-[90px] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-1 flex-shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <NotebookPen size={14} className="text-indigo-600 stroke-[2.3]" />
                    <span className="font-bold text-slate-800 text-[11.5px]">坐席记录</span>
                  </div>

                  <button
                    onClick={handleCopyAgentNotes}
                    className="h-5 px-2 rounded bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-[10px] font-medium flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copyNotesSuccess ? (
                      <span className="text-emerald-600 flex items-center space-x-0.5">
                        <Check size={10} />
                        <span>已复制</span>
                      </span>
                    ) : (
                      <>
                        <Copy size={10} />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 坐席便签文本域 - 自适应伸缩 */}
                <div className="flex-1 min-h-0 flex flex-col mt-0.5">
                  <textarea
                    value={agentNotes}
                    onChange={(e) => setAgentNotes(e.target.value)}
                    placeholder="单纯文本记录功能，坐席可在此记录会话过程中的重要备忘..."
                    className="w-full flex-1 min-h-[40px] p-2 bg-slate-50 border border-slate-200 rounded text-[11px] leading-relaxed text-slate-800 outline-none focus:bg-white focus:border-blue-400 transition-colors custom-scrollbar font-sans resize-none"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* 底栏区域已完全删除 */}
        </div>
      )}

      {/* =========================================================================
          3. KNOWLEDGE BASE DETAIL MODAL (跳转知识库弹窗)
         ========================================================================= */}
      {activeKnowledgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-[500px] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-9 bg-[#f0f7ff] border-b border-blue-200 text-slate-800 px-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <BookOpen size={13} className="text-[#1677ff]" />
                <span className="font-bold text-xs text-slate-800">知识库详情</span>
              </div>
              <button 
                onClick={() => setActiveKnowledgeModal(null)}
                className="hover:text-blue-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3.5 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                  {activeKnowledgeModal.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{activeKnowledgeModal.title}</h3>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700 text-[11px]">标准业务解答话术：</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{activeKnowledgeModal.speech}</p>
              </div>

              <div className="space-y-1 text-slate-600 text-[10.5px]">
                <div className="font-semibold text-slate-700 text-[11px]">业务依据与条款：</div>
                <p>1. 依据中国人民银行现代化支付系统清算规则及跨行扣款协议条款；</p>
                <p>2. 转账限额受转出银行二类账户单日及单笔限额管控；</p>
                <p>3. 涉及大额资金建议引导客户前往手机银行或线下柜面开通更高限额授权。</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveKnowledgeModal(null)}
                className="px-3 py-1 rounded bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PRE-FILLED WORK ORDER MODAL (转预填单弹窗提示)
         ========================================================================= */}
      {showPreOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-[500px] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-9 bg-[#1677ff] text-white px-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <FileText size={14} />
                <span className="font-bold text-xs">转预填单确认</span>
              </div>
              <button 
                onClick={() => setShowPreOrderModal(false)}
                className="hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3.5 space-y-2.5 text-xs">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center space-x-2 text-emerald-800 text-[11.5px]">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>已将当前工单小结成功转为预填工单！</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50 p-2 rounded border border-slate-200">
                <div><span className="text-slate-400">工单编号:</span> <span className="font-mono font-medium">WO202610150982</span></div>
                <div><span className="text-slate-400">工单类型:</span> <span className="font-medium">信用卡还款咨询</span></div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 text-[11px] mb-1">预填工单摘要：</div>
                <div className="p-2 bg-white border border-slate-200 rounded text-[10.5px] leading-relaxed text-slate-700 max-h-28 overflow-y-auto whitespace-pre-wrap">
                  {workOrderSummary}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowPreOrderModal(false)}
                className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
              >
                返回
              </button>
              <button
                onClick={() => {
                  setShowPreOrderModal(false);
                }}
                className="px-3.5 py-1 rounded bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-medium cursor-pointer"
              >
                确认并提交
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartVoiceAssistantModal;
