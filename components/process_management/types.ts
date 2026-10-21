export type CardComponentType = 
  | 'SPEECH'      // 推荐话术
  | 'NOTICE'      // 文本提示 / 警示栏
  | 'RADIO'       // 单选项
  | 'CHECKBOX'    // 多选项
  | 'INPUT'       // 输入框 / 补充说明
  | 'GUIDE'       // 详细办理指引与材料
  | 'BUTTON';     // 操作 / 提交按钮

export interface RadioOption {
  id: string;
  label: string;
  value: string;
  desc?: string;
  targetNodeId?: string; // 绑定流转目标节点 (用于根据选项分支流转)
}

export interface CheckboxOption {
  id: string;
  label: string;
  value: string;
  desc?: string;
}

export interface BaseComponentConfig {
  id: string;
  type: CardComponentType;
  title?: string;
  description?: string;
  dependsOnField?: string;           // 渐进式交互：依赖前置问题的字段名（上一题有值时才解锁展示）
  showOnLastQuestion?: boolean;      // 按钮组件：是否仅在流转至最后一个客户待确认问题时展示
}

export interface SpeechComponentConfig extends BaseComponentConfig {
  type: 'SPEECH';
  speechText: string;
  suggestSpeed?: string;
  autoFillInput?: boolean;
}

export interface NoticeComponentConfig extends BaseComponentConfig {
  type: 'NOTICE';
  noticeType: 'info' | 'warning' | 'success';
  noticeText: string;
  highlightText?: string;
}

export interface RadioComponentConfig extends BaseComponentConfig {
  type: 'RADIO';
  fieldName: string;
  required?: boolean;
  options: RadioOption[];
  defaultValue?: string;
}

export interface CheckboxComponentConfig extends BaseComponentConfig {
  type: 'CHECKBOX';
  fieldName: string;
  required?: boolean;
  options: CheckboxOption[];
  allowOther?: boolean;
  otherPlaceholder?: string;
  maxSelect?: number;
}

export interface InputComponentConfig extends BaseComponentConfig {
  type: 'INPUT';
  fieldName: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
}

export interface GuideSection {
  id: string;
  title: string;       // 标题 (如: 办理路径、所需材料、办理时效、注意事项、温馨提示 等)
  content: string;     // 内容 (可编辑多行文本或具体说明)
}

export interface GuideComponentConfig extends BaseComponentConfig {
  type: 'GUIDE';
  channelName: string;
  sections?: GuideSection[]; // 通用标题+内容组合列表
  // 兼容老数据结构
  pathSteps?: string[];
  materials?: string[];
  duration?: string;
  notices?: string[];
}

export interface ButtonComponentConfig extends BaseComponentConfig {
  type: 'BUTTON';
  buttonText: string;
  actionType: 'SUBMIT_CONFIRM' | 'NEXT_STEP' | 'FINISH_FLOW' | 'SEND_CARD';
  hintText?: string;
}

export type FlowCardComponent = 
  | SpeechComponentConfig
  | NoticeComponentConfig
  | RadioComponentConfig
  | CheckboxComponentConfig
  | InputComponentConfig
  | GuideComponentConfig
  | ButtonComponentConfig;

// 单项判定条件 (支持单选选项、多选选项包含、输入框包含/不为空/等于等)
export interface ConditionItem {
  id: string;
  componentId: string;    // 关联当前步骤卡片的组件ID
  fieldName?: string;     // 关联的字段名 (如 cardType, reasons, customRemarks 等)
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'IS_NOT_EMPTY' | 'IS_EMPTY'; 
  value: string;          // 目标比对值 (如 '手机银行APP在线挂失' 或 输入框关键词)
}

// 分支流转组合规则 (支持且/或组合、多条件、多选项及客户输入内容判定)
export interface BranchRule {
  id: string;
  name?: string;                     // 规则名称 (如 "选择手机银行且已填备注" 或 "手机银行APP渠道分支")
  logicalOperator?: 'AND' | 'OR';     // 条件关系: 'AND'(满足全部条件) | 'OR'(满足任一条件)，默认 'AND'
  conditions?: ConditionItem[];       // 多条件判定列表
  targetNodeId: string;               // 流转至目标节点 ID
  desc?: string;                      // 补充说明
  // 保持向前兼容的简易字段
  sourceOptionId?: string;
  optionValue?: string;
  conditionLabel?: string;
}

// 通用分级选卡 / 多卡片选项配置 (支持任意节点创建多个卡片选项，每个选项可自由组合不同组件)
export interface WealthTierConfig {
  tierId: string;                     // 选项标识/简称，如 'C1' | 'OPT-1'
  tierName: string;                   // 卡片选项名称，如 'C1 谨慎型' | 'C2 稳健型' | 自定义名称
  components?: FlowCardComponent[];   // 该卡片选项下自由组合的组件列表
  // 以下为兼容理财产品等预设模板的扩展字段
  riskLevel?: string;                 // 如 'R1 低风险'
  productName?: string;               // 推荐产品名称
  benchmark?: string;                 // 业绩比较基准
  duration?: string;                  // 运作周期 / 期限
  minAmount?: string;                 // 起购门槛
  underlyingAssets?: string;          // 底层资产投向通俗讲解
  yieldStructure?: string;            // 收益结构与计息说明
  worstCaseNotice?: string;           // 【必须揭示的最坏情形】
  speechTemplate?: string;            // 该等级对应的坐席专属推荐话术
}

export { 
  DEFAULT_WEALTH_TIER_CONFIGS, 
  WEALTH_RISK_QUESTIONS, 
  WEALTH_PREFERENCE_QUESTIONS,
  RISK_EVALUATION_NOTE,
  calculateRiskEvaluation,
  getCustomWealthTierConfigs,
  ensureTierComponents,
  syncTierFromComponents
} from './wealthConsultationData';

// 画布中的步骤节点
export interface FlowNode {
  id: string;
  stepNumber: number;
  nodeCode: string;         // 如 "01", "02", "03-A"
  title: string;            // 如 "步骤 1: 挂失业务-卡类型与原因确认"
  shortTitle: string;       // 如 "卡种与原因"
  categoryTag?: string;     // 如 "信息收集", "渠道分流", "业务指引", "办结提示"
  description?: string;
  x: number;                // 画布 X 坐标 (px)
  y: number;                // 画布 Y 坐标 (px)
  requiresClientConfirm: boolean; // 是否需要客户在APP端互动确认
  progressiveQuestionFlow?: boolean; // 客户端渐进式逐级确认 (选完上一题自动展示下一题，并在最后一题展示确认按钮)
  showConfirmOnLastQuestionOnly?: boolean; // 确认按钮是否仅在流转至最后一个客户待确认问题时展示
  components: FlowCardComponent[]; // 自由组合的卡片组件列表
  branches?: BranchRule[];         // 分支流转规则列表 (统一在分支流转规则区域配置)
  defaultNextNodeId?: string;      // 默认下一节点 (无条件流转)
  tierCardConfigs?: WealthTierConfig[]; // 步骤三等场景下：坐席可选择不同等级理财产品卡片的内容配置列表
}

// 辅助流程主定义
export interface ProcessDefinition {
  id: string;
  name: string;             // 如 "银行卡挂失"
  shortName: string;        // 如 "卡片挂失"
  category: string;         // 如 "借记卡与账户业务"
  keywords: string[];       // 触发意图关键词，如 ["挂失", "丢卡", "卡掉了", "被盗"]
  description: string;
  version: string;          // 如 "v2.1"
  status: 'PUBLISHED' | 'DRAFT';
  enabled?: boolean;        // 是否启用（true: 启用，聊天中可触发；false: 停用，聊天中不会触发）
  updatedAt: string;
  startNodeId: string;      // 流程入口节点 ID
  nodes: FlowNode[];
}
