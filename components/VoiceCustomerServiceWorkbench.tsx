import React, { useState } from 'react';
import { 
  Bookmark, 
  CreditCard, 
  LayoutGrid, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Settings, 
  FileText, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import VoiceCustomerServiceTopBar from './VoiceCustomerServiceTopBar';
import SmartVoiceAssistantModal from './SmartVoiceAssistantModal';

export const VoiceCustomerServiceWorkbench: React.FC = () => {
  // Authentication & Customer state
  const [authStatus, setAuthStatus] = useState<string>('');
  const [isCustomerLoaded, setIsCustomerLoaded] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'callHistory' | 'ivrHistory' | 'workOrderHistory' | 'ivrTrail' | 'journey'>('profile');
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [appointmentCode, setAppointmentCode] = useState<string>('');

  // Call info state
  const [callInfo, setCallInfo] = useState({
    phone: '',
    customerType: '',
    cardNo: '',
    screenPopupContent: '',
    queue: '',
  });

  // Customer Profile State
  const [customerData, setCustomerData] = useState({
    name: '--',
    channel: '--',
    gender: '--',
    org: '--',
    age: '--',
    customerNo: '--',
    personality: '--',
    marketing: '--',
    tags: [] as string[],
  });

  // Simulate loading sample data or resetting to screenshot state
  const handleConfirmAuth = () => {
    if (!isCustomerLoaded) {
      setIsCustomerLoaded(true);
      setCallInfo({
        phone: '138 0010 8899',
        customerType: '优质零售客户 (财富金卡)',
        cardNo: '6222 0210 **** 8899',
        screenPopupContent: '手机银行转账限额咨询进线',
        queue: '财富客户专线VIP',
      });
      setCustomerData({
        name: '王立新',
        channel: '手机银行APP转人工',
        gender: '男',
        org: '北京朝阳支行营业部',
        age: '42岁',
        customerNo: 'CN89012399',
        personality: '严谨稳健型 / 偏好高效解答',
        marketing: '增金宝理财推荐（命中）',
        tags: ['白金预授信', '代发薪客户', '按揭房贷', '高活跃度手机银行用户', '近30天转账频繁'],
      });
    } else {
      // Toggle back to exact screenshot empty state
      setIsCustomerLoaded(false);
      setCallInfo({
        phone: '',
        customerType: '',
        cardNo: '',
        screenPopupContent: '',
        queue: '',
      });
      setCustomerData({
        name: '--',
        channel: '--',
        gender: '--',
        org: '--',
        age: '--',
        customerNo: '--',
        personality: '--',
        marketing: '--',
        tags: [],
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] select-none overflow-hidden relative font-sans text-xs text-slate-800">
      
      {/* 1. Dedicated Top Bar matching reference screenshot exactly */}
      <VoiceCustomerServiceTopBar />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-2.5 gap-2.5 min-h-0">
        
        {/* ================= LEFT COLUMN (~280px) ================= */}
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-2.5 overflow-hidden h-full">
          
          {/* Card 1: Incoming Call Info Card */}
          <div className="bg-gradient-to-b from-[#eaf2ff] via-[#f7faff] to-white rounded-md border border-slate-200/90 p-3 shadow-2xs flex-shrink-0">
            {/* Avatar & Phone Header */}
            <div className="flex items-center space-x-3 mb-3">
              {/* Female Service Avatar Circle */}
              <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#dbeafe" />
                  {/* Hair */}
                  <path d="M25 45 C25 25, 75 25, 75 45 C75 58, 70 65, 70 65 C70 65, 65 35, 50 35 C35 35, 30 65, 30 65 C30 65, 25 58, 25 45 Z" fill="#2d3748" />
                  {/* Face */}
                  <circle cx="50" cy="46" r="16" fill="#fde68a" />
                  {/* Bangs */}
                  <path d="M35 40 Q50 48 65 40 Q50 32 35 40 Z" fill="#1a202c" />
                  {/* Eyes & Smile */}
                  <circle cx="44" cy="45" r="1.5" fill="#2d3748" />
                  <circle cx="56" cy="45" r="1.5" fill="#2d3748" />
                  <path d="M47 52 Q50 55 53 52" stroke="#e11d48" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Clothes / Blazer */}
                  <path d="M22 88 C25 65, 40 60, 50 60 C60 60, 75 65, 78 88 Z" fill="#1e40af" />
                  {/* Shirt / Collar */}
                  <path d="M43 60 L50 72 L57 60 Z" fill="#ffffff" />
                  <path d="M50 70 L50 88" stroke="#cbd5e1" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Title & Appointment Button */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-800 leading-tight flex items-center flex-wrap gap-1">
                  <span>来电号码：</span>
                  {callInfo.phone && (
                    <span className="font-mono text-blue-600 font-bold">{callInfo.phone}</span>
                  )}
                </div>
                <div className="mt-1">
                  <button 
                    onClick={() => setShowAppointmentModal(true)}
                    className="px-2.5 py-0.5 rounded bg-[#1677ff] hover:bg-blue-600 text-white font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                  >
                    预约码
                  </button>
                </div>
              </div>
            </div>

            {/* Information Grid (2 Columns matching screenshot) */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11.5px] pt-1 border-t border-blue-50/80">
              <div className="space-y-1.5">
                <div className="flex items-center text-slate-600">
                  <span className="text-slate-500 mr-1">客户类型:</span>
                  <span className="text-slate-800 truncate">{callInfo.customerType}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <span className="text-slate-500 mr-1">客户卡号:</span>
                  <span className="text-slate-800 truncate font-mono">{callInfo.cardNo}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <span className="text-slate-500 mr-1">弹屏内容:</span>
                  <span className="text-slate-800 truncate">{callInfo.screenPopupContent}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-slate-600">
                  <span className="text-slate-500 mr-1">进线队列:</span>
                  <span className="text-slate-800 truncate">{callInfo.queue}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Card 2: Marketing Recommendation (营销推荐) */}
          <div className="bg-white rounded-md border border-slate-200/90 p-3 shadow-2xs flex-1 flex flex-col">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
              <div className="w-1 h-3.5 bg-[#1677ff] rounded-full"></div>
              <span className="font-bold text-slate-800 text-[12.5px]">营销推荐</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 text-center">
              {isCustomerLoaded ? (
                <div className="space-y-2 text-left w-full">
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    <div className="font-semibold flex items-center space-x-1 text-amber-900 mb-1">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>理财推荐: 增金宝稳健理财</span>
                    </div>
                    <p className="text-[11px] text-amber-700">该客户持有闲置活期资金，推荐申购7天滚动低波理财，年化收益预期 2.85%。</p>
                  </div>
                  <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                    <div className="font-semibold text-blue-900 mb-1">信用卡分期特惠</div>
                    <p className="text-[11px] text-blue-700">受邀享3折手续费率分期还款优惠。</p>
                  </div>
                </div>
              ) : (
                <span className="text-slate-600 text-[11.5px]">客户标签未命中营销活动。</span>
              )}
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN (Flex-1) ================= */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden h-full min-w-0">
          
          {/* Top Control Panel Card */}
          <div className="bg-white rounded-md border border-slate-200/90 p-3 shadow-2xs relative flex-shrink-0">
            {/* Cute Piggy / Mascot Badge in the top right corner matching screenshot */}
            <div 
              className="absolute right-3 top-2.5 w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
              title="智能小助手"
            >
              {/* Stylized piggy mascot with red cap/dress matching screenshot */}
              <svg className="w-7 h-7 drop-shadow-xs" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="22" r="14" fill="#fed7aa" />
                {/* Red hat */}
                <path d="M12 15 C12 7, 28 7, 28 15 Z" fill="#ef4444" />
                <circle cx="20" cy="8" r="3" fill="#facc15" />
                {/* Ears */}
                <ellipse cx="10" cy="18" rx="3" ry="4" fill="#fb923c" />
                <ellipse cx="30" cy="18" rx="3" ry="4" fill="#fb923c" />
                {/* Face features */}
                <ellipse cx="20" cy="24" rx="5" ry="3.5" fill="#f472b6" />
                <circle cx="18.5" cy="24" r="0.8" fill="#831843" />
                <circle cx="21.5" cy="24" r="0.8" fill="#831843" />
                <circle cx="16" cy="20" r="1.2" fill="#1e293b" />
                <circle cx="24" cy="20" r="1.2" fill="#1e293b" />
                {/* Cheeks */}
                <circle cx="13" cy="23" r="1.8" fill="#fb7185" opacity="0.6" />
                <circle cx="27" cy="23" r="1.8" fill="#fb7185" opacity="0.6" />
              </svg>
            </div>

            {/* Row 1: 认证情况 */}
            <div className="flex items-center space-x-2 mb-2.5">
              <span className="text-slate-700 font-medium text-[12px] whitespace-nowrap">认证情况:</span>
              <div className="relative">
                <select 
                  value={authStatus} 
                  onChange={(e) => setAuthStatus(e.target.value)}
                  className="h-6 w-44 px-2 pr-6 border border-slate-300 rounded text-[11.5px] bg-white text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
                >
                  <option value="">请选择认证方式</option>
                  <option value="phone_pwd">电话密码认证</option>
                  <option value="sms_otp">短信验证码认证</option>
                  <option value="face_verify">人脸识别认证</option>
                  <option value="unverified">未通过认证</option>
                </select>
                <ChevronDown size={13} className="absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
              </div>

              <button 
                onClick={handleConfirmAuth}
                className="h-6 px-3 bg-[#1677ff] hover:bg-blue-600 text-white rounded text-[11.5px] font-medium transition-colors cursor-pointer flex items-center justify-center"
                title={isCustomerLoaded ? "点击重置为截图初始状态" : "点击模拟加载客户数据"}
              >
                确定
              </button>

              {isCustomerLoaded && (
                <span className="text-[11px] text-emerald-600 font-medium ml-2 flex items-center space-x-1">
                  <CheckCircle2 size={12} />
                  <span>已认证进线</span>
                </span>
              )}
            </div>

            {/* Row 2: 菜单选择 Button */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="h-6 px-2.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1677ff] flex items-center space-x-1.5 text-[11.5px] font-medium transition-colors cursor-pointer"
              >
                <LayoutGrid size={13} className="stroke-[2.5]" />
                <span>菜单选择</span>
              </button>
            </div>

            {/* Expand / Collapse Control on the Right */}
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setIsExpanded(prev => !prev)}
                className="text-[#1677ff] hover:text-blue-700 text-[11.5px] cursor-pointer flex items-center space-x-0.5"
              >
                <span>{isExpanded ? '收起' : '展开'}</span>
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Expanded Quick Menu Dropdown if clicked */}
            {isMenuOpen && (
              <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-4 gap-2 text-[11px]">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 text-slate-700 hover:text-blue-600 cursor-pointer text-left"
                >
                  💳 信用卡业务查询
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 text-slate-700 hover:text-blue-600 cursor-pointer text-left"
                >
                  💰 账户余额与明细
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 text-slate-700 hover:text-blue-600 cursor-pointer text-left"
                >
                  🔒 快速挂失 / 冻结
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200 text-slate-700 hover:text-blue-600 cursor-pointer text-left"
                >
                  🔄 转账汇款限额设置
                </button>
              </div>
            )}
          </div>

          {/* Main Tabs Container matching screenshot */}
          <div className="bg-white rounded-md border border-slate-200/90 shadow-2xs flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Tab Navigation Header */}
            <div className="h-9 border-b border-slate-200 px-3 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center space-x-6 text-[12.5px] font-normal h-full">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'profile' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  客户画像
                </button>

                <button 
                  onClick={() => setActiveTab('callHistory')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'callHistory' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  来电历史
                </button>

                <button 
                  onClick={() => setActiveTab('ivrHistory')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'ivrHistory' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IVR进线历史
                </button>

                <button 
                  onClick={() => setActiveTab('workOrderHistory')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'workOrderHistory' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  工单历史
                </button>

                <button 
                  onClick={() => setActiveTab('ivrTrail')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'ivrTrail' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IVR进线轨迹
                </button>

                <button 
                  onClick={() => setActiveTab('journey')}
                  className={`h-full flex items-center px-1 cursor-pointer transition-colors relative ${
                    activeTab === 'journey' 
                      ? 'text-[#1677ff] font-semibold border-b-2 border-[#1677ff]' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  客户旅程
                </button>
              </div>

              {/* Top-Right "收起" Button matching screenshot */}
              <button 
                onClick={() => setIsSectionCollapsed(prev => !prev)}
                className="text-[#1677ff] hover:text-blue-700 text-[11.5px] cursor-pointer"
              >
                {isSectionCollapsed ? '展开' : '收起'}
              </button>
            </div>

            {/* Tab Contents */}
            <div className={`flex-1 overflow-y-auto p-3.5 space-y-4 ${isSectionCollapsed ? 'hidden' : 'block'}`}>
              
              {/* TAB 1: 客户画像 (Exact Match to Screenshot) */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  
                  {/* Subsection 1: 客户标签 */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-[12.5px] mb-2">
                      <Bookmark size={15} className="text-[#a855f7] fill-[#a855f7]" />
                      <span>客户标签</span>
                    </div>

                    <div className="bg-[#f4f7fc] border border-[#e2e8f0] rounded p-3 min-h-[48px] flex items-center">
                      {customerData.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {customerData.tags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-700 text-xs font-bold">暂无数据</span>
                      )}
                    </div>
                  </div>

                  {/* Subsection 2: 客户概况-基本信息 */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-[12.5px] mb-2">
                      <CreditCard size={15} className="text-[#2563eb]" />
                      <span>客户概况-基本信息</span>
                    </div>

                    <div className="bg-[#f4f7fc] border border-[#e2e8f0] rounded p-4 text-[11.5px] text-slate-600">
                      {/* 4 Columns Grid matching screenshot layout */}
                      <div className="grid grid-cols-4 gap-y-3.5 gap-x-4">
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">客户姓名:</span>
                          <span className="text-slate-800 font-medium">{customerData.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">来源渠道:</span>
                          <span className="text-slate-800">{customerData.channel}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">性别:</span>
                          <span className="text-slate-800">{customerData.gender}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">所属机构:</span>
                          <span className="text-slate-800 truncate">{customerData.org}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">年龄:</span>
                          <span className="text-slate-800">{customerData.age}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">客户号:</span>
                          <span className="text-slate-800 font-mono">{customerData.customerNo}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">客户性格:</span>
                          <span className="text-slate-800">{customerData.personality}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2 whitespace-nowrap">营销推荐:</span>
                          <span className="text-slate-800">{customerData.marketing}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: 来电历史 */}
              {activeTab === 'callHistory' && (
                <div className="space-y-2">
                  <div className="text-slate-700 font-semibold mb-2 flex items-center justify-between">
                    <span>近90天进线记录</span>
                    <span className="text-slate-400 text-xs">共 3 条记录</span>
                  </div>
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-2">来电时间</th>
                        <th className="p-2">主叫号码</th>
                        <th className="p-2">通话时长</th>
                        <th className="p-2">业务类型</th>
                        <th className="p-2">接待坐席</th>
                        <th className="p-2">处理状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2">2026-10-14 16:20</td>
                        <td className="p-2 font-mono">138****8899</td>
                        <td className="p-2">04分12秒</td>
                        <td className="p-2">信用卡跨行转账限额</td>
                        <td className="p-2">57045 (刘苗)</td>
                        <td className="p-2 text-emerald-600">已完结</td>
                      </tr>
                      <tr>
                        <td className="p-2">2026-10-09 10:15</td>
                        <td className="p-2 font-mono">138****8899</td>
                        <td className="p-2">02分45秒</td>
                        <td className="p-2">账单日与免息期查询</td>
                        <td className="p-2">56012 (赵强)</td>
                        <td className="p-2 text-emerald-600">已完结</td>
                      </tr>
                      <tr>
                        <td className="p-2">2026-09-28 14:02</td>
                        <td className="p-2 font-mono">138****8899</td>
                        <td className="p-2">05分30秒</td>
                        <td className="p-2">财富管理理财赎回咨询</td>
                        <td className="p-2">57045 (刘苗)</td>
                        <td className="p-2 text-emerald-600">已完结</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: IVR进线历史 */}
              {activeTab === 'ivrHistory' && (
                <div className="space-y-2">
                  <div className="text-slate-700 font-semibold mb-2">IVR自动语音导航进线轨迹明细</div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">14:20:01</span>
                      <span>进线接入 95566 电话银行主菜单</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">14:20:12</span>
                      <span>用户按键 [1] 信用卡业务专区</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">14:20:25</span>
                      <span>用户按键 [0] 转接人工服务（队列：财富专线）</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: 工单历史 */}
              {activeTab === 'workOrderHistory' && (
                <div className="space-y-2">
                  <div className="text-slate-700 font-semibold mb-2">历史联动工单</div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex justify-between text-slate-800 font-medium">
                      <span>工单号: GD202610140029</span>
                      <span className="text-emerald-600">已处理归档</span>
                    </div>
                    <p className="text-slate-500">类型: 咨询与建议 / 转账通道临时扩容申请</p>
                    <p className="text-slate-500">处理意见: 已告知客户跨行还款限额规则，并指引通过手机银行大额通道还款。</p>
                  </div>
                </div>
              )}

              {/* TAB 5: IVR进线轨迹 */}
              {activeTab === 'ivrTrail' && (
                <div className="space-y-3">
                  <div className="text-slate-700 font-semibold">可视化节点流转路径</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">
                      欢迎播报
                    </div>
                    <span className="text-slate-400">➔</span>
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">
                      身份密码校验 (通过)
                    </div>
                    <span className="text-slate-400">➔</span>
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">
                      信用卡菜单
                    </div>
                    <span className="text-slate-400">➔</span>
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-700 font-medium">
                      人工坐席 57045 接通
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: 客户旅程 */}
              {activeTab === 'journey' && (
                <div className="space-y-3">
                  <div className="text-slate-700 font-semibold">跨渠道触点全景</div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border-l-4 border-blue-500 rounded-r text-slate-700">
                      <div className="font-medium text-slate-800">14:15 - 手机银行APP</div>
                      <div className="text-slate-500 mt-0.5">尝试还款 60,000 元，收到单笔限额 50,000 元提示</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border-l-4 border-indigo-500 rounded-r text-slate-700">
                      <div className="font-medium text-slate-800">14:18 - 点击在线客服</div>
                      <div className="text-slate-500 mt-0.5">智能机器人推荐“拆单还款”，客户选择拨打人工电话</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border-l-4 border-emerald-500 rounded-r text-slate-700">
                      <div className="font-medium text-slate-800">14:20 - 语音进线 95566</div>
                      <div className="text-slate-500 mt-0.5">坐席 57045 应答，智能语音助手实时推荐跨行还款限额解答话术</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Floating Gear Tool Button (Right Edge matching screenshot) */}
      <button 
        title="工作台配置与自定义"
        className="fixed right-0 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#1677ff] hover:bg-blue-600 text-white rounded-l flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 z-40"
      >
        <Settings size={15} />
      </button>

      {/* Requirement 3: Smart Voice Assistant Floating Button & Modal Copied from 智能语音工作台 */}
      <SmartVoiceAssistantModal />

      {/* Appointment Code Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-80 p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="font-semibold text-slate-800 text-xs">客户预约码查询与核验</span>
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <label className="text-slate-600">请输入6位数字预约服务码：</label>
              <input 
                type="text" 
                maxLength={6}
                value={appointmentCode}
                onChange={(e) => setAppointmentCode(e.target.value)}
                placeholder="例如: 880291"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 cursor-pointer text-slate-600"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (appointmentCode) {
                    setIsCustomerLoaded(true);
                    setCallInfo({
                      phone: '138 0010 8899',
                      customerType: '预约专享客户',
                      cardNo: '6222 0210 **** 8899',
                      screenPopupContent: `预约码 [${appointmentCode}] 身份快速核验通过`,
                      queue: '预约快速通道',
                    });
                  }
                  setShowAppointmentModal(false);
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                核验
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceCustomerServiceWorkbench;
