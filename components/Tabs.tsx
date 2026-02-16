import { List, MessageSquare } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

export function Tabs() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={() => setActiveTab('summary')}
        className={`flex-1 py-2 rounded-[8px] font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
          activeTab === 'summary'
            ? 'bg-accent text-white border border-accent'
            : 'bg-transparent text-text-primary border border-border hover:bg-bg-secondary'
        }`}
      >
        <List className="w-[18px] h-[18px]" />
        Summary
      </button>
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex-1 py-2 rounded-[8px] font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
          activeTab === 'chat'
            ? 'bg-accent text-white border border-accent'
            : 'bg-transparent text-text-primary border border-border hover:bg-bg-secondary'
        }`}
      >
        <MessageSquare className="w-[18px] h-[18px]" />
        Chat
      </button>
    </div>
  );
}
