import { ProcessDefinition } from './types';

// 1. 银行卡挂失辅助流程 (默认启用，排在前面位置)
const PROC_CARD_LOSS: ProcessDefinition = {
    id: 'proc-card-loss',
    name: '银行卡挂失',
    shortName: '卡片挂失',
    category: '借记卡与账户业务',
    keywords: ['银行卡不小心丢了', '挂失', '丢卡', '丢了', '丢失', '遗失', '被盗', '解挂', '补卡', '卡丢了', '卡掉了', '钱包丢', '卡不见了', '银行卡丢失'],
    description: '辅助坐席高效引导客户完成银行卡紧急口头挂失、渠道分流（手机银行/电话银行/柜面）及后续补换卡全流程',
    version: 'v2.4',
    status: 'PUBLISHED',
    enabled: true,
    updatedAt: '2026-10-10 10:30',
    startNodeId: 'loss-node-1',
    nodes: [
      // 步骤 1
      {
        id: 'loss-node-1',
        stepNumber: 1,
        nodeCode: '01',
        title: '步骤 1: 挂失业务-卡类型与原因确认',
        shortTitle: '卡种与原因确认',
        categoryTag: '信息收集与安抚',
        description: '引导客户核对并确认需要挂失的银行卡类型，收集挂失原因',
        x: 60,
        y: 180,
        requiresClientConfirm: true,
        progressiveQuestionFlow: true,
        showConfirmOnLastQuestionOnly: true,
        defaultNextNodeId: 'loss-node-2',
        components: [
          {
            id: 'c-loss-1-speech',
            type: 'SPEECH',
            title: '坐席推荐开场与安抚话术',
            speechText: '您好，请您先别慌，银行卡丢失或被盗时，保障资金安全是第一位的。我马上协助您办理紧急挂失。\n\n请您在下方卡片中核对并勾选需要挂失的卡类型以及挂失原因，点击确认提交后，我将为您指引最快捷的挂失与后续处理通道。',
            suggestSpeed: '语速平缓温和'
          },
          {
            id: 'c-loss-1-notice',
            type: 'NOTICE',
            title: '防风险操作提示',
            noticeType: 'warning',
            noticeText: '为防范资金被盗刷风险，系统将优先进行紧急止付与口头挂失锁定，后续可根据情况办理正式补换卡。'
          },
          {
            id: 'c-loss-1-cardtype',
            type: 'RADIO',
            title: '确认需要挂失的卡类型',
            fieldName: 'cardType',
            required: true,
            defaultValue: '储蓄卡/借记卡',
            options: [
              { id: 'opt-ct-1', label: '储蓄卡 / 借记卡 (含工资卡)', value: '储蓄卡/借记卡', desc: '活期存款、储蓄理财主要介质' },
              { id: 'opt-ct-2', label: '信用卡 / 贷记卡', value: '信用卡/贷记卡', desc: '支持透支消费与分期业务' }
            ]
          },
          {
            id: 'c-loss-1-reason',
            type: 'CHECKBOX',
            title: '确认挂失原因 (可多选)',
            fieldName: 'reasons',
            required: true,
            dependsOnField: 'cardType',
            allowOther: true,
            otherPlaceholder: '其他挂失原因（客户可自由补充填写）',
            options: [
              { id: 'opt-r-1', label: '银行卡遗失 / 不慎遗忘', value: '银行卡遗失', desc: '在公共场所或家中未找到卡片' },
              { id: 'opt-r-2', label: '疑似被盗 / 丢失钱包', value: '疑似被盗', desc: '随身物品丢失，存在盗刷风险' },
              { id: 'opt-r-3', label: '疑似信息泄露 / 异常扣款', value: '疑似信息泄露', desc: '收到不明短信扣款或验证码' }
            ]
          },
          {
            id: 'c-loss-1-btn',
            type: 'BUTTON',
            title: '客户提交确认按钮',
            buttonText: '确认提交挂失信息并获取渠道指引',
            actionType: 'SUBMIT_CONFIRM',
            showOnLastQuestion: true,
            hintText: '需客户在手机银行APP端点击确认以推进流程'
          }
        ]
      },

      // 步骤 2
      {
        id: 'loss-node-2',
        stepNumber: 2,
        nodeCode: '02',
        title: '步骤 2: 挂失业务-选择挂失办理渠道',
        shortTitle: '挂失渠道分流',
        categoryTag: '条件分支',
        description: '提供手机银行、电话银行、柜面三种渠道选项，根据客户选择智能流转至对应指引节点',
        x: 480,
        y: 180,
        requiresClientConfirm: true,
        branches: [
          {
            id: 'b-loss-mobile',
            sourceOptionId: 'opt-ch-mobile',
            optionValue: '手机银行APP在线挂失',
            conditionLabel: '选择: 手机银行APP',
            targetNodeId: 'loss-node-3-mobile',
            desc: '跳转至手机APP极速挂失指引卡片'
          },
          {
            id: 'b-loss-phone',
            sourceOptionId: 'opt-ch-phone',
            optionValue: '电话银行拨打95566热线挂失',
            conditionLabel: '选择: 电话银行热线',
            targetNodeId: 'loss-node-3-phone',
            desc: '跳转至电话客服热线挂失指引卡片'
          },
          {
            id: 'b-loss-counter',
            sourceOptionId: 'opt-ch-counter',
            optionValue: '银行营业网点柜面办理',
            conditionLabel: '选择: 营业网点柜面',
            targetNodeId: 'loss-node-3-counter',
            desc: '跳转至营业网点正式补换卡指引卡片'
          }
        ],
        defaultNextNodeId: 'loss-node-3-mobile',
        components: [
          {
            id: 'c-loss-2-speech',
            type: 'SPEECH',
            title: '渠道介绍推荐话术',
            speechText: '为保障您的账户资金安全，我行提供三种挂失办理渠道，推荐您优先使用手机银行APP线上办理，仅需1分钟即可极速冻结锁定；如手机不在身边可立即拨打95566电话客服办理，或携带身份证就近前往营业网点。\n\n请在下方卡片中选择您最便捷的挂失渠道：'
          },
          {
            id: 'c-loss-2-notice',
            type: 'NOTICE',
            title: '多渠道特点提示',
            noticeType: 'info',
            noticeText: '手机银行与电话银行挂失属于紧急口头挂失，实时阻断非柜面扣款；柜面办理为正式挂失，支持现场补办新卡。'
          },
          {
            id: 'c-loss-2-channel',
            type: 'RADIO',
            title: '请选择挂失办理渠道 (将流转至不同办理指引)',
            fieldName: 'channel',
            required: true,
            defaultValue: '手机银行APP在线挂失',
            options: [
              { 
                id: 'opt-ch-mobile', 
                label: '手机银行APP在线挂失 (推荐 · 极速冻结)', 
                value: '手机银行APP在线挂失', 
                desc: '无需排队，手机刷脸核验，1分钟内锁定账户并支持在线申请补发卡片',
                targetNodeId: 'loss-node-3-mobile'
              },
              { 
                id: 'opt-ch-phone', 
                label: '电话银行拨打95566热线语音挂失', 
                value: '电话银行拨打95566热线挂失', 
                desc: '适用于手机无法联网或未安装APP时，拨打官方专线由智能语音或人工坐席紧急锁卡',
                targetNodeId: 'loss-node-3-phone'
              },
              { 
                id: 'opt-ch-counter', 
                label: '银行营业网点柜面办理 (正式挂失及即时补卡)', 
                value: '银行营业网点柜面办理', 
                desc: '携带本人有效身份证原件前往全国任一网点，支持现场注销遗失卡并立等领取新卡',
                targetNodeId: 'loss-node-3-counter'
              }
            ]
          },
          {
            id: 'c-loss-2-btn',
            type: 'BUTTON',
            title: '确认渠道按钮',
            buttonText: '确认所选渠道并查看专属办理指引',
            actionType: 'SUBMIT_CONFIRM',
            hintText: '确认后系统将自动下发对应渠道的专属指引流程'
          }
        ]
      },

      // 步骤 3-A (手机银行分支)
      {
        id: 'loss-node-3-mobile',
        stepNumber: 3,
        nodeCode: '03-A',
        title: '步骤 3-A: 挂失指引-手机银行办理指引',
        shortTitle: '手机银行办理指引',
        categoryTag: '线上通道',
        description: '向客户展示手机银行极速挂失路径、所需材料及操作步骤',
        x: 900,
        y: 40,
        requiresClientConfirm: false,
        defaultNextNodeId: 'loss-node-4',
        components: [
          {
            id: 'c-loss-3m-speech',
            type: 'SPEECH',
            title: '手机银行办理推荐话术',
            speechText: '为您匹配【手机银行APP】线上快速挂失指引：请打开手机银行APP，点击首页【账户管理】，选中遗失的卡片后点击【一键安全挂失】。\n\n详细办理路径、所需材料和关键注意事项已在卡片中清晰列出，请您直接查阅办理。'
          },
          {
            id: 'c-loss-3m-guide',
            type: 'GUIDE',
            title: '手机银行挂失操作路径与规范',
            channelName: '手机银行在线挂失',
            pathSteps: [
              '第一步：登录手机银行 APP，首页点击【账户管理】',
              '第二步：在卡片列表中找到需要挂失的银行卡，点击进入详情',
              '第三步：点击【更多设置】或【安全中心】->【一键安全挂失】',
              '第四步：选择“临时挂失”或“永久挂失”，完成刷脸人脸活体认证',
              '第五步：系统提示挂失成功，短信通知发送至预留手机'
            ],
            materials: [
              '本人登录手机银行APP账号及密码',
              '注册手机号接收短信动态验证码',
              '本人人脸识别活体核验'
            ],
            duration: '极速办理，实时生效 (1分钟内完成阻断)',
            notices: [
              '手机银行临时挂失有效期一般为 5 天，期满前请通过APP申请补卡或前往柜面确认',
              '挂失后转出类交易（转账、ATM取款、快捷支付、刷卡消费）立即暂停',
              '支持在线申请【补办新卡并邮寄到家】，大约 3-5 个工作日寄达'
            ]
          },
          {
            id: 'c-loss-3m-btn',
            type: 'BUTTON',
            title: '下一步按钮',
            buttonText: '发送手机挂失指引并进入后续须知',
            actionType: 'NEXT_STEP'
          }
        ]
      },

      // 步骤 3-B (电话银行分支)
      {
        id: 'loss-node-3-phone',
        stepNumber: 3,
        nodeCode: '03-B',
        title: '步骤 3-B: 挂失指引-电话银行客服办理指引',
        shortTitle: '电话客服办理指引',
        categoryTag: '电话通道',
        description: '向客户展示拨打95566热线语音导航与人工挂失流程',
        x: 900,
        y: 280,
        requiresClientConfirm: false,
        defaultNextNodeId: 'loss-node-4',
        components: [
          {
            id: 'c-loss-3p-speech',
            type: 'SPEECH',
            title: '电话银行办理推荐话术',
            speechText: '为您匹配【电话银行】紧急挂失通道：请使用手机拨打官方客服热线 95566，根据语音提示按 1 选择普通话，随后按 2 直接进入“紧急挂失绿色通道”，核对身份证号后即可快速办理。\n\n操作指引与注意事项已列于卡片中：'
          },
          {
            id: 'c-loss-3p-guide',
            type: 'GUIDE',
            title: '电话客服热线挂失指引',
            channelName: '电话银行拨打 95566',
            pathSteps: [
              '第一步：拨打官方客服统一服务热线 95566',
              '第二步：听取欢迎语后，按【1】键选择中文普通话服务',
              '第三步：按【2】键直接进入“紧急挂失绿色通道”',
              '第四步：根据IVR语音提示输入身份证号及查询密码，或按 0 转接人工坐席',
              '第五步：客服人员核实身份信息无误后，立即执行账户挂失止付'
            ],
            materials: [
              '持卡人身份证号码',
              '需要挂失的银行卡卡号 (若遗忘可由客服根据身份证号查询名下卡片)',
              '开户预留手机号码及电话密码'
            ],
            duration: '拨通后 2-3 分钟内完成紧急挂失',
            notices: [
              '电话口头挂失为紧急保护措施，有效期为 5 个自然日',
              '为确保账户长期安全，请在 5 日内携带有效身份证件至柜面或通过手机银行确认',
              '若超时未确认，口头挂失将自动解除，请务必关注时效'
            ]
          },
          {
            id: 'c-loss-3p-btn',
            type: 'BUTTON',
            title: '下一步按钮',
            buttonText: '发送电话挂失指引并进入后续须知',
            actionType: 'NEXT_STEP'
          }
        ]
      },

      // 步骤 3-C (银行柜面分支)
      {
        id: 'loss-node-3-counter',
        stepNumber: 3,
        nodeCode: '03-C',
        title: '步骤 3-C: 挂失指引-银行营业网点柜面办理指引',
        shortTitle: '柜面现场办理指引',
        categoryTag: '线下通道',
        description: '向客户展示携带身份证前往营业网点办理正式挂失与即时补卡的指引',
        x: 900,
        y: 520,
        requiresClientConfirm: false,
        defaultNextNodeId: 'loss-node-4',
        components: [
          {
            id: 'c-loss-3c-speech',
            type: 'SPEECH',
            title: '营业网点柜面办理推荐话术',
            speechText: '为您匹配【银行营业网点】柜面办理指引：您可携带本人有效身份证原件，前往全国任一营业网点办理“正式挂失与补卡”业务。\n\n柜面办理属于正式挂失，永久锁定且支持现场申领新卡。网点所需材料与办理流程如下：'
          },
          {
            id: 'c-loss-3c-guide',
            type: 'GUIDE',
            title: '营业网点柜面挂失及补换卡指引',
            channelName: '全国任一营业网点柜面',
            pathSteps: [
              '第一步：携带本人有效二代身份证原件前往就近营业网点',
              '第二步：取号机取号选择“个人挂失及补换卡业务”，或大堂智能柜员机办理',
              '第三步：柜台出示身份证件，工作人员核验身份并调取名下卡片信息',
              '第四步：填写/确认《挂失申请书》并签字确认',
              '第五步：选择现场即时补发新卡 (换号) 或预约补发原卡号 (换卡不换号)'
            ],
            materials: [
              '本人有效二代居民身份证原件 (不可使用复印件)',
              '银行预留手机号 (现场接收验证短信)',
              '如委托他人代理，需携带代理人及持卡人双人身份证原件及公证授权委托书'
            ],
            duration: '现场柜面办理约 10-15 分钟',
            notices: [
              '柜面挂失为正式挂失，永久有效，不设有效期限制',
              '现场即时补卡：卡号随机变更，卡内资金与定期理财即时平移至新卡',
              '换卡不换号：卡号保持不变，需等待约 3-5 个工作日制卡完成后到店领取'
            ]
          },
          {
            id: 'c-loss-3c-btn',
            type: 'BUTTON',
            title: '下一步按钮',
            buttonText: '发送柜面挂失指引并进入后续须知',
            actionType: 'NEXT_STEP'
          }
        ]
      },

      // 步骤 4 (汇聚汇流节点)
      {
        id: 'loss-node-4',
        stepNumber: 4,
        nodeCode: '04',
        title: '步骤 4: 挂失业务-挂失后注意事项与后续处理',
        shortTitle: '后续注意事项与处理',
        categoryTag: '办结善后与安全保障',
        description: '提醒客户挂失后的资金核对、三方绑定解约、解挂与补卡安排等全流程善后事宜',
        x: 1320,
        y: 280,
        requiresClientConfirm: false,
        components: [
          {
            id: 'c-loss-4-speech',
            type: 'SPEECH',
            title: '后续事项提醒推荐话术',
            speechText: '挂失成功后，为您整理了以下重要提醒事项：\n\n1. 请及时登录手机银行核对近期账单明细，如有异常盗刷交易请立即联系客服登记止付；\n2. 微信、支付宝、云闪付等第三方快捷支付以及房贷/水电自动代扣协议，在换领新卡后需重新绑定；\n3. 若挂失后找回卡片且未办理补卡，可持身份证及卡片至网点办理解除挂失。请妥善保存指引！'
          },
          {
            id: 'c-loss-4-notice',
            type: 'NOTICE',
            title: '全流程善后安全提示',
            noticeType: 'success',
            noticeText: '挂失生效后，您的资金已受到全面保护。后续如有任何疑问，可随时联系在线客服或致电 95566 服务热线。'
          },
          {
            id: 'c-loss-4-guide',
            type: 'GUIDE',
            title: '挂失后关键操作与处理清单',
            channelName: '挂失后续处理总览',
            pathSteps: [
              '一、资金安全核查：登录手机银行【明细查询】，逐笔核对近7日交易',
              '二、签约关系重签：原卡绑定的水电代扣、微信/支付宝快捷支付、房贷还款卡需在补卡后更新',
              '三、新卡激活与启用：收到新卡后，通过手机银行APP或网点ATM完成激活并设置新密码',
              '四、旧卡找回处理：如在办理补卡前找回原卡，可持身份证原件与原卡前往网点办理解除挂失'
            ],
            materials: [
              '新卡启用：本人身份证 + 新银行卡',
              '解挂业务：必须持卡人本人亲自携带有效身份证原件及原卡前往柜面'
            ],
            duration: '全天候保障',
            notices: [
              '切勿向任何人透露银行卡密码、短信验证码或网银U盾密码',
              '银行客服人员绝不会索要短信验证码或要求向所谓“安全账户”转账',
              '若原卡确认永久遗失，建议剪角作废，避免磁条芯片信息外泄'
            ]
          },
          {
            id: 'c-loss-4-btn',
            type: 'BUTTON',
            title: '办结按钮',
            buttonText: '完成挂失辅助流程并结束指引',
            actionType: 'FINISH_FLOW'
          }
        ]
      }
    ]
};

// 3. 个人账户非柜面限制辅助流程 (默认停用状态，停用状态下不会在聊天中触发)
const PROC_FEIGUIMIAN: ProcessDefinition = {
    id: 'proc-feiguimian',
    name: '个人账户非柜面限制',
    shortName: '非柜面限制',
    category: '借记卡与账户业务',
    keywords: ['卡不能用了', '无法转账', '非柜面', '限制非柜面', '限额', '转账不了', '9901', '冻结', '暂停业务'],
    description: '针对客户触发反诈风控或长期未动账导致的非柜面交易受限，辅助坐席引导客户快速定性排查、选择线上或网点解控方案',
    version: 'v2.2',
    status: 'PUBLISHED',
    enabled: false,
    updatedAt: '2026-10-10 09:15',
    startNodeId: 'fgm-node-1',
    nodes: [
      // 步骤 1
      {
        id: 'fgm-node-1',
        stepNumber: 1,
        nodeCode: '01',
        title: '步骤 1: 非柜面限制-问题定位与定性',
        shortTitle: '问题定位与定性',
        categoryTag: '故障定性',
        description: '引导客户发起小额测试转账，采集报错代码与受限渠道，精准判断受限类型',
        x: 60,
        y: 200,
        requiresClientConfirm: true,
        progressiveQuestionFlow: true,
        showConfirmOnLastQuestionOnly: true,
        defaultNextNodeId: 'fgm-node-2',
        components: [
          {
            id: 'c-fgm-1-speech',
            type: 'SPEECH',
            title: '坐席推荐开场排查话术',
            speechText: '您好，请您先别着急，账户受限通常是系统为了保障您的资金安全触发的保护性风控机制，我马上协助您排查定位。\n\n建议您打开手机银行尝试发起一笔 1 元的小额测试转账，查看系统弹出的具体错误提示。您可以直接在发送给您的卡片中勾选反馈给我，我将为您匹配最快的一对一解控方案。'
          },
          {
            id: 'c-fgm-1-notice',
            type: 'NOTICE',
            title: '第三方报错准确性警示',
            noticeType: 'warning',
            noticeText: '以手机银行系统弹窗提示为准，第三方平台(微信/支付宝/云闪付)报错不一定准确，请优先在手机银行查看具体错误码。'
          },
          {
            id: 'c-fgm-1-cardtype',
            type: 'RADIO',
            title: '账户受限卡类型',
            fieldName: 'cardType',
            required: true,
            defaultValue: '借记卡/储蓄卡',
            options: [
              { id: 'opt-f-ct1', label: '借记卡 / 储蓄卡 (含工资卡/理财卡)', value: '借记卡/储蓄卡', desc: '用于个人日常存储转账' },
              { id: 'opt-f-ct2', label: '信用卡 / 贷记卡', value: '信用卡/贷记卡', desc: '透支及信用消费业务' }
            ]
          },
          {
            id: 'c-fgm-1-channel',
            type: 'RADIO',
            title: '受限业务渠道',
            fieldName: 'channel',
            required: true,
            dependsOnField: 'cardType',
            defaultValue: '手机银行转账',
            options: [
              { id: 'opt-f-ch1', label: '手机银行转账汇款受阻', value: '手机银行转账' },
              { id: 'opt-f-ch2', label: '微信 / 支付宝快捷支付被拒', value: '快捷支付' },
              { id: 'opt-f-ch3', label: 'ATM 取款或 POS 机刷卡消费失败', value: 'ATM/POS' }
            ]
          },
          {
            id: 'c-fgm-1-prompt',
            type: 'RADIO',
            title: '手机银行弹窗系统报错提示',
            fieldName: 'prompt',
            required: true,
            dependsOnField: 'channel',
            defaultValue: '限制非柜面渠道交易 (9901)',
            options: [
              { id: 'opt-f-pr1', label: '限制非柜面渠道交易 (错误码 9901)', value: '限制非柜面渠道交易 (9901)', desc: '触发系统反诈智能风控保护' },
              { id: 'opt-f-pr2', label: '超出单日累计交易限额', value: '超出单日累计交易限额', desc: '达到II类账户或手机网银限额' },
              { id: 'opt-f-pr3', label: '账户异常，已触发保护性止付', value: '账户异常已临时保护', desc: '多设备登录或异地突发交易' }
            ]
          },
          {
            id: 'c-fgm-1-btn',
            type: 'BUTTON',
            title: '提交定位信息按钮',
            buttonText: '确认反馈排查信息并获取原因方案',
            actionType: 'SUBMIT_CONFIRM',
            showOnLastQuestion: true,
            hintText: '客户提交后坐席端将自动收到报错归类'
          }
        ]
      },

      // 步骤 2
      {
        id: 'fgm-node-2',
        stepNumber: 2,
        nodeCode: '02',
        title: '步骤 2: 非柜面限制-渠道选择与方案',
        shortTitle: '渠道选择与方案',
        categoryTag: '渠道分流',
        description: '解释受限原因与资金安全，提供线上自助办理解控与网点柜面办理分支',
        x: 480,
        y: 200,
        requiresClientConfirm: true,
        branches: [
          {
            id: 'b-fgm-online',
            sourceOptionId: 'opt-fgm-online',
            optionValue: '手机银行线上自助办理解除 (推荐/即时办理)',
            conditionLabel: '选择: 手机银行线上自助',
            targetNodeId: 'fgm-node-3-online',
            desc: '跳转至线上刷脸解控办理指引'
          },
          {
            id: 'b-fgm-counter',
            sourceOptionId: 'opt-fgm-counter',
            optionValue: '携带有效证件前往营业网点办理',
            conditionLabel: '选择: 营业网点柜面办理',
            targetNodeId: 'fgm-node-3-counter',
            desc: '跳转至网点解控预约与材料指引'
          }
        ],
        defaultNextNodeId: 'fgm-node-3-online',
        components: [
          {
            id: 'c-fgm-2-speech',
            type: 'SPEECH',
            title: '原因解释与安抚话术',
            speechText: '经系统核验，您的账户当前属于“非柜面渠道交易受限”状态。该情况多因近期交易特征触发反诈智能风控保护、长期未动账或留存身份信息需更新所致。\n\n请放心，暂停的仅为该卡的转出类业务（转账/线上付款），账户资金安全无虞，手机银行仍可正常登录查询。解除后即可实时恢复正常使用。目前支持线上自助与网点两种途径，具体指引已列入下方卡片供您选择。'
          },
          {
            id: 'c-fgm-2-notice',
            type: 'NOTICE',
            title: '核心资金安全提示',
            noticeType: 'info',
            noticeText: '暂停的仅为该卡的转出类业务（转账/线上付款），账户资金安全无虞，手机银行仍可正常登录查询。'
          },
          {
            id: 'c-fgm-2-route',
            type: 'RADIO',
            title: '解除限制办理渠道偏好',
            fieldName: 'route',
            required: true,
            defaultValue: '手机银行线上自助办理解除 (推荐/即时办理)',
            options: [
              {
                id: 'opt-fgm-online',
                label: '手机银行线上自助办理解除 (推荐 · 即时办理)',
                value: '手机银行线上自助办理解除 (推荐/即时办理)',
                desc: '足不出户，手机完成身份认证、人脸识别活体核验，最快1-3分钟内解除恢复',
                targetNodeId: 'fgm-node-3-online'
              },
              {
                id: 'opt-fgm-counter',
                label: '携带有效证件前往营业网点办理',
                value: '携带有效证件前往营业网点办理',
                desc: '如线上核验未通过或证件已过期，需携带身份证原件前往任一营业网点柜台核办',
                targetNodeId: 'fgm-node-3-counter'
              }
            ]
          },
          {
            id: 'c-fgm-2-btn',
            type: 'BUTTON',
            title: '确认选择渠道按钮',
            buttonText: '确认办理渠道并查看操作指引',
            actionType: 'SUBMIT_CONFIRM'
          }
        ]
      },

      // 步骤 3-A (线上自助分支)
      {
        id: 'fgm-node-3-online',
        stepNumber: 3,
        nodeCode: '03-A',
        title: '步骤 3-A: 办理指引-手机银行线上自助解控',
        shortTitle: '线上自助解控指引',
        categoryTag: '线上通道',
        description: '提供手机银行APP自助核验解控路径、所需认证材料及操作步骤',
        x: 900,
        y: 80,
        requiresClientConfirm: false,
        defaultNextNodeId: 'fgm-node-4',
        components: [
          {
            id: 'c-fgm-3o-speech',
            type: 'SPEECH',
            title: '线上解控指引推荐话术',
            speechText: '好的，已为您匹配对应渠道的操作流程与办理须知。\n\n推荐您优先在手机银行APP上自助办理解控，免去排队往返。办理入口、所需材料与详细流程已呈列在下方卡片中供您查阅。'
          },
          {
            id: 'c-fgm-3o-guide',
            type: 'GUIDE',
            title: '手机银行自助办理解控流程',
            channelName: '手机银行APP自助通道',
            pathSteps: [
              '第一步：登录手机银行APP，点击右下角【我的】',
              '第二步：进入【安全中心】或直接在首页搜索栏输入【非柜面解控】',
              '第三步：进入【账户状态与风险解控】功能，选择受限的银行卡',
              '第四步：根据屏幕指引上传二代身份证正反面照片更新证件信息',
              '第五步：按系统提示完成【人脸活体识别】与预留手机短信验证码核对',
              '第六步：提交系统风控复核，审核通过后交易限制立即解除'
            ],
            materials: [
              '本人有效二代居民身份证原件 (在有效期内)',
              '开户预留手机接收短信动态验证码',
              '本人在光线充足环境下完成人脸识别活体核验'
            ],
            duration: '提交后系统智能审批，最快 1-3 分钟内完成',
            notices: [
              '请确保手机银行版本为最新版本，避免旧版本功能异常',
              '若人脸核验超过3次未通过，为保障安全系统将建议前往线下网点办理',
              '解控成功后建议立即发起一笔小额转账进行验证'
            ]
          },
          {
            id: 'c-fgm-3o-btn',
            type: 'BUTTON',
            title: '下一步按钮',
            buttonText: '发送线上解控指引并进入生效须知',
            actionType: 'NEXT_STEP'
          }
        ]
      },

      // 步骤 3-B (网点柜面分支)
      {
        id: 'fgm-node-3-counter',
        stepNumber: 3,
        nodeCode: '03-B',
        title: '步骤 3-B: 办理指引-营业网点柜面办理',
        shortTitle: '网点柜面解控指引',
        categoryTag: '线下通道',
        description: '提供网点预约、携带证件及可能需要的辅助资产证明材料指引',
        x: 900,
        y: 360,
        requiresClientConfirm: false,
        defaultNextNodeId: 'fgm-node-4',
        components: [
          {
            id: 'c-fgm-3c-speech',
            type: 'SPEECH',
            title: '营业网点柜面解控推荐话术',
            speechText: '为您匹配【营业网点柜面】办理解控指引：您可携带本人有效身份证原件及受限银行卡，前往全国任一营业网点柜台办理。\n\n如受限原因涉及电信反诈模型预警，可能需现场出具工作证明或合理资金流水说明，具体清单已列入卡片：'
          },
          {
            id: 'c-fgm-3c-guide',
            type: 'GUIDE',
            title: '营业网点柜面核办流程与所需材料',
            channelName: '全国任一营业网点智慧柜员机或人工窗口',
            pathSteps: [
              '第一步：携带本人有效二代身份证原件及受限银行卡',
              '第二步：通过手机银行或公众号提前预约就近网点排队号',
              '第三步：到达网点后，告知大堂经理办理“非柜面限制解除及尽职调查”',
              '第四步：配合工作人员核验手机号实名制、人脸信息并签字确认承诺书',
              '第五步：柜面工作人员现场解控，并可同步提升每日转账限额'
            ],
            materials: [
              '本人有效二代身份证原件',
              '受限银行卡实体卡 (或出示手机银行电子卡包)',
              '银行卡预留手机号实名认证凭证 (如运营商APP个人资料页)',
              '如为涉案涉诈重点账户解控，需提供近期工作证明、收入证明或合理流水佐证'
            ],
            duration: '现场办理约 10-20 分钟',
            notices: [
              '营业网点支持跨省异地通办，无需必须返回开户行所在地网点',
              '建议在工作日 9:00 - 17:00 期间前往办理，避免周末部分后台审核接口维护'
            ]
          },
          {
            id: 'c-fgm-3c-btn',
            type: 'BUTTON',
            title: '下一步按钮',
            buttonText: '发送网点解控指引并进入生效须知',
            actionType: 'NEXT_STEP'
          }
        ]
      },

      // 步骤 4
      {
        id: 'fgm-node-4',
        stepNumber: 4,
        nodeCode: '04',
        title: '步骤 4: 非柜面限制-生效时间及注意事项',
        shortTitle: '生效时间及注意事项',
        categoryTag: '安全合规与办结',
        description: '告知客户解控后的实时生效规则、安全规范用卡须知与证件过期预防',
        x: 1320,
        y: 200,
        requiresClientConfirm: false,
        components: [
          {
            id: 'c-fgm-4-speech',
            type: 'SPEECH',
            title: '生效时间及安全规范话术',
            speechText: '已为您整理非柜面解控后的生效规则及账户安全使用须知：\n\n手机银行自助核验成功后，转账与支付额度将实时恢复生效；后续请务必注意规范用卡，切勿出租、出借或出售银行账户，并建议及时在手机银行中更新身份证有效期。祝您生活愉快，如有任何疑问随时联系！'
          },
          {
            id: 'c-fgm-4-notice',
            type: 'NOTICE',
            title: '合规用卡法律警示',
            noticeType: 'warning',
            noticeText: '根据断卡行动反电信网络诈骗法要求，任何个人出租、出借、出售银行账户均属违法行为，将面临惩戒与征信影响。'
          },
          {
            id: 'c-fgm-4-guide',
            type: 'GUIDE',
            title: '生效时间与日常账户维护要点',
            channelName: '解控生效规则与安全提示',
            pathSteps: [
              '1. 生效时效：线上自助核验通过或柜面办结后，转账功能即时恢复生效',
              '2. 验证建议：建议立即尝试使用手机银行向本人他行卡转账 1 元进行确认',
              '3. 证件更新：若因身份证到期导致受限，请在手机银行【我的-个人信息】及时更新有效期',
              '4. 账户防沉睡：建议定期保持账户小额动账，避免长时间不使用再次转入睡眠状态'
            ],
            materials: [
              '合规防范：本人规范使用，切勿协助他人资金过桥',
              '反诈防范：陌生转账先核实，不轻信假冒公检法及虚假投资平台'
            ],
            duration: '即时生效',
            notices: [
              '非柜面限额：单日转账额度受账户等级限制，如需大额转账可通过大额调额流程办理',
              '如后续再次受限，可随时联系在线客服或拨打 95566 排查'
            ]
          },
          {
            id: 'c-fgm-4-btn',
            type: 'BUTTON',
            title: '办结按钮',
            buttonText: '完成非柜面限制辅助流程',
            actionType: 'FINISH_FLOW'
          }
        ]
      }
    ]
};

// 2. 理财产品咨询辅助流程 (默认启用，排在前面位置)
const PROC_WEALTH_MANAGE: ProcessDefinition = {
    id: 'proc-wealth-manage',
    name: '理财产品咨询',
    shortName: '理财产品咨询',
    category: '财富管理与投资业务',
    keywords: ['理财', '投资', '理财产品', '买理财', '理财推荐', '理财收益', '稳健理财', '基金', '资产配置', '存款还是理财', '理财咨询'],
    description: '依据商业银行理财销售适当性管理规范，引导客户完成11道合规风险测评、探查资金用途与期望期限等6项投资偏好、支持坐席按不同风险等级配置并切换发送匹配产品与最坏情形风险揭示，并合规对接持牌理财顾问与申购通道',
    version: 'v2.0',
    status: 'PUBLISHED',
    enabled: true,
    updatedAt: '2026-10-21 11:00',
    startNodeId: 'wealth-node-1',
    nodes: [
      // 步骤 1: 引导及风险测评
      {
        id: 'wealth-node-1',
        stepNumber: 1,
        nodeCode: '01',
        title: '步骤 1: 理财咨询-引导及风险测评',
        shortTitle: '引导及风险测评',
        categoryTag: '适当性风险评测',
        description: '合规引导客户完成风险承受能力测评，通过11道专业问卷评定客户风险等级（C1谨慎型~C5激进型）',
        x: 60,
        y: 200,
        requiresClientConfirm: true,
        progressiveQuestionFlow: true,
        showConfirmOnLastQuestionOnly: true,
        defaultNextNodeId: 'wealth-node-2',
        components: [
          {
            id: 'c-wm-1-speech',
            type: 'SPEECH',
            title: '坐席推荐开场引导与测评话术',
            speechText: '您好！非常高兴为您提供理财咨询服务。在向您推荐具体的理财产品前，根据《商业银行理财业务监督管理办法》和投资者适当性管理要求，需要先为您进行快速风险承受能力测评。\n\n请您在下方卡片中如实作答测评问卷，真实客观的回答能帮助我们为您精准匹配合适风险等级的产品，保障您的资金安全。'
          },
          {
            id: 'c-wm-1-notice',
            type: 'NOTICE',
            title: '合规提示与等级判定参考注释',
            noticeType: 'warning',
            noticeText: '合规提示：理财非存款，投资须谨慎。等级判定参考：总分对应C1—C5，具体分值区间以所在机构的适当性制度为准。常见区间如：C1谨慎型（可接受低风险，本金损失概率低）、C2稳健型（可接受中低风险）、C3平衡型（可接受中等风险）、C4进取型（可接受中高风险）、C5激进型（可接受高风险）。'
          },
          {
            id: 'c-wm-1-q1',
            type: 'RADIO',
            title: 'Q1. 您的年龄是？',
            fieldName: 'q1_age',
            required: true,
            defaultValue: '25—50岁',
            options: [
              { id: 'opt-q1-1', label: 'A. 18—24岁（-2）', value: '18—24岁', desc: '青年起步期，抗风险经验需积累' },
              { id: 'opt-q1-2', label: 'B. 25—50岁（0）', value: '25—50岁', desc: '黄金工作期，收入现金流稳定' },
              { id: 'opt-q1-3', label: 'C. 51—60岁（-2）', value: '51—60岁', desc: '临近退休期，注重资金稳健与流动性' },
              { id: 'opt-q1-4', label: 'D. 61—64岁（-3）', value: '61—64岁', desc: '退休初期，以保本低波动为主' },
              { id: 'opt-q1-5', label: 'E. 65岁及以上（-10）', value: '65岁及以上', desc: '高龄投资者，法定重点保护对象' }
            ]
          },
          {
            id: 'c-wm-1-q2',
            type: 'RADIO',
            title: 'Q2. 您的家庭总资产净值约为（不含自用住宅，扣除未结清贷款及信用卡账单等债务）？',
            fieldName: 'q2_net_asset',
            required: true,
            dependsOnField: 'q1_age',
            defaultValue: '50万—100万元',
            options: [
              { id: 'opt-q2-1', label: 'A. 15万元及以下（0）', value: '15万元及以下', desc: '基础家庭资产储备' },
              { id: 'opt-q2-2', label: 'B. 15万—50万元（2）', value: '15万—50万元', desc: '大众富裕起步客群' },
              { id: 'opt-q2-3', label: 'C. 50万—100万元（6）', value: '50万—100万元', desc: '中等富裕家庭净资产' },
              { id: 'opt-q2-4', label: 'D. 100万—1000万元（8）', value: '100万—1000万元', desc: '高净值成长客户' },
              { id: 'opt-q2-5', label: 'E. 1000万元以上（10）', value: '1000万元以上', desc: '私行级超高净值客户' }
            ]
          },
          {
            id: 'c-wm-1-q3',
            type: 'RADIO',
            title: 'Q3. 在家庭总资产中，可用于金融投资（储蓄存款除外）的比例约为？',
            fieldName: 'q3_invest_ratio',
            required: true,
            dependsOnField: 'q2_net_asset',
            defaultValue: '25%—50%',
            options: [
              { id: 'opt-q3-1', label: 'A. 小于10%（2）', value: '小于10%', desc: '极度谨慎，以存款储备为主' },
              { id: 'opt-q3-2', label: 'B. 10%—25%（4）', value: '10%—25%', desc: '适度闲钱尝试理财投资' },
              { id: 'opt-q3-3', label: 'C. 25%—50%（8）', value: '25%—50%', desc: '较合理多元资产配置比例' },
              { id: 'opt-q3-4', label: 'D. 大于50%（10）', value: '大于50%', desc: '金融资产为主，投资参与度高' }
            ]
          },
          {
            id: 'c-wm-1-q4',
            type: 'RADIO',
            title: 'Q4. 以下哪项最能说明您的投资经验？',
            fieldName: 'q4_exp_type',
            required: true,
            dependsOnField: 'q3_invest_ratio',
            defaultValue: '资产较均衡地分布于存款、理财、信托、股票、基金等',
            options: [
              { id: 'opt-q4-1', label: 'A. 除存款、国债外，几乎不投资其他金融产品（0）', value: '除存款、国债外，几乎不投资其他金融产品', desc: '基础保守型经验' },
              { id: 'opt-q4-2', label: 'B. 大部分为存款、国债，较少涉及股票、权益类基金等（2）', value: '大部分为存款、国债，较少涉及股票、权益类基金等', desc: '稳健型入门经验' },
              { id: 'opt-q4-3', label: 'C. 资产较均衡地分布于存款、理财、信托、股票、基金等（6）', value: '资产较均衡地分布于存款、理财、信托、股票、基金等', desc: '均衡多元投资经验' },
              { id: 'opt-q4-4', label: 'D. 大部分投资于股票、权益类基金、外汇等高风险产品（10）', value: '大部分投资于股票、权益类基金、外汇等高风险产品', desc: '成熟高风险投资经验' }
            ]
          },
          {
            id: 'c-wm-1-q5',
            type: 'RADIO',
            title: 'Q5. 您有多少年投资股票、基金、外汇、金融衍生品等风险投资品的经验？',
            fieldName: 'q5_exp_years',
            required: true,
            dependsOnField: 'q4_exp_type',
            defaultValue: '2—5年',
            options: [
              { id: 'opt-q5-1', label: 'A. 没有经验（0）', value: '没有经验', desc: '全新市场参与者' },
              { id: 'opt-q5-2', label: 'B. 少于2年（2）', value: '少于2年', desc: '经历较短市场周期' },
              { id: 'opt-q5-3', label: 'C. 2—5年（6）', value: '2—5年', desc: '经历完整牛熊震荡' },
              { id: 'opt-q5-4', label: 'D. 5—8年（8）', value: '5—8年', desc: '长期丰富投资实战' },
              { id: 'opt-q5-5', label: 'E. 8年以上（10）', value: '8年以上', desc: '资深资本市场老将' }
            ]
          },
          {
            id: 'c-wm-1-q6',
            type: 'RADIO',
            title: 'Q6. 以下哪项最符合您的投资态度？',
            fieldName: 'q6_attitude',
            required: true,
            dependsOnField: 'q5_exp_years',
            defaultValue: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动',
            options: [
              { id: 'opt-q6-1', label: 'A. 厌恶风险，不希望本金损失，希望获得稳定回报（0）', value: '厌恶风险，不希望本金损失，希望获得稳定回报', desc: '绝对安全诉求' },
              { id: 'opt-q6-2', label: 'B. 保守投资，不愿本金损失，但愿意承受一定幅度的收益波动（4）', value: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动', desc: '追求稳健保本增值' },
              { id: 'opt-q6-3', label: 'C. 寻求较高收益和成长性，愿意为此承担有限本金损失（8）', value: '寻求较高收益和成长性，愿意为此承担有限本金损失', desc: '平衡进取诉求' },
              { id: 'opt-q6-4', label: 'D. 希望赚取高回报，愿意承担较大本金损失（10）', value: '希望赚取高回报，愿意承担较大本金损失', desc: '积极激进博取超额' }
            ]
          },
          {
            id: 'c-wm-1-q7',
            type: 'RADIO',
            title: 'Q7. 假设本金100万元，您会选择哪一种投资机会？',
            fieldName: 'q7_opportunity',
            required: true,
            dependsOnField: 'q6_attitude',
            defaultValue: '50%机会赢取5万元，较高概率归还本金',
            options: [
              { id: 'opt-q7-1', label: 'A. 100%机会赢取1000元，保证归还本金（0）', value: '100%机会赢取1000元，保证归还本金', desc: '确定性收益偏好' },
              { id: 'opt-q7-2', label: 'B. 50%机会赢取5万元，较高概率归还本金（4）', value: '50%机会赢取5万元，较高概率归还本金', desc: '大概率稳健偏好' },
              { id: 'opt-q7-3', label: 'C. 25%机会赢取50万元，有一定概率损失本金（6）', value: '25%机会赢取50万元，有一定概率损失本金', desc: '适度博弈偏好' },
              { id: 'opt-q7-4', label: 'D. 10%机会赢取100万元，较高概率损失本金（10）', value: '10%机会赢取100万元，较高概率损失本金', desc: '高赔率激进偏好' }
            ]
          },
          {
            id: 'c-wm-1-q8',
            type: 'RADIO',
            title: 'Q8. 投资于理财、股票、基金等（不含存款和国债）时，您可接受的最长投资期限是？',
            fieldName: 'q8_max_term',
            required: true,
            dependsOnField: 'q7_opportunity',
            defaultValue: '1—3年',
            options: [
              { id: 'opt-q8-1', label: 'A. 1年以下（4）', value: '1年以下', desc: '短期灵活投资周期' },
              { id: 'opt-q8-2', label: 'B. 1—3年（6）', value: '1—3年', desc: '中短期稳健配置周期' },
              { id: 'opt-q8-3', label: 'C. 3—5年（8）', value: '3—5年', desc: '中长期价值锁定周期' },
              { id: 'opt-q8-4', label: 'D. 5年以上（10）', value: '5年以上', desc: '超长期跨周期配置' }
            ]
          },
          {
            id: 'c-wm-1-q9',
            type: 'RADIO',
            title: 'Q9. 您的投资目的是？',
            fieldName: 'q9_purpose',
            required: true,
            dependsOnField: 'q8_max_term',
            defaultValue: '资产稳健增值',
            options: [
              { id: 'opt-q9-1', label: 'A. 资产保值（2）', value: '资产保值', desc: '跑赢通胀，维持购买力' },
              { id: 'opt-q9-2', label: 'B. 资产稳健增值（6）', value: '资产稳健增值', desc: '稳健复利，追求超额收益' },
              { id: 'opt-q9-3', label: 'C. 资产迅速增值（10）', value: '资产迅速增值', desc: '追求超额高倍资本利得' }
            ]
          },
          {
            id: 'c-wm-1-q10',
            type: 'RADIO',
            title: 'Q10. 您的投资出现何种程度的波动时，您会呈现明显的焦虑？',
            fieldName: 'q10_anxiety',
            required: true,
            dependsOnField: 'q9_purpose',
            defaultValue: '本金10%以内的损失',
            options: [
              { id: 'opt-q10-1', label: 'A. 本金无损失但收益未达预期（-5）', value: '本金无损失但收益未达预期', desc: '对收益不达标敏感' },
              { id: 'opt-q10-2', label: 'B. 出现轻微本金损失（0）', value: '出现轻微本金损失', desc: '微小浮亏即产生心理压力' },
              { id: 'opt-q10-3', label: 'C. 本金10%以内的损失（5）', value: '本金10%以内的损失', desc: '能耐受中等正常市场回撤' },
              { id: 'opt-q10-4', label: 'D. 本金20%—50%的损失（10）', value: '本金20%—50%的损失', desc: '强心理承压能力' },
              { id: 'opt-q10-5', label: 'E. 本金50%以上的损失（15）', value: '本金50%以上的损失', desc: '超强风险承受与穿越能力' }
            ]
          },
          {
            id: 'c-wm-1-q11',
            type: 'RADIO',
            title: 'Q11. 如果您的投资出现亏损，您的实际感受最接近以下哪项？',
            fieldName: 'q11_loss_feel',
            required: true,
            dependsOnField: 'q10_anxiety',
            defaultValue: '理解波动是投资的一部分，能按计划持有',
            options: [
              { id: 'opt-q11-1', label: 'A. 立刻全部赎回，不再投资（0）', value: '立刻全部赎回，不再投资', desc: '极端避险止损情绪' },
              { id: 'opt-q11-2', label: 'B. 会焦虑，但能持有观察一段时间（4）', value: '会焦虑，但能持有观察一段时间', desc: '理性观察但伴随担忧' },
              { id: 'opt-q11-3', label: 'C. 理解波动是投资的一部分，能按计划持有（8）', value: '理解波动是投资的一部分，能按计划持有', desc: '具备专业长期投资心态' },
              { id: 'opt-q11-4', label: 'D. 认为波动是机会，可能考虑追加投资（10）', value: '认为波动是机会，可能考虑追加投资', desc: '逆向逢低布局思维' }
            ]
          },
          {
            id: 'c-wm-1-btn',
            type: 'BUTTON',
            title: '完成测评提交按钮',
            buttonText: '完成风险测评并提交结果',
            actionType: 'SUBMIT_CONFIRM',
            showOnLastQuestion: true,
            hintText: '系统将根据11题总分自动计算评定 C1 谨慎型 ~ C5 激进型'
          }
        ]
      },

      // 步骤 2: 投资目标与偏好调研
      {
        id: 'wealth-node-2',
        stepNumber: 2,
        nodeCode: '02',
        title: '步骤 2: 理财咨询-投资目标与偏好调研',
        shortTitle: '目标与偏好调研',
        categoryTag: '需求深度探查',
        description: '引导客户反馈资金主要用途、预计动用时间、收益期望、浮亏容忍、投资历史及特别关注点',
        x: 480,
        y: 200,
        requiresClientConfirm: true,
        progressiveQuestionFlow: true,
        showConfirmOnLastQuestionOnly: true,
        defaultNextNodeId: 'wealth-node-3',
        components: [
          {
            id: 'c-wm-2-speech',
            type: 'SPEECH',
            title: '坐席推荐需求探查话术',
            speechText: '好的，已知悉您的风险测评结果。为了给您推荐最契合您个人资金规划的理财方案，还需要进一步了解您的资金规划偏好。\n\n请您在下方卡片中回答资金用途、动用时间、收益期望等问题，这将决定推荐产品的锁定期与流动性特征（注：如实填写可帮助推荐更匹配的理财类型）。'
          },
          {
            id: 'c-wm-2-notice',
            type: 'NOTICE',
            title: '适当性期限与偏好匹配提示',
            noticeType: 'warning',
            noticeText: '适当性提示：请如实填写资金闲置周期与使用目的，避免将短期急用资金（如买房首付、家庭应急备用金）投入中长期封闭型理财产品。'
          },
          {
            id: 'c-wm-2-q1',
            type: 'RADIO',
            title: '1）这笔资金的主要用途是？',
            fieldName: 'fundUsage',
            required: true,
            defaultValue: '日常闲钱增值',
            options: [
              { id: 'opt-fu-1', label: 'A. 日常闲钱增值', value: '日常闲钱增值', desc: '追求流动性与零钱收益' },
              { id: 'opt-fu-2', label: 'B. 特定目标储备（购房/教育/养老等）', value: '特定目标储备（购房/教育/养老等）', desc: '专款专用，注重安全稳健' },
              { id: 'opt-fu-3', label: 'C. 到期存款/理财续投', value: '到期存款/理财续投', desc: '资产无缝衔接，持续复利' },
              { id: 'opt-fu-4', label: 'D. 其他（请填写）', value: '其他（请填写）', desc: '自定义特殊资金用途' }
            ]
          },
          {
            id: 'c-wm-2-q2',
            type: 'RADIO',
            title: '2）这笔资金预计多久内不需要动用？',
            fieldName: 'idleDuration',
            required: true,
            dependsOnField: 'fundUsage',
            defaultValue: '3—12个月',
            options: [
              { id: 'opt-id-1', label: 'A. 3个月以内', value: '3个月以内', desc: '超短期高流动性需求' },
              { id: 'opt-id-2', label: 'B. 3—12个月', value: '3—12个月', desc: '中短期稳健配置周期' },
              { id: 'opt-id-3', label: 'C. 1—3年', value: '1—3年', desc: '中期锁定收益周期' },
              { id: 'opt-id-4', label: 'D. 3年以上', value: '3年以上', desc: '长期增值复利周期' },
              { id: 'opt-id-5', label: 'E. 不确定，可能随时需要', value: '不确定，可能随时需要', desc: '极高流动性要求，随用随取' }
            ]
          },
          {
            id: 'c-wm-2-q3',
            type: 'RADIO',
            title: '3）您对收益的期望更接近以下哪项？',
            fieldName: 'yieldExpectation',
            required: true,
            dependsOnField: 'idleDuration',
            defaultValue: '接受小幅波动，争取高于定期存款',
            options: [
              { id: 'opt-ye-1', label: 'A. 尽量不亏，略高于活期即可', value: '尽量不亏，略高于活期即可', desc: '安全第一，极低波动' },
              { id: 'opt-ye-2', label: 'B. 接受小幅波动，争取高于定期存款', value: '接受小幅波动，争取高于定期存款', desc: '兼顾稳健与增值' },
              { id: 'opt-ye-3', label: 'C. 能接受较明显波动，追求更高收益', value: '能接受较明显波动，追求更高收益', desc: '博取高弹性超额收益' }
            ]
          },
          {
            id: 'c-wm-2-q4',
            type: 'RADIO',
            title: '4）如果产品在持有期间出现账面浮亏，您最多能容忍的亏损幅度大约是？',
            fieldName: 'drawdownTolerance',
            required: true,
            dependsOnField: 'yieldExpectation',
            defaultValue: '5%以内',
            options: [
              { id: 'opt-dt-1', label: 'A. 不能接受任何本金浮亏', value: '不能接受任何本金浮亏', desc: '绝对安全，适合R1现金/存单类' },
              { id: 'opt-dt-2', label: 'B. 5%以内', value: '5%以内', desc: '轻微波动，适合R2固收稳健类' },
              { id: 'opt-dt-3', label: 'C. 5%—10%', value: '5%—10%', desc: '适度回撤，适合R3固收+平衡类' },
              { id: 'opt-dt-4', label: 'D. 10%以上', value: '10%以上', desc: '较深回撤，适合R4/R5进取类' }
            ]
          },
          {
            id: 'c-wm-2-q5',
            type: 'CHECKBOX',
            title: '5）您过去购买过以下哪些类型的理财产品？（可多选）',
            fieldName: 'historicalProducts',
            required: true,
            dependsOnField: 'drawdownTolerance',
            options: [
              { id: 'opt-hp-1', label: 'A. 银行存款/国债', value: '银行存款/国债', desc: '无风险基础固收' },
              { id: 'opt-hp-2', label: 'B. 货币基金/现金管理类', value: '货币基金/现金管理类', desc: '现金灵活增值' },
              { id: 'opt-hp-3', label: 'C. 债券型理财', value: '债券型理财', desc: '中低风险纯债/固收' },
              { id: 'opt-hp-4', label: 'D. 混合型/含权益类理财', value: '混合型/含权益类理财', desc: '含权益仓位多资产' },
              { id: 'opt-hp-5', label: 'E. 股票/股票型基金', value: '股票/股票型基金', desc: '高波动权益市场' },
              { id: 'opt-hp-6', label: 'F. 都没买过', value: '都没买过', desc: '全新首投客群' }
            ]
          },
          {
            id: 'c-wm-2-q6',
            type: 'INPUT',
            title: '6）除了收益之外，您对产品还有哪些特别关注的点？（选填）',
            fieldName: 'specialConcerns',
            dependsOnField: 'historicalProducts',
            label: '特别关注点（选填）',
            placeholder: '例如：赎回灵活性、费率、是否可质押等',
            required: false,
            multiline: false,
            maxLength: 80
          },
          {
            id: 'c-wm-2-btn',
            type: 'BUTTON',
            title: '确认提交投资偏好按钮',
            buttonText: '确认提交投资偏好并生成匹配方案',
            actionType: 'SUBMIT_CONFIRM',
            showOnLastQuestion: true,
            hintText: '客户提交后系统将根据评级与6项偏好智能推荐理财'
          }
        ]
      },

      // 步骤 3: 产品讲解与风险揭示 (支持坐席按不同等级选择卡片发送，且在流程配置中可独立定制各等级卡片)
      {
        id: 'wealth-node-3',
        stepNumber: 3,
        nodeCode: '03',
        title: '步骤 3: 理财咨询-产品讲解与风险揭示',
        shortTitle: '产品匹配与风险揭示',
        categoryTag: '产品讲解与合规揭示',
        description: '用通俗语言深入解释对应风险等级产品的投向、收益结构、风险特征，必须全面揭示最坏情形，严格禁止承诺保本保收益。坐席可根据前序评测等级（C1~C5）自由切换发送不同等级卡片与话术',
        x: 880,
        y: 200,
        requiresClientConfirm: false,
        defaultNextNodeId: 'wealth-node-4',
        // 坐席可选择的不同等级理财产品卡片配置（在流程配置中可对每个等级独立编辑卡片内容与话术）
        tierCardConfigs: [
          {
            tierId: 'C1',
            tierName: 'C1 谨慎型',
            riskLevel: 'R1 低风险',
            productName: '现金宝·日日盈1号现金管理理财',
            benchmark: '7日年化 1.95% ~ 2.20%',
            duration: '工作日每个开放日可申赎',
            minAmount: '1 元起购',
            underlyingAssets: '100%投向银行活期存款、同业存单、国债与央行票据等高流动性安全资产',
            yieldStructure: '每日结息，收益随存单与货币工具利息积累浮动；无申购费及赎回费',
            worstCaseNotice: '非保本浮动收益。最坏情形下，若遭遇金融市场极端流动性枯竭或银行存款系统性风险，实际收益可能低于活期利率或出现短暂净值微幅波动，不承诺保本保收益。',
            speechTemplate: '根据您测评的【C1 谨慎型】风险承受能力及资金流动性偏好，为您重点推荐【现金宝·日日盈1号】现金管理类理财：\n\n1. 投向结构：100%投向银行活期存款、同业存单与国债，高流动性极低风险；\n2. 收益结构：最新7日年化业绩基准为 1.95%~2.20%，工作日随时申赎，资金T+1到账；\n3. 【最坏情形揭示】：本产品为非保本浮动收益型，不承诺保本及保收益。极端流动性冲击下可能出现短暂收益微幅回撤的最坏情形。'
          },
          {
            tierId: 'C2',
            tierName: 'C2 稳健型',
            riskLevel: 'R2 中低风险',
            productName: '乾元金享·季季丰90天固定收益理财',
            benchmark: '年化 2.85% ~ 3.15%',
            duration: '每 90 天为一个开放申赎周期',
            minAmount: '1 元起购',
            underlyingAssets: '80%以上资产投资于国债、政策性金融债、AAA级信用债与央票，20%同业存单与存款',
            yieldStructure: '按季分红或滚存，收益随底层高等级信用债票息与估值浮动；持有满期免收赎回费',
            worstCaseNotice: '非保本浮动收益。最坏情形下，若底层债券发行人出现信用违约或市场剧烈加息抛售，产品净值可能跌破面值导致本金损失，不承诺保本保最低收益。',
            speechTemplate: '根据您测评的【C2 稳健型】风险等级及资金使用规划，为您重点推荐【乾元金享·季季丰90天】固定收益类稳健理财：\n\n1. 投向结构：主要投向国债、政策性金融债及AAA级高等级信用债，资产信用优良；\n2. 收益结构：最新业绩比较基准为年化 2.85%~3.15%，每90天开放一次；\n3. 【最坏情形揭示】：本产品为非保本浮动收益型，不承诺保本保收益。若遇债券极端违约，可能出现净值短暂浮亏的最坏情形。历史业绩不代表未来表现。'
          },
          {
            tierId: 'C3',
            tierName: 'C3 平衡型',
            riskLevel: 'R3 中等风险',
            productName: '稳睿卓越·半年定开多资产平衡理财',
            benchmark: '年化 3.60% ~ 4.20%',
            duration: '每 180 天定期开放运作',
            minAmount: '1000 元起购',
            underlyingAssets: '60%~80%高等级固收债券打底，20%~40%精选大盘高股息红利资产与量化对冲策略',
            yieldStructure: '半年度定期开放分红，大类资产动态再平衡平滑波动；锁定期内不支持提前赎回',
            worstCaseNotice: '非保本浮动收益。最坏情形下，若权益市场出现深幅回调或股债双杀，权益端浮亏可能侵蚀固收收益导致本金发生较明显账面损失，不承诺保本保收益。',
            speechTemplate: '根据您测评的【C3 平衡型】风险等级及对更高收益的期望，为您重点推荐【稳睿卓越·半年定开】多资产平衡理财：\n\n1. 投向结构：80%高等级固收债券打底，20%精选高股息权益资产博取超额增值；\n2. 收益结构：业绩比较基准为年化 3.60%~4.20%，每180天定期开放；\n3. 【最坏情形揭示】：本产品为非保本浮动收益型，不承诺保本。若股市剧烈震荡，可能面临本金适度账面亏损的最坏情形。'
          },
          {
            tierId: 'C4',
            tierName: 'C4 进取型',
            riskLevel: 'R4 中高风险',
            productName: '智远多策略·成长进取360天混合理财',
            benchmark: '年化 4.80% ~ 6.50%',
            duration: '封闭运作 360 天',
            minAmount: '1 万元起购',
            underlyingAssets: '40%~60%投资于权益资产（股票、偏股公募基金），其余投向高等级流动性债券与量化衍生品',
            yieldStructure: '净值化运作，以资本利得为主要收益驱动，净值波动幅度较大；满期一次性兑付',
            worstCaseNotice: '非保本浮动收益。受资本市场周期波动影响显著，在最坏极端行情下可能面临本金亏损超过10%的深度回撤且封闭期内无法提前赎回，坚决不承诺保本保收益。',
            speechTemplate: '根据您测评的【C4 进取型】风险等级及长期增值目标，为您重点推荐【智远多策略·成长进取360天】混合型理财：\n\n1. 投向结构：多元资产跨周期配置权益资产与量化策略，进取成长导向；\n2. 收益结构：业绩比较基准为年化 4.80%~6.50%，封闭运作360天；\n3. 【最坏情形揭示】：非保本浮动收益，净值波动较大。极端最坏情形下本金可能发生较深账面亏损且锁定期无法赎回，严禁承诺保本。'
          },
          {
            tierId: 'C5',
            tierName: 'C5 激进型',
            riskLevel: 'R5 高风险',
            productName: '博睿先锋·全天候高波动衍生量化理财',
            benchmark: '年化 6.00% ~ 9.00%',
            duration: '封闭运作 18 个月',
            minAmount: '5 万元起购',
            underlyingAssets: '主要投向公募权益、商品衍生品、量化对冲及定向增发等高风险高回报金融工具',
            yieldStructure: '高收益弹性策略，风险溢价显著，净值波动与回撤幅度大；封闭期满自动清算',
            worstCaseNotice: '非保本浮动收益。产品具有高风险与高杠杆弹性特征，最坏情形下可能损失超过30%甚至全部投资本金，投资者必须具备极强的风险承受能力与市场认知。',
            speechTemplate: '根据您测评的【C5 激进型】风险承受能力，为您重点展示【博睿先锋·全天候量化】高风险理财方案：\n\n1. 投向结构：重点投向商品衍生品、权益量化及跨市场对冲，追求高资本利得；\n2. 收益结构：业绩基准为年化 6.00%~9.00%，封闭18个月；\n3. 【最坏情形揭示】：高风险投资，最坏极端情况下可能损失大额甚至全部投资本金，请务必审慎核实。'
          }
        ],
        components: [
          {
            id: 'c-wm-3-speech',
            type: 'SPEECH',
            title: '坐席推荐产品讲解话术（支持随等级切换）',
            speechText: '根据您第一步骤评定的【C2 稳健型】风险等级以及您的资金期限偏好，为您重点推荐匹配我行【乾元金享·季季丰90天】固定收益类稳健理财：\n\n1. 投向结构：主要投向国债、政策性金融债、高等级信用债及同业存单，资产信用等级高；\n2. 收益结构：业绩比较基准为年化 2.85%~3.15%，按季开放分红；\n3. 【最坏情形揭示】：本产品为非保本浮动收益型，不承诺保本及最低收益。在最极端债券违约或严重流动性冲击下，可能出现实际收益低于基准甚至本金发生浮亏的最坏情形。历史业绩不代表未来表现。'
          },
          {
            id: 'c-wm-3-notice-strict',
            type: 'NOTICE',
            title: '合规红线禁令：严禁承诺收益',
            noticeType: 'warning',
            noticeText: '合规禁令：严禁坐席使用“保本”、“无风险”、“保底”、“稳赚不赔”等词汇误导客户；必须主动向客户揭示最坏可能的情形（本金损失风险与退出限制）。'
          },
          {
            id: 'c-wm-3-product-detail',
            type: 'GUIDE',
            title: '推荐匹配产品核心档案与投向图解',
            channelName: '【C2稳健型·R2中低风险】乾元金享·季季丰90天固收理财',
            pathSteps: [
              '1. 基础投向：80%以上资产投资于高等级债券资产（国债、央票、AAA级企业债），20%为银行存款与货币工具',
              '2. 收益表现：最新一期业绩比较基准为年化 2.85% - 3.15%（非预期收益率）',
              '3. 运作周期：每 90 天为一个开放申赎周期，到期前系统短信提示客户选择续期或赎回',
              '4. 申购起点：1元起购，0 申购费与 0 赎回费（持有满期）'
            ],
            materials: [
              '收益特征：净值型理财，收益随底层债券利息与估值浮动',
              '流动性：封闭运作 90 天，封闭期内不支持提前赎回，满期自动滚存或转出'
            ],
            duration: '90天定开',
            notices: [
              '最坏情形揭示：遇债券发行主体严重违约或市场剧烈加息抛售，产品净值可能跌破面值导致本金损失',
              '资管新规声明：根据资管新规，银行理财全面打破刚性兑付，自负盈亏'
            ]
          },
          {
            id: 'c-wm-3-btn',
            type: 'BUTTON',
            title: '采纳并发送产品讲解卡片',
            buttonText: '采纳话术并发送产品讲解与风险揭示卡',
            actionType: 'SEND_CARD'
          }
        ]
      },

      // 步骤 4: 确认理解与后续引导
      {
        id: 'wealth-node-4',
        stepNumber: 4,
        nodeCode: '04',
        title: '步骤 4: 理财咨询-确认理解与后续引导',
        shortTitle: '确认理解与顾问转接',
        categoryTag: '合规转接与办结',
        description: '确认客户对产品要素与风险揭示的理解程度，提供持牌销售资质客户经理联系方式及官方安全购买渠道',
        x: 1280,
        y: 200,
        requiresClientConfirm: false,
        components: [
          {
            id: 'c-wm-4-speech',
            type: 'SPEECH',
            title: '坐席确认理解与转接引导话术',
            speechText: '请问您对刚才介绍的产品投向、收益特征以及最坏情形的风险揭示是否充分理解？若您对该产品的申赎规则或起息时间还有任何疑问，我随时为您进一步说明。\n\n如果您已充分了解并有意向办理，您可以直接通过下方卡片中的直达链接在手机银行中查阅《产品说明书》并自助申购；若您需要更大额度的配置或一对一量身规划，我也为您推荐了具备专业基金与理财销售资质的持牌客户经理联系方式。'
          },
          {
            id: 'c-wm-4-notice',
            type: 'NOTICE',
            title: '法律声明与安全渠道提示',
            noticeType: 'warning',
            noticeText: '安全与合规声明：1. 理财非存款、产品有风险、投资须谨慎；2. 业绩比较基准仅供参考，不代表预期收益；3. 请务必通过手机银行等官方正规渠道认购，切勿向任何第三方或个人账户转账！'
          },
          {
            id: 'c-wm-4-guide',
            type: 'GUIDE',
            title: '持牌理财顾问名片与官方直达通道',
            channelName: '专业持牌销售顾问一对一与官方购买指引',
            pathSteps: [
              '1. 手机银行购买通道：登录手机银行APP -> 底部【财富/理财】-> 搜索产品代码【QY90D01】即可直达',
              '2. 签署协议：购买前请在线完整阅读《风险揭示书》、《产品说明书》并进行电子签名确认',
              '3. 撤单冷静期：本产品支持认购期内 24 小时投资冷静期，冷静期内可无条件撤销申请',
              '4. 持牌顾问转接：如需专人上门或网点VIP接待，可直接点击卡片中的拨打顾问电话'
            ],
            materials: [
              '持牌顾问：李雅琪 (总行卓越财富管理中心 资深财富顾问)',
              '销售资质编号：AFM202308119 | 基金从业资格：F202100892',
              '专属服务电话：021-95566 转 8219 | 营业网点：金融街中心旗舰支行财富管理专区'
            ],
            duration: '7x24小时随时自助购买 / 顾问工作日 9:00-18:00',
            notices: [
              '投资须谨慎：认真评估个人财务状况与风险承受能力',
              '资管新规合规声明：商业银行理财子公司发售理财产品，全面执行净值化运作'
            ]
          },
          {
            id: 'c-wm-4-btn',
            type: 'BUTTON',
            title: '完成理财咨询流程按钮',
            buttonText: '完成理财咨询与后续服务',
            actionType: 'FINISH_FLOW'
          }
        ]
      }
    ]
};

// 预置流程列表：银行卡挂失、理财产品咨询排在前面位置（默认启用），个人账户非柜面限制排在后面（默认停用）
export const PRESET_PROCESSES: ProcessDefinition[] = [
  PROC_CARD_LOSS,
  PROC_WEALTH_MANAGE,
  PROC_FEIGUIMIAN
];

export const PROCESS_STORAGE_KEY = 'BANK_ASSISTANT_PROCESSES_V4';

export function getSavedProcesses(): ProcessDefinition[] {
  try {
    const saved = localStorage.getItem(PROCESS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missingPresets = PRESET_PROCESSES.filter(p => !existingIds.has(p.id));
        const merged = missingPresets.length > 0 ? [...parsed, ...missingPresets] : parsed;
        return merged.map((p: ProcessDefinition) => ({
          ...p,
          enabled: p.enabled !== undefined ? p.enabled : (p.id !== 'proc-feiguimian')
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved processes from localStorage', e);
  }
  return PRESET_PROCESSES.map(p => ({ ...p }));
}

export function saveProcessesToStorage(processes: ProcessDefinition[]): void {
  try {
    localStorage.setItem(PROCESS_STORAGE_KEY, JSON.stringify(processes));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bank-processes-updated'));
    }
  } catch (e) {
    console.warn('Failed to save processes to localStorage', e);
  }
}

export function isProcessEnabled(processId: string): boolean {
  const list = getSavedProcesses();
  const found = list.find(p => p.id === processId);
  if (found) {
    return found.enabled !== false;
  }
  return processId !== 'proc-feiguimian';
}

