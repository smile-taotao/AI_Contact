import React, { useState } from 'react';
import CallMonitoring from './simulator/CallMonitoring';
import ProcessNavigation from './simulator/ProcessNavigation';
import KnowledgeRecommendation from './simulator/KnowledgeRecommendation';
import RightPanelTabs from './simulator/RightPanelTabs';
import { ChevronLeft, User } from 'lucide-react';
import EventLogPanel from './simulator/EventLogPanel';
import CustomerListDrawer, { Customer } from './simulator/CustomerListDrawer';

const SimulatorWorkbench: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: '李先生', phone: '13812345678', status: 'pending_call' }
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('1');
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [sessionKeys, setSessionKeys] = useState<Record<string, number>>({ '1': 0 });
  const [isEventLogOpen, setIsEventLogOpen] = useState(false);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleReset = (id: string) => {
    setSessionKeys(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleAddCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    setSessionKeys(prev => ({ ...prev, [customer.id]: 0 }));
  };

  const handleUpdateStatus = (id: string, status: Customer['status']) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (status === 'calling') {
      setIsCustomerDrawerOpen(false);
    }
    if (status === 'pending_call') {
      handleReset(id);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-slate-800 bg-[#f1f5f9] relative">
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative z-10 w-full overflow-hidden flex flex-col">
          {customers.map(customer => (
            <div 
              key={customer.id} 
              className={`flex flex-1 gap-2 p-2 overflow-hidden ${customer.id === selectedCustomerId ? '' : 'hidden'}`}
            >
              {/* Left Column: Call Monitoring */}
              <div className="w-1/4 min-w-[280px] bg-white shadow-sm flex flex-col overflow-hidden">
                <CallMonitoring 
                  key={`call-${customer.id}-${sessionKeys[customer.id] || 0}`} 
                  isPristine={(sessionKeys[customer.id] || 0) === 0} 
                  onReset={() => handleReset(customer.id)} 
                  isDisabled={customer.status !== 'calling'}
                />
              </div>
              
              {/* Middle Column: Smart Process Navigation */}
              <div className="w-1/4 min-w-[280px] bg-white shadow-sm flex flex-col overflow-hidden">
                <ProcessNavigation 
                  key={`nav-${customer.id}-${sessionKeys[customer.id] || 0}`} 
                  isPristine={(sessionKeys[customer.id] || 0) === 0} 
                  customer={customer}
                />
              </div>

              {/* Third Column: Knowledge Recommendation */}
              <div className="w-1/4 min-w-[280px] bg-white shadow-sm flex flex-col overflow-hidden">
                <KnowledgeRecommendation 
                  key={`knowledge-${customer.id}-${sessionKeys[customer.id] || 0}`} 
                  isPristine={(sessionKeys[customer.id] || 0) === 0} 
                />
              </div>

              {/* Right Column: Tabs */}
              <div className="w-1/4 min-w-[280px] bg-white shadow-sm flex flex-col overflow-hidden relative">
                <RightPanelTabs 
                  key={`tabs-${customer.id}-${sessionKeys[customer.id] || 0}`} 
                  isPristine={(sessionKeys[customer.id] || 0) === 0} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer left edge trigger */}
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-30 flex items-center cursor-pointer group"
        onClick={() => setIsCustomerDrawerOpen(true)}
      >
        <div className="bg-white shadow-[4px_0_12px_rgba(0,0,0,0.1)] rounded-r-lg border border-slate-200 border-l-0 py-3 px-1.5 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors w-8">
           <User size={16} className="text-blue-600 mb-2" />
           <div className="text-[12px] text-slate-700 font-medium break-all text-center leading-tight">
              {activeCustomer.name.split('').map((char, i) => <div key={i}>{char}</div>)}
           </div>
           <div className="w-[8px] h-[1px] bg-slate-200 my-2"></div>
           <div className={`text-[10px] break-all text-center leading-[1.1] ${
              activeCustomer.status === 'calling' ? 'text-emerald-500 font-medium' :
              activeCustomer.status === 'wrapping_up' ? 'text-amber-500 font-medium' :
               'text-slate-400'
           }`}>
              {(activeCustomer.status === 'calling' ? '进线中' : activeCustomer.status === 'wrapping_up' ? '待小结' : '待进线').split('').map((char, i) => <div key={i}>{char}</div>)}
           </div>
        </div>
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 hover:translate-x-0 transition-transform z-30">
        <button 
          onClick={() => setIsEventLogOpen(true)}
          className="bg-white text-blue-600 shadow-[-4px_0_12px_rgba(0,0,0,0.1)] rounded-l-lg py-3 px-1 flex items-center justify-center hover:bg-slate-50 border border-slate-200 border-r-0"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <EventLogPanel isOpen={isEventLogOpen} onClose={() => setIsEventLogOpen(false)} />
      
      <CustomerListDrawer 
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        customers={customers}
        onAddCustomer={handleAddCustomer}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default SimulatorWorkbench;

