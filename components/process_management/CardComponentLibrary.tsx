import React from 'react';
import { 
  MessageSquareText, 
  AlertTriangle, 
  CircleDot, 
  CheckSquare, 
  TextCursorInput, 
  BookOpen, 
  SendHorizontal,
  Plus,
  Sparkles,
  Layers
} from 'lucide-react';
import { CardComponentType, FlowCardComponent } from './types';

interface CardComponentLibraryProps {
  onAddComponent: (type: CardComponentType) => void;
  onAddStepNode: () => void;
}

const COMPONENT_DEFINITIONS: {
  type: CardComponentType;
  name: string;
  category: string;
  icon: any;
  color: string;
  bgLight: string;
  border: string;
  description: string;
  previewSnippet: string;
}[] = [
  {
    type: 'SPEECH',
    name: '推荐话术',
    category: '坐席辅助',
    icon: MessageSquareText,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    description: '坐席专用标准服务开场、排查与安抚推荐话术，支持一键采纳发送',
    previewSnippet: '您好，请您先别着急，我马上协助您排查办理...'
  },
  {
    type: 'NOTICE',
    name: '文本提示/警示栏',
    category: '引导提示',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    description: '核心风控提示、第三方报错辨识、安全警示或办理须知高亮条',
    previewSnippet: '提示：以手机银行系统弹窗为准，第三方报错不一定准确...'
  },
  {
    type: 'RADIO',
    name: '单选选项组 (支持分支流转)',
    category: '互动采集',
    icon: CircleDot,
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: '卡类型、报错代码或渠道偏好单选，每个选项可绑定流转至不同目标节点',
    previewSnippet: '● 储蓄卡/借记卡   ○ 信用卡/贷记卡'
  },
  {
    type: 'CHECKBOX',
    name: '多选选项组',
    category: '互动采集',
    icon: CheckSquare,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: '挂失原因、受限排查项等多选采集，支持客户自定义填写“其他”',
    previewSnippet: '☑ 银行卡遗失   ☑ 疑似被盗   ☑ 异常扣款'
  },
  {
    type: 'INPUT',
    name: '文本输入框',
    category: '互动采集',
    icon: TextCursorInput,
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50',
    border: 'border-cyan-200',
    description: '补充原因填写、卡号后四位或自定义反馈说明文本框',
    previewSnippet: '请输入其他具体原因或补充说明...'
  },
  {
    type: 'GUIDE',
    name: '详细指引与折叠卡',
    category: '操作指引',
    icon: BookOpen,
    color: 'text-purple-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    description: '各渠道APP办理路径、所需身份证件材料清单、时效与核心注意事项',
    previewSnippet: '路径：手机银行APP -> 账户管理 -> 安全挂失...'
  },
  {
    type: 'BUTTON',
    name: '操作/提交按钮',
    category: '流转控制',
    icon: SendHorizontal,
    color: 'text-sky-600',
    bgLight: 'bg-sky-50',
    border: 'border-sky-200',
    description: '卡片底部的动作按钮，如“确认提交”、“采纳发送”、“完成指引”',
    previewSnippet: '【确认提交信息并获取下一步指引】'
  }
];

export const createDefaultComponent = (type: CardComponentType): FlowCardComponent => {
  const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  switch (type) {
    case 'SPEECH':
      return {
        id,
        type: 'SPEECH',
        title: '推荐服务话术',
        speechText: '您好，针对您咨询的问题，我已为您生成专属指引方案，请您查看下方卡片：',
        suggestSpeed: '语速适中'
      };
    case 'NOTICE':
      return {
        id,
        type: 'NOTICE',
        title: '关键业务提示',
        noticeType: 'info',
        noticeText: '提示：请按照官方指引核验身份信息，防范资金交易风险。'
      };
    case 'RADIO':
      return {
        id,
        type: 'RADIO',
        title: '业务类型/渠道单选',
        fieldName: 'selection',
        required: true,
        defaultValue: '选项一',
        options: [
          { id: `opt-${Date.now()}-1`, label: '选项一 (默认)', value: '选项一', desc: '说明描述一' },
          { id: `opt-${Date.now()}-2`, label: '选项二', value: '选项二', desc: '说明描述二' }
        ]
      };
    case 'CHECKBOX':
      return {
        id,
        type: 'CHECKBOX',
        title: '确认事项/原因 (可多选)',
        fieldName: 'multiItems',
        required: true,
        allowOther: true,
        otherPlaceholder: '其他说明（可自由填写）',
        options: [
          { id: `chk-${Date.now()}-1`, label: '排查项一', value: '排查项一' },
          { id: `chk-${Date.now()}-2`, label: '排查项二', value: '排查项二' }
        ]
      };
    case 'INPUT':
      return {
        id,
        type: 'INPUT',
        title: '补充信息录入',
        fieldName: 'customRemarks',
        label: '补充说明',
        placeholder: '请输入补充详细说明...',
        multiline: true,
        maxLength: 200,
        required: false
      };
    case 'GUIDE':
      return {
        id,
        type: 'GUIDE',
        title: '办理路径与材料清单',
        channelName: '业务办理指引',
        pathSteps: [
          '第一步：登录对应业务渠道或前往指定服务网点',
          '第二步：在业务列表中进入安全设置',
          '第三步：配合完成身份核验并提交确认'
        ],
        materials: ['本人有效二代身份证原件', '预留手机号动态短信验证码'],
        duration: '办理耗时约 2-5 分钟',
        notices: ['请妥善保管个人账户信息，切勿透露验证码']
      };
    case 'BUTTON':
      return {
        id,
        type: 'BUTTON',
        title: '操作确认按钮',
        buttonText: '确认并进入下一步',
        actionType: 'SUBMIT_CONFIRM',
        showOnLastQuestion: true,
        hintText: '点击后自动流转至下一关联节点'
      };
  }
};

export const CardComponentLibrary: React.FC<CardComponentLibraryProps> = ({
  onAddComponent,
  onAddStepNode
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-72 flex-shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
              <Layers size={14} />
            </div>
            <span className="text-[13px] font-bold text-slate-800">卡片组件物料库</span>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono font-medium">
            7大物料
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          点击物料可向当前选中的步骤卡片自由叠加组合，组装完整流程卡。
        </p>
      </div>

      {/* Add Step Node Primary Action */}
      <div className="p-3 border-b border-slate-200 bg-blue-50/60">
        <button
          onClick={onAddStepNode}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 px-3 rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>+ 添加新步骤卡片节点</span>
        </button>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          可自由组合的卡片组件
        </div>

        {COMPONENT_DEFINITIONS.map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.type}
              onClick={() => onAddComponent(comp.type)}
              className="group bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 transition-all shadow-xs hover:shadow-md cursor-pointer relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-lg ${comp.bgLight} ${comp.color} flex items-center justify-center flex-shrink-0 border ${comp.border}`}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {comp.name}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {comp.category}
                    </span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white rounded-md p-1">
                  <Plus size={12} />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                {comp.description}
              </p>

              {/* Mini Preview Chip */}
              <div className="mt-2 bg-slate-50 rounded px-2 py-1 text-[10px] text-slate-500 font-mono truncate border border-slate-100">
                {comp.previewSnippet}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="p-2.5 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center space-x-1.5">
        <Sparkles size={13} className="text-blue-500 flex-shrink-0" />
        <span>支持为单选配置分支流转目标</span>
      </div>
    </div>
  );
};

export default CardComponentLibrary;
