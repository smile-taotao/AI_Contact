import React, { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneForwarded, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  FileText, 
  Home, 
  Maximize2, 
  Layers, 
  Send, 
  Volume2, 
  CheckCircle2, 
  Settings, 
  MessageSquare, 
  Award, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  Info, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import SmartVoiceAssistantModal from './SmartVoiceAssistantModal';

export const VoiceWorkbench: React.FC = () => {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<'profile' | 'profile_dynamic' | 'info' | 'ivr_mot' | 'heatmap' | 'history'>('profile');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [authInput, setAuthInput] = useState('6222021000188992');
  const [cardType, setCardType] = useState('借记卡');
  const [isServiceInsightEnabled, setIsServiceInsightEnabled] = useState(true);
  const [isDualScreen, setIsDualScreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Accordion state in customer profile details
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    products: false,
    preferences: false,
    tags: false,
    history: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Tree expanded state
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    creditCard: true,
    accountManagement: true
  });

  const [selectedTreeNode, setSelectedTreeNode] = useState('客户信息查询');

  // Customer data state (can be queried or updated)
  const [customer, setCustomer] = useState({
    name: '张三',
    gender: '男',
    occupation: '金融业务人员',
    totalAsset: '100',
    assetBalance: '50',
    liabilityBalance: '40',
    currentBalance: '10',
    tags: [
      '我行员工', '睡眠客户', '代发客户',
      '预授信客户', '临界客户', '45岁',
      '金卡潜在提升客户', '敏感职业'
    ],
    rightInfo: {
      gender: '女',
      age: '24岁',
      education: '本科',
      job: '高级客户经理',
      marital: '已婚',
      company: '上市公司'
    }
  });

  const [assetPeriod, setAssetPeriod] = useState<'month' | 'manage' | 'quarter'>('manage');

  // Products recommended
  const marketingProducts = [
    'XX安现金管理类理财...',
    'XX银理财XX安活期化...',
    '“添盈”固定收益类理财...',
    '“安盈”稳健最低持有30...',
    '“安盈”最低持有一年'
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] text-slate-800 select-none overflow-hidden relative font-sans text-xs">
      
      {/* 1. Sub-Header: Title and Recent Browsing Tags */}
      <div className="h-8 bg-white border-b border-slate-200 px-3 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-800 text-[13px] tracking-tight">智能呼入工作台</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
          <span>最近浏览 ：</span>
          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-50 text-[#1677ff] border border-blue-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1677ff]"></span>
            <span>智能呼入工作台</span>
            <button className="hover:text-blue-800 ml-0.5 cursor-pointer">
              <X size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2 min-h-0">
        
        {/* ================= LEFT COLUMN: Customer Call Info & Navigation Tree (~260px) ================= */}
        <div className="w-[260px] flex-shrink-0 flex flex-col gap-2 overflow-hidden h-full">
          
          {/* Card 1: Customer Call Authentication & Password Verification */}
          <div className="bg-white rounded border border-slate-200 p-2.5 shadow-2xs flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {/* Gray avatar silhouette */}
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-300">
                  <svg className="w-6 h-6 fill-current text-slate-400" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* Top-Right Badge / Medal */}
              <div className="w-8 h-8 rounded bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center shadow-xs">
                <Award size={18} className="text-blue-500" />
              </div>
            </div>

            {/* Quick action buttons row: Phone Call & Voice Chat */}
            <div className="flex items-center space-x-2 mb-2">
              <button 
                title="拨打客户电话"
                className="flex-1 py-1 px-2.5 rounded-full bg-[#1677ff] hover:bg-blue-600 text-white flex items-center justify-center space-x-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Phone size={12} className="fill-white" />
              </button>
              <button 
                title="客户语音交互"
                className="flex-1 py-1 px-2.5 rounded-full bg-[#1677ff] hover:bg-blue-600 text-white flex items-center justify-center space-x-1 shadow-2xs cursor-pointer transition-colors"
              >
                <PhoneForwarded size={12} className="text-white" />
              </button>
            </div>

            {/* Verification status lines */}
            <div className="space-y-1 text-[11px] pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">电话服务密码</span>
                <span className="text-[#ff4d4f] font-medium bg-red-50 px-1 rounded border border-red-100">未通过</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">声纹验证</span>
                <span className="text-[#ff4d4f] font-medium bg-red-50 px-1 rounded border border-red-100">未通过</span>
              </div>
            </div>

            {/* Bottom bind status pills */}
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="inline-flex items-center px-1.5 py-0.2 rounded border border-emerald-300 text-emerald-600 bg-emerald-50 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                  未绑
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 bg-slate-50 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1"></span>
                  未绑
                </span>
              </div>
              <button className="text-[#1677ff] hover:underline font-medium text-[11px] cursor-pointer">
                注册 绑卡
              </button>
            </div>
          </div>

          {/* Card 2: Dropdown Selector & Empty State Document Illustration */}
          <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex flex-col items-center justify-center min-h-[140px] flex-shrink-0">
            <div className="w-full relative mb-2">
              <div className="w-full h-6 border border-slate-200 rounded px-2 flex items-center justify-between text-slate-400 text-[11px] bg-slate-50/50 cursor-pointer hover:border-slate-300">
                <div className="flex items-center space-x-1">
                  <Search size={11} className="text-slate-400" />
                  <span>请选择</span>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </div>
            </div>

            {/* Document sheet illustration matching screenshot */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div className="w-14 h-16 bg-slate-50 border border-slate-200 rounded relative shadow-2xs flex flex-col p-2 space-y-1.5">
                {/* Folded corner */}
                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-slate-200 border-b border-l border-slate-300 rounded-bl"></div>
                <div className="w-5 h-1.5 bg-slate-200 rounded"></div>
                <div className="w-7 h-1 bg-slate-200 rounded"></div>
                <div className="w-6 h-1 bg-slate-200 rounded"></div>
                <div className="w-4 h-1 bg-slate-200 rounded"></div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">暂无信息</span>
            </div>
          </div>

          {/* Card 3: Menu Search & Tree Navigation */}
          <div className="bg-white rounded border border-slate-200 p-2 shadow-2xs flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Search Input Box */}
            <div className="relative mb-2 flex-shrink-0">
              <Search size={12} className="absolute left-2 top-2 text-slate-400" />
              <input 
                type="text" 
                placeholder="请输入菜单关键字"
                value={searchMenuQuery}
                onChange={(e) => setSearchMenuQuery(e.target.value)}
                className="w-full h-7 pl-6 pr-2 bg-slate-50 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            {/* Tree Navigation Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar text-[11px] space-y-1">
              {/* Node 1: 信用卡业务 */}
              <div>
                <div 
                  onClick={() => setTreeExpanded(prev => ({ ...prev, creditCard: !prev.creditCard }))}
                  className="flex items-center space-x-1.5 py-1 px-1 rounded hover:bg-slate-50 cursor-pointer font-medium text-slate-800"
                >
                  {treeExpanded.creditCard ? (
                    <ChevronDown size={13} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={13} className="text-slate-400" />
                  )}
                  <div className="w-3.5 h-3.5 bg-[#1677ff] rounded-xs flex items-center justify-center text-white">
                    <Folder size={10} className="fill-white" />
                  </div>
                  <span>信用卡业务</span>
                </div>

                {treeExpanded.creditCard && (
                  <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-2.5">
                    <div 
                      onClick={() => setSelectedTreeNode('信用卡测试测试')}
                      className={`py-0.5 px-2 rounded cursor-pointer ${selectedTreeNode === '信用卡测试测试' ? 'bg-blue-50 text-[#1677ff] font-medium' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      信用卡测试测试
                    </div>

                    {/* Sub-node: 账户/卡资料管理 */}
                    <div>
                      <div 
                        onClick={() => setTreeExpanded(prev => ({ ...prev, accountManagement: !prev.accountManagement }))}
                        className="flex items-center space-x-1.5 py-0.5 px-1 rounded hover:bg-slate-50 cursor-pointer font-medium text-slate-700"
                      >
                        {treeExpanded.accountManagement ? (
                          <ChevronDown size={12} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={12} className="text-slate-400" />
                        )}
                        <div className="w-3.5 h-3.5 bg-[#1677ff] rounded-xs flex items-center justify-center text-white">
                          <Folder size={9} className="fill-white" />
                        </div>
                        <span>账户/卡资料管理</span>
                      </div>

                      {treeExpanded.accountManagement && (
                        <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-2">
                          {[
                            '客户信息查询',
                            '账户资料查询',
                            '卡资料查询',
                            '客户资料修改',
                            '账单日查询/修改'
                          ].map((leaf) => (
                            <div 
                              key={leaf}
                              onClick={() => setSelectedTreeNode(leaf)}
                              className={`py-0.5 px-1.5 rounded cursor-pointer transition-colors ${
                                selectedTreeNode === leaf 
                                  ? 'bg-blue-50 text-[#1677ff] font-semibold' 
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {leaf}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT AREA: Marketing & Service Insights, Auth Bar, Customer Profile ================= */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden h-full min-w-0">
          
          {/* Top Row: Two Big Insight Cards (营销洞察 & 服务洞察) */}
          <div className="h-[175px] flex-shrink-0 flex gap-2 overflow-hidden">
            
            {/* Card 1: 营销洞察 (Marketing Insights) ~58% */}
            <div className="flex-[3] bg-white rounded border border-slate-200 p-2 shadow-2xs flex flex-col overflow-hidden">
              {/* Header with Title and Notification Broadcast Ticker */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1 h-3.5 bg-[#1677ff] rounded-full mr-0.5"></div>
                  <span className="font-bold text-slate-800 text-[12.5px]">营销洞察</span>
                </div>

                {/* Announcement Ticker Bar */}
                <div className="flex-1 max-w-[460px] mx-2 bg-blue-50/60 rounded px-2 py-0.5 flex items-center justify-between text-[11px] text-slate-700 border border-blue-100/60">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-[#1677ff]">🔔</span>
                    <span className="truncate">客户可参与一下营销活动，请加强营销力度:1、可以参加分期五折优惠券活动；2、分期满10000元可优惠换购扫地机器人；3、办理3期分期可享受0利息优惠</span>
                  </div>
                  <button title="发送营销话术" className="text-[#1677ff] hover:text-blue-700 ml-1.5 cursor-pointer flex-shrink-0">
                    <Send size={12} className="rotate-45" />
                  </button>
                </div>
              </div>

              {/* 3 Columns Inside Marketing Insight */}
              <div className="flex-1 flex gap-2 pt-1.5 min-h-0 overflow-hidden">
                
                {/* Column A: 增值产品推荐 */}
                <div className="w-36 flex-shrink-0 flex flex-col border border-slate-200 rounded relative overflow-hidden bg-slate-50/30">
                  {/* Top Ribbon Header */}
                  <div className="bg-[#1677ff] text-white text-[10px] font-medium py-0.5 px-2 text-center shadow-xs">
                    增值产品推荐
                  </div>
                  <div className="flex-1 p-1.5 space-y-1 overflow-y-auto custom-scrollbar text-[10.5px]">
                    {marketingProducts.map((prod, idx) => (
                      <div 
                        key={idx}
                        className="truncate text-slate-700 hover:text-blue-600 cursor-pointer py-0.5 hover:bg-white rounded px-1 transition-colors"
                        title={prod}
                      >
                        {prod}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column B: Marketing Script Box */}
                <div className="flex-1 border border-slate-200 rounded p-2 overflow-y-auto custom-scrollbar bg-slate-50/40 text-[11.5px] leading-relaxed text-slate-700">
                  客户可参与一下营销活动，请加强营销力度:1、可以参加分期五折优惠券活动；2、分期满10000元可优惠换购扫地机器人；3、办理3期分期可享受0利息优惠
                </div>

                {/* Column C: 服务产品推荐 */}
                <div className="w-32 flex-shrink-0 flex flex-col border border-slate-200 rounded relative overflow-hidden bg-slate-50/30">
                  <div className="bg-[#1677ff] text-white text-[10px] font-medium py-0.5 px-2 text-center shadow-xs">
                    服务产品推荐
                  </div>
                  <div className="flex-1 p-2 flex items-center justify-center text-slate-400 text-[10.5px]">
                    暂无推荐服务
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 服务洞察 (Service Insights) ~42% */}
            <div className="flex-[2] bg-white rounded border border-slate-200 p-2 shadow-2xs flex flex-col overflow-hidden">
              {/* Header with Switch and Special Rules Button */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-3.5 bg-[#1677ff] rounded-full mr-0.5"></div>
                  <span className="font-bold text-slate-800 text-[12.5px]">服务洞察</span>
                  
                  {/* Toggle Switch */}
                  <button 
                    onClick={() => setIsServiceInsightEnabled(prev => !prev)}
                    className={`w-9 h-4 rounded-full transition-colors relative cursor-pointer ${isServiceInsightEnabled ? 'bg-blue-200' : 'bg-slate-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-0.25 transition-transform ${isServiceInsightEnabled ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>

                <button className="px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[#1677ff] text-[10.5px] hover:bg-blue-100 transition-colors cursor-pointer">
                  业务特殊判断提示
                </button>
              </div>

              {/* Inner 2 Sub-Cards: 用户洞察 & 主动服务 */}
              <div className="flex-1 flex gap-2 pt-1.5 min-h-0 overflow-hidden">
                {/* Sub-Card 1: 用户洞察 */}
                <div className="flex-1 border border-slate-200 rounded flex flex-col overflow-hidden bg-slate-50/20">
                  <div className="bg-slate-100/70 px-2 py-1 flex items-center justify-between border-b border-slate-200 text-[11px]">
                    <span className="font-semibold text-slate-700 bg-blue-500 text-white px-1.5 py-0.2 rounded-xs text-[10px]">用户洞察</span>
                    <button className="text-[#1677ff] hover:underline text-[10.5px] cursor-pointer">更多</button>
                  </div>
                  <div className="flex-1 p-2 flex items-center justify-center text-slate-400 text-[11px]">
                    近期常查账单明细
                  </div>
                </div>

                {/* Sub-Card 2: 主动服务 */}
                <div className="flex-1 border border-slate-200 rounded flex flex-col overflow-hidden bg-slate-50/20">
                  <div className="bg-slate-100/70 px-2 py-1 flex items-center justify-between border-b border-slate-200 text-[11px]">
                    <span className="font-semibold text-slate-700 bg-blue-500 text-white px-1.5 py-0.2 rounded-xs text-[10px]">主动服务</span>
                  </div>
                  <div className="flex-1 p-2 flex items-center justify-center text-slate-400 text-[11px]">
                    提醒客户年费优惠到期
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Function Bar & Authentication Bar */}
          <div className="h-9 bg-white rounded border border-slate-200 px-2 flex items-center justify-between flex-shrink-0 shadow-2xs text-xs">
            {/* Left Controls: 菜单选择 & 交易首页 */}
            <div className="flex items-center space-x-2">
              <button className="h-6 px-2.5 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-medium flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors text-[11px]">
                <Layers size={12} />
                <span>菜单选择</span>
              </button>

              <button className="h-6 px-2.5 rounded bg-white border border-slate-200 text-slate-700 hover:text-[#1677ff] font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[11px]">
                <Home size={12} className="text-[#1677ff]" />
                <span>交易首页</span>
              </button>
            </div>

            {/* Center: Identity Authentication Search Capsule */}
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-700 text-[11.5px]">身份认证</span>
              
              <div className="flex items-center border border-blue-400 rounded-full bg-white h-6 overflow-hidden px-1 shadow-2xs">
                <select 
                  value={cardType} 
                  onChange={(e) => setCardType(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-700 outline-none pr-1 pl-1 cursor-pointer font-medium"
                >
                  <option value="借记卡">借记卡</option>
                  <option value="信用卡">信用卡</option>
                  <option value="身份证">身份证</option>
                </select>
                <div className="w-[1px] h-3.5 bg-slate-300 mx-1"></div>
                <input 
                  type="text" 
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  placeholder="输入内容.."
                  className="w-36 text-[11px] text-slate-800 outline-none bg-transparent"
                />
              </div>

              <button 
                onClick={() => {
                  setCustomer(prev => ({ ...prev, name: '张三' }));
                }}
                className="h-6 px-3 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-medium shadow-2xs cursor-pointer text-[11px] transition-colors"
              >
                查询
              </button>
            </div>

            {/* Right Quick Tools: Search, Add custom menu, Zoom, Dual-screen mode */}
            <div className="flex items-center space-x-1.5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="请输入内容"
                  className="h-6 w-28 pl-2 pr-6 border border-slate-200 rounded text-[11px] outline-none focus:border-blue-400 bg-slate-50/50"
                />
                <Search size={11} className="absolute right-2 top-1.5 text-slate-400" />
              </div>

              <button className="h-6 px-2 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-medium flex items-center space-x-0.5 cursor-pointer text-[11px] transition-colors">
                <span>+ 自定义菜单</span>
              </button>

              <button 
                onClick={() => setIsFullscreen(prev => !prev)}
                className="h-6 px-2 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-medium flex items-center space-x-0.5 cursor-pointer text-[11px] transition-colors"
                title="全屏放大"
              >
                <Maximize2 size={11} />
                <span>放大</span>
              </button>

              <button 
                onClick={() => setIsDualScreen(prev => !prev)}
                className="h-6 px-2 rounded bg-[#003eb3] hover:bg-blue-800 text-white font-medium flex items-center space-x-1 cursor-pointer text-[11px] transition-colors"
                title="开启双屏模式"
              >
                <Layers size={11} />
                <span>双屏模式</span>
              </button>
            </div>
          </div>

          {/* Bottom Tabs Card: 客户画像 (Customer 360 & Assets & Profile) */}
          <div className="flex-1 bg-white rounded border border-slate-200 p-2.5 shadow-2xs flex flex-col min-h-0 overflow-hidden">
            
            {/* Tabs Header */}
            <div className="flex items-center space-x-6 border-b border-slate-200 pb-1.5 flex-shrink-0 text-xs">
              {[
                { id: 'profile', label: '客户画像' },
                { id: 'profile_dynamic', label: '客户画像(动态)' },
                { id: 'info', label: '客户信息' },
                { id: 'ivr_mot', label: 'IVR轨迹与MOT' },
                { id: 'heatmap', label: '进线热力图' },
                { id: 'history', label: '交互历史' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-1 font-medium transition-colors cursor-pointer relative ${
                    activeTab === tab.id 
                      ? 'text-[#1677ff] font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-[-7px] left-0 right-0 h-[2.5px] bg-[#1677ff] rounded-t"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1 Content: 客户画像 (Exact replica of the screenshot) */}
            {activeTab === 'profile' && (
              <div className="flex-1 flex gap-3 pt-2 min-h-0 overflow-hidden">
                
                {/* 1. Left Sub-Card: 基本信息 (Basic Info) */}
                <div className="w-[200px] flex-shrink-0 flex flex-col justify-between border-r border-slate-100 pr-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-[13px]">基本信息</span>
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-xs">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11.5px] text-slate-700 mb-3">
                      <div><span className="text-slate-400 mr-2">姓名</span><span className="font-medium text-slate-900">{customer.name}</span></div>
                      <div><span className="text-slate-400 mr-2">性别</span><span>{customer.gender}</span></div>
                      <div><span className="text-slate-400 mr-2">职业</span><span>{customer.occupation}</span></div>
                    </div>

                    {/* Customer Tag Pills in rows */}
                    <div className="flex flex-wrap gap-1.5">
                      {customer.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] whitespace-nowrap shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Middle Sub-Card: 资产负债 (Assets and Liabilities Donut) */}
                <div className="w-[240px] flex-shrink-0 flex flex-col justify-between border-r border-slate-100 pr-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[13px]">资产负债</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-lg font-black text-slate-900 tabular-nums">{customer.totalAsset}</span>
                        <span className="text-[11px] text-slate-500">万元</span>
                      </div>
                    </div>

                    {/* Donut Chart with Legend */}
                    <div className="flex items-center justify-between py-1">
                      {/* SVG Donut */}
                      <div className="w-20 h-20 relative flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          {/* Background ring */}
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                          {/* Segment 1: Asset 50% Blue */}
                          <circle 
                            cx="18" cy="18" r="14" fill="transparent" 
                            stroke="#1677ff" strokeWidth="6"
                            strokeDasharray="44 100"
                            strokeDashoffset="0"
                          />
                          {/* Segment 2: Liability 40% Teal */}
                          <circle 
                            cx="18" cy="18" r="14" fill="transparent" 
                            stroke="#00b96b" strokeWidth="6"
                            strokeDasharray="35 100"
                            strokeDashoffset="-44"
                          />
                          {/* Segment 3: Current Balance 10% Yellow */}
                          <circle 
                            cx="18" cy="18" r="14" fill="transparent" 
                            stroke="#faad14" strokeWidth="6"
                            strokeDasharray="10 100"
                            strokeDashoffset="-79"
                          />
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="space-y-1 text-[10.5px] text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1677ff]"></span>
                          <span className="text-slate-500">资产余额</span>
                          <span className="font-medium">{customer.assetBalance}万元</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00b96b]"></span>
                          <span className="text-slate-500">负债余额</span>
                          <span className="font-medium">{customer.liabilityBalance}万元</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#faad14]"></span>
                          <span className="text-slate-500">活期余额</span>
                          <span className="font-medium">{customer.currentBalance}万元</span>
                        </div>
                      </div>
                    </div>

                    {/* Two Mini Balances with Card Icons */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="w-6 h-4 bg-blue-500 rounded-xs flex items-center justify-center text-white text-[8px]">
                          💳
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800">0万元</span>
                      </div>

                      <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="w-6 h-4 bg-orange-500 rounded-xs flex items-center justify-center text-white text-[8px]">
                          💳
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800">0万元</span>
                      </div>
                    </div>
                  </div>

                  {/* Period Selector Tabs at Bottom */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] text-slate-500">
                    <button 
                      onClick={() => setAssetPeriod('month')}
                      className={`hover:text-blue-600 cursor-pointer ${assetPeriod === 'month' ? 'text-blue-600 font-semibold' : ''}`}
                    >
                      月日均
                    </button>
                    <button 
                      onClick={() => setAssetPeriod('manage')}
                      className={`hover:text-blue-600 cursor-pointer ${assetPeriod === 'manage' ? 'text-blue-600 font-bold' : ''}`}
                    >
                      管理资产
                    </button>
                    <button 
                      onClick={() => setAssetPeriod('quarter')}
                      className={`hover:text-blue-600 cursor-pointer ${assetPeriod === 'quarter' ? 'text-blue-600 font-semibold' : ''}`}
                    >
                      季日均
                    </button>
                  </div>
                </div>

                {/* 3. Center Section: Circular Radar / Customer 360 Ring Graphic */}
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                  <div className="w-60 h-60 relative flex items-center justify-center">
                    {/* Concentric rings */}
                    <div className="absolute inset-0 rounded-full border border-blue-200/80"></div>
                    <div className="absolute inset-4 rounded-full border border-blue-300/60"></div>
                    <div className="absolute inset-8 rounded-full border border-blue-400/40 bg-gradient-to-tr from-blue-50/40 to-indigo-50/40"></div>
                    
                    {/* Sector Arc Labels */}
                    <span className="absolute top-2 text-[10.5px] font-semibold text-blue-700 bg-white/90 px-1 rounded shadow-2xs">
                      基本信息
                    </span>
                    <span className="absolute top-10 right-4 text-[10.5px] font-semibold text-blue-700 bg-white/90 px-1 rounded shadow-2xs">
                      资产负债
                    </span>
                    <span className="absolute bottom-6 right-8 text-[10.5px] font-semibold text-blue-700 bg-white/90 px-1 rounded shadow-2xs">
                      产品持有
                    </span>
                    <span className="absolute bottom-10 left-4 text-[10.5px] font-semibold text-blue-700 bg-white/90 px-1 rounded shadow-2xs">
                      签约...
                    </span>

                    {/* Center glowing avatar circle */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600 shadow-md shadow-blue-400/30 flex items-center justify-center text-white relative z-10 border-2 border-white">
                      <svg className="w-9 h-9 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {/* Tech scanner line */}
                      <div className="absolute inset-x-2 h-0.5 bg-cyan-300 shadow-cyan-300 shadow-sm animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* 4. Right Section: 客户画像信息展示 (Accordion Groups) */}
                <div className="w-[280px] flex-shrink-0 border-l border-slate-100 pl-3 flex flex-col justify-start overflow-y-auto custom-scrollbar">
                  <div className="text-center font-bold text-[#1677ff] text-[11.5px] tracking-wider mb-2">
                    &gt;&gt; 客户画像信息展示 &lt;&lt;
                  </div>

                  {/* Accordion 1: 基本信息 */}
                  <div className="border-b border-slate-100 pb-1.5 mb-1.5">
                    <button 
                      onClick={() => toggleSection('basic')}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-800 font-semibold cursor-pointer hover:text-blue-600"
                    >
                      <div className="flex items-center space-x-1.5">
                        <FileText size={13} className="text-blue-500" />
                        <span>基本信息</span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedSections.basic ? '' : '-rotate-90'}`} />
                    </button>

                    {expandedSections.basic && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          性别: {customer.rightInfo.gender}
                        </span>
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          年龄: {customer.rightInfo.age}
                        </span>
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          学历: {customer.rightInfo.education}
                        </span>
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          职业: {customer.rightInfo.job}
                        </span>
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          婚姻状况: {customer.rightInfo.marital}
                        </span>
                        <span className="border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 px-2 py-1 rounded text-[10.5px]">
                          所属公司: {customer.rightInfo.company}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: 产品持有 */}
                  <div className="border-b border-slate-100 pb-1.5 mb-1.5">
                    <button 
                      onClick={() => toggleSection('products')}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-500">🟢</span>
                        <span>产品持有</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedSections.products ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSections.products && (
                      <div className="text-[10.5px] text-slate-600 pl-4 py-1 space-y-0.5">
                        <div>• 信用卡金卡 (额度 50,000元)</div>
                        <div>• 储蓄借记卡一类户 (正常)</div>
                        <div>• 手机银行签约用户 (已开通)</div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: 客户偏好 */}
                  <div className="border-b border-slate-100 pb-1.5 mb-1.5">
                    <button 
                      onClick={() => toggleSection('preferences')}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-500">👤</span>
                        <span>客户偏好</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedSections.preferences ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSections.preferences && (
                      <div className="text-[10.5px] text-slate-600 pl-4 py-1 space-y-0.5">
                        <div>• 偏好沟通渠道: 电话 / 短信</div>
                        <div>• 偏好理财期限: 6-12个月稳健型</div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 4: 行为标签 */}
                  <div className="border-b border-slate-100 pb-1.5 mb-1.5">
                    <button 
                      onClick={() => toggleSection('tags')}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-purple-500">🏷️</span>
                        <span>行为标签</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedSections.tags ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSections.tags && (
                      <div className="text-[10.5px] text-slate-600 pl-4 py-1 space-y-0.5">
                        <div>• 高频消费: 商超、餐饮</div>
                        <div>• 最近活跃: 2小时前APP登录</div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 5: 历史记录 */}
                  <div>
                    <button 
                      onClick={() => toggleSection('history')}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500">📜</span>
                        <span>交互历史</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expandedSections.history ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSections.history && (
                      <div className="text-[10.5px] text-slate-600 pl-4 py-1 space-y-0.5">
                        <div>• 2023-12-28 账单日咨询 (IVR已办结)</div>
                        <div>• 2023-11-15 提额申请 (已通过)</div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* Other tabs support realistic preview */}
            {activeTab === 'profile_dynamic' && (
              <div className="flex-1 p-4 flex flex-col justify-center items-center text-slate-500">
                <TrendingUp size={28} className="text-blue-500 mb-2" />
                <span className="font-semibold text-slate-800 text-sm">客户动态画像与行为评分</span>
                <p className="text-xs text-slate-400 mt-1">实时计算的风险等级：低风险 · 消费活跃度指数：88分</p>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar text-xs">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-400 w-24">证件类型</td>
                      <td className="py-1.5 font-medium">居民身份证</td>
                      <td className="py-1.5 text-slate-400 w-24">证件号码</td>
                      <td className="py-1.5 font-mono">11010119990101****</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-400">手机号码</td>
                      <td className="py-1.5 font-mono">138****8888</td>
                      <td className="py-1.5 text-slate-400">联系地址</td>
                      <td className="py-1.5">北京市海淀区中关村南大街</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-400">开户网点</td>
                      <td className="py-1.5">总行营业部</td>
                      <td className="py-1.5 text-slate-400">签约状态</td>
                      <td className="py-1.5 text-emerald-600">正常服务中</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'ivr_mot' && (
              <div className="flex-1 p-3 flex flex-col space-y-2 overflow-y-auto custom-scrollbar text-xs">
                <div className="font-semibold text-slate-700">本次进线IVR节点轨迹</div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">欢迎语</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">身份校验</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">按键1: 信用卡业务</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">人工坐席接入</span>
                </div>
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div className="flex-1 p-4 flex flex-col justify-center items-center text-slate-500">
                <PieChartIcon size={28} className="text-blue-500 mb-2" />
                <span className="font-semibold text-slate-800 text-sm">进线时间分布与频次热力图</span>
                <p className="text-xs text-slate-400 mt-1">周一至周五 09:30 - 11:30 为该客户常进线咨询高峰时段</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar text-xs space-y-2">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-800">2023-12-28 14:22:10 语音呼入</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">工单号: GD20231228001 · 诉求: 信用卡额度提升建议</p>
                  </div>
                  <span className="text-emerald-600 font-medium text-[11px]">已办结</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-slate-800">2023-11-15 10:05:40 手机银行在线会话</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">工单号: GD20231115089 · 诉求: 咨询借记卡年费优惠</p>
                  </div>
                  <span className="text-emerald-600 font-medium text-[11px]">已办结</span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 3. Bottom Status Bar (Footer - exact text and items from screenshot) */}
      <div className="h-7 bg-[#0f172a] text-slate-300 px-3 flex items-center justify-between flex-shrink-0 text-[11px] border-t border-slate-800 font-sans">
        <div className="flex items-center space-x-5 text-slate-300">
          <span>坐席姓名: <strong className="font-semibold text-white">李秋水</strong></span>
          <span>坐席工号: <strong className="font-semibold text-white font-mono">90011</strong></span>
          <span>坐席分机号: <strong className="font-semibold text-white font-mono">1001</strong></span>
          <span>时间: <strong className="font-normal text-slate-300 font-mono">2023-12-30</strong></span>
          <span>当日积点: <strong className="font-normal text-slate-300 font-mono">0.00</strong></span>
          <span>金额: <strong className="font-normal text-slate-300 font-mono">0.00</strong></span>
          <span>当日累计积点: <strong className="font-normal text-slate-300 font-mono">0.00</strong></span>
          <span>EPPC: <strong className="font-normal text-slate-300 font-mono">0.00</strong></span>
        </div>

        <div className="flex items-center space-x-2">
          {/* IM 99+ Button */}
          <button 
            title="即时通讯消息"
            className="h-5 px-2 rounded-full bg-[#1677ff] hover:bg-blue-600 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs cursor-pointer transition-colors"
          >
            <MessageSquare size={10} className="fill-white" />
            <span>IM 99+</span>
          </button>
        </div>
      </div>

      {/* Floating Gear Tool Button (Right Edge matching screenshot) */}
      <button 
        title="工作台配置与自定义"
        className="fixed right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#1677ff] hover:bg-blue-600 text-white rounded-l flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 z-40"
      >
        <Settings size={15} className="animate-spin-slow" />
      </button>

      {/* Floating Draggable Smart Voice Assistant Icon & Modal */}
      <SmartVoiceAssistantModal />

    </div>
  );
};

export default VoiceWorkbench;
