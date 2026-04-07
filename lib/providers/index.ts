import type { AIProvider } from './types';
import type { ProviderId } from '../types';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import { grokProvider } from './grok';

export type { AIProvider, Model, ProviderConfig } from './types';

export const providers: Record<ProviderId, AIProvider> = {
  openai: openaiProvider,
  gemini: geminiProvider,
  grok: grokProvider,
};

export const providerList: AIProvider[] = [openaiProvider, geminiProvider, grokProvider];

export function getProvider(id: ProviderId): AIProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return provider;
}

export function getDefaultModel(providerId: ProviderId): string {
  const provider = getProvider(providerId);
  return provider.models[0].id;
}
