import { encrypt, decrypt, generateSalt } from './crypto';
import type { ProviderId } from './types';

export interface StoredSettings {
  activeProvider: ProviderId;
  activeModel: string;
  keys: Partial<Record<ProviderId, string>>;
  encryptionSalt: string;
}

const STORAGE_KEY = 'smartreddit-settings';

function getEncryptionPassword(): string {
  return browser.runtime.id || 'smartreddit-extension';
}

export async function getSettings(): Promise<StoredSettings | null> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const settings = result[STORAGE_KEY] as StoredSettings | undefined;
  return settings || null;
}

export async function initSettings(): Promise<StoredSettings> {
  const existing = await getSettings();
  if (existing) return existing;

  const settings: StoredSettings = {
    activeProvider: 'gemini',
    activeModel: 'gemini-2.0-flash',
    keys: {},
    encryptionSalt: generateSalt(),
  };

  await browser.storage.local.set({ [STORAGE_KEY]: settings });
  return settings;
}

export async function saveSettings(settings: Partial<StoredSettings>): Promise<void> {
  const current = await getSettings();
  if (!current) throw new Error('Settings not initialized');

  const updated = { ...current, ...settings };
  await browser.storage.local.set({ [STORAGE_KEY]: updated });
}

export async function saveApiKey(provider: ProviderId, apiKey: string): Promise<void> {
  const settings = await getSettings();
  if (!settings) throw new Error('Settings not initialized');

  const encrypted = await encrypt(apiKey, getEncryptionPassword(), settings.encryptionSalt);

  await saveSettings({
    keys: { ...settings.keys, [provider]: encrypted },
  });
}

export async function getApiKey(provider: ProviderId): Promise<string | null> {
  const settings = await getSettings();
  if (!settings) return null;

  const encrypted = settings.keys[provider];
  if (!encrypted) return null;

  try {
    return await decrypt(encrypted, getEncryptionPassword(), settings.encryptionSalt);
  } catch {
    return null;
  }
}

export async function removeApiKey(provider: ProviderId): Promise<void> {
  const settings = await getSettings();
  if (!settings) return;

  const keys = { ...settings.keys };
  delete keys[provider];

  await saveSettings({ keys });
}
