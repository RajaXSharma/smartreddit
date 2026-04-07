import { create } from 'zustand';
import type { ProviderId } from '../lib/types';
import { getSettings, initSettings, saveSettings, saveApiKey, getApiKey } from '../lib/storage';
import { getProvider, getDefaultModel } from '../lib/providers';

type KeyStatus = 'none' | 'validating' | 'valid' | 'invalid';

interface SettingsStore {
  activeProvider: ProviderId;
  activeModel: string;
  keyStatus: Record<ProviderId, KeyStatus>;
  isInitialized: boolean;

  init: () => Promise<void>;
  setProvider: (provider: ProviderId) => Promise<void>;
  setModel: (model: string) => void;
  saveKey: (provider: ProviderId, key: string) => Promise<void>;
  testConnection: (provider: ProviderId) => Promise<boolean>;
  hasApiKey: (provider: ProviderId) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  activeProvider: 'gemini',
  activeModel: 'gemini-2.0-flash',
  keyStatus: { gemini: 'none' },
  isInitialized: false,

  async init() {
    const settings = await initSettings();
    set({
      activeProvider: settings.activeProvider,
      activeModel: settings.activeModel,
      isInitialized: true,
    });

    // Check which providers have keys
    for (const providerId of ['gemini'] as ProviderId[]) {
      const hasKey = await getApiKey(providerId);
      if (hasKey) {
        set((state) => ({
          keyStatus: { ...state.keyStatus, [providerId]: 'valid' },
        }));
      }
    }
  },

  async setProvider(provider: ProviderId) {
    const model = getDefaultModel(provider);
    set({ activeProvider: provider, activeModel: model });
    await saveSettings({ activeProvider: provider, activeModel: model });
  },

  setModel(model: string) {
    set({ activeModel: model });
    saveSettings({ activeModel: model });
  },

  async saveKey(provider: ProviderId, key: string) {
    await saveApiKey(provider, key);
    set((state) => ({
      keyStatus: { ...state.keyStatus, [provider]: 'valid' },
    }));
  },

  async testConnection(provider: ProviderId) {
    set((state) => ({
      keyStatus: { ...state.keyStatus, [provider]: 'validating' },
    }));

    const apiKey = await getApiKey(provider);
    if (!apiKey) {
      set((state) => ({
        keyStatus: { ...state.keyStatus, [provider]: 'none' },
      }));
      return false;
    }

    const providerInstance = getProvider(provider);
    const isValid = await providerInstance.validateKey(apiKey);

    set((state) => ({
      keyStatus: { ...state.keyStatus, [provider]: isValid ? 'valid' : 'invalid' },
    }));

    return isValid;
  },

  async hasApiKey(provider: ProviderId) {
    const key = await getApiKey(provider);
    return !!key;
  },
}));
