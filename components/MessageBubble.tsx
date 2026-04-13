interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'self-end bg-accent text-white rounded-[18px] rounded-br-[4px]'
          : 'self-start bg-bg-secondary text-text-primary border border-transparent rounded-[18px] rounded-bl-[4px]'
      }`}
    >
      {content}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-current animate-pulse" />
      )}
    </div>
  );
}
