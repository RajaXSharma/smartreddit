# Extension UI Design

## Overview

Browser extension UI for Reddit Summarizer using WXT + React + Tailwind v4 + shadcn/ui. This design covers the extension only (no backend).

## Scope

- Extension UI with side panel
- Mock API calls (ready for real integration later)
- Full state management setup (TanStack Query + Zustand)

## Project Structure

```
smartreddit/
├── entrypoints/
│   ├── sidepanel/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── content.ts
│   └── background.ts
├── components/
│   ├── ui/                  # shadcn/ui
│   ├── Header.tsx
│   ├── Tabs.tsx
│   ├── PostInfo.tsx
│   ├── SummaryView.tsx
│   ├── ChatView.tsx
│   ├── MessageBubble.tsx
│   ├── SettingsModal.tsx
│   └── LoadingState.tsx
├── lib/
│   ├── scraper.ts
│   ├── storage.ts
│   └── api.ts
├── hooks/
│   ├── useRedditContent.ts
│   └── useUIStore.ts
├── queries/
│   ├── useSummaryQuery.ts
│   └── useChatMutation.ts
├── styles/
│   └── globals.css
├── wxt.config.ts
├── tailwind.config.ts
└── package.json
```

## Dependencies

**Core:**
- wxt
- react, react-dom
- typescript

**Styling:**
- tailwindcss v4
- @tailwindcss/vite
- shadcn/ui components (button, tabs, card, input, dialog)
- lucide-react

**State:**
- @tanstack/react-query
- @tanstack/query-sync-storage-persister
- zustand

**Dev:**
- @types/chrome

## Components

### Header.tsx
- Brand logo + "Summarizer" text
- Theme toggle (sun/moon)
- Settings gear button

### PostInfo.tsx
- Subreddit avatar with gradient ring
- Subreddit name, author, timestamp
- Post title
- Stats row (upvotes, comments, upvote %)

### Tabs.tsx
- Summary / Chat tabs
- Active: orange background
- Inactive: border only

### SummaryView.tsx
- TL;DR card with bullet points
- Quote block
- Sentiment bar (positive/neutral/negative)
- Regenerate + Copy buttons

### ChatView.tsx
- Scrollable message list
- Chat input at bottom

### MessageBubble.tsx
- AI: left-aligned, gray background
- User: right-aligned, orange background

### SettingsModal.tsx
- Bottom sheet modal
- API config radio options
- API key input
- Save button

### LoadingState.tsx
- Skeleton loaders

## State Management

### Zustand (UI State)
```typescript
interface UIStore {
  activeTab: 'summary' | 'chat'
  isSettingsOpen: boolean
  theme: 'light' | 'dark'
  setActiveTab: (tab) => void
  toggleSettings: () => void
  toggleTheme: () => void
}
```

### TanStack Query (Server State)
- `useSummaryQuery(postUrl, content)` - Fetches/caches summaries
- `useChatMutation(postUrl)` - Sends chat messages

### useRedditContent Hook
- Receives scraped data from content script

## Styling

### Tailwind v4 Theme (globals.css)
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
  --radius: 8px;
}

.dark {
  --color-bg-primary: #1a1a1b;
  --color-bg-secondary: #272729;
  --color-text-primary: #d7dadc;
  --color-text-secondary: #818384;
  --color-accent-dim: #3a1f0f;
  --color-border: #343536;
}
```

### Key Visual Elements
- Panel width: 360px, full height
- Gradient avatar ring (#FF4500 to #FF8717)
- Orange accent for active states
- Rounded message bubbles (18px)
- Bottom sheet modal with slide-up animation

## Data Flow

```
Content Script (scrapes Reddit)
    → Background Worker (routes messages)
    → Side Panel (useRedditContent)
    → TanStack Query (fetch/cache)
    → UI Components (render)
```
