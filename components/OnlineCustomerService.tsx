import React, { useState, useEffect, useRef } from 'react';
import { 
  Smile, 
  Folder, 
  Mic, 
  Crop, 
  Trash2, 
  Eye, 
  Send, 
  Search, 
  ChevronUp, 
  ChevronDown,
  PhoneCall, 
  X, 
  Clock, 
  Layers, 
  ThumbsUp, 
  MessageSquare, 
  UserCheck, 
  Link2, 
  Check, 
  Copy, 
  Smartphone, 
  Bot, 
  Sparkles,
  HelpCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { chatStore, ChatMessage } from '../services/chatStore';
import AgentAssistantPanel from './AgentAssistantPanel';
import { InteractiveCardBubble } from './InteractiveCardBubble';

export interface FAQDocCardItem {
  id: string;
  question: string;
  answer: string;
  scope: string;
}

export interface RecommendedScriptItem {
  id: string;
  topicTitle: string; // "卡不能用了，无法转账"
  customerQuery: string; // "卡不能用了，无法转账"
  content: string; // The script body
  timestamp: string; // "10:09:55"
  statusText?: string;
  tag: '最新' | '历史';
  relatedDocs: FAQDocCardItem[];
}

export const DEFAULT_CARD_FAQ_DOCS: FAQDocCardItem[] = [
  {
    id: 'faq-card-1',
    question: '借记卡提示“账户异常/无法转账/柜面只收不付（管控代码9901）”如何处理？',
    answer: '经系统核验，借记卡无法转账多为触发反诈保护性风控或预留身份信息过期。客户可登录手机银行【我的】-【安全中心】-【账户异常核身解控】，通过人脸活体识别与短信验证码进行一键解除；若线上未通过，可携带本人有效二代身份证原件及银行卡至任意营业网点智慧柜员机（STM）办理账户重置解除。',
    scope: '个人一类/二类借记卡、手机银行APP V8.0及以上版本'
  },
  {
    id: 'faq-card-2',
    question: '转账汇款提示“超出非柜面交易限额”怎么调整或解除限额？',
    answer: '若因单日或单笔转账限额超限无法汇出，客户可登录手机银行，进入【转账】-【转账设置】-【限额管理】，启用大额交易认证（蓝牙Key或人脸识别）自助调高日累计限额；如需开通更高额度，需持有效身份证件及辅助收入/资产证明至网点柜台申请上调。',
    scope: '个人借记卡、手机银行APP、个人网上银行渠道'
  },
  {
    id: 'faq-card-3',
    question: '银行卡状态显示“睡眠卡/暂停非柜面业务”如何重新激活？',
    answer: '连续超过18个月未主动发生动账交易的账户可能转为睡眠状态。激活方式：持卡人携带本人身份证和银行卡至任一营业网点柜台办理激活，或在手机银行通过人脸核身完成身份再确认后进行一笔任意金额的入账即可恢复正常交易。',
    scope: '借记卡活期储蓄账户'
  }
];

// 根据客户咨询内容动态生成指定话术与相关FAQ文档
export function generateRecommendationForCustomerQuery(
  rawQuery: string,
  timestampStr?: string
): RecommendedScriptItem {
  const query = rawQuery.trim();
  const time = timestampStr || new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const uid = Math.random().toString(36).substring(2, 7);

  // 1. 9901 / 柜面只收不付
  if (/9901|只收不付|管控代码/i.test(query)) {
    return {
      id: `rec-9901-${uid}`,
      topicTitle: '9901 柜面只收不付',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，针对借记卡“9901 柜面只收不付”管控问题，为您查询到以下处理方案：
1、此状态多因银行卡长期未发生主动动账，或预留客户身份信息未及时更新触发的反诈保护性管控；
2、您可优先打开手机银行APP，依次点击【我的】-【安全中心】-【账户异常核身解控】，通过活体人脸识别与短信验证码进行一键解除；
3、若线上核验提示需到网点，请持卡人本人持有效身份证原件及银行卡至任意营业网点智能柜员机办理重置；
4、办结后系统将实时恢复正常转账和消费功能。

适用范围：一类/二类个人借记卡`,
      relatedDocs: [
        {
          id: `faq-9901-1-${uid}`,
          question: '借记卡提示9901代码如何线上自助解除？',
          answer: '登录手机银行APP点击【我的】-【安全中心】-【账户异常核身解控】，通过活体人脸检测与短信校验后即可实时解除。',
          scope: '个人借记卡、手机银行APP V8.0及以上'
        },
        {
          id: `faq-9901-2-${uid}`,
          question: '网点柜台办理解控需要携带哪些资料？',
          answer: '必须持卡人本人携带有效第二代居民身份证原件及受限银行卡，至网点柜面或智慧柜员机（STM）办理，不支持他人代办。',
          scope: '全渠道借记卡'
        }
      ]
    };
  }

  // 2. 刷脸 / 人脸 / 自助解控
  if (/刷脸|人脸|自助|解控|核身/i.test(query)) {
    return {
      id: `rec-face-${uid}`,
      topicTitle: '人脸识别自助解控流程',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，手机银行人脸自助解控具体操作步骤如下：
1、打开手机银行APP，在首页搜索“账户解控”或点击【我的】-【安全中心】-【账户异常核身解控】；
2、系统会自动检测待解控卡片，点击【立即解控】进入人脸活体认证环节；
3、请在光线明亮环境下，根据屏幕语音提示完成点头、眨眼等动作比对；
4、核验通过后输入取款密码确认，系统将立即完成解控，您可以立即尝试发起转账。
注：若多次人脸比对未通过，建议前往就近网点办理人工核实。

适用范围：已开通手机银行的个人客户`,
      relatedDocs: [
        {
          id: `faq-face-1-${uid}`,
          question: '手机银行刷脸解控提示“活体比对失败”怎么办？',
          answer: '请检查手机摄像头权限是否开启，避免逆光、戴帽子或反光眼镜。若多次尝试仍未通过，可转至网点智慧柜员机（STM）进行高精核身。',
          scope: '手机银行APP人脸识别模块'
        },
        {
          id: `faq-face-2-${uid}`,
          question: '自助解控成功后转账额度是多少？',
          answer: '解控后恢复原账户设定的转账限额。如需临时调高转账额度，可在【转账设置】-【限额管理】中进行自主调整。',
          scope: '个人电子银行渠道'
        }
      ]
    };
  }

  // 3. 限额 / 额度 / 超额
  if (/限额|额度|单日|超额/i.test(query)) {
    return {
      id: `rec-limit-${uid}`,
      topicTitle: '转账限额调整',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，关于提高账户转账限额，办理途径如下：
1、线上自助调整：登录手机银行APP，点击【转账】-【转账设置】-【限额管理】，启用人脸认证后可自主上调单日限额至最高20万元；
2、大额转账需求：若需上调至50万元以上，可通过手机银行申请绑定蓝牙Key移动证书，或携带身份证至网点柜面申请调高日累计限额；
3、实时生效：线上调整完成后立即生效，您可重新发起转账汇款。

适用范围：个人借记卡、手机银行APP`,
      relatedDocs: [
        {
          id: `faq-limit-1-${uid}`,
          question: '手机银行单日转账最高限额是多少？',
          answer: '使用短信验证码默认单日最高5万元，开启人脸/指纹安全认证可提升至20万元，绑定蓝牙Key证书可提升至500万元。',
          scope: '手机银行转账功能'
        },
        {
          id: `faq-limit-2-${uid}`,
          question: '如何自助提升单日转账限额？',
          answer: '进入手机银行【转账】-【转账设置】-【限额管理】，选择上调额度并通过人脸活体认证，即可实时提升。',
          scope: '个人借记卡客户'
        }
      ]
    };
  }

  // 4. 挂失 / 丢失 / 补卡 / 盗刷
  if (/挂失|丢失|丢了|被盗|补卡/i.test(query)) {
    return {
      id: `rec-lost-${uid}`,
      topicTitle: '银行卡紧急挂失与补办',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，若您的卡片遗失或存在资金风险，请立即采取以下措施：
1、紧急口头挂失：可登录手机银行【我的】-【安全中心】-【一键挂失】立即暂停账户出账，或由本坐席即刻为您登记临时挂失（5天内有效）；
2、正式书面挂失：临时挂失后请本人持身份证原件前往就近营业网点办理正式挂失；
3、换卡领取：网点支持“立等可取”即时补发新借记卡，卡内资金与理财资产将自动结转至新卡。

适用范围：一类/二类借记卡`,
      relatedDocs: [
        {
          id: `faq-lost-1-${uid}`,
          question: '口头临时挂失后还能收款入账吗？',
          answer: '口头挂失期间仅限制出账（不可取款、转账、消费），不影响资金入账汇入。',
          scope: '个人借记卡账户'
        },
        {
          id: `faq-lost-2-${uid}`,
          question: '补办银行卡可以保留原卡号吗？',
          answer: '普通卡面支持同号换卡（需制卡周期约3-5个工作日）；如需现场立即拿卡可选择异号换卡（现场立等可取）。',
          scope: '网点柜台及STM机'
        }
      ]
    };
  }

  // 5. 密码 / 重置 / 忘记 / 锁定
  if (/密码|重置|忘记|锁/i.test(query)) {
    return {
      id: `rec-pwd-${uid}`,
      topicTitle: '密码重置与解锁指引',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，密码重置与解锁指引如下：
1、手机银行登录密码重置：打开APP登录界面点击【忘记密码】，输入卡号与身份证号，完成人脸识别与短信验证后即可重置新密码；
2、银行卡6位交易取款密码重置：为保障账户资金安全，交易密码连续输错3次被锁定或遗忘，需持卡人本人携带身份证原件及银行卡至任意网点STM机或柜台重置。

适用范围：借记卡与电子银行用户`,
      relatedDocs: [
        {
          id: `faq-pwd-1-${uid}`,
          question: '交易密码连续输错几次会被锁定？',
          answer: '借记卡取款密码连续输错3次将被锁定，锁定后无法自动解锁，需持本人身份证到网点办理重置。',
          scope: '借记卡交易安全机制'
        }
      ]
    };
  }

  // 6. 到账 / 手续费 / 跨行
  if (/到账|多久|手续费|跨行/i.test(query)) {
    return {
      id: `rec-trans-${uid}`,
      topicTitle: '跨行转账时效与手续费',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，关于转账到账时间及手续费说明：
1、到账时效：手机银行选择“实时到账”通常在数秒至2分钟内到账；选择“普通到账”一般2小时内到账；“次日到账”将在受理后24小时发起汇出；
2、手续费优惠：我行手机银行APP及个人网银办理境内人民币跨行转账均免收手续费；
3、交易查询：您可在手机银行【转账】-【转账明细】中实时跟踪转账汇款处理进度。

适用范围：个人借记卡客户`,
      relatedDocs: [
        {
          id: `faq-trans-1-${uid}`,
          question: '转账失败后资金何时退回原账户？',
          answer: '因户名不符、账号错误导致转账被退汇的，资金一般在1个工作日内原路退回付款账户，不扣除手续费。',
          scope: '跨行支付清算系统'
        }
      ]
    };
  }

  // 7. 卡不能用 / 无法转账 / 冻结
  if (/卡不能用|无法转账|冻结|转账不了/i.test(query)) {
    return {
      id: `rec-blocked-${uid}`,
      topicTitle: '卡不能用了，无法转账',
      customerQuery: query,
      timestamp: time,
      tag: '最新',
      content: `您好，针对您反映的借记卡转账受限问题，为您查询到以下解决方案：
1、经系统核对，当前借记卡状态为“柜面只收不付（管控代码9901）”，多由于长期未动账触发保护性风控或预留身份信息过期导致；
2、您可打开手机银行APP，点击【我的】-【安全中心】-【账户异常核身解控】，通过活体刷脸与短信验证码进行一键解除；
3、若人脸核验无法通过，可携带本人有效身份证原件及银行卡至任意营业网点智慧柜员机（STM）办理账户重置；
4、解控完成后实时恢复转账，无需任何手续费用。

适用范围：一类/二类个人借记卡`,
      relatedDocs: DEFAULT_CARD_FAQ_DOCS
    };
  }

  // 8. 默认通用业务咨询
  const shortTitle = query.length > 14 ? query.slice(0, 14) + '...' : query;
  return {
    id: `rec-gen-${uid}`,
    topicTitle: shortTitle,
    customerQuery: query,
    timestamp: time,
    tag: '最新',
    content: `您好，针对您咨询的“${query}”，为您提供以下业务解答：
1、经查询系统业务规则，相关业务支持通过手机银行APP自助办理或携带本人有效身份证件至营业网点办理；
2、您可打开手机银行APP在首页搜索框输入关键词“${query.slice(0, 8)}”，进入专属业务办理通道；
3、如需核实具体账户明细或需要进一步业务协同办理，您可提供卡号后四位，我将竭诚为您核查跟进。

适用范围：个人银行全渠道客户`,
    relatedDocs: [
      {
        id: `faq-gen-1-${uid}`,
        question: `关于“${query.slice(0, 18)}”的业务办理指南`,
        answer: `建议客户优先通过手机银行相关模块查询或办理，如涉及账户状态调整或证件更新，需通过人脸核身或至网点柜台核验。`,
        scope: '电子银行与柜面服务渠道'
      }
    ]
  };
}

const INITIAL_RECOMMENDATIONS: RecommendedScriptItem[] = [
  {
    id: 'rec-card-blocked',
    topicTitle: '卡不能用了，无法转账',
    customerQuery: '卡不能用了，无法转账',
    timestamp: '10:09:55',
    tag: '最新',
    content: `您好，针对您反映的借记卡转账受限问题，为您查询到以下解决方案：
1、经系统核对，当前借记卡状态为“柜面只收不付（管控代码9901）”，多由于长期未动账触发保护性风控或预留身份信息过期导致；
2、您可打开手机银行APP，点击【我的】-【安全中心】-【账户异常核身解控】，通过活体刷脸与短信验证码进行一键解除；
3、若人脸核验无法通过，可携带本人有效身份证原件及银行卡至任意营业网点智慧柜员机（STM）办理账户重置；
4、解控完成后实时恢复转账，无需任何手续费用。

适用范围：一类/二类个人借记卡`,
    relatedDocs: DEFAULT_CARD_FAQ_DOCS
  }
];

interface OnlineCustomerServiceProps {
  onNavigateToMobile?: () => void;
}

export default function OnlineCustomerService({ onNavigateToMobile }: OnlineCustomerServiceProps) {
  // Chat store subscription
  const [messages, setMessages] = useState<ChatMessage[]>(chatStore.getMessages());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(chatStore.getSoundEnabled());
  const [inputText, setInputText] = useState('');
  
  // Tabs & selections
  const [leftTab, setLeftTab] = useState<'session' | 'agent' | 'meeting' | 'queue'>('session');
  const [rightTab, setRightTab] = useState<'assistant' | 'recommended' | 'faq' | 'history' | 'summary'>('assistant');
  const [faqSearch, setFaqSearch] = useState('卡不能用了，无法转账');

  // Recommended Scripts State - 推荐记录管理
  const [recommendations, setRecommendations] = useState<RecommendedScriptItem[]>(INITIAL_RECOMMENDATIONS);
  const [selectedRecId, setSelectedRecId] = useState<string>(INITIAL_RECOMMENDATIONS[0].id);
  const [sessionResetKey, setSessionResetKey] = useState(0);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showRelatedDocs, setShowRelatedDocs] = useState(false);
  const [expandedDocIds, setExpandedDocIds] = useState<Record<string, boolean>>({
    'faq-card-1': true,
  });
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // 跟踪已处理过的客户咨询消息ID（初始包含默认四条记录中的客户消息）
  const processedCustomerMsgIdsRef = useRef<Set<string>>(new Set(['msg-1', 'msg-2', 'msg-4']));
  
  // Features & dialogs
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSilentAgent, setIsSilentAgent] = useState(false);
  const [isManaged, setIsManaged] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSplitMobile, setShowSplitMobile] = useState(false);

  // Call timer running
  const [secondsElapsed, setSecondsElapsed] = useState(204); // 00:03:24
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to chatStore
  useEffect(() => {
    const unsubscribe = chatStore.subscribe(() => {
      setMessages(chatStore.getMessages());
      setSoundEnabled(chatStore.getSoundEnabled());
    });
    return unsubscribe;
  }, []);

  // 当客户询问了其他问题，自动推荐指定话术，最新问题排在最前并标为最新，历史问题标记为历史，可随时定位查看
  useEffect(() => {
    const customerMsgs = messages.filter(m => m.sender === 'customer' && !m.recalled);
    
    // 如果消息被全部清空（例如点击“结束”后）
    if (customerMsgs.length === 0) {
      processedCustomerMsgIdsRef.current.clear();
      setRecommendations([]);
      setSelectedRecId('');
      return;
    }

    // 如果重置为初始默认四条消息
    if (customerMsgs.length <= 3 && customerMsgs.some(m => m.id === 'msg-4') && !customerMsgs.some(m => m.id !== 'msg-1' && m.id !== 'msg-2' && m.id !== 'msg-4')) {
      processedCustomerMsgIdsRef.current = new Set(['msg-1', 'msg-2', 'msg-4']);
      setRecommendations(INITIAL_RECOMMENDATIONS);
      setSelectedRecId(INITIAL_RECOMMENDATIONS[0].id);
      return;
    }

    // 查找未处理的新客户消息
    const unprocessed = customerMsgs.filter(m => !processedCustomerMsgIdsRef.current.has(m.id));
    if (unprocessed.length === 0) return;

    unprocessed.forEach(msg => {
      processedCustomerMsgIdsRef.current.add(msg.id);
      const text = msg.content.trim();
      // 忽略纯问候语
      if (!text || text === '你好' || text === '转人工') return;

      const newRec = generateRecommendationForCustomerQuery(
        text, 
        msg.timeOnly || (msg.timestamp ? msg.timestamp.split(' ')[1] : new Date().toLocaleTimeString('zh-CN', { hour12: false }))
      );

      setRecommendations(prev => {
        // 此前的所有推荐记录转为“历史”
        const historyList = prev.map(item => ({
          ...item,
          tag: '历史' as const
        }));
        // 最新推荐排在最前
        return [newRec, ...historyList];
      });

      // 自动高亮并切换到最新生成的推荐话术
      setSelectedRecId(newRec.id);

      // 若有文档默认展开第一条
      if (newRec.relatedDocs && newRec.relatedDocs.length > 0) {
        setExpandedDocIds(prev => ({
          ...prev,
          [newRec.relatedDocs[0].id]: true
        }));
      }

      setToastMessage(`✓ 已为客户问题“${newRec.topicTitle}”生成推荐话术`);
      setTimeout(() => setToastMessage(null), 2500);
    });
  }, [messages]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatScrollRef.current) {
      if (messages.length > prevMessagesLengthRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const toggleDocExpand = (docId: string) => {
    setExpandedDocIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const handleCopyReply = (content: string, docId: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedDocId(docId);
    setToastMessage('✓ 已复制回复内容到剪贴板');
    setTimeout(() => {
      setCopiedDocId(null);
      setToastMessage(null);
    }, 2000);
  };

  const handleAdoptAndSend = (rec: RecommendedScriptItem) => {
    chatStore.sendMessage('agent', rec.content);
    setRecommendations(prev => prev.map(item => item.id === rec.id ? { ...item, statusText: '已采纳发送' } : item));
    setToastMessage('✓ 已采纳并向客户发送推荐话术');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleEditAndSend = (rec: RecommendedScriptItem) => {
    setInputText(rec.content);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setRecommendations(prev => prev.map(item => item.id === rec.id ? { ...item, statusText: '已填入待修改' } : item));
    setToastMessage('✓ 话术已填入输入框，可在修改后点击发送');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const activeRec = recommendations.find(r => r.id === selectedRecId) || recommendations[0] || null;

  const handleEndSession = () => {
    // 1. Clear all chat messages
    chatStore.clearMessages();
    // 2. Clear recommendations
    setRecommendations([]);
    setSelectedRecId('');
    processedCustomerMsgIdsRef.current.clear();
    // 3. Clear AgentAssistantPanel
    setSessionResetKey(k => k + 1);
    // 4. Reset session timer and inputs
    setSecondsElapsed(0);
    setInputText('');
    setShowEmojiPicker(false);
    setShowQuickPhrases(false);
    setShowEndModal(false);
    setToastMessage('当前会话已结束，聊天内容、坐席辅助及推荐话术已全部清空');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    chatStore.sendMessage('agent', inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleSound = () => {
    chatStore.setSoundEnabled(!soundEnabled);
  };

  const handleRecall = (id: string) => {
    chatStore.recallMessage(id);
  };

  const handleInsertPhrase = (text: string) => {
    setInputText(text);
    setShowQuickPhrases(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendPhraseDirectly = (text: string) => {
    chatStore.sendMessage('agent', text);
    setShowQuickPhrases(false);
  };

  // Quick phrases library
  const quickPhrases = [
    { cat: '礼貌问候', text: '您好，工号6028很高兴为您服务，请问有什么可以帮您？' },
    { cat: '转账排查', text: '请问您在转账时系统提示的具体错误代码或提示语是什么呢？' },
    { cat: '账户解控', text: '建议您打开手机银行APP，点击【我的 - 安全中心 - 账户状态与解控】，按页面提示进行人脸识别验证即可申请解除受限。' },
    { cat: '限额修改', text: '如需调整手机银行日累计转账限额，可在手机银行搜索【转账限额设置】，配合短信或蓝牙U盾验证即可实时提额。' },
    { cat: '安抚话术', text: '非常理解您的焦急心情，请您先别着急，我马上为您查询后台风控拦截记录。' },
    { cat: '结束致谢', text: '感谢您的咨询，后续如有任何业务疑问随时联系我们，祝您生活愉快，再见！' }
  ];

  // Common FAQ items
  const faqList = [
    {
      id: 'faq-1',
      title: '银行卡状态异常排查及解除受限操作指引',
      desc: '涉及9901柜面只收不付、涉案反诈保护性止付等，需核验客户身份及交易流水凭证。',
      solution: '尊敬的客户，您的借记卡因触发风控规则暂时转为仅能柜面办理。您可携带身份证及银行卡至全国任一网点核实更新信息，或在手机银行【账户管理-异常核验】自助办理。'
    },
    {
      id: 'faq-2',
      title: '手机银行转账限额超限及提额指南',
      desc: '单笔限额5万或日累计限额20万超限解决途径。',
      solution: '借记卡手机银行默认单日转账额度为5万元，如需提高额度，请登录手机银行依次进入【我的-账户安全-转账限额管理】，启用动态人脸或大额安全认证工具。'
    },
    {
      id: 'faq-3',
      title: '快捷支付密码连续输错锁定解锁流程',
      desc: '连续输错3次自动锁定，次日0点自动解锁或即时重置。',
      solution: '密码累计输错3次将被临时锁定，您可以点击登录界面的【忘记密码】，通过刷脸并验证绑定手机号短信验证码即可重设新密码。'
    }
  ];

  const emojis = ['😊', '👍', '🙏', '💳', '📱', '🔒', '💰', '💼', '🤝', '📄', '✅', '⚠️', '🙋‍♂️', '👋', '⭐'];

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#eef2f8] text-slate-800 relative font-sans select-none">
      
      {/* ===================== Left Column: Metrics & Session List ===================== */}
      <div className="w-[250px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-sm z-10">
        
        {/* Top 6 Metric Cards in 2 rows x 3 cols matching screenshot exactly */}
        <div className="p-3 border-b border-slate-100 bg-[#fbfcfd]">
          <div className="grid grid-cols-3 gap-2 text-center">
            
            {/* Card 1: 当前会话数 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1">
                <MessageSquare size={13} className="fill-current" />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">当前会话数</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">1</span>
            </div>

            {/* Card 2: 最大连接数 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#1890ff] text-white flex items-center justify-center mb-1">
                <Link2 size={13} />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">最大连接数</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">5</span>
            </div>

            {/* Card 3: 非常满意 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#fa8c16] text-white flex items-center justify-center mb-1">
                <ThumbsUp size={13} className="fill-current" />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">非常满意</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">0</span>
            </div>

            {/* Card 4: 今日接待数 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#722ed1] text-white flex items-center justify-center mb-1">
                <UserCheck size={13} />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">今日接待数</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">0</span>
            </div>

            {/* Card 5: 工作时长 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#ff7a45] text-white flex items-center justify-center mb-1">
                <Clock size={13} />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">工作时长</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">0分</span>
            </div>

            {/* Card 6: 组别 */}
            <div className="bg-white rounded border border-slate-100 p-1.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#13c2c2] text-white flex items-center justify-center mb-1">
                <Layers size={13} />
              </div>
              <span className="text-[11px] text-slate-500 scale-90 origin-center leading-none">组别</span>
              <span className="text-base font-bold text-slate-800 mt-1 leading-none">6</span>
            </div>

          </div>
        </div>

        {/* Sound toggle switch matching screenshot */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center space-x-2 bg-white">
          <button 
            type="button"
            onClick={handleToggleSound}
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${soundEnabled ? 'bg-[#52c41a]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
          <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={handleToggleSound}>
            提示音
          </span>
        </div>

        {/* 4 Tabs: 会话列表 | 坐席列表 | 会议列表 | 排队列表 */}
        <div className="flex border-b border-slate-200 text-xs bg-slate-50 text-slate-600">
          {[
            { id: 'session', label: '会话列表' },
            { id: 'agent', label: '坐席列表' },
            { id: 'meeting', label: '会议列表' },
            { id: 'queue', label: '排队列表' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLeftTab(tab.id as any)}
              className={`flex-1 py-2 text-center transition-all ${leftTab === tab.id ? 'text-[#1890ff] font-medium border-b-2 border-[#1890ff] bg-white' : 'hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content - Session List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftTab === 'session' ? (
            <div>
              {/* Selected Session matching screenshot */}
              <div className="bg-[#e6f4ff] border-l-4 border-[#1890ff] p-3 flex items-start space-x-2.5 cursor-pointer transition-colors hover:bg-blue-50/80">
                {/* Browser/Web channel icon 'e' */}
                <div className="w-7 h-7 rounded-full bg-white border border-blue-200 text-[#1890ff] font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                  e
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 truncate">游客707847</span>
                    <span className="text-[11px] text-slate-400 font-mono">10:09</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {messages.length > 0 ? messages[messages.length - 1].content : '卡不能用了，无法转账'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              暂无更多数据
            </div>
          )}
        </div>

        {/* Quick simulator shortcut link to mobile app */}
        <div className="p-2 border-t border-slate-200 bg-slate-50/70">
          <button
            onClick={() => {
              if (onNavigateToMobile) {
                onNavigateToMobile();
              } else {
                setShowSplitMobile(prev => !prev);
              }
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-white border border-blue-200 text-blue-600 rounded text-xs hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Smartphone size={13} />
            <span>切换至【客户端手机app】</span>
          </button>
        </div>
      </div>


      {/* ===================== Middle Column: Main Chat Workbench ===================== */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200 min-w-0">
        
        {/* Top Session Header matching screenshot */}
        <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 bg-white">
          {/* Left Session Info */}
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold text-slate-800">游客707847</span>
              <span className="text-sm font-medium text-[#1890ff] font-mono tracking-wide">
                {formatTimer(secondsElapsed)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
              <span>客户评级:</span>
              <span className="text-slate-300">|</span>
              <span>渠道: <span className="text-slate-600">web</span></span>
              <span className="text-slate-300">|</span>
              <span>业务类型: <span className="text-slate-600">master_hanshenWeb</span></span>
            </div>
          </div>

          {/* Right Action Buttons matching screenshot */}
          <div className="flex items-center space-x-2">
            <button className="px-2.5 py-1 text-xs border border-[#1890ff] text-[#1890ff] rounded hover:bg-blue-50 transition-colors">
              拉黑
            </button>
            <button className="px-2.5 py-1 text-xs border border-[#1890ff] text-[#1890ff] rounded hover:bg-blue-50 transition-colors">
              新建会议
            </button>
            <button className="px-2.5 py-1 text-xs border border-[#1890ff] text-[#1890ff] rounded hover:bg-blue-50 transition-colors">
              预约码
            </button>
            <button className="px-2.5 py-1 text-xs border border-[#1890ff] text-[#1890ff] rounded hover:bg-blue-50 transition-colors">
              转接
            </button>
            <button className="px-2.5 py-1 text-xs border border-[#1890ff] text-[#1890ff] rounded hover:bg-blue-50 transition-colors">
              语音
            </button>
            <button 
              onClick={handleEndSession}
              className="px-2.5 py-1 text-xs border border-[#fa541c] text-[#fa541c] hover:bg-[#fa541c] hover:text-white rounded transition-colors font-medium shadow-xs"
              title="点击结束当前会话并清空聊天记录"
            >
              结束
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-white relative"
        >
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="sticky top-2 z-20 mx-auto w-fit bg-slate-800/90 backdrop-blur-xs text-white text-xs px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Empty state when messages are cleared */}
          {messages.length === 0 ? (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-slate-400 p-8 text-center select-none">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <MessageSquare size={24} className="text-slate-400" />
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">会话已结束</div>
              <div className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                当前所有聊天内容已清空。您可以直接在下方输入框发送新消息开启对话，或点击下方按钮恢复初始示例数据。
              </div>
              <button
                type="button"
                onClick={() => {
                  chatStore.resetToDefault();
                  setSecondsElapsed(204);
                  setRecommendations(INITIAL_RECOMMENDATIONS);
                  setSelectedRecId(INITIAL_RECOMMENDATIONS[0].id);
                  setToastMessage('已恢复示例会话数据');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="px-3.5 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center space-x-1.5 font-medium shadow-xs cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>恢复示例会话数据</span>
              </button>
            </div>
          ) : (
            messages.map((msg) => {
              const isAgent = msg.sender === 'agent';

              if (msg.recalled) {
                return (
                  <div key={msg.id} className="text-center text-xs text-slate-400 my-2">
                    <span>{isAgent ? '您' : msg.senderName} 撤回了一条消息</span>
                  </div>
                );
              }

              if (isAgent) {
                // Agent message bubble (Right side) matching screenshot
                return (
                  <div key={msg.id} className="flex justify-end items-start space-x-2.5 group">
                    <div className="flex flex-col items-end max-w-[78%]">
                      {msg.type === 'card' ? (
                        <div className="flex flex-col items-end">
                          <InteractiveCardBubble
                            cardType={msg.metadata?.cardType}
                            cardData={msg.metadata?.cardData}
                            messageId={msg.id}
                            isClientView={false}
                          />
                        </div>
                      ) : (
                        <div className="bg-[#e6f4ff] border border-blue-100 rounded-lg p-3 text-sm text-slate-800 shadow-sm relative">
                          <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-end font-mono">
                            <span>{msg.timestamp}</span>
                            <span className="ml-2 font-semibold text-slate-600">{msg.senderName}:</span>
                          </div>
                          <div className="break-words select-text leading-relaxed whitespace-pre-line">
                            {msg.content}
                          </div>
                        </div>
                      )}
                      {/* Recall link matching screenshot */}
                      <button 
                        onClick={() => handleRecall(msg.id)}
                        className="text-xs text-[#1890ff] hover:underline mt-1 mr-1 transition-colors cursor-pointer"
                      >
                        撤回
                      </button>
                    </div>
                    {/* Agent Avatar with Headset Icon */}
                    <div className="w-8 h-8 rounded-full border border-blue-300 bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-current stroke-2">
                        <path d="M12 2a8 8 0 0 0-8 8v4a4 4 0 0 0 4 4h1v-6H5v-2a7 7 0 1 1 14 0v2h-4v6h1a4 4 0 0 0 4-4v-4a8 8 0 0 0-8-8z" />
                      </svg>
                    </div>
                  </div>
                );
              }

              // Customer message bubble (Left side) matching screenshot
              const isFeedbackMsg = msg.content.startsWith('✔ 客户');
              return (
                <div key={msg.id} className="flex justify-start items-start space-x-2.5 group">
                  {/* Customer Round Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1890ff] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  {/* Bubble Container */}
                  <div className="max-w-[78%]">
                    {isFeedbackMsg ? (
                      <div className="bg-white border border-slate-200 border-l-[3.5px] border-l-red-500 rounded-xl p-3 shadow-xs text-xs text-slate-800 leading-relaxed font-sans">
                        <div className="text-[10px] text-slate-400 mb-1.5 font-mono">
                          {msg.timestamp}
                        </div>
                        <div className="space-y-1">
                          {msg.content.split('\n').map((line, idx) => {
                            if (idx === 0) {
                              return (
                                <div key={idx} className="font-bold flex items-center space-x-1 mb-1 text-[12px]">
                                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                                  <span className="text-red-600 font-bold ml-1">{line.replace('✔', '').trim()}</span>
                                </div>
                              );
                            }
                            const colonIdx = line.indexOf('：');
                            if (colonIdx !== -1) {
                              const k = line.slice(0, colonIdx);
                              const v = line.slice(colonIdx + 1);
                              return (
                                <div key={idx} className="text-slate-700 text-[11px] flex">
                                  <span className="text-slate-500 flex-shrink-0">{k}：</span>
                                  <span className="font-medium text-slate-900">{v}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={idx} className="text-slate-600 text-[11px]">
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f4f7fc] border border-slate-100 rounded-lg p-3 text-sm text-slate-800 shadow-sm">
                        <div className="text-[11px] text-slate-400 mb-1 font-mono">
                          {msg.timestamp}
                        </div>
                        <div className="break-words select-text leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Box & Toolbar Area matching screenshot */}
        <div className="border-t border-slate-200 bg-white p-3 flex flex-col relative flex-shrink-0">
          
          {/* Toolbar Above Textarea */}
          <div className="flex items-center justify-between pb-2 mb-1">
            {/* Left Icons */}
            <div className="flex items-center space-x-3 text-slate-500">
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100" 
                title="选择表情"
              >
                <Smile size={18} />
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  chatStore.sendMessage('agent', '【附件：借记卡非柜面限额解控申请指南.pdf (1.4MB)】');
                }} 
                className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100" 
                title="发送文件/附件"
              >
                <Folder size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setIsRecording(prev => !prev);
                  if (!isRecording) {
                    setTimeout(() => {
                      setIsRecording(false);
                      chatStore.sendMessage('agent', '【语音回复 00:08"】');
                    }, 2500);
                  }
                }} 
                className={`transition-colors p-1 rounded hover:bg-slate-100 ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-blue-600'}`} 
                title={isRecording ? '正在录音...' : '语音输入'}
              >
                <Mic size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => {
                  chatStore.sendMessage('agent', '【发送屏幕截图.png】');
                }} 
                className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100" 
                title="截屏发送"
              >
                <Crop size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => {
                  if (confirm('确定清空当前输入或重置聊天记录吗？')) {
                    chatStore.resetToDefault();
                  }
                }} 
                className="hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-100" 
                title="重置或清空记录"
              >
                <Trash2 size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => {
                  alert('质检透视：当前会话情绪平稳，未检测到违禁词或敏感风险，AI辅助推荐评分 98 分。');
                }} 
                className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100" 
                title="质检透视/敏感词检测"
              >
                <Eye size={18} />
              </button>
            </div>

            {/* Right Status Badges/Buttons matching screenshot */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsSilentAgent(prev => !prev)}
                className={`text-xs px-2.5 py-0.5 rounded transition-colors ${isSilentAgent ? 'bg-blue-600 text-white' : 'border border-[#1890ff] text-[#1890ff] hover:bg-blue-50'}`}
              >
                静默坐席
              </button>
              
              <button 
                onClick={() => setIsManaged(prev => !prev)}
                className={`text-xs px-2.5 py-0.5 rounded transition-colors ${isManaged ? 'bg-slate-700 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
              >
                托管
              </button>

              <button 
                onClick={() => setShowQuickPhrases(prev => !prev)}
                className="text-xs px-2.5 py-0.5 rounded border border-[#52c41a] text-[#52c41a] hover:bg-green-50 transition-colors font-medium flex items-center space-x-1"
              >
                <span>常用语</span>
              </button>
            </div>
          </div>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-28 left-4 bg-white border border-slate-200 shadow-xl rounded-lg p-2.5 z-30 flex flex-wrap gap-2 w-64 animate-in fade-in zoom-in-95">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Box */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入内容..."
              className="w-full text-sm outline-none resize-none text-slate-800 placeholder-slate-400 bg-transparent pr-16"
            />

            {/* Bottom Right Send Button with Caret Up icon matching screenshot */}
            <div className="absolute right-1 bottom-1 flex items-center space-x-1.5">
              <button 
                type="button"
                onClick={() => setShowQuickPhrases(prev => !prev)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="快捷常用语"
              >
                <ChevronUp size={16} />
              </button>
              
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-3.5 py-1 text-xs bg-white border border-[#1890ff] text-[#1890ff] hover:bg-[#1890ff] hover:text-white rounded transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1890ff] font-medium shadow-sm flex items-center space-x-1"
              >
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>

      </div>


      {/* ===================== Right Column: Knowledge / Auxiliary Sidebar ===================== */}
      <div className="w-[380px] xl:w-[420px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 shadow-sm z-10 transition-all duration-150">
        
        {/* Top 5 Tabs: 坐席辅助 | 推荐话术 | FAQ | 服务历史 | 小结 */}
        <div className="flex border-b border-slate-200 text-xs text-slate-600 bg-slate-50 flex-shrink-0">
          {[
            { id: 'assistant', label: '坐席辅助' },
            { id: 'recommended', label: '推荐话术' },
            { id: 'faq', label: 'FAQ' },
            { id: 'history', label: '服务历史' },
            { id: 'summary', label: '小结' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setRightTab(tab.id as any);
                setShowHistoryDropdown(false);
              }}
              className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${rightTab === tab.id ? 'text-[#1890ff] font-semibold border-b-2 border-[#1890ff] bg-white' : 'hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {rightTab === 'assistant' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <AgentAssistantPanel 
              resetSignal={sessionResetKey}
              onNavigateToMobile={onNavigateToMobile}
              onToast={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 2500);
              }} 
            />
          </div>
        ) : (
          <>
            {/* 顶部工具栏：推荐话术下拉切换 (参考图二) 或 FAQ 搜索栏 */}
            {rightTab === 'recommended' ? (
              !activeRec ? (
                <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
                  <span className="text-slate-500 font-semibold text-xs">智能推荐话术</span>
                  <span className="text-[11px] text-slate-400">暂无推荐记录</span>
                </div>
              ) : (
          <div className="relative p-3 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              {/* 下拉展开按钮 (参考图二: 翻译机联网失效 ▾ 最新) */}
              <button
                type="button"
                onClick={() => setShowHistoryDropdown(prev => !prev)}
                className="flex items-center space-x-1.5 text-[#1890ff] hover:text-blue-700 font-bold text-xs cursor-pointer group"
                title="点击展开推荐记录"
              >
                <span className="group-hover:underline underline-offset-2">{activeRec.topicTitle}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-[#1890ff] transition-transform duration-200 ${showHistoryDropdown ? 'rotate-180' : ''}`} 
                />
              </button>

              <div className="flex items-center space-x-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  activeRec.tag === '最新'
                    ? 'bg-blue-50 text-[#1890ff] border border-blue-200/80 font-bold'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {activeRec.tag}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeRec.timestamp}
                </span>
              </div>
            </div>

            {/* 自动推荐历史下拉框 (参考图二: 推荐记录 共X条，各条项含内容、时间、最新/历史标签) */}
            {showHistoryDropdown && (
              <div className="absolute top-11 left-2.5 right-2.5 z-40 bg-white rounded-xl shadow-2xl border border-slate-200/90 p-3 space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <span>推荐记录</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">共 {recommendations.length} 条</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                  {recommendations.map((item) => {
                    const isSelected = item.id === activeRec.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedRecId(item.id);
                          setShowHistoryDropdown(false);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 shadow-2xs ring-1 ring-blue-200/50'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {/* 客户问题摘要与最新/历史标签 (参考图二) */}
                        <div className="flex items-start justify-between">
                          <p className={`text-xs leading-snug line-clamp-2 flex-1 mr-2 ${isSelected ? 'text-blue-900 font-semibold' : 'text-slate-700 font-medium'}`}>
                            {item.customerQuery}
                          </p>
                          <span className={`text-[11px] font-medium flex-shrink-0 ${
                            item.tag === '最新' ? 'text-blue-600 font-bold' : 'text-slate-400'
                          }`}>
                            · {item.tag}
                          </span>
                        </div>

                        {/* 时间戳与状态：推荐记录中的“已生成建议”已删除 */}
                        <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                          <span>{item.timestamp}</span>
                          {item.statusText && item.statusText !== '已生成建议' && (
                            <>
                              <span>·</span>
                              <span className={item.statusText === '已采纳发送' ? 'text-emerald-600 font-medium' : ''}>
                                {item.statusText}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      ) : rightTab === 'faq' ? (
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <input 
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="请输入关键词搜索..."
                className="w-full pl-3 pr-8 py-1.5 text-xs border border-slate-200 rounded outline-none focus:border-blue-500 transition-colors"
              />
              <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400 cursor-pointer hover:text-blue-500" />
            </div>

            <div className="mt-2.5">
              <div className="text-[11px] text-slate-400 mb-1.5">常用搜索</div>
              <div className="flex flex-wrap gap-1.5">
                {['用户挂失', '开户', '卡片受限', '转账限额', '翻译机联网'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFaqSearch(tag)}
                    className="px-2 py-0.5 text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab Content Display */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
          
          {/* ==================== 1. 推荐话术 (重点实现，参考图一、图二) ==================== */}
          {rightTab === 'recommended' && (
            !activeRec ? (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <Sparkles size={22} className="text-slate-400" />
                </div>
                <div className="text-xs font-bold text-slate-700 mb-1">会话已结束 · 暂无推荐话术</div>
                <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                  当客户发送业务咨询消息时，智能算法将实时分析客户意图并在此推荐最佳回复话术。
                </p>
              </div>
            ) : (
            <div className="space-y-3">
              {/* 关联客户咨询与问题卡片 */}
              <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <div className="flex items-center space-x-1.5">
                    <MessageSquare size={12} className="text-[#1890ff]" />
                    <span className="font-semibold text-slate-700">关联客户问题 / 咨询内容</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{activeRec.timestamp}</span>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed pl-2.5 border-l-2 border-blue-500 bg-white/80 py-1 rounded-r">
                  “{activeRec.customerQuery}”
                </div>
              </div>

              {/* 推荐话术主体卡片 (参考图一样式：左侧紫条、文本正文、采纳发送与修改后发送按钮、FAQ标签与查看文档) */}
              <div className="rounded-lg border-l-4 border-l-[#722ed1] border border-purple-100 bg-[#fdfcff] shadow-xs overflow-hidden">
                
                {/* 推荐话术文本正文 */}
                <div className="p-3 text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeRec.content}
                </div>

                {/* 操作按钮区 (参考图一: 采纳发送 | 修改后发送) */}
                <div className="px-3 py-2.5 flex items-center space-x-2.5 border-t border-purple-100/70 bg-white/90">
                  <button
                    onClick={() => handleAdoptAndSend(activeRec)}
                    className="px-3.5 py-1.5 text-xs bg-[#2f54eb] hover:bg-[#1d39c4] text-white rounded font-medium shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                    title="直接采纳该话术并作为坐席回复发送给客户"
                  >
                    <Send size={12} className="mr-0.5" />
                    <span>采纳发送</span>
                  </button>

                  <button
                    onClick={() => handleEditAndSend(activeRec)}
                    className="px-3.5 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 rounded font-medium shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                    title="将话术填入下方聊天输入框，可修改后再发送"
                  >
                    <Edit3 size={12} className="mr-0.5 text-slate-500" />
                    <span>修改后发送</span>
                  </button>
                </div>

                {/* 底部信息条：删除FAQ及后面字样，查看文档改为“相关文档” */}
                <div className="px-3 py-2 border-t border-purple-100/60 flex items-center justify-end text-[11px] bg-purple-50/30">
                  <button
                    type="button"
                    onClick={() => setShowRelatedDocs(prev => !prev)}
                    className="text-[#2f54eb] hover:text-[#1d39c4] font-medium flex items-center space-x-1 cursor-pointer hover:underline transition-colors px-1.5 py-0.5 rounded hover:bg-purple-100/50"
                    title="点击展开/收起关联文档列表"
                  >
                    <FileText size={12} className="inline mr-0.5" />
                    <span>相关文档</span>
                    <ChevronDown 
                      size={13} 
                      className={`inline transition-transform duration-200 ${showRelatedDocs ? 'rotate-180 text-[#1d39c4]' : ''}`} 
                    />
                  </button>
                </div>

                {/* 相关文档下方展开下拉框：展示关联的文档列表，文档结构为FAQ卡片 */}
                {showRelatedDocs && (
                  <div className="border-t border-purple-100/70 bg-[#faf9fe] p-3 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between pb-1 text-[11px] text-slate-500 border-b border-purple-100/50">
                      <div className="flex items-center space-x-1 font-medium text-slate-700">
                        <FileText size={12} className="text-[#2f54eb]" />
                        <span>关联文档列表</span>
                        <span className="text-slate-400 font-normal">（共 {(activeRec.relatedDocs || DEFAULT_CARD_FAQ_DOCS).length} 篇）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const docs = activeRec.relatedDocs || DEFAULT_CARD_FAQ_DOCS;
                          const allExpanded = docs.every(d => expandedDocIds[d.id]);
                          const newMap: Record<string, boolean> = {};
                          docs.forEach(d => {
                            newMap[d.id] = !allExpanded;
                          });
                          setExpandedDocIds(newMap);
                        }}
                        className="text-[11px] text-[#2f54eb] hover:underline cursor-pointer"
                      >
                        {(activeRec.relatedDocs || DEFAULT_CARD_FAQ_DOCS).every(d => expandedDocIds[d.id]) ? '全部收起' : '全部展开'}
                      </button>
                    </div>

                    {/* FAQ卡片列表：包含问和答、适用范围、复制回复内容，同时卡片支持收起和展开状态，收起状态只展示问法 */}
                    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-0.5">
                      {(activeRec.relatedDocs || DEFAULT_CARD_FAQ_DOCS).map((doc) => {
                        const isExpanded = !!expandedDocIds[doc.id];
                        return (
                          <div 
                            key={doc.id}
                            className="rounded-lg border border-purple-100 bg-white shadow-2xs overflow-hidden transition-all"
                          >
                            {/* 卡片头部：问法 (收起状态只展示问法) */}
                            <div 
                              onClick={() => toggleDocExpand(doc.id)}
                              className="p-2.5 bg-white hover:bg-purple-50/40 transition-colors cursor-pointer flex items-start justify-between group"
                              title={isExpanded ? '点击收起' : '点击展开'}
                            >
                              <div className="flex items-start space-x-2 flex-1 mr-2">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1890ff] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  问
                                </span>
                                <span className="text-xs font-medium text-slate-800 group-hover:text-blue-600 leading-snug">
                                  {doc.question}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0 text-slate-400 group-hover:text-slate-600 mt-0.5">
                                <span className="text-[10px] text-slate-400">
                                  {isExpanded ? '收起' : '展开'}
                                </span>
                                <ChevronDown 
                                  size={13} 
                                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
                                />
                              </div>
                            </div>

                            {/* 卡片展开内容：答、适用范围、复制回复内容 */}
                            {isExpanded && (
                              <div className="p-3 border-t border-purple-50 bg-[#faf9fe]/60 space-y-2 text-xs animate-in fade-in duration-100">
                                {/* 答 */}
                                <div className="flex items-start space-x-2">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    答
                                  </span>
                                  <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap flex-1 bg-white p-2.5 rounded border border-purple-100/70 shadow-2xs">
                                    {doc.answer}
                                  </div>
                                </div>

                                {/* 适用范围 */}
                                <div className="flex items-center space-x-1.5 pl-6 text-[11px] text-slate-500">
                                  <span className="font-semibold text-slate-600 flex-shrink-0">适用范围：</span>
                                  <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                                    {doc.scope}
                                  </span>
                                </div>

                                {/* 复制回复内容 */}
                                <div className="flex items-center justify-end pt-1 pl-6">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyReply(doc.answer, doc.id);
                                    }}
                                    className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-[#1890ff] hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded font-medium flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                                    title="复制回复内容到剪贴板"
                                  >
                                    {copiedDocId === doc.id ? (
                                      <>
                                        <Check size={12} className="text-emerald-600" />
                                        <span className="text-emerald-600">已复制</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>复制回复内容</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 辅助提示卡片 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 flex items-center space-x-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>实时智能推荐引擎</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">自动识别中</span>
                </div>
                <p className="text-slate-400 leading-normal">
                  客户发送新咨询后，系统将自动毫秒级生成推送新话术。点击顶部下拉菜单可随时回溯历史推荐版本。
                </p>
              </div>
            </div>
            )
          )}

          {/* ==================== 2. FAQ ==================== */}
          {rightTab === 'faq' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 font-medium">推荐解答知识</div>
              {faqList.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-all group">
                  <div className="font-semibold text-slate-800 text-[12px] group-hover:text-blue-600">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleInsertPhrase(item.solution)}
                      className="px-2 py-0.5 text-[11px] bg-white border border-slate-200 hover:border-blue-400 text-slate-600 rounded transition-colors"
                    >
                      引用
                    </button>
                    <button 
                      onClick={() => handleSendPhraseDirectly(item.solution)}
                      className="px-2 py-0.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium shadow-sm"
                    >
                      发送
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================== 3. 服务历史 ==================== */}
          {rightTab === 'history' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-medium">历史交互记录</div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>2026-09-28 14:20</span>
                  <span className="text-emerald-600">已完结</span>
                </div>
                <div className="font-medium text-slate-700 mt-1">手机银行跨行转账手续费咨询</div>
                <div className="text-[11px] text-slate-400 mt-0.5">接待坐席: 6019</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>2026-09-15 09:12</span>
                  <span className="text-emerald-600">已完结</span>
                </div>
                <div className="font-medium text-slate-700 mt-1">智慧柜员机大额取现预约</div>
                <div className="text-[11px] text-slate-400 mt-0.5">接待坐席: 6028</div>
              </div>
            </div>
          )}

          {rightTab === 'summary' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 font-medium">会话服务小结</div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">业务一级类别</label>
                <select className="w-full text-xs border border-slate-200 rounded p-1.5 outline-none bg-white">
                  <option>个人金融 / 借记卡业务</option>
                  <option>电子银行 / 手机银行</option>
                  <option>安全与风控合规</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">解决状态</label>
                <div className="flex space-x-2">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="resStatus" defaultChecked />
                    <span>完全解决</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="resStatus" />
                    <span>跟进处理</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">小结备注</label>
                <textarea rows={3} defaultValue="客户咨询借记卡转账受限问题，已指引客户登录手机银行进行人脸识别自助解控。" className="w-full text-xs border border-slate-200 rounded p-1.5 outline-none resize-none" />
              </div>
              <button 
                onClick={() => alert('会话小结保存成功！')}
                className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                保存小结
              </button>
            </div>
          )}
        </div>
      </>
    )}

      </div>


      {/* ===================== Floating Elements matching screenshot ===================== */}

      {/* Floating IM 99+ Badge at the far bottom right matching screenshot */}
      <div className="fixed bottom-3 right-5 z-40">
        <div className="bg-[#1890ff] hover:bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 text-xs font-bold cursor-pointer transition-all hover:scale-105">
          <span>IM</span>
          <span className="bg-[#ff4d4f] text-white text-[10px] px-1 py-0.2 rounded-full font-black leading-tight">
            99+
          </span>
        </div>
      </div>

      {/* Quick Phrases Drawer/Modal */}
      {showQuickPhrases && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[500px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 className="font-bold text-slate-800 text-sm">常用语快捷库</h3>
              </div>
              <button 
                onClick={() => setShowQuickPhrases(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
              {quickPhrases.map((phrase, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start justify-between group"
                >
                  <div className="flex-1 pr-3">
                    <span className="inline-block text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium mb-1">
                      {phrase.cat}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {phrase.text}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0 pt-2">
                    <button
                      onClick={() => handleInsertPhrase(phrase.text)}
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                    >
                      填入
                    </button>
                    <button
                      onClick={() => handleSendPhraseDirectly(phrase.text)}
                      className="px-2.5 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm transition-colors"
                    >
                      直接发送
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowQuickPhrases(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[420px] p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">结束本次在线会话</h4>
                <p className="text-xs text-slate-500 mt-0.5">确认结束与游客707847的在线接待吗？</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1 mb-5">
              <div>接待总时长: <span className="font-bold text-slate-800">{formatTimer(secondsElapsed)}</span></div>
              <div>沟通消息条数: <span className="font-bold text-slate-800">{messages.length}条</span></div>
              <div className="text-emerald-600 font-medium">✓ 系统将自动归档会话记录并推送信誉评价邀约</div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button 
                onClick={() => setShowEndModal(false)}
                className="px-4 py-1.5 text-xs border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleEndSession}
                className="px-4 py-1.5 text-xs bg-[#fa541c] hover:bg-orange-600 text-white rounded font-medium transition-colors shadow-sm cursor-pointer"
              >
                确认结束并清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
