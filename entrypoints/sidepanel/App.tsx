import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '../../components/Header';
import { PostInfo } from '../../components/PostInfo';
import { Tabs } from '../../components/Tabs';
import { SummaryView } from '../../components/SummaryView';
import { ChatView } from '../../components/ChatView';
import { SettingsModal } from '../../components/SettingsModal';
import { LoadingState } from '../../components/LoadingState';
import { useUIStore } from '../../hooks/useUIStore';
import { useSummaryQuery } from '../../queries/useSummaryQuery';
import { useChatMutation } from '../../queries/useChatMutation';
import type { ScrapedContent, ChatMessage } from '../../lib/types';

// Mock data for development
const mockContent: ScrapedContent = {
  title: 'How does it feel to create a whole aesthetic that didn\'t exist before?',
  body: '',
  subreddit: 'r/midjourney',
  author: 'Frost',
  timestamp: '4h ago',
  upvotes: 12500,
  commentCount: 430,
  upvoteRatio: 92,
  comments: [],
};

const mockPostUrl = 'https://reddit.com/r/midjourney/example';

export default function App() {
  const { activeTab, theme } = useUIStore();
  const queryClient = useQueryClient();
  const [content] = useState<ScrapedContent>(mockContent);

  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery(
    mockPostUrl,
    content
  );

  const chatMutation = useChatMutation(mockPostUrl, content);

  const messages =
    queryClient.getQueryData<ChatMessage[]>(['chat', mockPostUrl]) || [
      {
        role: 'assistant' as const,
        content:
          "Hello! I've read the post and comments. What would you like to know about the discussion?",
      },
    ];

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSendMessage = (message: string) => {
    chatMutation.mutate({ messages, userMessage: message });
  };

  const handleRegenerate = () => {
    queryClient.invalidateQueries({ queryKey: ['summary', mockPostUrl] });
  };

  const handleCopy = () => {
    if (summaryData) {
      const text = summaryData.tldr.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="w-[360px] h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs always visible */}
        <div className="px-4 pt-4">
          <Tabs />
        </div>

        {/* Summary view - scrollable with PostInfo */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <PostInfo
              subreddit={content.subreddit}
              author={content.author}
              timestamp={content.timestamp}
              title={content.title}
              upvotes={formatNumber(content.upvotes)}
              comments={formatNumber(content.commentCount)}
              upvoteRatio={`${content.upvoteRatio}%`}
            />
            {summaryLoading ? (
              <LoadingState />
            ) : summaryData ? (
              <SummaryView
                data={summaryData}
                onRegenerate={handleRegenerate}
                onCopy={handleCopy}
              />
            ) : null}
          </div>
        )}

        {/* Chat view - takes full remaining height */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
            <ChatView messages={messages} onSendMessage={handleSendMessage} />
          </div>
        )}
      </div>

      <SettingsModal />
    </div>
  );
}
