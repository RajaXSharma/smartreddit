import { useState } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function ChatView({ messages, onSendMessage }: ChatViewProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 pt-3 border-t border-border"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this post..."
          className="flex-1 px-4 py-2.5 rounded-full border border-border bg-bg-secondary text-sm outline-none focus:border-text-secondary"
        />
        <button
          type="submit"
          className="p-1 text-accent hover:opacity-80 transition-opacity"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
