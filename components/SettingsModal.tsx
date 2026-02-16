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
