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
