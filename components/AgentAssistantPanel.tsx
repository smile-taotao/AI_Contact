import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Check, 
  Copy, 
  Edit3, 
  Send, 
  Clock, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Folder, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Info,
  Loader2,
  Lock
} from 'lucide-react';
import { chatStore, ChatMessage } from '../services/chatStore';

export interface AssistantStepData {
  stepIndex: number;
  title: string;
  shortTitle: string;
  speech: string;
  cardType: string;
  // 状态：UNSENT (未发送) | WAITING_CLIENT (已发送，等待客户确认) | COMPLETED (已采纳发送)
  status: 'UNSENT' | 'WAITING_CLIENT' | 'COMPLETED';
  requiresClientConfirm?: boolean; // 是否需要客户确认互动 (若为 false，则采纳发送后直接完成并进入下个步骤)
  sentTime?: string;
  confirmedTime?: string;
  confirmedSummary?: string;
  cardState: Record<string, any>;
}

export interface AssistantProcessItem {
  id: string;
  name: string;
  shortName: string;
  statusText: string;
  currentStepTitle: string;
  steps: AssistantStepData[];
}

// 初始步骤定义：所有选项默认为空（未选状态），待客户在客户端填报确认
const INITIAL_PROCESS_STEPS: AssistantStepData[] = [
  // 步骤 1: 问题定位与定性 (需客户在手机APP端确认)
  {
    stepIndex: 1,
    title: '步骤 1: 非柜面限制-问题定位',
    shortTitle: '问题定位',
    speech: `您好，请您先别着急，账户受限通常是系统为了保障您的资金安全触发的保护性风控机制，我马上协助您排查定位。\n\n建议您打开手机银行尝试发起一笔 1 元的小额测试转账，查看系统弹出的具体错误提示。您可以直接在发送给您的卡片中勾选反馈给我，我将为您匹配最快的一对一解控方案。`,
    cardType: 'STEP_1_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    cardState: {
      cardType: '', // 默认未选
      channel: '',  // 默认未选
      prompt: '',   // 默认未选
      confirmed: false
    }
  },
  // 步骤 2: 渠道选择与原因方案 (需客户在手机APP端确认)
  {
    stepIndex: 2,
    title: '步骤 2: 非柜面限制-渠道选择',
    shortTitle: '渠道选择',
    speech: `经系统核验，您的账户当前属于“非柜面渠道交易受限”状态。该情况多因近期交易特征触发反诈智能风控保护、长期未动账或留存身份信息需更新所致。\n\n请放心，暂停的仅为该卡的转出类业务（转账/线上付款），账户资金安全无虞，手机银行仍可正常登录查询。解除后即可实时恢复正常使用。目前支持线上自助与网点两种途径，具体指引已列入下方卡片供您选择。`,
    cardType: 'STEP_2_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    cardState: {
      route: '', // 默认未选
      prompt: '限制非柜面渠道交易',
      confirmed: false
    }
  },
  // 步骤 3: 办理指引 (告知型步骤：无需客户确认；发送前提：客户确认步骤二)
  {
    stepIndex: 3,
    title: '步骤 3: 非柜面限制-办理指引',
    shortTitle: '办理指引',
    speech: `好的，已为您匹配对应渠道的操作流程与办理须知。\n\n推荐您优先在手机银行APP上自助办理解控，免去排队往返。办理入口、所需材料与详细流程已呈列在下方卡片中供您查阅。`,
    cardType: 'STEP_3_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      channelMode: 'MOBILE',
      clientActionTaken: undefined,
      confirmed: false
    }
  },
  // 步骤 4: 生效时间及注意事项 (告知型步骤：无需客户确认，采纳发送后直接完成全流程)
  {
    stepIndex: 4,
    title: '步骤 4: 非柜面限制-生效时间及注意事项',
    shortTitle: '生效时间及注意事项',
    speech: `已为您整理非柜面解控后的生效规则及账户安全使用须知：\n\n手机银行自助核验成功后，转账与支付额度将实时恢复生效；后续请务必注意规范用卡，切勿出租、出借或出售银行账户，并建议及时在手机银行中更新身份证有效期。祝您生活愉快，如有任何疑问随时联系！`,
    cardType: 'STEP_4_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      confirmed: false
    }
  }
];

const PRESET_PROCESS_DATABASE = [
  {
    id: 'proc-feiguimian',
    name: '个人账户非柜面限制',
    shortName: '非柜面限制',
    keywords: ['卡不能用了', '无法转账', '非柜面', '限制非柜面', '限额', '转账不了', '9901', '冻结', '暂停业务'],
  },
  {
    id: 'proc-card-loss',
    name: '银行卡挂失',
    shortName: '银行卡挂失',
    keywords: ['挂失', '丢卡', '被盗', '解挂', '补卡', '卡丢了', '卡掉了', '钱包丢', '卡不见了'],
  },
  {
    id: 'proc-limit-adjust',
    name: '大额交易转账限额调整业务',
    shortName: '转账限额提升',
    keywords: ['调额', '提升限额', '限额已满', '大额转账'],
  },
  {
    id: 'proc-password-unlock',
    name: '借记卡密码连续输错锁定解锁业务',
    shortName: '密码锁定重置',
    keywords: ['密码错误', '密码锁定', '重置密码', '输错密码'],
  },
  {
    id: 'proc-sleep-card',
    name: '长期不动户/睡眠卡重新激活业务',
    shortName: '睡眠户激活',
    keywords: ['睡眠卡', '不动户', '激活', '长期未用'],
  }
];

export const INITIAL_CARD_LOSS_STEPS: AssistantStepData[] = [
  // 步骤 1: 卡类型与挂失原因确认 (需客户确认)
  {
    stepIndex: 1,
    title: '步骤 1: 挂失业务-卡类型与原因确认',
    shortTitle: '卡种与原因',
    speech: `您好,请您先别慌,银行卡丢失或被盗时,保障资金安全是第一位的。我马上协助您办理紧急挂失。\n\n请您在下方卡片中核对并勾选需要挂失的卡类型以及挂失原因,点击确认提交后,我将为您指引最快捷的挂失与后续处理通道。`,
    cardType: 'LOSS_STEP_1_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    cardState: {
      cardType: '',
      lossReason: '',
      otherReason: '',
      confirmed: false
    }
  },
  // 步骤 2: 选择挂失渠道 (需客户确认)
  {
    stepIndex: 2,
    title: '步骤 2: 挂失业务-选择挂失渠道',
    shortTitle: '挂失渠道',
    speech: `好的,已知悉您的卡类型与挂失原因。为了保障您的账户资金安全,请选择您最方便的挂失办理途径:\n\n目前支持【手机银行APP自助临时/正式挂失】、【拨打24小时客服热线955xx挂失】以及【至营业网点柜台办理】。请在下方卡片中进行选择。`,
    cardType: 'LOSS_STEP_2_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    cardState: {
      channel: '',
      confirmed: false
    }
  },
  // 步骤 3: 办理流程及注意事项 (无需客户确认)
  {
    stepIndex: 3,
    title: '步骤 3: 挂失业务-办理指引与注意事项',
    shortTitle: '办理指引',
    speech: `好的,已为您匹配对应挂失渠道的操作指引与注意事项:\n\n1、手机银行挂失:登录手机银行APP-【我的/全部】-【账户挂失/安全锁】,选择对应卡片提交临时挂失(临时挂失通常5-15天有效,建议及时办理正式补卡);\n2、电话挂失:拨打客服热线转人工或自助语音办理紧急挂失,挂失即时生效;\n3、网点办理:持本人有效身份证件至就近营业网点办理正式挂失与换卡。`,
    cardType: 'LOSS_STEP_3_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      confirmed: false
    }
  },
  // 步骤 4: 后续处理与安全提醒 (无需客户确认)
  {
    stepIndex: 4,
    title: '步骤 4: 挂失业务-后续处理与安全提醒',
    shortTitle: '后续处理',
    speech: `已为您整理卡片挂失后的后续处理与安全防范提醒:\n\n1、临时挂失到期前请及时前往网点办理正式挂失补卡;\n2、挂失生效后,原卡绑定的快捷支付(微信、支付宝、云闪付)及自动扣款业务将同步暂停;\n3、补领新卡后,请及时更新相关绑定的商户及扣款协议。祝您用卡安全,如有其他疑问随时联系!`,
    cardType: 'LOSS_STEP_4_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      confirmed: false
    }
  }
];

interface AgentAssistantPanelProps {
  onToast?: (msg: string) => void;
  resetSignal?: number; // 接收来自结束会话的重置信号
  onNavigateToMobile?: () => void;
}

export default function AgentAssistantPanel({ onToast, resetSignal, onNavigateToMobile }: AgentAssistantPanelProps) {
  const [activeProcesses, setActiveProcesses] = useState<AssistantProcessItem[]>(() => {
    // 初始如果聊天中有客户触发消息，默认触发；否则为空
    const msgs = chatStore.getMessages();
    const hasLossTrigger = msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡丢了|钱包丢|卡不见了|卡掉了|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));

    if (hasLossTrigger) {
      const baseSteps = JSON.parse(JSON.stringify(INITIAL_CARD_LOSS_STEPS));
      const step1Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已填报挂失信息'));
      const step2Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已选择挂失途径'));
      const step4Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已确认：已知晓挂失后续须知'));

      if (step1Confirmed) {
        baseSteps[0].status = 'COMPLETED';
        baseSteps[0].cardState.confirmed = true;
      }
      if (step2Confirmed) {
        baseSteps[1].status = 'COMPLETED';
        baseSteps[1].cardState.confirmed = true;
      }
      if (step4Confirmed) {
        baseSteps[3].status = 'COMPLETED';
        baseSteps[3].cardState.confirmed = true;
      }

      return [
        {
          id: 'proc-card-loss',
          name: '银行卡挂失',
          shortName: '银行卡挂失',
          statusText: '银行卡挂失流程进行中',
          currentStepTitle: '挂失流程进行中',
          steps: baseSteps
        }
      ];
    }

    if (!hasFeiguimianTrigger) return [];

    const baseSteps: AssistantStepData[] = JSON.parse(JSON.stringify(INITIAL_PROCESS_STEPS));
    
    // 根据历史聊天记录恢复各步骤执行状态
    const step1Sent = msgs.some(m => m.type === 'card' && (m.metadata?.step === 1 || m.metadata?.cardType === 'STEP_1_CARD'));
    const step1ConfirmedMsg = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已填报'));
    if (step1ConfirmedMsg) {
      baseSteps[0].status = 'COMPLETED';
      baseSteps[0].confirmedSummary = '客户已填报';
      baseSteps[0].cardState.confirmed = true;
    } else if (step1Sent) {
      baseSteps[0].status = 'WAITING_CLIENT';
    }

    const step2Sent = msgs.some(m => m.type === 'card' && (m.metadata?.step === 2 || m.metadata?.cardType === 'STEP_2_CARD'));
    const step2ConfirmedMsg = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已选择'));
    if (step2ConfirmedMsg) {
      baseSteps[1].status = 'COMPLETED';
      baseSteps[1].confirmedSummary = '客户已选择途径';
      baseSteps[1].cardState.confirmed = true;
    } else if (step2Sent) {
      baseSteps[1].status = 'WAITING_CLIENT';
    }

    const step3Sent = msgs.some(m => m.type === 'card' && (m.metadata?.step === 3 || m.metadata?.cardType === 'STEP_3_CARD'));
    if (step3Sent) {
      baseSteps[2].status = 'COMPLETED';
      baseSteps[2].confirmedSummary = '已采纳发送（无需客户确认）';
      baseSteps[2].cardState.confirmed = true;
    }

    const step4Sent = msgs.some(m => m.type === 'card' && (m.metadata?.step === 4 || m.metadata?.cardType === 'STEP_4_CARD'));
    if (step4Sent) {
      baseSteps[3].status = 'COMPLETED';
      baseSteps[3].confirmedSummary = '已采纳发送（全流程办结）';
      baseSteps[3].cardState.confirmed = true;
    }

    const currentTitle = step4Sent 
      ? '全流程办理完成' 
      : step2ConfirmedMsg 
      ? '步骤 3: 非柜面限制-办理指引' 
      : step1ConfirmedMsg 
      ? '步骤 2: 非柜面限制-渠道选择' 
      : '步骤 1: 非柜面限制-问题定位';

    return [
      {
        id: 'proc-feiguimian',
        name: '个人账户非柜面限制',
        shortName: '非柜面限制',
        statusText: currentTitle,
        currentStepTitle: currentTitle,
        steps: baseSteps
      }
    ];
  });

  const [selectedProcessId, setSelectedProcessId] = useState<string>(() => {
    const msgs = chatStore.getMessages();
    const hasLossTrigger = msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡丢了|钱包丢|卡不见了|卡掉了|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));
    if (hasLossTrigger) return 'proc-card-loss';
    return hasFeiguimianTrigger ? 'proc-feiguimian' : '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string>(() => {
    const msgs = chatStore.getMessages();
    const hasLossTrigger = msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡丢了|钱包丢|卡不见了|卡掉了|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));
    if (hasLossTrigger) return '分析完毕，触发【借记卡紧急挂失与解挂业务】';
    return hasFeiguimianTrigger ? '分析完毕，触发【个人账户非柜面限制】' : '';
  });
  
  const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedMsgIdRef = useRef<string>('');

  // 当外部传入 resetSignal 时，彻底清空坐席辅助区域（包括触发提示、流程卡片列表、步骤）
  useEffect(() => {
    if (resetSignal) {
      setActiveProcesses([]);
      setSelectedProcessId('');
      setTriggerStatus('');
      setEditingTexts({});
      setExpandedSteps({});
      lastProcessedMsgIdRef.current = '';
    }
  }, [resetSignal]);

  const activeProcess = activeProcesses.find(p => p.id === selectedProcessId) || activeProcesses[0];

  // 监听聊天消息：实现多向联动（消息清空重置、客户提问自动触发流程、客户确认自动推进步骤）
  useEffect(() => {
    const handleChatUpdate = () => {
      const msgs = chatStore.getMessages();

      // 1. 如果消息被全部清空（例如点击“结束”按钮后）：清空坐席辅助区域内容
      if (msgs.length === 0) {
        setActiveProcesses([]);
        setSelectedProcessId('');
        setTriggerStatus('');
        setEditingTexts({});
        setExpandedSteps({});
        lastProcessedMsgIdRef.current = '';
        return;
      }

      // 如果有消息，但当前没有活跃流程，且存在触发关键字的客户消息（例如恢复示例数据或新客户进线）：
      const lossTriggerMsg = msgs.find(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡丢了|钱包丢|卡不见了|卡掉了|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
      const feiguimianTriggerMsg = msgs.find(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));

      if (lossTriggerMsg && activeProcesses.length === 0 && !triggerStatus) {
        setActiveProcesses([
          {
            id: 'proc-card-loss',
            name: '银行卡挂失',
            shortName: '银行卡挂失',
            statusText: '步骤 1: 挂失业务-卡类型与原因确认',
            currentStepTitle: '步骤 1: 挂失业务-卡类型与原因确认',
            steps: JSON.parse(JSON.stringify(INITIAL_CARD_LOSS_STEPS))
          }
        ]);
        setSelectedProcessId('proc-card-loss');
        setTriggerStatus('分析完毕，触发【银行卡挂失】');
      } else if (feiguimianTriggerMsg && activeProcesses.length === 0 && !triggerStatus) {
        setActiveProcesses([
          {
            id: 'proc-feiguimian',
            name: '个人账户非柜面限制',
            shortName: '非柜面限制',
            statusText: '步骤 1: 非柜面限制-问题定位',
            currentStepTitle: '步骤 1: 非柜面限制-问题定位',
            steps: JSON.parse(JSON.stringify(INITIAL_PROCESS_STEPS))
          }
        ]);
        setSelectedProcessId('proc-feiguimian');
        setTriggerStatus('分析完毕，触发【个人账户非柜面限制】');
      }

      const latestMsg = msgs[msgs.length - 1];
      if (latestMsg.id === lastProcessedMsgIdRef.current) return;
      lastProcessedMsgIdRef.current = latestMsg.id;

      if (latestMsg.sender === 'customer') {
        const text = latestMsg.content.trim();

        // 1. 触发流程逻辑（若尚未触发）
        if (/挂失|丢卡|被盗|卡丢了|钱包丢|卡不见了|卡掉了|解挂|补卡/i.test(text) && !text.startsWith('✔')) {
          setActiveProcesses(prev => {
            if (prev.some(p => p.id === 'proc-card-loss')) return prev;
            return [
              {
                id: 'proc-card-loss',
                name: '银行卡挂失',
                shortName: '银行卡挂失',
                statusText: '步骤 1: 挂失业务-卡类型与原因确认',
                currentStepTitle: '步骤 1: 挂失业务-卡类型与原因确认',
                steps: JSON.parse(JSON.stringify(INITIAL_CARD_LOSS_STEPS))
              },
              ...prev
            ];
          });
          setSelectedProcessId('proc-card-loss');
          setTriggerStatus('分析完毕，触发【银行卡挂失】');
        } else if (/卡不能用|无法转账|非柜面|9901|限额/i.test(text) && !text.startsWith('✔')) {
          setActiveProcesses(prev => {
            if (prev.some(p => p.id === 'proc-feiguimian')) return prev;
            return [
              {
                id: 'proc-feiguimian',
                name: '个人账户非柜面限制',
                shortName: '非柜面限制',
                statusText: '步骤 1: 非柜面限制-问题定位',
                currentStepTitle: '步骤 1: 非柜面限制-问题定位',
                steps: JSON.parse(JSON.stringify(INITIAL_PROCESS_STEPS))
              },
              ...prev
            ];
          });
          setSelectedProcessId('proc-feiguimian');
          setTriggerStatus('分析完毕，触发【个人账户非柜面限制】');
        }

        // 2. 核心联动：只有当客户自动发送了确认消息，流程卡片才推进到下一个步骤！
        
        // --- 挂失步骤 1 确认响应：✔ 客户已填报挂失信息 ---
        if (text.includes('✔ 客户已填报挂失信息')) {
          let cardTypeVal = '储蓄卡（借记卡）';
          let reasonVal = '不慎遗失';
          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('卡种：')) cardTypeVal = line.replace('卡种：', '').trim();
            if (line.includes('挂失原因：')) reasonVal = line.replace('挂失原因：', '').trim();
          });

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-card-loss') return p;
            return {
              ...p,
              currentStepTitle: '步骤 2: 挂失业务-选择挂失渠道',
              steps: p.steps.map(s => {
                if (s.stepIndex === 1) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `卡种: ${cardTypeVal} | 原因: ${reasonVal}`,
                    cardState: { ...s.cardState, cardType: cardTypeVal, lossReason: reasonVal, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({ 1: false, 2: true, 3: false, 4: false });
          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-2');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);

          if (onToast) {
            onToast('✓ 收到客户挂失填报确认，步骤 1 变为已采纳发送状态，步骤 2 变为当前待发送状态');
          }
        }

        // --- 挂失步骤 2 确认响应：✔ 客户已选择挂失途径 ---
        else if (text.includes('✔ 客户已选择挂失途径')) {
          let channelVal = '手机银行APP自助挂失';
          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('办理途径：')) channelVal = line.replace('办理途径：', '').trim();
          });

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-card-loss') return p;
            return {
              ...p,
              currentStepTitle: '步骤 3: 挂失业务-办理指引与注意事项',
              steps: p.steps.map(s => {
                if (s.stepIndex === 2) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `办理途径: ${channelVal}`,
                    cardState: { ...s.cardState, channel: channelVal, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({ 1: false, 2: false, 3: true, 4: false });
          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-3');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);

          if (onToast) {
            onToast('✓ 收到客户挂失途径确认，步骤 2 变为已采纳发送状态，步骤 3 变为当前待发送状态');
          }
        }

        // --- 挂失步骤 4 确认响应：✔ 客户已确认：已知晓挂失后续须知 ---
        else if (text.includes('✔ 客户已确认：已知晓挂失后续须知')) {
          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-card-loss') return p;
            return {
              ...p,
              currentStepTitle: '全流程办理完成',
              statusText: '全流程办理完成',
              steps: p.steps.map(s => {
                if (s.stepIndex === 4) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: '已确认知晓挂失后续须知与安全提醒',
                    cardState: { ...s.cardState, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({ 1: false, 2: false, 3: false, 4: false });
          if (onToast) {
            onToast('✓ 步骤 4 变为已采纳发送状态，挂失全流程办理完成！');
          }
        }

        // --- 步骤 1 确认响应：✔ 客户已填报 ---
        if (text.includes('✔ 客户已填报')) {
          let cardTypeVal = '储蓄卡（借记卡）';
          let channelVal = '手机银行';
          let promptVal = '限制非柜面渠道交易';

          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('卡种：')) cardTypeVal = line.replace('卡种：', '').trim();
            if (line.includes('操作渠道：')) channelVal = line.replace('操作渠道：', '').trim();
            if (line.includes('页面提示：')) promptVal = line.replace('页面提示：', '').trim();
          });

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-feiguimian') return p;
            return {
              ...p,
              currentStepTitle: '步骤 2: 非柜面限制-渠道选择',
              steps: p.steps.map(s => {
                if (s.stepIndex === 1) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `卡种: ${cardTypeVal} | 渠道: ${channelVal} | 提示: ${promptVal}`,
                    cardState: { ...s.cardState, cardType: cardTypeVal, channel: channelVal, prompt: promptVal, confirmed: true }
                  };
                }
                if (s.stepIndex === 2) {
                  return {
                    ...s,
                    cardState: { ...s.cardState, prompt: promptVal }
                  };
                }
                return s;
              })
            };
          }));

          // 步骤 1 自动收起，步骤 2 自动展开并自动定位
          setExpandedSteps({
            1: false,
            2: true,
            3: false,
            4: false
          });

          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-2');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 150);

          if (onToast) {
            onToast('✓ 收到客户填报确认，步骤 1 变为已采纳发送状态，步骤 2 变为当前待发送状态');
          }
        }

        // --- 步骤 2 确认响应：✔ 客户已选择 ---
        else if (text.includes('✔ 客户已选择')) {
          let routeVal = '① 手机银行自助';
          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('办理途径：')) routeVal = line.replace('办理途径：', '').trim();
          });

          const isBranch = routeVal.includes('网点');

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-feiguimian') return p;
            return {
              ...p,
              currentStepTitle: isBranch ? '步骤 3: 非柜面限制-网点柜面办理' : '步骤 3: 非柜面限制-手机银行自助',
              steps: p.steps.map(s => {
                if (s.stepIndex === 2) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `办理途径: ${routeVal}`,
                    cardState: { ...s.cardState, route: routeVal, confirmed: true }
                  };
                }
                if (s.stepIndex === 3) {
                  return {
                    ...s,
                    title: isBranch ? '步骤 3: 非柜面限制-网点柜面办理' : '步骤 3: 非柜面限制-手机银行自助',
                    shortTitle: isBranch ? '网点柜面' : '手机银行',
                    speech: isBranch 
                      ? `经确认，您选择前往网点办理。请持卡人本人携带有效二代身份证原件及受限银行卡，至就近任意营业网点办理人工核身解除。具体网点清单与所需材料已列在下方卡片中供您查阅。`
                      : `好的，推荐您优先在手机银行APP上自助办理解控，免去排队往返。\n\n具体操作入口与注意事项已整理在下方卡片中为您呈列。`,
                    cardState: {
                      ...s.cardState,
                      channelMode: isBranch ? 'BRANCH' : 'MOBILE'
                    }
                  };
                }
                return s;
              })
            };
          }));

          // 步骤 2 自动收起，步骤 3 自动展开并自动定位
          setExpandedSteps({
            1: false,
            2: false,
            3: true,
            4: false
          });

          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-3');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 150);

          if (onToast) {
            onToast('✓ 收到客户途径选择确认，步骤 2 变为已采纳发送状态，步骤 3 变为当前待发送状态');
          }
        }

        // --- 步骤 3 确认响应：✔ 客户已报 / 客户反馈 ---
        else if (text.includes('✔ 客户已报') || text.includes('✔ 客户反馈') || text.includes('网点柜面办理清单')) {
          const isSuccess = text.includes('手机银行提交解除申请');
          const summary = isSuccess ? '已在手机银行APP提交解除申请' : '已获悉网点柜面办理须知';

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-feiguimian') return p;
            return {
              ...p,
              currentStepTitle: '步骤 4: 非柜面限制-生效时间及注意事项',
              steps: p.steps.map(s => {
                if (s.stepIndex === 3) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: summary,
                    cardState: {
                      ...s.cardState,
                      clientActionTaken: isSuccess ? 'SUCCESS' : 'BRANCH',
                      confirmed: true
                    }
                  };
                }
                return s;
              })
            };
          }));

          // 步骤 3 自动收起，步骤 4 自动展开并自动定位
          setExpandedSteps({
            1: false,
            2: false,
            3: false,
            4: true
          });

          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-4');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 150);

          if (onToast) {
            onToast('✓ 收到客户办理反馈，步骤 3 变为已采纳发送状态，步骤 4 变为当前待发送状态');
          }
        }

        // --- 步骤 4 确认响应：✔ 客户确认 ---
        else if (text.includes('✔ 客户确认') && text.includes('注意事项')) {
          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-feiguimian') return p;
            return {
              ...p,
              currentStepTitle: '全流程办理完成',
              statusText: '全流程办理完成',
              steps: p.steps.map(s => {
                if (s.stepIndex === 4) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: '已确认知晓生效时间及合规注意事项',
                    cardState: { ...s.cardState, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({
            1: false,
            2: false,
            3: false,
            4: false
          });

          if (onToast) {
            onToast('✓ 步骤 4 变为已采纳发送状态，全流程办理完成！');
          }
        }
      }
    };

    const unsubscribe = chatStore.subscribe(handleChatUpdate);
    return () => unsubscribe();
  }, [activeProcesses.length, triggerStatus, onToast]);

  // 核心业务校验：各步骤的前置发送条件
  // 1. 步骤二可以发送的前提条件是客户点击步骤一的确认按钮
  // 2. 步骤三可以发送的前提条件是客户点击步骤二的确认按钮
  // 3. 步骤四可以发送的前提条件是坐席发送步骤三
  const checkStepPrerequisites = React.useCallback((stepIndex: number): { canSend: boolean; reason?: string } => {
    if (!activeProcess) return { canSend: false, reason: '流程未就绪' };
    
    if (stepIndex === 1) {
      return { canSend: true };
    }
    
    if (stepIndex === 2) {
      const step1 = activeProcess.steps.find(s => s.stepIndex === 1);
      if (!step1 || step1.status !== 'COMPLETED') {
        return { 
          canSend: false, 
          reason: '前提条件：需客户在手机端点击步骤一的“确认”按钮' 
        };
      }
      return { canSend: true };
    }
    
    if (stepIndex === 3) {
      const step2 = activeProcess.steps.find(s => s.stepIndex === 2);
      if (!step2 || step2.status !== 'COMPLETED') {
        return { 
          canSend: false, 
          reason: '前提条件：需客户在手机端点击步骤二的“确认”按钮' 
        };
      }
      return { canSend: true };
    }
    
    if (stepIndex === 4) {
      const step3 = activeProcess.steps.find(s => s.stepIndex === 3);
      if (!step3 || step3.status !== 'COMPLETED') {
        return { 
          canSend: false, 
          reason: '前提条件：需坐席先发送步骤三办理指引' 
        };
      }
      return { canSend: true };
    }
    
    return { canSend: true };
  }, [activeProcess]);

  // 计算当前卡片的活跃节点编号
  const currentActiveStepIndex = React.useMemo(() => {
    if (!activeProcess) return 1;
    const waitingStep = activeProcess.steps.find(s => s.status === 'WAITING_CLIENT');
    if (waitingStep) return waitingStep.stepIndex;
    const firstUnsent = activeProcess.steps.find(s => s.status === 'UNSENT');
    if (firstUnsent) return firstUnsent.stepIndex;
    return activeProcess.steps.length;
  }, [activeProcess]);

  // 判断卡片默认展开/收起状态
  const isStepExpanded = (step: AssistantStepData) => {
    if (expandedSteps[step.stepIndex] !== undefined) {
      return expandedSteps[step.stepIndex];
    }
    const prereq = checkStepPrerequisites(step.stepIndex);
    // 默认规则：
    // 已完成的卡片默认收起 (false)
    if (step.status === 'COMPLETED') return false;
    // 等待客户确认或当前待发送且满足前提条件的卡片默认展开 (true)
    if (step.status === 'WAITING_CLIENT') return true;
    if (step.status === 'UNSENT' && step.stepIndex === currentActiveStepIndex && prereq.canSend) return true;
    // 未满足前置条件或后续待发送流程卡片默认收起 (false)
    return false;
  };

  const toggleStepExpand = (stepIndex: number, currentExpanded: boolean) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepIndex]: !currentExpanded
    }));
  };

  // 手动搜索添加辅助流程
  const handleOpenProcess = (procId: string) => {
    const meta = PRESET_PROCESS_DATABASE.find(p => p.id === procId);
    if (!meta) return;

    setActiveProcesses(prev => {
      if (prev.some(p => p.id === procId)) return prev;
      const stepsTemplate = procId === 'proc-card-loss' ? INITIAL_CARD_LOSS_STEPS : INITIAL_PROCESS_STEPS;
      const firstTitle = stepsTemplate[0].title;
      const newProc: AssistantProcessItem = {
        id: meta.id,
        name: meta.name,
        shortName: meta.shortName,
        statusText: firstTitle,
        currentStepTitle: firstTitle,
        steps: JSON.parse(JSON.stringify(stepsTemplate))
      };
      return [...prev, newProc];
    });

    setSelectedProcessId(procId);
    setTriggerStatus(`手动检索已定位，载入【${meta.name}】`);
    setShowSearchDropdown(false);
    setSearchQuery('');
    setExpandedSteps({});
  };

  const handleCloseProcess = (procId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProcesses(prev => {
      const remaining = prev.filter(p => p.id !== procId);
      if (remaining.length > 0 && selectedProcessId === procId) {
        setSelectedProcessId(remaining[0].id);
      } else if (remaining.length === 0) {
        setSelectedProcessId('');
        setTriggerStatus('');
      }
      return remaining;
    });
  };

  // 坐席点击：采纳发送当前步骤卡片
  // 若该步骤不需要客户确认，则直接在采纳发送后，直接进入下一个步骤！
  const handleAdoptAndSendStep = (step: AssistantStepData) => {
    // 业务前置条件校验
    const prereq = checkStepPrerequisites(step.stepIndex);
    if (!prereq.canSend) {
      if (onToast) {
        onToast(`⚠️ 无法发送步骤 ${step.stepIndex}：${prereq.reason}`);
      }
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const needsConfirm = step.requiresClientConfirm !== false;

    // 1. 发送推荐话术
    if (step.speech.trim()) {
      chatStore.sendMessage('agent', step.speech.trim());
    }

    // 2. 发送交互卡片
    chatStore.sendMessage('agent', `【流程辅助卡片：${step.title}】`, 'card', {
      cardType: step.cardType,
      step: step.stepIndex,
      cardData: {
        ...step.cardState,
        requiresClientConfirm: needsConfirm,
        confirmed: !needsConfirm
      }
    });

    if (!needsConfirm) {
      // 若该步骤不需要客户确认，直接在采纳发送后，直接进入下个步骤！
      const currentProc = activeProcesses.find(p => p.id === selectedProcessId);
      const nextStepIndex = step.stepIndex + 1;
      const nextStep = currentProc?.steps.find(s => s.stepIndex === nextStepIndex);

      setActiveProcesses(prev => prev.map(p => {
        if (p.id !== selectedProcessId) return p;
        return {
          ...p,
          currentStepTitle: nextStep ? nextStep.title : '全流程办理完成',
          statusText: nextStep ? nextStep.title : '全流程办理完成',
          steps: p.steps.map(s => {
            if (s.stepIndex === step.stepIndex) {
              return {
                ...s,
                status: 'COMPLETED',
                sentTime: timeStr,
                confirmedTime: timeStr,
                confirmedSummary: '已采纳发送（无需客户确认）',
                cardState: { ...s.cardState, confirmed: true }
              };
            }
            return s;
          })
        };
      }));

      // 步骤收起，下个步骤变为当前展开状态
      setExpandedSteps(prev => ({
        ...prev,
        [step.stepIndex]: false,
        ...(nextStep ? { [nextStepIndex]: true } : {})
      }));

      if (nextStep) {
        setTimeout(() => {
          const el = document.getElementById(`assistant-step-card-${nextStepIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
        if (onToast) {
          onToast(`✓ 步骤 ${step.stepIndex} 已采纳发送，流程已直接推进至步骤 ${nextStepIndex}（当前待发送）`);
        }
      } else {
        if (onToast) {
          onToast(`✓ 步骤 ${step.stepIndex} 已采纳发送，全流程办理完成！`);
        }
      }
    } else {
      // 该步骤需要客户确认：置为 WAITING_CLIENT 状态，等待客户确认
      setActiveProcesses(prev => prev.map(p => {
        if (p.id !== selectedProcessId) return p;
        return {
          ...p,
          steps: p.steps.map(s => {
            if (s.stepIndex === step.stepIndex) {
              return {
                ...s,
                status: 'WAITING_CLIENT',
                sentTime: timeStr
              };
            }
            return s;
          })
        };
      }));

      if (onToast) {
        onToast(`✓ 步骤 ${step.stepIndex} 卡片已发送给客户，等待客户在手机端确认...`);
      }
    }
  };

  // 修改后发送
  const handleEditAndSendStep = (step: AssistantStepData) => {
    // 业务前置条件校验
    const prereq = checkStepPrerequisites(step.stepIndex);
    if (!prereq.canSend) {
      if (onToast) {
        onToast(`⚠️ 无法发送步骤 ${step.stepIndex}：${prereq.reason}`);
      }
      return;
    }

    const key = `step-${step.stepIndex}`;
    const customSpeech = editingTexts[key] !== undefined ? editingTexts[key] : step.speech;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const needsConfirm = step.requiresClientConfirm !== false;

    if (customSpeech.trim()) {
      chatStore.sendMessage('agent', customSpeech.trim());
    }

    chatStore.sendMessage('agent', `【流程辅助卡片：${step.title}】`, 'card', {
      cardType: step.cardType,
      step: step.stepIndex,
      cardData: {
        ...step.cardState,
        requiresClientConfirm: needsConfirm,
        confirmed: !needsConfirm
      }
    });

    if (!needsConfirm) {
      const currentProc = activeProcesses.find(p => p.id === selectedProcessId);
      const nextStepIndex = step.stepIndex + 1;
      const nextStep = currentProc?.steps.find(s => s.stepIndex === nextStepIndex);

      setActiveProcesses(prev => prev.map(p => {
        if (p.id !== selectedProcessId) return p;
        return {
          ...p,
          currentStepTitle: nextStep ? nextStep.title : '全流程办理完成',
          statusText: nextStep ? nextStep.title : '全流程办理完成',
          steps: p.steps.map(s => {
            if (s.stepIndex === step.stepIndex) {
              return {
                ...s,
                speech: customSpeech,
                status: 'COMPLETED',
                sentTime: timeStr,
                confirmedTime: timeStr,
                confirmedSummary: '已采纳发送（无需客户确认）',
                cardState: { ...s.cardState, confirmed: true }
              };
            }
            return s;
          })
        };
      }));

      setExpandedSteps(prev => ({
        ...prev,
        [step.stepIndex]: false,
        ...(nextStep ? { [nextStepIndex]: true } : {})
      }));

      if (nextStep) {
        setTimeout(() => {
          const el = document.getElementById(`assistant-step-card-${nextStepIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
        if (onToast) {
          onToast(`✓ 步骤 ${step.stepIndex}（修改后）已采纳发送，已直接进入步骤 ${nextStepIndex}（当前待发送）`);
        }
      } else {
        if (onToast) {
          onToast(`✓ 步骤 ${step.stepIndex} 已采纳发送，全流程办理完成！`);
        }
      }
    } else {
      setActiveProcesses(prev => prev.map(p => {
        if (p.id !== selectedProcessId) return p;
        return {
          ...p,
          steps: p.steps.map(s => {
            if (s.stepIndex === step.stepIndex) {
              return {
                ...s,
                speech: customSpeech,
                status: 'WAITING_CLIENT',
                sentTime: timeStr
              };
            }
            return s;
          })
        };
      }));

      if (onToast) {
        onToast(`✓ 步骤 ${step.stepIndex}（修改后）已发送给客户，等待客户在手机端确认...`);
      }
    }
  };

  const handleCopySpeech = (text: string) => {
    navigator.clipboard.writeText(text);
    if (onToast) {
      onToast('✓ 话术已复制至剪贴板');
    }
  };

  const filteredProcesses = PRESET_PROCESS_DATABASE.filter(p => 
    p.name.includes(searchQuery) || 
    p.shortName.includes(searchQuery) ||
    p.keywords.some(k => k.includes(searchQuery))
  );

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-800 text-xs overflow-hidden relative select-none">
      
      {/* ======================= 1. 调整后的顶部栏：紧凑美观 ======================= */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between flex-shrink-0 z-30 shadow-2xs">
        {/* 触发状态指示条：点击结束后被清除 */}
        {triggerStatus ? (
          <div className="flex items-center space-x-1.5 min-w-0 mr-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse flex-shrink-0 shadow-xs shadow-blue-500/50"></span>
            <span className="text-[11px] text-blue-900 font-semibold truncate">
              {triggerStatus}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 min-w-0 mr-2 text-slate-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block flex-shrink-0"></span>
            <span className="truncate">暂无触发流程（等待客户咨询消息）</span>
          </div>
        )}

        {/* 搜索业务流程输入框 */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg px-2 py-1 transition-colors">
            <Search size={13} className="text-slate-400 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="搜索业务流程..."
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              className="bg-transparent border-none outline-none text-xs w-24 sm:w-28 text-slate-700 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* 搜索下拉列表 */}
          {showSearchDropdown && (
            <div className="absolute right-0 top-8 w-68 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-bold text-slate-500 px-2 py-1 border-b border-slate-100 flex justify-between items-center">
                <span>匹配业务处理流程</span>
                <button onClick={() => setShowSearchDropdown(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                {filteredProcesses.length > 0 ? (
                  filteredProcesses.map(proc => (
                    <div
                      key={proc.id}
                      onClick={() => handleOpenProcess(proc.id)}
                      className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-900 border border-transparent hover:border-blue-200 cursor-pointer transition-all text-left"
                    >
                      <div className="font-semibold text-xs text-slate-800 line-clamp-1">{proc.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        关键词：{proc.keywords.slice(0, 3).join('、')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[11px] text-slate-400">
                    未找到相关业务流程
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================= 2. 固定顶部：横向排列流程卡片列表 (Sticky，蓝色系) ======================= */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center space-x-2 overflow-x-auto flex-shrink-0 z-20 custom-scrollbar shadow-2xs sticky top-0">
        {activeProcesses.length > 0 ? (
          activeProcesses.map((proc) => {
            const isSelected = proc.id === activeProcess?.id;
            return (
              <div
                key={proc.id}
                onClick={() => setSelectedProcessId(proc.id)}
                className={`
                  flex items-center justify-between min-w-[190px] max-w-[230px] px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all flex-shrink-0 select-none
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-300' 
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'}
                `}
              >
                <div className="min-w-0 flex-1 mr-1.5">
                  <div className={`text-xs truncate font-bold ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                    {proc.name}
                  </div>
                  <div className="text-[10px] text-blue-600 truncate mt-0.2">
                    {proc.currentStepTitle}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCloseProcess(proc.id, e)}
                  className="w-4 h-4 rounded-full hover:bg-blue-200 text-slate-400 hover:text-blue-700 flex items-center justify-center flex-shrink-0 transition-colors"
                  title="关闭此流程"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-slate-400 text-xs py-1">暂无开启的辅助流程</div>
        )}
      </div>

      {/* ======================= 3. 固定顶部：当前流程名称标题栏 (Sticky，蓝色系) ======================= */}
      {activeProcess && (
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/40 to-white px-3.5 py-2 border-b border-blue-100 flex items-center justify-between flex-shrink-0 z-10 sticky top-[45px]">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
              <ShieldCheck size={11} />
            </div>
            <span className="font-bold text-blue-950 text-xs truncate">
              {activeProcess.name}
            </span>
          </div>
          <span className="text-[10px] text-blue-600 font-mono bg-blue-100/70 px-2 py-0.5 rounded-full font-medium">
            全流程辅助
          </span>
        </div>
      )}

      {/* ======================= 4. 滚动区域：步骤节点卡片 ======================= */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
      >
        {!activeProcess || activeProcesses.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <Layers size={24} className="text-slate-400" />
            </div>
            <div className="text-xs font-bold text-slate-700 mb-1">会话已结束 · 暂无进行中的辅助流程</div>
            <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed mb-4">
              当识别到客户发送业务咨询消息（例如发送“卡不能用了，无法转账”），系统将自动识别意图推送【个人账户非柜面限制】辅助流程；您也可以在上方输入框中搜索流程直接启用。
            </p>
          </div>
        ) : (
          activeProcess.steps.map((step) => {
            const editKey = `step-${step.stepIndex}`;
            const isEditing = editingTexts[editKey] !== undefined;
            const currentSpeechText = isEditing ? editingTexts[editKey] : step.speech;

            // 状态区分：
            // 1. 已完成 (COMPLETED)：客户已确认发送完，默认收起
            // 2. 等待客户确认 (WAITING_CLIENT)：已发卡片，当前正在等待客户交互确认！步骤依然停留在本步骤！
            // 3. 当前待发送 (CURRENT_PENDING)：本步骤未发送，且是当前活跃节点并满足前置发送条件，默认展开
            // 4. 前置锁定 (LOCKED)：未满足前置条件（步骤二需客户确认步骤一，步骤三需客户确认步骤二）
            // 5. 后续未开始 (UPCOMING)：后续待发送步骤，默认收起
            const prereq = checkStepPrerequisites(step.stepIndex);
            const isCompleted = step.status === 'COMPLETED';
            const isWaitingClient = step.status === 'WAITING_CLIENT';
            const isCurrentPending = step.status === 'UNSENT' && step.stepIndex === currentActiveStepIndex && prereq.canSend;
            const isLocked = step.status === 'UNSENT' && !prereq.canSend;
            const isUpcoming = step.status === 'UNSENT' && prereq.canSend && step.stepIndex > currentActiveStepIndex;

            const isCurrentStepNode = isWaitingClient || isCurrentPending;
            const expanded = isStepExpanded(step);

            return (
              <div 
                key={step.stepIndex}
                id={`assistant-step-card-${step.stepIndex}`}
                className={`
                  bg-white rounded-2xl transition-all duration-200 overflow-hidden
                  ${isWaitingClient
                    ? 'border-2 border-blue-400 shadow-md ring-2 ring-blue-100/80'
                    : isCurrentPending 
                    ? 'border-2 border-blue-400 shadow-md ring-2 ring-blue-100/80' 
                    : isCompleted
                    ? 'border border-emerald-200 bg-white shadow-2xs'
                    : isLocked
                    ? 'border border-slate-200/90 bg-slate-50/40 shadow-2xs opacity-85'
                    : 'border border-slate-200 hover:border-slate-300 shadow-2xs opacity-90'}
                `}
              >
                {/* ================= 步骤卡片头部（支持点击展开/收起） ================= */}
                <div 
                  onClick={() => toggleStepExpand(step.stepIndex, expanded)}
                  className={`
                    px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors select-none
                    ${isWaitingClient
                      ? 'bg-blue-50/60 border-b border-blue-200'
                      : isCurrentPending 
                      ? 'bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white border-b border-blue-100' 
                      : isCompleted
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-100'
                      : 'bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-100'}
                  `}
                >
                  {/* 左侧：步骤圆点与标题 */}
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      </div>
                    ) : isWaitingClient ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 bg-blue-50">
                        <Loader2 size={12} className="text-blue-600 animate-spin" />
                      </div>
                    ) : isCurrentPending ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 bg-blue-50">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center flex-shrink-0 text-[10px] text-slate-500 font-bold bg-white">
                        {step.stepIndex}
                      </div>
                    )}

                    <span className={`text-xs truncate ${isCurrentStepNode ? 'font-bold text-slate-900' : isCompleted ? 'font-semibold text-slate-800' : 'text-slate-500 font-medium'}`}>
                      {step.title}
                    </span>
                  </div>

                  {/* 右侧：状态 Badge 与 展开/收起指示器 */}
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {/* 状态 1：已完成 -> 已采纳发送状态 */}
                    {isCompleted && (
                      <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>已采纳发送</span>
                      </div>
                    )}

                    {/* 状态 2：已发卡片，等待客户确认 */}
                    {isWaitingClient && (
                      <div className="flex items-center space-x-1 text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping mr-0.5"></span>
                        <span>等待客户确认</span>
                      </div>
                    )}

                    {/* 状态 3：当前待发送 */}
                    {isCurrentPending && (
                      <div className="flex items-center space-x-1 text-blue-700 bg-blue-100/90 border border-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse mr-0.5"></span>
                        <span>当前待发送</span>
                      </div>
                    )}

                    {/* 状态 4：未满足前置条件锁定 */}
                    {isLocked && (
                      <div className="flex items-center space-x-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-medium" title={prereq.reason}>
                        <Lock size={10} className="text-slate-400" />
                        <span>待发送</span>
                      </div>
                    )}

                    {/* 状态 5：后续未开始待发送 */}
                    {isUpcoming && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                        待发送
                      </span>
                    )}

                    <div className="text-slate-400 hover:text-slate-600 transition-transform">
                      {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </div>
                </div>

                {/* ================= 步骤收起时的摘要栏 ================= */}
                {!expanded && (
                  <div 
                    onClick={() => toggleStepExpand(step.stepIndex, expanded)}
                    className="px-3.5 py-2 text-[11px] text-slate-500 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="truncate pr-2 text-slate-500">
                      {isCompleted ? (
                        <span className="text-emerald-700 font-medium">
                          ✔ 已采纳发送：{step.confirmedSummary || (step.requiresClientConfirm === false ? '告知型指引·无需客户确认' : '客户已确认')}
                        </span>
                      ) : (
                        `话术：${step.speech.slice(0, 26)}...`
                      )}
                    </span>
                    <span className="text-[10px] text-blue-600 hover:underline flex-shrink-0">
                      展开详情
                    </span>
                  </div>
                )}

                {/* ================= 步骤展开时的完整交互内容 ================= */}
                {expanded && (
                  <div className="p-3.5 space-y-3">
                    
                    {/* 推荐话术区域 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <div className="flex items-center space-x-1.5 font-semibold text-blue-900">
                          <span className="w-2 h-2 rounded-full bg-[#1890ff]"></span>
                          <span>推荐话术</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!isCompleted && !isWaitingClient && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditing) {
                                  setEditingTexts(prev => {
                                    const next = { ...prev };
                                    delete next[editKey];
                                    return next;
                                  });
                                } else {
                                  setEditingTexts(prev => ({ ...prev, [editKey]: step.speech }));
                                }
                              }}
                              className="text-slate-500 hover:text-blue-600 flex items-center space-x-0.5 cursor-pointer"
                              title="编辑话术"
                            >
                              <Edit3 size={11} />
                              <span>{isEditing ? '取消编辑' : '直接编辑'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopySpeech(currentSpeechText)}
                            className="text-slate-500 hover:text-slate-800 flex items-center space-x-0.5 cursor-pointer ml-1"
                            title="复制话术"
                          >
                            <Copy size={11} />
                            <span>复制</span>
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <textarea
                          value={currentSpeechText}
                          onChange={(e) => setEditingTexts(prev => ({ ...prev, [editKey]: e.target.value }))}
                          rows={3}
                          className="w-full p-2.5 text-xs text-slate-800 bg-blue-50/30 border border-blue-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 leading-relaxed font-sans"
                        />
                      ) : (
                        <div className="bg-[#f0f5ff]/60 border border-blue-100 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                          {step.speech}
                        </div>
                      )}
                    </div>

                    {/* 步骤辅助卡片主体（坐席不能操作卡片选项，仅客户在APP端可操作） */}
                    <div className="border border-blue-200/90 rounded-xl p-3 bg-white space-y-3">
                      
                      {/* 卡片头部徽标与主体内容 */}
                        {activeProcess?.id === 'proc-card-loss' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                                <ShieldCheck size={11} />
                              </div>
                              <span className="font-bold text-blue-950 text-xs">
                                {step.stepIndex === 1 && '挂失业务 · 卡类型与原因确认'}
                                {step.stepIndex === 2 && '挂失业务 · 选择挂失办理渠道'}
                                {step.stepIndex === 3 && '挂失业务 · 办理指引与注意事项'}
                                {step.stepIndex === 4 && '挂失业务 · 后续处理与安全提醒'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                              <span className="text-[10px] text-blue-600 font-medium">步骤 {step.stepIndex} 卡片</span>
                            </div>
                          </div>

                          {step.stepIndex === 1 && (
                            <div className="space-y-3 text-[11px]">
                              <div>
                                <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                                  <span>第一步 · 需要挂失的卡类型</span>
                                  {step.cardState.cardType ? (
                                    <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.cardType}</span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">待客户在APP中选择</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {['储蓄卡（借记卡）', '信用卡'].map(opt => {
                                    const isChecked = step.cardState.cardType === opt;
                                    return (
                                      <div
                                        key={opt}
                                        className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 select-none cursor-default ${
                                          isChecked 
                                            ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                                            : 'border-slate-200 bg-slate-50/50 text-slate-600'
                                        }`}
                                      >
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <span className="truncate">{opt}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                                  <span>第二步 · 确认挂失原因</span>
                                  {step.cardState.lossReason ? (
                                    <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.lossReason}</span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">待客户在APP中选择</span>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  {[
                                    { id: 'r1', title: '不慎遗失', desc: '外出、乘车或家中不慎丢失卡片' },
                                    { id: 'r2', title: '被盗窃或抢劫', desc: '遭遇盗抢，卡片及钱包同时失窃' },
                                    { id: 'r3', title: '疑似信息泄露/被盗刷', desc: '收到不明扣款短信或验证码外泄' },
                                    { id: 'r4', title: '其他原因', desc: '卡面严重损毁、吞卡或其它特殊情况' },
                                  ].map(item => {
                                    const isChecked = step.cardState.lossReason === item.title;
                                    return (
                                      <div
                                        key={item.id}
                                        className={`p-2 rounded-lg border text-left select-none cursor-default ${
                                          isChecked 
                                            ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-200' 
                                            : 'border-slate-200 bg-slate-50/50'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                            {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                          </div>
                                          <span className={`text-[11px] leading-tight ${isChecked ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
                                            {item.title}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 pl-5.5 mt-0.5">
                                          {item.desc}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {step.cardState.lossReason === '其他原因' && (
                                  <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                                    <span className="text-slate-500">详细原因：</span>
                                    <span className="font-medium">{step.cardState.otherReason || '未填写'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {step.stepIndex === 2 && (
                            <div className="space-y-2.5 text-[11px]">
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">挂失卡种：</span>
                                  <span className="font-semibold text-slate-800">{step.cardState.cardType || '储蓄卡（借记卡）'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">挂失原因：</span>
                                  <span className="font-semibold text-blue-600">{step.cardState.lossReason || '不慎遗失'}</span>
                                </div>
                              </div>

                              <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                                <span>请选择您偏好的挂失办理渠道</span>
                                {step.cardState.channel ? (
                                  <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.channel}</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">待客户在APP中选择</span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {[
                                  { id: 'c1', title: '手机银行APP自助挂失', desc: '推荐 · 随时随地线上即时生效，免去奔波' },
                                  { id: 'c2', title: '电话致电客服挂失（955xx）', desc: '24小时语音人工热线，紧急止付' },
                                  { id: 'c3', title: '营业网点柜台人工办理', desc: '持本人有效身份证至网点柜面直接挂失补卡' }
                                ].map(opt => {
                                  const isChecked = step.cardState.channel === opt.title;
                                  return (
                                    <div
                                      key={opt.id}
                                      className={`p-2.5 rounded-xl border text-left select-none cursor-default ${
                                        isChecked 
                                          ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-200' 
                                          : 'border-slate-200 bg-slate-50/50'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <span className={`text-[11px] leading-tight ${isChecked ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
                                          {opt.title}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 pl-5.5 mt-0.5">
                                        {opt.desc}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {step.stepIndex === 3 && (
                            <div className="space-y-2.5 text-[11px]">
                              <div className="font-semibold text-blue-700 mb-1">
                                <span>坐席手动选择/切换发送渠道：</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {['手机银行', '电话银行', '银行柜面'].map(ch => {
                                  const isSelected = (step.cardState.channel || '手机银行') === ch;
                                  return (
                                    <button
                                      key={ch}
                                      type="button"
                                      onClick={() => {
                                        setActiveProcesses(prev => prev.map(p => {
                                          if (p.id !== 'proc-card-loss') return p;
                                          return {
                                            ...p,
                                            steps: p.steps.map(s => {
                                              if (s.stepIndex === 3) {
                                                let newSpeech = '';
                                                if (ch === '手机银行') {
                                                  newSpeech = `好的,已为您匹配手机银行挂失的操作流程与办理须知:\n\n登录手机银行APP-【我的/全部】-【账户挂失/安全锁】,选择对应卡片提交临时挂失(临时挂失通常5-15天有效,建议及时办理正式补卡)。`;
                                                } else if (ch === '电话银行') {
                                                  newSpeech = `好的,已为您匹配电话客服挂失的操作流程与办理须知:\n\n拨打24小时客服热线955xx转人工或自助语音办理紧急挂失,提供卡号及身份信息即可即时止付。`;
                                                } else {
                                                  newSpeech = `好的,已为您匹配营业网点柜面挂失的操作流程与办理须知:\n\n持本人有效身份证件至就近营业网点柜面办理正式挂失与换卡。`;
                                                }
                                                return {
                                                  ...s,
                                                  speech: newSpeech,
                                                  cardState: { ...s.cardState, channel: ch }
                                                };
                                              }
                                              return s;
                                            })
                                          };
                                        }));
                                      }}
                                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                                        isSelected 
                                          ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs ring-1 ring-blue-200' 
                                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      {ch}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100 text-[11px]">
                                <span className="text-slate-500">当前选择办理渠道:</span>
                                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                  {step.cardState.channel || '手机银行'}
                                </span>
                              </div>

                              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-950 leading-relaxed space-y-1.5">
                                <div className="font-bold text-blue-900 flex items-center space-x-1">
                                  <CheckCircle2 size={13} className="text-blue-600" />
                                  <span>{step.cardState.channel || '手机银行'}挂失核心操作指引</span>
                                </div>
                                {(!step.cardState.channel || step.cardState.channel === '手机银行') && (
                                  <>
                                    <div><strong>1. 登录路径：</strong>打开手机银行APP，点击【我的/全部】-【账户挂失/安全锁】；</div>
                                    <div><strong>2. 提交挂失：</strong>选择需挂失的银行卡，点击“临时挂失”，实时生效（有效期一般5-15天）；</div>
                                    <div><strong>3. 正式补卡：</strong>临时挂失期间请及时前往网点办理正式挂失与换领新卡。</div>
                                  </>
                                )}
                                {step.cardState.channel === '电话银行' && (
                                  <>
                                    <div><strong>1. 拨打电话：</strong>拨打24小时客户服务热线 955xx；</div>
                                    <div><strong>2. 转接人工：</strong>根据语音提示转人工服务或自助语音挂失通道；</div>
                                    <div><strong>3. 验证即时生效：</strong>提供卡号及身份信息核验后即时冻结止付。</div>
                                  </>
                                )}
                                {step.cardState.channel === '银行柜面' && (
                                  <>
                                    <div><strong>1. 携带证件：</strong>持卡人本人携带有效二代身份证原件至任一营业网点；</div>
                                    <div><strong>2. 办理业务：</strong>通过智慧柜员机（STM）或柜台人工填写挂失申请；</div>
                                    <div><strong>3. 办理补卡：</strong>正式挂失永久生效，并可现场申请补领新卡。</div>
                                  </>
                                )}
                              </div>

                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1">
                                <div className="font-semibold text-slate-800">注意事项：</div>
                                <div>· 挂失生效后，原卡非柜面及刷卡消费功能立即暂停；</div>
                                <div>· 若找回卡片，在未办正式补卡前可通过手机银行自助办理解除挂失。</div>
                              </div>
                            </div>
                          )}

                          {step.stepIndex === 4 && (
                            <div className="space-y-3 text-[11px]">
                              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
                                <div className="font-bold flex items-center space-x-1 text-emerald-800 mb-1">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>挂失后资金与资产安全保障</span>
                                </div>
                                <div>· 挂失生效后，盗刷风险即刻阻断，原卡内资金安全无虞；</div>
                                <div>· 补办新卡后，原账户余额、定期存款及理财资产自动平移至新卡。</div>
                              </div>

                              <div>
                                <div className="font-semibold text-blue-700 mb-1">
                                  后续跟进与解绑提醒
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1.5 leading-relaxed">
                                  <div>1. <strong>补卡网点：</strong>建议在临时挂失有效期内前往网点办结正式挂失补卡；</div>
                                  <div>2. <strong>快捷支付：</strong>新卡启用后，请及时在微信、支付宝等APP中重新绑定新卡；</div>
                                  <div>3. <strong>自动扣款：</strong>若原卡签约了水电气等代扣业务，需向商户更新签约账号。</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                      {/* 卡片头部徽标 */}
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                            <ShieldCheck size={11} />
                          </div>
                          <span className="font-bold text-blue-950 text-xs">
                            {step.stepIndex === 1 && '非柜面问题定位与定性'}
                            {step.stepIndex === 2 && '非柜面限制 · 办理途径选择'}
                            {step.stepIndex === 3 && (step.cardState.channelMode === 'BRANCH' ? '营业网点柜面办理非柜面限制解除' : '手机银行自助解除非柜面限制')}
                            {step.stepIndex === 4 && '非柜面限制 · 生效时间及注意事项'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            坐席只读
                          </span>
                          <span className="text-[10px] text-blue-600 font-medium">
                            步骤 {step.stepIndex} 卡片
                          </span>
                        </div>
                      </div>

                      {/* 步骤 1 专有卡片内容（坐席不能操作，由客户操作确认） */}
                      {step.stepIndex === 1 && (
                        <div className="space-y-3 text-[11px]">
                          <div>
                            <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                              <span>第一步 · 您急用的是哪张卡？</span>
                              {step.cardState.cardType ? (
                                <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.cardType}</span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">待客户在APP中选择</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {['储蓄卡（借记卡）', '信用卡'].map(opt => {
                                const isChecked = step.cardState.cardType === opt;
                                return (
                                  <div
                                    key={opt}
                                    className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 select-none cursor-default ${
                                      isChecked 
                                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                                        : 'border-slate-200 bg-slate-50/50 text-slate-600'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <span className="truncate">{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                              <span>第二步 · 您是在哪个渠道操作的？</span>
                              {step.cardState.channel ? (
                                <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.channel}</span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">待客户在APP中选择</span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {['手机银行', '微信 / 支付宝等第三方渠道'].map(ch => {
                                const isChecked = step.cardState.channel === ch;
                                return (
                                  <div
                                    key={ch}
                                    className={`p-2 rounded-lg border text-left flex items-center space-x-1.5 select-none cursor-default ${
                                      isChecked 
                                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                                        : 'border-slate-200 bg-slate-50/50 text-slate-600'
                                    }`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                    <span className="truncate leading-tight">{ch}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 说明提示框 */}
                            <div className="mt-2 p-2 bg-[#f0f5ff] rounded-lg text-[10px] text-blue-900 leading-relaxed border border-blue-100 flex items-start space-x-1">
                              <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>第三方平台（微信/支付宝/云闪付）报错不一定准确，请优先以手机银行系统弹窗提示为准。</span>
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                              <span>第三步 · 页面提示的是哪一条？</span>
                              {step.cardState.prompt ? (
                                <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.prompt}</span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">待客户在APP中勾选</span>
                              )}
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                              {[
                                { title: '限制非柜面渠道交易', desc: '系统已暂停该账户非柜面转账与支付业务' },
                                { title: '非柜面交易额度已满', desc: '单笔或当日累计交易金额已达风控上限' },
                                { title: '非柜面交易笔数已满', desc: '当日转账频次超限，解决方式与额度相同' },
                                { title: '能转小额，但金额一大就转不了', desc: '超出当前账户评级设定的非柜面日额度' },
                                { title: '手机银行能转，只有微信 / 支付宝付不了', desc: '第三方快捷支付通道受限或限额未开通' },
                                { title: '客户身份信息已过期', desc: '留存身份证有效期届满，需更新身份信息' },
                                { title: '没有提示 / 是其他系统提示', desc: '网络异常或需人工专项查验' }
                              ].map((p, idx) => {
                                const isChecked = step.cardState.prompt === p.title;
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border select-none cursor-default ${
                                      isChecked
                                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300'
                                        : 'border-slate-200 bg-slate-50/40'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-1.5">
                                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                      </div>
                                      <span className={`font-medium ${isChecked ? 'text-blue-950 font-bold' : 'text-slate-700'}`}>{p.title}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 pl-5 mt-0.5">
                                      {p.desc}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 步骤 2 专有卡片内容（坐席不能操作，由客户操作确认） */}
                      {step.stepIndex === 2 && (
                        <div className="space-y-3 text-[11px]">
                          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">排查问题提示：</span>
                              <span className="font-semibold text-slate-800">{step.cardState.prompt || '限制非柜面渠道交易'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">诊断对应状态：</span>
                              <span className="font-semibold text-blue-600">该账户已暂停非柜面业务</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-950 leading-relaxed flex items-start space-x-1.5">
                            <span className="text-blue-600 font-bold">●</span>
                            <span><strong>暂停的是该卡的转出类交易：</strong>转账、支付、提现暂时不可用；解除后即可线上恢复使用，资金安全无虞</span>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700 mb-1 flex justify-between">
                              <span>可以怎么解决 · 请选择您的办理途径</span>
                              {step.cardState.route ? (
                                <span className="text-emerald-600 text-[10px] font-semibold">✔ 客户已选: {step.cardState.route}</span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">待客户在APP中单选</span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              {[
                                { title: '① 手机银行自助', desc: '推荐 · 足不出户活体人脸核身，最快3分钟完成' },
                                { title: '② 网点柜面办理', desc: '携带本人有效身份证原件及银行卡，就近网点办理' }
                              ].map(routeOpt => {
                                const isChecked = step.cardState.route === routeOpt.title;
                                return (
                                  <div
                                    key={routeOpt.title}
                                    className={`p-2.5 rounded-lg border select-none cursor-default ${
                                      isChecked 
                                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300' 
                                        : 'border-slate-200 bg-slate-50/40'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                      </div>
                                      <span className={`text-[11px] ${isChecked ? 'font-bold text-blue-900' : 'text-slate-800'}`}>{routeOpt.title}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 pl-5.5 mt-0.5">
                                      {routeOpt.desc}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 步骤 3 专有卡片内容（显示对应渠道内容） */}
                      {step.stepIndex === 3 && (
                        <div className="space-y-3 text-[11px]">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <span className="text-slate-500 text-[10px]">当前办理途径:</span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {step.cardState.channelMode === 'BRANCH' ? '营业网点柜面办理' : '手机银行自助解除'}
                            </span>
                          </div>

                          {step.cardState.channelMode !== 'BRANCH' ? (
                            <>
                              <div>
                                <div className="font-semibold text-blue-700 mb-1.5">
                                  手机银行操作路径（两个入口均可）
                                </div>
                                <div className="space-y-1.5 font-mono text-[11px]">
                                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800">
                                    手机银行 → 全部 → 银行服务 → 解除非柜面限制
                                  </div>
                                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800">
                                    手机银行 → 首页 → 我的账户 → 更多 → 账户安全与限额
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5 bg-[#f0f5ff] rounded-xl border border-blue-200 text-[10px] text-blue-900 leading-relaxed space-y-1">
                                <div>· 手机银行需持卡人本人操作，通过人脸活体核身与短信验证码即审即办。</div>
                                <div>· 若页面提示无可解除账户，说明该卡风控等级较高需现场核验，请参考网点指引携带材料前往网点办理。</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div className="font-semibold text-blue-700 mb-1.5">
                                  柜面所需携带材料
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1">
                                  <div>1. 本人有效二代身份证原件</div>
                                  <div>2. 需要解控的银行借记卡原件</div>
                                  <div>3. 辅助流水或收入佐证材料（若需恢复大额交易额度）</div>
                                </div>
                              </div>
                              <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[10px] text-blue-900 leading-relaxed">
                                可携带材料至同城任一营业网点智慧柜员机（STM）办理核验解控，优先推荐原开户网点。
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* 步骤 4 专有卡片内容 */}
                      {step.stepIndex === 4 && (
                        <div className="space-y-3 text-[11px]">
                          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
                            <div className="font-bold flex items-center space-x-1 text-emerald-800 mb-1">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>生效时间与额度恢复</span>
                            </div>
                            <div>· 手机银行自助核身通过后，转账付款功能<strong>实时恢复生效</strong>；</div>
                            <div>· 人工后台审核流程预计在 1-2 个工作日内短信通知结果。</div>
                          </div>

                          <div>
                            <div className="font-semibold text-blue-700 mb-1">
                              账户安全合规提醒
                            </div>
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1.5 leading-relaxed">
                              <div>1. <strong>严禁借用：</strong>请勿出租、出借、出售个人银行账户及银行卡，防范涉案风险；</div>
                              <div>2. <strong>证件维护：</strong>若预留身份证有效期已过，请尽快在手机银行【我的-安全中心】更新；</div>
                              <div>3. <strong>紧急挂失：</strong>如遇可疑转账或盗刷风险，可立即拨打客服热线进行紧急止付。</div>
                            </div>
                          </div>
                        </div>
                      )}
                        </>
                      )}
                    </div>

                    {/* ================= 步骤操作栏（核心逻辑：客户未确认前一直保持当前状态） ================= */}
                    <div className="pt-1">
                      {/* 状态 1：已采纳发送 */}
                      {isCompleted ? (
                        <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-xs font-medium">
                          <div className="flex items-center space-x-1.5 truncate">
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                            <span className="truncate">已采纳发送 · {step.confirmedSummary || (step.requiresClientConfirm === false ? '告知型指引·无需客户确认' : '客户已确认')}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold flex-shrink-0 ml-1">已采纳发送</span>
                        </div>
                      ) : isWaitingClient ? (
                        /* 状态 2：已发送至客户端，等待客户在手机端确认填报 */
                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Loader2 size={14} className="text-blue-600 animate-spin flex-shrink-0" />
                            <div className="leading-tight">
                              <div className="font-bold text-[11px]">卡片已发送 · 等待客户在手机APP确认填报</div>
                              <div className="text-[10px] text-blue-700 mt-0.5">
                                客户在手机端点击“确认”后，坐席端将自动推进至下一步骤
                              </div>
                            </div>
                          </div>
                          {onNavigateToMobile && (
                            <button
                              type="button"
                              onClick={onNavigateToMobile}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-[11px] font-medium flex items-center space-x-1 flex-shrink-0 cursor-pointer shadow-xs transition-colors ml-2"
                              title="点击切换至客户端手机APP"
                            >
                              <span>前往手机APP</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      ) : isCurrentPending ? (
                        /* 状态 3：当前待发送 */
                        <div className="w-full">
                          <div className="flex items-center space-x-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleAdoptAndSendStep(step)}
                              className="flex-1 py-2 px-3 bg-[#1890ff] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <Send size={12} />
                              <span>采纳发送</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditAndSendStep(step)}
                              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                            >
                              修改后发送
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopySpeech(currentSpeechText)}
                              className="py-2 px-2.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                              title="复制话术"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      ) : isLocked ? (
                        /* 状态：前置条件未满足，锁定不可发送 */
                        <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-600 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Lock size={14} className="text-amber-600 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-700 text-[11px]">前置条件未满足 · 暂不可发送</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{prereq.reason}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">需前置确认</span>
                        </div>
                      ) : (
                        /* 状态 4：后续未开始 */
                        <div className="text-center py-1 text-[11px] text-slate-400">
                          请先按流程顺序完成前序步骤，待前置条件满足后自动激活
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
