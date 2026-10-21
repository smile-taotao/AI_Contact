import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Hand, 
  PhoneIncoming, 
  Pause, 
  Mic, 
  MicOff, 
  PhoneOutgoing, 
  Lightbulb, 
  PhoneForwarded, 
  Users, 
  Settings, 
  Image as ImageIcon,
} from 'lucide-react';

interface VoiceCustomerServiceTopBarProps {
  status?: string;
  onStatusChange?: (status: string) => void;
  onActionClick?: (actionName: string) => void;
}

export const VoiceCustomerServiceTopBar: React.FC<VoiceCustomerServiceTopBarProps> = ({
  status: propStatus,
  onStatusChange,
  onActionClick
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [status, setStatus] = useState(propStatus || '无法使用');
  const [isMuted, setIsMuted] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Timer counter
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(secs).padStart(2, '0');
    return {
      m1: mStr[0],
      m2: mStr[1],
      s1: sStr[0],
      s2: sStr[1]
    };
  };

  const timerDigits = formatTimer(seconds);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleAction = (label: string) => {
    onActionClick?.(label);
    if (label === '签入') {
      handleStatusChange('示闲');
    } else if (label === '就绪') {
      handleStatusChange('就绪');
    } else if (label === '保持') {
      setIsHolding(prev => !prev);
    } else if (label === '静音') {
      setIsMuted(prev => !prev);
    } else if (label === '设置') {
      setShowSettingsModal(true);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between shadow-2xs select-none flex-shrink-0 z-20 text-slate-700">
      
      {/* 1. Left Group: Digital Timer & Status Stats */}
      <div className="flex items-center space-x-4">
        {/* Digital Time Boxes: [ 0 ] [ 0 ] : [ 0 ] [ 0 ] */}
        <div 
          className="flex items-center space-x-0.5 cursor-pointer" 
          title="点击暂停/继续计时，双击重置"
          onClick={() => setIsRunning(prev => !prev)}
          onDoubleClick={() => setSeconds(0)}
        >
          <div className="w-5 h-7 border border-[#93c5fd] bg-[#eff6ff] rounded-[3px] flex items-center justify-center font-mono text-[17px] font-bold text-[#2563eb]">
            {timerDigits.m1}
          </div>
          <div className="w-5 h-7 border border-[#93c5fd] bg-[#eff6ff] rounded-[3px] flex items-center justify-center font-mono text-[17px] font-bold text-[#2563eb]">
            {timerDigits.m2}
          </div>
          <div className="px-0.5 text-[#2563eb] font-bold text-[17px] leading-none mb-0.5">
            :
          </div>
          <div className="w-5 h-7 border border-[#93c5fd] bg-[#eff6ff] rounded-[3px] flex items-center justify-center font-mono text-[17px] font-bold text-[#2563eb]">
            {timerDigits.s1}
          </div>
          <div className="w-5 h-7 border border-[#93c5fd] bg-[#eff6ff] rounded-[3px] flex items-center justify-center font-mono text-[17px] font-bold text-[#2563eb]">
            {timerDigits.s2}
          </div>
        </div>

        {/* Stats Column 1: 排队人数 */}
        <div className="flex flex-col text-[11px] leading-tight space-y-0.5 text-slate-600 pl-1">
          <div className="flex items-center space-x-1.5">
            <span>语音排队</span>
            <span className="text-[#2563eb] font-medium">0人</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>视频排队</span>
            <span className="text-[#2563eb] font-medium">0人</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>在线排队</span>
            <span className="text-[#2563eb] font-medium">0人</span>
          </div>
        </div>

        {/* Stats Column 2: 状态与满意度 */}
        <div className="flex flex-col text-[11px] leading-tight space-y-0.5 text-slate-600 pl-2">
          <div className="flex items-center space-x-1.5">
            <span>当前状态</span>
            <span 
              onClick={() => {
                const next = status === '无法使用' ? '示闲' : status === '示闲' ? '就绪' : status === '就绪' ? '示忙' : '无法使用';
                handleStatusChange(next);
              }}
              className="text-slate-800 font-medium cursor-pointer hover:underline"
              title="点击切换状态"
            >
              {status}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>话务工号</span>
            <span className="text-slate-800 font-medium">57045</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>视频当日满意度</span>
            <span className="text-slate-800 font-medium">0</span>
          </div>
        </div>
      </div>

      {/* 2. Middle-Left Trust Badge ("信任") */}
      <div className="flex items-center px-4">
        <span className="text-red-500 font-bold text-sm tracking-wider">信任</span>
      </div>

      {/* 3. Middle Action Buttons (11 circular buttons matching screenshot) */}
      <div className="flex items-center space-x-3.5 flex-1 justify-center max-w-2xl px-2">
        <ActionButton 
          label="签入" 
          icon={<LogIn size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('签入')} 
        />
        <ActionButton 
          label="就绪" 
          icon={<Hand size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('就绪')} 
        />
        <ActionButton 
          label="应答" 
          icon={<PhoneIncoming size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('应答')} 
        />
        <ActionButton 
          label="保持" 
          icon={<Pause size={15} className={isHolding ? "text-amber-500" : "text-[#3b82f6]"} />} 
          active={isHolding}
          onClick={() => handleAction('保持')} 
        />
        <ActionButton 
          label="静音" 
          icon={isMuted ? <MicOff size={15} className="text-red-500" /> : <Mic size={15} className="text-[#3b82f6]" />} 
          active={isMuted}
          onClick={() => handleAction('静音')} 
        />
        <ActionButton 
          label="呼出" 
          icon={<PhoneOutgoing size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('呼出')} 
        />
        <ActionButton 
          label="转IVR" 
          icon={<span className="text-[10px] font-bold text-[#3b82f6] tracking-tighter">IVR</span>} 
          onClick={() => handleAction('转IVR')} 
        />
        <ActionButton 
          label="求助" 
          icon={<Lightbulb size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('求助')} 
        />
        <ActionButton 
          label="转接" 
          icon={<PhoneForwarded size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('转接')} 
        />
        <ActionButton 
          label="三方会议" 
          icon={<Users size={15} className="text-[#3b82f6]" />} 
          onClick={() => handleAction('三方会议')} 
        />
        <ActionButton 
          label="设置" 
          icon={<Settings size={15} className="text-[#f59e0b]" />} 
          onClick={() => handleAction('设置')} 
        />
      </div>

      {/* 4. Right Agent Info (matching screenshot: 木有图片 刘苗 语音坐席) */}
      <div className="flex items-center space-x-2 pl-3 border-l border-slate-100 flex-shrink-0">
        {/* Placeholder Avatar Box with "木有图片" */}
        <div 
          className="w-8 h-8 rounded border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-0.5 text-slate-400 select-none hover:bg-slate-100 transition-colors cursor-pointer"
          title="坐席头像: 暂无照片"
        >
          <div className="flex items-center justify-center leading-none text-[8.5px] scale-90 text-slate-400 font-sans">
            <span>木有</span>
          </div>
          <div className="flex items-center justify-center leading-none text-[8.5px] scale-90 text-slate-400 font-sans">
            <span>图片</span>
          </div>
        </div>

        {/* Agent Name & Title */}
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-slate-800 text-[12.5px]">刘苗</span>
          <span className="text-slate-400 text-[10.5px]">语音坐席</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-96 p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="font-semibold text-slate-800 text-sm">话务坐席设置</span>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>自动示闲：</span>
                <input type="checkbox" defaultChecked className="rounded accent-blue-600 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span>来电弹屏自动展开：</span>
                <input type="checkbox" defaultChecked className="rounded accent-blue-600 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span>语音智能辅助提示音：</span>
                <input type="checkbox" defaultChecked className="rounded accent-blue-600 cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span>分机号：</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">8002</span>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end space-x-2">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-3 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 cursor-pointer text-slate-600"
              >
                取消
              </button>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center group cursor-pointer focus:outline-none transition-transform active:scale-95"
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 shadow-2xs
        ${active 
          ? 'bg-blue-100 border border-blue-400' 
          : 'bg-[#edf4ff] hover:bg-[#dbeafe] border border-[#d6e4ff]'}
      `}>
        {icon}
      </div>
      <span className="text-[11px] text-slate-600 mt-1 group-hover:text-blue-600 transition-colors leading-none">
        {label}
      </span>
    </button>
  );
};

export default VoiceCustomerServiceTopBar;
