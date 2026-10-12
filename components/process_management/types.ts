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
  actionType: 'SUBMIT_CONFIRM' | 'NEXT_STEP' | 'FINISH_FLOW';
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
  components: FlowCardComponent[]; // 自由组合的卡片组件列表
  branches?: BranchRule[];         // 分支流转规则列表 (统一在分支流转规则区域配置)
  defaultNextNodeId?: string;      // 默认下一节点 (无条件流转)
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
  updatedAt: string;
  startNodeId: string;      // 流程入口节点 ID
  nodes: FlowNode[];
}
