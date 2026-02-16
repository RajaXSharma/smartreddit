# Complete Project Walkthrough

This document explains everything built in the SmartReddit browser extension - the architecture, each file, and how they connect.

---

## 1. Project Overview

**What we built:** A Chrome browser extension that summarizes Reddit posts using AI and lets you chat about them.

**Tech Stack:**
- **WXT** - Browser extension framework (like Next.js but for extensions)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with CSS variables
- **TanStack Query** - Server state management (API caching)
- **Zustand** - Client state management (UI state)
- **Lucide React** - Icons

---

## 2. Project Structure

```
smartreddit/
├── entrypoints/           # Extension entry points
│   ├── sidepanel/         # The main UI panel
│   │   ├── index.html     # HTML shell
│   │   ├── main.tsx       # React bootstrap
│   │   └── App.tsx        # Main app component
│   ├── content.ts         # Runs on Reddit pages
│   └── background.ts      # Service worker
├── components/            # React components
│   ├── Header.tsx
│   ├── PostInfo.tsx
│   ├── Tabs.tsx
│   ├── SummaryView.tsx
│   ├── ChatView.tsx
│   ├── MessageBubble.tsx
│   ├── SettingsModal.tsx
│   └── LoadingState.tsx
├── hooks/                 # Custom React hooks
│   └── useUIStore.ts      # Zustand store
├── queries/               # TanStack Query hooks
│   ├── useSummaryQuery.ts
│   └── useChatMutation.ts
├── lib/                   # Utilities
│   ├── types.ts           # TypeScript interfaces
│   └── api.ts             # API functions (mocked)
├── styles/
│   └── globals.css        # Tailwind + theme
└── wxt.config.ts          # WXT configuration
```

---

## 3. Configuration Files

### `wxt.config.ts` - Extension Configuration

```typescript
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Enable React support
  modules: ['@wxt-dev/module-react'],

  // Chrome extension manifest settings
  manifest: {
    name: 'Reddit Summarizer',
    description: 'AI-powered summaries and chat for Reddit posts',

    // Permissions the extension needs
    permissions: ['sidePanel', 'storage', 'activeTab'],

    // Which websites the extension can access
    host_permissions: ['*://*.reddit.com/*'],

    // Toolbar button configuration
    action: {
      default_title: 'Open Reddit Summarizer',
    },

    // Side panel configuration
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
  },

  // Vite plugins (Tailwind CSS)
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
```

**Key concepts:**
- `permissions` - What browser APIs the extension can use
- `host_permissions` - Which websites it can run on
- `side_panel` - Chrome's side panel feature (appears on the right)

---

### `styles/globals.css` - Theming with Tailwind v4

```css
@import "tailwindcss";

/* Light mode colors (default) */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-text-primary: #262626;
  --color-text-secondary: #8e8e8e;
  --color-accent: #ff4500;        /* Reddit orange */
  --color-accent-dim: #fff0e5;
  --color-border: #dbdbdb;
}

/* Dark mode colors - applied when .dark class is on <html> */
.dark {
  --color-bg-primary: #1a1a1b;
  --color-bg-secondary: #272729;
  --color-text-primary: #d7dadc;
  --color-text-secondary: #818384;
  --color-accent-dim: #3a1f0f;
  --color-border: #343536;
}

/* Tell Tailwind to use these CSS variables */
@theme inline {
  --color-bg-primary: var(--color-bg-primary);
  --color-bg-secondary: var(--color-bg-secondary);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-accent: var(--color-accent);
  --color-accent-dim: var(--color-accent-dim);
  --color-border: var(--color-border);
  --radius-default: 8px;
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
}
```

**How dark mode works:**
1. CSS variables defined in `:root` (light) and `.dark` (dark)
2. When `.dark` class is added to `<html>`, variables change
3. Tailwind uses these variables via `@theme inline`
4. Classes like `bg-bg-primary` automatically update

---

## 4. Type Definitions

### `lib/types.ts`

```typescript
// What we scrape from Reddit
export interface ScrapedContent {
  title: string;
  body: string;
  subreddit: string;
  author: string;
  timestamp: string;
  upvotes: number;
  commentCount: number;
  upvoteRatio: number;
  comments: Comment[];
}

export interface Comment {
  author: string;
  text: string;
  score: number;
  depth: number;  // Reply nesting level
}

// What the AI returns for summaries
export interface SummaryResponse {
  tldr: string[];           // Bullet points
  quote: string;            // Notable quote
  sentiment: {
    positive: number;       // Percentage
    neutral: number;
    negative: number;
  };
}

// Chat message format
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

---

## 5. State Management

### `hooks/useUIStore.ts` - Zustand Store

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tab = 'summary' | 'chat';
type Theme = 'light' | 'dark';

interface UIStore {
  // State
  activeTab: Tab;
  isSettingsOpen: boolean;
  theme: Theme;

  // Actions
  setActiveTab: (tab: Tab) => void;
  toggleSettings: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTab: 'summary',
      isSettingsOpen: false,
      theme: 'dark',

      // Action implementations
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSettings: () => set({ isSettingsOpen: !get().isSettingsOpen }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({
        theme: get().theme === 'light' ? 'dark' : 'light'
      }),
    }),
    {
      name: 'reddit-summarizer-ui',  // localStorage key
    }
  )
);
```

**Key concepts:**
- `create<UIStore>()` - Creates a typed store
- `persist()` - Middleware that saves state to localStorage
- `set()` - Updates state (like setState)
- `get()` - Reads current state inside actions

**Usage in components:**
```tsx
const { activeTab, setActiveTab, theme } = useUIStore();
```

---

## 6. API Layer (Mock)

### `lib/api.ts`

```typescript
import type { ScrapedContent, SummaryResponse, ChatMessage } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchSummary(
  _content: ScrapedContent  // Underscore = unused (will use when real API)
): Promise<SummaryResponse> {
  await delay(1500);  // Simulate API call

  // Return mock data
  return {
    tldr: [
      'The OP is discussing the rapid evolution of AI art styles...',
      'Community sentiment is mixed between awe and concern...',
      'Top comments highlight the "uncanny valley" effect...',
    ],
    quote: 'The most surprising part is how quickly we adapted...',
    sentiment: { positive: 70, neutral: 20, negative: 10 },
  };
}

export async function sendChatMessage(
  _content: ScrapedContent,
  _messages: ChatMessage[],
  userMessage: string
): Promise<ChatMessage> {
  await delay(1000);

  // Simple mock response logic
  return {
    role: 'assistant',
    content: userMessage.toLowerCase().includes('price')
      ? 'Several commenters mention pricing concerns...'
      : 'The community has varied opinions on this topic...',
  };
}
```

---

## 7. TanStack Query Hooks

### `queries/useSummaryQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchSummary } from '../lib/api';
import type { ScrapedContent } from '../lib/types';

export function useSummaryQuery(
  postUrl: string,
  content: ScrapedContent | null
) {
  return useQuery({
    // Unique cache key - changes when postUrl changes
    queryKey: ['summary', postUrl],

    // Function to fetch data
    queryFn: () => fetchSummary(content!),

    // Only run if content exists
    enabled: !!content,

    // Keep data fresh for 30 minutes
    staleTime: 1000 * 60 * 30,

    // Keep in cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24,
  });
}
```

**What TanStack Query gives you:**
```tsx
const { data, isLoading, error, refetch } = useSummaryQuery(url, content);
```

### `queries/useChatMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendChatMessage } from '../lib/api';
import type { ScrapedContent, ChatMessage } from '../lib/types';

export function useChatMutation(
  postUrl: string,
  content: ScrapedContent | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    // The actual API call
    mutationFn: async ({ messages, userMessage }) => {
      if (!content) throw new Error('No content');
      return sendChatMessage(content, messages, userMessage);
    },

    // OPTIMISTIC UPDATE: Run BEFORE API call completes
    onMutate: async ({ userMessage }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: ['chat', postUrl] });

      // Save current state for rollback
      const previous = queryClient.getQueryData(['chat', postUrl]);

      // Immediately add user message to UI
      queryClient.setQueryData(['chat', postUrl], (old = []) => [
        ...old,
        { role: 'user', content: userMessage },
      ]);

      return { previous };  // For rollback
    },

    // When API succeeds, add the response
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['chat', postUrl], (old = []) => [
        ...old,
        newMessage,
      ]);
    },

    // If API fails, rollback to previous state
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['chat', postUrl], context.previous);
      }
    },
  });
}
```

**Optimistic updates explained:**
1. User clicks "Send"
2. Message appears instantly (optimistic)
3. API call happens in background
4. If success → add AI response
5. If error → remove the user message (rollback)

---

## 8. Components

### `components/Header.tsx`

```tsx
import { Settings, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

export function Header() {
  const { theme, toggleTheme, toggleSettings } = useUIStore();

  return (
    <header className="h-[54px] flex items-center justify-between px-4 border-b border-border bg-bg-primary shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-base">
        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <span>Summarizer</span>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
        >
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
        <button
          onClick={toggleSettings}
          className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
        >
          <Settings />
        </button>
      </div>
    </header>
  );
}
```

### `components/Tabs.tsx`

```tsx
import { List, MessageSquare } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

export function Tabs() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={() => setActiveTab('summary')}
        className={`flex-1 py-2 rounded-[8px] font-semibold text-sm
          flex items-center justify-center gap-1.5 transition-all ${
          activeTab === 'summary'
            ? 'bg-accent text-white border border-accent'      // Active
            : 'bg-transparent text-text-primary border border-border hover:bg-bg-secondary'  // Inactive
        }`}
      >
        <List className="w-[18px] h-[18px]" />
        Summary
      </button>
      {/* Similar button for Chat */}
    </div>
  );
}
```

### `components/MessageBubble.tsx`

```tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'self-end bg-accent text-white rounded-[18px] rounded-br-[4px]'      // Right, orange
          : 'self-start bg-bg-secondary text-text-primary rounded-[18px] rounded-bl-[4px]'  // Left, gray
      }`}
    >
      {content}
    </div>
  );
}
```

### `components/ChatView.tsx`

```tsx
import { useState } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

interface ChatViewProps {
  messages: { role: 'user' | 'assistant'; content: string }[];
  onSendMessage: (message: string) => void;
}

export function ChatView({ messages, onSendMessage }: ChatViewProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');  // Clear input after sending
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages - scrollable */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
      </div>

      {/* Input - fixed at bottom */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-border shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this post..."
          className="flex-1 px-4 py-2.5 rounded-full border border-border bg-bg-secondary"
        />
        <button type="submit" className="p-1 text-accent">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
```

**Layout trick:** `min-h-0` is needed for flex children to allow scrolling. Without it, flex items won't shrink below their content size.

---

## 9. Main App Assembly

### `entrypoints/sidepanel/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '../../styles/globals.css';

// Create TanStack Query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,      // 30 min
      gcTime: 1000 * 60 * 60 * 24,    // 24 hours
      refetchOnWindowFocus: false,     // Don't refetch when tab focuses
      retry: 1,                        // Only retry once on failure
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### `entrypoints/sidepanel/App.tsx` (simplified)

```tsx
export default function App() {
  const { activeTab, theme } = useUIStore();
  const queryClient = useQueryClient();
  const [content] = useState<ScrapedContent>(mockContent);

  // Fetch summary
  const { data: summaryData, isLoading } = useSummaryQuery(mockPostUrl, content);

  // Chat mutation
  const chatMutation = useChatMutation(mockPostUrl, content);

  // Get chat messages from cache
  const messages = queryClient.getQueryData(['chat', mockPostUrl]) || [
    { role: 'assistant', content: "Hello! What would you like to know?" },
  ];

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="w-[360px] h-screen bg-bg-primary flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <Tabs />
        </div>

        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <PostInfo {...content} />
            {isLoading ? <LoadingState /> : <SummaryView data={summaryData} />}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
            <ChatView
              messages={messages}
              onSendMessage={(msg) => chatMutation.mutate({ messages, userMessage: msg })}
            />
          </div>
        )}
      </div>

      <SettingsModal />
    </div>
  );
}
```

---

## 10. Extension Scripts

### `entrypoints/content.ts` - Runs on Reddit

```typescript
export default defineContentScript({
  matches: ['*://*.reddit.com/*'],  // Only runs on Reddit

  main() {
    console.log('Reddit Summarizer: Content script loaded');

    // Listen for messages from the side panel
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_CONTENT') {
        // TODO: Actually scrape the DOM here
        sendResponse({
          success: true,
          content: {
            title: document.title,
            url: window.location.href,
          },
        });
      }
      return true;  // Keep channel open for async response
    });
  },
});
```

### `entrypoints/background.ts` - Service Worker

```typescript
export default defineBackground(() => {
  console.log('Reddit Summarizer: Background script loaded');

  // Open side panel when extension icon is clicked
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Enable opening panel on icon click
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
```

---

## 11. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    User visits Reddit                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Content Script (content.ts)                                 │
│  - Detects Reddit page                                       │
│  - Will scrape DOM for post/comments                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  User clicks extension icon                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Background Script (background.ts)                           │
│  - Opens side panel                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Side Panel (App.tsx)                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  useUIStore (Zustand)        │  useSummaryQuery          ││
│  │  - activeTab                 │  - Fetches summary        ││
│  │  - theme                     │  - Caches by URL          ││
│  │  - isSettingsOpen            │                           ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Components render based on state                        ││
│  │  Header → Tabs → SummaryView OR ChatView                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Key Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **CSS Variables + Dark Mode** | globals.css | Dynamic theming without rebuilding |
| **Zustand with Persist** | useUIStore | Simple state that survives page refresh |
| **TanStack Query** | useSummaryQuery | Automatic caching, loading states, refetching |
| **Optimistic Updates** | useChatMutation | Instant UI feedback before API completes |
| **Flex Layout** | App.tsx, ChatView | Responsive layouts with scroll containment |
| **Conditional Rendering** | App.tsx | Show different views based on activeTab |

---

## 13. Common Tailwind Classes Explained

| Class | What it does |
|-------|--------------|
| `flex` | Display as flexbox |
| `flex-col` | Stack children vertically |
| `flex-1` | Grow to fill available space |
| `items-center` | Center children on cross-axis |
| `justify-between` | Space children evenly with first/last at edges |
| `gap-2` | 8px gap between flex children |
| `p-4` | 16px padding all sides |
| `px-4` | 16px padding left/right only |
| `rounded-full` | Fully rounded (circle) |
| `rounded-[8px]` | 8px border radius (arbitrary value) |
| `border` | 1px border |
| `border-border` | Border color from CSS variable |
| `bg-bg-primary` | Background from CSS variable |
| `text-text-primary` | Text color from CSS variable |
| `hover:bg-bg-secondary` | Background on hover |
| `transition-colors` | Animate color changes |
| `overflow-hidden` | Hide overflow content |
| `overflow-y-auto` | Show vertical scrollbar when needed |
| `min-h-0` | Allow flex item to shrink below content size |
| `shrink-0` | Prevent flex item from shrinking |
| `self-end` | Align this item to end of cross-axis |

---

## 14. Next Steps (Not Yet Implemented)

1. **Real Reddit Scraping** - Parse DOM in content.ts to extract post/comments
2. **Backend API** - Replace mock functions with real Gemini/Grok API calls
3. **API Key Storage** - Securely save user's API keys in browser storage
4. **Error Handling** - Show user-friendly error messages
5. **Loading States** - Better loading indicators during API calls
6. **Persistence** - Save chat history and summaries to browser storage

---

## 15. How to Test

1. Build the extension:
   ```bash
   pnpm build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select `.output/chrome-mv3/` folder

3. Test on Reddit:
   - Go to any Reddit post
   - Click the extension icon in toolbar
   - Side panel opens with mock data

4. Development mode:
   ```bash
   pnpm dev
   ```
   This auto-reloads on file changes.
