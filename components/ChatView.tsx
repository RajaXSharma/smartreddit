import { useState } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isStreaming?: boolean;
}

export function ChatView({ messages, onSendMessage, isStreaming }: ChatViewProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 pt-3 mt-auto border-t border-border shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this post..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-full border border-border bg-bg-secondary text-sm outline-none focus:border-text-secondary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="p-1 text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
