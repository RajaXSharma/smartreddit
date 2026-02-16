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
