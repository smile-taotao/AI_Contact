export interface RiskQuestionOption {
  key: string;       // 'A', 'B', 'C', 'D', 'E'
  label: string;     // 'A. 18—24岁（-2）'
  value: string;     // '18—24岁'
  score: number;     // -2
  desc?: string;
}

export interface RiskQuestion {
  id: string;        // 'q1', 'q2', ... 'q11'
  index: number;     // 1 to 11
  title: string;     // 'Q1. 您的年龄是？'
  shortTitle: string; // '年龄'
  options: RiskQuestionOption[];
}

export const RISK_LEVEL_REFERENCE_NOTE = 
  '等级判定参考：总分对应C1—C5，具体分值区间以所在机构的适当性制度为准。常见区间如：C1谨慎型（可接受低风险，本金损失概率低）、C2稳健型（可接受中低风险）、C3平衡型（可接受中等风险）、C4进取型（可接受中高风险）、C5激进型（可接受高风险）。（该段作为注释）';

export const RISK_ASSESSMENT_QUESTIONS: RiskQuestion[] = [
  {
    id: 'q1',
    index: 1,
    title: 'Q1. 您的年龄是？',
    shortTitle: '年龄',
    options: [
      { key: 'A', label: 'A. 18—24岁（-2）', value: '18—24岁', score: -2 },
      { key: 'B', label: 'B. 25—50岁（0）', value: '25—50岁', score: 0 },
      { key: 'C', label: 'C. 51—60岁（-2）', value: '51—60岁', score: -2 },
      { key: 'D', label: 'D. 61—64岁（-3）', value: '61—64岁', score: -3 },
      { key: 'E', label: 'E. 65岁及以上（-10）', value: '65岁及以上', score: -10 }
    ]
  },
  {
    id: 'q2',
    index: 2,
    title: 'Q2. 您的家庭总资产净值约为（不含自用住宅，扣除未结清贷款及信用卡账单等债务）？',
    shortTitle: '家庭总资产净值',
    options: [
      { key: 'A', label: 'A. 15万元及以下（0）', value: '15万元及以下', score: 0 },
      { key: 'B', label: 'B. 15万—50万元（2）', value: '15万—50万元', score: 2 },
      { key: 'C', label: 'C. 50万—100万元（6）', value: '50万—100万元', score: 6 },
      { key: 'D', label: 'D. 100万—1000万元（8）', value: '100万—1000万元', score: 8 },
      { key: 'E', label: 'E. 1000万元以上（10）', value: '1000万元以上', score: 10 }
    ]
  },
  {
    id: 'q3',
    index: 3,
    title: 'Q3. 在家庭总资产中，可用于金融投资（储蓄存款除外）的比例约为？',
    shortTitle: '投资资金比例',
    options: [
      { key: 'A', label: 'A. 小于10%（2）', value: '小于10%', score: 2 },
      { key: 'B', label: 'B. 10%—25%（4）', value: '10%—25%', score: 4 },
      { key: 'C', label: 'C. 25%—50%（8）', value: '25%—50%', score: 8 },
      { key: 'D', label: 'D. 大于50%（10）', value: '大于50%', score: 10 }
    ]
  },
  {
    id: 'q4',
    index: 4,
    title: 'Q4. 以下哪项最能说明您的投资经验？',
    shortTitle: '投资经验',
    options: [
      { key: 'A', label: 'A. 除存款、国债外，几乎不投资其他金融产品（0）', value: '除存款、国债外，几乎不投资其他金融产品', score: 0 },
      { key: 'B', label: 'B. 大部分为存款、国债，较少涉及股票、权益类基金等（2）', value: '大部分为存款、国债，较少涉及股票、权益类基金等', score: 2 },
      { key: 'C', label: 'C. 资产较均衡地分布于存款、理财、信托、股票、基金等（6）', value: '资产较均衡地分布于存款、理财、信托、股票、基金等', score: 6 },
      { key: 'D', label: 'D. 大部分投资于股票、权益类基金、外汇等高风险产品（10）', value: '大部分投资于股票、权益类基金、外汇等高风险产品', score: 10 }
    ]
  },
  {
    id: 'q5',
    index: 5,
    title: 'Q5. 您有多少年投资股票、基金、外汇、金融衍生品等风险投资品的经验？',
    shortTitle: '风险投资年限',
    options: [
      { key: 'A', label: 'A. 没有经验（0）', value: '没有经验', score: 0 },
      { key: 'B', label: 'B. 少于2年（2）', value: '少于2年', score: 2 },
      { key: 'C', label: 'C. 2—5年（6）', value: '2—5年', score: 6 },
      { key: 'D', label: 'D. 5—8年（8）', value: '5—8年', score: 8 },
      { key: 'E', label: 'E. 8年以上（10）', value: '8年以上', score: 10 }
    ]
  },
  {
    id: 'q6',
    index: 6,
    title: 'Q6. 以下哪项最符合您的投资态度？',
    shortTitle: '投资态度',
    options: [
      { key: 'A', label: 'A. 厌恶风险，不希望本金损失，希望获得稳定回报（0）', value: '厌恶风险，不希望本金损失，希望获得稳定回报', score: 0 },
      { key: 'B', label: 'B. 保守投资，不愿本金损失，但愿意承受一定幅度的收益波动（4）', value: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动', score: 4 },
      { key: 'C', label: 'C. 寻求较高收益和成长性，愿意为此承担有限本金损失（8）', value: '寻求较高收益和成长性，愿意为此承担有限本金损失', score: 8 },
      { key: 'D', label: 'D. 希望赚取高回报，愿意承担较大本金损失（10）', value: '希望赚取高回报，愿意承担较大本金损失', score: 10 }
    ]
  },
  {
    id: 'q7',
    index: 7,
    title: 'Q7. 假设本金100万元，您会选择哪一种投资机会？',
    shortTitle: '投资机会选择',
    options: [
      { key: 'A', label: 'A. 100%机会赢取1000元，保证归还本金（0）', value: '100%机会赢取1000元，保证归还本金', score: 0 },
      { key: 'B', label: 'B. 50%机会赢取5万元，较高概率归还本金（4）', value: '50%机会赢取5万元，较高概率归还本金', score: 4 },
      { key: 'C', label: 'C. 25%机会赢取50万元，有一定概率损失本金（6）', value: '25%机会赢取50万元，有一定概率损失本金', score: 6 },
      { key: 'D', label: 'D. 10%机会赢取100万元，较高概率损失本金（10）', value: '10%机会赢取100万元，较高概率损失本金', score: 10 }
    ]
  },
  {
    id: 'q8',
    index: 8,
    title: 'Q8. 投资于理财、股票、基金等（不含存款和国债）时，您可接受的最长投资期限是？',
    shortTitle: '最长投资期限',
    options: [
      { key: 'A', label: 'A. 1年以下（4）', value: '1年以下', score: 4 },
      { key: 'B', label: 'B. 1—3年（6）', value: '1—3年', score: 6 },
      { key: 'C', label: 'C. 3—5年（8）', value: '3—5年', score: 8 },
      { key: 'D', label: 'D. 5年以上（10）', value: '5年以上', score: 10 }
    ]
  },
  {
    id: 'q9',
    index: 9,
    title: 'Q9. 您的投资目的是？',
    shortTitle: '投资目的',
    options: [
      { key: 'A', label: 'A. 资产保值（2）', value: '资产保值', score: 2 },
      { key: 'B', label: 'B. 资产稳健增值（6）', value: '资产稳健增值', score: 6 },
      { key: 'C', label: 'C. 资产迅速增值（10）', value: '资产迅速增值', score: 10 }
    ]
  },
  {
    id: 'q10',
    index: 10,
    title: 'Q10. 您的投资出现何种程度的波动时，您会呈现明显的焦虑？',
    shortTitle: '波动焦虑阈值',
    options: [
      { key: 'A', label: 'A. 本金无损失但收益未达预期（-5）', value: '本金无损失但收益未达预期', score: -5 },
      { key: 'B', label: 'B. 出现轻微本金损失（0）', value: '出现轻微本金损失', score: 0 },
      { key: 'C', label: 'C. 本金10%以内的损失（5）', value: '本金10%以内的损失', score: 5 },
      { key: 'D', label: 'D. 本金20%—50%的损失（10）', value: '本金20%—50%的损失', score: 10 },
      { key: 'E', label: 'E. 本金50%以上的损失（15）', value: '本金50%以上的损失', score: 15 }
    ]
  },
  {
    id: 'q11',
    index: 11,
    title: 'Q11. 如果您的投资出现亏损，您的实际感受最接近以下哪项？',
    shortTitle: '亏损实际感受',
    options: [
      { key: 'A', label: 'A. 立刻全部赎回，不再投资（0）', value: '立刻全部赎回，不再投资', score: 0 },
      { key: 'B', label: 'B. 会焦虑，但能持有观察一段时间（4）', value: '会焦虑，但能持有观察一段时间', score: 4 },
      { key: 'C', label: 'C. 理解波动是投资的一部分，能按计划持有（8）', value: '理解波动是投资的一部分，能按计划持有', score: 8 },
      { key: 'D', label: 'D. 认为波动是机会，可能考虑追加投资（10）', value: '认为波动是机会，可能考虑追加投资', score: 10 }
    ]
  }
];

export interface RiskRatingResult {
  totalScore: number;
  levelCode: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  levelName: string;
  shortLevel: string;
  description: string;
  riskRating: string;
  matchedProductTier: string;
}

export function calculateRiskRating(answers: Record<string, string>): RiskRatingResult {
  let totalScore = 0;
  
  RISK_ASSESSMENT_QUESTIONS.forEach(q => {
    const selectedVal = answers[q.id];
    if (selectedVal) {
      const opt = q.options.find(o => o.value === selectedVal || o.label === selectedVal || o.key === selectedVal);
      if (opt) {
        totalScore += opt.score;
      }
    }
  });

  if (totalScore <= 20) {
    return {
      totalScore,
      levelCode: 'C1',
      levelName: 'C1 谨慎型',
      shortLevel: 'C1谨慎型',
      description: '可接受低风险，本金损失概率低',
      riskRating: 'R1 低风险',
      matchedProductTier: 'R1 谨慎型'
    };
  } else if (totalScore <= 45) {
    return {
      totalScore,
      levelCode: 'C2',
      levelName: 'C2 稳健型',
      shortLevel: 'C2稳健型',
      description: '可接受中低风险',
      riskRating: 'R2 中低风险',
      matchedProductTier: 'R2 稳健型'
    };
  } else if (totalScore <= 70) {
    return {
      totalScore,
      levelCode: 'C3',
      levelName: 'C3 平衡型',
      shortLevel: 'C3平衡型',
      description: '可接受中等风险',
      riskRating: 'R3 中等风险',
      matchedProductTier: 'R3 平衡型'
    };
  } else if (totalScore <= 89) {
    return {
      totalScore,
      levelCode: 'C4',
      levelName: 'C4 进取型',
      shortLevel: 'C4进取型',
      description: '可接受中高风险',
      riskRating: 'R4 中高风险',
      matchedProductTier: 'R4 进取型'
    };
  } else {
    return {
      totalScore,
      levelCode: 'C5',
      levelName: 'C5 激进型',
      shortLevel: 'C5激进型',
      description: '可接受高风险',
      riskRating: 'R5 高风险',
      matchedProductTier: 'R5 激进型'
    };
  }
}

// 示范作答数据集（例如一个典型的稳健型投资者答卷，总分42分，评为C2稳健型）
export const SAMPLE_RISK_ANSWERS: Record<string, string> = {
  q1: '25—50岁', // 0
  q2: '50万—100万元', // 6
  q3: '25%—50%', // 8
  q4: '大部分为存款、国债，较少涉及股票、权益类基金等', // 2
  q5: '2—5年', // 6
  q6: '保守投资，不愿本金损失，但愿意承受一定幅度的收益波动', // 4
  q7: '50%机会赢取5万元，较高概率归还本金', // 4
  q8: '1—3年', // 6
  q9: '资产稳健增值', // 6
  q10: '出现轻微本金损失', // 0
  q11: '会焦虑，但能持有观察一段时间' // 4
  // 0 + 6 + 8 + 2 + 6 + 4 + 4 + 6 + 6 + 0 + 4 = 42分 (C2 稳健型)
};
