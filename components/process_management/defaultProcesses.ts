import { ProcessDefinition } from './types';

export const PRESET_PROCESSES: ProcessDefinition[] = [
  // 1. 银行卡挂失辅助流程
  {
    id: 'proc-card-loss',
    name: '银行卡挂失',
    shortName: '卡片挂失',
    category: '借记卡与账户业务',
    keywords: ['挂失', '丢卡', '被盗', '解挂', '补卡', '卡丢了', '卡掉了', '钱包丢', '卡不见了', '银行卡丢失'],
    description: '辅助坐席高效引导客户完成银行卡紧急口头挂失、渠道分流（手机银行/电话银行/柜面）及后续补换卡全流程',
    version: 'v2.4',
    status: 'PUBLISHED',
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
  },

  // 2. 个人账户非柜面限制辅助流程
  {
    id: 'proc-feiguimian',
    name: '个人账户非柜面限制',
    shortName: '非柜面限制',
    category: '借记卡与账户业务',
    keywords: ['卡不能用了', '无法转账', '非柜面', '限制非柜面', '限额', '转账不了', '9901', '冻结', '暂停业务'],
    description: '针对客户触发反诈风控或长期未动账导致的非柜面交易受限，辅助坐席引导客户快速定性排查、选择线上或网点解控方案',
    version: 'v2.2',
    status: 'PUBLISHED',
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
  }
];
