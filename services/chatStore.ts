// Real-time Chat Store for Online Customer Service & Mobile Client Sync

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  senderRole?: string;
  avatar?: string;
  content: string;
  timestamp: string; // e.g. "2026-10-09 10:08:45"
  timeOnly?: string; // e.g. "10:08"
  recalled?: boolean;
  type?: 'text' | 'image' | 'card' | 'system';
  metadata?: Record<string, any>;
}

export interface CustomerProfile {
  id: string;
  name: string; // e.g. "游客707847"
  avatar: string;
  rating: string; // "客户评级: "
  channel: string; // "web"
  businessType: string; // "master_hanshenWeb"
  cardStatus: string; // "状态异常 - 柜面只收不付"
  phone: string; // "139****8821"
  accountNo: string; // "6225 **** **** 1029"
  duration: string; // "00:03:24"
  unreadCount: number;
}

export const DEFAULT_MESSAGES: ChatMessage[] = [];

export const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'customer',
    senderName: '游客707847',
    content: '转人工',
    timestamp: '2026-10-09 10:08:45',
    timeOnly: '10:08'
  },
  {
    id: 'msg-2',
    sender: 'customer',
    senderName: '游客707847',
    content: '你好',
    timestamp: '2026-10-09 10:08:52',
    timeOnly: '10:08'
  },
  {
    id: 'msg-3',
    sender: 'agent',
    senderName: '6028',
    senderRole: '在线坐席',
    content: '有什么能够帮您',
    timestamp: '2026-10-09 10:10:10',
    timeOnly: '10:10'
  },
  {
    id: 'msg-4',
    sender: 'customer',
    senderName: '游客707847',
    content: '卡不能用了，无法转账',
    timestamp: '2026-10-09 10:09:52',
    timeOnly: '10:09'
  }
];

class ChatStore {
  private messages: ChatMessage[] = [];
  private listeners: Set<() => void> = new Set();
  private isSoundEnabled: boolean = true;
  private agentStatus: string = '在线';
  private unreadForAgent: number = 0;
  private unreadForClient: number = 0;

  constructor() {
    // Ensure fresh session starts empty
    try {
      const hasInit = sessionStorage.getItem('online_chat_session_init_v2');
      if (!hasInit) {
        sessionStorage.removeItem('online_chat_messages');
        sessionStorage.setItem('online_chat_session_init_v2', 'true');
        this.messages = [];
      } else {
        const saved = sessionStorage.getItem('online_chat_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.messages = parsed;
          }
        }
      }
    } catch (e) {
      this.messages = [];
    }
  }

  private save() {
    try {
      sessionStorage.setItem('online_chat_messages', JSON.stringify(this.messages));
    } catch (e) {
      // ignore
    }
  }

  private notify() {
    this.save();
    this.listeners.forEach(cb => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public setSoundEnabled(val: boolean) {
    this.isSoundEnabled = val;
    this.notify();
  }

  public getAgentStatus(): string {
    return this.agentStatus;
  }

  public setAgentStatus(status: string) {
    this.agentStatus = status;
    this.notify();
  }

  public sendMessage(
    sender: 'customer' | 'agent' | 'system', 
    content: string, 
    type: 'text' | 'image' | 'card' | 'system' = 'text',
    metadata?: Record<string, any>
  ): ChatMessage {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const timeOnly = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      senderName: sender === 'agent' ? '6028' : sender === 'system' ? '系统' : '游客707847',
      senderRole: sender === 'agent' ? '在线坐席' : sender === 'system' ? '系统通知' : '手机银行客户',
      content,
      timestamp,
      timeOnly,
      type,
      metadata
    };

    this.messages.push(newMsg);

    if (this.isSoundEnabled) {
      this.playNotifySound();
    }

    this.notify();
    return newMsg;
  }

  public updateMessageMetadata(id: string, metadataPatch: Record<string, any>) {
    const idx = this.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.messages[idx] = {
        ...this.messages[idx],
        metadata: {
          ...(this.messages[idx].metadata || {}),
          ...metadataPatch
        }
      };
      this.notify();
    }
  }

  public recallMessage(id: string) {
    const idx = this.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.messages[idx] = {
        ...this.messages[idx],
        recalled: true
      };
      this.notify();
    }
  }

  public clearMessages() {
    this.messages = [];
    this.notify();
  }

  public resetToDefault() {
    this.messages = [];
    this.notify();
  }

  public loadSampleMessages() {
    this.messages = [...SAMPLE_MESSAGES];
    this.notify();
  }

  public playNotifySound() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // ignore
    }
  }
}

export const chatStore = new ChatStore();
