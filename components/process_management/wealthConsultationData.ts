import { WealthTierConfig } from './types';

// =========================================================================
// 步骤一：11道投资者风险承受能力测评问卷 (含分值与选项)
// =========================================================================
export interface RiskQuestionOption {
  id: string;
  label: string;
  value: string;
  score: number;
  desc?: string;
}

export interface RiskQuestionItem {
  id: string;
  index: number;
  code: string;
  title: string;
  fieldName: string;
  defaultValue: string;
  options: RiskQuestionOption[];
}

export const WEALTH_RISK_QUESTIONS: RiskQuestionItem[] = [
  {
    id: 'rq-1',
    index: 1,
    code: 'Q1',
    title: 'Q1. 您的年龄是？',
    fieldName: 'q1_age',
    defaultValue: '25—50岁',
    options: [
      { id: 'opt-q1-a', label: 'A. 18—24岁（-2）', value: '18—24岁', score: -2, desc: '青年起步期，经验待积累' },
      { id: 'opt-q1-b', label: 'B. 25—50岁（0）', value: '25—50岁', score: 0, desc: '黄金工作期，收入现金流稳定' },
      { id: 'opt-q1-c', label: 'C. 51—60岁（-2）', value: '51—60岁', score: -2, desc: '临近退休期，注重资金安全稳健' },
      { id: 'opt-q1-d', label: 'D. 61—64岁（-3）', value: '61—64岁', score: -3, desc: '退休初期，以保本低波动为主' },
      { id: 'opt-q1-e', label: 'E. 65岁及以上（-10）', value: '65岁及以上', score: -10, desc: '高龄投资者，法定重点保护' }
    ]
  },
  {
    id: 'rq-2',
    index: 2,
    code: 'Q2',
    title: 'Q2. 您的家庭总资产净值约为（不含自用住宅，扣除未结清贷款及信用卡账单等债务）？',
    fieldName: 'q2_net_asset',
    defaultValue: '50万—100万元',
    options: [
      { id: 'opt-q2-a', label: 'A. 15万元及以下（0）', value: '15万元及以下', score: 0, desc: '基础家庭应急备用金' },
      { id: 'opt-q2-b', label: 'B. 15万—50万元（2）', value: '15万—50万元', score: 2, desc: '大众初级理财规划客群' },
      { id: 'opt-q2-c', label: 'C. 50万—100万元（6）', value: '50万—100万元', score: 6, desc: '中等富裕家庭净资产' },
      { id: 'opt-q2-d', label: 'D. 100万—1000万元（8）', value: '100万—1000万元', score: 8, desc: '高净值成长客群' },
      { id: 'opt-q2-e', label: 'E. 1000万元以上（10）', value: '1000万元以上', score: 10, desc: '私行级超高净值客群' }
    ]
  },
  {
    id: 'rq-3',
    index: 3,
    code: 'Q3',
    title: 'Q3. 在家庭总资产中，可用于金融投资（储蓄存款除外）的比例约为？',
    fieldName: 'q3_invest_ratio',
    defaultValue: '25%—50%',
    options: [
      { id: 'opt-q3-a', label: 'A. 小于10%（2）', value: '小于10%', score: 2, desc: '谨慎防御，以存款储备为主' },
      { id: 'opt-q3-b', label: 'B. 10%—25%（4）', value: '10%—25%', score: 4, desc: '适度闲钱尝试低波动理财' },
      { id: 'opt-q3-c', label: 'C. 25%—50%（8）', value: '25%—50%', score: 8, desc: '较合理多元资产配置比例' },
      { id: 'opt-q3-d', label: 'D. 大于50%（10）', value: '大于50%', score: 10, desc: '金融资产为主，投资参与度高' }
    ]
  },
  {
    id: 'rq-4',
    index: 4,
    code: 'Q4',
    title: 'Q4. 以下哪项最能说明您的投资经验？',
    fieldName: 'q4_exp_type',
    defaultValue: '资产较均衡地分布于存款、理财、信托、股票、基金等',
    options: [
      { id: 'opt-q4-a', label: 'A. 除存款、国债外，几乎不投资其他金融产品（0）', value: '除存款、国债外，几乎不投资其他金融产品', score: 0, desc: '基础保守型经验' },
      { id: 'opt-q4-b', label: 'B. 大部分为存款、国债，较少涉及股票、权益类基金等（2）', value: '大部分为存款、国债，较少涉及股票、权益类基金等', score: 2, desc: '稳健型入门经验' },
      { id: 'opt-q4-c', label: 'C. 资产较均衡地分布于存款、理财、信托、股票、基金等（6）', value: '资产较均衡地分布于存款、理财、信托、股票、基金等', score: 6, desc: '均衡多元投资经验' },
      { id: 'opt-q4-d', label: 'D. 大部分投资于股票、权益类基金、外汇等高风险产品（10）', value: '大部分投资于股票、权益类基金、外汇等高风险产品', score: 10, desc: '成熟高风险投资经验' }
    ]
  },
  {
    id: 'rq-5',
    index: 5,
    code: 'Q5',
    title: 'Q5. 您有多少年投资股票、基金、外汇、金融衍生品等风险投资品的经验？',
    fieldName: 'q5_exp_years',
    defaultValue: '2—5年',
    options: [
      { id: 'opt-q5-a', label: 'A. 没有经验（0）', value: '没有经验', score: 0, desc: '全新市场参与者' },
      { id: 'opt-q5-b', label: 'B. 少于2年（2）', value: '少于2年', score: 2, desc: '经历较短市场周期' },
      { id: 'opt-q5-c', label: 'C. 2—5年（6）', value: '2—5年', score: 6, desc: '经历完整牛熊震荡' },
      { id: 'opt-q5-d', label: 'D. 5—8年（8）', value: '5—8年', score: 8, desc: '长期丰富投资实战' },
      { id: 'opt-q5-e', label: 'E. 8年以上（10）', value: '8年以上', score: 10, desc: '资深资本市场老将' }
    ]
  },
  {
    id: 'rq-6',
    index: 6,
    code: 'Q6',
    title: 'Q6. 以下哪项最符合您的投资态度？',
    fieldName: 'q6_attitude',
    defaultValue: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动',
    options: [
      { id: 'opt-q6-a', label: 'A. 厌恶风险，不希望本金损失，希望获得稳定回报（0）', value: '厌恶风险，不希望本金损失，希望获得稳定回报', score: 0, desc: '绝对安全诉求' },
      { id: 'opt-q6-b', label: 'B. 保守投资，不愿本金损失，但愿意承受一定幅度的收益波动（4）', value: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动', score: 4, desc: '追求稳健保本增值' },
      { id: 'opt-q6-c', label: 'C. 寻求较高收益和成长性，愿意为此承担有限本金损失（8）', value: '寻求较高收益和成长性，愿意为此承担有限本金损失', score: 8, desc: '平衡进取诉求' },
      { id: 'opt-q6-d', label: 'D. 希望赚取高回报，愿意承担较大本金损失（10）', value: '希望赚取高回报，愿意承担较大本金损失', score: 10, desc: '积极激进博取超额' }
    ]
  },
  {
    id: 'rq-7',
    index: 7,
    code: 'Q7',
    title: 'Q7. 假设本金100万元，您会选择哪一种投资机会？',
    fieldName: 'q7_opportunity',
    defaultValue: '50%机会赢取5万元，较高概率归还本金',
    options: [
      { id: 'opt-q7-a', label: 'A. 100%机会赢取1000元，保证归还本金（0）', value: '100%机会赢取1000元，保证归还本金', score: 0, desc: '确定性极低收益偏好' },
      { id: 'opt-q7-b', label: 'B. 50%机会赢取5万元，较高概率归还本金（4）', value: '50%机会赢取5万元，较高概率归还本金', score: 4, desc: '大概率稳健偏好' },
      { id: 'opt-q7-c', label: 'C. 25%机会赢取50万元，有一定概率损失本金（6）', value: '25%机会赢取50万元，有一定概率损失本金', score: 6, desc: '适度博弈偏好' },
      { id: 'opt-q7-d', label: 'D. 10%机会赢取100万元，较高概率损失本金（10）', value: '10%机会赢取100万元，较高概率损失本金', score: 10, desc: '高赔率激进偏好' }
    ]
  },
  {
    id: 'rq-8',
    index: 8,
    code: 'Q8',
    title: 'Q8. 投资于理财、股票、基金等（不含存款和国债）时，您可接受的最长投资期限是？',
    fieldName: 'q8_max_term',
    defaultValue: '1—3年',
    options: [
      { id: 'opt-q8-a', label: 'A. 1年以下（4）', value: '1年以下', score: 4, desc: '短期灵活投资周期' },
      { id: 'opt-q8-b', label: 'B. 1—3年（6）', value: '1—3年', score: 6, desc: '中短期稳健配置周期' },
      { id: 'opt-q8-c', label: 'C. 3—5年（8）', value: '3—5年', score: 8, desc: '中长期价值锁定周期' },
      { id: 'opt-q8-d', label: 'D. 5年以上（10）', value: '5年以上', score: 10, desc: '超长期跨周期配置' }
    ]
  },
  {
    id: 'rq-9',
    index: 9,
    code: 'Q9',
    title: 'Q9. 您的投资目的是？',
    fieldName: 'q9_purpose',
    defaultValue: '资产稳健增值',
    options: [
      { id: 'opt-q9-a', label: 'A. 资产保值（2）', value: '资产保值', score: 2, desc: '跑赢通胀，维持购买力' },
      { id: 'opt-q9-b', label: 'B. 资产稳健增值（6）', value: '资产稳健增值', score: 6, desc: '稳健复利，追求超额收益' },
      { id: 'opt-q9-c', label: 'C. 资产迅速增值（10）', value: '资产迅速增值', score: 10, desc: '追求超额高倍资本利得' }
    ]
  },
  {
    id: 'rq-10',
    index: 10,
    code: 'Q10',
    title: 'Q10. 您的投资出现何种程度的波动时，您会呈现明显的焦虑？',
    fieldName: 'q10_anxiety',
    defaultValue: '本金10%以内的损失',
    options: [
      { id: 'opt-q10-a', label: 'A. 本金无损失但收益未达预期（-5）', value: '本金无损失但收益未达预期', score: -5, desc: '对收益不达标敏感' },
      { id: 'opt-q10-b', label: 'B. 出现轻微本金损失（0）', value: '出现轻微本金损失', score: 0, desc: '微小浮亏即产生心理压力' },
      { id: 'opt-q10-c', label: 'C. 本金10%以内的损失（5）', value: '本金10%以内的损失', score: 5, desc: '能耐受中等正常市场回撤' },
      { id: 'opt-q10-d', label: 'D. 本金20%—50%的损失（10）', value: '本金20%—50%的损失', score: 10, desc: '强心理承压能力' },
      { id: 'opt-q10-e', label: 'E. 本金50%以上的损失（15）', value: '本金50%以上的损失', score: 15, desc: '超强风险承受与穿越能力' }
    ]
  },
  {
    id: 'rq-11',
    index: 11,
    code: 'Q11',
    title: 'Q11. 如果您的投资出现亏损，您的实际感受最接近以下哪项？',
    fieldName: 'q11_loss_feel',
    defaultValue: '理解波动是投资的一部分，能按计划持有',
    options: [
      { id: 'opt-q11-a', label: 'A. 立刻全部赎回，不再投资（0）', value: '立刻全部赎回，不再投资', score: 0, desc: '极端避险止损情绪' },
      { id: 'opt-q11-b', label: 'B. 会焦虑，但能持有观察一段时间（4）', value: '会焦虑，但能持有观察一段时间', score: 4, desc: '理性观察但伴随担忧' },
      { id: 'opt-q11-c', label: 'C. 理解波动是投资的一部分，能按计划持有（8）', value: '理解波动是投资的一部分，能按计划持有', score: 8, desc: '具备专业长期投资心态' },
      { id: 'opt-q11-d', label: 'D. 认为波动是机会，可能考虑追加投资（10）', value: '认为波动是机会，可能考虑追加投资', score: 10, desc: '逆向逢低布局思维' }
    ]
  }
];

export const RISK_EVALUATION_NOTE = 
  '等级判定参考：总分对应C1—C5，具体分值区间以所在机构的适当性制度为准。常见区间如：C1谨慎型（可接受低风险，本金损失概率低）、C2稳健型（可接受中低风险）、C3平衡型（可接受中等风险）、C4进取型（可接受中高风险）、C5激进型（可接受高风险）。';

// 计算测评总分及评定等级 (C1~C5)
export function calculateRiskEvaluation(answers: Record<string, string>): {
  totalScore: number;
  tierId: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  tierName: string;
  riskLevel: string;
  desc: string;
} {
  let totalScore = 0;
  for (const q of WEALTH_RISK_QUESTIONS) {
    const val = answers[q.fieldName] || q.defaultValue;
    const opt = q.options.find(o => o.value === val);
    if (opt) {
      totalScore += opt.score;
    }
  }

  // 根据总分划分 C1 ~ C5
  if (totalScore < 20) {
    return {
      totalScore,
      tierId: 'C1',
      tierName: 'C1 谨慎型',
      riskLevel: 'R1 低风险',
      desc: '可接受低风险，本金损失概率低，注重资金安全与高流动性'
    };
  } else if (totalScore <= 45) {
    return {
      totalScore,
      tierId: 'C2',
      tierName: 'C2 稳健型',
      riskLevel: 'R2 中低风险',
      desc: '可接受中低风险，追求高于存款的稳定稳健回报，耐受微小短期回撤'
    };
  } else if (totalScore <= 70) {
    return {
      totalScore,
      tierId: 'C3',
      tierName: 'C3 平衡型',
      riskLevel: 'R3 中等风险',
      desc: '可接受中等风险，资产配置股债均衡，追求稳步增值'
    };
  } else if (totalScore <= 88) {
    return {
      totalScore,
      tierId: 'C4',
      tierName: 'C4 进取型',
      riskLevel: 'R4 中高风险',
      desc: '可接受中高风险，愿意为长期超额资本增值承担有限本金波动'
    };
  } else {
    return {
      totalScore,
      tierId: 'C5',
      tierName: 'C5 激进型',
      riskLevel: 'R5 高风险',
      desc: '可接受高风险，具备较强心理承压能力，积极博取超额弹性收益'
    };
  }
}

// =========================================================================
// 步骤二：6道投资目标与偏好调研问卷
// =========================================================================
export interface PreferenceQuestionItem {
  id: string;
  index: number;
  title: string;
  fieldName: string;
  type: 'RADIO' | 'CHECKBOX' | 'INPUT';
  defaultValue?: any;
  options?: { id: string; label: string; value: string; desc?: string }[];
  placeholder?: string;
  allowOther?: boolean;
}

export const WEALTH_PREFERENCE_QUESTIONS: PreferenceQuestionItem[] = [
  {
    id: 'pq-1',
    index: 1,
    title: '1）这笔资金的主要用途是？',
    fieldName: 'fundUsage',
    type: 'RADIO',
    defaultValue: '日常闲钱增值',
    allowOther: true,
    options: [
      { id: 'opt-pq1-a', label: 'A. 日常闲钱增值', value: '日常闲钱增值', desc: '追求流动性与零钱收益' },
      { id: 'opt-pq1-b', label: 'B. 特定目标储备（购房/教育/养老等）', value: '特定目标储备（购房/教育/养老等）', desc: '专款专用，注重安全稳健' },
      { id: 'opt-pq1-c', label: 'C. 到期存款/理财续投', value: '到期存款/理财续投', desc: '资产无缝衔接，持续复利' },
      { id: 'opt-pq1-d', label: 'D. 其他（请填写）', value: '其他（请填写）', desc: '自定义特殊资金用途' }
    ]
  },
  {
    id: 'pq-2',
    index: 2,
    title: '2）这笔资金预计多久内不需要动用？',
    fieldName: 'idleDuration',
    type: 'RADIO',
    defaultValue: '3—12个月',
    options: [
      { id: 'opt-pq2-a', label: 'A. 3个月以内', value: '3个月以内', desc: '超短期高流动性需求' },
      { id: 'opt-pq2-b', label: 'B. 3—12个月', value: '3—12个月', desc: '中短期稳健配置周期' },
      { id: 'opt-pq2-c', label: 'C. 1—3年', value: '1—3年', desc: '中期锁定收益周期' },
      { id: 'opt-pq2-d', label: 'D. 3年以上', value: '3年以上', desc: '长期增值复利周期' },
      { id: 'opt-pq2-e', label: 'E. 不确定，可能随时需要', value: '不确定，可能随时需要', desc: '极高流动性要求，随用随取' }
    ]
  },
  {
    id: 'pq-3',
    index: 3,
    title: '3）您对收益的期望更接近以下哪项？',
    fieldName: 'yieldExpectation',
    type: 'RADIO',
    defaultValue: '接受小幅波动，争取高于定期存款',
    options: [
      { id: 'opt-pq3-a', label: 'A. 尽量不亏，略高于活期即可', value: '尽量不亏，略高于活期即可', desc: '安全第一，极低波动' },
      { id: 'opt-pq3-b', label: 'B. 接受小幅波动，争取高于定期存款', value: '接受小幅波动，争取高于定期存款', desc: '兼顾稳健与增值' },
      { id: 'opt-pq3-c', label: 'C. 能接受较明显波动，追求更高收益', value: '能接受较明显波动，追求更高收益', desc: '博取高弹性超额收益' }
    ]
  },
  {
    id: 'pq-4',
    index: 4,
    title: '4）如果产品在持有期间出现账面浮亏，您最多能容忍的亏损幅度大约是？',
    fieldName: 'drawdownTolerance',
    type: 'RADIO',
    defaultValue: '5%以内',
    options: [
      { id: 'opt-pq4-a', label: 'A. 不能接受任何本金浮亏', value: '不能接受任何本金浮亏', desc: '绝对安全，适合R1现金/存单类' },
      { id: 'opt-pq4-b', label: 'B. 5%以内', value: '5%以内', desc: '轻微波动，适合R2固收稳健类' },
      { id: 'opt-pq4-c', label: 'C. 5%—10%', value: '5%—10%', desc: '适度回撤，适合R3固收+平衡类' },
      { id: 'opt-pq4-d', label: 'D. 10%以上', value: '10%以上', desc: '较深回撤，适合R4/R5进取类' }
    ]
  },
  {
    id: 'pq-5',
    index: 5,
    title: '5）您过去购买过以下哪些类型的理财产品？（可多选）',
    fieldName: 'historicalProducts',
    type: 'CHECKBOX',
    defaultValue: ['银行存款/国债', '货币基金/现金管理类'],
    options: [
      { id: 'opt-pq5-a', label: 'A. 银行存款/国债', value: '银行存款/国债', desc: '无风险基础固收' },
      { id: 'opt-pq5-b', label: 'B. 货币基金/现金管理类', value: '货币基金/现金管理类', desc: '现金灵活增值' },
      { id: 'opt-pq5-c', label: 'C. 债券型理财', value: '债券型理财', desc: '中低风险纯债/固收' },
      { id: 'opt-pq5-d', label: 'D. 混合型/含权益类理财', value: '混合型/含权益类理财', desc: '含权益仓位多资产' },
      { id: 'opt-pq5-e', label: 'E. 股票/股票型基金', value: '股票/股票型基金', desc: '高波动权益市场' },
      { id: 'opt-pq5-f', label: 'F. 都没买过', value: '都没买过', desc: '全新首投客群' }
    ]
  },
  {
    id: 'pq-6',
    index: 6,
    title: '6）除了收益之外，您对产品还有哪些特别关注的点？（选填）',
    fieldName: 'specialConcerns',
    type: 'INPUT',
    placeholder: '例如：赎回灵活性、费率、是否可质押等',
    defaultValue: ''
  }
];

// =========================================================================
// 步骤三：标准五级 (C1~C5) 坐席可选择的不同理财卡片配置（每个卡片选项自带可自由增删的组件列表）
// =========================================================================
export function ensureTierComponents(tier: WealthTierConfig): any[] {
  if (tier.components && Array.isArray(tier.components) && tier.components.length > 0) {
    return tier.components;
  }
  const baseId = tier.tierId || 'tier';
  return [
    {
      id: `comp-${baseId}-speech`,
      type: 'SPEECH',
      title: `推荐话术 (${tier.tierName})`,
      speechText: tier.speechTemplate || `您好，为您推荐【${tier.tierName}】专属方案...`,
      suggestSpeed: '语速适中、吐字清晰',
      autoFillInput: true
    },
    {
      id: `comp-${baseId}-guide`,
      type: 'GUIDE',
      title: `${tier.tierName} · 核心方案卡片`,
      channelName: `${tier.tierName}${tier.productName ? ` · ${tier.productName}` : ''}`,
      sections: [
        {
          id: `sec-${baseId}-1`,
          title: '推荐产品与风险等级',
          content: `${tier.productName || tier.tierName}（${tier.riskLevel || '适配等级'}）`
        },
        {
          id: `sec-${baseId}-2`,
          title: '业绩比较基准与期限',
          content: `业绩比较基准：${tier.benchmark || '按产品说明书'} | 运作周期：${tier.duration || '灵活申赎'}（${tier.minAmount || '1元起购'}）`
        },
        {
          id: `sec-${baseId}-3`,
          title: '底层资产投向结构',
          content: tier.underlyingAssets || '主要投向高信用等级固定收益类资产与优质流动性工具'
        },
        {
          id: `sec-${baseId}-4`,
          title: '收益结构与计息规则',
          content: tier.yieldStructure || '净值化管理，按运作周期开放申赎或分红'
        }
      ]
    },
    {
      id: `comp-${baseId}-notice`,
      type: 'NOTICE',
      title: '【最坏情形揭示】与合规警示',
      noticeType: 'warning',
      noticeText: tier.worstCaseNotice || '本产品为非保本浮动收益型，不承诺保本保收益。极端市场波动下可能出现本金浮亏的最坏情形。'
    },
    {
      id: `comp-${baseId}-btn`,
      type: 'BUTTON',
      title: '客户知悉确认按钮',
      buttonText: '✔ 我已知悉产品要素与最坏情形风险',
      actionType: 'NEXT_STEP'
    }
  ];
}

export function syncTierFromComponents(tier: WealthTierConfig, components: any[]): WealthTierConfig {
  const speechComp = components.find(c => c.type === 'SPEECH');
  const guideComp = components.find(c => c.type === 'GUIDE');
  const noticeComp = components.find(c => c.type === 'NOTICE');

  let productName = tier.productName;
  let underlyingAssets = tier.underlyingAssets;
  let yieldStructure = tier.yieldStructure;

  if (guideComp) {
    if (guideComp.channelName) {
      const parts = String(guideComp.channelName).split('·');
      productName = parts.length > 1 ? parts.slice(1).join('·').trim() : guideComp.channelName;
    }
    if (Array.isArray(guideComp.sections)) {
      const assetSec = guideComp.sections.find((s: any) => s.title?.includes('投向') || s.title?.includes('资产'));
      if (assetSec) underlyingAssets = assetSec.content;
      const yieldSec = guideComp.sections.find((s: any) => s.title?.includes('收益') || s.title?.includes('计息'));
      if (yieldSec) yieldStructure = yieldSec.content;
    }
  }

  return {
    ...tier,
    components,
    speechTemplate: speechComp?.speechText ?? tier.speechTemplate ?? '',
    worstCaseNotice: noticeComp?.noticeText ?? tier.worstCaseNotice ?? '',
    productName: productName ?? tier.tierName,
    underlyingAssets: underlyingAssets ?? tier.underlyingAssets ?? '',
    yieldStructure: yieldStructure ?? tier.yieldStructure ?? ''
  };
}

const RAW_WEALTH_TIERS: WealthTierConfig[] = [
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
];

export const DEFAULT_WEALTH_TIER_CONFIGS: WealthTierConfig[] = RAW_WEALTH_TIERS.map(t => ({
  ...t,
  components: ensureTierComponents(t)
}));

// 从流程辅助管理配置中读取坐席可选择的各等级理财卡片配置（若用户在流程管理中自定义修改过，则实时生效）
export function getCustomWealthTierConfigs(): any[] {
  try {
    const saved = localStorage.getItem('BANK_ASSISTANT_PROCESSES_V4') || localStorage.getItem('BANK_ASSISTANT_PROCESSES_V3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const wealthProc = parsed.find((p: any) => p.id === 'proc-wealth-manage');
        const step3Node = wealthProc?.nodes?.find((n: any) => n.id === 'wealth-node-3' || n.stepNumber === 3);
        if (step3Node?.tierCardConfigs && Array.isArray(step3Node.tierCardConfigs) && step3Node.tierCardConfigs.length > 0) {
          return step3Node.tierCardConfigs.map((t: WealthTierConfig) => ({
            ...t,
            tierCode: t.tierId,
            tierLabel: t.tierName,
            assetAllocation: t.underlyingAssets,
            returnStructure: t.yieldStructure ? `${t.duration || ''} | ${t.yieldStructure}` : (t.duration || ''),
            worstCaseScenario: t.worstCaseNotice,
            components: ensureTierComponents(t)
          }));
        }
      }
    }
  } catch (e) {
    // ignore storage errors
  }
  return DEFAULT_WEALTH_TIER_CONFIGS.map(t => ({
    ...t,
    tierCode: t.tierId,
    tierLabel: t.tierName,
    assetAllocation: t.underlyingAssets,
    returnStructure: t.yieldStructure ? `${t.duration || ''} | ${t.yieldStructure}` : (t.duration || ''),
    worstCaseScenario: t.worstCaseNotice,
    components: ensureTierComponents(t)
  }));
}


