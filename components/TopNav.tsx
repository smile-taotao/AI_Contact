import React, { useState } from 'react';
import { 
  Settings, 
  LogIn, 
  Coffee, 
  PhoneOutgoing, 
  PhoneOff, 
  PauseCircle, 
  Grid3X3, 
  Lightbulb, 
  PhoneForwarded, 
  VolumeX, 
  Users, 
  ArrowLeftRight, 
  LogOut, 
  Clock, 
  ShieldCheck, 
  Headphones,
  PhoneCall
} from 'lucide-react';

interface TopNavProps {
  agentStatus?: string;
  onStatusChange?: (status: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ agentStatus: initialStatus = '未登录' }) => {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  return (
    <div className="h-12 bg-[#006fe6] text-white flex items-center justify-between px-3 shadow-sm flex-shrink-0 z-20 select-none">
      
      {/* Left: Branding & Status Indicators matching screenshot */}
      <div className="flex items-center space-x-4 text-xs font-normal">
        {/* Brand Icon */}
        <div className="flex items-center space-x-1 cursor-pointer hover:opacity-90">
          <div className="w-5 h-5 flex items-center justify-center font-black tracking-tighter text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current stroke-2">
              <path d="M4 12l4-8 4 8 4-8 4 8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16l4 4 4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 客户来电 */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <PhoneCall size={14} className="stroke-[2.2]" />
          <span className="font-medium text-[13px]">客户来电</span>
        </div>

        {/* 实时质检 */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <ShieldCheck size={14} className="stroke-[2.2]" />
          <span className="font-medium text-[13px]">实时质检</span>
        </div>

        {/* 当前状态 */}
        <div className="flex items-center space-x-1.5 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm"></span>
          <span className="opacity-90 text-[13px]">当前状态</span>
          <span className="font-bold text-[13px] bg-white/20 px-1.5 py-0.5 rounded text-white cursor-pointer hover:bg-white/30 transition-all">
            {currentStatus}
          </span>
        </div>

        {/* 排队人数 */}
        <div className="flex items-center space-x-1.5 pl-1">
          <span className="w-2 h-2 rounded-full bg-slate-200 inline-block"></span>
          <span className="opacity-90 text-[13px]">排队人数</span>
          <span className="font-bold text-[13px] ml-0.5">0</span>
        </div>

        {/* 4 Headset Avatars status group matching screenshot */}
        <div className="flex items-center space-x-1 pl-2">
          {[1, 2, 3, 4].map((idx) => (
            <div 
              key={idx} 
              className="w-5 h-5 rounded-full border border-white/60 bg-white/10 flex items-center justify-center text-[10px] text-white hover:bg-white/20 cursor-pointer"
              title={`通道 ${idx} 就绪`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Call & Agent Action Tools matching screenshot exactly */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center space-x-3.5 pr-2">
          <ActionIcon icon={Settings} label="设置" onClick={() => {}} />
          <ActionIcon icon={LogIn} label="签入" onClick={() => setCurrentStatus('在线示闲')} />
          <ActionIcon icon={Coffee} label="示闲" onClick={() => setCurrentStatus('示闲')} />
          <ActionIcon icon={PhoneOutgoing} label="呼出" onClick={() => {}} />
          <ActionIcon icon={PhoneOff} label="挂断" onClick={() => {}} />
          <ActionIcon icon={PauseCircle} label="保持" onClick={() => {}} />
          <ActionIcon icon={Grid3X3} label="IVR" onClick={() => {}} />
          <ActionIcon icon={Lightbulb} label="求助" onClick={() => {}} />
          <ActionIcon icon={PhoneForwarded} label="转接" onClick={() => {}} />
          <ActionIcon icon={VolumeX} label="静音" onClick={() => {}} />
          <ActionIcon icon={Users} label="会议" onClick={() => {}} />
          <ActionIcon icon={ArrowLeftRight} label="切换" onClick={() => {}} />
          <ActionIcon icon={LogOut} label="签出" onClick={() => setCurrentStatus('未登录')} />
          <ActionIcon icon={Clock} label="示忙" onClick={() => setCurrentStatus('示忙')} />
        </div>
        
        {/* Agent Avatar with Orange Ring border matching screenshot */}
        <div className="flex items-center cursor-pointer pl-1.5 group" title="坐席: 6028 (张晓雅)">
          <div className="w-8 h-8 rounded-full border-[2.5px] border-[#fa8c16] overflow-hidden shadow-sm flex items-center justify-center bg-white group-hover:scale-105 transition-transform">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face" 
              alt="Agent" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionIconProps {
  icon: any;
  label: string;
  onClick?: () => void;
}

const ActionIcon: React.FC<ActionIconProps> = ({ icon: Icon, label, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className="flex flex-col items-center justify-center cursor-pointer hover:bg-white/15 px-1 py-0.5 rounded transition-colors group focus:outline-none"
  >
    <Icon size={15} className="mb-0.5 group-hover:scale-110 transition-transform stroke-[2]" />
    <span className="text-[11px] leading-tight opacity-95 group-hover:opacity-100">{label}</span>
  </button>
);

export default TopNav;
