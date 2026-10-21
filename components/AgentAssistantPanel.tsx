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
  Lock,
  TrendingUp,
  Coins,
  Award,
  AlertTriangle,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { chatStore, ChatMessage } from '../services/chatStore';
import { 
  WEALTH_RISK_QUESTIONS, 
  WEALTH_PREFERENCE_QUESTIONS,
  RISK_EVALUATION_NOTE, 
  calculateRiskEvaluation,
  getCustomWealthTierConfigs
} from './process_management/wealthConsultationData';
import {
  isProcessEnabled,
  PROCESS_STORAGE_KEY
} from './process_management/defaultProcesses';

export interface AssistantStepData {
  stepIndex: number;
  title: string;
  shortTitle: string;
  speech: string;
  cardType: string;
  // 状态：UNSENT (未发送) | WAITING_CLIENT (已发送，等待客户确认) | COMPLETED (已采纳发送)
  status: 'UNSENT' | 'WAITING_CLIENT' | 'COMPLETED';
  requiresClientConfirm?: boolean; // 是否需要客户确认互动 (若为 false，则采纳发送后直接完成并进入下个步骤)
  progressiveQuestionFlow?: boolean;
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
    id: 'proc-card-loss',
    name: '银行卡挂失',
    shortName: '银行卡挂失',
    keywords: ['银行卡不小心丢了', '挂失', '丢卡', '丢了', '丢失', '遗失', '被盗', '解挂', '补卡', '卡丢了', '卡掉了', '钱包丢', '卡不见了'],
  },
  {
    id: 'proc-wealth-manage',
    name: '理财产品咨询',
    shortName: '理财产品咨询',
    keywords: ['理财', '投资', '理财产品', '买理财', '理财推荐', '理财收益', '稳健理财', '基金', '资产配置', '存款还是理财', '理财咨询'],
  },
  {
    id: 'proc-feiguimian',
    name: '个人账户非柜面限制',
    shortName: '非柜面限制',
    keywords: ['卡不能用了', '无法转账', '非柜面', '限制非柜面', '限额', '转账不了', '9901', '冻结', '暂停业务'],
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

export const INITIAL_WEALTH_MANAGE_STEPS: AssistantStepData[] = [
  // 步骤 1: 引导及风险测评 (需客户确认)
  {
    stepIndex: 1,
    title: '步骤 1: 理财咨询-引导及风险测评',
    shortTitle: '引导及风险测评',
    speech: `您好！非常高兴为您提供理财咨询服务。在向您推荐具体的理财产品前，根据《商业银行理财业务监督管理办法》和投资者适当性管理要求，需要先为您进行快速风险承受能力测评。\n\n请您在下方卡片中如实作答测评问卷，真实客观的回答能帮助我们为您精准匹配合适风险等级的产品，保障您的资金安全。`,
    cardType: 'WEALTH_STEP_1_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    progressiveQuestionFlow: true,
    cardState: {
      expLevel: '',
      lossTolerance: '',
      assetRatio: '',
      riskLevel: '',
      confirmed: false,
      progressiveQuestionFlow: true
    }
  },
  // 步骤 2: 投资目标与偏好调研 (需客户确认)
  {
    stepIndex: 2,
    title: '步骤 2: 理财咨询-投资目标与偏好调研',
    shortTitle: '目标与偏好调研',
    speech: `好的，已知悉您的风险测评结果。为了给您推荐最契合您个人资金规划的理财方案，还需要进一步了解您的资金规划偏好。\n\n请您在下方卡片中勾选您的投资目标、资金使用规划以及期限要求，这将决定推荐产品的锁定期与流动性特征（注：如实填写可帮助推荐更匹配的理财类型）。`,
    cardType: 'WEALTH_STEP_2_CARD',
    status: 'UNSENT',
    requiresClientConfirm: true,
    progressiveQuestionFlow: true,
    cardState: {
      fundUsage: '',
      fundUsageOther: '',
      idleDuration: '',
      returnExpectation: '',
      maxFloatingLoss: '',
      pastProducts: [],
      specialFocus: '',
      confirmed: false,
      progressiveQuestionFlow: true
    }
  },
  // 步骤 3: 产品讲解与风险揭示 (无需客户确认)
  {
    stepIndex: 3,
    title: '步骤 3: 理财咨询-产品讲解与风险揭示',
    shortTitle: '产品匹配与风险揭示',
    speech: `根据您第一步骤评定的【C2 稳健型】风险等级以及您的资金期限偏好，为您重点推荐匹配我行【乾元金享·季季丰90天】固定收益类稳健理财：\n\n1. 投向结构：主要投向国债、政策性金融债、高等级信用债及同业存单，资产信用等级高；\n2. 收益结构：业绩比较基准为年化 2.85%~3.15%，按季开放分红；\n3. 【最坏情形揭示】：本产品为非保本浮动收益型，不承诺保本及最低收益。在最极端债券违约或严重流动性冲击下，可能出现实际收益低于基准甚至本金发生浮亏的最坏情形。历史业绩不代表未来表现。`,
    cardType: 'WEALTH_STEP_3_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      productTier: 'C2 稳健型',
      productName: '乾元金享·季季丰90天',
      benchmark: '年化 2.85% - 3.15%',
      riskLevel: 'R2 中低风险',
      assetAllocation: '80%以上投资于国债、政策性金融债、AAA级信用债，20%同业存单，资产信用等级高',
      returnStructure: '每 90 天为一个开放周期 | 1 元起购，0 申赎费，按季开放分红',
      worstCaseScenario: '本理财为非保本浮动收益型。最坏情形下，若底层债券发行人发生信用违约或资本市场遭遇严重流动性紧缩，产品净值可能跌破面值，可能发生本金损失或实际收益低于业绩基准的最坏结果。',
      confirmed: false
    }
  },
  // 步骤 4: 确认理解与后续引导 (无需客户确认)
  {
    stepIndex: 4,
    title: '步骤 4: 理财咨询-确认理解与后续引导',
    shortTitle: '确认理解与顾问转接',
    speech: `请问您对刚才介绍的产品投向、收益特征以及最坏情形的风险揭示是否充分理解？若您对该产品的申赎规则或起息时间还有任何疑问，我随时为您进一步说明。\n\n如果您已充分了解并有意向办理，您可以直接通过下方卡片中的直达链接在手机银行中查阅《产品说明书》并自助申购；若您需要更大额度的配置或一对一量身规划，我也为您推荐了具备专业基金与理财销售资质的持牌客户经理联系方式。`,
    cardType: 'WEALTH_STEP_4_CARD',
    status: 'UNSENT',
    requiresClientConfirm: false,
    cardState: {
      advisorName: '李雅琪',
      advisorTitle: '总行卓越财富管理中心 资深财富顾问',
      licenseId: 'AFM202308119',
      advisorPhone: '021-95566 转 8219',
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
    // 初始如果聊天中有客户触发消息且对应流程处于启用状态，默认触发；停用状态的流程不会在聊天中触发
    const msgs = chatStore.getMessages();
    const hasLossTrigger = isProcessEnabled('proc-card-loss') && msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡.*丢|丢了|丢失|遗失|钱包丢|卡.*不见|卡.*掉|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasWealthTrigger = isProcessEnabled('proc-wealth-manage') && msgs.some(m => m.sender === 'customer' && /理财|投资|理财产品|买理财|理财推荐|稳健理财|基金|资产配置|财富管理|想买理财/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = isProcessEnabled('proc-feiguimian') && msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));

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

    if (hasWealthTrigger) {
      const baseSteps = JSON.parse(JSON.stringify(INITIAL_WEALTH_MANAGE_STEPS));
      const step1Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已完成风险承受能力测评'));
      const step2Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已提交投资目标与偏好调研'));
      const step3Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已知悉理财产品要素与风险揭示'));
      const step4Confirmed = msgs.find(m => m.sender === 'customer' && m.content.includes('✔ 客户已确认理解全部内容并获取通道'));

      if (step1Confirmed) {
        baseSteps[0].status = 'COMPLETED';
        baseSteps[0].cardState.confirmed = true;
      }
      if (step2Confirmed) {
        baseSteps[1].status = 'COMPLETED';
        baseSteps[1].cardState.confirmed = true;
      }
      if (step3Confirmed) {
        baseSteps[2].status = 'COMPLETED';
        baseSteps[2].cardState.confirmed = true;
      }
      if (step4Confirmed) {
        baseSteps[3].status = 'COMPLETED';
        baseSteps[3].cardState.confirmed = true;
      }

      const currentTitle = step4Confirmed
        ? '全流程办理完成'
        : step3Confirmed
        ? '步骤 4: 理财咨询-确认理解与后续引导'
        : step2Confirmed
        ? '步骤 3: 理财咨询-产品讲解与风险揭示'
        : step1Confirmed
        ? '步骤 2: 理财咨询-投资目标与偏好调研'
        : '步骤 1: 理财咨询-引导及风险测评';

      return [
        {
          id: 'proc-wealth-manage',
          name: '理财产品咨询',
          shortName: '理财产品咨询',
          statusText: currentTitle,
          currentStepTitle: currentTitle,
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
    const hasLossTrigger = isProcessEnabled('proc-card-loss') && msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡.*丢|丢了|丢失|遗失|钱包丢|卡.*不见|卡.*掉|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasWealthTrigger = isProcessEnabled('proc-wealth-manage') && msgs.some(m => m.sender === 'customer' && /理财|投资|理财产品|买理财|理财推荐|稳健理财|基金|资产配置|财富管理|想买理财/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = isProcessEnabled('proc-feiguimian') && msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));
    if (hasLossTrigger) return 'proc-card-loss';
    if (hasWealthTrigger) return 'proc-wealth-manage';
    return hasFeiguimianTrigger ? 'proc-feiguimian' : '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string>(() => {
    const msgs = chatStore.getMessages();
    const hasLossTrigger = isProcessEnabled('proc-card-loss') && msgs.some(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡.*丢|丢了|丢失|遗失|钱包丢|卡.*不见|卡.*掉|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔'));
    const hasWealthTrigger = isProcessEnabled('proc-wealth-manage') && msgs.some(m => m.sender === 'customer' && /理财|投资|理财产品|买理财|理财推荐|稳健理财|基金|资产配置|财富管理|想买理财/i.test(m.content) && !m.content.startsWith('✔'));
    const hasFeiguimianTrigger = isProcessEnabled('proc-feiguimian') && msgs.some(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔'));
    if (hasLossTrigger) return '分析完毕，触发【银行卡挂失】';
    if (hasWealthTrigger) return '分析完毕，触发【理财产品咨询】';
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

      // 如果有消息，但当前没有活跃流程，且存在触发关键字的客户消息（停用状态的流程不会在聊天中触发）：
      const lossTriggerMsg = isProcessEnabled('proc-card-loss') ? msgs.find(m => m.sender === 'customer' && /挂失|丢卡|被盗|卡.*丢|丢了|丢失|遗失|钱包丢|卡.*不见|卡.*掉|解挂|补卡/i.test(m.content) && !m.content.startsWith('✔')) : undefined;
      const wealthTriggerMsg = isProcessEnabled('proc-wealth-manage') ? msgs.find(m => m.sender === 'customer' && /理财|投资|理财产品|买理财|理财推荐|稳健理财|基金|资产配置|财富管理|想买理财/i.test(m.content) && !m.content.startsWith('✔')) : undefined;
      const feiguimianTriggerMsg = isProcessEnabled('proc-feiguimian') ? msgs.find(m => m.sender === 'customer' && /卡不能用|无法转账|非柜面|9901|限额/i.test(m.content) && !m.content.startsWith('✔')) : undefined;

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
      } else if (wealthTriggerMsg && activeProcesses.length === 0 && !triggerStatus) {
        setActiveProcesses([
          {
            id: 'proc-wealth-manage',
            name: '理财产品咨询',
            shortName: '理财产品咨询',
            statusText: '步骤 1: 理财咨询-引导及风险测评',
            currentStepTitle: '步骤 1: 理财咨询-引导及风险测评',
            steps: JSON.parse(JSON.stringify(INITIAL_WEALTH_MANAGE_STEPS))
          }
        ]);
        setSelectedProcessId('proc-wealth-manage');
        setTriggerStatus('分析完毕，触发【理财产品咨询】');
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

      // 实时同步客户端理财风险测评问卷(11题)的勾选进度至坐席辅助面板
      const wealthCard1Msg = [...msgs].reverse().find(m => m.type === 'card' && m.metadata?.cardType === 'WEALTH_STEP_1_CARD');
      if (wealthCard1Msg && wealthCard1Msg.metadata?.cardData) {
        const liveCardData = wealthCard1Msg.metadata.cardData;
        setActiveProcesses(prev => prev.map(p => {
          if (p.id !== 'proc-wealth-manage') return p;
          return {
            ...p,
            steps: p.steps.map(s => {
              if (s.stepIndex === 1) {
                return {
                  ...s,
                  cardState: {
                    ...s.cardState,
                    ...liveCardData
                  }
                };
              }
              return s;
            })
          };
        }));
      }

      const latestMsg = msgs[msgs.length - 1];
      if (latestMsg.id === lastProcessedMsgIdRef.current) return;
      lastProcessedMsgIdRef.current = latestMsg.id;

      if (latestMsg.sender === 'customer') {
        const text = latestMsg.content.trim();

        // 1. 触发流程逻辑（若尚未触发且对应流程处于启用状态；停用状态的流程不会在聊天中触发）
        if (/挂失|丢卡|被盗|卡.*丢|丢了|丢失|遗失|钱包丢|卡.*不见|卡.*掉|解挂|补卡/i.test(text) && !text.startsWith('✔')) {
          if (isProcessEnabled('proc-card-loss')) {
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
            setExpandedSteps({ 1: true, 2: false, 3: false, 4: false });
          }
        } else if (/理财|投资|理财产品|买理财|理财推荐|稳健理财|基金|资产配置|财富管理|想买理财/i.test(text) && !text.startsWith('✔')) {
          if (isProcessEnabled('proc-wealth-manage')) {
            setActiveProcesses(prev => {
              if (prev.some(p => p.id === 'proc-wealth-manage')) return prev;
              return [
                {
                  id: 'proc-wealth-manage',
                  name: '理财产品咨询',
                  shortName: '理财产品咨询',
                  statusText: '步骤 1: 理财咨询-引导及风险测评',
                  currentStepTitle: '步骤 1: 理财咨询-引导及风险测评',
                  steps: JSON.parse(JSON.stringify(INITIAL_WEALTH_MANAGE_STEPS))
                },
                ...prev
              ];
            });
            setSelectedProcessId('proc-wealth-manage');
            setTriggerStatus('分析完毕，触发【理财产品咨询】');
          }
        } else if (/卡不能用|无法转账|非柜面|9901|限额/i.test(text) && !text.startsWith('✔')) {
          if (isProcessEnabled('proc-feiguimian')) {
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

        // --- 理财步骤 1 确认响应：✔ 客户已完成风险承受能力测评 ---
        else if (text.includes('✔ 客户已完成风险承受能力测评')) {
          let riskLevelVal = 'C2 稳健型';
          let expVal = '稳健谨慎型';
          let toleranceVal = '微小波动';
          let ratioVal = '20%-50%之间';
          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('评定等级：')) riskLevelVal = line.replace('评定等级：', '').split('（')[0].trim();
            if (line.includes('投资经验：')) expVal = line.replace('投资经验：', '').trim();
            if (line.includes('波动容忍：')) toleranceVal = line.replace('波动容忍：', '').trim();
            if (line.includes('资金占比：')) ratioVal = line.replace('资金占比：', '').trim();
          });

          const tierConfigs = getCustomWealthTierConfigs();
          const matchedTier = tierConfigs.find(t => riskLevelVal.includes(t.tierCode) || t.tierLabel === riskLevelVal) || tierConfigs[1] || tierConfigs[0];

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-wealth-manage') return p;
            return {
              ...p,
              currentStepTitle: '步骤 2: 理财咨询-投资目标与偏好调研',
              steps: p.steps.map(s => {
                if (s.stepIndex === 1) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `测评评级: ${riskLevelVal} | 容忍: ${toleranceVal}`,
                    cardState: {
                      ...s.cardState,
                      riskLevel: riskLevelVal,
                      expLevel: expVal,
                      lossTolerance: toleranceVal,
                      assetRatio: ratioVal,
                      confirmed: true
                    }
                  };
                }
                if (s.stepIndex === 3 && matchedTier) {
                  return {
                    ...s,
                    speech: matchedTier.speechTemplate,
                    cardState: {
                      ...s.cardState,
                      productTier: matchedTier.tierLabel,
                      productName: matchedTier.productName,
                      benchmark: matchedTier.benchmark,
                      riskLevel: matchedTier.riskLevel,
                      assetAllocation: matchedTier.assetAllocation,
                      returnStructure: matchedTier.returnStructure,
                      worstCaseScenario: matchedTier.worstCaseScenario
                    }
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
            onToast('✓ 收到客户风险测评确认，步骤 1 变为已采纳发送状态，步骤 2 变为当前待发送状态');
          }
        }

        // --- 理财步骤 2 确认响应：✔ 客户已提交投资目标与偏好调研 ---
        else if (text.includes('✔ 客户已提交投资目标与偏好调研')) {
          let usageVal = '日常闲钱增值';
          let idleVal = '3—12个月';
          let returnVal = '接受小幅波动，争取高于定期存款';
          let lossVal = '5%以内';
          let pastVal = '银行存款/国债、货币基金/现金管理类';
          let focusVal = '';
          const lines = text.split('\n');
          lines.forEach(line => {
            if (line.includes('资金用途：')) usageVal = line.split('资金用途：')[1].trim();
            if (line.includes('闲置期限：')) idleVal = line.split('闲置期限：')[1].trim();
            if (line.includes('投资期限：')) idleVal = line.split('投资期限：')[1].trim();
            if (line.includes('收益期望：')) returnVal = line.split('收益期望：')[1].trim();
            if (line.includes('浮亏容忍：')) lossVal = line.split('浮亏容忍：')[1].trim();
            if (line.includes('过往经验：')) pastVal = line.split('过往经验：')[1].trim();
            if (line.includes('特别关注：')) focusVal = line.split('特别关注：')[1].trim();
          });

          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-wealth-manage') return p;
            return {
              ...p,
              currentStepTitle: '步骤 3: 理财咨询-产品讲解与风险揭示',
              steps: p.steps.map(s => {
                if (s.stepIndex === 2) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: `用途: ${usageVal} | 期限: ${idleVal} | 浮亏容忍: ${lossVal}`,
                    cardState: {
                      ...s.cardState,
                      fundUsage: usageVal.includes('（') ? '其他（请填写）' : usageVal,
                      fundUsageOther: usageVal.includes('（') ? usageVal.split('（')[1].replace('）', '') : '',
                      idleDuration: idleVal,
                      returnExpectation: returnVal,
                      maxFloatingLoss: lossVal,
                      pastProducts: pastVal.split('、').filter(Boolean),
                      specialFocus: focusVal === '无特殊要求' ? '' : focusVal,
                      confirmed: true
                    }
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
            onToast('✓ 收到客户投资偏好调研，步骤 2 变为已采纳发送状态，步骤 3 变为当前待发送状态');
          }
        }

        // --- 理财步骤 3 确认响应：✔ 客户已知悉理财产品要素与风险揭示 ---
        else if (text.includes('✔ 客户已知悉理财产品要素与风险揭示')) {
          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-wealth-manage') return p;
            return {
              ...p,
              currentStepTitle: '步骤 4: 理财咨询-确认理解与后续引导',
              steps: p.steps.map(s => {
                if (s.stepIndex === 3) {
                  return {
                    ...s,
                    status: 'COMPLETED',
                    confirmedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    confirmedSummary: '客户已知悉产品投向、收益特征及最坏情形说明',
                    cardState: { ...s.cardState, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({ 1: false, 2: false, 3: false, 4: true });
          setTimeout(() => {
            const el = document.getElementById('assistant-step-card-4');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);

          if (onToast) {
            onToast('✓ 客户已知悉产品风险，步骤 3 变为已采纳发送状态，步骤 4 变为当前待发送状态');
          }
        }

        // --- 理财步骤 4 确认响应：✔ 客户已确认理解全部内容并获取通道 ---
        else if (text.includes('✔ 客户已确认理解全部内容并获取通道')) {
          setActiveProcesses(prev => prev.map(p => {
            if (p.id !== 'proc-wealth-manage') return p;
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
                    confirmedSummary: '已获取持牌顾问名片与手机银行安全通道，咨询圆满办结',
                    cardState: { ...s.cardState, confirmed: true }
                  };
                }
                return s;
              })
            };
          }));

          setExpandedSteps({ 1: false, 2: false, 3: false, 4: false });
          if (onToast) {
            onToast('✓ 步骤 4 变为已采纳发送状态，理财产品咨询全流程圆满办结！');
          }
        }
      }
    };

    const unsubscribe = chatStore.subscribe(handleChatUpdate);

    // 监听辅助流程启用/停用状态变更，若当前已触发的流程被停用则立即移除
    const handleProcessesConfigUpdated = () => {
      setActiveProcesses(prev => {
        const next = prev.filter(p => isProcessEnabled(p.id));
        if (next.length !== prev.length) {
          if (next.length === 0) {
            setSelectedProcessId('');
            setTriggerStatus('');
          } else if (!next.some(p => p.id === selectedProcessId)) {
            setSelectedProcessId(next[0].id);
          }
        }
        return next;
      });
    };
    window.addEventListener('bank-processes-updated', handleProcessesConfigUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('bank-processes-updated', handleProcessesConfigUpdated);
    };
  }, [activeProcesses.length, triggerStatus, onToast, selectedProcessId]);

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

  // 手动搜索添加辅助流程（停用状态的流程不会触发）
  const handleOpenProcess = (procId: string) => {
    const meta = PRESET_PROCESS_DATABASE.find(p => p.id === procId);
    if (!meta) return;

    if (!isProcessEnabled(procId)) {
      if (onToast) {
        onToast(`⚠️ 流程「${meta.name}」当前处于停用状态，不会触发！请先在辅助流程管理中启用`);
      }
      return;
    }

    setActiveProcesses(prev => {
      if (prev.some(p => p.id === procId)) return prev;
      const stepsTemplate = procId === 'proc-card-loss' 
        ? INITIAL_CARD_LOSS_STEPS 
        : procId === 'proc-wealth-manage' 
        ? INITIAL_WEALTH_MANAGE_STEPS 
        : INITIAL_PROCESS_STEPS;
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

    // 检查流程管理配置中该节点是否启用了渐进式逐级确认（默认为 true）
    let isProgressiveConfig = true;
    try {
      const saved = localStorage.getItem('BANK_ASSISTANT_PROCESSES_V2');
      if (saved) {
        const list = JSON.parse(saved);
        const proc = list.find((p: any) => p.id === selectedProcessId);
        if (proc && proc.nodes) {
          const node = proc.nodes.find((n: any) => n.nodeCode == step.stepIndex || n.nodeCode === `0${step.stepIndex}` || n.stepNumber === step.stepIndex || n.id.includes(String(step.stepIndex)));
          if (node && node.progressiveQuestionFlow !== undefined) {
            isProgressiveConfig = node.progressiveQuestionFlow;
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. 发送交互卡片（聊天框中的卡片将遵循该节点配置决定是渐进式确认还是平铺展示）
    chatStore.sendMessage('agent', `【流程辅助卡片：${step.title}】`, 'card', {
      cardType: step.cardType,
      step: step.stepIndex,
      cardData: {
        ...step.cardState,
        requiresClientConfirm: needsConfirm,
        confirmed: !needsConfirm,
        progressiveQuestionFlow: isProgressiveConfig
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

    // 检查流程管理配置中该节点是否启用了渐进式逐级确认（默认为 true）
    let isProgressiveConfig = true;
    try {
      const saved = localStorage.getItem('BANK_ASSISTANT_PROCESSES_V2');
      if (saved) {
        const list = JSON.parse(saved);
        const proc = list.find((p: any) => p.id === selectedProcessId);
        if (proc && proc.nodes) {
          const node = proc.nodes.find((n: any) => n.nodeCode == step.stepIndex || n.nodeCode === `0${step.stepIndex}` || n.stepNumber === step.stepIndex || n.id.includes(String(step.stepIndex)));
          if (node && node.progressiveQuestionFlow !== undefined) {
            isProgressiveConfig = node.progressiveQuestionFlow;
          }
        }
      }
    } catch {
      // ignore
    }

    chatStore.sendMessage('agent', `【流程辅助卡片：${step.title}】`, 'card', {
      cardType: step.cardType,
      step: step.stepIndex,
      cardData: {
        ...step.cardState,
        requiresClientConfirm: needsConfirm,
        confirmed: !needsConfirm,
        progressiveQuestionFlow: isProgressiveConfig
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
                  filteredProcesses.map(proc => {
                    const enabled = isProcessEnabled(proc.id);
                    return (
                      <div
                        key={proc.id}
                        onClick={() => handleOpenProcess(proc.id)}
                        className={`p-2 rounded-lg border transition-all text-left ${
                          enabled
                            ? 'hover:bg-blue-50 hover:text-blue-900 border-transparent hover:border-blue-200 cursor-pointer'
                            : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-semibold text-xs text-slate-800 line-clamp-1">{proc.name}</div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium flex-shrink-0 ${
                            enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {enabled ? '已启用' : '已停用'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          关键词：{proc.keywords.slice(0, 3).join('、')}
                        </div>
                      </div>
                    );
                  })
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

                              {/* 平铺展示第二步：确认挂失原因（坐席辅助端始终平铺展示所有问题） */}
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
                      ) : activeProcess?.id === 'proc-wealth-manage' ? (
                        <div className="space-y-3">
                          {/* 卡片头部徽标与主体内容 */}
                          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                                <TrendingUp size={11} />
                              </div>
                              <span className="font-bold text-blue-950 text-xs">
                                {step.stepIndex === 1 && '理财业务 · 引导及风险测评（适当性评测）'}
                                {step.stepIndex === 2 && '理财业务 · 投资目标与偏好调研（需求深度探查）'}
                                {step.stepIndex === 3 && '理财业务 · 对应等级产品讲解与合规风险揭示'}
                                {step.stepIndex === 4 && '理财业务 · 确认理解与持牌顾问及安全通道'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                              <span className="text-[10px] text-blue-600 font-medium">步骤 {step.stepIndex} 卡片</span>
                            </div>
                          </div>

                          {/* 步骤 1: 引导及风险测评（坐席端始终平铺展示所有测评问题） */}
                          {step.stepIndex === 1 && (() => {
                            const currentAnswers: Record<string, string> = {
                              ...(step.cardState.answers || {})
                            };
                            WEALTH_RISK_QUESTIONS.forEach(q => {
                              if (step.cardState[q.fieldName] && !currentAnswers[q.fieldName]) {
                                currentAnswers[q.fieldName] = step.cardState[q.fieldName];
                              }
                            });
                            const answeredCount = WEALTH_RISK_QUESTIONS.filter(q => !!currentAnswers[q.fieldName]).length;
                            const evalRes = calculateRiskEvaluation(currentAnswers);

                            return (
                              <div className="space-y-3 text-[11px]">
                                {/* 合规提示与等级判定参考注释 */}
                                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-relaxed flex items-start space-x-1.5">
                                  <Info size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <strong>等级判定参考注释：</strong>{RISK_EVALUATION_NOTE}
                                  </div>
                                </div>

                                {/* 测评综合评级与进度状态条 */}
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-slate-500">当前风险承受能力评级：</span>
                                    <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                      进度 {answeredCount}/11 题
                                    </span>
                                  </div>
                                  {step.cardState.riskLevel || answeredCount > 0 ? (
                                    <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                                      {step.cardState.riskLevel || evalRes.tierName}（{step.cardState.totalScore !== undefined ? step.cardState.totalScore : evalRes.totalScore}分）
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">待客户在APP端作答生成</span>
                                  )}
                                </div>

                                {/* 11道风险承受能力测评题平铺展示 */}
                                <div className="space-y-2.5">
                                  {WEALTH_RISK_QUESTIONS.map(q => {
                                    const selectedVal = currentAnswers[q.fieldName];
                                    const matchedOpt = q.options.find(o => o.value === selectedVal);
                                    return (
                                      <div key={q.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                                        <div className="font-semibold text-blue-800 text-[11px] flex items-start justify-between gap-2">
                                          <span>{q.title}</span>
                                          {selectedVal ? (
                                            <span className="text-emerald-600 text-[10px] font-semibold flex-shrink-0">
                                              ✔ 客户已选: {matchedOpt ? matchedOpt.label.split('（')[0] : selectedVal}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 text-[10px] flex-shrink-0">待客户在APP中选择</span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                          {q.options.map(opt => {
                                            const isChecked = selectedVal === opt.value;
                                            return (
                                              <div
                                                key={opt.id}
                                                className={`px-2 py-1 rounded-lg border text-[10.5px] select-none cursor-default flex items-center space-x-1.5 ${
                                                  isChecked
                                                    ? 'border-blue-500 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-200'
                                                    : 'border-slate-200 bg-slate-50/70 text-slate-600'
                                                }`}
                                              >
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                  isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                                }`}>
                                                  {isChecked && <div className="w-1 h-1 rounded-full bg-white"></div>}
                                                </div>
                                                <span>{opt.label}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 步骤 2: 投资目标与偏好调研（坐席端平铺展示全部 6 道调研问题） */}
                          {step.stepIndex === 2 && (
                            <div className="space-y-3 text-[11px]">
                              {/* 适当性提示条 */}
                              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[10px] text-blue-900 leading-relaxed flex items-start space-x-1.5">
                                <Info size={13} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>适当性匹配提示：</strong>需提示客户如实回答以下 6 项资金用途、闲置期限、收益期望、浮亏容忍度及过往投资经验，才能推荐更匹配的理财类型，避免资金期限错配。
                                </div>
                              </div>

                              {/* 6 道偏好调研问题列表 */}
                              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                                {WEALTH_PREFERENCE_QUESTIONS.map((q) => {
                                  const rawVal = step.cardState[q.fieldName];
                                  const hasAnswered = q.type === 'CHECKBOX'
                                    ? Array.isArray(rawVal) && rawVal.length > 0
                                    : Boolean(rawVal && String(rawVal).trim());

                                  return (
                                    <div key={q.id} className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                                          <span>{q.title}</span>
                                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                            q.type === 'CHECKBOX'
                                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                              : q.type === 'TEXT_INPUT'
                                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                                          }`}>
                                            {q.type === 'CHECKBOX' ? '多选' : q.type === 'TEXT_INPUT' ? '填写（选填）' : '单选'}
                                          </span>
                                        </div>
                                        {hasAnswered ? (
                                          <span className="text-emerald-600 text-[10px] font-semibold flex-shrink-0">
                                            ✔ 已填: {Array.isArray(rawVal) ? rawVal.join('、') : rawVal}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 text-[10px] flex-shrink-0">
                                            {q.type === 'TEXT_INPUT' ? '选填项' : '待客户在APP中选择'}
                                          </span>
                                        )}
                                      </div>

                                      {q.options && q.options.length > 0 && (
                                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                          {q.options.map((opt) => {
                                            const isChecked = q.type === 'CHECKBOX'
                                              ? Array.isArray(rawVal) && rawVal.some((u: string) => opt.label.includes(u) || opt.value === u)
                                              : (rawVal === opt.value || rawVal === opt.label);
                                            return (
                                              <div
                                                key={opt.value}
                                                className={`px-2 py-1.5 rounded-lg border text-left select-none cursor-default flex items-center space-x-1.5 ${
                                                  isChecked
                                                    ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-semibold ring-1 ring-blue-200'
                                                    : 'border-slate-200 bg-slate-50/60 text-slate-600'
                                                }`}
                                              >
                                                {q.type === 'CHECKBOX' ? (
                                                  <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <Check size={9} className="text-white" />}
                                                  </div>
                                                ) : (
                                                  <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                  </div>
                                                )}
                                                <span className="text-[10px] leading-tight truncate" title={opt.label}>{opt.label}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {q.type === 'TEXT_INPUT' && (
                                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
                                          {hasAnswered ? (
                                            <span className="text-slate-800 font-medium">客户填写：{String(rawVal)}</span>
                                          ) : (
                                            <span>提示语：{q.placeholder || '例如：赎回灵活性、费率、是否可质押等'}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 步骤 3: 产品讲解与风险揭示（坐席可手动选择不同等级理财产品发送给客户，支持读取流程配置） */}
                          {step.stepIndex === 3 && (() => {
                            const tierConfigs = getCustomWealthTierConfigs();
                            const currentTierLabel = step.cardState.productTier || 'C2 稳健型';
                            const activeTier = tierConfigs.find(
                              t => currentTierLabel.includes(t.tierCode) || currentTierLabel.includes(t.riskLevel.split(' ')[0]) || t.tierLabel === currentTierLabel
                            ) || tierConfigs[1] || tierConfigs[0];

                            return (
                              <div className="space-y-3 text-[11px]">
                                {/* 坐席手动切换等级控制栏 */}
                                <div>
                                  <div className="font-semibold text-blue-700 mb-1.5 flex items-center justify-between">
                                    <span>坐席选择推荐理财产品等级（不同等级卡片内容不同）：</span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {tierConfigs.map(tier => {
                                      const isSelected = activeTier.tierCode === tier.tierCode;
                                      return (
                                        <button
                                          key={tier.tierCode}
                                          type="button"
                                          onClick={() => {
                                            setActiveProcesses(prev => prev.map(p => {
                                              if (p.id !== 'proc-wealth-manage') return p;
                                              return {
                                                ...p,
                                                steps: p.steps.map(s => {
                                                  if (s.stepIndex === 3) {
                                                    return {
                                                      ...s,
                                                      speech: tier.speechTemplate,
                                                      cardState: {
                                                        ...s.cardState,
                                                        productTier: tier.tierLabel,
                                                        productName: tier.productName,
                                                        benchmark: tier.benchmark,
                                                        riskLevel: tier.riskLevel,
                                                        assetAllocation: tier.assetAllocation,
                                                        returnStructure: tier.returnStructure,
                                                        worstCaseScenario: tier.worstCaseScenario
                                                      }
                                                    };
                                                  }
                                                  return s;
                                                })
                                              };
                                            }));
                                          }}
                                          className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                                            isSelected
                                              ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-1 ring-blue-300'
                                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                          }`}
                                        >
                                          <div className="text-[11px] font-bold truncate">{tier.tierCode}</div>
                                          <div className="text-[9px] text-slate-500 truncate">{tier.tierName}</div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* 当前选定等级的产品档案卡片 */}
                                <div className="p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-sky-50/80 rounded-xl border border-blue-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                        {step.cardState.productTier || activeTier.tierLabel} · {step.cardState.riskLevel || activeTier.riskLevel}
                                      </span>
                                      <h4 className="font-bold text-slate-900 text-xs mt-1">
                                        {step.cardState.productName || activeTier.productName}
                                      </h4>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[10px] text-slate-400">业绩比较基准</div>
                                      <div className="text-sm font-extrabold text-blue-600 font-mono">
                                        {step.cardState.benchmark || activeTier.benchmark}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-blue-100 text-[10px] text-slate-600 space-y-1">
                                    <div>• <strong>底层投向：</strong>{step.cardState.assetAllocation || activeTier.assetAllocation}</div>
                                    <div>• <strong>收益与周期：</strong>{step.cardState.returnStructure || activeTier.returnStructure}</div>
                                  </div>
                                </div>

                                {/* 核心风险与最坏情形全面揭示（必须揭示，禁止承诺保本） */}
                                <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5 leading-relaxed">
                                  <div className="flex items-center space-x-1 text-amber-900 font-bold text-[11px]">
                                    <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
                                    <span>【最坏情形揭示】：必须主动披露可能发生的极端结果</span>
                                  </div>
                                  <div className="text-[10px] text-amber-950">
                                    {step.cardState.worstCaseScenario || activeTier.worstCaseScenario}
                                  </div>
                                </div>

                                {/* 严禁承诺收益合规红线 */}
                                <div className="p-2 bg-red-50/70 border border-red-200 rounded-lg text-[10px] text-red-700 flex items-center justify-between">
                                  <span className="font-semibold">⚠️ 合规禁令：严禁向客户承诺保本保收益，严格执行资管新规</span>
                                  <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-medium">破刚兑</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 步骤 4: 确认理解与后续引导（持牌顾问名片与官方直达安全通道） */}
                          {step.stepIndex === 4 && (
                            <div className="space-y-3 text-[11px]">
                              {/* 确认理解与回访引导提示 */}
                              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[10px] text-blue-900 leading-relaxed flex items-start space-x-1.5">
                                <CheckCircle2 size={13} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>确认理解指引：</strong>向客户确认是否真正理解产品收益结构与最坏情形风险；询问是否有未明疑问；引导至手机银行官方安全通道或转接有销售资质的持牌人员。
                                </div>
                              </div>

                              {/* 持牌理财顾问名片与联系方式 */}
                              <div>
                                <div className="font-semibold text-blue-700 mb-1 flex items-center space-x-1">
                                  <Phone size={12} className="text-blue-600" />
                                  <span>具备销售资质的专业持牌理财顾问联系方式：</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[10px] text-slate-700">
                                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                                    <div>
                                      <span className="font-bold text-slate-900 text-xs">{step.cardState.advisorName || '李雅琪'}</span>
                                      <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded ml-1.5 font-medium">持牌理财规划师</span>
                                    </div>
                                    <span className="text-slate-400">总行卓越财富中心</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">理财销售资质编号：</span>
                                    <span className="font-mono font-medium text-slate-800">{step.cardState.licenseId || 'AFM202308119'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">基金从业资格编号：</span>
                                    <span className="font-mono font-medium text-slate-800">F202100892</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">专属服务专线：</span>
                                    <span className="font-mono font-bold text-blue-600">{step.cardState.advisorPhone || '021-95566 转 8219'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">驻点服务网点：</span>
                                    <span className="text-slate-800">金融街中心旗舰支行财富管理专区</span>
                                  </div>
                                </div>
                              </div>

                              {/* 官方手机银行安全申购通道 */}
                              <div>
                                <div className="font-semibold text-blue-700 mb-1 flex items-center space-x-1">
                                  <ShieldCheck size={12} className="text-blue-600" />
                                  <span>官方手机银行安全申购通道指引：</span>
                                </div>
                                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-[10px] text-slate-700 space-y-1 leading-relaxed">
                                  <div>1. <strong>登录路径：</strong>打开手机银行APP → 底部【财富/理财】→ 搜索产品代码【QY90D01】；</div>
                                  <div>2. <strong>说明书查阅：</strong>在线完整查阅《产品说明书》与《风险揭示书》并进行电子签名；</div>
                                  <div>3. <strong>投资冷静期：</strong>认购享有 24 小时投资冷静期，冷静期内支持全额自主撤回。</div>
                                </div>
                              </div>

                              {/* 法律合规与注意事项 */}
                              <div>
                                <div className="font-semibold text-blue-700 mb-1">
                                  重要合规与法律免责声明（告知客户）：
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 space-y-1 leading-relaxed">
                                  <div>1. 理财非存款、产品有风险、投资须谨慎，商业银行不承诺保本及最低收益；</div>
                                  <div>2. 业绩比较基准仅供投资参考，不构成任何收益承诺，产品过往业绩不代表未来表现；</div>
                                  <div>3. 请务必通过手机银行官方渠道认购，切勿将资金转入任何第三方平台或个人账户。</div>
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

                          {/* 平铺展示第二步：操作渠道（坐席辅助端始终平铺展示所有问题） */}
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

                          {/* 平铺展示第三步：页面报错提示排查（坐席辅助端始终平铺展示所有问题） */}
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
