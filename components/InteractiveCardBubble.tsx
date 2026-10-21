import React from 'react';
import { 
  Building2, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  ShieldCheck,
  Smartphone,
  Landmark,
  CreditCard,
  Check,
  Send,
  Lock,
  TrendingUp,
  Coins,
  Award,
  AlertTriangle,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { chatStore } from '../services/chatStore';
import { 
  WEALTH_RISK_QUESTIONS, 
  WEALTH_PREFERENCE_QUESTIONS,
  RISK_EVALUATION_NOTE, 
  calculateRiskEvaluation,
  getCustomWealthTierConfigs
} from './process_management/wealthConsultationData';

interface InteractiveCardBubbleProps {
  cardType?: string;
  cardData?: Record<string, any>;
  messageId: string;
  isClientView?: boolean;
}

export const InteractiveCardBubble: React.FC<InteractiveCardBubbleProps> = ({
  cardType = 'STEP_1_CARD',
  cardData: rawCardData,
  messageId,
  isClientView = false
}) => {
  const cardData: Record<string, any> = rawCardData || {};
  // Update state in chat metadata - ONLY client can operate
  const handleSelectRadio = (key: string, value: any) => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        [key]: value
      }
    });
  };

  const handleToggleCheckbox = (key: string, value: string) => {
    if (!isClientView || cardData?.confirmed) return;
    const current: string[] = Array.isArray(cardData[key]) ? [...cardData[key]] : [];
    const exists = current.includes(value);
    const updated = exists ? current.filter(v => v !== value) : [...current, value];
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        [key]: updated
      }
    });
  };

  // Step 1: 客户确认提交填报 (只有客户端可触发)
  const handleConfirmStep1 = () => {
    if (!isClientView || cardData?.confirmed) return;
    const cardTypeVal = cardData?.cardType || '储蓄卡（借记卡）';
    const channelVal = cardData?.channel || '手机银行';
    const promptVal = cardData?.prompt || '限制非柜面渠道交易';

    // 自动发送确认消息给坐席
    chatStore.sendMessage(
      'customer',
      `✔ 客户已填报\n卡种：${cardTypeVal}\n操作渠道：${channelVal}\n页面提示：${promptVal}`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        cardType: cardTypeVal,
        channel: channelVal,
        prompt: promptVal,
        confirmed: true
      }
    });
  };

  // Step 2: 客户确认选择办理途径 (只有客户端可触发)
  const handleConfirmStep2 = (routeValue?: string) => {
    if (!isClientView || cardData?.confirmed) return;
    const routeVal = routeValue || cardData?.route || '① 手机银行自助';
    const intention = routeVal.includes('网点') ? '前往营业网点现场核办' : '优先在手机银行线上自助解控';

    chatStore.sendMessage(
      'customer',
      `✔ 客户已选择\n办理途径：${routeVal}\n客户意向：${intention}`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        route: routeVal,
        confirmed: true
      }
    });
  };

  // Step 3: 手机银行办理成功 (只有客户端可触发)
  const handleMobileSuccessFeedback = () => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.sendMessage(
      'customer',
      `✔ 客户已报：已在手机银行提交解除申请\n入口：全部-银行服务-解除非柜面限制\n在线侧查不到该申请，无受理单号，以手机银行页面提示为准`
    );
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        clientActionTaken: 'SUCCESS',
        confirmed: true
      }
    });
  };

  // Step 3: 需要网点办理 (只有客户端可触发)
  const handleMobileBranchFeedback = () => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.sendMessage(
      'customer',
      `✔ 客户反馈：需要前往营业网点办理\n原因：手机银行页面未查询到可解除账户\n请协助提供就近营业网点办理所需材料清单`
    );
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        clientActionTaken: 'BRANCH',
        confirmed: true
      }
    });
  };

  // Step 4: 确认已知晓注意事项 (只有客户端可触发)
  const handleConfirmStep4 = () => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.sendMessage(
      'customer',
      `✔ 客户确认：已知晓生效时间与用卡注意事项\n已了解账户安全防范要求与合规用卡指引`
    );
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        confirmed: true
      }
    });
  };

  // Card Loss Step 1: 确认卡类型与挂失原因
  const handleConfirmLossStep1 = () => {
    if (!isClientView || cardData?.confirmed) return;
    const cardTypeVal = cardData?.cardType || '储蓄卡（借记卡）';
    const reasonVal = cardData?.lossReason || '不慎遗失';
    const otherVal = cardData?.otherReason ? `（补充：${cardData.otherReason}）` : '';

    chatStore.sendMessage(
      'customer',
      `✔ 客户已填报挂失信息\n卡种：${cardTypeVal}\n挂失原因：${reasonVal}${otherVal}`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        cardType: cardTypeVal,
        lossReason: reasonVal,
        confirmed: true
      }
    });
  };

  // Card Loss Step 2: 确认挂失渠道
  const handleConfirmLossStep2 = (channelValue?: string) => {
    if (!isClientView || cardData?.confirmed) return;
    const channelVal = channelValue || cardData?.channel || '手机银行APP自助挂失';

    chatStore.sendMessage(
      'customer',
      `✔ 客户已选择挂失途径\n办理途径：${channelVal}\n请协助指引详细挂失与补办流程`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        channel: channelVal,
        confirmed: true
      }
    });
  };

  // Card Loss Step 4: 确认已知晓挂失后续须知
  const handleConfirmLossStep4 = () => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.sendMessage(
      'customer',
      `✔ 客户已确认：已知晓挂失后续须知与安全提醒\n已了解补卡换卡流程及快捷支付解绑事项`
    );
    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        confirmed: true
      }
    });
  };

  // Wealth Step 1: 风险承受能力测评确认 (11道问卷完成)
  const handleConfirmWealthStep1 = () => {
    if (!isClientView || cardData?.confirmed) return;
    const currentAnswers: Record<string, string> = {
      ...(cardData?.answers || {})
    };
    WEALTH_RISK_QUESTIONS.forEach(q => {
      if (cardData?.[q.fieldName] && !currentAnswers[q.fieldName]) {
        currentAnswers[q.fieldName] = cardData[q.fieldName];
      }
    });

    const evalRes = calculateRiskEvaluation(currentAnswers);

    chatStore.sendMessage(
      'customer',
      `✔ 客户已完成风险承受能力测评\n评定等级：${evalRes.tierName}（${evalRes.riskLevel}，测评总分 ${evalRes.totalScore}分）\n投资经验：${currentAnswers.q4_exp_type || '均衡配置'}\n波动容忍：${currentAnswers.q6_attitude || '稳健型'}\n资金占比：${currentAnswers.q3_invest_ratio || '25%—50%'}\n已如实作答11道专业风险测评题，请推荐匹配理财方案`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        answers: currentAnswers,
        totalScore: evalRes.totalScore,
        tierId: evalRes.tierId,
        tierName: evalRes.tierName,
        riskLevel: evalRes.tierName,
        confirmed: true
      }
    });
  };

  // Wealth Step 2: 投资目标与偏好调研确认 (6道问题)
  const handleConfirmWealthStep2 = () => {
    if (!isClientView || cardData?.confirmed) return;
    const rawUsage = typeof cardData?.fundUsage === 'string' && cardData.fundUsage
      ? cardData.fundUsage
      : '日常闲钱增值';
    const customUsage = cardData?.otherFundUsage ? `（${cardData.otherFundUsage}）` : '';
    const fundUsageVal = rawUsage.includes('其他') ? `${rawUsage}${customUsage}` : rawUsage;
    const idleDurationVal = cardData?.idleDuration || '3—12个月';
    const yieldExpectationVal = cardData?.yieldExpectation || '接受小幅波动，争取高于定期存款';
    const drawdownToleranceVal = cardData?.drawdownTolerance || '5%以内';
    const historicalProductsArr: string[] = Array.isArray(cardData?.historicalProducts) && cardData.historicalProducts.length > 0
      ? cardData.historicalProducts
      : ['银行存款/国债', '货币基金/现金管理类'];
    const specialConcernsVal = cardData?.specialConcerns?.trim() || '无特别补充';

    chatStore.sendMessage(
      'customer',
      `✔ 客户已提交投资目标与偏好调研\n资金用途：${fundUsageVal}\n预计动用：${idleDurationVal}\n收益期望：${yieldExpectationVal}\n浮亏容忍：${drawdownToleranceVal}\n购买历史：${historicalProductsArr.join('、')}\n特别关注：${specialConcernsVal}\n请根据偏好为我讲解推荐的理财产品`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        fundUsage: rawUsage,
        otherFundUsage: cardData?.otherFundUsage || '',
        idleDuration: idleDurationVal,
        yieldExpectation: yieldExpectationVal,
        drawdownTolerance: drawdownToleranceVal,
        historicalProducts: historicalProductsArr,
        specialConcerns: cardData?.specialConcerns || '',
        confirmed: true
      }
    });
  };

  // Wealth Step 3: 产品讲解与风险揭示已阅确认
  const handleConfirmWealthStep3 = () => {
    if (!isClientView || cardData?.confirmed) return;
    const productName = cardData?.productName || '乾元金享·季季丰90天';
    const riskLevel = cardData?.riskLevel || 'R2 中低风险';
    chatStore.sendMessage(
      'customer',
      `✔ 客户已知悉理财产品要素与风险揭示\n已了解【${productName}（${riskLevel}）】的投向结构、收益特征及最坏情形说明，清楚该产品非保本浮动收益且不保证收益`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        confirmed: true
      }
    });
  };

  // Wealth Step 4: 确认理解与完成咨询
  const handleConfirmWealthStep4 = () => {
    if (!isClientView || cardData?.confirmed) return;
    chatStore.sendMessage(
      'customer',
      `✔ 客户已确认理解全部内容并获取通道\n已保存持牌理财顾问李雅琪（工号 8219）联系方式及手机银行购买通道，无额外疑问，咨询圆满办结`
    );

    chatStore.updateMessageMetadata(messageId, {
      cardData: {
        ...cardData,
        confirmed: true
      }
    });
  };

  // ============================ Step 1: 非柜面问题定位与定性 ============================
  if (cardType === 'STEP_1_CARD') {
    const selectedCardType = cardData?.cardType || '';
    const selectedChannel = cardData?.channel || '';
    const selectedPrompt = cardData?.prompt || '';
    const isConfirmed = !!cardData?.confirmed;

    const promptList = [
      { id: 'p1', title: '限制非柜面渠道交易', desc: '系统已暂停该账户非柜面转账与支付业务' },
      { id: 'p2', title: '非柜面交易额度已满', desc: '单笔或当日累计交易金额已达风控上限' },
      { id: 'p3', title: '非柜面交易笔数已满', desc: '当日转账频次超限，解决方式与额度相同' },
      { id: 'p4', title: '能转小额，但金额一大就转不了', desc: '超出当前账户评级设定的非柜面日额度' },
      { id: 'p5', title: '手机银行能转，只有微信 / 支付宝付不了', desc: '第三方快捷支付通道受限或限额未开通' },
      { id: 'p6', title: '客户身份信息已过期', desc: '留存身份证有效期届满，需更新身份信息' },
      { id: 'p7', title: '没有提示 / 是其他系统提示', desc: '网络异常或需人工专项查验' },
    ];

    // 渐进式逐级确认逻辑：
    // 聊天框中的卡片遵循节点配置：若 cardData?.progressiveQuestionFlow === false 则为一次性平铺展示；若为 true（默认）则为渐进式逐级确认
    const isProgressive = cardData?.progressiveQuestionFlow !== false;
    // 渐进式模式下：
    // 1. 初始仅展示第一步（卡种）
    // 2. 选择卡种后，自动展开第二步（操作渠道）
    // 3. 选择渠道后，自动展开第三步（系统提示），并且因第三步为最后一个待确认问题，同时展示确认按钮
    // 平铺模式下：初始直接平铺展示所有三步问题与确认按钮
    const showStep2 = isConfirmed || !isProgressive || !!selectedCardType;
    const showStep3 = isConfirmed || !isProgressive || (!!selectedCardType && !!selectedChannel);
    const showConfirmButton = isConfirmed || !isProgressive || (!!selectedCardType && !!selectedChannel);
    const canSubmit = !isConfirmed && !!selectedCardType && !!selectedChannel && !!selectedPrompt;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header - Blue Theme */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">非柜面问题定位与定性</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 客户已填报' : isClientView ? '请按序填报选项' : '待客户操作'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-3">
          {/* 第一步：始终展示 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第一步 · 您急用的是哪张卡？</span>
              {!selectedCardType && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
              )}
              {selectedCardType && (
                <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['储蓄卡（借记卡）', '信用卡'].map((card) => {
                const checked = selectedCardType === card;
                return (
                  <div
                    key={card}
                    onClick={() => isClientView && !isConfirmed && handleSelectRadio('cardType', card)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                      !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      checked 
                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                        : isClientView
                        ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        : 'border-slate-200 bg-slate-50/40 text-slate-600'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-[11px]">{card}</span>
                  </div>
                );
              })}
            </div>

            {/* 引导提示：未选卡种时提示 */}
            {isClientView && !selectedCardType && !isConfirmed && (
              <div className="mt-2 p-2 bg-blue-50/60 rounded-lg text-[10px] text-blue-800 leading-relaxed border border-blue-100 flex items-center space-x-1.5 animate-in fade-in">
                <Info size={12} className="text-blue-500 flex-shrink-0" />
                <span>选择卡类型后，将自动展示操作渠道与报错排查</span>
              </div>
            )}
          </div>

          {/* 第二步：客户选择卡类型后才展示 */}
          {showStep2 ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
                <span>第二步 · 您是在哪个渠道操作的？</span>
                {!selectedChannel && !isConfirmed && (
                  <span className="text-[10px] text-amber-600 font-normal">
                    {isClientView ? '请选择' : '待客户在APP中选择'}
                  </span>
                )}
                {selectedChannel && (
                  <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['手机银行', '微信 / 支付宝等第三方渠道'].map((ch) => {
                  const checked = selectedChannel === ch;
                  return (
                    <div
                      key={ch}
                      onClick={() => isClientView && !isConfirmed && handleSelectRadio('channel', ch)}
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                        !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        checked 
                          ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                          : isClientView
                          ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                          : 'border-slate-200 bg-slate-50/40 text-slate-600'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <span className="text-[11px] leading-tight truncate">{ch}</span>
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
          ) : !isClientView && (
            <div className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center">
              待客户在手机APP中选择卡类型后解锁第二步渠道选择
            </div>
          )}

          {/* 第三步：客户选择操作渠道后才展示 */}
          {showStep3 ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
                <span>第三步 · 页面提示的是哪一条？</span>
                {!selectedPrompt && !isConfirmed && (
                  <span className="text-[10px] text-amber-600 font-normal">
                    {isClientView ? '请勾选' : '待客户在APP中勾选'}
                  </span>
                )}
                {selectedPrompt && (
                  <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
                )}
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5 custom-scrollbar">
                {promptList.map((item) => {
                  const checked = selectedPrompt === item.title;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isClientView && !isConfirmed && handleSelectRadio('prompt', item.title)}
                      className={`p-2 rounded-lg border transition-all ${
                        !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        checked 
                          ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300' 
                          : isClientView
                          ? 'border-slate-200 hover:border-slate-300 bg-white'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className={`text-[11px] leading-tight ${checked ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
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
            </div>
          ) : !isClientView && (
            <div className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center">
              待客户选择操作渠道后解锁第三步报错提示排查
            </div>
          )}

          {/* 确认提交操作区 - 只有展示到最后一个待确认问题（或已确认）时才展示确认按钮 */}
          {showConfirmButton && (
            <div className="pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              {isConfirmed || cardData?.requiresClientConfirm === false ? (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium flex items-center justify-center space-x-1.5 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>已采纳发送 · 信息已同步至坐席工作台</span>
                </div>
              ) : isClientView ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmStep1}
                    disabled={!canSubmit}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                      canSubmit
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check size={14} />
                    <span>{canSubmit ? '确认' : '请勾选页面系统提示后点击确认'}</span>
                  </button>
                  <div className="text-center text-[10px] text-slate-400">
                    点击确认后，系统将自动向坐席发送填报清单并推进下一步
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                    <span>步骤卡片已发送至客户APP · 等待客户选择填报</span>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================ Step 2: 原因解释与渠道方案 ============================
  if (cardType === 'STEP_2_CARD') {
    const selectedRoute = cardData?.route || '';
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">非柜面限制 · 办理途径选择</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 途径已确认' : isClientView ? '请选择办理途径' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* 排查结论与对应情况 */}
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">排查问题提示：</span>
              <span className="font-semibold text-slate-800">{cardData?.prompt || '限制非柜面渠道交易'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">诊断对应状态：</span>
              <span className="font-semibold text-blue-600">该账户已暂停非柜面业务</span>
            </div>
          </div>

          {/* 重点提示横幅 */}
          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-950 leading-relaxed flex items-start space-x-1.5">
            <span className="text-blue-600 font-bold">●</span>
            <span><strong>暂停的是该卡的转出类交易：</strong>转账、支付、提现暂时不可用；解除后即可线上恢复使用，资金安全无虞</span>
          </div>

          {/* 可以怎么办 · 两条路（客户点击选择） */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>可以怎么解决 · 请选择您的办理途径</span>
              {!selectedRoute && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请单选' : '待客户在APP中单选'}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {[
                { id: 'r1', title: '① 手机银行自助', desc: '推荐 · 足不出户活体人脸核身，最快3分钟完成' },
                { id: 'r2', title: '② 网点柜面办理', desc: '携带本人有效身份证原件及银行卡，就近网点办理' }
              ].map((opt) => {
                const checked = selectedRoute === opt.title;
                return (
                  <div
                    key={opt.id}
                    onClick={() => isClientView && !isConfirmed && handleSelectRadio('route', opt.title)}
                    className={`p-2.5 rounded-lg border transition-all ${
                      !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      checked 
                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300' 
                        : isClientView
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <span className={`text-[11px] ${checked ? 'font-bold text-blue-900' : 'text-slate-800'}`}>
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

          {/* 确认选择按钮 - 坐席端不可操作，仅客户APP端可操作 */}
          <div className="pt-1 border-t border-slate-100">
            {isConfirmed || cardData?.requiresClientConfirm === false ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium flex items-center justify-center space-x-1.5 text-xs">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>已采纳发送 · {selectedRoute || '办理途径已选择'}</span>
              </div>
            ) : isClientView ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleConfirmStep2()}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认</span>
                </button>
                <div className="text-center text-[10px] text-slate-400">
                  选择完毕后，坐席将立即为您推送具体操作步骤
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-medium">
                  <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                  <span>卡片已发送至客户APP · 等待客户选择办理途径</span>
                </div>
                <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================ Step 3: 手机银行自助解除 / 营业网点办理 ============================
  if (cardType === 'STEP_3_CARD') {
    const channelMode = cardData?.channelMode || 'MOBILE';
    const isMobile = channelMode === 'MOBILE';
    const actionTaken = cardData?.clientActionTaken;
    const isConfirmed = !!cardData?.confirmed || !!actionTaken;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">
              {isMobile ? '手机银行自助解除非柜面限制' : '营业网点柜面办理非柜面限制解除'}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${actionTaken || isConfirmed || cardData?.requiresClientConfirm === false ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'}`}>
            {actionTaken || isConfirmed || cardData?.requiresClientConfirm === false ? '✓ 已送达客户' : (isMobile ? '线上自助' : '线下柜面')}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {isMobile ? (
            <>
              {/* 操作路径 */}
              <div>
                <div className="font-semibold text-blue-700 text-[11px] mb-1.5">
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

              {/* 注意事项 */}
              <div className="p-2.5 bg-[#f0f5ff] rounded-xl border border-blue-200 text-[10px] text-blue-900 leading-relaxed space-y-1">
                <div>· 手机银行需持卡人本人操作，通过人脸活体核身与短信验证码即审即办。</div>
                <div>· 若页面提示无可解除账户，说明该卡风控等级较高需现场核验，请参考网点指引携带材料前往网点办理。</div>
              </div>

              {/* 交互按钮 - 坐席端不可操作，仅客户APP端可操作 */}
              <div className="pt-1">
                {actionTaken || isConfirmed || cardData?.requiresClientConfirm === false ? (
                  <div className="p-2.5 rounded-xl text-center font-medium text-xs border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center justify-center space-x-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>已采纳发送 · 手机银行操作路径指引已送达客户端</span>
                  </div>
                ) : isClientView ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-700 text-[11px] flex items-center justify-between">
                      <span>请选择您的办理进展</span>
                      <span className="text-[10px] text-blue-600 font-normal">点击单选</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { id: 'SUCCESS', title: '① 手机银行自助办理成功', desc: '已完成人脸活体核身并提交申请' },
                        { id: 'BRANCH', title: '② 手机银行提示无可解除账户', desc: '风控拦截需转为携带材料前往网点办理' }
                      ].map((item) => {
                        const isSelected = (cardData?.mobileResult || 'SUCCESS') === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectRadio('mobileResult', item.id)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                              </div>
                              <span className={`text-[11px] ${isSelected ? 'font-bold text-blue-900' : 'text-slate-800'}`}>
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
                    <button
                      type="button"
                      onClick={() => {
                        const result = cardData?.mobileResult || 'SUCCESS';
                        if (result === 'BRANCH') {
                          handleMobileBranchFeedback();
                        } else {
                          handleMobileSuccessFeedback();
                        }
                      }}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check size={14} />
                      <span>确认</span>
                    </button>
                    <div className="text-center text-[10px] text-slate-400">
                      点击确认后，将自动通知坐席为您确认生效结果
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                      <span>办理指引已发送至客户APP · 等待客户操作反馈</span>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 柜面办理说明 */}
              <div>
                <div className="font-semibold text-blue-700 text-[11px] mb-1.5">
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

              <div className="pt-1">
                {actionTaken || isConfirmed || cardData?.requiresClientConfirm === false ? (
                  <div className="p-2.5 rounded-xl text-center font-medium text-xs border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center justify-center space-x-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>已采纳发送 · 网点柜面办理清单及须知已送达客户端</span>
                  </div>
                ) : isClientView ? (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        chatStore.sendMessage('customer', '✔ 客户已收到网点柜面办理清单，将准备身份证及银行卡就近办理');
                        chatStore.updateMessageMetadata(messageId, {
                          cardData: {
                            ...cardData,
                            clientActionTaken: 'BRANCH_ACK',
                            confirmed: true
                          }
                        });
                      }}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check size={14} />
                      <span>确认</span>
                    </button>
                    <div className="text-center text-[10px] text-slate-400">
                      点击确认后，将自动通知坐席登记网点办理指引
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                      <span>网点须知已发送至客户APP · 等待客户确认</span>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================ Step 4: 生效时间及注意事项 ============================
  if (cardType === 'STEP_4_CARD') {
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">非柜面限制 · 生效时间及注意事项</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isConfirmed || cardData?.requiresClientConfirm === false ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'}`}>
            {isConfirmed || cardData?.requiresClientConfirm === false ? '✓ 已采纳发送' : isClientView ? '请确认须知' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* 生效时间 */}
          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            <div className="font-bold flex items-center space-x-1 text-emerald-800 mb-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>生效时间与额度恢复</span>
            </div>
            <div>· 手机银行自助核身通过后，转账付款功能<strong>实时恢复生效</strong>；</div>
            <div>· 人工后台审核流程预计在 1-2 个工作日内短信通知结果。</div>
          </div>

          {/* 注意事项 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1">
              账户安全合规提醒
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1.5 leading-relaxed">
              <div>1. <strong>严禁借用：</strong>请勿出租、出借、出售个人银行账户及银行卡，防范涉案风险；</div>
              <div>2. <strong>证件维护：</strong>若预留身份证有效期已过，请尽快在手机银行【我的-安全中心】更新；</div>
              <div>3. <strong>紧急挂失：</strong>如遇可疑转账或盗刷风险，可立即拨打客服热线进行紧急止付。</div>
            </div>
          </div>

          {/* 确认操作 - 坐席端不可操作，仅客户APP端可操作 */}
          <div className="pt-1 border-t border-slate-100">
            {isConfirmed || cardData?.requiresClientConfirm === false ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium text-xs flex items-center justify-center space-x-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>已采纳发送 · 生效时间及合规注意事项已送达客户</span>
              </div>
            ) : isClientView ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleConfirmStep4}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认</span>
                </button>
                <div className="text-center text-[10px] text-slate-400">
                  点击确认后，系统将自动向坐席发送完成确认
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-medium">
                  <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                  <span>注意事项已发送至客户APP · 等待客户确认知晓</span>
                </div>
                <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================ 挂失业务：步骤 1: 卡类型与挂失原因确认 ============================
  if (cardType === 'LOSS_STEP_1_CARD') {
    const selectedCardType = cardData?.cardType || '';
    const selectedReason = cardData?.lossReason || '';
    const otherReason = cardData?.otherReason || '';
    const isConfirmed = !!cardData?.confirmed;

    const reasonList = [
      { id: 'r1', title: '不慎遗失', desc: '外出、乘车或家中不慎丢失卡片' },
      { id: 'r2', title: '被盗窃或抢劫', desc: '遭遇盗抢，卡片及钱包同时失窃' },
      { id: 'r3', title: '疑似信息泄露/被盗刷', desc: '收到不明扣款短信或验证码外泄' },
      { id: 'r4', title: '其他原因', desc: '卡面严重损毁、吞卡或其它特殊情况' },
    ];

    // 渐进式逐级确认逻辑（挂失业务 步骤 1）：
    // 聊天框中的卡片遵循节点配置：若 cardData?.progressiveQuestionFlow === false 则为一次性平铺展示；若为 true（默认）则为渐进式逐级确认
    const isProgressive = cardData?.progressiveQuestionFlow !== false;
    // 渐进式模式下：选择卡类型后才展示挂失原因与确认按钮；平铺模式下：初始即平铺展示所有问题与确认按钮
    const showStep2 = isConfirmed || !isProgressive || !!selectedCardType;
    const showConfirmButton = isConfirmed || !isProgressive || !!selectedCardType;
    const canSubmit = !isConfirmed && !!selectedCardType && !!selectedReason;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">挂失业务 · 卡类型与原因确认</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 客户已填报' : isClientView ? '请按序填报选项' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* 1. 卡类型选择（第一步：始终展示） */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第一步 · 需要挂失的卡类型</span>
              {!selectedCardType && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
              )}
              {selectedCardType && (
                <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['储蓄卡（借记卡）', '信用卡'].map((card) => {
                const checked = selectedCardType === card;
                return (
                  <div
                    key={card}
                    onClick={() => isClientView && !isConfirmed && handleSelectRadio('cardType', card)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                      !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      checked 
                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-200' 
                        : isClientView
                        ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        : 'border-slate-200 bg-slate-50/40 text-slate-600'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-[11px]">{card}</span>
                  </div>
                );
              })}
            </div>

            {/* 引导提示：未选卡种时提示 */}
            {isClientView && !selectedCardType && !isConfirmed && (
              <div className="mt-2 p-2 bg-blue-50/60 rounded-lg text-[10px] text-blue-800 leading-relaxed border border-blue-100 flex items-center space-x-1.5 animate-in fade-in">
                <Info size={12} className="text-blue-500 flex-shrink-0" />
                <span>选择卡类型后，将自动展示确认挂失原因</span>
              </div>
            )}
          </div>

          {/* 2. 挂失原因选择：客户选择卡类型后才展示 */}
          {showStep2 ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
                <span>第二步 · 确认挂失原因</span>
                {!selectedReason && !isConfirmed && (
                  <span className="text-[10px] text-amber-600 font-normal">
                    {isClientView ? '请勾选' : '待客户在APP中选择'}
                  </span>
                )}
                {selectedReason && (
                  <span className="text-[10px] text-emerald-600 font-medium">✓ 已选</span>
                )}
              </div>
              <div className="space-y-1.5">
                {reasonList.map((item) => {
                  const checked = selectedReason === item.title;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isClientView && !isConfirmed && handleSelectRadio('lossReason', item.title)}
                      className={`p-2 rounded-lg border transition-all ${
                        !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        checked 
                          ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300' 
                          : isClientView
                          ? 'border-slate-200 hover:border-slate-300 bg-white'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className={`text-[11px] leading-tight ${checked ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
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

              {selectedReason === '其他原因' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="请简单描述具体挂失原因..."
                    value={otherReason}
                    disabled={!isClientView || isConfirmed}
                    onChange={(e) => handleSelectRadio('otherReason', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          ) : !isClientView && (
            <div className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center">
              待客户在手机APP中选择卡类型后解锁第二步挂失原因确认
            </div>
          )}

          {/* 确认按钮区：如果当前是最后一个需要客户确认的问题，则展示确认按钮 */}
          {showConfirmButton && (
            <div className="pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              {isConfirmed ? (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium flex items-center justify-center space-x-1.5 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>已采纳发送 · 挂失填报信息已同步至坐席工作台</span>
                </div>
              ) : isClientView ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleConfirmLossStep1}
                    disabled={!canSubmit}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                      canSubmit
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check size={14} />
                    <span>{canSubmit ? '确认并提交挂失信息' : '请勾选挂失原因后点击确认'}</span>
                  </button>
                  <div className="text-center text-[10px] text-slate-400">
                    点击确认后，将向坐席发送挂失填报清单并进入下一步
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                    <span>挂失卡片已发送至客户APP · 等待客户勾选填报</span>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================ 挂失业务：步骤 2: 选择挂失渠道 ============================
  if (cardType === 'LOSS_STEP_2_CARD') {
    const selectedChannel = cardData?.channel || '';
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">挂失业务 · 选择挂失办理渠道</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 渠道已确认' : isClientView ? '请选择办理渠道' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">挂失卡种：</span>
              <span className="font-semibold text-slate-800">{cardData?.cardType || '储蓄卡（借记卡）'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">挂失原因：</span>
              <span className="font-semibold text-blue-600">{cardData?.lossReason || '不慎遗失'}</span>
            </div>
          </div>

          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>请选择您偏好的挂失办理渠道</span>
              {!selectedChannel && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请单选' : '待客户在APP中单选'}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {[
                { id: 'c1', title: '手机银行APP自助挂失', desc: '推荐 · 随时随地线上即时生效，免去奔波' },
                { id: 'c2', title: '电话致电客服挂失（955xx）', desc: '24小时语音人工热线，紧急止付' },
                { id: 'c3', title: '营业网点柜台人工办理', desc: '持本人有效身份证至网点柜面直接挂失补卡' }
              ].map((opt) => {
                const checked = selectedChannel === opt.title;
                return (
                  <div
                    key={opt.id}
                    onClick={() => isClientView && !isConfirmed && handleSelectRadio('channel', opt.title)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      !isClientView || isConfirmed ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      checked 
                        ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300' 
                        : isClientView
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <span className={`text-[11px] leading-tight ${checked ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
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

          <div className="pt-1 border-t border-slate-100">
            {isConfirmed ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium flex items-center justify-center space-x-1.5 text-xs">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>已采纳发送 · 挂失渠道已确认并通知坐席</span>
              </div>
            ) : isClientView ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleConfirmLossStep2(selectedChannel || '手机银行APP自助挂失')}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认办理途径</span>
                </button>
                <div className="text-center text-[10px] text-slate-400">
                  点击确认后，坐席将为您提供该渠道的详细指引与注意事项
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-medium">
                  <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                  <span>挂失渠道选择卡片已发送 · 等待客户选择</span>
                </div>
                <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================ 挂失业务：步骤 3: 办理指引与注意事项 ============================
  if (cardType === 'LOSS_STEP_3_CARD') {
    const channel = cardData?.channel || '手机银行';
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">挂失业务 · 办理指引与注意事项</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
            ✓ 已采纳发送
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100 text-[11px]">
            <span className="text-slate-500">当前选择办理渠道:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {channel}
            </span>
          </div>

          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-950 leading-relaxed space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center space-x-1">
              <CheckCircle2 size={13} className="text-blue-600" />
              <span>{channel}挂失核心操作指引</span>
            </div>
            {channel === '手机银行' && (
              <>
                <div><strong>1. 登录路径：</strong>打开手机银行APP，点击【我的/全部】-【账户挂失/安全锁】；</div>
                <div><strong>2. 提交挂失：</strong>选择需挂失的银行卡，点击“临时挂失”，实时生效（有效期一般5-15天）；</div>
                <div><strong>3. 正式补卡：</strong>临时挂失期间请及时前往网点办理正式挂失与换领新卡。</div>
              </>
            )}
            {channel === '电话银行' && (
              <>
                <div><strong>1. 拨打电话：</strong>拨打24小时客户服务热线 955xx；</div>
                <div><strong>2. 转接人工：</strong>根据语音提示转人工服务或自助语音挂失通道；</div>
                <div><strong>3. 验证即时生效：</strong>提供卡号及身份信息核验后即时冻结止付。</div>
              </>
            )}
            {channel === '银行柜面' && (
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

          <div className="pt-1 border-t border-slate-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
              <span>办理指引已送达客户 · 流程已推进至下一步</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================ 挂失业务：步骤 4: 后续处理与安全提醒 ============================
  if (cardType === 'LOSS_STEP_4_CARD') {
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <ShieldCheck size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">挂失业务 · 后续处理与安全提醒</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'}`}>
            {isConfirmed ? '✓ 已采纳发送' : isClientView ? '请确认须知' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            <div className="font-bold flex items-center space-x-1 text-emerald-800 mb-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>挂失后资金与资产安全保障</span>
            </div>
            <div>· 挂失生效后，盗刷风险即刻阻断，原卡内资金安全无虞；</div>
            <div>· 补办新卡后，原账户余额、定期存款及理财资产自动平移至新卡。</div>
          </div>

          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1">
              后续跟进与解绑提醒
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1.5 leading-relaxed">
              <div>1. <strong>补卡网点：</strong>建议在临时挂失有效期内前往网点办结正式挂失补卡；</div>
              <div>2. <strong>快捷支付：</strong>新卡启用后，请及时在微信、支付宝等APP中重新绑定新卡；</div>
              <div>3. <strong>自动扣款：</strong>若原卡签约了水电气等代扣业务，需向商户更新签约账号。</div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100">
            {isConfirmed ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center font-medium text-xs flex items-center justify-center space-x-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>已完成确认 · 挂失全流程办理完毕</span>
              </div>
            ) : isClientView ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleConfirmLossStep4}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认已知晓后续提醒</span>
                </button>
                <div className="text-center text-[10px] text-slate-400">
                  点击确认后，全流程办结
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-medium">
                  <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                  <span>后续提醒已发送至客户APP · 等待客户确认</span>
                </div>
                <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================ Wealth Step 1: 引导及风险承受能力测评 ============================
  if (cardType === 'WEALTH_STEP_1_CARD') {
    const isProgressive = cardData?.progressiveQuestionFlow !== false;
    const isConfirmed = !!cardData?.confirmed;

    // Collect current answers
    const currentAnswers: Record<string, string> = {
      ...(cardData?.answers || {})
    };
    WEALTH_RISK_QUESTIONS.forEach(q => {
      if (cardData?.[q.fieldName] && !currentAnswers[q.fieldName]) {
        currentAnswers[q.fieldName] = cardData[q.fieldName];
      }
    });

    const evalResult = calculateRiskEvaluation(currentAnswers);
    const answeredCount = WEALTH_RISK_QUESTIONS.filter(q => !!currentAnswers[q.fieldName]).length;
    const totalQuestions = WEALTH_RISK_QUESTIONS.length;
    const canSubmit = !isConfirmed && answeredCount === totalQuestions;

    const handleSelectQuestion = (fieldName: string, value: string) => {
      if (!isClientView || isConfirmed) return;
      const nextAnswers = {
        ...currentAnswers,
        [fieldName]: value
      };
      const nextEval = calculateRiskEvaluation(nextAnswers);
      chatStore.updateMessageMetadata(messageId, {
        cardData: {
          ...cardData,
          [fieldName]: value,
          answers: nextAnswers,
          totalScore: nextEval.totalScore,
          tierId: nextEval.tierId,
          tierName: nextEval.tierName,
          riskLevel: nextEval.tierName
        }
      });
    };

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <TrendingUp size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">理财业务 · 投资者风险承受能力测评</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800 font-semibold' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 测评已完成' : isClientView ? `作答中 (${answeredCount}/11)` : `待客户作答 (${answeredCount}/11)`}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3">
          {/* 合规要求与等级判定参考注释 (Requirement 2) */}
          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[10px] text-amber-900 leading-relaxed space-y-1">
            <div className="flex items-start space-x-1.5 font-semibold text-amber-950">
              <Info size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span>等级判定参考注释：</span>
            </div>
            <p className="text-amber-800 text-[9.5px] pl-4">
              {RISK_EVALUATION_NOTE}
            </p>
          </div>

          {isConfirmed ? (
            /* 已完成测评结果展示 */
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] block">综合评定风险等级</span>
                    <span className="text-emerald-800 font-bold text-sm">
                      {cardData?.riskLevel || evalResult.tierName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block">测评总得分</span>
                    <span className="text-emerald-700 font-bold text-xs bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      {cardData?.totalScore !== undefined ? `${cardData.totalScore} 分` : `${evalResult.totalScore} 分`}
                    </span>
                  </div>
                </div>
                <div className="text-[10.5px] text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200/50 leading-relaxed">
                  {evalResult.desc}
                </div>
              </div>

              {/* 11道作答结果明细 (可折叠或紧凑展示) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-700 text-[10.5px] flex items-center justify-between">
                  <span>11道风险承受能力问卷作答明细</span>
                  <span className="text-[10px] text-emerald-600 font-medium">全部已确认</span>
                </div>
                <div className="space-y-1.5 pt-1 border-t border-slate-200/80 max-h-56 overflow-y-auto pr-1">
                  {WEALTH_RISK_QUESTIONS.map(q => {
                    const ansVal = currentAnswers[q.fieldName];
                    const matchedOpt = q.options.find(o => o.value === ansVal);
                    return (
                      <div key={q.id} className="text-[10px] bg-white p-1.5 rounded border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-600 truncate max-w-[170px]" title={q.title}>{q.code}. {q.title.replace(/^Q\d+\.\s*/, '')}</span>
                        <span className="text-slate-900 font-medium truncate max-w-[120px] text-right">
                          {matchedOpt ? matchedOpt.label : ansVal || '--'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span>✔ 测评结果已同步至坐席辅助面板</span>
                <span className="text-emerald-600 font-semibold">有效期限 1 年</span>
              </div>
            </div>
          ) : (
            /* 交互作答问卷（11道题渐进式/平铺展示） */
            <div className="space-y-3">
              {/* 顶部进度与实时预估条 */}
              <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-blue-900 font-medium">测评完成进度：<strong>{answeredCount}</strong> / {totalQuestions} 题</span>
                  <span className="text-blue-700 font-semibold">
                    当前积分：<strong>{evalResult.totalScore}</strong> 分 ({evalResult.tierName})
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* 11道题目列表 */}
              <div className="space-y-3">
                {WEALTH_RISK_QUESTIONS.map((q, idx) => {
                  const isUnlocked = isConfirmed || !isProgressive || idx === 0 || !!currentAnswers[WEALTH_RISK_QUESTIONS[idx - 1].fieldName];
                  if (!isUnlocked) return null;

                  const selectedVal = currentAnswers[q.fieldName];

                  return (
                    <div key={q.id} className="animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                        <span className="truncate pr-1">{q.title}</span>
                        {selectedVal ? (
                          <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">✓ 已选</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 flex-shrink-0">{isClientView ? '请选择' : '待作答'}</span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map(opt => {
                          const isChecked = selectedVal === opt.value;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSelectQuestion(q.fieldName, opt.value)}
                              className={`p-2 rounded-xl border transition-all ${
                                isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                              } ${
                                isChecked 
                                  ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-200' 
                                  : 'border-slate-200 bg-slate-50/50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                }`}>
                                  {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </div>
                                <span className="text-[11px] leading-tight font-medium">{opt.label}</span>
                              </div>
                              {opt.desc && (
                                <div className="text-[9.5px] text-slate-500 pl-5.5 mt-0.5">{opt.desc}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 实时预估结果提示 */}
              {answeredCount > 0 && (
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[10px] text-indigo-900 flex items-center justify-between">
                  <span>🎯 实时累计积分与预估评级：</span>
                  <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-indigo-100">
                    {evalResult.totalScore} 分 · {evalResult.tierName}
                  </span>
                </div>
              )}

              {/* 确认提交按钮 */}
              <div className="pt-1">
                {isClientView ? (
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleConfirmWealthStep1}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                      canSubmit 
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check size={14} />
                    <span>
                      {canSubmit 
                        ? `完成风险测评并提交结果（${evalResult.totalScore}分 · ${evalResult.tierName}）` 
                        : `请完成全部11道测评题（已完成 ${answeredCount}/${totalQuestions}）`}
                    </span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                      <span>等待客户作答问卷（已答 {answeredCount}/11 题，预估: {evalResult.tierName}）</span>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================ Wealth Step 2: 投资目标与偏好调研 (6道调研问题) ============================
  if (cardType === 'WEALTH_STEP_2_CARD') {
    const isProgressive = cardData?.progressiveQuestionFlow !== false;
    const selectedUsage = typeof cardData?.fundUsage === 'string' ? cardData.fundUsage : '';
    const otherUsageText = cardData?.otherFundUsage || '';
    const selectedDuration = cardData?.idleDuration || '';
    const selectedYield = cardData?.yieldExpectation || '';
    const selectedDrawdown = cardData?.drawdownTolerance || '';
    const selectedHistory: string[] = Array.isArray(cardData?.historicalProducts) ? cardData.historicalProducts : [];
    const specialConcerns = cardData?.specialConcerns || '';
    const isConfirmed = !!cardData?.confirmed;

    // Progressive visibility for the 6 questions
    const showQ2 = isConfirmed || !isProgressive || !!selectedUsage;
    const showQ3 = isConfirmed || !isProgressive || (showQ2 && !!selectedDuration);
    const showQ4 = isConfirmed || !isProgressive || (showQ3 && !!selectedYield);
    const showQ5 = isConfirmed || !isProgressive || (showQ4 && !!selectedDrawdown);
    const showQ6 = isConfirmed || !isProgressive || (showQ5 && selectedHistory.length > 0);
    const showConfirmButton = isConfirmed || !isProgressive || showQ6;

    const answeredRequiredCount = [
      !!selectedUsage,
      !!selectedDuration,
      !!selectedYield,
      !!selectedDrawdown,
      selectedHistory.length > 0
    ].filter(Boolean).length;

    const canSubmit = !isConfirmed && answeredRequiredCount === 5;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <Coins size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">理财业务 · 投资目标与偏好调研</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isConfirmed ? 'bg-emerald-100 text-emerald-800 font-semibold' : isClientView ? 'bg-blue-100/70 text-blue-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {isConfirmed ? '✓ 偏好已提交' : isClientView ? `作答中 (${answeredRequiredCount}/5必填)` : '待客户填报'}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3">
          <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-200/70 text-[10px] text-blue-900 leading-relaxed flex items-start space-x-1.5">
            <Info size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <span>适当性提示：请如实反馈资金用途、动用时间、收益期望与浮亏容忍度，避免期限错配。</span>
          </div>

          {isConfirmed ? (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">客户投资目标与偏好已确认</span>
                  <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-md">
                    共 6 项已核实
                  </span>
                </div>
                <div className="text-[10px] text-slate-700 pt-1 border-t border-emerald-200/60 space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">1）资金用途：</span>
                    <span className="font-medium text-slate-900 text-right">
                      {selectedUsage}{selectedUsage.includes('其他') && otherUsageText ? `（${otherUsageText}）` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">2）动用时间：</span>
                    <span className="font-medium text-slate-900 text-right">{selectedDuration}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">3）收益期望：</span>
                    <span className="font-medium text-slate-900 text-right">{selectedYield}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">4）浮亏容忍：</span>
                    <span className="font-medium text-slate-900 text-right">{selectedDrawdown}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">5）购买历史：</span>
                    <span className="font-medium text-slate-900 text-right">{selectedHistory.join('、')}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">6）特别关注：</span>
                    <span className="font-medium text-slate-900 text-right">{specialConcerns || '未填写'}</span>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500">
                ✔ 坐席已基于上述 6 项偏好为您匹配合适期限与策略的理财产品
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 1）这笔资金的主要用途是？（单选 + 其他请填写） */}
              <div>
                <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                  <span>{WEALTH_PREFERENCE_QUESTIONS[0].title}</span>
                  {selectedUsage ? (
                    <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">✓ 已选</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 flex-shrink-0">{isClientView ? '单选' : '待选择'}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {WEALTH_PREFERENCE_QUESTIONS[0].options?.map(opt => {
                    const isChecked = selectedUsage === opt.value || selectedUsage === opt.label;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => isClientView && !isConfirmed && handleSelectRadio('fundUsage', opt.value)}
                        className={`p-2 rounded-xl border transition-all ${
                          isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                        } ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-200' 
                            : 'border-slate-200 bg-slate-50/50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                          <span className="text-[11px] leading-tight font-medium">{opt.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedUsage.includes('其他') && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      disabled={!isClientView || isConfirmed}
                      value={otherUsageText}
                      onChange={(e) => handleSelectRadio('otherFundUsage', e.target.value)}
                      placeholder="请填写其他具体资金用途..."
                      className="w-full text-[11px] border border-blue-300 rounded-lg px-2.5 py-1.5 bg-blue-50/30 focus:bg-white focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* 2）这笔资金预计多久内不需要动用？（单选） */}
              {showQ2 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>{WEALTH_PREFERENCE_QUESTIONS[1].title}</span>
                    {selectedDuration ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">✓ 已选</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex-shrink-0">{isClientView ? '单选' : '待选择'}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {WEALTH_PREFERENCE_QUESTIONS[1].options?.map(opt => {
                      const isChecked = selectedDuration === opt.value || selectedDuration === opt.label;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => isClientView && !isConfirmed && handleSelectRadio('idleDuration', opt.value)}
                          className={`p-2 rounded-xl border transition-all ${
                            isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                          } ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-200' 
                              : 'border-slate-200 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <span className="text-[11px] leading-tight font-medium">{opt.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3）您对收益的期望更接近以下哪项？（单选） */}
              {showQ3 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>{WEALTH_PREFERENCE_QUESTIONS[2].title}</span>
                    {selectedYield ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0">✓ 已选</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex-shrink-0">{isClientView ? '单选' : '待选择'}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {WEALTH_PREFERENCE_QUESTIONS[2].options?.map(opt => {
                      const isChecked = selectedYield === opt.value || selectedYield === opt.label;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => isClientView && !isConfirmed && handleSelectRadio('yieldExpectation', opt.value)}
                          className={`p-2 rounded-xl border transition-all ${
                            isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                          } ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-200' 
                              : 'border-slate-200 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <span className="text-[11px] leading-tight font-medium">{opt.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4）如果产品在持有期间出现账面浮亏，您最多能容忍的亏损幅度大约是？（单选） */}
              {showQ4 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>{WEALTH_PREFERENCE_QUESTIONS[3].title}</span>
                    {selectedDrawdown ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0 ml-1">✓ 已选</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex-shrink-0 ml-1">{isClientView ? '单选' : '待选择'}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WEALTH_PREFERENCE_QUESTIONS[3].options?.map(opt => {
                      const isChecked = selectedDrawdown === opt.value || selectedDrawdown === opt.label;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => isClientView && !isConfirmed && handleSelectRadio('drawdownTolerance', opt.value)}
                          className={`p-2 rounded-xl border transition-all ${
                            isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                          } ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-200' 
                              : 'border-slate-200 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isChecked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                            <span className="text-[10.5px] leading-tight font-medium">{opt.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5）您过去购买过以下哪些类型的理财产品？（可多选） */}
              {showQ5 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>{WEALTH_PREFERENCE_QUESTIONS[4].title}</span>
                    {selectedHistory.length > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex-shrink-0 ml-1">✓ 已选{selectedHistory.length}项</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex-shrink-0 ml-1">{isClientView ? '多选' : '待勾选'}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WEALTH_PREFERENCE_QUESTIONS[4].options?.map(opt => {
                      const isChecked = selectedHistory.includes(opt.value) || selectedHistory.includes(opt.label);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => isClientView && !isConfirmed && handleToggleCheckbox('historicalProducts', opt.value)}
                          className={`p-2 rounded-xl border text-left transition-all flex items-center space-x-1.5 ${
                            isClientView ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'
                          } ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-200' 
                              : 'border-slate-200 bg-slate-50/50 text-slate-600'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check size={9} />}
                          </div>
                          <span className="text-[10px] leading-tight">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6）除了收益之外，您对产品还有哪些特别关注的点？（选填） */}
              {showQ6 && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-semibold text-blue-800 text-[11px] mb-1.5 flex items-center justify-between">
                    <span>{WEALTH_PREFERENCE_QUESTIONS[5].title}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">选填</span>
                  </div>
                  <input
                    type="text"
                    disabled={!isClientView || isConfirmed}
                    value={specialConcerns}
                    onChange={(e) => handleSelectRadio('specialConcerns', e.target.value)}
                    placeholder={WEALTH_PREFERENCE_QUESTIONS[5].placeholder || '例如：赎回灵活性、费率、是否可质押等'}
                    className="w-full text-[11px] border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>
              )}

              {/* 提交按钮 */}
              {showConfirmButton && (
                <div className="pt-1">
                  {isClientView ? (
                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={handleConfirmWealthStep2}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                        canSubmit 
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Check size={14} />
                      <span>
                        {canSubmit 
                          ? '确认提交投资偏好并生成匹配方案' 
                          : `请完成前5项必选偏好问题（已完成 ${answeredRequiredCount}/5）`}
                      </span>
                    </button>
                  ) : (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Clock size={13} className="text-blue-500 animate-pulse flex-shrink-0" />
                        <span>等待客户在手机端确认投资目标与偏好 ({answeredRequiredCount}/5)</span>
                      </div>
                      <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-medium">坐席只读</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================ Wealth Step 3: 产品讲解与风险揭示 (支持坐席不同等级卡片配置内容) ============================
  if (cardType === 'WEALTH_STEP_3_CARD') {
    const isConfirmed = !!cardData?.confirmed;
    const allTierConfigs = getCustomWealthTierConfigs();
    const rawTierStr = cardData?.productTier || cardData?.tierName || 'C2 稳健型';
    const matchedTier = allTierConfigs.find(
      t => rawTierStr.includes(t.tierId) || t.tierName === rawTierStr || rawTierStr.includes(t.riskLevel.split(' ')[0])
    ) || allTierConfigs[1] || allTierConfigs[0];

    const tierLabel = cardData?.tierName || cardData?.productTier || matchedTier.tierName;
    const riskLevelStr = cardData?.riskLevel || matchedTier.riskLevel;
    const productName = cardData?.productName || matchedTier.productName;
    const benchmark = cardData?.benchmark || matchedTier.benchmark;
    const duration = cardData?.duration || matchedTier.duration;
    const minAmount = cardData?.minAmount || matchedTier.minAmount || '1 元起购';
    const underlyingAssets = cardData?.underlyingAssets || matchedTier.underlyingAssets;
    const yieldStructure = cardData?.yieldStructure || matchedTier.yieldStructure || '净值型运作，收益随底层资产利息积累及估值变动浮动';
    const worstCaseNotice = cardData?.worstCaseNotice || matchedTier.worstCaseNotice;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <Award size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">理财业务 · 适配产品讲解与合规风险揭示</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 font-semibold">
            {riskLevelStr}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3">
          {/* 产品大卡片 */}
          <div className="p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  {tierLabel} · {riskLevelStr}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-1">{productName}</h4>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] text-slate-400">业绩比较基准</div>
                <div className="text-xs font-extrabold text-blue-600 font-mono">{benchmark}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400">投资周期：</span>
                <span className="font-semibold text-slate-700">{duration}</span>
              </div>
              <div>
                <span className="text-slate-400">起购门槛：</span>
                <span className="font-semibold text-slate-700">{minAmount}</span>
              </div>
            </div>
          </div>

          {/* 投向与结构通俗解释 */}
          <div className="space-y-1.5 text-[11px]">
            <div className="font-semibold text-slate-800 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>资产投向与收益结构说明：</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1 leading-relaxed">
              <div>• <strong>底层投向：</strong>{underlyingAssets}</div>
              <div>• <strong>收益结构：</strong>{yieldStructure}</div>
            </div>
          </div>

          {/* 核心风险揭示与最坏情形（必须揭示） */}
          <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5">
            <div className="flex items-center space-x-1 text-amber-900 font-bold text-[11px]">
              <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
              <span>【最坏情形披露】：本金损失与市场风险警示</span>
            </div>
            <p className="text-[10px] text-amber-950 leading-relaxed">
              {worstCaseNotice}
            </p>
          </div>

          {/* 严禁承诺收益警示印章 */}
          <div className="p-2 bg-red-50/70 border border-red-200 rounded-lg text-[10px] text-red-700 flex items-center justify-between">
            <span className="font-semibold">⚠️ 合规红线：理财非存款，严禁承诺保本保收益</span>
            <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-medium">破刚兑</span>
          </div>

          {/* 客户确认按钮 */}
          {isClientView && (
            <div className="pt-1">
              <button
                type="button"
                disabled={isConfirmed}
                onClick={handleConfirmWealthStep3}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                  isConfirmed 
                    ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer'
                }`}
              >
                <Check size={14} />
                <span>{isConfirmed ? '✓ 已知悉产品要素及最坏情形风险' : '确认已知悉产品要素及最坏情形风险'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================ Wealth Step 4: 确认理解与后续引导 ============================
  if (cardType === 'WEALTH_STEP_4_CARD') {
    const isConfirmed = !!cardData?.confirmed;

    return (
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-md overflow-hidden text-slate-800 text-xs w-full max-w-[340px] my-2 select-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/40 px-3.5 py-2.5 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              <Phone size={12} />
            </div>
            <span className="font-bold text-blue-950 text-xs tracking-tight">理财业务 · 风险确认与持牌顾问预约</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100/80 text-blue-700 font-semibold">
            合规转接
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-3">
          {/* 持牌专属理财顾问名片 */}
          <div className="p-3 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  李
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 text-xs">李雅琪</span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">持牌理财顾问</span>
                  </div>
                  <div className="text-[10px] text-slate-500">总行卓越财富管理中心</div>
                </div>
              </div>
              <a
                href="tel:02195566"
                onClick={(e) => {
                  e.preventDefault();
                  chatStore.sendMessage('system', '【系统通知】已为您呼叫持牌理财顾问专属热线：021-95566 转 8219');
                }}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Phone size={11} />
                <span>拨打咨询</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] space-y-0.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">销售资质编号：</span>
                <span className="font-mono font-medium text-slate-800">AFM202308119</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">服务专线：</span>
                <span className="font-mono font-medium text-blue-600">021-95566 转 8219</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">驻点网点：</span>
                <span className="font-medium text-slate-800">金融街中心旗舰支行财富专区</span>
              </div>
            </div>
          </div>

          {/* 官方手机银行直达通道 */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-[10px]">
            <div className="font-bold text-blue-900 flex items-center space-x-1">
              <Smartphone size={12} className="text-blue-600" />
              <span>官方手机银行安全申购通道</span>
            </div>
            <div className="text-slate-600 leading-relaxed">
              登录手机银行APP → 底部【财富/理财】→ 搜索产品代码【QY90D01】即可直达说明书查阅与认购；支持购买后 24 小时投资冷静期。
            </div>
          </div>

          {/* 重要合规与法律免责声明 */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-slate-500 space-y-1 leading-relaxed">
            <div className="font-semibold text-slate-700">【重要合规与法律免责声明】：</div>
            <div>1. 理财非存款、产品有风险、投资须谨慎，商业银行不承诺保本及最低收益；</div>
            <div>2. 业绩比较基准仅供投资参考，不构成任何收益承诺，产品过往业绩不代表未来表现；</div>
            <div>3. 请务必通过手机银行官方渠道认购，切勿将资金转入任何第三方平台或个人账户。</div>
          </div>

          {/* 办结确认按钮 */}
          {isClientView && (
            <div className="pt-1">
              <button
                type="button"
                disabled={isConfirmed}
                onClick={handleConfirmWealthStep4}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center space-x-1.5 ${
                  isConfirmed 
                    ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer'
                }`}
              >
                <Check size={14} />
                <span>{isConfirmed ? '✓ 已确认理解并办结咨询' : '确认充分理解风险并完成咨询'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
