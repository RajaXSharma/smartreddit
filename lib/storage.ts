import { encrypt, decrypt, generateSalt } from './crypto';
import type { ProviderId, SummaryResponse, ChatMessage } from './types';

export interface PostCache {
  url: string;
  lastAccessed: number;
  summary?: SummaryResponse;
  chat: ChatMessage[];
}

export interface CacheStorage {
  posts: PostCache[];
}

const CACHE_KEY = 'smartreddit-cache';
const MAX_POSTS = 25;

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
    activeModel: 'gemini-2.5-flash-lite',
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

// Cache functions

function evictIfNeeded(posts: PostCache[]): PostCache[] {
  if (posts.length <= MAX_POSTS) return posts;
  return posts
    .sort((a, b) => b.lastAccessed - a.lastAccessed)
    .slice(0, MAX_POSTS);
}

export async function getCache(): Promise<CacheStorage> {
  const result = await browser.storage.local.get(CACHE_KEY);
  return (result[CACHE_KEY] as CacheStorage | undefined) || { posts: [] };
}

export async function getPostCache(url: string): Promise<PostCache | null> {
  const cache = await getCache();
  const post = cache.posts.find((p) => p.url === url);
  if (!post) return null;

  // Update lastAccessed
  post.lastAccessed = Date.now();
  await browser.storage.local.set({ [CACHE_KEY]: cache });

  return post;
}

export async function saveSummary(url: string, summary: SummaryResponse): Promise<void> {
  const cache = await getCache();
  const existingIndex = cache.posts.findIndex((p) => p.url === url);

  if (existingIndex >= 0) {
    cache.posts[existingIndex].summary = summary;
    cache.posts[existingIndex].lastAccessed = Date.now();
  } else {
    cache.posts.push({
      url,
      lastAccessed: Date.now(),
      summary,
      chat: [],
    });
  }

  cache.posts = evictIfNeeded(cache.posts);
  await browser.storage.local.set({ [CACHE_KEY]: cache });
}

export async function saveChat(url: string, messages: ChatMessage[]): Promise<void> {
  const cache = await getCache();
  const existingIndex = cache.posts.findIndex((p) => p.url === url);

  if (existingIndex >= 0) {
    cache.posts[existingIndex].chat = messages;
    cache.posts[existingIndex].lastAccessed = Date.now();
  } else {
    cache.posts.push({
      url,
      lastAccessed: Date.now(),
      chat: messages,
    });
  }

  cache.posts = evictIfNeeded(cache.posts);
  await browser.storage.local.set({ [CACHE_KEY]: cache });
}

export async function clearCache(): Promise<void> {
  await browser.storage.local.remove(CACHE_KEY);
}
