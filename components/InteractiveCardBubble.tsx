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
  Lock
} from 'lucide-react';
import { chatStore } from '../services/chatStore';

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

    const canSubmit = !isConfirmed && (selectedCardType || selectedChannel || selectedPrompt);

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
            {isConfirmed ? '✓ 客户已填报' : isClientView ? '请填报选项' : '待客户操作'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-3">
          {/* 第一步 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第一步 · 您急用的是哪张卡？</span>
              {!selectedCardType && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
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
          </div>

          {/* 第二步 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第二步 · 您是在哪个渠道操作的？</span>
              {!selectedChannel && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
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

          {/* 第三步 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第三步 · 页面提示的是哪一条？</span>
              {!selectedPrompt && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请勾选' : '待客户在APP中勾选'}
                </span>
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

          {/* 确认提交操作区 - 坐席端不可操作，仅客户APP端可操作 */}
          <div className="pt-1 border-t border-slate-100">
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
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认</span>
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
            {isConfirmed ? '✓ 客户已填报' : isClientView ? '请填报选项' : '待客户操作'}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* 1. 卡类型选择 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第一步 · 需要挂失的卡类型</span>
              {!selectedCardType && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
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
          </div>

          {/* 2. 挂失原因选择 */}
          <div>
            <div className="font-semibold text-blue-700 text-[11px] mb-1.5 flex items-center justify-between">
              <span>第二步 · 确认挂失原因</span>
              {!selectedReason && !isConfirmed && (
                <span className="text-[10px] text-amber-600 font-normal">
                  {isClientView ? '请选择' : '待客户在APP中选择'}
                </span>
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

          {/* 确认按钮区 */}
          <div className="pt-1 border-t border-slate-100">
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
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>确认并提交挂失信息</span>
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

  return null;
};
