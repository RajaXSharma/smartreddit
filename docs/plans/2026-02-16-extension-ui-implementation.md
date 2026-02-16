# Extension UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Reddit Summarizer browser extension UI with WXT, React, Tailwind v4, and shadcn/ui.

**Architecture:** WXT browser extension with React side panel. Zustand for UI state, TanStack Query for server state (mocked initially). Content script scrapes Reddit, background worker routes messages.

**Tech Stack:** WXT, React 18, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand, Lucide React

---

## Task 1: Initialize WXT Project

**Files:**
- Create: `package.json`
- Create: `wxt.config.ts`
- Create: `tsconfig.json`

**Step 1: Create WXT project with React template**

Run:
```bash
cd "/home/oreki/Projects Learning/smartreddit"
pnpm create wxt@latest . --template react
```

Select defaults when prompted. This scaffolds the base project.

**Step 2: Verify project structure**

Run: `ls -la`
Expected: `package.json`, `wxt.config.ts`, `tsconfig.json`, `entrypoints/` directory

**Step 3: Install dependencies**

Run: `pnpm install`
Expected: `node_modules/` created, no errors

**Step 4: Test dev server**

Run: `pnpm dev`
Expected: Extension builds, browser opens with extension loaded

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize WXT project with React template"
```

---

## Task 2: Configure Tailwind v4

**Files:**
- Create: `styles/globals.css`
- Modify: `wxt.config.ts`
- Modify: `package.json` (via pnpm add)

**Step 1: Install Tailwind v4 and Vite plugin**

Run:
```bash
pnpm add tailwindcss @tailwindcss/vite
```

**Step 2: Create globals.css with theme**

Create `styles/globals.css`:
```css
@import "tailwindcss";

@theme inline {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-text-primary: #262626;
  --color-text-secondary: #8e8e8e;
  --color-accent: #ff4500;
  --color-accent-dim: #fff0e5;
  --color-border: #dbdbdb;
  --radius-default: 8px;
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.dark {
  --color-bg-primary: #1a1a1b;
  --color-bg-secondary: #272729;
  --color-text-primary: #d7dadc;
  --color-text-secondary: #818384;
  --color-accent-dim: #3a1f0f;
  --color-border: #343536;
}

body {
  font-family: var(--font-family-base);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}
```

**Step 3: Update wxt.config.ts for Tailwind**

Modify `wxt.config.ts`:
```typescript
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
```

**Step 4: Verify Tailwind works**

Run: `pnpm dev`
Expected: No build errors

**Step 5: Commit**

```bash
git add styles/globals.css wxt.config.ts package.json pnpm-lock.yaml
git commit -m "feat: configure Tailwind v4 with custom theme"
```

---

## Task 3: Set Up Side Panel Entry Point

**Files:**
- Create: `entrypoints/sidepanel/index.html`
- Create: `entrypoints/sidepanel/main.tsx`
- Create: `entrypoints/sidepanel/App.tsx`
- Modify: `wxt.config.ts`

**Step 1: Create side panel HTML**

Create `entrypoints/sidepanel/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reddit Summarizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

**Step 2: Create main.tsx entry**

Create `entrypoints/sidepanel/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 3: Create App.tsx**

Create `entrypoints/sidepanel/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="w-[360px] h-screen bg-bg-primary text-text-primary">
      <p className="p-4">Reddit Summarizer</p>
    </div>
  );
}
```

**Step 4: Update wxt.config.ts for side panel**

Modify `wxt.config.ts`:
```typescript
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reddit Summarizer',
    permissions: ['sidePanel', 'storage', 'activeTab'],
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
```

**Step 5: Test side panel**

Run: `pnpm dev`
Expected: Side panel accessible in browser extension

**Step 6: Commit**

```bash
git add entrypoints/sidepanel/ wxt.config.ts
git commit -m "feat: add side panel entry point"
```

---

## Task 4: Install State Management Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install TanStack Query**

Run:
```bash
pnpm add @tanstack/react-query
```

**Step 2: Install Zustand**

Run:
```bash
pnpm add zustand
```

**Step 3: Install Lucide icons**

Run:
```bash
pnpm add lucide-react
```

**Step 4: Verify installation**

Run: `pnpm dev`
Expected: No errors, extension loads

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add TanStack Query, Zustand, Lucide React"
```

---

## Task 5: Create Zustand UI Store

**Files:**
- Create: `hooks/useUIStore.ts`

**Step 1: Create UI store**

Create `hooks/useUIStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tab = 'summary' | 'chat';
type Theme = 'light' | 'dark';

interface UIStore {
  activeTab: Tab;
  isSettingsOpen: boolean;
  theme: Theme;
  setActiveTab: (tab: Tab) => void;
  toggleSettings: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      activeTab: 'summary',
      isSettingsOpen: false,
      theme: 'dark',
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSettings: () => set({ isSettingsOpen: !get().isSettingsOpen }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'reddit-summarizer-ui',
    }
  )
);
```

**Step 2: Verify no TypeScript errors**

Run: `pnpm dev`
Expected: No errors

**Step 3: Commit**

```bash
git add hooks/useUIStore.ts
git commit -m "feat: add Zustand UI store with theme persistence"
```

---

## Task 6: Create Header Component

**Files:**
- Create: `components/Header.tsx`

**Step 1: Create Header component**

Create `components/Header.tsx`:
```tsx
import { Settings, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

export function Header() {
  const { theme, toggleTheme, toggleSettings } = useUIStore();

  return (
    <header className="h-[54px] flex items-center justify-between px-4 border-b border-border bg-bg-primary shrink-0">
      <div className="flex items-center gap-2 font-semibold text-base">
        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <span>Summarizer</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-[18px] h-[18px]" />
          ) : (
            <Sun className="w-[18px] h-[18px]" />
          )}
        </button>
        <button
          onClick={toggleSettings}
          className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add Header component with theme toggle"
```

---

## Task 7: Create PostInfo Component

**Files:**
- Create: `components/PostInfo.tsx`

**Step 1: Create PostInfo component**

Create `components/PostInfo.tsx`:
```tsx
interface PostInfoProps {
  subreddit: string;
  author: string;
  timestamp: string;
  title: string;
  upvotes: string;
  comments: string;
  upvoteRatio: string;
  avatarUrl?: string;
}

export function PostInfo({
  subreddit,
  author,
  timestamp,
  title,
  upvotes,
  comments,
  upvoteRatio,
}: PostInfoProps) {
  return (
    <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-accent to-[#FF8717] p-0.5 relative">
          <div className="absolute inset-0.5 bg-bg-primary rounded-full" />
          <div className="absolute inset-1 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-accent font-bold text-lg">r/</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{subreddit}</span>
          <span className="text-xs text-text-secondary">
            Posted by u/{author} • {timestamp}
          </span>
        </div>
      </div>

      <div className="text-sm leading-relaxed">{title}</div>

      <div className="flex justify-around py-3 border-t border-b border-border mt-2">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{upvotes}</span>
          <span className="text-xs text-text-secondary">upvotes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{comments}</span>
          <span className="text-xs text-text-secondary">comments</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-sm">{upvoteRatio}</span>
          <span className="text-xs text-text-secondary">upvoted</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/PostInfo.tsx
git commit -m "feat: add PostInfo component with stats display"
```

---

## Task 8: Create Tabs Component

**Files:**
- Create: `components/Tabs.tsx`

**Step 1: Create Tabs component**

Create `components/Tabs.tsx`:
```tsx
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
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/Tabs.tsx
git commit -m "feat: add Tabs component for Summary/Chat navigation"
```

---

## Task 9: Create SummaryView Component

**Files:**
- Create: `components/SummaryView.tsx`

**Step 1: Create SummaryView component**

Create `components/SummaryView.tsx`:
```tsx
import { RefreshCw, Copy } from 'lucide-react';

interface SummaryData {
  tldr: string[];
  quote: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface SummaryViewProps {
  data: SummaryData;
  onRegenerate: () => void;
  onCopy: () => void;
}

export function SummaryView({ data, onRegenerate, onCopy }: SummaryViewProps) {
  return (
    <div className="bg-bg-primary border border-border rounded-[8px] p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-sm flex items-center gap-1.5">
          <span className="w-1 h-4 bg-accent rounded-sm" />
          TL;DR
        </div>
      </div>

      <ul className="list-none p-0 m-0">
        {data.tldr.map((point, i) => (
          <li
            key={i}
            className="relative pl-4 mb-2.5 text-sm leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-text-secondary before:font-bold"
          >
            {point}
          </li>
        ))}
      </ul>

      {data.quote && (
        <div className="bg-bg-secondary border-l-[3px] border-accent p-3 italic text-text-primary text-xs my-3 rounded-r">
          "{data.quote}"
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs text-text-secondary mb-1.5 flex justify-between">
          <span>Sentiment Analysis</span>
          <span>Positive ({data.sentiment.positive}%)</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#46D160]"
            style={{ width: `${data.sentiment.positive}%` }}
          />
          <div
            className="h-full bg-[#FFB000]"
            style={{ width: `${data.sentiment.neutral}%` }}
          />
          <div
            className="h-full bg-accent"
            style={{ width: `${data.sentiment.negative}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onRegenerate}
          className="flex-1 py-2 px-3 border border-border rounded-[8px] bg-bg-primary hover:bg-bg-secondary text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-[18px] h-[18px]" />
          Regenerate
        </button>
        <button
          onClick={onCopy}
          className="flex-1 py-2 px-3 border border-border rounded-[8px] bg-bg-primary hover:bg-bg-secondary text-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-[18px] h-[18px]" />
          Copy
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/SummaryView.tsx
git commit -m "feat: add SummaryView component with sentiment bar"
```

---

## Task 10: Create MessageBubble Component

**Files:**
- Create: `components/MessageBubble.tsx`

**Step 1: Create MessageBubble component**

Create `components/MessageBubble.tsx`:
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
          ? 'self-end bg-accent text-white rounded-[18px] rounded-br-[4px]'
          : 'self-start bg-bg-secondary text-text-primary border border-transparent rounded-[18px] rounded-bl-[4px]'
      }`}
    >
      {content}
    </div>
  );
}
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/MessageBubble.tsx
git commit -m "feat: add MessageBubble component for chat messages"
```

---

## Task 11: Create ChatView Component

**Files:**
- Create: `components/ChatView.tsx`

**Step 1: Create ChatView component**

Create `components/ChatView.tsx`:
```tsx
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
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/ChatView.tsx
git commit -m "feat: add ChatView component with message input"
```

---

## Task 12: Create SettingsModal Component

**Files:**
- Create: `components/SettingsModal.tsx`

**Step 1: Create SettingsModal component**

Create `components/SettingsModal.tsx`:
```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../hooks/useUIStore';

type ApiMode = 'free' | 'own';

export function SettingsModal() {
  const { isSettingsOpen, toggleSettings } = useUIStore();
  const [apiMode, setApiMode] = useState<ApiMode>('own');
  const [apiKey, setApiKey] = useState('');

  if (!isSettingsOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/50 z-50 flex items-end"
      onClick={(e) => e.target === e.currentTarget && toggleSettings()}
    >
      <div className="bg-bg-primary w-full rounded-t-2xl p-5 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-base">Settings</h2>
          <button
            onClick={toggleSettings}
            className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
            aria-label="Close settings"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2">
            API Configuration
          </label>
          <div
            onClick={() => setApiMode('free')}
            className={`flex items-center gap-2.5 p-3 border rounded-[8px] mb-2 cursor-pointer transition-colors ${
              apiMode === 'free'
                ? 'border-accent bg-accent-dim'
                : 'border-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 ${
                apiMode === 'free'
                  ? 'border-accent bg-accent'
                  : 'border-text-secondary'
              }`}
            />
            <span className="text-sm">Use Free Tier (Limited)</span>
          </div>
          <div
            onClick={() => setApiMode('own')}
            className={`flex items-center gap-2.5 p-3 border rounded-[8px] cursor-pointer transition-colors ${
              apiMode === 'own'
                ? 'border-accent bg-accent-dim'
                : 'border-border'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 ${
                apiMode === 'own'
                  ? 'border-accent bg-accent'
                  : 'border-text-secondary'
              }`}
            />
            <span className="text-sm">Use my own API Keys</span>
          </div>
        </div>

        {apiMode === 'own' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full p-2.5 border border-border rounded-[8px] text-sm bg-bg-secondary"
            />
          </div>
        )}

        <button
          onClick={toggleSettings}
          className="w-full bg-accent text-white py-3 rounded-[8px] font-semibold text-sm mt-2 hover:opacity-90 transition-opacity"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Add slide-up animation to globals.css**

Add to `styles/globals.css` at the end:
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease;
}
```

**Step 3: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 4: Commit**

```bash
git add components/SettingsModal.tsx styles/globals.css
git commit -m "feat: add SettingsModal component with API config"
```

---

## Task 13: Create LoadingState Component

**Files:**
- Create: `components/LoadingState.tsx`

**Step 1: Create LoadingState component**

Create `components/LoadingState.tsx`:
```tsx
export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="bg-bg-primary border border-border rounded-[8px] p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1 h-4 bg-border rounded-sm animate-pulse" />
          <div className="h-4 w-16 bg-border rounded animate-pulse" />
        </div>
        <div className="space-y-2.5">
          <div className="h-4 bg-border rounded animate-pulse" />
          <div className="h-4 bg-border rounded animate-pulse w-[90%]" />
          <div className="h-4 bg-border rounded animate-pulse w-[80%]" />
        </div>
        <div className="h-16 bg-border rounded mt-3 animate-pulse" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-9 bg-border rounded-[8px] animate-pulse" />
          <div className="flex-1 h-9 bg-border rounded-[8px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add components/LoadingState.tsx
git commit -m "feat: add LoadingState skeleton component"
```

---

## Task 14: Create Mock API and Types

**Files:**
- Create: `lib/types.ts`
- Create: `lib/api.ts`

**Step 1: Create types**

Create `lib/types.ts`:
```typescript
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
  depth: number;
}

export interface SummaryResponse {
  tldr: string[];
  quote: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

**Step 2: Create mock API**

Create `lib/api.ts`:
```typescript
import type { ScrapedContent, SummaryResponse, ChatMessage } from './types';

// Mock delay to simulate network
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSummary(
  _content: ScrapedContent
): Promise<SummaryResponse> {
  await delay(1500);

  // Mock response
  return {
    tldr: [
      'The OP is discussing the rapid evolution of AI art styles specifically within Midjourney v6.',
      'Community sentiment is mixed between awe at the technology and concern for traditional artist displacement.',
      'Top comments highlight the "uncanny valley" effect is diminishing rapidly.',
    ],
    quote:
      'The most surprising part is how quickly we adapted to seeing things that are impossible.',
    sentiment: {
      positive: 70,
      neutral: 20,
      negative: 10,
    },
  };
}

export async function sendChatMessage(
  _content: ScrapedContent,
  _messages: ChatMessage[],
  userMessage: string
): Promise<ChatMessage> {
  await delay(1000);

  // Mock response based on user message
  const responses: Record<string, string> = {
    default:
      "Based on the post and comments, I can help answer questions about this discussion. What would you like to know?",
  };

  return {
    role: 'assistant',
    content:
      responses[userMessage.toLowerCase()] ||
      `Based on the discussion, ${userMessage.toLowerCase().includes('price') ? 'several commenters mention pricing concerns, particularly around the subscription model.' : 'the community has varied opinions on this topic. Would you like me to elaborate on any specific aspect?'}`,
  };
}
```

**Step 3: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 4: Commit**

```bash
git add lib/types.ts lib/api.ts
git commit -m "feat: add types and mock API functions"
```

---

## Task 15: Create TanStack Query Hooks

**Files:**
- Create: `queries/useSummaryQuery.ts`
- Create: `queries/useChatMutation.ts`

**Step 1: Create useSummaryQuery**

Create `queries/useSummaryQuery.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchSummary } from '../lib/api';
import type { ScrapedContent } from '../lib/types';

export function useSummaryQuery(postUrl: string, content: ScrapedContent | null) {
  return useQuery({
    queryKey: ['summary', postUrl],
    queryFn: () => fetchSummary(content!),
    enabled: !!content,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

**Step 2: Create useChatMutation**

Create `queries/useChatMutation.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendChatMessage } from '../lib/api';
import type { ScrapedContent, ChatMessage } from '../lib/types';

export function useChatMutation(postUrl: string, content: ScrapedContent | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messages,
      userMessage,
    }: {
      messages: ChatMessage[];
      userMessage: string;
    }) => {
      if (!content) throw new Error('No content available');
      return sendChatMessage(content, messages, userMessage);
    },
    onMutate: async ({ messages, userMessage }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', postUrl] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        'chat',
        postUrl,
      ]);

      // Optimistically add user message
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], (old = []) => [
        ...old,
        { role: 'user', content: userMessage },
      ]);

      return { previousMessages };
    },
    onSuccess: (newMessage) => {
      // Add assistant response
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], (old = []) => [
        ...old,
        newMessage,
      ]);
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', postUrl], context.previousMessages);
      }
    },
  });
}
```

**Step 3: Verify no errors**

Run: `pnpm dev`
Expected: No build errors

**Step 4: Commit**

```bash
git add queries/useSummaryQuery.ts queries/useChatMutation.ts
git commit -m "feat: add TanStack Query hooks for summary and chat"
```

---

## Task 16: Assemble Main App

**Files:**
- Modify: `entrypoints/sidepanel/main.tsx`
- Modify: `entrypoints/sidepanel/App.tsx`

**Step 1: Update main.tsx with providers**

Modify `entrypoints/sidepanel/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '../../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
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

**Step 2: Update App.tsx with full UI**

Modify `entrypoints/sidepanel/App.tsx`:
```tsx
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

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <PostInfo
          subreddit={content.subreddit}
          author={content.author}
          timestamp={content.timestamp}
          title={content.title}
          upvotes={formatNumber(content.upvotes)}
          comments={formatNumber(content.commentCount)}
          upvoteRatio={`${content.upvoteRatio}%`}
        />

        <Tabs />

        {activeTab === 'summary' && (
          <>
            {summaryLoading ? (
              <LoadingState />
            ) : summaryData ? (
              <SummaryView
                data={summaryData}
                onRegenerate={handleRegenerate}
                onCopy={handleCopy}
              />
            ) : null}
          </>
        )}

        {activeTab === 'chat' && (
          <ChatView messages={messages} onSendMessage={handleSendMessage} />
        )}
      </div>

      <SettingsModal />
    </div>
  );
}
```

**Step 3: Test the complete UI**

Run: `pnpm dev`
Expected: Full UI renders with Header, PostInfo, Tabs, Summary/Chat views, Settings modal

**Step 4: Commit**

```bash
git add entrypoints/sidepanel/main.tsx entrypoints/sidepanel/App.tsx
git commit -m "feat: assemble complete side panel UI"
```

---

## Task 17: Create Content Script (Basic)

**Files:**
- Create: `entrypoints/content.ts`

**Step 1: Create content script**

Create `entrypoints/content.ts`:
```typescript
export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  main() {
    console.log('Reddit Summarizer: Content script loaded');

    // Listen for messages from side panel
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_CONTENT') {
        // For now, return mock data
        // Real implementation will scrape the DOM
        sendResponse({
          success: true,
          content: {
            title: document.title,
            url: window.location.href,
          },
        });
      }
      return true;
    });
  },
});
```

**Step 2: Verify no errors**

Run: `pnpm dev`
Expected: Content script loads on Reddit pages

**Step 3: Commit**

```bash
git add entrypoints/content.ts
git commit -m "feat: add basic content script for Reddit pages"
```

---

## Task 18: Create Background Script

**Files:**
- Create: `entrypoints/background.ts`

**Step 1: Create background script**

Create `entrypoints/background.ts`:
```typescript
export default defineBackground(() => {
  console.log('Reddit Summarizer: Background script loaded');

  // Open side panel when extension icon is clicked
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Set side panel behavior
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
```

**Step 2: Update manifest permissions in wxt.config.ts**

Modify `wxt.config.ts` to ensure proper permissions:
```typescript
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reddit Summarizer',
    description: 'AI-powered summaries and chat for Reddit posts',
    permissions: ['sidePanel', 'storage', 'activeTab'],
    host_permissions: ['*://*.reddit.com/*'],
    action: {
      default_title: 'Open Reddit Summarizer',
    },
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
```

**Step 3: Verify extension works**

Run: `pnpm dev`
Expected: Clicking extension icon opens side panel

**Step 4: Commit**

```bash
git add entrypoints/background.ts wxt.config.ts
git commit -m "feat: add background script with side panel activation"
```

---

## Task 19: Final Verification and Build

**Step 1: Run development server**

Run: `pnpm dev`
Expected: Extension loads, all features work

**Step 2: Verify all features**

Checklist:
- [ ] Header displays with theme toggle and settings
- [ ] Theme toggle switches between light/dark
- [ ] PostInfo shows mock data
- [ ] Tabs switch between Summary and Chat
- [ ] Summary view shows with skeleton loading, then data
- [ ] Chat view allows sending messages
- [ ] Settings modal opens/closes
- [ ] Side panel opens when clicking extension icon

**Step 3: Build for production**

Run: `pnpm build`
Expected: Build completes without errors, output in `.output/` directory

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify complete extension build"
```

---

## Summary

This plan creates a fully functional Reddit Summarizer browser extension UI with:

- **17 files** created/modified
- **19 tasks** with bite-sized steps
- **Mock API** ready for real backend integration
- **Full state management** with TanStack Query + Zustand
- **Responsive UI** matching the HTML design mockup
