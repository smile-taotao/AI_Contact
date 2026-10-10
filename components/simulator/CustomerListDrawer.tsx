import React, { useState } from 'react';
import { X, Plus, User, Phone, PhoneCall, PhoneOff, FileText } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: 'pending_call' | 'calling' | 'wrapping_up';
}

interface CustomerListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  onUpdateStatus: (id: string, status: Customer['status']) => void;
}

const CustomerListDrawer: React.FC<CustomerListDrawerProps> = ({ 
  isOpen, onClose, customers, onAddCustomer, selectedCustomerId, onSelectCustomer, onUpdateStatus 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    onAddCustomer({
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      status: 'pending_call'
    });
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  };

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 bg-black/10 z-40" onClick={onClose}></div>
      )}
      <div className={`absolute top-0 left-0 bottom-0 w-[300px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex justify-between items-center px-4 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 text-[15px]">客户列表</h2>
          <button className="text-slate-400 hover:text-slate-600 transition" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {customers.map(customer => {
            const statusLabel = customer.status === 'calling' ? '进线中' : customer.status === 'wrapping_up' ? '待小结' : '待进线';
            const statusColor = customer.status === 'calling' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : customer.status === 'wrapping_up' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-500 bg-slate-50 border-slate-200';
            
            return (
              <div 
                key={customer.id}
                className={`p-3 rounded-lg border transition-all ${
                  customer.id === selectedCustomerId 
                    ? 'bg-blue-50/50 border-blue-300 shadow-sm' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => {
                    onSelectCustomer(customer.id);
                  }}
                >
                  <div className="flex items-center">
                    <span className={`font-medium mr-2 ${customer.id === selectedCustomerId ? 'text-blue-700' : 'text-slate-700'}`}>
                      {customer.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {customer.id === selectedCustomerId && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">当前</span>
                  )}
                </div>
                <div 
                  className="flex items-center text-[12px] text-slate-500 mb-3 cursor-pointer"
                  onClick={() => {
                    onSelectCustomer(customer.id);
                  }}
                >
                  <Phone size={12} className="mr-1.5" />
                  {customer.phone}
                </div>
                <div className="flex space-x-2 pt-2 border-t border-slate-200/60 mt-1">
                  <button 
                    disabled={customer.status === 'calling' || customer.status === 'wrapping_up'}
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(customer.id, 'calling'); }}
                    className={`flex-1 flex items-center justify-center py-1.5 text-[12px] rounded transition-colors ${
                      customer.status === 'pending_call' 
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <PhoneCall size={12} className="mr-1" /> 拨打
                  </button>
                  <button 
                    disabled={customer.status !== 'calling'}
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(customer.id, 'wrapping_up'); }}
                    className={`flex-1 flex items-center justify-center py-1.5 text-[12px] rounded transition-colors ${
                      customer.status === 'calling' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <PhoneOff size={12} className="mr-1" /> 挂断
                  </button>
                  <button 
                    disabled={customer.status !== 'wrapping_up'}
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(customer.id, 'pending_call'); }}
                    className={`flex-1 flex items-center justify-center py-1.5 text-[12px] rounded transition-colors ${
                      customer.status === 'wrapping_up' 
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                        : 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FileText size={12} className="mr-1" /> 提交小结
                  </button>
                </div>
              </div>
            );
          })}

          {customers.length < 5 && !showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 flex items-center justify-center text-[13px] text-blue-600 border border-dashed border-blue-300 bg-white rounded-lg hover:bg-blue-50 transition"
            >
              <Plus size={16} className="mr-1" /> 添加新客户 ({customers.length}/5)
            </button>
          )}

          {showAddForm && (
            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
              <div className="text-[13px] font-medium text-slate-700 mb-3">新增客户信息</div>
              <div className="space-y-3">
                <div>
                  <input 
                    type="text" 
                    placeholder="客户姓名" 
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-blue-400"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>
                <div>
                   <input 
                    type="text" 
                    placeholder="手机号码" 
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-blue-400"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button className="text-[12px] text-slate-500 px-2 py-1 rounded hover:bg-slate-100" onClick={() => setShowAddForm(false)}>取消</button>
                  <button 
                    className="text-[12px] bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleAdd}
                    disabled={!newName.trim() || !newPhone.trim()}
                  >保存</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerListDrawer;
