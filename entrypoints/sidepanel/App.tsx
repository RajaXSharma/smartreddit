import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '../../components/Header';
import { PostInfo } from '../../components/PostInfo';
import { Tabs } from '../../components/Tabs';
import { SummaryView } from '../../components/SummaryView';
import { ChatView } from '../../components/ChatView';
import { SettingsModal } from '../../components/SettingsModal';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { ApiError } from '../../components/ApiError';
import { useUIStore } from '../../hooks/useUIStore';
import { useSettingsStore } from '../../hooks/useSettingsStore';
import { useRedditContent } from '../../hooks/useRedditContent';
import { useHydrateCache } from '../../hooks/useHydrateCache';
import { useSummaryQuery } from '../../queries/useSummaryQuery';
import { useChatMutation } from '../../queries/useChatMutation';
import type { ChatMessage, ApiError as ApiErrorType } from '../../lib/types';

export default function App() {
  const { activeTab, theme } = useUIStore();
  const { init: initSettings, isInitialized } = useSettingsStore();
  const queryClient = useQueryClient();
  const { content, isLoading: contentLoading, error: contentError, refetch } = useRedditContent();

  const [isStreaming, setIsStreaming] = useState(false);

  const postUrl = content ? window.location.href : '';

  useHydrateCache(postUrl || null);

  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useSummaryQuery(
    postUrl,
    content
  );

  const chatMutation = useChatMutation(
    postUrl,
    content,
    () => setIsStreaming(true),
    () => setIsStreaming(false)
  );

  const messages =
    queryClient.getQueryData<ChatMessage[]>(['chat', postUrl]) || [
      {
        role: 'assistant' as const,
        content:
          "Hello! I've read the post and comments. What would you like to know about the discussion?",
      },
    ];

  useEffect(() => {
    if (!isInitialized) {
      initSettings();
    }
  }, [isInitialized, initSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSendMessage = (message: string) => {
    chatMutation.mutate({ messages, userMessage: message });
  };

  const handleRegenerate = () => {
    queryClient.invalidateQueries({ queryKey: ['summary', postUrl] });
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

  const isApiError = (error: unknown): error is ApiErrorType => {
    return typeof error === 'object' && error !== null && 'type' in error && 'message' in error;
  };

  return (
    <div className="w-[360px] h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
      <Header />

      {contentLoading ? (
        <div className="flex-1 overflow-y-auto p-4">
          <LoadingState />
        </div>
      ) : contentError ? (
        <div className="flex-1 flex items-center justify-center">
          <ErrorState error={contentError} onRetry={refetch} />
        </div>
      ) : content ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4">
            <Tabs />
          </div>

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
              ) : summaryError && isApiError(summaryError) ? (
                <ApiError error={summaryError} onRetry={refetchSummary} />
              ) : summaryData ? (
                <SummaryView
                  data={summaryData}
                  onRegenerate={handleRegenerate}
                  onCopy={handleCopy}
                />
              ) : null}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
              />
            </div>
          )}
        </div>
      ) : null}

      <SettingsModal />
    </div>
  );
}
