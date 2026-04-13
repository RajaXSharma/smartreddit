import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../hooks/useUIStore';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { providerList } from '../lib/providers';
import { clearCache } from '../lib/storage';
import type { ProviderId } from '../lib/types';

export function SettingsModal() {
  const { isSettingsOpen, toggleSettings } = useUIStore();
  const {
    activeProvider,
    activeModel,
    keyStatus,
    isInitialized,
    init,
    setProvider,
    setModel,
    saveKey,
    testConnection,
  } = useSettingsStore();

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all saved chats and summaries?')) return;

    setIsClearing(true);
    setClearSuccess(false);
    try {
      await clearCache();
      queryClient.clear();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 2000);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    if (isSettingsOpen && !isInitialized) {
      init();
    }
  }, [isSettingsOpen, isInitialized, init]);

  useEffect(() => {
    setApiKey('');
    setShowKey(false);
  }, [activeProvider]);

  if (!isSettingsOpen) return null;

  const currentProvider = providerList.find((p) => p.id === activeProvider)!;
  const currentKeyStatus = keyStatus[activeProvider];

  const handleProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await setProvider(e.target.value as ProviderId);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsSaving(true);
    try {
      await saveKey(activeProvider, apiKey.trim());
      await testConnection(activeProvider);
      setApiKey('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    await testConnection(activeProvider);
  };

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
          <label className="block text-xs font-semibold mb-2">AI Provider</label>
          <select
            value={activeProvider}
            onChange={handleProviderChange}
            className="w-full p-2.5 border border-border rounded-[8px] text-sm bg-bg-secondary"
          >
            {providerList.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2">Model</label>
          <select
            value={activeModel}
            onChange={handleModelChange}
            className="w-full p-2.5 border border-border rounded-[8px] text-sm bg-bg-secondary"
          >
            {currentProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2">
            API Key
            {currentKeyStatus === 'valid' && (
              <span className="ml-2 text-green-500 font-normal">(Saved)</span>
            )}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentKeyStatus === 'valid' ? 'Enter new key to update' : 'Enter your API key'}
              className="w-full p-2.5 pr-10 border border-border rounded-[8px] text-sm bg-bg-secondary"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleTestConnection}
            disabled={currentKeyStatus === 'none' && !apiKey.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-[8px] text-sm font-medium hover:bg-bg-secondary transition-colors disabled:opacity-50"
          >
            {currentKeyStatus === 'validating' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentKeyStatus === 'valid' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : null}
            Test Connection
          </button>
        </div>

        {currentKeyStatus === 'invalid' && (
          <p className="text-xs text-red-500 mb-4">
            Invalid API key. Please check and try again.
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!apiKey.trim() || isSaving}
          className="w-full bg-accent text-white py-3 rounded-[8px] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>

        <div className="border-t border-border mt-4 pt-4">
          <label className="block text-xs font-semibold mb-2">History</label>
          <p className="text-xs text-text-secondary mb-3">
            Removes all saved chats and summaries
          </p>
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="w-full py-2.5 border border-red-500 text-red-500 rounded-[8px] text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {isClearing ? 'Clearing...' : clearSuccess ? 'Cleared!' : 'Clear All History'}
          </button>
        </div>
      </div>
    </div>
  );
}
